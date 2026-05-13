<template>
  <section class="bottom-section">
    <BigPanelCard class="big-panel-center" title="任务检测量态势" :bg-image="bottomBg">
      <Echart :options="leftTrendOption" :height="200" />
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="检测风险态势" :bg-image="bottomBg">
      <Echart :options="rightTrendOption" :height="200" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import bottomBg from '@/assets/imgs/echarts/检测任务/69.png';
import {
  getTaskRiskTrend,
  getTaskVolumeTrend,
  type TaskRiskTrendRespVO,
  type TaskVolumeTrendRespVO
} from '@/api/agri/dashboard/task';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const volumeTrend = ref<TaskVolumeTrendRespVO>({});
const riskTrend = ref<TaskRiskTrendRespVO>({});
const lineBase = {
  grid: { left: 52, right: 18, top: 20, bottom: 18 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' }
  },
  legend: {
    right: 16,
    top: 0,
    itemWidth: 10,
    itemHeight: 10,
    textStyle: { color: '#c0d7f2', fontSize: 11 }
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    data: [],
    axisLabel: { color: '#d5e6ff', fontSize: 12, margin: 12 },
    axisTick: {
      show: true,
      length: 7,
      lineStyle: { color: 'rgba(174, 197, 227, 0.35)' }
    },
    axisLine: { lineStyle: { color: 'rgba(140, 167, 196, 0.4)', width: 1.2 } }
  },
  yAxis: {
    type: 'value',
    splitNumber: 6,
    axisLabel: { color: '#b8cce4', fontSize: 12 },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(54, 114, 181, 0.22)', type: 'dashed' } }
  }
};

const getAxisData = (axis?: string[]) => (axis?.length ? axis : []);
const normalizeSeries = (list: number[] | undefined, length: number) =>
  Array.from({ length }, (_, index) => Number(list?.[index] || 0));

const formatMonthLabel = (month?: string) => {
  if (!month) return '--';
  const value = String(month).trim();
  const monthPart = value.split('-')[1];
  return monthPart ? `${Number(monthPart)}月` : value;
};

const leftTrendXAxis = computed(() => getAxisData(volumeTrend.value.xaxis).map((item) => formatMonthLabel(item)));
const sampleCounts = computed(() =>
  normalizeSeries(volumeTrend.value.sampleCounts, leftTrendXAxis.value.length)
);
const itemCounts = computed(() =>
  normalizeSeries(volumeTrend.value.itemCounts, leftTrendXAxis.value.length)
);
const rightTrendXAxis = computed(() => getAxisData(riskTrend.value.xaxis).map((item) => formatMonthLabel(item)));
const samplePositiveRates = computed(() =>
  normalizeSeries(riskTrend.value.samplePositiveRates, rightTrendXAxis.value.length)
);
const itemPositiveRates = computed(() =>
  normalizeSeries(riskTrend.value.itemPositiveRates, rightTrendXAxis.value.length)
);

const leftAxisMax = computed(() => {
  const maxValue = Math.max(...sampleCounts.value, ...itemCounts.value, 0);
  if (maxValue <= 0) return 10;
  return Math.ceil(maxValue / 10) * 10 + 10;
});

const rightAxisMax = computed(() => {
  const maxValue = Math.max(...samplePositiveRates.value, ...itemPositiveRates.value, 0);
  return Math.max(60, Math.ceil(maxValue / 10) * 10);
});

const leftTrendOption = computed(() => ({
  ...lineBase,
  xAxis: {
    ...lineBase.xAxis,
    data: leftTrendXAxis.value
  },
  yAxis: {
    ...lineBase.yAxis,
    max: leftAxisMax.value
  },
  legend: { ...lineBase.legend, data: ['样品批次', '检测项次'] },
  series: [
    {
      name: '样品批次',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#83d54b', width: 2 },
      itemStyle: { color: '#83d54b' },
      data: sampleCounts.value
    },
    {
      name: '检测项次',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#56e8ff', width: 2 },
      itemStyle: { color: '#56e8ff', borderColor: 'rgba(255,255,255,0.65)', borderWidth: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 232, 255, 0.45)' },
          { offset: 0.7, color: 'rgba(86, 232, 255, 0.12)' },
          { offset: 1, color: 'rgba(86, 232, 255, 0)' }
        ])
      },
      data: itemCounts.value
    }
  ]
}));

const rightTrendOption = computed(() => ({
  ...lineBase,
  xAxis: {
    ...lineBase.xAxis,
    data: rightTrendXAxis.value
  },
  yAxis: {
    ...lineBase.yAxis,
    max: rightAxisMax.value,
    axisLabel: { color: '#b8cce4', formatter: '{value}%', fontSize: 12 }
  },
  legend: { ...lineBase.legend, data: ['样品阳性率', '检测项阳性率'] },
  series: [
    {
      name: '样品阳性率',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#83d54b', width: 2 },
      itemStyle: { color: '#83d54b' },
      data: samplePositiveRates.value
    },
    {
      name: '检测项阳性率',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { color: '#56e8ff', width: 2 },
      itemStyle: { color: '#56e8ff', borderColor: 'rgba(255,255,255,0.65)', borderWidth: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 232, 255, 0.45)' },
          { offset: 0.7, color: 'rgba(86, 232, 255, 0.12)' },
          { offset: 1, color: 'rgba(86, 232, 255, 0)' }
        ])
      },
      data: itemPositiveRates.value
    }
  ]
}));

const loadVolumeTrend = async () => {
  try {
    const data = await getTaskVolumeTrend(getBigScreenQueryParams());
    volumeTrend.value = data || {};
  } catch (error) {
    console.error('加载检测任务量态势失败', error);
    volumeTrend.value = {};
  }
};

const loadRiskTrend = async () => {
  try {
    const data = await getTaskRiskTrend(getBigScreenQueryParams());
    riskTrend.value = data || {};
  } catch (error) {
    console.error('加载检测风险态势失败', error);
    riskTrend.value = {};
  }
};

onMounted(() => {
  loadVolumeTrend();
  loadRiskTrend();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadVolumeTrend();
  loadRiskTrend();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}
</style>
