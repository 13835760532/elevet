<template>
  <section class="bottom-quick-trends">
    <BigPanelCard class="big-panel-center panel-header-bottom" title="检测量态势" :tabs="['样品总量', '检测项总量']"
      v-model:activeTab="leftTrendTab" :bg-image="bottomBg">
      <div class="quick-trend-chart">
        <div class="positive-count-summary">
          <span v-if="leftTrendTab === '样品总量'">样品总量</span>
          <span v-else>检测项总量</span>
        </div>
        <Echart v-if="!leftTrendEmpty" :options="currentLeftTrendOption" :height="200" />
        <BigDataEmpty
          v-else
          compact
          variant="line"
          title="暂无检测量态势"
          description="当前周期未返回检测量趋势"
        />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center panel-header-bottom" title="风险态势" :tabs="[]" :bg-image="bottomBg">
      <div class="quick-trend-chart">
        <div class="positive-count-summary">
          <span>阳性项次/总项次</span>
        </div>
        <Echart v-if="!rightTrendEmpty" :options="currentRightTrendOption" :height="200" />
        <BigDataEmpty
          v-else
          compact
          variant="line"
          title="暂无风险态势"
          description="当前周期未形成风险趋势"
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
  getFastPositiveRateTrend,
  getFastSelfSampleTrend,
  type FastPositiveRateTrendRespVO,
  type FastSelfSampleTrendRespVO
} from '@/api/agri/dashboard/fast';
import { getBigScreenConfig, getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const leftTrendTab = ref('样品总量');
const positiveRateTrend = ref<FastPositiveRateTrendRespVO>({});
const selfSampleTrend = ref<FastSelfSampleTrendRespVO>({});

const formatMonthLabel = (value?: string) => {
  if (!value) return '';
  const matched = value.match(/(\d{1,2})$/);
  return matched ? `${matched[1]}月` : value;
};
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
  grid: { left: 40, right: 16, top: 18, bottom: 32 },
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
    axisLabel: { color: '#90b5da', fontSize: 10, rotate: 30 },
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

const filterYear = computed(() => {
  const { startDate, endDate } = getBigScreenQueryParams()
  const currentYear = new Date().getFullYear()
  if (startDate && endDate) {
    const startYear = Number(startDate.split('-')[0])
    const endYear = Number(endDate.split('-')[0])
    if (Number.isFinite(startYear) && Number.isFinite(endYear)) {
      if (currentYear >= startYear && currentYear <= endYear) {
        return String(currentYear)
      }
      return String(endYear)
    }
  }
  if (startDate) {
    return startDate.split('-')[0]
  }
  return String(currentYear)
})

const rawXaxis = computed(() => {
  return positiveRateTrend.value.xaxis || selfSampleTrend.value.xaxis || []
})

const uniqueMonthsCount = computed(() => {
  return rawXaxis.value.length
})

const generateMonthRange = (startStr?: string, endStr?: string): string[] => {
  if (!startStr || !endStr) return []
  const result: string[] = []
  try {
    const startParts = startStr.split('-')
    const endParts = endStr.split('-')
    if (startParts.length < 2 || endParts.length < 2) return []

    let startY = Number(startParts[0])
    let startM = Number(startParts[1])
    const endY = Number(endParts[0])
    const endM = Number(endParts[1])

    if (Number.isNaN(startY) || Number.isNaN(startM) || Number.isNaN(endY) || Number.isNaN(endM)) {
      return []
    }

    let currentY = startY
    let currentM = startM

    let limit = 0
    while ((currentY < endY || (currentY === endY && currentM <= endM)) && limit < 120) {
      result.push(`${currentY}-${String(currentM).padStart(2, '0')}`)
      currentM++
      if (currentM > 12) {
        currentM = 1
        currentY++
      }
      limit++
    }
  } catch (e) {
    console.error('generateMonthRange error', e)
  }
  return result
}

const bigScreenConfig = ref(getBigScreenConfig())

const monthLabels = computed(() => {
  const startDate = bigScreenConfig.value.timeRange?.[0]
  const endDate = bigScreenConfig.value.timeRange?.[1]

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentYM = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  if (startDate && endDate) {
    const allMonths = generateMonthRange(startDate, endDate)
    if (allMonths.length > 0) {
      if (allMonths.length <= 12) {
        // 1. 不足 12 月 有多少显示多少
        return allMonths
      } else {
        const idx = allMonths.indexOf(currentYM)
        if (idx !== -1) {
          // 2. 跨度超 12 月且包含当前年月：只显示当前年往前的12个月的数据
          const startIdx = Math.max(0, idx - 11)
          return allMonths.slice(startIdx, idx + 1)
        } else {
          // 3. 跨度超 12 月但不含当前年月：截取选择终点月份往前12个月数据
          return allMonths.slice(-12)
        }
      }
    }
  }

  // 兜底逻辑：显示当前年往前的 12 个月
  const result = []
  let year = currentYear
  let month = now.getMonth() // 0-indexed, 0 is Jan
  for (let i = 0; i < 12; i++) {
    const mStr = String(month + 1).padStart(2, '0')
    result.unshift(`${year}-${mStr}`)
    month--
    if (month < 0) {
      month = 11
      year--
    }
  }
  return result
})

const mapTrendData = (xaxis: string[], seriesData: number[]) => {
  const dataMap = new Map()
  if (Array.isArray(xaxis)) {
    xaxis.forEach((item, index) => {
      let key = String(item).trim()
      if (key.includes('-')) {
        const parts = key.split('-')
        const y = parts[0]
        const m = parts[1].replace('月', '').padStart(2, '0')
        key = `${y}-${m}`
      } else {
        const m = key.replace('月', '').padStart(2, '0')
        key = `${filterYear.value}-${m}`
      }
      dataMap.set(key, Number(seriesData?.[index] || 0))
    })
  }
  return monthLabels.value.map(mLabel => dataMap.get(mLabel) || 0)
}

const formatToChineseMonth = (ym?: string) => {
  if (!ym) return '';
  const parts = ym.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = Number(parts[1]);
    return `${year}年${month}月`;
  }
  return ym;
};

