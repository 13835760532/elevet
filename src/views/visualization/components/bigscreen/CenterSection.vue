<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="覆盖群体" :title-bg-image="fgqtBg">
      <div class="coverage-metrics">
        <div class="metric-card" v-for="item in topMetrics" :key="item.label">
          <div class="pedestal-wrap">
            <img :src="item.img" class="metric-icon" />
          </div>
          <div class="meta">
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>

      <div class="map-area">
        <div class="left-stats">
          <div class="stat-item" v-for="item in sideStats" :key="item.label">
            <div class="stat-content">
              <span class="stat-label">{{ item.label }}</span>
              <span class="stat-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <Map />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="检测态势" :tabs="['检测量', '阳性率']" v-model:active-tab="trendTab"
      :bg-image="trendBg" :title-bg-image="fgqtBg">
      <div class="trend-chart-wrap" style="position: relative;">
        <div v-if="!trendEmpty" class="positive-count-summary">
          <span v-if="trendTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span>
        </div>
        <Echart v-if="!trendEmpty" :options="currentLineTrendOption" height="100%" />
        <BigDataEmpty
          v-else
          title="暂无检测态势"
          description="当前筛选范围未返回趋势数据"
          compact
        />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import BigPanelCard from './BigPanelCard.vue'
import BigDataEmpty from './BigDataEmpty.vue'
import Map from '../Map.vue'
import fgqtBg from '@/assets/imgs/echarts/首页/fgqt_bg.png'
import trendBg from '@/assets/imgs/echarts/首页/jcdtl_bg.png'
import {
  getDashboardOverview,
  getDashboardTrend,
  type DashboardOverviewRespVO,
  type TrendRespVO
} from '@/api/agri/dashboard'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config'

import n1 from '@/assets/imgs/echarts/首页/fgqt1.png'
import n2 from '@/assets/imgs/echarts/首页/fgqt2.png'
import n3 from '@/assets/imgs/echarts/首页/fgqt3.png'

const trendTab = ref('检测量')
const trendData = ref<TrendRespVO[]>([])
const overview = ref<DashboardOverviewRespVO>({})

const topMetrics = computed(() => [
  { img: n1, label: '监管机构', value: Number(overview.value.supervisorCount || 0) },
  { img: n2, label: '检测机构', value: Number(overview.value.detectionOrgCount || 0) },
  { img: n3, label: '生产经营主体', value: Number(overview.value.enterpriseCount || 0) }
])

const sideStats = computed(() => [
  { label: '任务下发项次', value: `${Number(overview.value.taskIssuedCount || 0)}` },
  { label: '任务完成项次', value: `${Number(overview.value.taskCompletedCount || 0)}` },
  { label: '任务完成率', value: `${Number(overview.value.taskCompletionRate || 0).toFixed(0)}%` },
  { label: '检测样品量', value: `${Number(overview.value.sampleCount || 0)}` },
  { label: '检测项次', value: `${Number(overview.value.detectionItemCount || 0)}` },
  { label: '合格证开具份', value: `${Number(overview.value.certificateIssueCount || 0)}` },
  { label: '合格证收证份', value: `${Number(overview.value.certificateVerifyCount || 0)}` }
])

const monthLabels = Array.from({ length: 12 }, (_, index) => `${index + 1}月`)

const getMonthIndex = (month?: string) => {
  if (!month) return -1
  const value = String(month).trim()
  const monthPart = value.includes('-') ? value.split('-')[1] : value.replace('月', '')
  const monthNumber = Number(monthPart)
  return Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12
    ? monthNumber - 1
    : -1
}

const filterYear = computed(() => {
  const { startDate } = getBigScreenQueryParams()
  if (startDate) {
    return startDate.split('-')[0]
  }
  return String(new Date().getFullYear())
})

