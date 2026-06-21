<template>
  <section class="left-section">
    <BigScreenSelector :label="selectorLabel" />

    <BigPanelCard title="合格证概况" :bg-image="leftBg">
      <div class="overview-grid">
        <div
          class="overview-card"
          :class="[item.type, `card-${index + 1}`, getMetricSizeClass(item.value)]"
          v-for="(item, index) in overviewData"
          :key="item.label"
        >
          <div class="card-inner">
            <div class="icon-box">
              <img src="@/assets/imgs/echarts/合格证/icon.png" alt="" />
            </div>
            <div class="metric-content">
              <div class="card-label">{{ item.label }}</div>
              <div class="num-box">
                <span class="value-text">{{ item.value }}</span>
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
              <span class="value">{{ item.value }}</span>
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <div v-if="index < subjectData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="各品类合格证开具量" :bg-image="leftBg">
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

const overview = ref<DashboardCertificateOverviewRespVO>({})
const dashboardOverview = ref<DashboardOverviewRespVO>({})
const subjectArchiveStats = ref({
  enterpriseCount: 0,
  personalCount: 0
})
const categoryDistribution = ref<CertificateCategoryDistributionRespVO[]>([])
const categoryColors = [
  '#3f6dff',
  '#ffb22c',
  '#3ba4ff',
  '#d8efff',
  '#39e3e7',
  '#8ad64c',
  '#7d60ff',
  '#ff8a34'
]

const overviewData = computed(() => [
  { label: '合格证开具', value: Number(overview.value.issueCount || 0), unit: '份', type: 'blue' },
  {
    label: '合格证存证',
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

const supervisorOrgCount = computed(
  () =>
    Number(overview.value.supervisorCount ?? dashboardOverview.value.supervisorCount ?? 0) +
    Number(overview.value.detectionOrgCount ?? dashboardOverview.value.detectionOrgCount ?? 0)
)
const enterpriseCount = computed(() =>
  Number(
    overview.value.enterpriseCount ??
      subjectArchiveStats.value.enterpriseCount ??
      dashboardOverview.value.enterpriseCount ??
      0
  )
)
const personalCount = computed(() =>
  Number(
    overview.value.personalCount ??
      overview.value.individualCount ??
      subjectArchiveStats.value.personalCount ??
      0
  )
)

const subjectData = computed(() => [
  {
    label: '监管机构/检测机构',
    value: supervisorOrgCount.value || Number(overview.value.issueSubjectCount || 0)
  },
  { label: '企业', value: enterpriseCount.value },
  { label: '个人', value: personalCount.value }
])

const loadOverviewData = async () => {
  try {
    const params = getBigScreenQueryParams()
    const [certificateData, dashboardData, enterprisePage, personalPage] = await Promise.all([
      getCertificateOverview(params),
      getDashboardOverview(params),
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
    overview.value = certificateData || {}
    dashboardOverview.value = dashboardData || {}
    subjectArchiveStats.value = {
      enterpriseCount: Number(enterprisePage?.total || 0),
      personalCount: Number(personalPage?.total || 0)
    }
  } catch (error) {
    console.error('加载合格证概览数据失败', error)
    overview.value = {}
    dashboardOverview.value = {}
    subjectArchiveStats.value = {
      enterpriseCount: 0,
      personalCount: 0
    }
  }
}

const categoryItems = computed(() =>
  [...categoryDistribution.value]
    .map((item) => ({
      name: item.category || '--',
      value: Number(item.issueCount || 0)
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: categoryColors[index % categoryColors.length]
    }))
)

const pieItems = computed(() => categoryItems.value.filter((item) => item.value > 0))

const categoryPieOption = computed(() => ({
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
      radius: ['42%', '64%'],
      center: ['48%', '52%'],
      minAngle: 6,
      avoidLabelOverlap: true,
      label: {
        show: true,
        color: '#d6eefe',
        fontSize: 12,
        formatter: (params: { name: string; value: number }) =>
          params.value > 0 ? `{name|${params.name}}\n{value|${params.value}}` : '',
        rich: {
          name: { color: '#d6eefe', fontSize: 12, lineHeight: 16 },
          value: { color: '#57e2ff', fontSize: 12, lineHeight: 16, fontWeight: 700 }
        }
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
            { offset: 1, color: 'rgba(15, 52, 95, 0.9)' }
          ])
        }
      }))
    }
  ]
}))

