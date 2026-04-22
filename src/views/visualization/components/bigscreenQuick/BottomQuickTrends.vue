<template>
  <section class="bottom-quick-trends">
    <BigPanelCard class="big-panel-center" title="快检量态势" :tabs="['阳性率量', '阳性率']" v-model:active-tab="leftTrendTab" :bg-image="bottomBg">
      <Echart :options="currentLeftTrendOption" :height="200" />
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="风险态势" :tabs="['自主检测样本量', '阳性率']" v-model:active-tab="rightTrendTab" :bg-image="bottomBg">
      <Echart :options="currentRightTrendOption" :height="200" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import bottomBg from '@/assets/imgs/echarts/检测任务/69.png';
import {
  getFastPositiveRateTrend,
  getFastSelfSampleTrend,
  type FastPositiveRateTrendRespVO,
  type FastSelfSampleTrendRespVO
} from '@/api/agri/dashboard/fast';

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const leftTrendTab = ref('阳性率量');
const rightTrendTab = ref('自主检测样本量');
const positiveRateTrend = ref<FastPositiveRateTrendRespVO>({});
const selfSampleTrend = ref<FastSelfSampleTrendRespVO>({});

const getAxisData = (axis?: string[]) => (axis?.length ? axis : months);
const normalizeSeries = <T extends number>(list: T[] | undefined, length: number) =>
  Array.from({ length }, (_, index) => Number(list?.[index] || 0));
const calcMax = (data: number[], fallback: number) => {
  const max = Math.max(...data, 0);
  if (!max) return fallback;
  return Math.ceil(max * 1.2);
};

const createTrendOption = (xAxisData: string[], data: number[], max: number, formatter?: string) => ({
  grid: { left: 40, right: 16, top: 18, bottom: 24 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xAxisData,
    axisLabel: { color: '#90b5da', fontSize: 11 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max,
    axisLabel: { color: '#90b5da', formatter: formatter || '{value}' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#4deaff', width: 2 },
      itemStyle: { color: '#48e8ff', borderColor: '#fff', borderWidth: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(72, 232, 255, 0.32)' },
          { offset: 1, color: 'rgba(72, 232, 255, 0.02)' }
        ])
      },
      data
    }
  ]
});

const positiveRateXAxis = computed(() => getAxisData(positiveRateTrend.value.xaxis));
const positiveRateData = computed(() =>
  normalizeSeries(positiveRateTrend.value.positiveRates, positiveRateXAxis.value.length)
);
const selfSampleXAxis = computed(() => getAxisData(selfSampleTrend.value.xaxis));
const selfSampleData = computed(() =>
  normalizeSeries(selfSampleTrend.value.sampleCounts, selfSampleXAxis.value.length)
);

const currentLeftTrendOption = computed(() =>
  leftTrendTab.value === '阳性率'
    ? createTrendOption(
        positiveRateXAxis.value,
        positiveRateData.value,
        Math.min(calcMax(positiveRateData.value, 60), 100),
        '{value}%'
      )
    : createTrendOption(
        months,
        [1000, 3200, 2500, 3500, 3900, 4400, 2500, 3200, 3150, 3500, 2650, 2520],
        6000
      )
);

const currentRightTrendOption = computed(() =>
  rightTrendTab.value === '阳性率'
    ? createTrendOption(months, [10, 28, 24, 33, 38, 42, 24, 29, 31, 34, 27, 25], 60, '{value}%')
    : createTrendOption(
        selfSampleXAxis.value,
        selfSampleData.value,
        calcMax(selfSampleData.value, 60000)
      )
);

const loadTrendData = async () => {
  try {
    const [positiveRateRes, selfSampleRes] = await Promise.all([
      getFastPositiveRateTrend(),
      getFastSelfSampleTrend()
    ]);
    positiveRateTrend.value = positiveRateRes || {};
    selfSampleTrend.value = selfSampleRes || {};
  } catch (error) {
    console.error('加载快速检测趋势数据失败', error);
    positiveRateTrend.value = {};
    selfSampleTrend.value = {};
  }
};

onMounted(() => {
  loadTrendData();
});
</script>

<style scoped lang="scss">
.bottom-quick-trends {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
}
</style>
