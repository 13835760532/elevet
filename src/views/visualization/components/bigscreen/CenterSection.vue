<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="覆盖群体">
      <div class="coverage-metrics">
        <div class="metric-card" v-for="item in topMetrics" :key="item.label">
          <div class="pedestal-wrap">
            <img :src="item.img" class="metric-icon" />
          </div>
          <div class="meta">
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>

      <div class="map-area">
        <div class="left-stats">
          <div class="stat-item" v-for="item in sideStats" :key="item.label">
            <div class="stat-content">
              <span class="stat-label">{{ item.label }}</span>
              <span class="stat-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        <Map />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="检测量动态 | 阳性率态势(检测项)" :tabs="['检测量', '阳性率']" v-model:active-tab="trendTab"
      :bg-image="trendBg">
      <Echart :options="currentLineTrendOption" :height="260" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from './BigPanelCard.vue';
import Map from '../Map.vue';
import trendBg from '@/assets/imgs/echarts/首页/jcdtl_bg.png';
import {
  getDashboardOverview,
  getDashboardTrend,
  type DashboardOverviewRespVO,
  type TrendRespVO
} from '@/api/agri/dashboard';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config';

import n1 from '@/assets/imgs/echarts/首页/fgqt1.png';
import n2 from '@/assets/imgs/echarts/首页/fgqt2.png';
import n3 from '@/assets/imgs/echarts/首页/fgqt3.png';

const trendTab = ref('检测量');
const trendData = ref<TrendRespVO[]>([]);
const overview = ref<DashboardOverviewRespVO>({});

const topMetrics = computed(() => [
  { img: n1, label: '监管机构', value: Number(overview.value.supervisorCount || 0) },
  { img: n2, label: '检测机构', value: Number(overview.value.detectionOrgCount || 0) },
  { img: n3, label: '生产经营主体', value: Number(overview.value.enterpriseCount || 0) }
]);

const sideStats = computed(() => [
  { label: '任务下发项次', value: `${Number(overview.value.taskIssuedCount || 0)}` },
  { label: '任务完成项次', value: `${Number(overview.value.taskCompletedCount || 0)}` },
  { label: '任务完成率', value: `${Number(overview.value.taskCompletionRate || 0).toFixed(2)}%` },
  { label: '检测样品量', value: `${Number(overview.value.sampleCount || 0)}` },
  { label: '检测项次', value: `${Number(overview.value.detectionItemCount || 0)}` },
  { label: '合格证开具份', value: `${Number(overview.value.certificateIssueCount || 0)}` },
  { label: '合格证校证份', value: `${Number(overview.value.certificateVerifyCount || 0)}` }
]);

const formatMonthLabel = (month?: string) => {
  if (!month) return '--';
  const value = String(month).trim();
  const monthPart = value.split('-')[1];
  return monthPart ? `${Number(monthPart)}月` : value;
};

const xAxisData = computed(() =>
  trendData.value.map((item) => formatMonthLabel(item.month))
);

const lineValues = computed(() =>
  trendData.value.map((item) => Number(item.statValue || 0))
);

const yAxisMax = computed(() => {
  const maxValue = Math.max(...lineValues.value, 0);
  if (trendTab.value === '阳性率') {
    return Math.max(10, Math.ceil(maxValue / 5) * 5);
  }
  if (maxValue <= 0) return 100;
  return Math.ceil(maxValue * 1.2);
});

const createLineTrendOption = (data: number[], max: number, formatter?: string) => ({
  grid: { left: 52, right: 18, top: 26, bottom: 20 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' }
  },
  xAxis: {
    type: 'category',
    boundaryGap: true,
    data: xAxisData.value,
    axisLabel: {
      color: '#d5e6ff',
      fontSize: 12,
      margin: 14
    },
    axisTick: {
      show: true,
      length: 8,
      lineStyle: { color: 'rgba(174, 197, 227, 0.35)' }
    },
    axisLine: {
      lineStyle: {
        color: 'rgba(140, 167, 196, 0.4)',
        width: 1.2
      }
    },
    splitLine: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max,
    splitNumber: 5,
    axisLabel: {
      color: '#b8cce4',
      fontSize: 12,
      margin: 12,
      formatter: formatter || '{value}'
    },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: {
      lineStyle: {
        color: 'rgba(54, 114, 181, 0.22)',
        type: 'dashed'
      }
    }
  },
  series: [
    {
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      lineStyle: {
        color: '#57e2ff',
        width: 2
      },
      itemStyle: {
        color: '#57e2ff',
        borderColor: 'rgba(255, 255, 255, 0.65)',
        borderWidth: 1.5
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(87, 226, 255, 0.42)' },
          { offset: 0.65, color: 'rgba(87, 226, 255, 0.14)' },
          { offset: 1, color: 'rgba(87, 226, 255, 0)' }
        ])
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          color: '#7cecff',
          borderColor: '#ffffff',
          borderWidth: 2
        }
      },
      data
    }
  ]
});

