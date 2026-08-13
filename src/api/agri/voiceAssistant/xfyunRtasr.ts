import CryptoJS from 'crypto-js'
import { sharedAudioBus, type AudioChunkListener } from './audioBus'

const RTASR_HOST = 'rtasr.xfyun.cn'
const RTASR_PATH = '/v1/ws'
const RTASR_SAMPLE_RATE = 16000
const SEND_INTERVAL = 40
// 16 kHz、单声道、16-bit PCM 的 40 ms 音频正好是 1280 字节。
const CHUNK_SIZE = 1280

type RtasrStatus = 'connecting' | 'recording' | 'stopping' | 'stopped' | 'error'

interface RtasrRecognizerOptions {
  onText?: (text: string) => void
  onStatusChange?: (status: RtasrStatus, message?: string) => void
  onError?: (message: string) => void
}

interface RtasrResponse {
  action?: string
  code?: string
  data?: string
  desc?: string
  sid?: string
}

interface RtasrWord {
  cw?: Array<{ w?: string }>
}

interface RtasrResult {
  cn?: {
    st?: {
      rt?: Array<{ ws?: RtasrWord[] }>
    }
  }
}

const getEnvValue = (key: keyof ImportMetaEnv) => String(import.meta.env[key] || '').trim()

const normalizeXfyunErrorMessage = (message: string) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('no appid info') || lowerMessage.includes('illegal access')) {
    return '科大讯飞鉴权失败，请检查实时转写的 APPID、API_KEY 是否正确，且该应用已开通实时语音转写服务'
  }

  if (lowerMessage.includes('no license') || lowerMessage.includes('10110')) {
    return '科大讯飞实时语音转写服务未开通，请到讯飞控制台为该 APPID 开通实时转写权限'
  }

  if (lowerMessage.includes('illegal client_ip')) {
    return '科大讯飞白名单校验失败，请检查控制台 IP 白名单配置'
  }

  if (
    lowerMessage.includes('permission denied') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('403')
  ) {
    return '科大讯飞实时转写权限被拒绝，请检查服务是否开通、APPID/API_KEY 是否正确及 IP 白名单配置'
  }

  return message
}

const createFrontendSignedUrl = () => {
  // 未配置后端签名地址时会在前端签名；生产环境应配置后端地址，避免 API_KEY 下发。
  const appId = getEnvValue('VITE_XFYUN_RTASR_APP_ID')
  const apiKey = getEnvValue('VITE_XFYUN_RTASR_API_KEY')

  if (!appId || !apiKey) {
    throw new Error('请先配置 VITE_XFYUN_RTASR_APP_ID 和 VITE_XFYUN_RTASR_API_KEY')
  }

  const ts = Math.floor(Date.now() / 1000).toString()
  const baseString = CryptoJS.MD5(appId + ts).toString()
  const signa = CryptoJS.HmacSHA1(baseString, apiKey).toString(CryptoJS.enc.Base64)
  const params = new URLSearchParams({
    appid: appId,
    ts,
    signa,
    lang: 'cn'
  })

  return `wss://${RTASR_HOST}${RTASR_PATH}?${params.toString()}`
}

const createSignedUrl = async () => {
  const backendSignUrl = getEnvValue('VITE_XFYUN_RTASR_SIGN_URL')

  if (!backendSignUrl) {
    return createFrontendSignedUrl()
  }

  console.info('[讯飞实时转写] 使用后端签名地址')

  const response = await fetch(backendSignUrl, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    throw new Error('获取讯飞实时转写签名失败')
  }

  const result = await response.json()
  return result.url || result.data?.url || result.data
}

const concatUint8Array = (first: Uint8Array, second: Uint8Array) => {
  const result = new Uint8Array(first.length + second.length)
  result.set(first)
  result.set(second, first.length)
  return result
}

const downSampleBuffer = (buffer: Float32Array, inputSampleRate: number) => {
  if (inputSampleRate === RTASR_SAMPLE_RATE) return buffer

  // 浏览器输入常为 44.1/48 kHz；按区间平均降采样到讯飞要求的 16 kHz，减少混叠。
  const ratio = inputSampleRate / RTASR_SAMPLE_RATE
  const newLength = Math.round(buffer.length / ratio)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const start = Math.floor(i * ratio)
    const end = Math.min(Math.floor((i + 1) * ratio), buffer.length)
    let sum = 0
    for (let j = start; j < end; j++) {
      sum += buffer[j]
    }
    result[i] = sum / Math.max(end - start, 1)
  }

  return result
}

const floatTo16BitPcm = (input: Float32Array) => {
  const output = new Int16Array(input.length)

  for (let i = 0; i < input.length; i++) {
    // Web Audio 使用 [-1, 1] 浮点采样，传输协议要求小端有符号 16-bit PCM。
    const sample = Math.max(-1, Math.min(1, input[i]))
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
  }

  return new Uint8Array(output.buffer)
}

