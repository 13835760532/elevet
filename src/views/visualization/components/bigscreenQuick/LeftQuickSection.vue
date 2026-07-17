<template>
  <section class="left-section">

    <BigPanelCard title="快速检测概况" :bg-image="leftBg">
      <template #title-extra>
        <el-tooltip placement="bottom-end" popper-class="bigscreen-quick-tooltip" effect="dark">
          <template #content>
            <div class="tooltip-text-content">
              样品总量：本机构“任务执行抽样量+自主检测抽样量”；<br />
              检测总量：本机构“任务执行+自主检测”的全部样品检测项总量；<br />
              检测阳性率：本机构全部样品检测项的阳性率，即“检测项阳性量/检测总量”；<br />
              任务完成量：本机构执行任务的“抽样数量”；<br />
              任务完成率：本机构“任务完成量/任务接收量”；<br />
              快速检测（本机构执行检测数据）
            </div>
          </template>
          <span class="question-icon">?</span>
        </el-tooltip>
      </template>
      <div class="subject-grid">
        <div class="subject-item" v-for="(item, index) in overviewData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value }}</span>
              <!-- 全息投影效果 -->
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <!-- 分隔线 -->
          <div v-if="index < overviewData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="快检覆盖范围" :bg-image="leftBg">
      <div class="cover-flex">
        <div class="cover-dial" v-for="(item, index) in subjectData" :key="item.label">
          <div class="dial-wrap">
            <div class="dial-outer"></div>
            <img :src="item.icon" class="dial-icon" />
          </div>
          <div class="dial-info">
            <p class="label">{{ item.label }}</p>
            <p class="value">{{ item.value }}</p>
          </div>
          <div v-if="index === 0" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="快检产品品类" :bg-image="leftBg">
      <BigDataEmpty
        v-if="categoryEmpty"
        variant="donut"
        title="暂无品类数据"
        description="当前范围未形成快检产品品类分布"
      />
      <div v-else class="category-layout">
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
import { Echart } from '@/components/Echart'
import BigPanelCard from '../bigscreen/BigPanelCard.vue'
import BigDataEmpty from '../bigscreen/BigDataEmpty.vue'
import leftBg from '@/assets/imgs/echarts/合格证/Frame 58_bg.png'
import iconOrg from '@/assets/imgs/echarts/检测任务/68.png'
import iconFactory from '@/assets/imgs/echarts/检测任务/69.png'
import {
  getFastCategoryDistribution,
  getFastOverview,
  type DashboardFastOverviewRespVO,
  type FastCategoryDistributionRespVO
} from '@/api/agri/dashboard/fast'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config'

const overview = ref<DashboardFastOverviewRespVO>({})
const categoryDistribution = ref<FastCategoryDistributionRespVO[]>([])
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
  {
    label: '样品批次',
    value: Number(overview.value.sampleBatchCount || 0),
    unit: '',
    type: 'blue'
  },
  {
    label: '检测项次',
    value: Number(overview.value.detectionItemCount || 0),
    unit: '',
    type: 'green'
  },
  {
    label: '检测项阳性率',
    value: Number(overview.value.itemPositiveRate || 0),
    unit: '%',
    type: 'cyan'
  }
])

const subjectData = computed(() => [
  { label: '生产经营主体', value: Number(overview.value.enterpriseCount || 0), icon: iconOrg },
  { label: '农产品品种', value: Number(overview.value.productVarietyCount || 0), icon: iconFactory }
])

type CategoryDistributionResponse =
  | FastCategoryDistributionRespVO[]
  | {
    list?: FastCategoryDistributionRespVO[]
    rows?: FastCategoryDistributionRespVO[]
    records?: FastCategoryDistributionRespVO[]
    data?: FastCategoryDistributionRespVO[] | { list?: FastCategoryDistributionRespVO[] }
  }

const normalizeCategoryDistribution = (data: CategoryDistributionResponse | null | undefined) => {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  const candidates = [
    data.list,
    data.rows,
    data.records,
    Array.isArray(data.data) ? data.data : undefined,
    !Array.isArray(data.data) ? data.data?.list : undefined
  ]
  return (
    candidates.find((item): item is FastCategoryDistributionRespVO[] => Array.isArray(item)) || []
  )
}

const getCategoryName = (item: FastCategoryDistributionRespVO) =>
  item.category ||
  item.categoryName ||
  item.productCategoryName ||
  item.productCategory ||
  item.categoryTypeName ||
  item.typeName ||
  item.label ||
  item.name ||
  '--'

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') return 0
  const normalized = typeof value === 'string' ? value.replace(/,/g, '') : value
  const numericValue = Number(normalized)
  return Number.isFinite(numericValue) ? numericValue : 0
}