const currentLineTrendOption = computed(() =>
  trendTab.value === '阳性率'
    ? createLineTrendOption(lineValues.value, yAxisMax.value, '{value}%')
    : createLineTrendOption(lineValues.value, yAxisMax.value)
);

const loadTrendData = async () => {
  try {
    const data = await getDashboardTrend({
      ...getBigScreenQueryParams(),
      statType: trendTab.value === '阳性率' ? '2' : '1'
    });
    trendData.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载首页月度趋势失败', error);
    trendData.value = [];
  }
};

const loadOverviewData = async () => {
  try {
    const data = await getDashboardOverview(getBigScreenQueryParams());
    overview.value = data || {};
  } catch (error) {
    console.error('加载首页概览统计失败', error);
    overview.value = {};
  }
};

watch(
  () => trendTab.value,
  () => {
    loadTrendData();
  }
);

onMounted(() => {
  loadOverviewData();
  loadTrendData();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadOverviewData();
  loadTrendData();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.center-section {
  display: grid;
  grid-template-rows: 1fr 330px;
  gap: 14px;
  min-width: 0;
}

.coverage-metrics {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  background: rgba(35, 34, 34, 0.3);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;

  &::before {
    content: '';
    width: 1px;
    height: 59px;
    position: absolute;
    background: linear-gradient(0deg, #0D1C1A 0%, #C2D4D4 51.44%, #0E1D1A 100%);
    border-radius: 0px 0px 0px 0px;
    right: -40%;
  }

  &:last-child {
    &::before {
      display: none;
    }
  }

  .pedestal-wrap {
    position: relative;
    width: 120px;
    height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .metric-icon {
    width: 84px;
    height: 84px;
    margin-bottom: -12px;
    z-index: 2;
    filter: drop-shadow(0 0 10px rgba(67, 228, 255, 0.6));
  }


  .meta {
    p {
      margin: 0;
      color: #94bddf;
      font-size: 20px;
    }

    strong {
      color: #43e4ff;
      font-size: 32px;
      line-height: 1.1;
      font-weight: 800;
      font-family: 'Din Alternate', sans-serif;
      text-shadow: 0 0 10px rgba(67, 228, 255, 0.4);
    }
  }
}

.map-area {
  position: relative;
  flex: 1;
}

.left-stats {
  position: absolute;
  left: 20px;
  top: 10px;
  width: 120px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  padding: 5px 0;
  border-bottom: 1px solid;
  border-image: linear-gradient(90deg, rgba(52, 166, 208, 0), rgba(52, 164, 208, 1), rgba(255, 255, 255, 1), rgba(52, 179, 208, 1), rgba(52, 158, 208, 0)) 1 1;

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    color: #99b6d4;
    font-size: 18px;
  }

  .stat-value {
    color: #43e4ff;
    font-size: 32px;
    font-weight: 800;
    font-family: 'Din Alternate', sans-serif;
    line-height: 1;
    text-shadow: 0 0 8px rgba(67, 228, 255, 0.35);
  }
}

.map-legend {
  position: absolute;
  right: 20px;
  bottom: -70px;
  width: 140px;
  padding: 10px;
  background: rgba(5, 18, 48, 0.8);
  border: 1px solid rgba(45, 106, 184, 0.5);
  z-index: 2;

  .legend-title {
    color: #43e4ff;
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #90b5da;
    font-size: 14px;
    margin-bottom: 4px;

    .block {
      width: 12px;
      height: 8px;
    }
  }
}
</style>
