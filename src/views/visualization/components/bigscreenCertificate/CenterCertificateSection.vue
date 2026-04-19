<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="合格证地区分布图" :tabs="['开具', '存证']" active-tab="开具" :bg-image="mapBg">
      <div class="map-area">
        <div class="map-legend">
          <div class="legend-title">合格证开具分布</div>
          <div class="legend-item" v-for="item in legendData" :key="item.label">
            <span class="dot" :style="{ background: item.color }"></span>
            <span>{{ item.label }}</span>
          </div>
        </div>
        <Echart :options="mapOption" :height="520" />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="合格证服务趋势图" :bg-image="trendBg">
      <div class="trend-head">2026年 3月 9日</div>
      <Echart :options="trendOption" :height="210" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import quzhouMap from '@/assets/map/json/quzhou.json';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import mapBg from '@/assets/imgs/echarts/合格证/Frame 57_bg.png';
import trendBg from '@/assets/imgs/echarts/合格证/Frame 59_bg.png';

echarts.registerMap('quzhou-cert', quzhouMap as any);

const legendData = [
  { label: '300-499', color: '#004b99' },
  { label: '200-399', color: '#0066cc' },
  { label: '100-299', color: '#0080ff' },
  { label: '50-199', color: '#33a1ff' },
  { label: '30-100', color: '#66c2ff' },
  { label: '10-50', color: '#99e3ff' },
  { label: '0-10', color: '#ccf2ff' }
];

const mapOption = {
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(3, 24, 58, 0.92)',
    borderColor: '#42e5ff',
    textStyle: { color: '#e8f6ff' },
    formatter: '{b}<br/>合格证开具量: 5688<br/>合格证存证量: 5688'
  },
  geo: {
    map: 'quzhou-cert',
    roam: false,
    zoom: 1.15,
    itemStyle: {
      areaColor: '#0b2b64',
      borderColor: '#2ee8ff',
      borderWidth: 1.4,
      shadowBlur: 16,
      shadowColor: 'rgba(43, 227, 255, 0.28)'
    },
    emphasis: {
      itemStyle: { areaColor: '#1c5fb5', borderColor: '#73efff' },
      label: { show: false }
    }
  },
  series: [
    {
      type: 'map',
      geoIndex: 0,
      data: (quzhouMap as any).features.map((f: any) => ({ name: f.properties.name, value: Math.round(Math.random() * 600) }))
    },
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: [
        { name: '衢州', value: [118.87, 28.93, 100] },
        { name: '杭州', value: [120.15, 30.28, 96] },
        { name: '宁波', value: [121.55, 29.88, 88] }
      ],
      symbolSize: 8,
      itemStyle: { color: '#ffd84f' },
      rippleEffect: { color: '#fff5ae', scale: 3 }
    }
  ]
};

const trendOption = {
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
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLabel: { color: '#8fb6da' },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#8fb6da', formatter: '{value}%' },
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
      data: [12, 32, 24, 36, 41, 44, 26, 33, 37, 31, 25, 24]
    },
    {
      name: '存证次数',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: [18, 35, 30, 44, 47, 50, 35, 40, 43, 37, 31, 30]
    },
    {
      name: '溯源次数',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7d60ff', width: 2 },
      itemStyle: { color: '#7d60ff' },
      data: [22, 39, 35, 48, 50, 53, 39, 44, 46, 39, 34, 33]
    }
  ]
};
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
