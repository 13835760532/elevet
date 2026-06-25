<template>
  <section class="left-section">
    <BigScreenSelector :label="selectorLabel" />

    <BigPanelCard title="合格证概况" :bg-image="leftBg">
      <div class="overview-grid">
        <div class="overview-card" :class="[item.type, `card-${index + 1}`, getMetricSizeClass(item.value)]"
          v-for="(item, index) in overviewData" :key="item.label">
          <div class="card-inner">
            <div class="icon-box">
              <img src="@/assets/imgs/echarts/合格证/icon.png" alt="" />
            </div>
            <div class="metric-content">
              <div class="card-label">{{ item.label }}</div>
              <div class="num-box">
                <span class="value-text">{{ item.value ?? 0 }}</span>
                <span class="unit-text">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证服务主体" :bg-image="leftBg">
      <div class="subject-grid">
        <div class="subject-item" v-for="(item, index) in subjectData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value ?? 0 }}</span>
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <div v-if="index < subjectData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard class="category-panel" title="各产品品类合格证开具量" :bg-image="leftBg">
      <div class="category-layout">
        <div class="pie-container">
          <Echart :options="categoryPieOption" height="100%" width="100%" />
        </div>
        <div class="category-legend">
          <div class="legend-row" v-for="item in categoryItems" :key="item.name">
            <span class="dot" :style="{ background: item.color }"></span>
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import BigPanelCard from '../bigscreen/BigPanelCard.vue'
import BigScreenSelector from '../bigscreen/BigScreenSelector.vue'
import leftBg from '@/assets/imgs/echarts/合格证/Frame 58_bg.png'
import {
  getCertificateCategoryDistribution,
  getCertificateOverview,
  type CertificateCategoryDistributionRespVO,
  type DashboardCertificateOverviewRespVO
} from '@/api/agri/dashboard/certificate'
import { getDashboardOverview, type DashboardOverviewRespVO } from '@/api/agri/dashboard'
import { getSubjectPage } from '@/api/agri/subject'
import {
  getBigScreenConfig,
  getBigScreenQueryParams,
  subscribeBigScreenRefresh
} from '../bigscreen/config'
import { cachedBigScreenRequest } from '../bigscreen/requestCache'

const overview = ref<DashboardCertificateOverviewRespVO>({})
const dashboardOverview = ref<DashboardOverviewRespVO>({})
const subjectArchiveStats = ref({
  enterpriseCount: 0,
  personalCount: 0
})
const categoryDistribution = ref<CertificateCategoryDistributionRespVO[]>([])
const fallbackCategoryColors = ['#7d60ff', '#ff8a34', '#8ad64c', '#4f7cff', '#b8e3ff']
const categoryColorMap: Record<string, string> = {
  蔬菜: '#3f6dff',
  水果: '#ffb22c',
  茶叶: '#3ba4ff',
  畜禽: '#d8efff',
  水产: '#39e3e7',
  其他: '#74608c'
}

