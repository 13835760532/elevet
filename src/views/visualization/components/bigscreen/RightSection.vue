<template>
  <section class="right-section">
    <BigPanelCard title="风险公告" :bg-image="noticeBg">
      <div class="announcement-list">
        <div class="announcement-item" v-for="(item, index) in announcements" :key="index">
          <p class="time">{{ item.time }}</p>
          <p class="desc">{{ item.text }}</p>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="风险集中区域 TOP 10" :tabs="['产地', '检测地']" active-tab="产地" :bg-image="rankBg">
      <div class="rank-table-wrap">
        <table class="rank-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>集中地区</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(city, idx) in rankData" :key="city + idx">
              <td><span class="rank-badge" :class="`top-${idx + 1}`">{{ String(idx + 1).padStart(2, '0') }}</span></td>
              <td>{{ city }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>

    <BigPanelCard title="产品检测项风险TOP10" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="riskBg">
      <Echart :options="projectRiskOption" :height="300" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from './BigPanelCard.vue';
import noticeBg from '@/assets/imgs/echarts/首页/bg_fxgg.png';
import rankBg from '@/assets/imgs/echarts/首页/fxjzqy_bg.png';
import riskBg from '@/assets/imgs/echarts/首页/nclfx_bg.png';

const announcements = [
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' },
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' },
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' }
];

const rankData = ['福州', '南京', '广州', '台湾', '广州', '台湾', '广州', '台湾', '广州', '南京'];
const projectItems = ['丝瓜-甲氨基', '地瓜-阿维菌素', '四季豆-倍硫磷', '南瓜-氟虫腈', '西瓜-氟虫腈', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱'];
const projectValues = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.33, 0.29, 0.21, 0.2];

const projectRiskOption = {
  grid: { left: 96, right: 52, top: 8, bottom: 20 },
  xAxis: {
    type: 'value',
    min: 0,
    max: 1,
    interval: 0.2,
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { lineStyle: { color: '#2d67ac' } },
    axisLabel: { color: '#80abd3' }
  },
  yAxis: [
    {
      type: 'category',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#d4ebff', fontSize: 12 },
      data: projectItems
    },
    {
      type: 'category',
      inverse: true,
      position: 'right',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#4deaff',
        fontSize: 16,
        fontWeight: 700,
        formatter: (val: number) => Number(val).toFixed(1)
      },
      data: projectValues
    }
  ],
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: projectValues,
      itemStyle: {
        barBorderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: '#1a53cf' }
        ])
      }
    }
  ]
};
</script>

<style scoped lang="scss">
.right-section {
  display: grid;
  grid-template-rows: 280px 400px minmax(0, 1fr);
  gap: 14px;
  min-height: 0;
}

.announcement-list {
  height: 196px;
  overflow: auto;
  padding: 4px 2px 0 2px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #1f4b89;
  }
}

.announcement-item {
  padding: 5px 10px 0px;
  margin-bottom: 8px;
  background: rgba(4, 18, 45, 0.32);

  .time {
    margin: 0;
    color: #c3ddf3;
    font-size: 14px;
    line-height: 1.25;
    font-weight: 600;
  }

  .desc {
    margin: 6px 0 0;
    color: #9eb8d3;
    font-size: 16px;
    line-height: 1.45;
  }
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 4px 0;
    border-bottom: 1px solid rgba(35, 92, 168, 0.35);
    font-size: 15px;
  }

  th {
    text-align: center;
    color: #8fb7dc;
    font-weight: 600;
  }

  td {
    color: #d6eefe;
    text-align: center;
  }

  tbody tr:nth-child(odd) {
    background: rgba(17, 56, 109, 0.36);
  }

  tbody tr:nth-child(even) {
    background: rgba(7, 29, 70, 0.36);
  }
}

.rank-table-wrap {
  height: 100%;
  overflow: hidden;
}

.rank-badge {
  display: inline-block;
  min-width: 30px;
  height: 22px;
  line-height: 22px;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  font-weight: 700;
  color: #8fa7c1;
  background: rgba(12, 45, 92, 0.6);
  clip-path: polygon(0 0, 100% 0, 86% 100%, 0 100%);

  &.top-1 {
    color: #4cf1ff;
    background: rgba(18, 124, 112, 0.45);
  }

  &.top-2 {
    color: #4adb8e;
    background: rgba(21, 115, 140, 0.45);
  }

  &.top-3 {
    color: #f4d24a;
    background: rgba(138, 108, 22, 0.45);
  }
}
</style>
