<template>
  <section class="persistent-center-section" :class="sectionClass">
    <BigPanelCard class="big-panel-center map-panel" :title="mapTitle" :tabs="mapTabs" v-model:active-tab="mapTab"
      :bg-image="mapBgImage" :title-bg-image="mapTitleBgImage">
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
          <div class="stat-item" v-for="(item, index) in sideStats" :key="item.label">
            <div class="stat-content">
              <span class="stat-label">
                {{ item.label }}
                <el-tooltip v-if="item.tooltip && (index == 0)" placement="bottom-start"
                  popper-class="bigscreen-task-tooltip" effect="dark" :show-after="0">
                  <template #content>
                    <div style="max-width: 420px; line-height: 1.8; font-size: 13px; word-break: break-all;">
                      <div v-for="tooltipItem in sideStats" :key="tooltipItem.label">
                        {{ tooltipItem.label }}：{{ tooltipItem.tooltip }}；
                      </div>
                    </div>
                  </template>
                  <span class="question-icon">!</span>
                </el-tooltip>
              </span>
              <div class="stat-value-container">
                <span class="stat-value">{{ item.value }}</span>
                <span class="stat-unit" v-if="item.unit">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>
        <ThreeMap :mode="mapMode" :certificate-tab="mapTab" :task-label="taskLabel" />
      </div>
    </BigPanelCard>

    <BigPanelCard v-if="showTrendPanel" class="big-panel-center trend-panel" :title="trendTitle" :tabs="trendTabs"
      v-model:active-tab="trendTab" :bg-image="trendBgImage" :title-bg-image="trendTitleBgImage">
      <div class="trend-chart-wrap" style="position: relative;">
        <div v-if="!trendEmpty" class="positive-count-summary">
          <!-- <span v-if="trendTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span> -->
        </div>
        <Echart v-if="isCertificateMode && !trendEmpty" :options="certificateTrendOption" height="100%" />
        <Echart v-else-if="!trendEmpty" :key="`dashboard-trend-${trendTab}`" :options="dashboardTrendOption"
          height="100%" />
        <BigDataEmpty v-else :title="isCertificateMode ? '暂无合格证趋势' : '暂无检测态势'" description="当前筛选范围未返回趋势数据" compact />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
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
import BigDataEmpty from './BigDataEmpty.vue'
import ThreeMap from '../ThreeMap.vue'
import { getBigScreenConfig, getBigScreenQueryParams, subscribeBigScreenRefresh } from './config'
import type { BigScreenDataScope } from './dataScope'
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

const route = useRoute()
const mapTab = ref('开具')
const trendTab = ref('检测量')
const dashboardTrendData = ref<TrendRespVO[]>([])
const dashboardOverview = ref<DashboardOverviewRespVO>({})
const certificateTrendData = ref<CertificateServiceTrendRespVO>({})
const activeDataScope = ref<BigScreenDataScope>(getBigScreenConfig().dataScope)

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

const taskLabel = computed(() => '任务下发')

const mapTitle = computed(() => {
  if (props.activeMenu === 'cert') return '合格证地区分布图'
  if (props.activeMenu === 'inspect') return '快速检测地域分布图'
  if (props.activeMenu === 'task') return '检测任务地域发布'
  return '覆盖群体'
})

const mapTabs = computed(() => [])
const mapBgImage = computed(() => {
  if (props.activeMenu === 'cert') return certificateMapBg
  if (props.activeMenu === 'inspect' || props.activeMenu === 'task') return taskCenterBg
  return ''
})
const mapTitleBgImage = computed(() => (isDefaultMode.value ? fgqtBg : ''))

