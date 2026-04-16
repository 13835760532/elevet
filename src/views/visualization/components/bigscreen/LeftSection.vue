<template>
  <section class="left-section">
    <BigPanelCard title="农产品品类风险分布" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="leftCardBg">
      <div class="pie-layout">
        <Echart :options="categoryPieOption" height="248" />
        <div class="category-legend">
          <div class="legend-row" v-for="item in categoryLegend" :key="item.name">
            <span class="dot" :style="{ background: item.color }" />
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="农产品风险 TOP 10" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="leftCardBg">
      <Echart :options="riskTopOption" height="330" />
    </BigPanelCard>

    <BigPanelCard title="农药残留风险 TOP 10" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="leftCardBg">
      <Echart :options="pesticideTopOption" height="260" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from './BigPanelCard.vue';
import leftCardBg from '@/assets/imgs/echarts/首页/nclfx_bg.png';

const categoryLegend = [
  { name: '蔬菜', value: 450, color: '#2d7bff' },
  { name: '水果', value: 256, color: '#49d3f8' },
  { name: '畜禽', value: 378, color: '#95d34a' },
  { name: '水产', value: 135, color: '#efbd3f' },
  { name: '茶叶', value: 627, color: '#f49a38' }
];

const categoryPieOption = {
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['58%', '74%'],
      center: ['42%', '52%'],
      silent: true,
      label: { show: false },
      itemStyle: { borderWidth: 2, borderColor: '#0a1f4e' },
      data: categoryLegend.map((item) => ({ value: item.value, name: item.name, itemStyle: { color: item.color } }))
    }
  ]
};

const riskNames = ['芹菜', '菠菜', '韭菜', '萝卜', '青椒', '丝瓜', '南瓜', '黄瓜', '白菜', '生姜'];
const riskValues = [0.9, 0.8, 0.7, 0.6, 0.52, 0.45, 0.4, 0.34, 0.29, 0.2];
const riskTopOption = {
  grid: { left: 58, right: 20, top: 10, bottom: 20, containLabel: true },
  xAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { lineStyle: { color: '#2d67ac' } },
    axisLabel: { color: '#80abd3' }
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: riskNames,
    axisLabel: { color: '#d4ebff', fontSize: 14 },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'bar',
      barWidth: 14,
      label: { show: true, position: 'right', color: '#48e7ff' },
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#49e8ff' },
          { offset: 1, color: '#1d56d9' }
        ])
      },
      data: riskValues
    }
  ]
};

const pesticideTopOption = {
  grid: { left: 46, right: 10, top: 24, bottom: 40 },
  xAxis: {
    type: 'category',
    data: ['甲氨基', '氟虫胺', '毒死蜱', '毒死蜱', '氟虫', '阿维菌素', '腈虫胺', '溴氰菊酯', '咪鲜胺'],
    axisLabel: { color: '#80abd3', fontSize: 12, interval: 0, rotate: 22 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#80abd3' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: [400, 350, 300, 270, 230, 200, 180, 150, 100],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: 'rgba(72, 231, 255, 0.15)' }
        ])
      }
    }
  ]
};
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 350px 346px 308px;
  gap: 14px;
}

.pie-layout {
  height: 248px;
  display: grid;
  grid-template-columns: 1fr 170px;
  align-items: center;
  gap: 8px;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(11, 44, 88, 0.45);
  border: 1px solid rgba(39, 110, 196, 0.35);

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .name {
    color: #bbdbfa;
    font-size: 16px;
  }

  .value {
    color: #4ce9ff;
    font-weight: 700;
    font-size: 16px;
  }
}
</style>
