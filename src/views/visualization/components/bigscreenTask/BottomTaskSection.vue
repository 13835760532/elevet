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
import { computed, onMounted, ref } from 'vue';
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

const xData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const volumeTrend = ref<TaskVolumeTrendRespVO>({});
const riskTrend = ref<TaskRiskTrendRespVO>({});
const lineBase = {
  grid: { left: 42, right: 16, top: 16, bottom: 24 },
  tooltip: { trigger: 'axis' },
  legend: {
    right: 16,
    top: 0,
    textStyle: { color: '#8fb6da', fontSize: 11 }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xData,
    axisLabel: { color: '#8fb6da', fontSize: 11 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#8fb6da', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } }
  }
};

const getAxisData = (axis?: string[]) => (axis?.length ? axis : xData);
const normalizeSeries = (list: number[] | undefined, length: number) =>
  Array.from({ length }, (_, index) => Number(list?.[index] || 0));

const leftTrendXAxis = computed(() => getAxisData(volumeTrend.value.xaxis));
const sampleCounts = computed(() =>
  normalizeSeries(volumeTrend.value.sampleCounts, leftTrendXAxis.value.length)
);
const itemCounts = computed(() =>
  normalizeSeries(volumeTrend.value.itemCounts, leftTrendXAxis.value.length)
);
const rightTrendXAxis = computed(() => getAxisData(riskTrend.value.xaxis));
const samplePositiveRates = computed(() =>
  normalizeSeries(riskTrend.value.samplePositiveRates, rightTrendXAxis.value.length)
);
const itemPositiveRates = computed(() =>
  normalizeSeries(riskTrend.value.itemPositiveRates, rightTrendXAxis.value.length)
);

const leftTrendOption = computed(() => ({
  ...lineBase,
  xAxis: {
    ...lineBase.xAxis,
    data: leftTrendXAxis.value
  },
  legend: { ...lineBase.legend, data: ['样品批次', '检测项次'] },
  series: [
    {
      name: '样品批次',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: sampleCounts.value
    },
    {
      name: '检测项次',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#56e8ff', width: 2 },
      itemStyle: { color: '#56e8ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(86, 232, 255, 0.02)' }
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
    axisLabel: { color: '#8fb6da', formatter: '{value}%', fontSize: 11 }
  },
  legend: { ...lineBase.legend, data: ['样品阳性率', '检测项阳性率'] },
  series: [
    {
      name: '样品阳性率',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: samplePositiveRates.value
    },
    {
      name: '检测项阳性率',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#56e8ff', width: 2 },
      itemStyle: { color: '#56e8ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(86, 232, 255, 0.02)' }
        ])
      },
      data: itemPositiveRates.value
    }
  ]
}));

const loadVolumeTrend = async () => {
  try {
    const data = await getTaskVolumeTrend();
    volumeTrend.value = data || {};
  } catch (error) {
    console.error('加载检测任务量态势失败', error);
    volumeTrend.value = {};
  }
};

const loadRiskTrend = async () => {
  try {
    const data = await getTaskRiskTrend();
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
</script>

<style scoped lang="scss">
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}
</style>
