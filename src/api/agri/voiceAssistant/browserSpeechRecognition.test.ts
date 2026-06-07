import { describe, expect, it } from 'vitest'
import { mapErrorMessage, shouldAutoRecover } from './browserSpeechRecognition'

describe('browser speech recognition recovery', () => {
  it('auto-recovers on non-fatal idle recognition errors', () => {
    expect(shouldAutoRecover('no-speech')).toBe(true)
    expect(shouldAutoRecover('aborted')).toBe(true)
  })

  it('does not auto-recover on permission or device errors', () => {
    expect(shouldAutoRecover('not-allowed')).toBe(false)
    expect(shouldAutoRecover('audio-capture')).toBe(false)
  })

  it('maps browser speech errors to localized messages', () => {
    expect(mapErrorMessage('not-allowed')).toContain('允许浏览器访问麦克风')
    expect(mapErrorMessage('audio-capture')).toContain('麦克风设备')
    expect(mapErrorMessage('network')).toContain('网络异常')
  })

  it('maps no-speech to a retry-friendly message', () => {
    expect(mapErrorMessage('no-speech')).toContain('没有识别到语音')
  })
})