const currentTrendDataByMonth = computed(() => {
  const values = Array.from({ length: 12 }, () => ({
    statValue: 0,
    detectionCount: 0,
    positiveCount: 0,
    positiveRate: 0
  }))
  trendData.value.forEach((item) => {
    if (item.month && item.month.includes('-')) {
      const year = item.month.split('-')[0]
      if (year !== filterYear.value) return
    }
    const index = getMonthIndex(item.month)
    if (index < 0) return
    values[index] = {
      statValue: Number(item.statValue ?? item.detectionCount ?? item.positiveRate ?? 0),
      detectionCount: Number(item.detectionCount || 0),
      positiveCount: Number(item.positiveCount || 0),
      positiveRate: Number(item.positiveRate || 0)
    }
  })
  return values
})

const lineValues = computed(() => currentTrendDataByMonth.value.map((item) => item.statValue))
const trendEmpty = computed(
  () => trendData.value.length === 0 || !lineValues.value.some((value) => Number(value || 0) > 0)
)

const maxPointIndex = computed(() => {
  let maxIndex = 0
  lineValues.value.forEach((value, index) => {
    if (value > lineValues.value[maxIndex]) maxIndex = index
  })
  return maxIndex
})

const yAxisMax = computed(() => {
  const maxValue = Math.max(...lineValues.value, 0)
  if (trendTab.value === '阳性率') {
    return Math.max(25, Math.ceil(maxValue / 5) * 5)
  }
  if (maxValue <= 0) return 25
  return Math.max(25, Math.ceil(maxValue / 5) * 5)
})

const getMarkerLabel = (index: number) => {
  const item = currentTrendDataByMonth.value[index]
  if (trendTab.value === '阳性率') {
    const rate = item.positiveRate || item.statValue
    return `${Number(rate).toFixed(Number(rate) % 1 === 0 ? 0 : 2)}%（${item.positiveCount || 0}项次/${item.detectionCount || 0}项次）`
  }
  return `${item.statValue || 0}项次`
}

const createLineTrendOption = (data: number[], max: number, formatter?: string) => ({
  animation: false,
  grid: { left: 86, right: 100, top: 54, bottom: 58 },
  graphic: [
    {
      type: 'text',
      left: 42,
      top: 20,
      style: {
        text: trendTab.value === '阳性率' ? '（%）' : '（项次）',
          fill: 'rgba(228, 235, 245, 0.72)',
          font: '16px sans-serif'
        }
      },
      {
        type: 'text',
        right: 10,
        bottom: 18,
        style: {
          text: '（月份）',
          fill: 'rgba(228, 235, 245, 0.86)',
          font: '20px sans-serif'
        }
      }
    ],
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: monthLabels,
    axisLabel: {
      color: 'rgba(228, 235, 245, 0.82)',
      fontSize: 18,
      margin: 20
    },
    axisTick: {
      show: true,
      alignWithLabel: true,
      length: 12,
      lineStyle: { color: 'rgba(160, 171, 190, 0.42)', width: 2 }
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(180, 188, 198, 0.34)',
        width: 3
      }
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max,
    interval: 5,
    axisLabel: {
      color: 'rgba(228, 235, 245, 0.72)',
      fontSize: 18,
      margin: 22,
      formatter: formatter || '{value}'
    },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: {
      lineStyle: {
        color: 'rgba(47, 93, 157, 0.18)',
        type: [5, 6],
        width: 1
      }
    }
  },
  series: [
    {
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 7,
      showSymbol: true,
      lineStyle: {
        color: '#57e2ff',
        width: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(87, 226, 255, 0.55)'
      },
      itemStyle: {
        color: '#57e2ff',
        borderColor: 'rgba(146, 242, 255, 0.9)',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: 'rgba(87, 226, 255, 0.7)'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(75, 220, 232, 0.48)' },
          { offset: 0.48, color: 'rgba(39, 148, 164, 0.28)' },
          { offset: 1, color: 'rgba(18, 63, 92, 0.02)' }
        ])
      },
      markPoint: {
        symbol: 'circle',
        symbolSize: 8,
        data: lineValues.value[maxPointIndex.value] > 0
          ? [
            {
              coord: [maxPointIndex.value, data[maxPointIndex.value] || 0],
              value: getMarkerLabel(maxPointIndex.value),
              label: {
                show: true,
                position: 'top',
                distance: 12,
                color: '#57e2ff',
                fontSize: 16,
                fontWeight: 500,
                formatter: '{c}'
              },
              itemStyle: {
                color: '#57e2ff',
                borderColor: 'rgba(177, 249, 255, 0.95)',
                borderWidth: 2,
                shadowBlur: 10,
                shadowColor: 'rgba(87, 226, 255, 0.8)'
              }
            }
          ]
          : []
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          color: '#7cecff',
          borderColor: '#ffffff',
          borderWidth: 2
        }
      },
      data
    }
  ]
})

