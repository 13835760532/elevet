<template>
  <section class="center-quick-section">
    <BigPanelCard class="big-panel-center" title="自主检测地域分布图" :bg-image="centerBg">
      <div class="map-area">
        <div class="map-tip">检测样本量 5688<br />检测阳性率 56%</div>
        <div class="map-legend">
          <div class="legend-title">检测样本分布</div>
          <div class="legend-item" v-for="item in legendData" :key="item.label">
            <span class="dot" :style="{ background: item.color }"></span>{{ item.label }}
          </div>
        </div>
        <Echart :options="mapOption" :height="500" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import centerBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';



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
    formatter: '{b}<br/>检测样本量: 5688<br/>检测阳性率: 56%'
  },
  geo: {
    map: 'quzhou-quick',
    roam: false,
    zoom: 1.15,
    itemStyle: {
      areaColor: '#0a2a62',
      borderColor: '#2dd6ff',
      borderWidth: 1.2,
      shadowColor: 'rgba(43, 227, 255, 0.35)',
      shadowBlur: 16
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
      data: (quzhouMap as any).features.map((f: any) => ({ name: f.properties.name, value: Math.round(Math.random() * 500) }))
    },
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      data: [
        { name: '衢州', value: [118.87, 28.93, 88] },
        { name: '杭州', value: [120.15, 30.28, 93] },
        { name: '宁波', value: [121.55, 29.88, 76] }
      ],
      symbolSize: 8,
      itemStyle: { color: '#ffdf52' },
      rippleEffect: { color: '#fef3a2', scale: 3 }
    }
  ]
};
</script>

<style scoped lang="scss">
.center-quick-section {
  min-width: 0;
}

.map-area {
  position: relative;
  min-height: 0;
}

.map-tip {
  position: absolute;
  right: 188px;
  top: 246px;
  z-index: 3;
  padding: 10px 12px;
  border: 1px solid rgba(84, 227, 255, 0.65);
  background: rgba(10, 48, 87, 0.78);
  color: #d2efff;
  font-size: 13px;
  line-height: 1.6;
}

.map-legend {
  position: absolute;
  right: 12px;
  bottom: 50px;
  min-width: 100px;
  padding: 7px 8px;
  background: rgba(4, 30, 66, 0.78);
  border: 1px solid rgba(63, 161, 255, 0.4);
  z-index: 2;

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
</style>
