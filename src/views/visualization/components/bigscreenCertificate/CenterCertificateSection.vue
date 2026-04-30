<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="合格证地区分布图" :tabs="['开具', '存证']" v-model:active-tab="mapTab" :bg-image="mapBg">
      <div class="map-area">
        <Map mode="certificate" :certificate-tab="mapTab" />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="合格证服务趋势图" :bg-image="trendBg">
      <div class="trend-head">{{ trendHead }}</div>
      <Echart :options="currentTrendOption" :height="210" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';

import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import Map from '../Map.vue';
import mapBg from '@/assets/imgs/echarts/合格证/Frame 57_bg.png';
import trendBg from '@/assets/imgs/echarts/合格证/Frame 59_bg.png';
import {
  getCertificateServiceTrend,
  type CertificateServiceTrendRespVO
} from '@/api/agri/dashboard/certificate';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const mapTab = ref('开具');
const trendData = ref<CertificateServiceTrendRespVO>({});

const defaultMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const normalizeSeries = (series?: number[], length = 12) => {
  const result = Array.from({ length }, (_, index) => Number(series?.[index] || 0));
  return result;
};

const createTrendOption = (
  xAxisData: string[],
  issueData: number[],
  storeData: number[],
  traceData: number[]
) => ({
  grid: { left: 45, right: 20, top: 14, bottom: 26 },
  tooltip: { trigger: 'axis' },
  legend: {
    right: 18,
    top: 0,
    textStyle: { color: '#8fb6da' },
    data: ['开具次数', '存证次数', '溯源次数']
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xAxisData,
    axisLabel: { color: '#8fb6da' },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#8fb6da' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } }
  },
  series: [
    {
      name: '开具次数',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#55e8ff' },
      lineStyle: { color: '#55e8ff', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(85, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(85, 232, 255, 0.02)' }
        ])
      },
      data: issueData
    },
    {
      name: '存证次数',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: storeData
    },
    {
      name: '溯源次数',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7d60ff', width: 2 },
      itemStyle: { color: '#7d60ff' },
      data: traceData
    }
  ]
});

const xAxisData = computed(() => {
  const axis = trendData.value.xaxis || [];
  return axis.length ? axis : defaultMonths;
});

const currentTrendOption = computed(() =>
  createTrendOption(
    xAxisData.value,
    normalizeSeries(trendData.value.issueCounts, xAxisData.value.length),
    normalizeSeries(trendData.value.verificationCounts, xAxisData.value.length),
    normalizeSeries(trendData.value.traceCounts, xAxisData.value.length)
  )
);

const trendHead = computed(() => {
  const axis = xAxisData.value;
  if (!axis.length) return '';
  return `${axis[0]} - ${axis[axis.length - 1]}`;
});

const loadTrendData = async () => {
  try {
    const data = await getCertificateServiceTrend(getBigScreenQueryParams());
    trendData.value = data || {};
  } catch (error) {
    console.error('加载合格证服务趋势失败', error);
    trendData.value = {};
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
.center-section {
  display: grid;
  grid-template-rows: 1fr 270px;
  gap: 12px;
  min-width: 0;
}

.map-area {
  position: relative;
  min-height: 0;
  flex: 1;
}

.map-legend {
  position: absolute;
  right: 16px;
  bottom: 22px;
  z-index: 2;
  min-width: 106px;
  padding: 6px 8px;
  background: rgba(4, 30, 66, 0.78);
  border: 1px solid rgba(63, 161, 255, 0.4);

  .legend-title {
    color: #67dfff;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #9abedf;
    font-size: 11px;
    margin-bottom: 1px;

    .dot {
      width: 8px;
      height: 8px;
    }
  }
}

.trend-head {
  text-align: right;
  padding: 2px 10px 0;
  color: #9ec2e5;
  font-size: 13px;
}
</style>
