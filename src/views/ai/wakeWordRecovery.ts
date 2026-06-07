interface WakeWordRecoveryState {
  isWakeWordEnabled: boolean
  hasWakeWordEngine: boolean
  hasVoiceRecognizer: boolean
  isTyping: boolean
  isRecording: boolean
  sessionToken: number
  currentSessionToken: number
}

const shouldResumeWakeWordAfterVoiceStop = (state: WakeWordRecoveryState) => {
  return (
    state.isWakeWordEnabled &&
    state.sessionToken === state.currentSessionToken &&
    !state.hasWakeWordEngine &&
    !state.hasVoiceRecognizer &&
    !state.isTyping
  )
}

const shouldResumeWakeWordAfterDetection = (state: WakeWordRecoveryState) => {
  return (
    state.isWakeWordEnabled &&
    state.sessionToken === state.currentSessionToken &&
    !state.hasWakeWordEngine &&
    !state.isTyping &&
    !state.isRecording
  )
}

export { shouldResumeWakeWordAfterDetection, shouldResumeWakeWordAfterVoiceStop }
export type { WakeWordRecoveryState }
