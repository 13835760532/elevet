<template>
  <section class="bottom-section">
    <BigPanelCard
      class="big-panel-center"
      title="任务检测-接收任务工作动态"
      :tabs="['样品量', '检测量']"
      v-model:active-tab="leftActiveTab"
      :bg-image="bottomBg"
    >
      <div class="task-trend-chart">
        <Echart v-if="!leftTrendEmpty" :options="currentLeftTrendOption" :height="200" />
        <BigDataEmpty
          v-else
          title="暂无工作动态"
          description="当前筛选范围未返回任务工作动态"
          compact
        />
      </div>
    </BigPanelCard>

    <BigPanelCard
      class="big-panel-center"
      title="接收任务检测-风险态势"
      :tabs="['样品阳性率', '检测项阳性率']"
      v-model:active-tab="rightActiveTab"
      :bg-image="bottomBg"
    >
      <div class="task-trend-chart">
        <div v-if="!rightTrendEmpty" class="positive-count-summary">
          <span>阳性项次/总项次</span>
        </div>
        <Echart v-if="!rightTrendEmpty" :options="currentRightTrendOption" :height="200" />
        <BigDataEmpty
          v-else
          title="暂无风险态势"
          description="当前筛选范围未返回接收任务检测风险"
          compact
        />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import BigDataEmpty from '../bigscreen/BigDataEmpty.vue';
import bottomBg from '@/assets/imgs/echarts/检测任务/69.png';
import {
  getTaskRiskTrend,
  getTaskVolumeTrend,
  type TaskRiskTrendRespVO,
  type TaskVolumeTrendRespVO
} from '@/api/agri/dashboard/task';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const leftActiveTab = ref('样品量');
const rightActiveTab = ref('样品阳性率');
const volumeTrend = ref<TaskVolumeTrendRespVO>({});
const riskTrend = ref<TaskRiskTrendRespVO>({});

const lineBase = {
  grid: { left: 48, right: 16, top: 28, bottom: 18 },
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
    boundaryGap: false,
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
const sumSeries = (list?: number[]) => (list || []).reduce((total, item) => total + Number(item || 0), 0);
const estimatePositiveCount = (rates?: number[], totals?: number[], fallbackTotal = 0) => {
  if (rates?.length && totals?.length) {
    return Math.round(
      rates.reduce((total, rate, index) => total + (Number(totals[index] || 0) * Number(rate || 0)) / 100, 0)
    );
  }
  return Math.round((fallbackTotal * sumSeries(rates)) / Math.max(rates?.length || 0, 1) / 100);
};

const formatMonthLabel = (month?: string) => {
  if (!month) return '--';
  const value = String(month).trim();
  const monthPart = value.split('-')[1];
  return monthPart ? `${Number(monthPart)}月` : value;
};

const createTrendOption = (
  xAxisData: string[],
  data: number[],
  max: number,
  lineColor: string,
  formatter?: string
) => ({
  grid: { left: 48, right: 16, top: 28, bottom: 18 },
  tooltip: lineBase.tooltip,
  xAxis: {
    ...lineBase.xAxis,
    data: xAxisData
  },
  yAxis: {
    ...lineBase.yAxis,
    max,
    axisLabel: {
      ...lineBase.yAxis.axisLabel,
      formatter: (value: number) => {
        if (formatter) {
          return formatter.replace('{value}', String(value));
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K`;
        }
        return String(value);
      }
    }
  },
  series: [
    {
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: lineColor,
        width: 2,
        shadowBlur: 6,
        shadowColor: lineColor
      },
      itemStyle: {
        color: lineColor,
        borderColor: '#fff',
        borderWidth: 1,
        shadowBlur: 6,
        shadowColor: lineColor
      },
      data
    }
  ]
});

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

const currentLeftTrendData = computed(() =>
  leftActiveTab.value === '样品量' ? sampleCounts.value : itemCounts.value
);
const currentRightTrendData = computed(() =>
  rightActiveTab.value === '样品阳性率' ? samplePositiveRates.value : itemPositiveRates.value
);
const leftTrendEmpty = computed(
  () => leftTrendXAxis.value.length === 0 || !currentLeftTrendData.value.some((value) => Number(value || 0) > 0)
);
const rightTrendEmpty = computed(
  () => rightTrendXAxis.value.length === 0 || !currentRightTrendData.value.some((value) => Number(value || 0) > 0)
);


const leftAxisMax = computed(() => {
  const isSample = leftActiveTab.value === '样品量';
  const data = isSample ? sampleCounts.value : itemCounts.value;
  const maxValue = Math.max(...data, 0);
  if (maxValue <= 0) return 10;
  return Math.ceil(maxValue / 10) * 10 + 10;
});

const rightAxisMax = computed(() => {
  const isSampleRate = rightActiveTab.value === '样品阳性率';
  const data = isSampleRate ? samplePositiveRates.value : itemPositiveRates.value;
  const maxValue = Math.max(...data, 0);
  return Math.max(60, Math.ceil(maxValue / 10) * 10);
});

const currentLeftTrendOption = computed(() => {
  const isSample = leftActiveTab.value === '样品量';
  const color = isSample ? '#83d54b' : '#56e8ff';
  return createTrendOption(leftTrendXAxis.value, currentLeftTrendData.value, leftAxisMax.value, color);
});

const currentRightTrendOption = computed(() => {
  const isSampleRate = rightActiveTab.value === '样品阳性率';
  const color = isSampleRate ? '#83d54b' : '#56e8ff';
  return createTrendOption(
    rightTrendXAxis.value,
    currentRightTrendData.value,
    rightAxisMax.value,
    color,
    '{value}%'
  );
});

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

.task-trend-chart {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
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
</style>