const hexToRgba = (hex: string, alpha: number) => {
  const value = hex.replace('#', '')
  if (value.length !== 6) return hex
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const getCategoryColor = (name: string, index: number) =>
  categoryColorMap[name] || fallbackCategoryColors[index % fallbackCategoryColors.length]

const overviewData = computed(() => [
  { label: '合格证开具', value: Number(overview.value.issueCount || 0), unit: '份', type: 'blue' },
  {
    label: '合格证收证',
    value: Number(overview.value.verificationCount || 0),
    unit: '份',
    type: 'green'
  },
  {
    label: '合格证查验',
    value: Number(overview.value.verificationCount || 0),
    unit: '次',
    type: 'cyan'
  },
  { label: '合格证溯源', value: Number(overview.value.traceCount || 0), unit: '次', type: 'orange' }
])

const getMetricSizeClass = (value: number) => {
  const length = String(Math.trunc(Math.abs(Number(value) || 0))).length
  if (length >= 9) return 'value-size-xxl'
  if (length >= 8) return 'value-size-xl'
  if (length >= 7) return 'value-size-lg'
  if (length >= 6) return 'value-size-md'
  return 'value-size-base'
}

const selectorLabel = computed(() => {
  const config = getBigScreenConfig()
  const region = config.regionLabel || '北京地区'
  const start = (config.timeRange?.[0] || '').replaceAll('-', '')
  const end = (config.timeRange?.[1] || '').replaceAll('-', '')
  return `${start ? `${start.slice(0, 4)}年度` : '年度'}${region}农产品质量安全风险预警【${start}-${end}】`
})

const supervisorOrgCount = computed(() => {
  const supervisor = Number(overview.value.supervisorCount ?? dashboardOverview.value.supervisorCount ?? 0)
  const detection = Number(overview.value.detectionOrgCount ?? dashboardOverview.value.detectionOrgCount ?? 0)
  const sum = (isNaN(supervisor) ? 0 : supervisor) + (isNaN(detection) ? 0 : detection)
  return isNaN(sum) ? 0 : sum
})
const enterpriseCount = computed(() => {
  const count = Number(
    overview.value.enterpriseCount ??
    subjectArchiveStats.value.enterpriseCount ??
    dashboardOverview.value.enterpriseCount ??
    0
  )
  return isNaN(count) ? 0 : count
})
const personalCount = computed(() => {
  const count = Number(
    overview.value.personalCount ??
    overview.value.individualCount ??
    subjectArchiveStats.value.personalCount ??
    0
  )
  return isNaN(count) ? 0 : count
})

const subjectData = computed(() => [
  {
    label: '监管机构/检测机构',
    value: supervisorOrgCount.value || Number(overview.value.issueSubjectCount || 0)
  },
  { label: '企业', value: enterpriseCount.value },
  { label: '个人', value: personalCount.value }
])

const loadOverviewData = () => {
  const params = getBigScreenQueryParams()

  cachedBigScreenRequest('certificate-overview', params, () => getCertificateOverview(params))
    .then((data) => {
      overview.value = data || {}
      if (
        data?.enterpriseCount === undefined ||
        (data?.personalCount === undefined && data?.individualCount === undefined)
      ) {
        loadSubjectArchiveStats(params)
      }
    })
    .catch((error) => {
      console.error('加载合格证概览数据失败', error)
      overview.value = {}
    })

  cachedBigScreenRequest('dashboard-overview', params, () => getDashboardOverview(params))
    .then((data) => {
      dashboardOverview.value = data || {}
    })
    .catch((error) => {
      console.error('加载合格证服务主体概览失败', error)
      dashboardOverview.value = {}
    })
}

const loadSubjectArchiveStats = (params = getBigScreenQueryParams()) => {
  cachedBigScreenRequest('certificate-subject-archive-stats', params, () =>
    Promise.allSettled([
      getSubjectPage({
        pageNo: 1,
        pageSize: 1,
        type: 1,
        provinceCode: params.provinceName,
        cityCode: params.cityName
      }),
      getSubjectPage({
        pageNo: 1,
        pageSize: 1,
        type: 2,
        provinceCode: params.provinceName,
        cityCode: params.cityName
      })
    ])
  ).then(([enterpriseResult, personalResult]) => {
    if (enterpriseResult.status === 'rejected' || personalResult.status === 'rejected') {
      console.error('加载合格证主体档案统计失败', {
        enterpriseError: enterpriseResult.status === 'rejected' ? enterpriseResult.reason : undefined,
        personalError: personalResult.status === 'rejected' ? personalResult.reason : undefined
      })
    }

    subjectArchiveStats.value = {
      enterpriseCount:
        enterpriseResult.status === 'fulfilled' ? Number(enterpriseResult.value?.total || 0) : 0,
      personalCount: personalResult.status === 'fulfilled' ? Number(personalResult.value?.total || 0) : 0
    }
  })
}

const categoryItems = computed(() => {
  const defaultItems = [
    { name: '蔬菜', value: 0 },
    { name: '水果', value: 0 },
    { name: '茶叶', value: 0 },
    { name: '畜禽', value: 0 },
    { name: '水产', value: 0 }
  ]
  const realData = categoryDistribution.value.reduce((map, item) => {
    const name = item.category || '--'
    if (name !== '其他' && name !== '--') {
      map[name] = Number(item.issueCount || 0)
    }
    return map
  }, {} as Record<string, number>)

  return defaultItems
    .map((d) => {
      const realVal = realData[d.name] || 0
      return {
        name: d.name,
        value: realVal, // 使用真实接口请求的数据，默认为 0
        color: categoryColorMap[d.name] || '#7d60ff'
      }
    })
    .sort((a, b) => b.value - a.value)
})

const pieItems = computed(() => categoryItems.value.filter((item) => item.value > 0))

const categoryPieOption = computed(() => {
  const labelRich = pieItems.value.reduce(
    (rich, item, index) => ({
      ...rich,
      [`value${index}`]: {
        color: item.color,
        fontSize: 12,
        lineHeight: 16,
        fontWeight: 700
      }
    }),
    {
      name: { color: '#d6eefe', fontSize: 12, lineHeight: 16 }
    }
  )

  return {
    animation: false,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(6, 18, 42, 0.92)',
      borderColor: 'rgba(87, 226, 255, 0.35)',
      textStyle: { color: '#dff7ff' },
      formatter: ({ name, value }: { name: string; value: number }) => `${name}<br/>${value}`
    },
    series: [
      {
        type: 'pie',
        radius: ['64%', '78%'],
        center: ['49%', '52%'],
        minAngle: 6,
        silent: true,
        hoverAnimation: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: 'rgba(7, 16, 38, 0.96)',
          borderWidth: 4,
          shadowBlur: 16
        },
        data: pieItems.value.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: hexToRgba(item.color, 0.3) },
              { offset: 1, color: hexToRgba(item.color, 0.12) }
            ]),
            shadowColor: hexToRgba(item.color, 0.26)
          }
        })),
        z: 1
      },
      {
        type: 'pie',
        radius: ['43%', '64%'],
        center: ['49%', '52%'],
        minAngle: 6,
        avoidLabelOverlap: true,
        label: {
          show: true,
          color: '#d6eefe',
          fontSize: 12,
          formatter: (params: { name: string; value: number; dataIndex: number }) =>
            params.value > 0
              ? `{name|${params.name}}\n{value${params.dataIndex}|${params.value}}`
              : '',
          rich: labelRich
        },
        labelLine: {
          show: true,
          length: 14,
          length2: 18,
          lineStyle: { color: 'rgba(255,255,255,0.85)', width: 1.2 }
        },
        itemStyle: {
          borderColor: 'rgba(7, 16, 38, 0.96)',
          borderWidth: 4,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        },
        data: pieItems.value.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: item.color },
              { offset: 1, color: hexToRgba(item.color, 0.75) }
            ])
          }
        })),
        z: 2
      }
    ]
  }
})

