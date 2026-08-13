import type {
  WakeWordDetectedPayload,
  WakeWordEngine,
  WakeWordEngineOptions,
  WakeWordStatus
} from './types'
import { sharedAudioBus, type AudioChunkListener } from '../audioBus'

declare global {
  interface Window {
    SherpaOnnxWasmFactory?: (moduleArg?: Record<string, any>) => Promise<any> | any
    SherpaOnnxKwsFactory?: {
      createKws: (module: Record<string, any>, config: Record<string, any>) => any
    }
    SherpaOnnxWakeWordModule?: {
      createKws: (config: Record<string, any>) => Promise<{
        createStream: () => {
          acceptWaveform: (sampleRate: number, samples: Float32Array) => void
          inputFinished: () => void
          free: () => void
        }
        isReady: (stream: any) => boolean
        decode: (stream: any) => void
        reset: (stream: any) => void
        getResult: (stream: any) => { keyword?: string }
        free: () => void
      }>
    }
  }
}

const SHERPA_SCRIPT_URL = '/vendor/sherpa/sherpa-onnx-browser-kws.js'
const SHERPA_WASM_FACTORY_URL = '/vendor/sherpa/sherpa-onnx-wasm-nodejs.js'
const SHERPA_KWS_FACTORY_URL = '/vendor/sherpa/sherpa-onnx-kws.js'
const SHERPA_RUNTIME_VERSION = '20260812-6'
const AUDIO_SAMPLE_RATE = 16000
const DETECT_COOLDOWN_MS = 1500
const INITIALIZATION_TIMEOUT_MS = 30_000

let sherpaScriptLoadingPromise: Promise<void> | null = null

const appendScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${src}?v=${SHERPA_RUNTIME_VERSION}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`加载脚本失败：${src}`))
    document.head.appendChild(script)
  })

const loadSherpaScript = () => {
  if (window.SherpaOnnxWakeWordModule) {
    return Promise.resolve()
  }

  if (sherpaScriptLoadingPromise) {
    return sherpaScriptLoadingPromise
  }

  sherpaScriptLoadingPromise = new Promise<void>((resolve, reject) => {
    Promise.all([
      appendScript(SHERPA_WASM_FACTORY_URL),
      appendScript(SHERPA_KWS_FACTORY_URL)
    ])
      .then(() => appendScript(SHERPA_SCRIPT_URL))
      .then(() => resolve())
      .catch(reject)
  })

  return sherpaScriptLoadingPromise
}

const createKeywordLines = (keywords: string[]) => {
  return keywords
    .map((keyword) => {
      const normalized = keyword.trim()
      if (!normalized) return ''
      if (normalized.includes('@')) return normalized
      return `${normalized} @${normalized}`
    })
    .filter(Boolean)
    .join('\n')
}

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  return '本地唤醒初始化失败'
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, message: string) => {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        window.clearTimeout(timer)
        reject(error)
      }
    )
  })
}

export { createKeywordLines, normalizeErrorMessage }

export class SherpaOnnxWakeWordEngine implements WakeWordEngine {
  private options: WakeWordEngineOptions
  private kws: any = null
  private stream: any = null
  private lastDetectedAt = 0
  private stopped = true
  private audioListener: AudioChunkListener | null = null

  constructor(options: WakeWordEngineOptions) {
    this.options = options
  }

  async start() {
    if (!this.stopped) return

    this.stopped = false
    this.updateStatus('initializing', '正在启动本地唤醒')

    try {
      await loadSherpaScript()
      const sherpa = window.SherpaOnnxWakeWordModule

      if (!sherpa?.createKws) {
        throw new Error('未找到 sherpa-onnx 浏览器唤醒模块')
      }

      this.kws = await withTimeout(sherpa.createKws({
        featConfig: {
          sampleRate: AUDIO_SAMPLE_RATE,
          featureDim: 80
        },
        modelConfig: {
          transducer: {
            encoder: '/models/sherpa-kws/encoder-epoch-12-avg-2-chunk-16-left-64.onnx',
            decoder: '/models/sherpa-kws/decoder-epoch-12-avg-2-chunk-16-left-64.onnx',
            joiner: '/models/sherpa-kws/joiner-epoch-12-avg-2-chunk-16-left-64.onnx'
          },
          tokens: '/models/sherpa-kws/tokens.txt',
          provider: 'cpu',
          numThreads: 1,
          debug: 0,
          modelingUnit: 'cjkchar',
          bpeVocab: ''
        },
        maxActivePaths: 4,
        numTrailingBlanks: 1,
        keywordsScore: 1.0,
        keywordsThreshold: 0.35,
        keywords: createKeywordLines(this.options.keywords)
      }), INITIALIZATION_TIMEOUT_MS, '本地唤醒模型加载超时，请重新启动应用后重试')

      this.stream = this.kws.createStream()

      await sharedAudioBus.acquire()

      this.audioListener = (monoChunk) => {
        if (this.stopped || !this.stream || !this.kws) return
        this.stream.acceptWaveform(AUDIO_SAMPLE_RATE, monoChunk)

        while (this.kws.isReady(this.stream)) {
          this.kws.decode(this.stream)
        }

        const result = this.kws.getResult(this.stream)
        const keyword = String(result?.keyword || '').trim()

        if (!keyword) return

        const now = Date.now()
        if (now - this.lastDetectedAt < DETECT_COOLDOWN_MS) {
          this.kws.reset(this.stream)
          return
        }

        this.lastDetectedAt = now
        this.kws.reset(this.stream)
        this.updateStatus('detected', `检测到唤醒词：${keyword}`)
        this.options.onDetected?.({
          keyword,
          timestamp: now
        } satisfies WakeWordDetectedPayload)
      }
      sharedAudioBus.addListener(this.audioListener)
      this.updateStatus('listening', '正在本地监听唤醒词')
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  stop() {
    if (this.stopped) return

    this.stopped = true
    if (this.audioListener) {
      sharedAudioBus.removeListener(this.audioListener)
      this.audioListener = null
    }

    if (this.stream) {
      this.stream.inputFinished?.()
      this.stream.free?.()
      this.stream = null
    }

    this.updateStatus('stopped')
  }

  destroy() {
    this.stop()
    this.kws?.free?.()
    this.kws = null
  }

  private updateStatus(status: WakeWordStatus, message?: string) {
    this.options.onStatusChange?.(status, message)
  }

  private handleError(error: unknown) {
    console.error('Sherpa-ONNX 本地唤醒启动失败', error)
    const message = normalizeErrorMessage(error)
    this.updateStatus('error', message)
    this.options.onError?.(message)
    this.destroy()
  }
}