const loadCategoryDistribution = async () => {
  try {
    const data = await getCertificateCategoryDistribution(getBigScreenQueryParams())
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
  grid-template-rows: 42px 10px 345px 20px 233px 20px 302px;
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
    width: 455px;
    height: 42px;
  }

  :deep(.panel-card) {
    background: transparent;
    box-shadow: none;
  }

  :deep(.panel-card::after) {
    display: none;
  }

  :deep(.panel-header) {
    height: 42px;
    flex-basis: 42px;
    background-image: url('@/assets/imgs/echarts/合格证/erji_bg.png');
    background-size: 455px 42px;
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
  width: 455px;
  min-height: 0;
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
    background: linear-gradient(
      90deg,
      rgba(32, 51, 159, 0) 0%,
      rgba(32, 45, 159, 1) 41%,
      rgba(133, 151, 229, 1) 51%,
      rgba(32, 62, 159, 1) 63%,
      rgba(32, 45, 159, 0) 100%
    );
    pointer-events: none;
  }
}

.overview-card {
  position: absolute;
  width: 202px;
  height: 98px;
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 202px 98px;

  .card-inner {
    position: relative;
    width: 202px;
    height: 98px;
    padding: 0;
  }

  .metric-content {
    position: absolute;
    left: 54px;
    top: 10px;
    width: 148px;
    height: 87px;
  }

  .card-label {
    width: 122px;
    height: 23px;
    margin: 0 0 0;
    color: #c2d4d4;
    font-size: 16px;
    font-weight: 500;
    line-height: 23px;
    letter-spacing: 0;
    text-align: left;
    text-shadow: none;
  }

  .num-box {
    width: 148px;
    height: 44px;
    margin-top: 0;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 0;

    .value-text {
      flex: 0 1 auto;
      min-width: 0;
      font-family: 'DIN Black', 'DIN Alternate', 'Inter', sans-serif;
      font-size: 36px;
      font-weight: 900;
      line-height: 44px;
      letter-spacing: 0;
      background: linear-gradient(180deg, #48c5ff 0%, #e4f5ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: none;
      margin-left: 0px;
      white-space: nowrap;
    }

    .unit-text {
      flex: 0 0 auto;
      margin-top: 10px;
      color: #c2d4d4;
      font-size: 14px;
      font-weight: 500;
      line-height: 23px;
      opacity: 1;
    }
  }

  .icon-box {
    position: absolute;
    left: 5px;
    top: 54px;
    width: 41px;
    height: 23px;
    display: flex;
    align-items: center;
    justify-content: center;

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

    .unit-text {
      margin-top: 9px;
    }
  }

  &.value-size-lg {
    .value-text {
      font-size: 28px;
    }

    .unit-text {
      margin-top: 8px;
    }
  }

  &.value-size-xl,
  &.value-size-xxl {
    .value-text {
      font-size: 24px;
    }

    .unit-text {
      margin-top: 7px;
    }
  }

  &.card-1 {
    left: 18px;
    top: 32px;
    background-image: url('@/assets/imgs/echarts/合格证/Frame 57_bg.png');
  }

  &.card-2 {
    left: 234px;
    top: 32px;
    background-image: url('@/assets/imgs/echarts/合格证/Frame 58_bg.png');
  }

  &.card-3 {
    left: 18px;
    top: 156px;
    background-image: url('@/assets/imgs/echarts/合格证/Frame 59_bg.png');
  }

  &.card-4 {
    left: 234px;
    top: 156px;
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
  display: block;
  height: 100%;
  padding: 0;
  background: url('@/assets/imgs/echarts/合格证/fwzt.png') no-repeat 0 0;
  background-size: 454px 191px;
}

.subject-item {
  position: absolute;
  top: 30px;
  height: 87px;

  &:nth-child(1) {
    left: 0;
    width: 145px;
  }

  &:nth-child(2) {
    left: 174px;
    width: 101px;
  }

  &:nth-child(3) {
    left: 327px;
    width: 101px;
  }

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
      pointer-events: none;
    }
  }

  &:nth-child(1) .holographic-img {
    left: 17px;
    width: 116px;
    height: 68px;
  }

  &:nth-child(2) .holographic-img {
    left: -4px;
    width: 115px;
    height: 68px;
  }

  &:nth-child(3) .holographic-img {
    left: -7px;
    width: 115px;
    height: 68px;
  }

  .separator {
    position: absolute;
    top: 34px;
    width: 1px;
    height: 59px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent);
  }

  &:nth-child(1) .separator {
    left: 145px;
  }

  &:nth-child(2) .separator {
    left: 126px;
  }
}

.category-layout {
  flex: 1;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 315px) 64px;
  align-items: stretch;
  gap: 8px;
  height: 100%;
  min-height: 0;
  padding: 30px 22px 10px;
  background: url('@/assets/imgs/echarts/合格证/kjl_bg.png') no-repeat 0 0;
  background-size: 455px 259px;
}

.pie-container {
  min-width: 0;
  height: 100%;
  min-height: 0;
  padding-top: 0;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 128px;
  min-height: 0;
  overflow-y: auto;
  align-self: start;
  margin-top: 38px;
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

.value {
  display: none;
}
</style>
