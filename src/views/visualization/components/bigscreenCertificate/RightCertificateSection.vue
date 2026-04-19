<template>
  <section class="right-section">
    <BigPanelCard title="合格证分析" :bg-image="rightBg">
      <div class="analysis-wrap">
        <p class="analysis-title">合格证出具类型</p>
        <Echart :options="analysisOption" :height="150" />
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证开具榜单" :tabs="['累计']" active-tab="累计" :bg-image="rightBg">
      <table class="rank-table">
        <thead>
          <tr>
            <th>排行</th>
            <th>开具主体</th>
            <th>份数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in issueRank" :key="item.name + idx">
            <td><span class="rank" :class="`top-${idx + 1}`">{{ String(idx + 1).padStart(2, '0') }}</span></td>
            <td>{{ item.name }}</td>
            <td>{{ item.value }}</td>
          </tr>
        </tbody>
      </table>
    </BigPanelCard>

    <BigPanelCard title="合格证存证排行榜" :tabs="['累计']" active-tab="累计" :bg-image="rightBg">
      <table class="rank-table">
        <thead>
          <tr>
            <th>排行</th>
            <th>存证主体</th>
            <th>份数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in storeRank" :key="item.name + idx">
            <td><span class="rank" :class="`top-${idx + 1}`">{{ String(idx + 1).padStart(2, '0') }}</span></td>
            <td>{{ item.name }}</td>
            <td>{{ item.value }}</td>
          </tr>
        </tbody>
      </table>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import rightBg from '@/assets/imgs/echarts/合格证/Frame 60_bg.png';

const analysisOption = {
  legend: {
    right: 10,
    top: 'middle',
    orient: 'vertical',
    textStyle: { color: '#9ec2e5' }
  },
  series: [
    {
      type: 'pie',
      radius: ['62%', '78%'],
      center: ['34%', '55%'],
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 890886, name: '生产者' },
        { value: 18886, name: '收购者' }
      ],
      color: ['#3ba4ff', '#76cf3f']
    }
  ]
};

const issueRank = [
  { name: '福州', value: 12334 },
  { name: '南京', value: 3445 },
  { name: '广州', value: 66778 },
  { name: '台湾', value: 34566 },
  { name: '广州', value: 6788 },
  { name: '台湾', value: 45678 },
  { name: '广州', value: 56788 },
  { name: '台湾', value: 24521 },
  { name: '广州', value: 23456 },
  { name: '南京', value: 77999 }
];

const storeRank = [...issueRank];
</script>

<style scoped lang="scss">
.right-section {
  display: grid;
  grid-template-rows: 194px minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
}

.analysis-wrap {
  .analysis-title {
    margin: 2px 0 0;
    color: #a9caea;
    font-size: 16px;
    font-weight: 700;
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
    font-size: 13px;
    text-align: center;
  }

  th {
    color: #8fb7dc;
    font-weight: 600;
  }

  td {
    color: #d6eefe;
  }

  tbody tr:nth-child(odd) {
    background: rgba(17, 56, 109, 0.36);
  }

  tbody tr:nth-child(even) {
    background: rgba(7, 29, 70, 0.36);
  }
}

.rank {
  display: inline-block;
  min-width: 28px;
  height: 20px;
  line-height: 20px;
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
