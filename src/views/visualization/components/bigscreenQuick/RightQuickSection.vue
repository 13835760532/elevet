<template>
  <section class="right-quick-section">
    <BigPanelCard title="快速检测分析" :tabs="['检测量', '阳性率']" v-model:active-tab="topTab" :bg-image="rightBg">
      <div class="right-block">
        <p class="block-title">检测农产品高风险top</p>
        <Echart :options="currentTopColumnOption" :height="200" />
      </div>
    </BigPanelCard>

    <BigPanelCard title="产品·检测项目高风险top" :tabs="['检测项阳性率']" active-tab="检测项阳性率" :bg-image="rightBg">
      <Echart :options="middleBarOption" :height="290" />
    </BigPanelCard>

    <BigPanelCard title="检测项高风险top" :tabs="['检测项阳性率']" active-tab="检测项阳性率" :bg-image="rightBg">
      <Echart :options="bottomBarOption" :height="290" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import rightBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';
import {
  getFastCategoryTop10,
  getFastCategoryPesticideTop10,
  getFastPesticideTop10,
  type FastCategoryTopRespVO,
  type FastCategoryPesticideTopRespVO,
  type FastPesticideTopRespVO
} from '@/api/agri/dashboard/fast';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const topTab = ref('检测量');
const categoryTop10 = ref<FastCategoryTopRespVO[]>([]);
const categoryPesticideTop10 = ref<FastCategoryPesticideTopRespVO[]>([]);
const pesticideTop10 = ref<FastPesticideTopRespVO[]>([]);

const createTopColumnOption = (
  names: string[],
  values: number[],
  max: number,
  formatter?: (value: number) => string
) => ({
  grid: { left: 34, right: 14, top: 18, bottom: 30 },
  xAxis: {
    type: 'category',
    data: names,
    axisLabel: { color: '#86abd0', fontSize: 9, interval: 0, rotate: 0 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max,
    interval: max <= 1 ? 0.2 : 100,
    axisLabel: { color: '#86abd0', formatter },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.32)', type: 'dashed' } }
  },
  series: [
    {
      type: 'bar',
      barWidth: 9,
      barCategoryGap: '36%',
      data: values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: 'rgba(72, 231, 255, 0.15)' }
        ])
      }
    }
  ]
});

const productNames = computed(() =>
  categoryPesticideTop10.value.length
    ? categoryPesticideTop10.value.map((item) => item.combineName || '--')
    : ['丝瓜-甲氨基', '地瓜-阿维菌素', '四季豆-倍硫磷', '南瓜-氟虫腈', '西瓜-氟虫腈', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱']
);
const productValues = computed(() =>
  categoryPesticideTop10.value.length
    ? categoryPesticideTop10.value.map((item) => Number(item.positiveRate || 0))
    : [500, 400, 350, 300, 250, 200, 150, 150, 100, 100]
);
const categoryNames = computed(() =>
  categoryTop10.value.length
    ? categoryTop10.value.map((item) => item.category || '--')
    : ['1.生姜', '2.白菜', '3.黄瓜', '4.南瓜', '5.丝瓜', '6.芹菜', '7.萝卜', '8.韭菜', '9.波菜', '10.芹菜']
);
const categoryValues = computed(() =>
  categoryTop10.value.length
    ? categoryTop10.value.map((item) => Number(item.statValue || 0))
    : [420, 390, 360, 340, 320, 300, 280, 240, 190, 150]
);
const itemNames = computed(() =>
  pesticideTop10.value.length
    ? pesticideTop10.value.map((item) => item.pesticideName || '--')
    : ['甲氨基', '维菌素', '倍硫磷', '氟虫腈', '氟虫腈', '毒死蜱', '毒死蜱', '毒死蜱', '毒死蜱', '毒死蜱']
);
const itemValues = computed(() =>
  pesticideTop10.value.length
    ? pesticideTop10.value.map((item) => Number(item.positiveRate || 0))
    : productValues.value
);

const makeHorizontalOption = (names: string[], values: number[]) => ({
  grid: { left: 96, right: 24, top: 12, bottom: 20 },
  xAxis: {
    type: 'value',
    min: 0,
    max: Math.min(Math.max(...values, 10) * 1.2, 100),
    interval: undefined,
    axisLabel: { color: '#80abd3', formatter: '{value}%' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: [
    {
      type: 'category',
      inverse: true,
      data: names,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#d4ebff', fontSize: 12 }
    },
    {
      type: 'category',
      inverse: true,
      position: 'right',
      data: values,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#48e7ff',
        fontSize: 12,
        fontWeight: 700,
        formatter: (val: number) => `${Number(val).toFixed(2)}%`
      }
    }
  ],
  series: [
    {
      type: 'bar',
      barWidth: 10,
      data: values,
      itemStyle: {
        borderRadius: [0, 7, 7, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#49e8ff' },
          { offset: 1, color: '#1d56d9' }
        ])
      },
      barGap: '32%'
    }
  ]
});

const middleBarOption = computed(() => makeHorizontalOption(productNames.value, productValues.value));
const bottomBarOption = computed(() => makeHorizontalOption(itemNames.value, itemValues.value));
const currentTopColumnOption = computed(() =>
  topTab.value === '阳性率'
    ? createTopColumnOption(
        categoryNames.value,
        categoryValues.value,
        Math.min(Math.max(...categoryValues.value, 1) * 1.2, 100),
        (val: number) => `${Number(val).toFixed(2)}%`
      )
    : createTopColumnOption(
        categoryNames.value,
        categoryValues.value,
        Math.max(...categoryValues.value, 500)
      )
);

const loadCategoryTop10 = async () => {
  try {
    const data = await getFastCategoryTop10({
      ...getBigScreenQueryParams(),
      statType: topTab.value === '阳性率' ? '2' : '1'
    });
    categoryTop10.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载农产品品类 TOP10 失败', error);
    categoryTop10.value = [];
  }
};

const loadPesticideTop10 = async () => {
  try {
    const data = await getFastPesticideTop10(getBigScreenQueryParams());
    pesticideTop10.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载检测项 TOP10 失败', error);
    pesticideTop10.value = [];
  }
};

const loadCategoryPesticideTop10 = async () => {
  try {
    const data = await getFastCategoryPesticideTop10(getBigScreenQueryParams());
    categoryPesticideTop10.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载产品品类-检测项 TOP10 失败', error);
    categoryPesticideTop10.value = [];
  }
};

onMounted(() => {
  loadCategoryTop10();
  loadCategoryPesticideTop10();
  loadPesticideTop10();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadCategoryTop10();
  loadCategoryPesticideTop10();
  loadPesticideTop10();
});

onUnmounted(() => {
  disposeRefresh();
});

watch(topTab, () => {
  loadCategoryTop10();
});
</script>

<style scoped lang="scss">
.right-quick-section {
  display: grid;
  grid-template-rows: 280px 1fr 1fr;
  gap: 10px;
  min-height: 0;
}

.right-block {
  .block-title {
    margin: 0 0 4px;
    color: #9ec2e5;
    font-size: 14px;
    font-weight: 700;
  }
}

:deep(.panel-body) {
  padding: 10px 10px 8px;
}
</style>
