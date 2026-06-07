import { BrowserSpeechRecognizer } from '../browserSpeechRecognition'
import type {
  WakeWordDetectedPayload,
  WakeWordEngine,
  WakeWordEngineOptions,
  WakeWordStatus
} from './types'

const DEFAULT_WAKE_WORDS = ['你好小壹', '你好小一', '你好小艺', '小壹小壹', '小一小一', '小艺小艺']
const WAKE_WORD_COOLDOWN_MS = 1500

const normalizeSpeechText = (text: string) => text.replace(/\s+/g, '').trim()

const includesWakeWord = (text: string, keywords: string[]) => {
  const normalized = normalizeSpeechText(text)
  return keywords.some((keyword) => normalized.includes(normalizeSpeechText(keyword)))
}

export class BrowserWakeWordEngine implements WakeWordEngine {
  private options: WakeWordEngineOptions
  private recognizer: BrowserSpeechRecognizer | null = null
  private lastDetectedAt = 0
  private stopped = true

  constructor(options: WakeWordEngineOptions) {
    this.options = {
      ...options,
      keywords: options.keywords?.length ? options.keywords : DEFAULT_WAKE_WORDS
    }
  }

  static isSupported() {
    return BrowserSpeechRecognizer.isSupported()
  }

  async start() {
    if (!BrowserWakeWordEngine.isSupported()) {
      throw new Error('当前浏览器不支持本地语音唤起')
    }

    if (this.recognizer) return

    this.stopped = false
    this.updateStatus('initializing', '正在启动浏览器本地唤起')

    this.recognizer = new BrowserSpeechRecognizer({
      onText: (text) => {
        this.options.onTranscript?.(text)
        if (!includesWakeWord(text, this.options.keywords)) return

        const now = Date.now()
        if (now - this.lastDetectedAt < WAKE_WORD_COOLDOWN_MS) return

        this.lastDetectedAt = now
        const keyword =
          this.options.keywords.find((item) =>
            normalizeSpeechText(text).includes(normalizeSpeechText(item))
          ) || this.options.keywords[0]

        this.updateStatus('detected', `检测到唤起词：${keyword}`)
        this.options.onDetected?.({
          keyword,
          timestamp: now
        } satisfies WakeWordDetectedPayload)
      },
      onStatusChange: (status, message) => {
        if (status === 'connecting') {
          this.updateStatus('initializing', message)
          return
        }
        if (status === 'recording') {
          this.updateStatus('listening', '正在等待唤起词，请说“你好小壹”')
          return
        }
        if (status === 'stopping') {
          return
        }
        if (status === 'stopped') {
          this.recognizer = null
          this.updateStatus(this.stopped ? 'stopped' : 'error', this.stopped ? '' : '浏览器唤起已结束')
          return
        }
        if (status === 'error') {
          this.recognizer = null
          this.updateStatus('error', message)
          this.options.onError?.(message || '浏览器本地唤起失败')
        }
      },
      onError: (message) => {
        this.options.onError?.(message)
      }
    })

    await this.recognizer.start()
  }

  stop() {
    this.stopped = true
    this.recognizer?.stop()
    this.recognizer = null
    this.updateStatus('stopped')
  }

  destroy() {
    this.stop()
  }

  private updateStatus(status: WakeWordStatus, message?: string) {
    this.options.onStatusChange?.(status, message)
  }
}

export { includesWakeWord, DEFAULT_WAKE_WORDS, WAKE_WORD_COOLDOWN_MS }
