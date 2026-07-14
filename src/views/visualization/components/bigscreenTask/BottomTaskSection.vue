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

const formatToChineseMonth = (ym?: any) => {
  if (ym === undefined || ym === null || ym === '') return '';
  const key = String(ym).trim();
  const parts = key.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = Number(parts[1]);
    return `${year}年${month}月`;
  }
  const m = key.replace('月', '');
  if (m && !isNaN(Number(m))) {
    return `${filterYear.value}年${Number(m)}月`;
  }
  return key;
};

const leftTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const rawMonth = params[0].axisValue;
  const formattedMonth = formatToChineseMonth(rawMonth);
  let html = `<div style="margin-bottom:6px;font-weight:600;color:#dff7ff;">${formattedMonth}</div>`;
  params.forEach((param: any) => {
    if (param.value !== undefined) {
      const marker = param.marker || '';
      const value = param.value;
      const unit = leftActiveTab.value === '样品量' ? '批次' : '项次';
      html += `<div style="display:flex;align-items:center;line-height:22px;gap:4px;">` +
        `<span>${marker}</span>` +
        `<span style="min-width:76px;color:rgba(228,235,245,0.82);">${leftActiveTab.value}:</span>` +
        `<strong style="color:#fff;font-family:DIN Alternate,Arial;font-weight:700;">${value}${unit}</strong></div>`;
    }
  });
  return html;
};

const rightTooltipFormatter = (params: any) => {
  if (!params || params.length === 0) return '';
  const rawMonth = params[0].axisValue;
  const formattedMonth = formatToChineseMonth(rawMonth);
  const index = monthLabels.value.indexOf(rawMonth);
  const isSampleRate = rightActiveTab.value === '样品阳性率';
  let html = `<div style="margin-bottom:6px;font-weight:600;color:#dff7ff;">${formattedMonth}</div>`;
  params.forEach((param: any) => {
    if (param.value !== undefined) {
      const marker = param.marker || '';
      const rate = param.value;
      if (isSampleRate) {
        const total = index !== -1 ? (sampleCounts.value[index] || 0) : 0;
        html += `<div style="display:flex;flex-direction:column;line-height:20px;font-size:13px;color:rgba(228,235,245,0.82);">` +
          `<div style="display:flex;align-items:center;gap:4px;">` +
            `<span>${marker}</span>` +
            `<span>样品总量:</span>` +
            `<strong style="color:#fff;font-family:DIN Alternate,Arial;font-weight:700;margin-left:4px;">${total}批次</strong>` +
          `</div>` +
          `<div style="margin-left:14px;color:rgba(228,235,245,0.82);">` +
            `阳性数量/样品总量 = <strong style="color:#fff;font-family:DIN Alternate,Arial;font-weight:700;">${rate}%</strong>` +
          `</div>` +
        `</div>`;
      } else {
        const total = index !== -1 ? (itemCounts.value[index] || 0) : 0;
        html += `<div style="display:flex;flex-direction:column;line-height:20px;font-size:13px;color:rgba(228,235,245,0.82);">` +
          `<div style="display:flex;align-items:center;gap:4px;">` +
            `<span>${marker}</span>` +
            `<span>检测项总量:</span>` +
            `<strong style="color:#fff;font-family:DIN Alternate,Arial;font-weight:700;margin-left:4px;">${total}项次</strong>` +
          `</div>` +
          `<div style="margin-left:14px;color:rgba(228,235,245,0.82);">` +
            `阳性数量/检测总量 = <strong style="color:#fff;font-family:DIN Alternate,Arial;font-weight:700;">${rate}%</strong>` +
          `</div>` +
        `</div>`;
      }
    }
  });
  return html;
};

const lineBase = {
  grid: { left: 48, right: 16, top: 28, bottom: 32 },
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
    axisLabel: { color: '#d5e6ff', fontSize: 10, margin: 8, rotate: 30 },
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

const totalSampleCount = computed(() => sumSeries(volumeTrend.value.sampleCounts || []));
const samplePositiveCount = computed(() => estimatePositiveCount(riskTrend.value.samplePositiveRates || [], volumeTrend.value.sampleCounts || []));
const totalSamplePositiveRate = computed(() => totalSampleCount.value ? Math.round((samplePositiveCount.value / totalSampleCount.value) * 100) : 0);

const totalItemCount = computed(() => sumSeries(volumeTrend.value.itemCounts || []));
const itemPositiveCount = computed(() => estimatePositiveCount(riskTrend.value.itemPositiveRates || [], volumeTrend.value.itemCounts || []));
const totalItemPositiveRate = computed(() => totalItemCount.value ? Math.round((itemPositiveCount.value / totalItemCount.value) * 100) : 0);

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
  seriesName: string,
  tooltipFormatter: any,
  formatter?: string
) => ({
  grid: { left: 48, right: 16, top: 28, bottom: 32 },
  tooltip: {
    ...lineBase.tooltip,
    formatter: tooltipFormatter
  },
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
      name: seriesName,
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
  return volumeTrend.value.xaxis || riskTrend.value.xaxis || []
})

const uniqueMonthsCount = computed(() => {
  return rawXaxis.value.length
})

const monthLabels = computed(() => {
  if (uniqueMonthsCount.value > 12) {
    const result = []
    const today = new Date()
    let year = today.getFullYear()
    let month = today.getMonth() // 0-indexed, 0是1月
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
  }
  return rawXaxis.value.map(item => {
    let key = String(item).trim()
    if (key.includes('-')) {
      const parts = key.split('-')
      const y = parts[0]
      const m = parts[1].replace('月', '').padStart(2, '0')
      return `${y}-${m}`
    }
    const m = key.replace('月', '').padStart(2, '0')
    return `${filterYear.value}-${m}`
  })
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
const leftTrendXAxis = computed(() => monthLabels.value)
const sampleCounts = computed(() =>
  mapTrendData(volumeTrend.value.xaxis || [], volumeTrend.value.sampleCounts || [])
)
const itemCounts = computed(() =>
  mapTrendData(volumeTrend.value.xaxis || [], volumeTrend.value.itemCounts || [])
)
const rightTrendXAxis = computed(() => monthLabels.value)
const samplePositiveRates = computed(() =>
  mapTrendData(riskTrend.value.xaxis || [], riskTrend.value.samplePositiveRates || [])
)
const itemPositiveRates = computed(() =>
  mapTrendData(riskTrend.value.xaxis || [], riskTrend.value.itemPositiveRates || [])
)

const currentLeftTrendData = computed(() =>
  leftActiveTab.value === '样品量' ? sampleCounts.value : itemCounts.value
)
const currentRightTrendData = computed(() =>
  rightActiveTab.value === '样品阳性率' ? samplePositiveRates.value : itemPositiveRates.value
)
const leftTrendEmpty = computed(
  () => leftTrendXAxis.value.length === 0
)
const rightTrendEmpty = computed(
  () => rightTrendXAxis.value.length === 0
)


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
  const color = '#56e8ff';
  return createTrendOption(leftTrendXAxis.value, currentLeftTrendData.value, leftAxisMax.value, color, leftActiveTab.value, leftTooltipFormatter);
});

const currentRightTrendOption = computed(() => {
  const color = '#56e8ff';
  return createTrendOption(
    rightTrendXAxis.value,
    currentRightTrendData.value,
    rightAxisMax.value,
    color,
    rightActiveTab.value,
    rightTooltipFormatter,
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
