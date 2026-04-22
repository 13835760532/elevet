<template>
  <section class="left-section">
    <BigPanelCard title="农产品品类风险分布" :tabs="['检测量', '阳性率']" v-model:active-tab="categoryTab">
      <CategoryGauges :mode="categoryTab" />
    </BigPanelCard>

    <BigPanelCard title="农产品风险 TOP 10" :tabs="['检测量', '阳性率']" v-model:active-tab="riskTab">
      <Echart :options="currentRiskTopOption" :height="330" />
    </BigPanelCard>

    <BigPanelCard title="农药残留风险 TOP 10" :tabs="['检测量', '阳性率']" v-model:active-tab="pesticideTab">
      <Echart :options="currentPesticideTopOption" :height="260" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from './BigPanelCard.vue';
import CategoryGauges from './CategoryGauges.vue';
import {
  getPesticideRiskTop10,
  getProduceRiskTop10,
  type PesticideRiskTopRespVO,
  type ProduceRiskTopRespVO
} from '@/api/agri/dashboard';

const categoryTab = ref<'检测量' | '阳性率'>('检测量');
const riskTab = ref<'检测量' | '阳性率'>('检测量');
const pesticideTab = ref<'检测量' | '阳性率'>('检测量');

const produceRiskList = ref<ProduceRiskTopRespVO[]>([]);
const pesticideRiskList = ref<PesticideRiskTopRespVO[]>([]);

const fallbackRiskNames = ['芹菜', '菠菜', '韭菜', '萝卜', '青椒', '丝瓜', '南瓜', '黄瓜', '白菜', '生姜'];
const fallbackRiskRateValues = [0.9, 0.8, 0.7, 0.6, 0.52, 0.45, 0.4, 0.34, 0.29, 0.2];
const fallbackRiskCountValues = [460, 420, 390, 355, 320, 285, 260, 220, 210, 180];

const riskNames = computed(() =>
  produceRiskList.value.length
    ? produceRiskList.value.map((item) => item.productName || '--')
    : fallbackRiskNames
);
const riskValues = computed(() =>
  produceRiskList.value.length
    ? produceRiskList.value.map((item) => Number(item.statValue || 0))
    : riskTab.value === '阳性率'
    ? fallbackRiskRateValues
    : fallbackRiskCountValues
);
const riskMax = computed(() => {
  const maxValue = Math.max(...riskValues.value, 0);
  if (riskTab.value === '阳性率') {
    return Math.max(1, Math.ceil(maxValue / 0.2) * 0.2);
  }
  if (maxValue <= 0) return 100;
  return Math.ceil(maxValue * 1.1);
});
const riskRankData = computed(() => riskNames.value.map((name, index) => ({
  value: name,
  rank: index + 1
})));
const createRiskTopOption = (values: number[], max: number, formatter: (val: number) => string) => ({
  grid: { left: 120, right: 70, top: 10, bottom: 20 },
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
      data: riskRankData.value,
      axisLabel: {
        color: '#d4ebff',
        fontSize: 14,
        align: 'right',
        margin: 16,
        formatter: (_value: string, index: number) => {
          const rank = index + 1;
          const rankText = rank < 10 ? `NO.${rank}` : `NO.${rank}`;
          const colorKey = rank <= 3 ? `top${rank}` : 'normal';
          return `{${colorKey}|${rankText}} {name|${riskNames.value[index]}}`;
        },
        rich: {
          top1: {
            color: '#00ffb4',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 16
          },
          top2: {
            color: '#2ee9ff',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 16
          },
          top3: {
            color: '#ffbf30',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 16
          },
          normal: {
            color: '#e4f1ff',
            fontWeight: 700,
            fontStyle: 'italic',
            fontSize: 16
          },
          name: {
            color: '#d4ebff',
            fontSize: 16,
            fontWeight: 600
          }
        }
      },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    {
      type: 'category',
      inverse: true,
      position: 'right',
      data: values,
      axisLabel: {
        color: '#48e7ff',
        fontSize: 16,
        fontWeight: 700,
        formatter
      },
      axisTick: { show: false },
      axisLine: { show: false }
    }
  ],
  series: [
    {
      type: 'bar',
      barWidth: 14,
      itemStyle: {
        barBorderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#49e8ff' },
          { offset: 1, color: '#1d56d9' }
        ])
      },
      data: values
    }
  ]
});

