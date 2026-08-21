type BrowserSpeechStatus = 'connecting' | 'recording' | 'stopping' | 'stopped' | 'error'

interface BrowserSpeechRecognizerOptions {
  onText?: (text: string) => void
  onStatusChange?: (status: BrowserSpeechStatus, message?: string) => void
  onError?: (message: string) => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognition
type BrowserSpeechErrorCode =
  | 'aborted'
  | 'audio-capture'
  | 'bad-grammar'
  | 'language-not-supported'
  | 'network'
  | 'no-speech'
  | 'not-allowed'
  | 'phrases-not-supported'
  | 'service-not-allowed'

declare global {
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: BrowserSpeechErrorCode | string
    message: string
  }

  interface SpeechRecognition {
    lang: string
    continuous: boolean
    interimResults: boolean
    maxAlternatives: number
    onstart: (() => void) | null
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
  }

  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor
    SpeechRecognition?: SpeechRecognitionConstructor
  }
}

/** 统一获取标准或 WebKit 前缀的语音识别构造器，服务端渲染环境直接判定不支持。 */
const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const mapErrorMessage = (error?: BrowserSpeechErrorCode | string) => {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return '请先允许浏览器访问麦克风'
    case 'audio-capture':
      return '未检测到可用麦克风设备'
    case 'network':
      return '浏览器语音识别网络异常，请稍后再试'
    case 'no-speech':
      return '没有识别到语音，请再试一次'
    default:
      return '浏览器语音识别失败'
  }
}

/** 只有“未检测到语音”和主动中止可自动恢复，授权、设备和网络错误必须交给用户处理。 */
const shouldAutoRecover = (error?: BrowserSpeechErrorCode | string) => {
  return error === 'no-speech' || error === 'aborted'
}

/**
 * 在启动识别前显式请求一次麦克风授权，再立即关闭临时轨道。
 * 浏览器 SpeechRecognition 的权限错误不统一，此步骤可将权限与设备问题提前转为明确提示。
 */
const ensureMicrophoneAccess = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器不支持麦克风采集')
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  })

  stream.getTracks().forEach((track) => track.stop())
}

export class BrowserSpeechRecognizer {
  private options: BrowserSpeechRecognizerOptions
  private recognition: SpeechRecognition | null = null
  private stopped = false
  private restartTimer: number | null = null
  private shouldRestart = true
  private stopPromise: Promise<void> | null = null
  private resolveStop: (() => void) | null = null

  constructor(options: BrowserSpeechRecognizerOptions = {}) {
    this.options = options
  }

  static isSupported() {
    return Boolean(getSpeechRecognitionConstructor())
  }

  /**
   * 启动连续中文听写。
   * recognition 意外结束时会短暂延迟重建实例；stop() 会关闭 shouldRestart，因此用户主动停止
   * 不会被 onend 的自动恢复逻辑重新唤起。
   */
  async start() {
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      throw new Error('当前浏览器不支持语音识别')
    }

    this.stopped = false
    this.shouldRestart = true
    this.stopPromise = null
    this.resolveStop = null
    this.updateStatus('connecting', '正在启动浏览器语音识别')

    await ensureMicrophoneAccess()

    const recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      this.updateStatus('recording', '正在听写')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript || ''
      }
      this.options.onText?.(transcript.trim())
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.recognition = null
      if (shouldAutoRecover(event.error)) {
        this.updateStatus('connecting', '未识别到语音，继续等待中')
        return
      }

      this.shouldRestart = false
      const message = mapErrorMessage(event.error)
      this.updateStatus('error', message)
      this.options.onError?.(message)
    }

    recognition.onend = () => {
      this.recognition = null
      if (this.stopped || !this.shouldRestart) {
        this.updateStatus('stopped')
        this.resolveStop?.()
        this.resolveStop = null
        this.stopPromise = null
        return
      }

      this.updateStatus('connecting', '正在恢复浏览器语音识别')
      this.restartTimer = window.setTimeout(() => {
        void this.start().catch((error) => {
          const message = error instanceof Error ? error.message : '浏览器语音识别失败'
          this.updateStatus('error', message)
          this.options.onError?.(message)
        })
      }, 150)
    }

    this.recognition = recognition
    recognition.start()
  }

  /** 清除待重启定时器并停止当前识别实例，最终 stopped 状态由浏览器 onend 回调确认。 */
  async stop() {
    this.stopped = true
    this.shouldRestart = false
    if (this.restartTimer) {
      window.clearTimeout(this.restartTimer)
      this.restartTimer = null
    }
    this.updateStatus('stopping', '正在结束听写')
    const recognition = this.recognition
    if (!recognition) {
      this.updateStatus('stopped')
      return
    }

    this.stopPromise ||= new Promise<void>((resolve) => {
      this.resolveStop = resolve
    })
    try {
      recognition.stop()
    } catch {
      this.resolveStop?.()
      this.resolveStop = null
      this.stopPromise = null
      this.updateStatus('stopped')
    }
    await this.stopPromise
  }

  private updateStatus(status: BrowserSpeechStatus, message?: string) {
    this.options.onStatusChange?.(status, message)
  }
}

export { mapErrorMessage, shouldAutoRecover }