const formattedXAxis = computed(() => monthLabels.value.map(item => formatToChineseMonth(item)))

const positiveRateXAxis = computed(() => monthLabels.value);
const positiveRateData = computed(() =>
  mapTrendData(positiveRateTrend.value.xaxis || [], positiveRateTrend.value.positiveRates || [])
);
const positiveDetectionData = computed(() =>
  mapTrendData(positiveRateTrend.value.xaxis || [], positiveRateTrend.value.detectionCounts || [])
);
const selfSampleXAxis = computed(() => monthLabels.value);
const selfSampleData = computed(() =>
  mapTrendData(selfSampleTrend.value.xaxis || [], selfSampleTrend.value.sampleCounts || [])
);

const mappedPositiveCounts = computed(() =>
  mapTrendData(positiveRateTrend.value.xaxis || [], positiveRateTrend.value.positiveCounts || [])
)
const mappedDetectionCounts = computed(() =>
  mapTrendData(positiveRateTrend.value.xaxis || [], positiveRateTrend.value.detectionCounts || [])
)

const leftTrendEmpty = computed(() =>
  leftTrendTab.value === '样品总量'
    ? selfSampleXAxis.value.length === 0
    : positiveRateXAxis.value.length === 0
);
const rightTrendEmpty = computed(() => positiveRateXAxis.value.length === 0);

const sampleTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const dataIndex = params[0].dataIndex;
  const month = formatToChineseMonth(params[0].axisValue);
  const val = params[0].value !== undefined ? params[0].value : '--';

  const posVal = mappedPositiveCounts.value[dataIndex] !== undefined ? mappedPositiveCounts.value[dataIndex] : '--';
  const detVal = mappedDetectionCounts.value[dataIndex] !== undefined ? mappedDetectionCounts.value[dataIndex] : '--';

  return `${month}<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#4deaff;"></span>样品总量：${val}批次<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#ff7875;"></span>阳性数量/检测总量：${posVal}/${detVal}`;
};

const detectionTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const dataIndex = params[0].dataIndex;
  const month = formatToChineseMonth(params[0].axisValue);
  const val = params[0].value !== undefined ? params[0].value : '--';

  const posVal = mappedPositiveCounts.value[dataIndex] !== undefined ? mappedPositiveCounts.value[dataIndex] : '--';
  const detVal = mappedDetectionCounts.value[dataIndex] !== undefined ? mappedDetectionCounts.value[dataIndex] : '--';

  return `${month}<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#4deaff;"></span>检测项总量：${val}项次<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#ff7875;"></span>阳性数量/检测总量：${posVal}/${detVal}`;
};

const riskTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const dataIndex = params[0].dataIndex;
  const month = formatToChineseMonth(params[0].axisValue);
  const val = params[0].value !== undefined ? params[0].value : '--';

  const posVal = mappedPositiveCounts.value[dataIndex] !== undefined ? mappedPositiveCounts.value[dataIndex] : '--';
  const detVal = mappedDetectionCounts.value[dataIndex] !== undefined ? mappedDetectionCounts.value[dataIndex] : '--';

  return `${month}<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#4deaff;"></span>检测阳性率：${val}%<br/>` +
    `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#ff7875;"></span>阳性数量/检测总量：${posVal}/${detVal}`;
};

const currentLeftTrendOption = computed(() =>
  leftTrendTab.value === '样品总量'
    ? createTrendOption(
      selfSampleXAxis.value,
      selfSampleData.value,
      calcMax(selfSampleData.value, 60000),
      undefined,
      sampleTooltipFormatter,
      true
    )
    : createTrendOption(
      positiveRateXAxis.value,
      positiveDetectionData.value,
      calcMax(positiveDetectionData.value, 60000),
      undefined,
      detectionTooltipFormatter,
      true
    )
);

const currentRightTrendOption = computed(() =>
  createTrendOption(
    positiveRateXAxis.value,
    positiveRateData.value,
    Math.min(calcMax(positiveRateData.value, 60), 100),
    '{value}%',
    riskTooltipFormatter,
    true
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
  bigScreenConfig.value = getBigScreenConfig();
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
