<script lang="ts" setup>
// import type { EChartsOption } from 'echarts'
import echarts from '@/plugins/echarts'
import { debounce } from 'lodash-es'
// import 'echarts-wordcloud'
import { propTypes } from '@/utils/propTypes'
import { PropType } from 'vue'
import { isString } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'


defineOptions({ name: 'EChart' })

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('echart')

const props = defineProps({
  options: {
    type: Object as PropType<any>,
    required: true
  },
  width: propTypes.oneOfType([Number, String]).def(''),
  height: propTypes.oneOfType([Number, String]).def('500px')
})

const options = computed(() => {
  return props.options
})

const elRef = ref<ElRef>()

let echartRef: any = null
let initRaf = 0

const contentEl = ref<Element>()

const styles = computed(() => {
  const width = isString(props.width) ? props.width : `${props.width}px`
  const height = isString(props.height) ? props.height : `${props.height}px`

  return {
    width,
    height
  }
})

const initChart = () => {
  if (unref(elRef) && props.options) {
    if (echartRef) {
      echartRef.dispose?.()
      echartRef = null
    }
    echartRef = echarts.init(unref(elRef) as HTMLElement)
    echartRef?.setOption(unref(options), true, true)
  }
}

watch(
  () => options.value,
  (options) => {
    if (echartRef) {
      echartRef?.setOption(options, true, true)
      resizeHandler()
    }
  }
)

const resizeHandler = debounce(() => {
  if (echartRef) {
    echartRef.resize()
  }
}, 100)

const contentResizeHandler = async (e: TransitionEvent) => {
  if (e.propertyName === 'width') {
    resizeHandler()
  }
}

onMounted(() => {
  initRaf = window.requestAnimationFrame(() => {
    initRaf = 0
    initChart()
  })

  window.addEventListener('resize', resizeHandler)

  contentEl.value = document.getElementsByClassName(`${variables.namespace}-layout-content`)[0]
  unref(contentEl) &&
    (unref(contentEl) as Element).addEventListener('transitionend', contentResizeHandler)
})

onBeforeUnmount(() => {
  if (initRaf) {
    window.cancelAnimationFrame(initRaf)
    initRaf = 0
  }
  window.removeEventListener('resize', resizeHandler)
  unref(contentEl) &&
    (unref(contentEl) as Element).removeEventListener('transitionend', contentResizeHandler)
  resizeHandler.cancel?.()
  echartRef?.dispose?.()
  echartRef = null
  contentEl.value = undefined
})

onActivated(() => {
  if (echartRef) {
    echartRef.resize()
  }
})
</script>

<template>
  <div ref="elRef" :class="[$attrs.class, prefixCls]" :style="styles"></div>
</template>