const loadCategoryDistribution = async () => {
  const params = getBigScreenQueryParams()
  try {
    const data = await cachedBigScreenRequest('certificate-category-distribution', params, () =>
      getCertificateCategoryDistribution(params)
    )
    categoryDistribution.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载合格证品类分布失败', error)
    categoryDistribution.value = []
  }
}

onMounted(() => {
  loadOverviewData()
  loadCategoryDistribution()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadOverviewData()
  loadCategoryDistribution()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows:
    42px 10px minmax(0, 1.18fr) 20px minmax(0, 0.79fr) 20px minmax(0, 1.03fr);
  row-gap: 0;
  height: 100%;
  min-height: 0;

  :deep(.panel-card),
  :deep(.panel-body) {
    min-height: 0;
  }

  :deep(.panel-body) {
    padding: 0;
  }

  :deep(.big-screen-selector),
  :deep(.selector-trigger) {
    width: 100%;
    height: 42px;
  }

  :deep(.panel-card) {
    background: transparent;
    box-shadow: none;
  }

  :deep(.category-panel .panel-body) {
    overflow: visible;
  }

  :deep(.panel-card::after) {
    display: none;
  }

  :deep(.panel-header) {
    height: 42px;
    flex-basis: 42px;
    background-image: url('@/assets/imgs/echarts/合格证/erji_bg.png');
    background-repeat: no-repeat;
    background-position: left center;
    background-size: 100% 42px;
    padding: 0;
  }

  :deep(.panel-title) {
    height: 42px;
    padding-left: 61px;
    font-size: 18px;
    line-height: 42px;
    color: #e0efef;
  }

  > :nth-child(1) {
    grid-row: 1;
  }

  > :nth-child(2) {
    grid-row: 3;
  }

  > :nth-child(3) {
    grid-row: 5;
  }

  > :nth-child(4) {
    grid-row: 7;
  }
}

.overview-grid {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  column-gap: 14px;
  row-gap: 26px;
  padding: 32px 18px 28px;
  background:
    linear-gradient(180deg, rgba(0, 2, 31, 0.31) 0%, rgba(0, 2, 31, 0.31) 100%),
    linear-gradient(180deg, rgba(4, 19, 49, 0.18) 0%, rgba(5, 12, 34, 0.04) 100%);
  box-shadow: inset 0 0 28px rgba(2, 74, 168, 0.14);

  &::after {
    content: '';
    position: absolute;
    right: 1px;
    bottom: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg,
        rgba(32, 51, 159, 0) 0%,
        rgba(32, 45, 159, 1) 41%,
        rgba(133, 151, 229, 1) 51%,
        rgba(32, 62, 159, 1) 63%,
        rgba(32, 45, 159, 0) 100%);
    pointer-events: none;
  }
}

