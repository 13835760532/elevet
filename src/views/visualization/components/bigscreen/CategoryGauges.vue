<template>
  <BigDataEmpty
    v-if="categoryEmpty"
    title="暂无品类数据"
    description="当前筛选范围未返回农产品类别风险"
    compact
  />
  <div v-else-if="mode === '阳性率'" class="category-rate-platforms">
    <div class="positive-count-summary" style="top: -8px; right: 12px;">
      <span>阳性项次/总项次</span>
    </div>
    <div class="rate-platform" v-for="(item, index) in ratePlatformItems" :key="item.name"
      :class="`platform-${index + 1}`">
      <div class="rate-value" :style="{ color: item.valueColor }">{{ item.displayValue }}</div>
      <div class="rate-name">{{ item.name }}</div>
      <div class="platform-base" aria-hidden="true">
        <img :src="platformImg" alt="" class="platform-img" />
      </div>
    </div>
  </div>
  <div v-else class="category-gauges">
    <div class="category-pie">
      <Echart :options="pieOption" :height="202" width="252px" />
    </div>
    <div class="category-legend">
      <div class="legend-row" v-for="item in displayItems" :key="item.name">
        <span class="dot" :style="{ background: item.color }"></span>
        <span class="name">{{ item.name }}</span>
        <span class="value" :style="{ color: item.valueColor }">{{ item.displayValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Echart } from '@/components/Echart'
import { getCategoryRisk, type CategoryRiskRespVO } from '@/api/agri/dashboard'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config'
import BigDataEmpty from './BigDataEmpty.vue'
import platformImg from '@/assets/imgs/new/a.png'

const props = withDefaults(
  defineProps<{
    mode?: '检测量' | '阳性率'
  }>(),
  {
    mode: '检测量'
  }
)

const categoryRiskList = ref<CategoryRiskRespVO[]>([])

const categoryColorMap: Record<string, { color: string; valueColor: string }> = {
  蔬菜: { color: '#3155f1', valueColor: '#188bf5' },
  水果: { color: '#2fd6d2', valueColor: '#4efafe' },
  畜禽: { color: '#8bc748', valueColor: '#81c340' },
  水产: { color: '#f0bb32', valueColor: '#e5b12f' },
  茶叶: { color: '#f0772c', valueColor: '#fea931' }
}

const categoryColors = ['#3155f1', '#2fd6d2', '#8bc748', '#f0bb32', '#f0772c', '#7d60ff']
const valueColors = ['#188bf5', '#4efafe', '#81c340', '#e5b12f', '#fea931', '#7d60ff']
const outerColors = ['#142246', '#0f3f40', '#314523', '#44351d', '#3f2a1d', '#241d45']
const rateValueColors = ['#188bf5', '#4efafe', '#81c340', '#e5b12f', '#ef7330']

const normalizeRateValue = (item: CategoryRiskRespVO) => {
  const statValue = Number(item.statValue)
  const positiveRate = Number(item.positiveRate)
  const rawValue =
    Number.isFinite(statValue) && statValue > 0 && statValue <= 100
      ? statValue
      : Number.isFinite(positiveRate)
        ? positiveRate
        : Number.isFinite(statValue)
          ? statValue
          : 0

  return rawValue > 0 && rawValue <= 1 ? rawValue * 100 : rawValue
}

const getStatValue = (item: CategoryRiskRespVO) => {
  if (props.mode === '阳性率') {
    return normalizeRateValue(item)
  }

  return Number(item.statValue ?? item.detectionCount ?? 0)
}

const displayItems = computed(() =>
  categoryRiskList.value
    .slice(0, 5)
    .map((item) => ({
      name: item.category || '--',
      value: getStatValue(item)
    }))
    .map((item, index) => ({
      ...item,
      color: categoryColorMap[item.name]?.color || categoryColors[index % categoryColors.length],
      valueColor:
        props.mode === '阳性率'
          ? rateValueColors[index % rateValueColors.length]
          : categoryColorMap[item.name]?.valueColor || valueColors[index % valueColors.length],
      displayValue: props.mode === '阳性率' ? `${Math.round(item.value)}%` : `${item.value}`
    }))
)

const ratePlatformItems = computed(() =>
  displayItems.value.slice(0, 5).map((item, index) => ({
    ...item,
    name: item.name,
    valueColor: rateValueColors[index % rateValueColors.length]
  }))
)

const categoryEmpty = computed(
  () => displayItems.value.length === 0 || displayItems.value.every((item) => Number(item.value || 0) <= 0)
)

const isEmptyPieData = computed(() =>
  displayItems.value.length > 0 && displayItems.value.every((item) => Number(item.value || 0) <= 0)
)

const pieItems = computed(() =>
  isEmptyPieData.value
    ? displayItems.value.map((item) => ({
      ...item,
      pieValue: 1
    }))
    : displayItems.value
      .filter((item) => item.value > 0)
      .map((item) => ({
        ...item,
        pieValue: item.value
      }))
)

const pieOption = computed(() => ({
  animation: false,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: ({ name }: { name: string }) => {
      const item = pieItems.value.find((pieItem) => pieItem.name === name)
      const realValue = Number(item?.value || 0)
      return `${name}<br/>${props.mode === '阳性率' ? `${realValue.toFixed(2)}%` : realValue}`
    }
  },
  series: [
    {
      type: 'pie',
      silent: true,
      radius: ['63%', '82%'],
      center: ['50%', '50%'],
      clockwise: true,
      minAngle: 18,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderColor: 'rgba(5, 9, 25, 0.96)',
        borderWidth: 4
      },
      emphasis: { disabled: true },
      data: pieItems.value.map((item, index) => ({
        name: item.name,
        value: item.pieValue,
        itemStyle: {
          color: outerColors[index % outerColors.length]
        }
      }))
    },
    {
      type: 'pie',
      radius: ['38%', '62%'],
      center: ['50%', '50%'],
      clockwise: true,
      minAngle: 18,
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderColor: 'rgba(5, 9, 25, 0.96)',
        borderWidth: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(0, 179, 237, 0.16)'
      },
      data: pieItems.value.map((item) => ({
        name: item.name,
        value: item.pieValue,
        itemStyle: {
          color: item.color
        }
      }))
    }
  ]
}))

