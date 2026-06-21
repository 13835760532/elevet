<template>
  <section class="persistent-center-section" :class="sectionClass">
    <BigPanelCard
      class="big-panel-center map-panel"
      :title="mapTitle"
      :tabs="mapTabs"
      v-model:active-tab="mapTab"
      :bg-image="mapBgImage"
      :title-bg-image="mapTitleBgImage"
    >
      <div v-if="isDefaultMode" class="coverage-metrics">
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

      <div class="map-area" :class="{ 'default-map-area': isDefaultMode }">
        <div v-if="isDefaultMode" class="left-stats">
          <div class="stat-item" v-for="item in sideStats" :key="item.label">
            <div class="stat-content">
              <span class="stat-label">{{ item.label }}</span>
              <span class="stat-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <VisualizationMap :mode="mapMode" :certificate-tab="mapTab" />
      </div>
    </BigPanelCard>

    <BigPanelCard
      v-if="showTrendPanel"
      class="big-panel-center trend-panel"
      :title="trendTitle"
      :tabs="trendTabs"
      v-model:active-tab="trendTab"
      :bg-image="trendBgImage"
      :title-bg-image="trendTitleBgImage"
    >
      <div v-if="isCertificateMode" class="trend-head">{{ certificateTrendHead }}</div>
      <div class="trend-chart-wrap">
        <Echart
          v-if="isCertificateMode"
          :options="certificateTrendOption"
          height="100%"
        />
        <Echart v-else :options="dashboardTrendOption" height="100%" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import {
  getDashboardOverview,
  getDashboardTrend,
  type DashboardOverviewRespVO,
  type TrendRespVO
} from '@/api/agri/dashboard'
import {
  getCertificateServiceTrend,
  type CertificateServiceTrendRespVO
} from '@/api/agri/dashboard/certificate'
import BigPanelCard from './BigPanelCard.vue'
import VisualizationMap from '../Map.vue'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config'
import { cachedBigScreenRequest } from './requestCache'

import fgqtBg from '@/assets/imgs/echarts/首页/fgqt_bg.png'
import dashboardTrendBg from '@/assets/imgs/echarts/首页/jcdtl_bg.png'
import certificateMapBg from '@/assets/imgs/echarts/合格证/Frame 57_bg.png'
import certificateTrendBg from '@/assets/imgs/echarts/合格证/Frame 59_bg.png'
import taskCenterBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png'
import n1 from '@/assets/imgs/echarts/首页/fgqt1.png'
import n2 from '@/assets/imgs/echarts/首页/fgqt2.png'
import n3 from '@/assets/imgs/echarts/首页/fgqt3.png'

defineOptions({ name: 'VisualizationPersistentCenterSection' })

type BigScreenMenu = '' | 'task' | 'inspect' | 'cert' | 'warn'

const props = defineProps<{
  activeMenu: BigScreenMenu
}>()

const mapTab = ref('开具')
const trendTab = ref('检测量')
const dashboardTrendData = ref<TrendRespVO[]>([])
const dashboardOverview = ref<DashboardOverviewRespVO>({})
const certificateTrendData = ref<CertificateServiceTrendRespVO>({})

const isDefaultMode = computed(() => !props.activeMenu || props.activeMenu === 'warn')
const isCertificateMode = computed(() => props.activeMenu === 'cert')
const showTrendPanel = computed(() => isDefaultMode.value || isCertificateMode.value)

const sectionClass = computed(() => {
  if (props.activeMenu === 'cert') return 'cert'
  if (props.activeMenu === 'task') return 'task'
  if (props.activeMenu === 'inspect') return 'inspect'
  return 'default'
})

const mapMode = computed<'default' | 'certificate' | 'fast' | 'task'>(() => {
  if (props.activeMenu === 'cert') return 'certificate'
  if (props.activeMenu === 'inspect') return 'fast'
  if (props.activeMenu === 'task') return 'task'
  return 'default'
})

const mapTitle = computed(() => {
  if (props.activeMenu === 'cert') return '合格证地区分布图'
  if (props.activeMenu === 'inspect') return '自主检测地域分布图'
  if (props.activeMenu === 'task') return '检测任务地域发布'
  return '覆盖群体'
})

const mapTabs = computed(() => (isCertificateMode.value ? ['开具', '存证'] : []))
const mapBgImage = computed(() => {
  if (props.activeMenu === 'cert') return certificateMapBg
  if (props.activeMenu === 'inspect' || props.activeMenu === 'task') return taskCenterBg
  return ''
})
const mapTitleBgImage = computed(() => (isDefaultMode.value ? fgqtBg : ''))

