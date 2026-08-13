const TARGET_SAMPLE_RATE = 16000
const PROCESSOR_BUFFER_SIZE = 4096

type AudioChunkListener = (chunk: Float32Array) => void

const normalizeMicrophoneError = (error: unknown) => {
  const errorName =
    typeof error === 'object' && error !== null && 'name' in error ? String(error.name) : ''
  const errorMessage = error instanceof Error ? error.message : ''

  if (['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(errorName)) {
    return '麦克风访问被拒绝，请在 macOS“系统设置 > 隐私与安全性 > 麦克风”中允许本应用后重启应用'
  }

  if (['NotFoundError', 'DevicesNotFoundError'].includes(errorName)) {
    return '未检测到麦克风设备，请连接麦克风后重试'
  }

  if (errorName === 'OverconstrainedError') {
    return '当前麦克风不支持语音输入，请更换麦克风后重试'
  }

  return errorMessage || '无法访问麦克风，请检查系统权限和设备状态'
}

const downsampleBuffer = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
  if (inputSampleRate === outputSampleRate) {
    return buffer
  }

  const ratio = inputSampleRate / outputSampleRate
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

class SharedAudioBus {
  private stream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private processorNode: ScriptProcessorNode | null = null
  private listeners = new Set<AudioChunkListener>()
  private startingPromise: Promise<void> | null = null

  async acquire() {
    if (this.audioContext && this.processorNode && this.stream) {
      return
    }

    if (this.startingPromise) {
      return this.startingPromise
    }

    this.startingPromise = (async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
      } catch (error) {
        throw new Error(normalizeMicrophoneError(error))
      }

      this.audioContext = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE })
      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream)
      this.processorNode = this.audioContext.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1)

      this.processorNode.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0)
        const chunk = downsampleBuffer(
          new Float32Array(input),
          this.audioContext?.sampleRate || TARGET_SAMPLE_RATE,
          TARGET_SAMPLE_RATE
        )

        this.listeners.forEach((listener) => {
          listener(chunk)
        })
      }

      this.sourceNode.connect(this.processorNode)
      this.processorNode.connect(this.audioContext.destination)
    })()

    try {
      await this.startingPromise
    } finally {
      this.startingPromise = null
    }
  }

  addListener(listener: AudioChunkListener) {
    this.listeners.add(listener)
  }

  removeListener(listener: AudioChunkListener) {
    this.listeners.delete(listener)
    if (!this.listeners.size) {
      this.release()
    }
  }

  listenerCount() {
    return this.listeners.size
  }

  release() {
    this.processorNode?.disconnect()
    this.sourceNode?.disconnect()
    this.processorNode = null
    this.sourceNode = null
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.audioContext?.close()
    this.audioContext = null
  }
}

export const sharedAudioBus = new SharedAudioBus()
export { downsampleBuffer, normalizeMicrophoneError, TARGET_SAMPLE_RATE }
export type { AudioChunkListener }
