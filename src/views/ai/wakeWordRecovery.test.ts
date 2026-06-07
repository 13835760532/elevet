import { describe, expect, it } from 'vitest'
import {
  shouldResumeWakeWordAfterDetection,
  shouldResumeWakeWordAfterVoiceStop,
  type WakeWordRecoveryState
} from './wakeWordRecovery'

const baseState: WakeWordRecoveryState = {
  isWakeWordEnabled: true,
  hasWakeWordEngine: false,
  hasVoiceRecognizer: false,
  isTyping: false,
  isRecording: false,
  sessionToken: 3,
  currentSessionToken: 3
}

describe('wake word recovery decisions', () => {
  it('resumes after voice stop when all guard conditions pass', () => {
    expect(shouldResumeWakeWordAfterVoiceStop(baseState)).toBe(true)
  })

  it('does not resume after voice stop when session token is stale', () => {
    expect(
      shouldResumeWakeWordAfterVoiceStop({
        ...baseState,
        sessionToken: 2
      })
    ).toBe(false)
  })

  it('does not resume after voice stop when a wake engine already exists', () => {
    expect(
      shouldResumeWakeWordAfterVoiceStop({
        ...baseState,
        hasWakeWordEngine: true
      })
    ).toBe(false)
  })

  it('resumes after detection only when not typing or recording', () => {
    expect(shouldResumeWakeWordAfterDetection(baseState)).toBe(true)
    expect(
      shouldResumeWakeWordAfterDetection({
        ...baseState,
        isRecording: true
      })
    ).toBe(false)
    expect(
      shouldResumeWakeWordAfterDetection({
        ...baseState,
        isTyping: true
      })
    ).toBe(false)
  })
})
