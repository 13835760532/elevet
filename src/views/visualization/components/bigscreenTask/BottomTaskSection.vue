<template>
  <section class="bottom-section">
    <BigPanelCard class="big-panel-center" title="任务检测量态势" :bg-image="bottomBg">
      <Echart :options="leftTrendOption" :height="200" />
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="检测风险态势" :bg-image="bottomBg">
      <Echart :options="rightTrendOption" :height="200" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import bottomBg from '@/assets/imgs/echarts/检测任务/69.png';

const xData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const lineBase = {
  grid: { left: 42, right: 16, top: 16, bottom: 24 },
  tooltip: { trigger: 'axis' },
  legend: {
    right: 16,
    top: 0,
    textStyle: { color: '#8fb6da', fontSize: 11 }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xData,
    axisLabel: { color: '#8fb6da', fontSize: 11 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#8fb6da', formatter: '{value}%', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } }
  }
};

const leftTrendOption = {
  ...lineBase,
  legend: { ...lineBase.legend, data: ['样品批次', '检测项次'] },
  series: [
    {
      name: '样品批次',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: [20, 35, 31, 43, 45, 47, 35, 40, 43, 35, 29, 29]
    },
    {
      name: '检测项次',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#56e8ff', width: 2 },
      itemStyle: { color: '#56e8ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(86, 232, 255, 0.02)' }
        ])
      },
      data: [12, 32, 25, 34, 40, 44, 26, 31, 35, 30, 25, 25]
    }
  ]
};

const rightTrendOption = {
  ...lineBase,
  legend: { ...lineBase.legend, data: ['样品阳性率', '检测项阳性率'] },
  series: [
    {
      name: '样品阳性率',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: [20, 34, 31, 42, 44, 46, 34, 39, 41, 34, 28, 28]
    },
    {
      name: '检测项阳性率',
      type: 'line',
      smooth: true,
      symbolSize: 5,
      lineStyle: { color: '#56e8ff', width: 2 },
      itemStyle: { color: '#56e8ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(86, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(86, 232, 255, 0.02)' }
        ])
      },
      data: [11, 31, 24, 35, 40, 44, 25, 30, 34, 29, 24, 24]
    }
  ]
};
</script>

<style scoped lang="scss">
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}
</style>