const getCategoryValue = (item: FastCategoryDistributionRespVO) => {
  const value =
    item.sampleCount ??
    item.detectionCount ??
    item.count ??
    item.statValue ??
    item.value ??
    item.total ??
    item.totalCount ??
    item.sampleNum ??
    item.quantity ??
    item.num ??
    0
  return toNumber(value)
}

/** 加载快速检测概览指标，异常时清空数据但保留面板结构。 */
const loadOverview = async () => {
  try {
    const data = await getFastOverview(getBigScreenQueryParams())
    overview.value = data || {}
  } catch (error) {
    console.error('加载快速检测概览失败', error)
    overview.value = {}
  }
}

const categoryItems = computed(() =>
  [...categoryDistribution.value]
    .map((item) => ({
      name: getCategoryName(item),
      value: getCategoryValue(item)
    }))
    .filter((item) => item.name !== '--')
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: categoryColors[index % categoryColors.length]
    }))
)

const pieItems = computed(() => categoryItems.value.filter((item) => item.value > 0))
const categoryEmpty = computed(() => pieItems.value.length === 0)

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
      radius: ['58%', '74%'],
      center: ['50%', '54%'],
      silent: true,
      z: 0,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderColor: 'rgba(7, 16, 38, 0.96)',
        borderWidth: 5,
        opacity: 0.22,
        shadowBlur: 10,
        shadowColor: 'rgba(33, 151, 255, 0.38)'
      },
      data: pieItems.value.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color
        }
      }))
    },
    {
      type: 'pie',
      radius: ['38%', '58%'],
      center: ['50%', '54%'],
      minAngle: 6,
      avoidLabelOverlap: true,
      z: 2,
      label: {
        show: true,
        color: '#d6eefe',
        fontSize: 13,
        formatter: (params: { name: string; value: number; dataIndex: number }) =>
          params.value > 0
            ? `{name|${params.name}}\n{value${params.dataIndex}|${params.value}}`
            : '',
        rich: {
          name: { color: '#d6eefe', fontSize: 13, lineHeight: 17, fontWeight: 700 },
          ...Object.fromEntries(
            pieItems.value.map((item, index) => [
              `value${index}`,
              { color: item.color, fontSize: 13, lineHeight: 17, fontWeight: 700 }
            ])
          )
        }
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 15,
        lineStyle: { color: 'rgba(232, 244, 255, 0.92)', width: 1.5 }
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
          color: item.color
        },
        labelLine: {
          lineStyle: { color: 'rgba(232, 244, 255, 0.92)' }
        }
      }))
    }
  ]
}))

/** 加载快速检测品类分布，并兼容接口返回数组或包装对象两种结构。 */
const loadCategoryDistribution = async () => {
  try {
    const data = await getFastCategoryDistribution(getBigScreenQueryParams())
    categoryDistribution.value = normalizeCategoryDistribution(data as CategoryDistributionResponse)
  } catch (error) {
    console.error('加载快速检测品类分布失败', error)
    categoryDistribution.value = []
  }
}

