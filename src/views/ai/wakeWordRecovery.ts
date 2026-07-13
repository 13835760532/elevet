interface WakeWordRecoveryState {
  isWakeWordEnabled: boolean
  hasWakeWordEngine: boolean
  hasVoiceRecognizer: boolean
  isTyping: boolean
  isRecording: boolean
  sessionToken: number
  currentSessionToken: number
}

// sessionToken 用于废弃旧异步任务：用户关闭或重启语音会话后，旧回调不得重新启动唤醒词。
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