const parseText = (message: MessageEvent) => {
  const response: RtasrResponse = JSON.parse(message.data)

  if (response.code && response.code !== '0') {
    throw new Error(response.desc || `讯飞实时转写错误：${response.code}`)
  }

  if (!response.data) return ''

  const result: RtasrResult = JSON.parse(response.data)
  const words = result.cn?.st?.rt?.flatMap((item) => item.ws || []) || []

  return words
    .map((item) => item.cw?.[0]?.w || '')
    .join('')
    .trim()
}

export { normalizeXfyunErrorMessage }

export class XfyunRtasrRecognizer {
  private options: RtasrRecognizerOptions
  private socket: WebSocket | null = null
  private pendingAudio = new Uint8Array()
  private sendTimer: number | null = null
  private finalText = ''
  private lastPartialText = ''
  private stopped = false
  private audioListener: AudioChunkListener | null = null

  constructor(options: RtasrRecognizerOptions = {}) {
    this.options = options
  }

  async start() {
    if (this.socket) return

    this.stopped = false
    this.finalText = ''
    this.lastPartialText = ''
    this.updateStatus('connecting', '正在连接语音识别服务')

    const url = await createSignedUrl()
    if (this.stopped) return

    this.socket = new WebSocket(url)
    this.socket.binaryType = 'arraybuffer'

    this.socket.onopen = async () => {
      if (this.stopped) {
        this.socket?.close()
        return
      }

      try {
        await this.startAudio()
        if (this.stopped) return
        this.startSender()
        this.updateStatus('recording', '正在听写')
      } catch (error) {
        this.handleError(error)
      }
    }

    this.socket.onmessage = (event) => {
      try {
        const text = parseText(event)
        if (!text) return

        // 讯飞会重复返回不断增长的中间结果，只追加新增后缀以免转写文本重复。
        if (this.lastPartialText && text.startsWith(this.lastPartialText)) {
          this.finalText += text.slice(this.lastPartialText.length)
        } else if (!this.finalText.includes(text)) {
          this.finalText += text
        }

        this.lastPartialText = text
        this.options.onText?.(this.finalText)
      } catch (error) {
        this.handleError(error)
      }
    }

    this.socket.onerror = () => {
      this.handleError(new Error('讯飞实时转写连接异常'))
    }

    this.socket.onclose = () => {
      if (!this.stopped) {
        this.stopAudio()
        this.clearSender()
        this.socket = null
      }
      this.updateStatus(this.stopped ? 'stopped' : 'error')
    }
  }

  stop() {
    if (this.stopped && !this.socket) return

    this.stopped = true
    this.updateStatus('stopping', '正在结束听写')
    this.stopAudio()
    this.flushAudio()
    this.clearSender()

    const socket = this.socket
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ end: true }))
    }

    window.setTimeout(() => {
      socket?.close()
      if (this.socket === socket) this.socket = null
      this.updateStatus('stopped')
    }, 300)
  }

  private async startAudio() {
    await sharedAudioBus.acquire()
    if (this.stopped) {
      if (!sharedAudioBus.listenerCount()) sharedAudioBus.release()
      return
    }

    this.audioListener = (chunk) => {
      const pcm = floatTo16BitPcm(chunk)
      this.pendingAudio = concatUint8Array(this.pendingAudio, pcm)
    }
    sharedAudioBus.addListener(this.audioListener)
  }

  private stopAudio() {
    if (this.audioListener) {
      sharedAudioBus.removeListener(this.audioListener)
      this.audioListener = null
    }
  }

  private startSender() {
    // 固定节奏发送音频，避免直接在高频 AudioWorklet 回调中写 WebSocket 造成突发流量。
    this.sendTimer = window.setInterval(() => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return
      if (this.pendingAudio.length < CHUNK_SIZE) return

      const chunk = this.pendingAudio.slice(0, CHUNK_SIZE)
      this.pendingAudio = this.pendingAudio.slice(CHUNK_SIZE)
      this.socket.send(chunk)
    }, SEND_INTERVAL)
  }

  private flushAudio() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.pendingAudio.length) return

    this.socket.send(this.pendingAudio)
    this.pendingAudio = new Uint8Array()
  }

  private clearSender() {
    if (this.sendTimer) {
      window.clearInterval(this.sendTimer)
      this.sendTimer = null
    }
  }

  private updateStatus(status: RtasrStatus, message?: string) {
    this.options.onStatusChange?.(status, message)
  }

  private handleError(error: unknown) {
    const rawMessage = error instanceof Error ? error.message : '语音识别失败'
    const message = normalizeXfyunErrorMessage(rawMessage)
    this.updateStatus('error', message)
    this.options.onError?.(message)
    this.stopAudio()
    this.clearSender()
    this.socket?.close()
    this.socket = null
  }
}