const currentLineTrendOption = computed(() =>
  trendTab.value === '阳性率'
    ? createLineTrendOption(lineValues.value, yAxisMax.value, '{value}%')
    : createLineTrendOption(lineValues.value, yAxisMax.value)
)

const loadTrendData = async () => {
  try {
    const data = await getDashboardTrend({
      ...getBigScreenQueryParams(),
      statType: trendTab.value === '阳性率' ? '2' : '1'
    })
    trendData.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载首页月度趋势失败', error)
    trendData.value = []
  }
}

const loadOverviewData = async () => {
  try {
    const data = await getDashboardOverview(getBigScreenQueryParams())
    overview.value = data || {}
  } catch (error) {
    console.error('加载首页概览统计失败', error)
    overview.value = {}
  }
}

watch(
  () => trendTab.value,
  () => {
    loadTrendData()
  }
)

onMounted(() => {
  loadOverviewData()
  loadTrendData()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadOverviewData()
  loadTrendData()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.center-section {
  display: grid;
  grid-template-rows: minmax(0, 1fr) 292px;
  gap: 18px;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.coverage-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  height: 104px;
  padding: 0 28px;
  background: rgba(20, 28, 42, 0.46);
}

.metric-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  position: relative;

  &::before {
    content: '';
    width: 1px;
    height: 64px;
    position: absolute;
    background: linear-gradient(0deg, #0d1c1a 0%, rgba(194, 212, 212, 0.76) 51.44%, #0e1d1a 100%);
    right: 0;
  }

  &:last-child {
    &::before {
      display: none;
    }
  }

  .pedestal-wrap {
    position: relative;
    width: 112px;
    height: 82px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .metric-icon {
    width: 97px;
    height: 80px;
    object-fit: contain;
    z-index: 2;
    filter: drop-shadow(0 0 10px rgba(67, 228, 255, 0.6));
  }

  .meta {
    p {
      margin: 0;
      color: #94bddf;
      font-size: 17px;
      line-height: 22px;
    }

    strong {
      display: inline-block;
      min-width: 116px;
      margin-top: 2px;
      padding: 0 8px;
      color: #43e4ff;
      font-size: 42px;
      line-height: 1.1;
      font-weight: 800;
      font-family: 'Din Alternate', sans-serif;
      text-shadow: 0 0 10px rgba(67, 228, 255, 0.4);
    }
  }
}

.map-area {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.trend-chart-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.left-stats {
  position: absolute;
  left: 0;
  top: 6px;
  width: 125px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.stat-item {
  height: 64px;
  padding: 8px;
  background: rgba(0, 29, 27, 0.4);
  border-bottom: 1px solid;
  border-image: linear-gradient(90deg,
      rgba(52, 166, 208, 0),
      rgba(52, 164, 208, 1),
      rgba(255, 255, 255, 1),
      rgba(52, 179, 208, 1),
      rgba(52, 158, 208, 0)) 1 1;

  &:first-child {
    padding: 8px;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-label {
    color: rgba(235, 248, 248, 0.7);
    font-size: 16px;
    line-height: 23px;
  }

  .stat-value {
    color: #43e4ff;
    font-size: 30px;
    font-weight: 800;
    font-family: 'Din Alternate', sans-serif;
    line-height: 1;
    text-shadow: 0 0 8px rgba(67, 228, 255, 0.35);
  }
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
