<template>
  <section class="right-quick-section">
    <BigPanelCard title="快速检测分析" :tabs="['检测量', '阳性率']" v-model:active-tab="topTab" :bg-image="rightBg">
      <div class="right-block" style="position: relative;">
        <div class="positive-count-summary">
          <span v-if="topTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span>
        </div>
        <p class="block-title">检测农产品高风险top</p>
        <Echart :options="currentTopColumnOption" :height="200" />
      </div>
    </BigPanelCard>

    <BigPanelCard
      class="rank-panel"
      title="产品·检测项目高风险top"
      :tabs="['检测项阳性率']"
      active-tab="检测项阳性率"
    >
      <Echart class="rank-chart" :options="middleBarOption" height="100%" />
    </BigPanelCard>

    <BigPanelCard
      class="rank-panel"
      title="检测项高风险top"
      :tabs="['检测项阳性率']"
      active-tab="检测项阳性率"
    >
      <Echart class="rank-chart" :options="bottomBarOption" height="100%" />
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import rightBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';
import {
  getFastCategoryTop10,
  getFastCategoryPesticideTop10,
  getFastPesticideTop10,
  type FastCategoryTopRespVO,
  type FastCategoryPesticideTopRespVO,
  type FastPesticideTopRespVO
} from '@/api/agri/dashboard/fast';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const topTab = ref('检测量');
const categoryTop10 = ref<FastCategoryTopRespVO[]>([]);
const categoryPesticideTop10 = ref<FastCategoryPesticideTopRespVO[]>([]);
const pesticideTop10 = ref<FastPesticideTopRespVO[]>([]);

const productNames = computed(() =>
  categoryPesticideTop10.value.map((item) => item.combineName || '--')
);
const productValues = computed(() =>
  categoryPesticideTop10.value.map((item) => Number(item.positiveRate || 0))
);
const categoryNames = computed(() =>
  categoryTop10.value.map((item) => item.category || '--')
);
const categoryValues = computed(() =>
  categoryTop10.value.map((item) => Number(item.statValue || 0))
);
const itemNames = computed(() =>
  pesticideTop10.value.map((item) => item.pesticideName || '--')
);
const itemValues = computed(() =>
  pesticideTop10.value.map((item) => Number(item.positiveRate || 0))
);

const topMax = computed(() => {
  const maxValue = Math.max(...categoryValues.value, 0);
  if (topTab.value === '阳性率') {
    return Math.max(1, Math.ceil(maxValue / 0.2) * 0.2);
  }
  if (maxValue <= 0) return 10;
  return Math.ceil(maxValue * 1.1);
});

const horizontalProductMax = computed(() => {
  const maxValue = Math.max(...productValues.value, 0);
  return maxValue <= 0 ? 100 : Math.ceil(maxValue * 1.1);
});

const horizontalItemMax = computed(() => {
  const maxValue = Math.max(...itemValues.value, 0);
  return maxValue <= 0 ? 100 : Math.ceil(maxValue * 1.1);
});

const formatTopValue = (value: number) =>
  topTab.value === '阳性率' ? Number(value).toFixed(2) : `${Number(value)}`;
const formatBarValue = (value: number) => Number(value).toFixed(2);

const middleBarOption = computed(() => ({
  animation: false,
  grid: { left: 122, right: 44, top: 4, bottom: 26 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: (params: any) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `${item.name}<br/>检测项阳性率：${formatBarValue(Number(item.value))}%`;
    }
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: horizontalProductMax.value,
    axisLabel: {
      color: '#a9c1dd',
      formatter: '{value}'
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
    data: productNames.value,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: '#e6f0ff',
      fontSize: 13,
      margin: 14,
      formatter: (value: string) => {
        const name = value || '';
        const maxLen = 7;
        return name.length > maxLen ? `${name.substring(0, maxLen)}...` : name;
      }
    }
  },
  series: [
    {
      type: 'bar',
      data: productValues.value,
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
        formatter: ({ value }: { value: number }) => formatBarValue(value)
      }
    }
  ]
}));

const bottomBarOption = computed(() => ({
  animation: false,
  grid: { left: 122, right: 44, top: 4, bottom: 26 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: (params: any) => {
      const item = Array.isArray(params) ? params[0] : params;
      return `${item.name}<br/>检测项阳性率：${formatBarValue(Number(item.value))}%`;
    }
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: horizontalItemMax.value,
    axisLabel: {
      color: '#a9c1dd',
      formatter: '{value}'
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
    data: itemNames.value,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: '#e6f0ff',
      fontSize: 13,
      margin: 14,
      formatter: (value: string) => {
        const name = value || '';
        const maxLen = 7;
        return name.length > maxLen ? `${name.substring(0, maxLen)}...` : name;
      }
    }
  },
  series: [
    {
      type: 'bar',
      data: itemValues.value,
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
        formatter: ({ value }: { value: number }) => formatBarValue(value)
      }
    }
  ]
}));

