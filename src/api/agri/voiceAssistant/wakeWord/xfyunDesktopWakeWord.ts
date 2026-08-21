import type { WakeWordEngine, WakeWordEngineOptions, WakeWordStatus } from './types'
import type { XfyunWakeWordEvent } from '@/types/desktop-app'

/** Windows Electron 由 preload 暴露受限桥接；网页和 macOS 桌面端均不会获得此能力。 */
const getBridge = () => window.desktopApp?.wakeWord

const isXfyunDesktopWakeWordSupported = () => {
  return window.desktopApp?.platform === 'win32' && Boolean(getBridge()?.isSupported())
}

/**
 * 讯飞 AIKit 是 C++ DLL，不能在浏览器上下文直接加载。
 * 该适配器通过 Electron 主进程启动官方 SDK 的 Windows 助手进程，并将唤醒事件转为统一接口。
 */
class XfyunDesktopWakeWordEngine implements WakeWordEngine {
  private readonly options: WakeWordEngineOptions
  private unsubscribe: (() => void) | null = null
  private stopped = true

  constructor(options: WakeWordEngineOptions) {
    this.options = options
  }

  async start() {
    if (!this.stopped) return

    const bridge = getBridge()
    if (!bridge || !isXfyunDesktopWakeWordSupported()) {
      throw new Error('当前桌面系统未安装讯飞 Windows 语音唤醒组件')
    }

    this.stopped = false
    this.options.onStatusChange?.('initializing', '正在启动讯飞本地唤醒')
    this.unsubscribe = bridge.onEvent((event) => this.handleEvent(event))

    try {
      const result = await bridge.start()
      if (!result.started) {
        throw new Error(result.message || '讯飞本地唤醒启动失败')
      }
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async stop() {
    if (this.stopped) return

    this.stopped = true
    this.unsubscribe?.()
    this.unsubscribe = null
    await getBridge()?.stop()
    this.options.onStatusChange?.('stopped')
  }

  destroy() {
    void this.stop()
  }

  private handleEvent(event: XfyunWakeWordEvent) {
    if (this.stopped) return

    if (event.type === 'detected') {
      const keyword = event.keyword || '小壹'
      this.options.onStatusChange?.('detected', `检测到唤醒词：${keyword}`)
      this.options.onDetected?.({ keyword, timestamp: Date.now() })
      return
    }

    if (event.type === 'error') {
      this.handleError(new Error(event.message || '讯飞本地唤醒发生错误'))
      return
    }

    const status: WakeWordStatus = event.status || 'initializing'
    this.options.onStatusChange?.(status, event.message)
  }

  private handleError(error: unknown) {
    if (this.stopped) return

    const message = error instanceof Error ? error.message : '讯飞本地唤醒发生错误'
    this.stopped = true
    this.unsubscribe?.()
    this.unsubscribe = null
    this.options.onStatusChange?.('error', message)
    this.options.onError?.(message)
    void getBridge()?.stop()
  }
}

export { XfyunDesktopWakeWordEngine, isXfyunDesktopWakeWordSupported }
