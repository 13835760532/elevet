<template>
  <div class="category-gauges">
    <Echart :options="lineOption" :height="248" width="100%" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Echart } from '@/components/Echart';
import { getCategoryRisk, type CategoryRiskRespVO } from '@/api/agri/dashboard';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config';
import { createBigScreenLineOption } from './chartOption';

const props = withDefaults(
  defineProps<{
    mode?: '检测量' | '阳性率';
  }>(),
  {
    mode: '检测量'
  }
);

const categoryRiskList = ref<CategoryRiskRespVO[]>([]);
const fallbackItems = [
  { name: '蔬菜', value: 450 },
  { name: '水果', value: 256 },
  { name: '禽畜', value: 378 },
  { name: '水产', value: 135 },
  { name: '茶叶', value: 627 }
];

const displayItems = computed(() =>
  categoryRiskList.value.length
    ? categoryRiskList.value.map((item, index) => ({
        name: item.category || '--',
        value:
          props.mode === '阳性率'
            ? Number(item.statValue || 0).toFixed(2)
            : Number(item.statValue || 0)
      }))
    : props.mode === '阳性率'
    ? fallbackItems.map((item) => ({ ...item, value: Number(49).toFixed(2) }))
    : fallbackItems
);

const suffix = computed(() => (props.mode === '阳性率' ? '%' : ''));
const lineOption = computed(() =>
  createBigScreenLineOption({
    labels: displayItems.value.map((item) => item.name),
    values: displayItems.value.map((item) => Number(item.value)),
    formatter: props.mode === '阳性率' ? '{value}%' : '{value}',
    rotate: 18,
    grid: { left: 36, right: 18, top: 20, bottom: 42 }
  })
);

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
  width: 100%;
  height: 248px;
}
</style>
