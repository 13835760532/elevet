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
    </BigPanelCard>

    <BigPanelCard title="产品检测项风险 TOP 10" :tabs="['检测量', '阳性率']" active-tab="检测量" :bg-image="riskBg">
      <Echart :options="projectRiskOption" height="300" />
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
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' },
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' }
];

const rankData = ['福州', '南京', '广州', '台湾', '广州', '台湾', '广州', '台湾', '广州', '南京'];

const projectRiskOption = {
  grid: { left: 92, right: 20, top: 8, bottom: 20 },
  xAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { lineStyle: { color: '#2d67ac' } },
    axisLabel: { color: '#80abd3' }
  },
  yAxis: {
    type: 'category',
    inverse: true,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#d4ebff', fontSize: 12 },
    data: ['丝瓜-甲氨基', '地瓜-阿维菌素', '四季豆-倍硫磷', '南瓜-氟虫腈', '西瓜-氟虫腈', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱', '白菜-毒死蜱']
  },
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.33, 0.29, 0.21, 0.2],
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: '#1a53cf' }
        ])
      },
      label: { show: true, position: 'right', color: '#4deaff' }
    }
  ]
};
</script>

<style scoped lang="scss">
.right-section {
  display: grid;
  grid-template-rows: 280px 380px 352px;
  gap: 14px;
}

.announcement-list {
  height: 194px;
  overflow: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #1f4b89;
  }
}

.announcement-item {
  padding: 12px;
  border: 1px solid rgba(39, 110, 196, 0.25);
  background: rgba(8, 28, 64, 0.48);
  margin-bottom: 10px;

  .time {
    margin: 0;
    color: #74d9ff;
    font-size: 16px;
  }

  .desc {
    margin: 6px 0 0;
    color: #b1cee9;
    font-size: 15px;
    line-height: 1.45;
  }
}

.rank-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 10px 0;
    border-bottom: 1px solid rgba(35, 92, 168, 0.35);
    font-size: 16px;
  }

  th {
    text-align: left;
    color: #8fb7dc;
    font-weight: 600;
  }

  td {
    color: #d6eefe;
  }
}

.rank-badge {
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  font-weight: 700;
  color: #8fa7c1;

  &.top-1 {
    color: #4cf1ff;
  }

  &.top-2 {
    color: #4adb8e;
  }

  &.top-3 {
    color: #f4d24a;
  }
}
</style>
