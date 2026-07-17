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

/**
 * 按计划分批挂载大屏面板。
 *
 * 大屏包含多个图表和 WebGL 场景，如果同一帧全部挂载会造成明显卡顿。该组合函数先
 * 显示关键面板，再通过 `requestAnimationFrame + setTimeout` 分批挂载其余面板，并
 * 在重新调度或组件卸载时统一清理未执行任务。
 */
export const useDeferredPanelMount = () => {
  const visibility = reactive<DeferredPanelVisibility>({
    left: false,
    center: false,
    right: false,
    bottom: false
  })

  let timerIds: number[] = []
  let mountRaf = 0

  /** 取消尚未执行的延迟挂载任务。 */
  const clearScheduled = () => {
    timerIds.forEach((id) => window.clearTimeout(id))
    timerIds = []
    if (mountRaf) {
      window.cancelAnimationFrame(mountRaf)
      mountRaf = 0
    }
  }

  /** 将全部面板恢复为未挂载状态。 */
  const resetVisibility = () => {
    visibility.left = false
    visibility.center = false
    visibility.right = false
    visibility.bottom = false
  }

  /** 应用新的挂载计划；调用前会取消上一轮计划。 */
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