const fallbackPesticideNames = ['甲氨基', '氟虫胺', '毒死蜱', '毒死蜱', '氟虫', '阿维菌素', '腈虫胺', '溴氰菊酯', '咪鲜胺'];
const fallbackPesticideRateValues = [0.82, 0.72, 0.61, 0.55, 0.46, 0.4, 0.36, 0.28, 0.21];
const fallbackPesticideCountValues = [400, 350, 300, 270, 230, 200, 180, 150, 100];

const pesticideLabels = computed(() =>
  pesticideRiskList.value.length
    ? pesticideRiskList.value.map((item) => item.pesticideName || '--')
    : fallbackPesticideNames
);
const pesticideValues = computed(() =>
  pesticideRiskList.value.length
    ? pesticideRiskList.value.map((item) => Number(item.statValue || 0))
    : pesticideTab.value === '阳性率'
    ? fallbackPesticideRateValues
    : fallbackPesticideCountValues
);
const pesticideMax = computed(() => {
  const maxValue = Math.max(...pesticideValues.value, 0);
  if (pesticideTab.value === '阳性率') {
    return Math.max(1, Math.ceil(maxValue / 0.2) * 0.2);
  }
  if (maxValue <= 0) return 100;
  return Math.ceil(maxValue * 1.1);
});

const createPesticideTopOption = (
  labels: string[],
  values: number[],
  max: number,
  formatter?: (value: number) => string
) => ({
  grid: { left: 46, right: 10, top: 24, bottom: 40 },
  xAxis: {
    type: 'category',
    data: labels,
    axisLabel: { color: '#80abd3', fontSize: 12, interval: 0, rotate: 22 },
    axisLine: { lineStyle: { color: '#2d67ac' } }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max,
    interval: max <= 1 ? 0.2 : 100,
    axisLabel: { color: '#80abd3', formatter },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.35)', type: 'dashed' } },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: values,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4be9ff' },
          { offset: 1, color: 'rgba(72, 231, 255, 0.15)' }
        ])
      }
    }
  ]
});

const currentRiskTopOption = computed(() =>
  riskTab.value === '阳性率'
    ? createRiskTopOption(riskValues.value, riskMax.value, (val: number) => `${Number(val).toFixed(2)}%`)
    : createRiskTopOption(riskValues.value, riskMax.value, (val: number) => String(Math.round(val)))
);

const currentPesticideTopOption = computed(() =>
  pesticideTab.value === '阳性率'
    ? createPesticideTopOption(
        pesticideLabels.value,
        pesticideValues.value,
        pesticideMax.value,
        (val: number) => `${Number(val).toFixed(2)}%`
      )
    : createPesticideTopOption(
        pesticideLabels.value,
        pesticideValues.value,
        pesticideMax.value,
        (val: number) => String(Math.round(val))
      )
);

const loadProduceRiskTop10 = async () => {
  try {
    const data = await getProduceRiskTop10({
      statType: riskTab.value === '阳性率' ? '2' : '1'
    });
    produceRiskList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载农产品风险 TOP10 失败', error);
    produceRiskList.value = [];
  }
};

const loadPesticideRiskTop10 = async () => {
  try {
    const data = await getPesticideRiskTop10({
      statType: pesticideTab.value === '阳性率' ? '2' : '1'
    });
    pesticideRiskList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载农药残留风险 TOP10 失败', error);
    pesticideRiskList.value = [];
  }
};

watch(
  () => riskTab.value,
  () => {
    loadProduceRiskTop10();
  }
);

watch(
  () => pesticideTab.value,
  () => {
    loadPesticideRiskTop10();
  }
);

onMounted(() => {
  loadProduceRiskTop10();
  loadPesticideRiskTop10();
});
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 350px 346px 328px;
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