const trendTitle = computed(() =>
  isCertificateMode.value ? '合格证服务趋势图' : '检测态势'
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

interface SideStatCopy {
  taskQuantity: { label: string; tooltip: string }
  taskCompleted: { label: string; tooltip: string }
  taskCompletionRate: { label: string; tooltip: string }
  sampleCount: { label: string; tooltip: string }
  detectionItemCount: { label: string; tooltip: string }
  certificateIssueCount: { label: string; tooltip: string }
  certificateVerifyCount: { label: string; tooltip: string }
}

const organizationSideStatCopy = {
  sampleCount: {
    label: '快检样品量',
    tooltip: '本机构的“全部样品抽检量”'
  },
  detectionItemCount: {
    label: '检测项总量',
    tooltip: '本机构的“全部样品总检测量”'
  },
  certificateIssueCount: {
    label: '合格证开具',
    tooltip: '本机构的“合格证累计开具份数”'
  },
  certificateVerifyCount: {
    label: '合格证收证',
    tooltip: '本机构的“合格证累计收证份数”'
  }
}

const sideStatCopyByScope: Record<BigScreenDataScope, SideStatCopy> = {
  all: {
    taskQuantity: {
      label: '任务下发量',
      tooltip: '本辖区全部监管机构任务下发总量（统计：本辖区所有监管机构任务样品量）'
    },
    taskCompleted: {
      label: '任务完成量',
      tooltip: '本辖区全部监管机构任务下发完成量（统计：已下达任务完成抽样量）'
    },
    taskCompletionRate: {
      label: '任务完成率',
      tooltip: '本辖区的“任务下发量/完成任务量”'
    },
    sampleCount: {
      label: '快检样品量',
      tooltip: '本辖区全部监管机构的“全部样品抽检量”'
    },
    detectionItemCount: {
      label: '检测项总量',
      tooltip: '本辖区全部监管机构的“全部样品总检测量”'
    },
    certificateIssueCount: {
      label: '合格证开具',
      tooltip: '本辖区合格证累计开具份数'
    },
    certificateVerifyCount: {
      label: '合格证收证',
      tooltip: '本辖区合格证累计收证份数'
    }
  },
  issued: {
    taskQuantity: {
      label: '任务下发量',
      tooltip: '本机构任务下发总量（统计：下发任务样品量）'
    },
    taskCompleted: {
      label: '任务完成量',
      tooltip: '本机构下发任务完成量（统计：已下发任务完成抽样量）'
    },
    taskCompletionRate: {
      label: '任务完成率',
      tooltip: '本机构的“任务下发量/完成任务量”'
    },
    ...organizationSideStatCopy
  },
  self: {
    taskQuantity: {
      label: '任务接收量',
      tooltip: '本机构任务接收总量（统计：下发任务样品量）'
    },
    taskCompleted: {
      label: '任务完成量',
      tooltip: '本机构接收任务完成量（统计：已接收任务完成抽样量）'
    },
    taskCompletionRate: {
      label: '任务完成率',
      tooltip: '本机构的“任务接收量/完成任务量”'
    },
    ...organizationSideStatCopy
  }
}

const sideStats = computed(() => {
  const copy = sideStatCopyByScope[activeDataScope.value]
  return [
    {
      ...copy.taskQuantity,
      value: Number(dashboardOverview.value.taskIssuedCount || 0),
      unit: '批次'
    },
    {
      ...copy.taskCompleted,
      value: Number(dashboardOverview.value.taskCompletedCount || 0),
      unit: '批次'
    },
    {
      ...copy.taskCompletionRate,
      value: Number(dashboardOverview.value.taskCompletionRate || 0).toFixed(2),
      unit: '%'
    },
    {
      ...copy.sampleCount,
      value: Number(dashboardOverview.value.sampleCount || 0),
      unit: '批次'
    },
    {
      ...copy.detectionItemCount,
      value: Number(dashboardOverview.value.detectionItemCount || 0),
      unit: '项次'
    },
    {
      ...copy.certificateIssueCount,
      value: Number(dashboardOverview.value.certificateIssueCount || 0),
      unit: '份'
    },
    {
      ...copy.certificateVerifyCount,
      value: Number(dashboardOverview.value.certificateVerifyCount || 0),
      unit: '份'
    }
  ]
})

const filterYear = computed(() => {
  const { startDate, endDate } = getBigScreenQueryParams()
  const currentYear = new Date().getFullYear()
  if (startDate && endDate) {
    const startYear = Number(startDate.split('-')[0])
    const endYear = Number(endDate.split('-')[0])
    if (Number.isFinite(startYear) && Number.isFinite(endYear)) {
      if (currentYear >= startYear && currentYear <= endYear) {
        return String(currentYear)
      }
      return String(endYear)
    }
  }
  if (startDate) {
    return startDate.split('-')[0]
  }
  return String(currentYear)
})

const uniqueMonthsCount = computed(() => {
  const set = new Set()
  dashboardTrendData.value.forEach((item) => {
    if (!item.month) return
    let key = String(item.month).trim()
    if (key.includes('-')) {
      const parts = key.split('-')
      const y = parts[0]
      const m = parts[1].replace('月', '').padStart(2, '0')
      key = `${y}-${m}`
    } else {
      const m = key.replace('月', '').padStart(2, '0')
      key = `${filterYear.value}-${m}`
    }
    set.add(key)
  })
  return set.size
})

/** 按自然月生成闭区间月份列表，用于补齐接口没有返回的零值月份。 */
const generateMonthRange = (startStr?: string, endStr?: string): string[] => {
  if (!startStr || !endStr) return []
  const result: string[] = []
  try {
    const startParts = startStr.split('-')
    const endParts = endStr.split('-')
    if (startParts.length < 2 || endParts.length < 2) return []

    let startY = Number(startParts[0])
    let startM = Number(startParts[1])
    const endY = Number(endParts[0])
    const endM = Number(endParts[1])

    if (Number.isNaN(startY) || Number.isNaN(startM) || Number.isNaN(endY) || Number.isNaN(endM)) {
      return []
    }

    let currentY = startY
    let currentM = startM

    let limit = 0
    while ((currentY < endY || (currentY === endY && currentM <= endM)) && limit < 48) {
      result.push(`${currentY}-${String(currentM).padStart(2, '0')}`)
      currentM++
      if (currentM > 12) {
        currentM = 1
        currentY++
      }
      limit++
    }
  } catch (e) {
    console.error('generateMonthRange error', e)
  }
  return result
}

const bigScreenConfig = ref(getBigScreenConfig())

const monthLabels = computed(() => {
  const startDate = bigScreenConfig.value.timeRange?.[0]
  const endDate = bigScreenConfig.value.timeRange?.[1]
  if (startDate && endDate) {
    const list = generateMonthRange(startDate, endDate)
    if (list.length > 0) return list
  }

  if (uniqueMonthsCount.value > 12) {
    const result = []
    const today = new Date()
    let year = today.getFullYear()
    let month = today.getMonth() // 0-indexed, 0 is Jan
    for (let i = 0; i < 12; i++) {
      const mStr = String(month + 1).padStart(2, '0')
      result.unshift(`${year}-${mStr}`)
      month--
      if (month < 0) {
        month = 11
        year--
      }
    }
    return result
  }
  return Array.from({ length: 12 }, (_, index) => {
    const mm = String(index + 1).padStart(2, '0')
    return `${filterYear.value}-${mm}`
  })
})

const formatToChineseMonth = (ym?: string) => {
  if (!ym) return '';
  const parts = ym.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = Number(parts[1]);
    return `${year}年${month}月`;
  }
  return ym;
};

