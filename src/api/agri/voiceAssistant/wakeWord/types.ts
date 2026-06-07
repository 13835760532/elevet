export type WakeWordStatus =
  | 'idle'
  | 'initializing'
  | 'listening'
  | 'detected'
  | 'stopped'
  | 'error'

export interface WakeWordDetectedPayload {
  keyword: string
  timestamp: number
}

export interface WakeWordEngineOptions {
  keywords: string[]
  onStatusChange?: (status: WakeWordStatus, message?: string) => void
  onDetected?: (payload: WakeWordDetectedPayload) => void
  onTranscript?: (text: string) => void
  onError?: (message: string) => void
}

export interface WakeWordEngine {
  start(): Promise<void>
  stop(): void
  destroy(): void
}
