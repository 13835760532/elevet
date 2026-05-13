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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
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
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config';

const categoryTab = ref<'检测量' | '阳性率'>('检测量');
const riskTab = ref<'检测量' | '阳性率'>('检测量');
const pesticideTab = ref<'检测量' | '阳性率'>('检测量');

const produceRiskList = ref<ProduceRiskTopRespVO[]>([]);
const pesticideRiskList = ref<PesticideRiskTopRespVO[]>([]);

const riskNames = computed(() =>
  produceRiskList.value.map((item) => item.productName || '--')
);
const riskValues = computed(() =>
  produceRiskList.value.map((item) => Number(item.statValue || 0))
);
const riskMax = computed(() => {
  const maxValue = Math.max(...riskValues.value, 0);
  if (riskTab.value === '阳性率') {
    return Math.max(1, Math.ceil(maxValue / 0.2) * 0.2);
  }
  if (maxValue <= 0) return 100;
  return Math.ceil(maxValue * 1.1);
});
const pesticideLabels = computed(() =>
  pesticideRiskList.value.map((item) => item.pesticideName || '--')
);
const pesticideValues = computed(() =>
  pesticideRiskList.value.map((item) => Number(item.statValue || 0))
);
const pesticideMax = computed(() => {
  const maxValue = Math.max(...pesticideValues.value, 0);
  if (pesticideTab.value === '阳性率') {
    return Math.max(1, Math.ceil(maxValue / 0.2) * 0.2);
  }
  if (maxValue <= 0) return 100;
  return Math.ceil(maxValue * 1.1);
});

const formatRiskValue = (value: number, mode: '检测量' | '阳性率') =>
  mode === '阳性率' ? Number(value).toFixed(2) : `${Number(value)}`;

const currentRiskTopOption = computed(() => ({
  animation: false,
  grid: { left: 98, right: 42, top: 14, bottom: 18 },
  xAxis: {
    type: 'value',
    min: 0,
    max: riskMax.value,
    axisLabel: {
      color: '#a9c1dd',
      formatter: riskTab.value === '阳性率' ? '{value}' : '{value}'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(54, 114, 181, 0.22)',
        type: 'dashed'
      }
    },
    axisLine: {
      lineStyle: { color: 'rgba(140, 167, 196, 0.35)' }
    },
    axisTick: { show: true, lineStyle: { color: 'rgba(140, 167, 196, 0.35)' } }
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: riskNames.value,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: '#e6f0ff',
      fontSize: 14,
      margin: 18,
      formatter: (value: string, index: number) => {
        const rank = `NO.${index + 1}`;
        const rich = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'normal';
        return `{${rich}|${rank}}  ${value}`;
      },
      rich: {
        top1: { color: '#2de17c', fontStyle: 'italic', fontWeight: 700 },
        top2: { color: '#37d4ff', fontStyle: 'italic', fontWeight: 700 },
        top3: { color: '#f6be35', fontStyle: 'italic', fontWeight: 700 },
        normal: { color: '#e6f0ff', fontStyle: 'italic', fontWeight: 600 }
      }
    }
  },
  series: [
    {
      type: 'bar',
      data: riskValues.value,
      barWidth: 14,
      showBackground: true,
      backgroundStyle: {
        color: 'rgba(16, 40, 78, 0.7)',
        borderRadius: 7
      },
      itemStyle: {
        borderRadius: 7,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#183b72' },
          { offset: 1, color: '#56c8ff' }
        ])
      },
      label: {
        show: true,
        position: 'right',
        distance: 10,
        color: '#57e2ff',
        fontSize: 14,
        fontWeight: 700,
        formatter: ({ value }: { value: number }) => formatRiskValue(value, riskTab.value)
      }
    }
  ]
}));

const currentPesticideTopOption = computed(() => ({
  animation: false,
  grid: { left: 44, right: 16, top: 26, bottom: 40 },
  xAxis: {
    type: 'category',
    data: pesticideLabels.value,
    axisLabel: {
      color: '#c7d8ee',
      fontSize: 12,
      interval: 0,
      rotate: pesticideLabels.value.length > 6 ? 18 : 0
    },
    axisTick: { show: false },
    axisLine: {
      lineStyle: { color: 'rgba(140, 167, 196, 0.35)' }
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: pesticideMax.value,
    axisLabel: {
      color: '#a9c1dd',
      fontSize: 12,
      formatter: pesticideTab.value === '阳性率' ? '{value}' : '{value}'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(54, 114, 181, 0.22)',
        type: 'dashed'
      }
    },
    axisTick: { show: false },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'bar',
      data: pesticideValues.value,
      barWidth: 30,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4fdcff' },
          { offset: 1, color: '#163d78' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        color: '#57e2ff',
        fontSize: 14,
        fontWeight: 700,
        formatter: ({ value }: { value: number }) => formatRiskValue(value, pesticideTab.value)
      }
    }
  ]
}));

const loadProduceRiskTop10 = async () => {
  try {
    const data = await getProduceRiskTop10({
      ...getBigScreenQueryParams(),
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
      ...getBigScreenQueryParams(),
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

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadProduceRiskTop10();
  loadPesticideRiskTop10();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: 350px 346px 328px;
  gap: 14px;
}
</style>
