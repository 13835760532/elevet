import type { WakeWordStatus } from '@/api/agri/voiceAssistant/wakeWord/types'

export interface XfyunWakeWordEvent {
  type: 'status' | 'detected' | 'error'
  status?: WakeWordStatus
  message?: string
  keyword?: string
}

export interface XfyunWakeWordBridge {
  isSupported: () => boolean
  start: () => Promise<{ started: boolean; message?: string }>
  stop: () => Promise<void>
  onEvent: (listener: (event: XfyunWakeWordEvent) => void) => () => void
}

declare global {
  interface Window {
    desktopApp?: {
      platform: string
      versions: {
        electron: string
        chrome: string
      }
      wakeWord?: XfyunWakeWordBridge
    }
  }
}

export {}
