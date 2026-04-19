<template>
  <section class="left-section">
    <BigPanelCard title="任务下发概况" :bg-image="leftBg">
      <div class="summary-grid">
        <div class="summary-item" v-for="item in summaryData" :key="item.label">
          <p class="label">{{ item.label }}</p>
          <p class="value">{{ item.value }}</p>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="任务覆盖群体" :bg-image="leftBg">
      <div class="cover-grid">
        <div class="cover-item" v-for="item in coverData" :key="item.label">
          <div class="icon-circle">
            <span class="dot"></span>
          </div>
          <div class="meta">
            <p class="label">{{ item.label }}</p>
            <p class="value">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="下发检测产品品类" :bg-image="leftBg">
      <Echart :options="categoryPieOption" :height="220" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import leftBg from '@/assets/imgs/echarts/检测任务/erji_bg.png';

const summaryData = [
  { label: '任务下发', value: 6138 },
  { label: '任务完成', value: 2688 },
  { label: '任务完成率', value: '21%' }
];

const coverData = [
  { label: '检测机构', value: 213 },
  { label: '生产经营主体', value: 2261 }
];

const categoryPieOption = {
  tooltip: { trigger: 'item' },
  legend: {
    orient: 'vertical',
    right: 2,
    top: 'center',
    textStyle: { color: '#8fb6da', fontSize: 13 }
  },
  series: [
    {
      type: 'pie',
      radius: ['48%', '68%'],
      center: ['34%', '50%'],
      label: {
        color: '#8fb6da',
        formatter: '{b}\\n{c}'
      },
      labelLine: { length: 12, length2: 16, lineStyle: { color: '#4d86be' } },
      itemStyle: { borderColor: '#071a41', borderWidth: 2 },
      data: [
        { value: 18886, name: '蔬菜' },
        { value: 18886, name: '水果' },
        { value: 18886, name: '茶叶' },
        { value: 18886, name: '畜禽' },
        { value: 18886, name: '水产' }
      ],
      color: ['#315fd8', '#f5ab2f', '#2f9dff', '#d3e6f7', '#34d3de']
    }
  ]
};
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 180px 180px minmax(0, 1fr);
  gap: 10px;
  min-height: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 110px;
  margin-top: 2px;
}

.summary-item {
  text-align: center;
  border-right: 1px solid rgba(66, 142, 228, 0.25);

  &:last-child {
    border-right: 0;
  }

  .label {
    margin: 6px 0 0;
    color: #9ebfe0;
    font-size: 15px;
  }

  .value {
    margin: 10px 0 0;
    color: #7ce9ff;
    font-family: 'DIN Alternate', sans-serif;
    font-size: 44px;
    font-weight: 700;
    line-height: 1;
  }
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 4px;
}

.cover-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;

  .icon-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid rgba(58, 226, 255, 0.5);
    display: grid;
    place-items: center;
    box-shadow: inset 0 0 12px rgba(58, 226, 255, 0.3);

    .dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, #6cf4ff 0%, rgba(108, 244, 255, 0.1) 80%);
    }
  }

  .meta {
    .label {
      margin: 0;
      color: #9ebfe0;
      font-size: 14px;
    }

    .value {
      margin: 4px 0 0;
      color: #7ce9ff;
      font-family: 'DIN Alternate', sans-serif;
      font-size: 42px;
      font-weight: 700;
      line-height: 1;
    }
  }
}
</style>
