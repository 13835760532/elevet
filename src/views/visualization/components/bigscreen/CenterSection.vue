<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="覆盖群体" :bg-image="coverBg">
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

        <!-- 地图图例 -->
        <div class="map-legend">
          <div class="legend-title">测量分布</div>
          <div class="legend-list">
            <div class="legend-item"><span class="block" style="background: #004b99"></span> 300-499</div>
            <div class="legend-item"><span class="block" style="background: #0066cc"></span> 200-399</div>
            <div class="legend-item"><span class="block" style="background: #0080ff"></span> 100-299</div>
            <div class="legend-item"><span class="block" style="background: #33a1ff"></span> 50-199</div>
            <div class="legend-item"><span class="block" style="background: #66c2ff"></span> 30-100</div>
            <div class="legend-item"><span class="block" style="background: #99e3ff"></span> 10-50</div>
            <div class="legend-item"><span class="block" style="background: #ccf2ff"></span> 0-10</div>
          </div>
        </div>

        <Echart :options="chinaMapOption" :height="470" />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="检测量动态 | 阳性率态势(检测项)" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="trendBg">
      <Echart :options="lineTrendOption" :height="260" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import chinaMap from '@/assets/map/json/china.json';
import quzhouMap from '@/assets/map/json/quzhou.json';
import BigPanelCard from './BigPanelCard.vue';
import coverBg from '@/assets/imgs/echarts/首页/fgqt_bg.png';
import trendBg from '@/assets/imgs/echarts/首页/jcdtl_bg.png';

import n1 from '@/assets/imgs/echarts/首页/fgqt1.png';
import n2 from '@/assets/imgs/echarts/首页/fgqt2.png';
import n3 from '@/assets/imgs/echarts/首页/fgqt3.png';

// 提前注册地图数据，避免渲染由于注册延迟导致的白屏
echarts.registerMap('china', chinaMap as any);
echarts.registerMap('quzhou', quzhouMap as any);

const topMetrics = [
  { img: n1, label: '监管机构', value: 213 },
  { img: n2, label: '检测机构', value: 213 },
  { img: n3, label: '生产经营主体', value: 213 }
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
  // 地图已在顶层注册
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
    map: 'quzhou',
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
      data: (quzhouMap as any).features.map((f: any) => ({ name: f.properties.name, value: Math.round(Math.random() * 1000) }))
    },
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: [{ name: '示例点', value: [118.87, 28.93, 88] }],
      symbolSize: 10,
      itemStyle: { color: '#ffdf52' },
      rippleEffect: { color: '#fef3a2', scale: 4 }
    }
  ]
};

const lineTrendOption = {
  grid: { left: 45, right: 20, top: 24, bottom: 24 },
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
  grid-template-rows: 1fr 330px;
  gap: 14px;
  min-width: 0;
}

.coverage-metrics {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  background: rgba(35,34,34,0.3);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  &::before{
    content: '';
    width: 1px;
    height: 59px;
    position: absolute;
    background: linear-gradient( 0deg, #0D1C1A 0%, #C2D4D4 51.44%, #0E1D1A 100%);
    border-radius: 0px 0px 0px 0px;
    right: -40%;
  }
  &:last-child{
    &::before{
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
  min-height: 470px;
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
