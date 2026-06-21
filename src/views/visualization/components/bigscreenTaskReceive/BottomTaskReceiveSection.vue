<template>
  <section class="bottom-section">
    <BigPanelCard
      class="big-panel-center"
      title="任务检测-接收任务工作动态"
      :tabs="['样品量', '检测量']"
      v-model:active-tab="leftActiveTab"
      :bg-image="bottomBg"
    >
      <Echart :options="currentLeftTrendOption" :height="200" />
    </BigPanelCard>

    <BigPanelCard
      class="big-panel-center"
      title="接收任务检测-风险态势"
      :tabs="['样品阳性率', '检测项阳性率']"
      v-model:active-tab="rightActiveTab"
      :bg-image="bottomBg"
    >
      <Echart :options="currentRightTrendOption" :height="200" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Echart } from '@/components/Echart'
import BigPanelCard from '../bigscreen/BigPanelCard.vue'
import bottomBg from '@/assets/imgs/echarts/检测任务/69.png'
import {
  getTaskRiskTrend,
  getTaskVolumeTrend,
  type TaskRiskTrendRespVO,
  type TaskVolumeTrendRespVO
} from '@/api/agri/dashboard/task'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config'

const leftActiveTab = ref('样品量')
const rightActiveTab = ref('样品阳性率')
const volumeTrend = ref<TaskVolumeTrendRespVO>({})
const riskTrend = ref<TaskRiskTrendRespVO>({})

const lineBase = {
  grid: { left: 48, right: 16, top: 28, bottom: 18 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' }
  },
  legend: {
    right: 16,
    top: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#c0d7f2', fontSize: 11 }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [],
    axisLabel: { color: '#d5e6ff', fontSize: 12, margin: 12 },
    axisTick: {
      show: true,
      length: 7,
      lineStyle: { color: 'rgba(174, 197, 227, 0.35)' }
    },
    axisLine: { lineStyle: { color: 'rgba(140, 167, 196, 0.4)', width: 1.2 } }
  },
  yAxis: {
    type: 'value',
    splitNumber: 6,
    axisLabel: { color: '#b8cce4', fontSize: 12 },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(54, 114, 181, 0.22)', type: 'dashed' } }
  }
}

const getAxisData = (axis?: string[]) => (axis?.length ? axis : [])
const normalizeSeries = (list: number[] | undefined, length: number) =>
  Array.from({ length }, (_, index) => Number(list?.[index] || 0))

const formatMonthLabel = (month?: string) => {
  if (!month) return '--'
  const value = String(month).trim()
  const monthPart = value.split('-')[1]
  return monthPart ? `${Number(monthPart)}月` : value
}

const createTrendOption = (
  xAxisData: string[],
  data: number[],
  max: number,
  lineColor: string,
  formatter?: string
) => ({
  grid: { left: 48, right: 16, top: 28, bottom: 18 },
  tooltip: lineBase.tooltip,
  xAxis: {
    ...lineBase.xAxis,
    data: xAxisData
  },
  yAxis: {
    ...lineBase.yAxis,
    max,
    axisLabel: {
      ...lineBase.yAxis.axisLabel,
      formatter: (value: number) => {
        if (formatter) {
          return formatter.replace('{value}', String(value))
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K`
        }
        return String(value)
      }
    }
  },
  series: [
    {
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: lineColor,
        width: 2,
        shadowBlur: 6,
        shadowColor: lineColor
      },
      itemStyle: {
        color: lineColor,
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 6,
        shadowColor: lineColor
      },
      data
    }
  ]
})

const leftTrendXAxis = computed(() =>
  getAxisData(volumeTrend.value.xaxis).map((item) => formatMonthLabel(item))
)
const sampleCounts = computed(() =>
  normalizeSeries(volumeTrend.value.sampleCounts, leftTrendXAxis.value.length)
)
const itemCounts = computed(() =>
  normalizeSeries(volumeTrend.value.itemCounts, leftTrendXAxis.value.length)
)
const rightTrendXAxis = computed(() =>
  getAxisData(riskTrend.value.xaxis).map((item) => formatMonthLabel(item))
)
const samplePositiveRates = computed(() =>
  normalizeSeries(riskTrend.value.samplePositiveRates, rightTrendXAxis.value.length)
)
const itemPositiveRates = computed(() =>
  normalizeSeries(riskTrend.value.itemPositiveRates, rightTrendXAxis.value.length)
)

const leftAxisMax = computed(() => {
  const isSample = leftActiveTab.value === '样品量'
  const data = isSample ? sampleCounts.value : itemCounts.value
  const maxValue = Math.max(...data, 0)
  if (maxValue <= 0) return 10
  return Math.ceil(maxValue / 10) * 10 + 10
})

const rightAxisMax = computed(() => {
  const isSampleRate = rightActiveTab.value === '样品阳性率'
  const data = isSampleRate ? samplePositiveRates.value : itemPositiveRates.value
  const maxValue = Math.max(...data, 0)
  return Math.max(60, Math.ceil(maxValue / 10) * 10)
})

const currentLeftTrendOption = computed(() => {
  const isSample = leftActiveTab.value === '样品量'
  const data = isSample ? sampleCounts.value : itemCounts.value
  const color = isSample ? '#83d54b' : '#56e8ff'
  return createTrendOption(leftTrendXAxis.value, data, leftAxisMax.value, color)
})

const currentRightTrendOption = computed(() => {
  const isSampleRate = rightActiveTab.value === '样品阳性率'
  const data = isSampleRate ? samplePositiveRates.value : itemPositiveRates.value
  const color = isSampleRate ? '#83d54b' : '#56e8ff'
  return createTrendOption(rightTrendXAxis.value, data, rightAxisMax.value, color, '{value}%')
})

const loadVolumeTrend = async () => {
  try {
    const data = await getTaskVolumeTrend(getBigScreenQueryParams())
    volumeTrend.value = data || {}
  } catch (error) {
    console.error('加载检测任务量态势失败', error)
    volumeTrend.value = {}
  }
}

const loadRiskTrend = async () => {
  try {
    const data = await getTaskRiskTrend(getBigScreenQueryParams())
    riskTrend.value = data || {}
  } catch (error) {
    console.error('加载检测风险态势失败', error)
    riskTrend.value = {}
  }
}

onMounted(() => {
  loadVolumeTrend()
  loadRiskTrend()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadVolumeTrend()
  loadRiskTrend()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}
</style>
