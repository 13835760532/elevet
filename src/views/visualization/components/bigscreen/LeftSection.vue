<template>
  <section class="left-section">
    <BigPanelCard title="农产品品类风险分布" :tabs="['检测量', '阳性率']" v-model:active-tab="categoryTab">
      <CategoryGauges :mode="categoryTab" />
    </BigPanelCard>

    <BigPanelCard title="农产品风险 TOP 10" :tabs="['检测量', '阳性率']" v-model:active-tab="riskTab">
      <div class="chart-wrapper-with-summary" style="position: relative; height: 100%;">
        <div class="positive-count-summary">
          <span v-if="riskTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>样品总量</span>
        </div>
        <Echart class="left-chart" :options="currentRiskTopOption" height="100%" />
      </div>
    </BigPanelCard>

    <BigPanelCard title="农药残留风险 TOP 10" :tabs="['检测量', '阳性率']" v-model:active-tab="pesticideTab">
      <div class="chart-wrapper-with-summary" style="position: relative; height: 100%;">
        <div class="positive-count-summary">
          <span v-if="pesticideTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span>
        </div>
        <Echart class="left-chart" :options="currentPesticideTopOption" height="100%" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import BigPanelCard from './BigPanelCard.vue'
import CategoryGauges from './CategoryGauges.vue'
import {
  getPesticideRiskTop10,
  getProduceRiskTop10,
  type PesticideRiskTopRespVO,
  type ProduceRiskTopRespVO
} from '@/api/agri/dashboard'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config'

const categoryTab = ref<'检测量' | '阳性率'>('检测量')
const riskTab = ref<'检测量' | '阳性率'>('检测量')
const pesticideTab = ref<'检测量' | '阳性率'>('检测量')

const produceRiskList = ref<ProduceRiskTopRespVO[]>([])
const pesticideRiskList = ref<PesticideRiskTopRespVO[]>([])

const getProduceRiskSortValue = (item: ProduceRiskTopRespVO) => {
  if (riskTab.value === '阳性率') {
    return Number(item.statValue ?? item.positiveRate ?? 0)
  }
  return Number(item.statValue ?? item.detectionCount ?? 0)
}

const displayProduceRiskList = computed(() =>
  [...produceRiskList.value]
    .sort((a, b) => getProduceRiskSortValue(b) - getProduceRiskSortValue(a))
    .slice(0, 10)
)

const displayPesticideRiskList = computed(() =>
  [...pesticideRiskList.value]
    .sort((a, b) => {
      const valA = pesticideTab.value === '阳性率' ? Number(a.statValue ?? a.positiveRate ?? 0) : Number(a.statValue ?? a.detectionCount ?? 0)
      const valB = pesticideTab.value === '阳性率' ? Number(b.statValue ?? b.positiveRate ?? 0) : Number(b.statValue ?? b.detectionCount ?? 0)
      return valB - valA
    })
    .slice(0, 9)
)

const riskNames = computed(() =>
  displayProduceRiskList.value.map((item) => item.productName || '--')
)
const riskValues = computed(() =>
  displayProduceRiskList.value.map((item) => {
    if (riskTab.value === '阳性率') {
      return Number(item.statValue ?? item.positiveRate ?? 0)
    }
    return Number(item.statValue ?? item.detectionCount ?? 0)
  })
)
const riskMax = computed(() => {
  const maxValue = Math.max(...riskValues.value, 0)
  if (riskTab.value === '阳性率') {
    return 100
  }
  if (maxValue <= 0) return 10
  if (maxValue <= 10) return 10
  if (maxValue <= 20) return 20
  if (maxValue <= 50) return 50
  return 100
})
const pesticideLabels = computed(() =>
  displayPesticideRiskList.value.map((item) => item.pesticideName || '--')
)
const pesticideValues = computed(() =>
  displayPesticideRiskList.value.map((item) => {
    if (pesticideTab.value === '阳性率') {
      return Number(item.statValue ?? item.positiveRate ?? 0)
    }
    return Number(item.statValue ?? item.detectionCount ?? 0)
  })
)