.overview-card {
  position: relative;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;

  .card-inner {
    display: flex;
    align-items: center;
    padding: 0 16px;
    height: 100%;
    box-sizing: border-box;
    gap: 14px;
  }

  .metric-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
  }

  .card-label {
    margin: 0;
    color: #c2d4d4;
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: 0;
    text-align: left;
    text-shadow: none;
  }

  .num-box {
    margin-top: 0;
    display: flex;
    align-items: baseline;
    gap: 4px;

    .value-text {
      flex: 0 1 auto;
      min-width: 0;
      font-family: 'DIN Black', 'DIN Alternate', 'Inter', sans-serif;
      font-size: 36px;
      font-weight: 900;
      line-height: 40px;
      letter-spacing: 0;
      background: linear-gradient(180deg, #8cecff 0%, #2589ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: none;
      white-space: nowrap;
    }

    .unit-text {
      flex: 0 0 auto;
      color: #c2d4d4;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
      opacity: 1;
    }
  }

  .icon-box {
    width: 41px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 41px;
      height: 23px;
      object-fit: contain;
    }
  }

  &.value-size-md {
    .value-text {
      font-size: 32px;
    }
  }

  &.value-size-lg {
    .value-text {
      font-size: 28px;
    }
  }

  &.value-size-xl,
  &.value-size-xxl {
    .value-text {
      font-size: 24px;
    }
  }

  &.card-1 {
    background-image: url('@/assets/imgs/echarts/合格证/Frame 57_bg.png');
  }

  &.card-2 {
    background-image: url('@/assets/imgs/echarts/合格证/Frame 58_bg.png');
  }

  &.card-3 {
    background-image: url('@/assets/imgs/echarts/合格证/Frame 59_bg.png');
  }

  &.card-4 {
    background-image: url('@/assets/imgs/echarts/合格证/Frame 60_bg.png');
  }

  &.blue {
    --theme-color: #2589ff;
    --theme-light-color: #8cecff;
    --theme-glow-color: rgba(37, 137, 255, 0.6);
  }

  &.green {
    --theme-color: #00ffb4;
    --theme-light-color: #a7ffeb;
    --theme-glow-color: rgba(0, 255, 180, 0.5);
  }

  &.cyan {
    --theme-color: #00e5ff;
    --theme-light-color: #80f3ff;
    --theme-glow-color: rgba(0, 229, 255, 0.5);
  }

  &.orange {
    --theme-color: #ff9900;
    --theme-light-color: #ffcc80;
    --theme-glow-color: rgba(255, 153, 0, 0.5);
  }
}

.subject-grid {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-content: start;
  height: 100%;
  padding: 30px 0 0;
  background: url('@/assets/imgs/echarts/合格证/fwzt.png') no-repeat 0 0;
  background-size: 100% 100%;
}

.subject-item {
  position: relative;
  height: 87px;

  .item-inner {
    width: 100%;
    text-align: center;
  }

  .label {
    margin: 0;
    height: 23px;
    color: #c2d4d4;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
  }

  .value-container {
    position: relative;
    height: 44px;

    .value {
      color: #7feaff;
      font-size: 36px;
      line-height: 44px;
      font-weight: 900;
      font-family: 'DIN Black', 'DIN Alternate', sans-serif;
      text-shadow: 0 0 10px rgba(127, 234, 255, 0.5);
    }

    .holographic-img {
      position: absolute;
      top: 37px;
      left: 50%;
      width: 115px;
      height: 68px;
      transform: translateX(-50%);
      pointer-events: none;
    }
  }

  &:nth-child(1) .holographic-img {
    width: 116px;
  }

  .separator {
    position: absolute;
    top: 34px;
    right: 0;
    width: 1px;
    height: 59px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
}

.category-layout {
  flex: 1;
  box-sizing: border-box;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 315px) 76px;
  align-items: stretch;
  gap: 8px;
  height: 100%;
  min-height: 0;
  padding: 18px 20px 10px;
  background: url('@/assets/imgs/echarts/合格证/kjl_bg.png') no-repeat 0 0;
  background-size: 100% 100%;

  &::after {
    content: '';
    position: absolute;
    right: 1px;
    bottom: 0;
    left: 0;
    height: 2px;
    background: linear-gradient(90deg,
        rgba(32, 51, 159, 0) 0%,
        rgba(32, 45, 159, 1) 41%,
        rgba(133, 151, 229, 1) 51%,
        rgba(32, 62, 159, 1) 63%,
        rgba(32, 45, 159, 0) 100%);
    pointer-events: none;
  }
}

.pie-container {
  min-width: 0;
  height: 100%;
  min-height: 0;
  padding-top: 0;
  overflow: visible;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 142px;
  min-height: 0;
  overflow-y: auto;
  align-self: start;
  margin-top: 42px;
  padding-right: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(65, 190, 255, 0.5);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(8, 18, 42, 0.35);
  }
}

.legend-row {
  display: grid;
  grid-template-columns: 15px minmax(0, 1fr);
  align-items: center;
  gap: 6px;
  min-height: 15px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 0;
  box-shadow: 0 0 8px rgba(87, 226, 255, 0.28);
}

.name {
  min-width: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-row .value {
  display: none;
}
</style>
