<template>
  <div class="category-gauges">
    <Echart :options="pieOption" :height="248" width="100%" />
    <div class="category-legend">
      <div class="legend-row" v-for="item in displayItems" :key="item.name">
        <span class="dot" :style="{ background: item.color }"></span>
        <span class="name">{{ item.name }}</span>
        <span class="value">{{ item.displayValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import { getCategoryRisk, type CategoryRiskRespVO } from '@/api/agri/dashboard';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config';

const props = withDefaults(
  defineProps<{
    mode?: '检测量' | '阳性率';
  }>(),
  {
    mode: '检测量'
  }
);

const categoryRiskList = ref<CategoryRiskRespVO[]>([]);
const categoryColors = ['#3f6dff', '#35d9db', '#91d64c', '#f2bc35', '#ff8a34', '#7d60ff'];

const displayItems = computed(() =>
  [...categoryRiskList.value]
    .map((item) => ({
      name: item.category || '--',
      value: Number(item.statValue || 0)
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: categoryColors[index % categoryColors.length],
      displayValue: props.mode === '阳性率' ? `${item.value.toFixed(2)}%` : `${item.value}`
    }))
);

const pieItems = computed(() => displayItems.value.filter((item) => item.value > 0));

const pieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: ({ name, value }: { name: string; value: number }) =>
      `${name}<br/>${props.mode === '阳性率' ? `${Number(value).toFixed(2)}%` : value}`
  },
  series: [
    {
      type: 'pie',
      radius: ['58%', '74%'],
      center: ['36%', '50%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderColor: 'rgba(7, 16, 38, 0.96)',
        borderWidth: 4,
        shadowBlur: 12,
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
}));

const loadCategoryRiskData = async () => {
  try {
    const data = await getCategoryRisk({
      ...getBigScreenQueryParams(),
      statType: props.mode === '阳性率' ? '2' : '1'
    });
    categoryRiskList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载农产品品类风险分布失败', error);
    categoryRiskList.value = [];
  }
};

watch(
  () => props.mode,
  () => {
    loadCategoryRiskData();
  }
);

onMounted(() => {
  loadCategoryRiskData();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadCategoryRiskData();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.category-gauges {
  height: 248px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px;
  align-items: center;
  gap: 8px;
}

.category-legend {
  height: 248px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 6px;
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
  grid-template-columns: 12px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  background: rgba(11, 44, 88, 0.45);
  border: 1px solid rgba(39, 110, 196, 0.35);

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .name {
    color: #bbdbfa;
    font-size: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value {
    color: #4ce9ff;
    font-weight: 700;
    font-size: 15px;
  }
}
</style>
