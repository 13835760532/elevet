import { ref, onMounted, onUnmounted, computed } from 'vue'

export const useFormLayout = () => {
  const windowWidth = ref(window.innerWidth)

  const updateSize = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize)
  })

  // 当屏幕宽度超过 1400px 时，添加特定类名
  const queryFormClass = computed(() => {
    return windowWidth.value > 1400 ? 'custom-query-form-row' : ''
  })

  return {
    windowWidth,
    queryFormClass
  }
}
