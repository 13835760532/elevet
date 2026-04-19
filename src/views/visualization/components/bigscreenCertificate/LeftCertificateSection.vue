<template>
  <section class="left-section">
    <BigPanelCard title="合格证概况" :bg-image="leftBg">
      <div class="overview-grid">
        <div class="overview-card blue" v-for="item in overviewData" :key="item.label">
          <p class="label">{{ item.label }}</p>
          <p class="value">{{ item.value }}<span>{{ item.unit }}</span></p>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证服务主体" :bg-image="leftBg">
      <div class="subject-grid">
        <div class="subject-item" v-for="item in subjectData" :key="item.label">
          <p class="label">{{ item.label }}</p>
          <p class="value">{{ item.value }}</p>
          <div class="pedestal"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="各品类合格证开具量" :bg-image="leftBg">
      <div class="pie-wrap">
        <Echart :options="categoryPieOption" :height="220" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import leftBg from '@/assets/imgs/echarts/合格证/Frame 58_bg.png';

const overviewData = [
  { label: '合格证开具', value: '128813', unit: '份' },
  { label: '合格证存证', value: '128813', unit: '份' },
  { label: '合格证查验', value: '128813', unit: '次' },
  { label: '合格证溯源', value: '128813', unit: '次' }
];

const subjectData = [
  { label: '监管机构/检测机构', value: 213 },
  { label: '企业', value: 2568 },
  { label: '个人', value: 2568 }
];

const categoryPieOption = {
  tooltip: { trigger: 'item' },
  legend: {
    orient: 'vertical',
    right: 6,
    top: 'center',
    textStyle: { color: '#8eb6db' }
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['34%', '50%'],
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderColor: '#07183e', borderWidth: 2 },
      data: [
        { value: 18886, name: '蔬菜' },
        { value: 18886, name: '水果' },
        { value: 18886, name: '茶叶' },
        { value: 18886, name: '畜禽' },
        { value: 18886, name: '水产' }
      ],
      color: ['#2f9bff', '#ffb42f', '#2a53d9', '#d5eefb', '#38d6df']
    }
  ]
};
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 278px 188px minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.overview-card {
  height: 90px;
  padding: 14px 14px 10px;
  background: rgba(14, 39, 90, 0.45);
  border: 1px solid rgba(37, 137, 255, 0.38);

  .label {
    margin: 0;
    color: #9ec2e6;
    font-size: 16px;
  }

  .value {
    margin: 6px 0 0;
    font-size: 42px;
    line-height: 1;
    color: #8cecff;
    font-weight: 700;
    font-family: 'DIN Alternate', sans-serif;

    span {
      margin-left: 6px;
      font-size: 16px;
      color: #9ec2e6;
    }
  }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 4px;
}

.subject-item {
  text-align: center;

  .label {
    margin: 0;
    color: #a7caea;
    font-size: 14px;
  }

  .value {
    margin: 6px 0;
    color: #7feaff;
    font-size: 44px;
    line-height: 1;
    font-weight: 700;
    font-family: 'DIN Alternate', sans-serif;
  }

  .pedestal {
    width: 78px;
    height: 16px;
    margin: 0 auto;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(71, 232, 255, 0.8) 0%, rgba(71, 232, 255, 0.1) 70%);
    box-shadow: 0 0 14px rgba(71, 232, 255, 0.6);
  }
}

.pie-wrap {
  height: 100%;
  padding-top: 4px;
}
</style>
