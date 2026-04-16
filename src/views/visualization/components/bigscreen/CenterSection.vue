<template>
  <section class="center-section">
    <BigPanelCard title="覆盖群体" :bg-image="coverBg">
      <div class="coverage-metrics">
        <div class="metric-card" v-for="item in topMetrics" :key="item.label">
          <div class="icon">{{ item.icon }}</div>
          <div class="meta">
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>

      <div class="map-area">
        <div class="left-stats">
          <div class="stat-item" v-for="item in sideStats" :key="item.label">
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <Echart :options="chinaMapOption" height="470" />
      </div>
    </BigPanelCard>

    <BigPanelCard title="检测量动态 | 阳性率态势(检测项)" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="trendBg">
      <Echart :options="lineTrendOption" height="260" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import chinaMap from '@/assets/map/json/china.json';
import BigPanelCard from './BigPanelCard.vue';
import coverBg from '@/assets/imgs/echarts/首页/fgqt_bg.png';
import trendBg from '@/assets/imgs/echarts/首页/jcdtl_bg.png';

const topMetrics = [
  { icon: '🏛', label: '监管机构', value: 213 },
  { icon: '🧪', label: '检测机构', value: 213 },
  { icon: '🏭', label: '生产经营主体', value: 213 }
];

const sideStats = [
  { label: '任务下发项次', value: '6875' },
  { label: '任务完成项次', value: '6875' },
  { label: '任务完成率', value: '68%' },
  { label: '检测样品量', value: '6875' },
  { label: '检测项次', value: '6875' },
  { label: '合格证开具份', value: '6875' },
  { label: '合格证收证份', value: '6875' }
];

onMounted(() => {
  echarts.registerMap('china', chinaMap as any);
});

const chinaMapOption = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(3, 24, 58, 0.92)',
    borderColor: '#42e5ff',
    textStyle: { color: '#e8f6ff' },
    formatter: '{b}<br/>样品量: 565566<br/>检测项次: 345456<br/>检测项阳性率: 56%'
  },
  geo: {
    map: 'china',
    zoom: 1.16,
    roam: false,
    itemStyle: {
      areaColor: '#0a2a62',
      borderColor: '#2dd6ff',
      borderWidth: 1.3,
      shadowColor: 'rgba(43, 227, 255, 0.35)',
      shadowBlur: 18
    },
    emphasis: {
      itemStyle: { areaColor: '#1455a9', borderColor: '#70ecff' },
      label: { show: false }
    }
  },
  series: [
    {
      type: 'map',
      geoIndex: 0,
      data: (chinaMap as any).features.map((f: any) => ({ name: f.properties.name, value: Math.round(Math.random() * 1000) }))
    },
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: [{ name: '示例点', value: [112.55, 37.87, 88] }],
      symbolSize: 10,
      itemStyle: { color: '#ffdf52' },
      rippleEffect: { color: '#fef3a2', scale: 4 }
    }
  ]
};

const lineTrendOption = {
  grid: { left: 38, right: 20, top: 24, bottom: 24 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLabel: { color: '#90b5da' },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#90b5da', formatter: '{value}%' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#4deaff', width: 3 },
      itemStyle: { color: '#48e8ff', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(72, 232, 255, 0.38)' },
          { offset: 1, color: 'rgba(72, 232, 255, 0.02)' }
        ])
      },
      data: [3.2, 6.4, 5.1, 7, 8, 8.7, 5.3, 6.5, 7.2, 6.3, 5.2, 5.2]
    }
  ]
};
</script>

<style scoped lang="scss">
.center-section {
  display: grid;
  grid-template-rows: 1fr 320px;
  gap: 14px;
  min-width: 0;
}

.coverage-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 10px;
}

.metric-card {
  height: 108px;
  border: 1px solid rgba(49, 135, 230, 0.45);
  background: linear-gradient(180deg, rgba(13, 43, 89, 0.8) 0%, rgba(7, 28, 68, 0.4) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .icon {
    font-size: 38px;
    filter: drop-shadow(0 0 12px rgba(74, 232, 255, 0.35));
  }

  .meta {
    p {
      margin: 0;
      color: #94bddf;
      font-size: 18px;
    }

    strong {
      color: #6feeff;
      font-size: 48px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: 1px;
      font-family: 'DIN Alternate', 'Arial', sans-serif;
    }
  }
}

.map-area {
  position: relative;
  min-height: 470px;
}

.left-stats {
  position: absolute;
  left: 6px;
  top: 16px;
  width: 180px;
  z-index: 2;
  background: linear-gradient(180deg, rgba(8, 33, 76, 0.78), rgba(4, 16, 46, 0.65));
  border: 1px solid rgba(43, 127, 219, 0.38);
  padding: 10px;
}

.stat-item {
  padding: 9px 0;
  border-bottom: 1px solid rgba(45, 105, 184, 0.3);

  &:last-child {
    border-bottom: none;
  }

  p {
    margin: 0;
    color: #86b4db;
    font-size: 16px;
  }

  strong {
    color: #56e8ff;
    font-size: 34px;
    line-height: 1.1;
    font-family: 'DIN Alternate', 'Arial', sans-serif;
  }
}
</style>