const getNiceAxisMax = (value: number) => {
  if (value <= 0) return 10

  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10

  return niceNormalized * magnitude
}

const pesticideMax = computed(() => {
  const maxValue = Math.max(...pesticideValues.value, 0)
  if (pesticideTab.value === '阳性率') {
    return 100
  }
  return getNiceAxisMax(maxValue)
})

const formatRiskValue = (value: number, mode: '检测量' | '阳性率') =>
  mode === '阳性率' ? `${Number(value).toFixed(2)}%` : `${Number(value)}`

const formatRankValue = (value: number, mode: '检测量' | '阳性率') =>
  mode === '阳性率' ? `${Number(value).toFixed(2)}%` : `${Number(value)}/100`

const formatPesticideLabel = (value: string) => {
  const label = `${value || '--'}`
  if (label.length <= 3) return label
  if (label.length <= 5) return `${label.slice(0, 3)}\n${label.slice(3)}`
  return `${label.slice(0, 3)}\n${label.slice(3, 6)}`
}

const currentRiskTopOption = computed(() => ({
  animation: false,
  title: {
    show: false,
    text: riskTab.value === '阳性率' ? '阳性率' : '样品总量',
    right: 32,
    top: 0,
    textStyle: {
      color: 'rgba(194, 212, 212, 0.7)',
      fontSize: 17,
      fontWeight: 400
    }
  },
  grid: { left: 116, right: 86, top: 26, bottom: 28 },
  xAxis: {
    type: 'value',
    min: 0,
    max: riskMax.value,
    interval: riskMax.value / 5,
    axisLabel: {
      color: 'rgba(224, 239, 239, 0.72)',
      fontSize: 16,
      margin: 8,
      formatter: (value: number) => {
        if (riskTab.value === '阳性率') return `${value / 10}`
        const normalized = value / (riskMax.value / 10)
        return `${normalized}`
      }
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'rgba(194, 212, 212, 0.18)',
        type: 'dashed'
      }
    },
    axisLine: {
      show: true,
      lineStyle: { color: 'rgba(194, 212, 212, 0.34)', width: 2 }
    },
    axisTick: {
      show: true,
      inside: false,
      length: 7,
      lineStyle: { color: 'rgba(194, 212, 212, 0.3)', width: 1 }
    },
    minorTick: {
      show: true,
      splitNumber: 2,
      length: 5,
      lineStyle: { color: 'rgba(194, 212, 212, 0.24)', width: 1 }
    }
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: riskNames.value,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: '#e0efef',
      fontSize: 14,
      margin: 10,
      formatter: (value: string, index: number) => {
        const rank = `NO.${index + 1}`
        const rich = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'normal'
        return `{${rich}|${rank}} {name|${value}}`
      },
      rich: {
        top1: {
          color: '#2de17c',
          backgroundColor: 'rgba(23, 91, 53, 0.86)',
          fontStyle: 'italic',
          fontWeight: 700,
          width: 42,
          align: 'center',
          padding: [1, 0, 1, 0],
          borderRadius: 2
        },
        top2: {
          color: '#37d4ff',
          backgroundColor: 'rgba(9, 75, 87, 0.86)',
          fontStyle: 'italic',
          fontWeight: 700,
          width: 42,
          align: 'center',
          padding: [1, 0, 1, 0],
          borderRadius: 2
        },
        top3: {
          color: '#f6be35',
          backgroundColor: 'rgba(103, 73, 9, 0.86)',
          fontStyle: 'italic',
          fontWeight: 700,
          width: 42,
          align: 'center',
          padding: [1, 0, 1, 0],
          borderRadius: 2
        },
        normal: {
          color: '#e0efef',
          fontStyle: 'italic',
          fontWeight: 700,
          width: 42,
          align: 'center'
        },
        name: { color: '#e0efef', fontWeight: 500, width: 46, align: 'left', padding: [0, 0, 0, 7] }
      }
    }
  },
  series: [
    {
      type: 'bar',
      data: riskValues.value,
      barWidth: 12,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(12, 40, 73, 0.68)' },
          { offset: 1, color: 'rgba(80, 195, 245, 1)' }
        ])
      },
      label: {
        show: true,
        position: 'right',
        distance: 6,
        color: '#4efafe',
        fontSize: 16,
        fontWeight: 700,
        fontStyle: 'italic',
        formatter: ({ value }: { value: number }) => formatRankValue(value, riskTab.value)
      }
    }
  ]
}))

