type BrowserSpeechStatus = 'connecting' | 'recording' | 'stopping' | 'stopped' | 'error'

interface BrowserSpeechRecognizerOptions {
  onText?: (text: string) => void
  onStatusChange?: (status: BrowserSpeechStatus, message?: string) => void
  onError?: (message: string) => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognition

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor
    SpeechRecognition?: SpeechRecognitionConstructor
  }
}

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

const mapErrorMessage = (error?: string) => {
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

export class BrowserSpeechRecognizer {
  private options: BrowserSpeechRecognizerOptions
  private recognition: SpeechRecognition | null = null
  private stopped = false

  constructor(options: BrowserSpeechRecognizerOptions = {}) {
    this.options = options
  }

  static isSupported() {
    return Boolean(getSpeechRecognitionConstructor())
  }

  async start() {
    const Recognition = getSpeechRecognitionConstructor()
    if (!Recognition) {
      throw new Error('当前浏览器不支持语音识别')
    }

    this.stopped = false
    this.updateStatus('connecting', '正在启动浏览器语音识别')

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
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0]?.transcript || ''
      }
      this.options.onText?.(transcript.trim())
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const message = mapErrorMessage(event.error)
      this.updateStatus('error', message)
      this.options.onError?.(message)
      this.recognition = null
    }

    recognition.onend = () => {
      this.recognition = null
      this.updateStatus(this.stopped ? 'stopped' : 'error', this.stopped ? '' : '语音识别已结束')
    }

    this.recognition = recognition
    recognition.start()
  }

  stop() {
    this.stopped = true
    this.updateStatus('stopping', '正在结束听写')
    this.recognition?.stop()
  }

  private updateStatus(status: BrowserSpeechStatus, message?: string) {
    this.options.onStatusChange?.(status, message)
  }
}