const formattedXAxis = computed(() => monthLabels.value.map(item => formatToChineseMonth(item)))

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
  const dataMap = new Map()
  dashboardTrendData.value.forEach((item) => {
    if (!item.month) return
    let key = String(item.month).trim()
    if (key.includes('-')) {
      const parts = key.split('-')
      const y = parts[0]
      const m = parts[1].replace('月', '').padStart(2, '0')
      key = `${y}-${m}`
    } else {
      const m = key.replace('月', '').padStart(2, '0')
      key = `${filterYear.value}-${m}`
    }
    dataMap.set(key, item)
  })

  return monthLabels.value.map((mLabel) => {
    const item = dataMap.get(mLabel)
    return {
      statValue: Number(item?.statValue ?? item?.detectionCount ?? item?.positiveRate ?? 0),
      detectionCount: Number(item?.detectionCount || 0),
      positiveCount: Number(item?.positiveCount || 0),
      positiveRate: Number(item?.positiveRate || 0)
    }
  })
})

const mapTrendData = (xaxis: string[], seriesData: number[], targetLabels: string[]) => {
  const dataMap = new Map()
  if (Array.isArray(xaxis)) {
    xaxis.forEach((item, index) => {
      let key = String(item).trim()
      if (key.includes('-')) {
        const parts = key.split('-')
        const y = parts[0]
        const m = parts[1].replace('月', '').padStart(2, '0')
        key = `${y}-${m}`
      } else {
        const m = key.replace('月', '').padStart(2, '0')
        key = `${filterYear.value}-${m}`
      }
      dataMap.set(key, Number(seriesData?.[index] || 0))
    })
  }
  return targetLabels.map((mLabel) => dataMap.get(mLabel) || 0)
}

