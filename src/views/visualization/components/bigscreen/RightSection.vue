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

    <BigPanelCard title="风险集中区域 TOP 10" :tabs="['产地', '检测地']" v-model:active-tab="rankTab" :bg-image="rankBg">
      <div class="rank-table-wrap">
        <div class="rank-level-tabs">
          <button
            v-for="tab in areaLevelTabs"
            :key="tab"
            type="button"
            class="rank-level-tab"
            :class="{ active: tab === rankAreaLevelTab }"
            @click="rankAreaLevelTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        <table class="rank-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>集中地区</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(city, idx) in currentRankData" :key="city + idx">
              <td><span class="rank-badge" :class="`top-${idx + 1}`">{{ String(idx + 1).padStart(2, '0') }}</span></td>
              <td>{{ city }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>

    <BigPanelCard title="产品检测项风险TOP10" :tabs="['检测量', '阳性率']" v-model:active-tab="projectRiskTab" :bg-image="riskBg">
      <Echart :options="currentProjectRiskOption" :height="300" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from './BigPanelCard.vue';
import noticeBg from '@/assets/imgs/echarts/首页/bg_fxgg.png';
import rankBg from '@/assets/imgs/echarts/首页/fxjzqy_bg.png';
import riskBg from '@/assets/imgs/echarts/首页/nclfx_bg.png';
import {
  getProductPesticideTop10,
  getRiskAreaTop10,
  type ProductPesticideTopRespVO,
  type RiskAreaTopRespVO
} from '@/api/agri/dashboard';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config';

const announcements = [
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' },
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' },
  { time: '2025-10-01 17:56', text: 'xx农产品(生产经营主体:xx)，发现xxx项目不合格。(检测机构:xx)' }
];

const rankTab = ref('产地');
const rankAreaLevelTab = ref('城市');
const projectRiskTab = ref('检测量');
const rankList = ref<RiskAreaTopRespVO[]>([]);
const projectRiskList = ref<ProductPesticideTopRespVO[]>([]);
const areaLevelTabs = ['城市', '区县'];

const createProjectRiskOption = (
  labels: string[],
  values: number[],
  max: number,
  formatter: (val: number) => string
) => ({
  grid: { left: 96, right: 52, top: 8, bottom: 20 },
  xAxis: {
    type: 'value',
    min: 0,
    max,
    interval: max <= 1 ? 0.2 : 100,
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { lineStyle: { color: '#2d67ac' } },
    axisLabel: { color: '#80abd3', formatter }
  },
  yAxis: [
    {
      type: 'category',
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#d4ebff', fontSize: 12 },
      data: labels
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
        formatter
      },
      data: values
    }
  ],
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: values,
      itemStyle: {
        barBorderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: '#1a53cf' }
        ])
      }
    }
  ]
});

const currentRankData = computed(() => rankList.value.map((item) => item.areaName || '--'));
const projectLabels = computed(() =>
  projectRiskList.value.length
    ? projectRiskList.value.map((item) => item.combineName || '--')
    : [
        '丝瓜-甲氨基',
        '地瓜-阿维菌素',
        '四季豆-倍硫磷',
        '南瓜-氟虫腈',
        '西瓜-氟虫腈',
        '白菜-毒死蜱',
        '白菜-毒死蜱',
        '白菜-毒死蜱',
        '白菜-毒死蜱',
        '白菜-毒死蜱'
      ]
);
const projectValues = computed(() =>
  projectRiskList.value.length
    ? projectRiskList.value.map((item) => Number(item.statValue || 0))
    : projectRiskTab.value === '阳性率'
    ? [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.33, 0.29, 0.21, 0.2]
    : [490, 430, 380, 320, 280, 210, 180, 150, 110, 95]
);
const projectMax = computed(() => {
  const maxValue = Math.max(...projectValues.value, 0);
  if (projectRiskTab.value === '阳性率') {
    return Math.max(1, Math.ceil(maxValue / 0.2) * 0.2);
  }
  if (maxValue <= 0) return 100;
  return Math.ceil(maxValue * 1.1);
});
const currentProjectRiskOption = computed(() =>
  projectRiskTab.value === '阳性率'
    ? createProjectRiskOption(
        projectLabels.value,
        projectValues.value,
        projectMax.value,
        (val: number) => `${Number(val).toFixed(2)}%`
      )
    : createProjectRiskOption(
        projectLabels.value,
        projectValues.value,
        projectMax.value,
        (val: number) => String(Math.round(val))
      )
);

const loadRiskAreaTop10 = async () => {
  try {
    const data = await getRiskAreaTop10({
      ...getBigScreenQueryParams(),
      areaType: rankTab.value === '产地' ? '1' : '2',
      areaLevel: rankAreaLevelTab.value === '区县' ? '2' : '1'
    });
    rankList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载风险集中区域 TOP10 失败', error);
    rankList.value = [];
  }
};

const loadProductPesticideTop10 = async () => {
  try {
    const data = await getProductPesticideTop10({
      ...getBigScreenQueryParams(),
      statType: projectRiskTab.value === '阳性率' ? '2' : '1'
    });
    projectRiskList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载产品检测项风险 TOP10 失败', error);
    projectRiskList.value = [];
  }
};

watch(
  () => rankTab.value,
  () => {
    loadRiskAreaTop10();
  }
);

watch(
  () => rankAreaLevelTab.value,
  () => {
    loadRiskAreaTop10();
  }
);

watch(
  () => projectRiskTab.value,
  () => {
    loadProductPesticideTop10();
  }
);

onMounted(() => {
  loadRiskAreaTop10();
  loadProductPesticideTop10();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadRiskAreaTop10();
  loadProductPesticideTop10();
});

onUnmounted(() => {
  disposeRefresh();
});
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

.rank-level-tabs {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 10px;
}

.rank-level-tab {
  min-width: 60px;
  height: 28px;
  border: 1px solid rgba(61, 167, 255, 0.42);
  background: rgba(7, 27, 66, 0.72);
  color: #9ec9ef;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    color: #ffffff;
    border-color: rgba(77, 234, 255, 0.8);
    background: linear-gradient(180deg, rgba(27, 109, 198, 0.86) 0%, rgba(8, 39, 98, 0.92) 100%);
    box-shadow: 0 0 12px rgba(77, 234, 255, 0.16);
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