const loadCategoryRiskData = async () => {
  try {
    const data = await getCategoryRisk({
      ...getBigScreenQueryParams(),
      statType: props.mode === '阳性率' ? '2' : '1'
    })
    categoryRiskList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载农产品品类风险分布失败', error)
    categoryRiskList.value = []
  }
}

watch(
  () => props.mode,
  () => {
    loadCategoryRiskData()
  }
)

onMounted(() => {
  loadCategoryRiskData()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadCategoryRiskData()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.category-gauges {
  height: 226px;
  display: grid;
  grid-template-columns: 252px 119px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 22px 12px 24px;
}

.category-rate-platforms {
  position: relative;
  height: 226px;
  padding: 0 32px 10px;
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

.rate-platform {
  position: absolute;
  width: 112px;
  height: 112px;
  text-align: center;

  &.platform-1 {
    left: 44px;
    top: 10px;
  }

  &.platform-2 {
    left: 168px;
    top: 10px;
  }

  &.platform-3 {
    left: 292px;
    top: 10px;
  }

  &.platform-4 {
    left: 102px;
    top: 122px;
  }

  &.platform-5 {
    left: 236px;
    top: 122px;
  }
}

.rate-value {
  position: relative;
  z-index: 3;
  height: 28px;
  font-family: 'DIN Alternate', 'Source Sans 3', sans-serif;
  font-size: 29px;
  line-height: 28px;
  font-weight: 700;
  text-shadow: 0 0 12px currentColor;
}

.rate-name {
  position: relative;
  z-index: 3;
  color: rgba(224, 239, 239, 0.86);
  font-size: 16px;
  line-height: 20px;
  text-shadow: 0 0 8px rgba(111, 194, 255, 0.55);
}

.platform-base {
  position: absolute;
  left: 50%;
  top: 42px;
  width: 82px;
  height: 82px;
  transform: translateX(-50%);
  margin-top: -20px;
}

.platform-img {
  width: 82px;
  height: 82px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(42, 235, 255, 0.5));
}

.category-pie {
  width: 252px;
  height: 202px;
  min-width: 252px;
}

.category-legend {
  height: 160px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: visible;
  padding-right: 0;
}

.category-legend::-webkit-scrollbar {
  width: 6px;
}

.category-legend::-webkit-scrollbar-thumb {
  background: rgba(76, 233, 255, 0.35);
  border-radius: 999px;
}

.category-legend::-webkit-scrollbar-track {
  background: rgba(9, 26, 52, 0.35);
}

.legend-row {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 119px;
  height: 24px;
  padding: 0 12px;
  background: rgba(39, 49, 59, 0.72);
  border: none;

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 0;
  }

  .name {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    line-height: 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value {
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
  }
}
</style>