const currentPesticideTopOption = computed(() => ({
  animation: false,
  title: {
    show: false,
    text: pesticideTab.value === '阳性率' ? '阳性率' : '检测总量',
    right: 16,
    top: 0,
    textStyle: {
      color: 'rgba(194, 212, 212, 0.7)',
      fontSize: 17,
      fontWeight: 400
    }
  },
  grid: { left: 50, right: 24, top: 30, bottom: 46 },
  xAxis: {
    type: 'category',
    data: pesticideLabels.value,
    axisLabel: {
      color: '#e0efef',
      fontSize: 12,
      lineHeight: 15,
      margin: 10,
      interval: 0,
      rotate: 0,
      formatter: formatPesticideLabel
    },
    axisTick: {
      show: true,
      alignWithLabel: false,
      length: 7,
      lineStyle: { color: 'rgba(194, 212, 212, 0.22)', width: 2 }
    },
    axisLine: {
      show: true,
      lineStyle: { color: 'rgba(194, 212, 212, 0.3)', width: 2 }
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: pesticideMax.value,
    axisLabel: {
      color: 'rgba(224, 239, 239, 0.72)',
      fontSize: 16,
      margin: 8,
      formatter: pesticideTab.value === '阳性率' ? '{value}' : '{value}'
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: 'rgba(194, 212, 212, 0.18)',
        type: 'dashed'
      }
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'bar',
      data: pesticideValues.value,
      barWidth: 15,
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(44, 204, 250, 1)' },
          { offset: 1, color: 'rgba(12, 40, 73, 1)' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        distance: 6,
        color: '#4efafe',
        fontSize: 15,
        fontWeight: 700,
        formatter: ({ value }: { value: number }) => formatRiskValue(value, pesticideTab.value)
      }
    }
  ]
}))

const loadProduceRiskTop10 = async () => {
  try {
    const data = await getProduceRiskTop10({
      ...getBigScreenQueryParams(),
      statType: riskTab.value === '阳性率' ? '2' : '1'
    })
    produceRiskList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载农产品风险 TOP10 失败', error)
    produceRiskList.value = []
  }
}

const loadPesticideRiskTop10 = async () => {
  try {
    const data = await getPesticideRiskTop10({
      ...getBigScreenQueryParams(),
      statType: pesticideTab.value === '阳性率' ? '2' : '1'
    })
    pesticideRiskList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载农药残留风险 TOP10 失败', error)
    pesticideRiskList.value = []
  }
}

watch(
  () => riskTab.value,
  () => {
    loadProduceRiskTop10()
  }
)

watch(
  () => pesticideTab.value,
  () => {
    loadPesticideRiskTop10()
  }
)

onMounted(() => {
  loadProduceRiskTop10()
  loadPesticideRiskTop10()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadProduceRiskTop10()
  loadPesticideRiskTop10()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 300px minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
}

.left-chart {
  flex: 1;
  min-height: 0;
}

.positive-count-summary {
  position: absolute;
  top: 8px;
  right: 22px;
  z-index: 3;
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: rgba(214, 234, 255, 0.78);
  font-size: 14px;
  line-height: 18px;
  pointer-events: none;

  strong {
    color: #57e2ff;
    font-size: 16px;
    font-weight: 700;
    font-family: 'DIN Alternate', Arial, sans-serif;
    text-shadow: 0 0 8px rgba(87, 226, 255, 0.4);
  }
}
</style>