const trendTitle = computed(() =>
  isCertificateMode.value ? '合格证服务趋势图' : '检测量动态 | 阳性率态势(检测项)'
)
const trendTabs = computed(() => (isDefaultMode.value ? ['检测量', '阳性率'] : []))
const trendBgImage = computed(() =>
  isCertificateMode.value ? certificateTrendBg : dashboardTrendBg
)
const trendTitleBgImage = computed(() => (isDefaultMode.value ? fgqtBg : ''))

const topMetrics = computed(() => [
  { img: n1, label: '监管机构', value: Number(dashboardOverview.value.supervisorCount || 0) },
  { img: n2, label: '检测机构', value: Number(dashboardOverview.value.detectionOrgCount || 0) },
  { img: n3, label: '生产经营主体', value: Number(dashboardOverview.value.enterpriseCount || 0) }
])

const sideStats = computed(() => [
  { label: '任务下发项次', value: `${Number(dashboardOverview.value.taskIssuedCount || 0)}` },
  { label: '任务完成项次', value: `${Number(dashboardOverview.value.taskCompletedCount || 0)}` },
  { label: '任务完成率', value: `${Number(dashboardOverview.value.taskCompletionRate || 0).toFixed(2)}%` },
  { label: '检测样品量', value: `${Number(dashboardOverview.value.sampleCount || 0)}` },
  { label: '检测项次', value: `${Number(dashboardOverview.value.detectionItemCount || 0)}` },
  { label: '合格证开具份', value: `${Number(dashboardOverview.value.certificateIssueCount || 0)}` },
  { label: '合格证校证份', value: `${Number(dashboardOverview.value.certificateVerifyCount || 0)}` }
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

const dashboardTrendDataByMonth = computed(() => {
  const values = Array.from({ length: 12 }, () => ({
    statValue: 0,
    detectionCount: 0,
    positiveCount: 0,
    positiveRate: 0
  }))
  dashboardTrendData.value.forEach((item) => {
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

const dashboardLineValues = computed(() =>
  dashboardTrendDataByMonth.value.map((item) => item.statValue)
)

const dashboardMaxPointIndex = computed(() => {
  let maxIndex = 0
  dashboardLineValues.value.forEach((value, index) => {
    if (value > dashboardLineValues.value[maxIndex]) maxIndex = index
  })
  return maxIndex
})

const dashboardYAxisMax = computed(() => {
  const maxValue = Math.max(...dashboardLineValues.value, 0)
  if (trendTab.value === '阳性率') {
    return Math.max(25, Math.ceil(maxValue / 5) * 5)
  }
  if (maxValue <= 0) return 25
  return Math.max(25, Math.ceil(maxValue / 5) * 5)
})

const getDashboardMarkerLabel = (index: number) => {
  const item = dashboardTrendDataByMonth.value[index]
  if (trendTab.value === '阳性率') {
    const rate = item.positiveRate || item.statValue
    return `${Number(rate).toFixed(Number(rate) % 1 === 0 ? 0 : 2)}%（${item.positiveCount || 0}项次/${item.detectionCount || 0}项次）`
  }
  return `${item.statValue || 0}项次`
}

const createDashboardTrendOption = (data: number[], max: number, formatter?: string) => ({
  animation: false,
  grid: { left: 86, right: 100, top: 54, bottom: 58 },
  graphic: [
    {
      type: 'text',
      left: 42,
      top: 20,
      style: {
        text: '（项次）',
        fill: 'rgba(228, 235, 245, 0.72)',
        font: '16px sans-serif'
      }
    },
    {
      type: 'text',
      right: 26,
      top: 20,
      style: {
        text: '样品总量',
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
        data: [
          {
            coord: [
              dashboardMaxPointIndex.value,
              data[dashboardMaxPointIndex.value] || 0
            ],
            value: getDashboardMarkerLabel(dashboardMaxPointIndex.value),
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

const dashboardTrendOption = computed(() =>
  trendTab.value === '阳性率'
    ? createDashboardTrendOption(
        dashboardLineValues.value,
        dashboardYAxisMax.value,
        '{value}%'
      )
    : createDashboardTrendOption(dashboardLineValues.value, dashboardYAxisMax.value)
)

const normalizeSeries = (series?: number[], length = 0) =>
  Array.from({ length }, (_, index) => Number(series?.[index] || 0))

const createCertificateTrendOption = (
  xAxisData: string[],
  issueData: number[],
  storeData: number[],
  traceData: number[]
) => ({
  animation: false,
  grid: { left: 52, right: 96, top: 38, bottom: 36 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' }
  },
  legend: {
    orient: 'vertical',
    right: 16,
    top: 52,
    itemWidth: 18,
    itemHeight: 2,
    textStyle: { color: '#8fb6da', fontSize: 12 },
    data: ['开具次数', '存证次数', '溯源次数']
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xAxisData,
    axisLabel: { color: 'rgba(198, 219, 239, 0.76)', fontSize: 12 },
    axisTick: { show: false },
    axisLine: { lineStyle: { color: 'rgba(72, 149, 214, 0.42)' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: 'rgba(198, 219, 239, 0.76)', fontSize: 12 },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.28)', type: 'dashed' } }
  },
  series: [
    {
      name: '开具次数',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#55e8ff' },
      lineStyle: { color: '#55e8ff', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(85, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(85, 232, 255, 0.02)' }
        ])
      },
      data: issueData
    },
    {
      name: '存证次数',
      type: 'line',
      smooth: false,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: storeData
    },
    {
      name: '溯源次数',
      type: 'line',
      smooth: false,
      symbolSize: 5,
      lineStyle: { color: '#7d60ff', width: 2 },
      itemStyle: { color: '#7d60ff' },
      data: traceData
    }
  ]
})

const certificateXAxisData = computed(() => certificateTrendData.value.xaxis || [])

const certificateTrendOption = computed(() =>
  createCertificateTrendOption(
    certificateXAxisData.value,
    normalizeSeries(certificateTrendData.value.issueCounts, certificateXAxisData.value.length),
    normalizeSeries(
      certificateTrendData.value.verificationCounts,
      certificateXAxisData.value.length
    ),
    normalizeSeries(certificateTrendData.value.traceCounts, certificateXAxisData.value.length)
  )
)

const certificateTrendHead = computed(() => {
  const axis = certificateXAxisData.value
  if (!axis.length) return ''
  return `${axis[0]} - ${axis[axis.length - 1]}`
})

const loadDashboardTrendData = async () => {
  const params = {
    ...getBigScreenQueryParams(),
    statType: trendTab.value === '阳性率' ? '2' : '1'
  }
  try {
    const data = await cachedBigScreenRequest(
      'dashboard-trend',
      params,
      () => getDashboardTrend(params)
    )
    dashboardTrendData.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载首页月度趋势失败', error)
    dashboardTrendData.value = []
  }
}

const loadDashboardOverviewData = async () => {
  const params = getBigScreenQueryParams()
  try {
    const data = await cachedBigScreenRequest('dashboard-overview', params, () =>
      getDashboardOverview(params)
    )
    dashboardOverview.value = data || {}
  } catch (error) {
    console.error('加载首页概览统计失败', error)
    dashboardOverview.value = {}
  }
}

const loadCertificateTrendData = async () => {
  const params = getBigScreenQueryParams()
  try {
    const data = await cachedBigScreenRequest('certificate-service-trend', params, () =>
      getCertificateServiceTrend(params)
    )
    certificateTrendData.value = data || {}
  } catch (error) {
    console.error('加载合格证服务趋势失败', error)
    certificateTrendData.value = {}
  }
}

const loadActiveCenterData = () => {
  if (isDefaultMode.value) {
    void loadDashboardOverviewData()
    void loadDashboardTrendData()
    return
  }
  if (isCertificateMode.value) {
    void loadCertificateTrendData()
  }
}

watch(
  () => props.activeMenu,
  () => {
    loadActiveCenterData()
  }
)

watch(
  () => trendTab.value,
  () => {
    if (isDefaultMode.value) void loadDashboardTrendData()
  }
)

onMounted(() => {
  loadActiveCenterData()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadActiveCenterData()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.persistent-center-section {
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.persistent-center-section.default {
  display: grid;
  grid-template-rows: minmax(0, 1fr) 292px;
  gap: 18px;
}

.persistent-center-section.cert {
  display: grid;
  grid-template-rows: minmax(0, 2.18fr) minmax(0, 1fr);
  gap: 10px;
}

.persistent-center-section.task,
.persistent-center-section.inspect {
  display: flex;
  flex-direction: column;
}

.map-panel,
.trend-panel {
  min-height: 0;
}

.persistent-center-section.task .map-panel,
.persistent-center-section.inspect .map-panel {
  flex: 1;
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
  border-image: linear-gradient(
      90deg,
      rgba(52, 166, 208, 0),
      rgba(52, 164, 208, 1),
      rgba(255, 255, 255, 1),
      rgba(52, 179, 208, 1),
      rgba(52, 158, 208, 0)
    )
    1 1;

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

.trend-head {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 2;
  text-align: right;
  height: 16px;
  padding: 2px 12px 0;
  color: #9ec2e5;
  font-size: 12px;
}
</style>
