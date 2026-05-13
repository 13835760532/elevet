import { onUnmounted, reactive } from 'vue'

export interface DeferredPanelVisibility {
  left: boolean
  center: boolean
  right: boolean
  bottom: boolean
}

export interface DeferredPanelPlan {
  immediate: Array<keyof DeferredPanelVisibility>
  deferred: Array<{ key: keyof DeferredPanelVisibility; delay: number }>
}

export const useDeferredPanelMount = () => {
  const visibility = reactive<DeferredPanelVisibility>({
    left: false,
    center: false,
    right: false,
    bottom: false
  })

  let timerIds: number[] = []
  let mountRaf = 0

  const clearScheduled = () => {
    timerIds.forEach((id) => window.clearTimeout(id))
    timerIds = []
    if (mountRaf) {
      window.cancelAnimationFrame(mountRaf)
      mountRaf = 0
    }
  }

  const resetVisibility = () => {
    visibility.left = false
    visibility.center = false
    visibility.right = false
    visibility.bottom = false
  }

  const schedule = (plan: DeferredPanelPlan) => {
    clearScheduled()
    resetVisibility()

    plan.immediate.forEach((key) => {
      visibility[key] = true
    })

    mountRaf = window.requestAnimationFrame(() => {
      plan.deferred.forEach(({ key, delay }) => {
        const timerId = window.setTimeout(() => {
          visibility[key] = true
        }, delay)
        timerIds.push(timerId)
      })
      mountRaf = 0
    })
  }

  onUnmounted(() => {
    clearScheduled()
  })

  return {
    visibility,
    schedule
  }
}