const dashboardLineValues = computed(() =>
  dashboardTrendDataByMonth.value.map((item) => item.statValue)
)
const dashboardTrendEmpty = computed(
  () => dashboardTrendData.value.length === 0
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
    return 100
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

interface DashboardTrendTooltipParam {
  dataIndex?: number
}

const formatDashboardTrendTooltip = (
  params: DashboardTrendTooltipParam | DashboardTrendTooltipParam[]
) => {
  const tooltipParam = Array.isArray(params) ? params[0] : params
  const dataIndex = Number(tooltipParam?.dataIndex)
  if (!Number.isInteger(dataIndex) || dataIndex < 0 || dataIndex >= monthLabels.value.length) return ''

  const item = dashboardTrendDataByMonth.value[dataIndex]
  const monthLabel = monthLabels.value[dataIndex]
  return [
    `<div style="margin-bottom:6px;">${formatToChineseMonth(monthLabel)}</div>`,
    `<div style="display:flex;align-items:center;line-height:24px;"><span style="width:9px;height:9px;margin-right:7px;border-radius:50%;background:#f05a75;"></span><span style="min-width:76px;">阳性数量</span><span>${item.positiveCount}项次</span></div>`,
    `<div style="display:flex;align-items:center;line-height:24px;"><span style="width:9px;height:9px;margin-right:7px;border-radius:50%;background:#57e2ff;"></span><span style="min-width:76px;">检测总量</span><span>${item.detectionCount}项次</span></div>`
  ].join('')
}

const createDashboardTrendOption = (
  data: number[],
  max: number,
  formatter?: string,
  unitText = '（项次）',
  rightTitle = '样品总量',
  interval?: number,
  yAxisFontSize = 18,
  markerPosition: 'top' | 'right' = 'top'
) => ({
  animation: false,
  grid: { left: 86, right: 100, top: 54, bottom: 58 },
  graphic: [
    {
      type: 'text',
      left: 42,
      top: 20,
      style: {
        text: unitText,
        fill: 'rgba(228, 235, 245, 0.72)',
        font: '16px sans-serif'
      }
    },
    ...(rightTitle
      ? [
        {
          type: 'text',
          right: 26,
          top: 20,
          style: {
            text: rightTitle,
            fill: 'rgba(228, 235, 245, 0.72)',
            font: '16px sans-serif'
          }
        }
      ]
      : []),
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
    triggerOn: 'mousemove|click',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    axisPointer: {
      type: 'line',
      lineStyle: { color: 'rgba(223, 247, 255, 0.66)', width: 1 }
    },
    formatter: formatDashboardTrendTooltip
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: monthLabels.value,
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
    ...(interval === undefined ? {} : { interval }),
    axisLabel: {
      color: 'rgba(228, 235, 245, 0.72)',
      fontSize: yAxisFontSize,
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
        data: dashboardLineValues.value[dashboardMaxPointIndex.value] > 0
          ? [
            {
              coord: [
                dashboardMaxPointIndex.value,
                data[dashboardMaxPointIndex.value] || 0
              ],
              value: getDashboardMarkerLabel(dashboardMaxPointIndex.value),
              label: {
                show: true,
                position: markerPosition,
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

const dashboardTrendOption = computed(() =>
  trendTab.value === '阳性率'
    ? createDashboardTrendOption(
      dashboardLineValues.value,
      dashboardYAxisMax.value,
      '{value}%',
      '（%）',
      '',
      20,
      15,
      'right'
    )
    : createDashboardTrendOption(
      dashboardLineValues.value,
      dashboardYAxisMax.value,
      undefined,
      undefined,
      ''
    )
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
  grid: { left: 52, right: 96, top: 38, bottom: 42 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: (params: any) => {
      if (!params || params.length === 0) return '';
      const rawMonth = params[0].axisValue;
      const formattedMonth = formatToChineseMonth(rawMonth);
      let html = `<div style="margin-bottom:6px;font-weight:600;color:#dff7ff;">${formattedMonth}</div>`;
      params.forEach((param: any) => {
        if (param.value !== undefined) {
          const marker = param.marker || '';
          const seriesName = param.seriesName || '';
          const value = param.value;
          html += `<div style="display:flex;align-items:center;line-height:22px;gap:4px;">` +
            `<span>${marker}</span>` +
            `<span style="min-width:76px;color:rgba(143,182,218,0.82);">${seriesName}:</span>` +
            `<strong style="color:#fff;font-family:DIN Alternate,Arial;font-weight:700;">${value}次</strong></div>`;
        }
      });
      return html;
    }
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
    axisLabel: { color: 'rgba(198, 219, 239, 0.76)', fontSize: 10, rotate: 30 },
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

const certUniqueMonthsCount = computed(() => {
  return (certificateTrendData.value.xaxis || []).length
})

const certificateXAxisData = computed(() => {
  const startDate = bigScreenConfig.value.timeRange?.[0]
  const endDate = bigScreenConfig.value.timeRange?.[1]

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentYM = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  if (startDate && endDate) {
    const allMonths = generateMonthRange(startDate, endDate)
    if (allMonths.length > 0) {
      if (allMonths.length <= 12) {
        // 1. 不足 12 月 有多少显示多少
        return allMonths
      } else {
        const idx = allMonths.indexOf(currentYM)
        if (idx !== -1) {
          // 2. 跨度超 12 月且包含当前年月：只显示当前年往前的12个月的数据
          const startIdx = Math.max(0, idx - 11)
          return allMonths.slice(startIdx, idx + 1)
        } else {
          // 3. 跨度超 12 月但不含当前年月：截取选择终点月份往前12个月数据
          return allMonths.slice(-12)
        }
      }
    }
  }

  // 兜底逻辑：显示当前年往前的 12 个月
  const result = []
  let year = currentYear
  let month = now.getMonth() // 0-indexed
  for (let i = 0; i < 12; i++) {
    const mStr = String(month + 1).padStart(2, '0')
    result.unshift(`${year}-${mStr}`)
    month--
    if (month < 0) {
      month = 11
      year--
    }
  }
  return result
})

const certificateTrendOption = computed(() => {
  const targetX = certificateXAxisData.value
  const rawX = certificateTrendData.value.xaxis || []
  return createCertificateTrendOption(
    targetX,
    mapTrendData(rawX, certificateTrendData.value.issueCounts || [], targetX),
    mapTrendData(rawX, certificateTrendData.value.verificationCounts || [], targetX),
    mapTrendData(rawX, certificateTrendData.value.traceCounts || [], targetX)
  )
})

const certificateTrendEmpty = computed(() => {
  return certificateXAxisData.value.length === 0
})

const trendEmpty = computed(() =>
  isCertificateMode.value ? certificateTrendEmpty.value : dashboardTrendEmpty.value
)

const certificateTrendHead = computed(() => {
  const axis = certificateXAxisData.value
  if (!axis.length) return ''
  return `${axis[0]} - ${axis[axis.length - 1]}`
})

/** 加载首页检测量/阳性率月度趋势，并根据当前趋势页签传递统计口径。 */
const loadDashboardTrendData = async () => {
  const params = {
    ...getBigScreenQueryParams(),
    statType: (trendTab.value === '阳性率' ? '2' : '1') as '1' | '2'
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

/** 加载首页顶部概览指标；失败时回退为空对象以保持组件可渲染。 */
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

/** 加载合格证开具与存证趋势数据。 */
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

/** 根据当前一级菜单仅加载中心区域实际可见的数据，避免隐藏面板发起无效请求。 */
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
  const nextConfig = getBigScreenConfig()
  bigScreenConfig.value = nextConfig
  activeDataScope.value = nextConfig.dataScope
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
  z-index: 5;
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
    display: flex;
    align-items: center;
  }

  .question-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    margin-left: 6px;
    line-height: 1;
    transition: all 0.2s ease;
    user-select: none;
    flex-shrink: 0;

    &:hover {
      border-color: #57e2ff;
      color: #57e2ff;
      background: rgba(87, 226, 255, 0.1);
    }
  }

  .stat-value-container {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
  }

  .stat-value {
    color: #43e4ff;
    font-size: 30px;
    font-weight: 800;
    font-family: 'Din Alternate', sans-serif;
    line-height: 1;
    text-shadow: 0 0 8px rgba(67, 228, 255, 0.35);
  }

  .stat-unit {
    flex-shrink: 0;
    color: rgba(235, 248, 248, 0.58);
    font-size: 15px;
    font-weight: normal;
    margin-left: 6px;
    white-space: nowrap;
    text-shadow: none;
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

<style lang="scss">
.bigscreen-task-tooltip.el-popper {
  background: #061a38 !important;
  border: 1px solid #188bf5 !important;
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(24, 139, 245, 0.4) !important;
  font-size: 13px !important;
  line-height: 1.8 !important;

  .el-popper__arrow::before {
    background: #061a38 !important;
    border: 1px solid #188bf5 !important;
  }
}
</style>
