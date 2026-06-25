<template>
  <section class="bottom-quick-trends">
    <BigPanelCard class="big-panel-center panel-header-bottom" title="快检量态势" :tabs="['快检量', '阳性率']"
      v-model:active-tab="leftTrendTab" :bg-image="bottomBg">
      <div class="quick-trend-chart">
        <div class="positive-count-summary">
          <span v-if="leftTrendTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span>
        </div>
        <Echart :options="currentLeftTrendOption" :height="200" />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center panel-header-bottom" title="风险态势" :tabs="['自主检测样本量']" :bg-image="bottomBg">
      <Echart :options="currentRightTrendOption" :height="200" />
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
  getFastPositiveRateTrend,
  getFastSelfSampleTrend,
  type FastPositiveRateTrendRespVO,
  type FastSelfSampleTrendRespVO
} from '@/api/agri/dashboard/fast';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const leftTrendTab = ref('快检量');
const positiveRateTrend = ref<FastPositiveRateTrendRespVO>({});
const selfSampleTrend = ref<FastSelfSampleTrendRespVO>({});

const formatMonthLabel = (value?: string) => {
  if (!value) return '';
  const matched = value.match(/(\d{1,2})$/);
  return matched ? `${matched[1]}月` : value;
};
const getAxisData = (axis?: string[]) =>
  axis?.length ? axis.map((item) => formatMonthLabel(item) || item) : [];
const normalizeSeries = <T extends number>(list: T[] | undefined, length: number) =>
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
const calcMax = (data: number[], emptyMax: number) => {
  const max = Math.max(...data, 0);
  if (!max) return emptyMax;
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
    axisLabel: {
      color: '#90b5da',
      formatter: (value: number) => {
        if (formatter) {
          return formatter.replace('{value}', String(value));
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K`;
        }
        return String(value);
      }
    },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } }
  },
  series: [
    {
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#4deaff', width: 2 },
      itemStyle: { color: '#48e8ff', borderColor: '#fff', borderWidth: 1 },
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
      selfSampleXAxis.value,
      selfSampleData.value,
      calcMax(selfSampleData.value, 60000)
    )
);

const currentRightTrendOption = computed(() =>
  createTrendOption(
    selfSampleXAxis.value,
    selfSampleData.value,
    calcMax(selfSampleData.value, 60000)
  )
);

const loadTrendData = async () => {
  try {
    const [positiveRateRes, selfSampleRes] = await Promise.all([
      getFastPositiveRateTrend(getBigScreenQueryParams()),
      getFastSelfSampleTrend(getBigScreenQueryParams())
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

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadTrendData();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.bottom-quick-trends {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
}

.quick-trend-chart {
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
