<template>
  <section class="right-quick-section">
    <BigPanelCard title="快速检测分析" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="rightBg">
      <div class="right-block">
        <p class="block-title">检测农产品高风险top</p>
        <Echart :options="topColumnOption" :height="150" />
      </div>
    </BigPanelCard>

    <BigPanelCard title="产品·检测项目高风险top" :tabs="['检测项阳性率']" active-tab="检测项阳性率" :bg-image="rightBg">
      <Echart :options="middleBarOption" :height="240" />
    </BigPanelCard>

    <BigPanelCard title="检测项高风险top" :tabs="['检测项阳性率']" active-tab="检测项阳性率" :bg-image="rightBg">
      <Echart :options="bottomBarOption" :height="240" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import rightBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';

const topColumnOption = {
  grid: { left: 34, right: 14, top: 18, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['1.生姜', '2.白菜', '3.黄瓜', '4.南瓜', '5.丝瓜', '6.芹菜', '7.萝卜', '8.韭菜', '9.波菜', '10.芹菜'],
    axisLabel: { color: '#86abd0', fontSize: 9, interval: 0, rotate: 0 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 1,
    interval: 0.2,
    axisLabel: { color: '#86abd0' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.32)', type: 'dashed' } }
  },
  series: [
    {
      type: 'bar',
      barWidth: 9,
      barCategoryGap: '36%',
      data: [0.8, 0.74, 0.7, 0.66, 0.62, 0.58, 0.54, 0.46, 0.4, 0.32],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: 'rgba(72, 231, 255, 0.15)' }
        ])
      }
    }
  ]
};

const productNames = ['丝瓜-甲氨基', '地瓜-阿维菌素', '四季豆-倍硫磷', '南瓜-氟虫腈', '西瓜-氟虫腈', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱'];
const productValues = [500, 400, 350, 300, 250, 200, 150, 150, 100, 100];
const itemNames = ['甲氨基', '维菌素', '倍硫磷', '氟虫腈', '氟虫腈', '毒死蜱', '毒死蜱', '毒死蜱', '毒死蜱', '毒死蜱'];

const makeHorizontalOption = (names: string[], values: number[]) => ({
  grid: { left: 96, right: 24, top: 12, bottom: 14 },
  xAxis: {
    type: 'value',
    min: 0,
    max: 500,
    interval: 100,
    axisLabel: { color: '#80abd3' },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: [
    {
      type: 'category',
      inverse: true,
      data: names,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#d4ebff', fontSize: 12 }
    },
    {
      type: 'category',
      inverse: true,
      position: 'right',
      data: values,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#48e7ff',
        fontSize: 12,
        fontWeight: 700,
        formatter: (val: number) => String(val)
      }
    }
  ],
  series: [
    {
      type: 'bar',
      barWidth: 10,
      data: values,
      itemStyle: {
        borderRadius: [0, 7, 7, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#49e8ff' },
          { offset: 1, color: '#1d56d9' }
        ])
      },
      barGap: '32%'
    }
  ]
});

const middleBarOption = makeHorizontalOption(productNames, productValues);
const bottomBarOption = makeHorizontalOption(itemNames, productValues);
</script>

<style scoped lang="scss">
.right-quick-section {
  display: grid;
  grid-template-rows: 246px 1fr 1fr;
  gap: 10px;
  min-height: 0;
}

.right-block {
  .block-title {
    margin: 0 0 4px;
    color: #9ec2e5;
    font-size: 14px;
    font-weight: 700;
  }
}

:deep(.panel-body) {
  padding: 10px 10px 8px;
}
</style>