const currentTopColumnOption = computed(() =>
  ({
    animation: false,
    grid: { left: 34, right: 16, top: 18, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(6, 18, 42, 0.92)',
      borderColor: 'rgba(87, 226, 255, 0.35)',
      textStyle: { color: '#dff7ff' },
      formatter: (params: any) => {
        const item = Array.isArray(params) ? params[0] : params;
        return `${item.name}<br/>${topTab.value}：${formatTopValue(Number(item.value))}`;
      }
    },
    xAxis: {
      type: 'category',
      data: categoryNames.value,
      axisLabel: {
        color: '#c7d8ee',
        fontSize: 11,
        interval: 0,
        rotate: categoryNames.value.length > 6 ? 18 : 0,
        formatter: (value: string, index: number) => {
          const name = value || '';
          const maxLen = 5;
          const displayValue = name.length > maxLen ? `${name.substring(0, maxLen)}...` : name;
          return `${index + 1}.${displayValue}`;
        }
      },
      axisTick: { show: false },
      axisLine: {
        lineStyle: { color: 'rgba(140, 167, 196, 0.35)' }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: topMax.value,
      axisLabel: {
        color: '#a9c1dd',
        formatter: '{value}'
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
        data: categoryValues.value,
        barWidth: 18,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#58ddff' },
            { offset: 1, color: '#163d78' }
          ])
        },
        label: {
          show: false,
          formatter: ({ value }: { value: number }) => formatTopValue(value)
        }
      }
    ]
  })
);

const loadCategoryTop10 = async () => {
  try {
    const data = await getFastCategoryTop10({
      ...getBigScreenQueryParams(),
      statType: topTab.value === '阳性率' ? '2' : '1'
    });
    categoryTop10.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载农产品品类 TOP10 失败', error);
    categoryTop10.value = [];
  }
};

const loadPesticideTop10 = async () => {
  try {
    const data = await getFastPesticideTop10(getBigScreenQueryParams());
    pesticideTop10.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载检测项 TOP10 失败', error);
    pesticideTop10.value = [];
  }
};

const loadCategoryPesticideTop10 = async () => {
  try {
    const data = await getFastCategoryPesticideTop10(getBigScreenQueryParams());
    categoryPesticideTop10.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载产品品类-检测项 TOP10 失败', error);
    categoryPesticideTop10.value = [];
  }
};

onMounted(() => {
  loadCategoryTop10();
  loadCategoryPesticideTop10();
  loadPesticideTop10();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadCategoryTop10();
  loadCategoryPesticideTop10();
  loadPesticideTop10();
});

onUnmounted(() => {
  disposeRefresh();
});

watch(topTab, () => {
  loadCategoryTop10();
});
</script>

<style scoped lang="scss">
.right-quick-section {
  display: grid;
  grid-template-rows: 280px 1fr 1fr;
  gap: 10px;
  min-height: 0;
}

.right-block {
  .block-title {
    margin: 0 0 4px;
    color: #9ec2e5;
    font-size: 14px;
    font-weight: 700;
  }
}

:deep(.panel-body) {
  padding: 10px 10px 8px;
}

.rank-panel {
  :deep(.panel-header) {
    background: none !important;
    height: 36px !important;
    flex: 0 0 36px !important;
  }

  :deep(.panel-title) {
    padding-left: 10px !important;
    color: #88c9e6 !important;
    line-height: 36px !important;
  }

  :deep(.panel-tab) {
    border-top: none !important;
    height: 26px !important;
    line-height: 26px !important;
  }

  :deep(.panel-body) {
    padding-top: 0 !important;
  }

  :deep(.rank-chart) {
    flex: 1;
    height: 0 !important;
    min-height: 0;
  }
}

.positive-count-summary {
  position: absolute;
  top: 8px;
  right: 22px;
  z-index: 3;
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: rgba(214, 234, 255, 0.78);
  font-size: 14px;
  line-height: 18px;
  pointer-events: none;

  strong {
    color: #57e2ff;
    font-size: 16px;
    font-weight: 700;
    font-family: 'DIN Alternate', Arial, sans-serif;
    text-shadow: 0 0 8px rgba(87, 226, 255, 0.4);
  }
}
</style>
