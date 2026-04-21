<template>
  <section class="bottom-quick-trends">
    <BigPanelCard title="快检量态势" :tabs="['阳性率量', '阳性率']" active-tab="阳性率量" :bg-image="bottomBg">
      <Echart :options="leftTrendOption" :height="200" />
    </BigPanelCard>

    <BigPanelCard title="风险态势" :tabs="['自主检测样本量']" active-tab="自主检测样本量" :bg-image="bottomBg">
      <Echart :options="rightTrendOption" :height="200" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import bottomBg from '@/assets/imgs/echarts/检测任务/69.png';

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const createTrendOption = (data: number[]) => ({
  grid: { left: 40, right: 16, top: 18, bottom: 24 },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: months,
    axisLabel: { color: '#90b5da', fontSize: 11 },
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
      symbolSize: 6,
      lineStyle: { color: '#4deaff', width: 2 },
      itemStyle: { color: '#48e8ff', borderColor: '#fff', borderWidth: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(72, 232, 255, 0.32)' },
          { offset: 1, color: 'rgba(72, 232, 255, 0.02)' }
        ])
      },
      data
    }
  ]
});

const leftTrendOption = createTrendOption([12, 32, 25, 35, 40, 44, 25, 32, 32, 35, 26, 25]);
const rightTrendOption = createTrendOption([12, 32, 25, 35, 40, 44, 25, 32, 32, 35, 26, 25]);
</script>

<style scoped lang="scss">
.bottom-quick-trends {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-height: 0;
}
</style>