onMounted(() => {
  loadOverview()
  loadCategoryDistribution()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadOverview()
  loadCategoryDistribution()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 210px 210px minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 10px 4px;
}

.overview-card {
  position: relative;
  height: 100px;
  background: rgba(14, 39, 90, 0.4);
  border: 1px solid rgba(37, 137, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  .corner-mark {
    position: absolute;
    width: 14px;
    height: 14px;

    &.top-left {
      top: 0;
      left: 0;
      border-top: 2px solid var(--theme-color);
      border-left: 2px solid var(--theme-color);
    }

    &.bottom-right {
      bottom: 0;
      right: 0;
      border-bottom: 2px solid var(--theme-color);
      border-right: 2px solid var(--theme-color);
    }
  }

  .card-inner {
    width: 100%;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card-label {
    font-size: 16px;
    color: #9ec2e6;
    margin-bottom: 6px;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(158, 194, 230, 0.3);
    margin-left: 10px;
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-box {
    width: 44px;

    img {
      width: 100%;
      height: auto;
    }
  }

  .num-box {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .value-text {
      font-family: 'DIN Alternate', 'Inter', sans-serif;
      font-size: 34px;
      font-weight: 800;
      background: linear-gradient(to bottom, #ffffff 30%, var(--theme-light-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 8px var(--theme-glow-color));
      line-height: 1;
      margin-left: 0px;
    }

    .unit-text {
      font-size: 16px;
      color: #9ec2e6;
      opacity: 0.8;
    }
  }

  // 主题配色
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
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 18px;
}

.subject-item {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;

  .item-inner {
    width: 100%;
    text-align: center;
  }

  .label {
    margin: 0;
    color: #a7caea;
    font-size: 15px;
    margin-bottom: 8px;
  }

  .value-container {
    position: relative;
    padding-bottom: 25px;

    .value {
      color: #7feaff;
      font-size: 38px;
      line-height: 1;
      font-weight: 700;
      font-family: 'DIN Alternate', sans-serif;
      text-shadow: 0 0 10px rgba(127, 234, 255, 0.5);
    }

    .holographic-img {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 50px;
      pointer-events: none;
    }
  }
}

.separator {
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent);
  position: absolute;
  right: 0;
  top: 20px;
}

.hologram-effect {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 40px;
  pointer-events: none;

  .light-beam {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    background: radial-gradient(ellipse at bottom, rgba(0, 218, 255, 0.35) 0%, transparent 70%);
    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
  }

  .pedestal {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%) rotateX(65deg);
    width: 60px;
    height: 60px;

    .ring-1 {
      position: absolute;
      inset: 0;
      border: 2px solid rgba(0, 218, 255, 0.8);
      border-radius: 50%;
      box-shadow:
        0 0 15px rgba(0, 218, 255, 0.6),
        inset 0 0 10px rgba(0, 218, 255, 0.4);
    }

    .ring-2 {
      position: absolute;
      inset: 8px;
      border: 1px solid rgba(0, 218, 255, 0.4);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 218, 255, 0.2) 0%, transparent 80%);
    }
  }
}

.category-layout {
  display: grid;
  grid-template-columns: 220px 126px;
  justify-content: center;
  align-items: center;
  gap: 22px;
  height: 100%;
  min-height: 0;
  padding: 4px 22px 8px;
}

.pie-container {
  justify-self: center;
  align-self: center;
  min-width: 0;
  width: 220px;
  height: 220px;
  max-height: 100%;
  min-height: 0;
}

.category-legend {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
  padding: 0;
  gap: 10px;
  height: auto;
  max-height: 200px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}

.legend-row {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  min-height: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 0;
  box-shadow: 0 0 8px rgba(87, 226, 255, 0.22);
}

.name {
  min-width: 0;
  color: #cdd9df;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-row .value {
  display: none;
  color: #57e2ff;
  font-family: 'DIN Alternate', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
}

.cover-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
}

.cover-dial {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  padding-top: 20px;

  .dial-wrap {
    position: relative;
    width: 80px;
    height: 80px;

    .dial-outer {
      position: absolute;
      inset: -4px;
      border: 2px dashed rgba(58, 226, 255, 0.4);
      border-radius: 50%;
      animation: dialRotate 10s linear infinite;
    }

    .dial-inner {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(14, 39, 90, 0.6) 0%, rgba(7, 20, 50, 0.9) 100%);
      border: 2px solid rgba(58, 226, 255, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(58, 226, 255, 0.3);

      &::after {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(58, 226, 255, 0.2);
        border-radius: 50%;
      }
    }

    .dial-icon {
      width: 80px;
      height: 80px;
      z-index: 2;
      filter: drop-shadow(0 0 5px rgba(58, 226, 255, 0.5));
    }
  }

  .dial-info {
    .label {
      margin: 0;
      color: #9ebfe0;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .value {
      margin: 0;
      color: #7ce9ff;
      font-family: 'DIN Alternate', sans-serif;
      font-size: 38px;
      font-weight: 700;
      line-height: 1;
    }
  }

  .dial-separator {
    width: 1px;
    height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
    position: absolute;
    right: -20px;
  }
}

.question-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 6px;
  line-height: 1;
  transition: all 0.2s ease;
  user-select: none;
}

.question-icon:hover {
  border-color: #57e2ff;
  color: #57e2ff;
  background: rgba(87, 226, 255, 0.1);
}
</style>

<style lang="scss">
.bigscreen-quick-tooltip.el-popper {
  background: rgba(6, 18, 42, 0.96) !important;
  border: 1px solid rgba(87, 226, 255, 0.45) !important;
  color: #dff7ff !important;
  --el-bg-color-overlay: rgba(6, 18, 42, 0.96) !important;
  --el-border-color-light: rgba(87, 226, 255, 0.45) !important;

  .tooltip-text-content {
    font-size: 14px;
    line-height: 1.8;
    color: #dff7ff !important;
    font-family: sans-serif;
  }
}
</style>
