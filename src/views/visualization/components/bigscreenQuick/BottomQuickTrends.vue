<template>
  <section class="bottom-quick-trends">
    <BigPanelCard class="big-panel-center panel-header-bottom" title="检测量态势" :tabs="[]"
      v-model:active-tab="leftTrendTab" :bg-image="bottomBg">
      <div class="quick-trend-chart">
        <div class="positive-count-summary">
          <span v-if="leftTrendTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span>
        </div>
        <Echart :options="currentLeftTrendOption" :height="200" />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center panel-header-bottom" title="风险态势" :tabs="[]" :bg-image="bottomBg">
      <Echart :options="currentRightTrendOption" :height="200" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
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

const leftTrendTab = ref('检测量');
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
const calcMax = (data: number[], emptyMax: number) => {
  const max = Math.max(...data, 0);
  if (!max) return emptyMax;
  return Math.ceil(max * 1.2);
};

const createTrendOption = (
  xAxisData: string[],
  data: number[],
  max: number,
  formatter?: string,
  tooltipFormatter?: (params: any) => string,
  showDots = false
) => ({
  grid: { left: 40, right: 16, top: 18, bottom: 24 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: tooltipFormatter
  },
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
      symbolSize: showDots ? 8 : 6,
      showSymbol: showDots,
      showAllSymbol: showDots,
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
const positiveDetectionData = computed(() =>
  normalizeSeries(positiveRateTrend.value.detectionCounts, positiveRateXAxis.value.length)
);
const selfSampleXAxis = computed(() => getAxisData(selfSampleTrend.value.xaxis));
const selfSampleData = computed(() =>
  normalizeSeries(selfSampleTrend.value.sampleCounts, selfSampleXAxis.value.length)
);

const leftTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const dataIndex = params[0].dataIndex;
  const month = params[0].axisValue;
  const val = params[0].value !== undefined ? params[0].value : '--';

  // 阳性数量/检测总量
  const positiveCounts = positiveRateTrend.value.positiveCounts || [];
  const detectionCounts = positiveRateTrend.value.detectionCounts || [];
  const posVal = positiveCounts[dataIndex] !== undefined ? positiveCounts[dataIndex] : '--';
  const detVal = detectionCounts[dataIndex] !== undefined ? detectionCounts[dataIndex] : '--';

  return `${month}<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#4deaff;"></span>检测总量：${val}<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#ff7875;"></span>阳性数量/检测总量：${posVal}/${detVal}`;
};

const rightTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const dataIndex = params[0].dataIndex;
  const month = params[0].axisValue;
  const val = params[0].value !== undefined ? params[0].value : '--';

  // 阳性数量/检测总量
  const positiveCounts = positiveRateTrend.value.positiveCounts || [];
  const detectionCounts = positiveRateTrend.value.detectionCounts || [];
  const posVal = positiveCounts[dataIndex] !== undefined ? positiveCounts[dataIndex] : '--';
  const detVal = detectionCounts[dataIndex] !== undefined ? detectionCounts[dataIndex] : '--';

  return `${month}<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#4deaff;"></span>自主检测样本量：${val}批次<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#ff7875;"></span>阳性数量/检测总量：${posVal}/${detVal}`;
};

const currentLeftTrendOption = computed(() =>
  leftTrendTab.value === '阳性率'
    ? createTrendOption(
      positiveRateXAxis.value,
      positiveRateData.value,
      Math.min(calcMax(positiveRateData.value, 60), 100),
      '{value}%',
      leftTooltipFormatter,
      true // 显示圆点
    )
    : createTrendOption(
      positiveRateXAxis.value,
      positiveDetectionData.value,
      calcMax(positiveDetectionData.value, 60000),
      undefined,
      leftTooltipFormatter,
      true // 显示圆点
    )
);

// 右侧风险态势图表 - 圆点可点击，tooltip 显示阳性数量/检测总量
const currentRightTrendOption = computed(() =>
  createTrendOption(
    selfSampleXAxis.value,
    selfSampleData.value,
    calcMax(selfSampleData.value, 60000),
    undefined,
    rightTooltipFormatter,
    true // 显示圆点
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
