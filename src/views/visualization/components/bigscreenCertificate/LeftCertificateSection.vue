<template>
  <section class="left-section">
    <BigScreenSelector label="年度合格证总览" />

    <BigPanelCard title="合格证概况" :bg-image="leftBg">
      <div class="overview-grid">
        <div class="overview-card" :class="item.type" v-for="item in overviewData" :key="item.label">
          <!-- 装饰角 -->
          <div class="corner-mark top-left"></div>
          <div class="corner-mark bottom-right"></div>

          <div class="card-inner">
            <div class="card-label">{{ item.label }}</div>
            <div class="card-body">
              <div class="icon-box">
                <img src="@/assets/imgs/echarts/合格证/icon.png" alt="">
              </div>
              <div class="num-box">
                <span class="value-text">{{ item.value }}</span>
                <span class="unit-text">{{ item.unit }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证服务主体" :bg-image="leftBg">
      <div class="subject-grid">
        <div class="subject-item" v-for="(item, index) in subjectData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value }}</span>
              <!-- 全息投影效果 -->
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <!-- 分隔线 -->
          <div v-if="index < subjectData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="各品类合格证开具量" :bg-image="leftBg">
      <div class="category-layout">
        <div class="pie-container">
          <Echart :options="categoryPieOption" height="230px" width="100%" />
        </div>
        <div class="category-legend">
          <div class="legend-row" v-for="item in categoryItems" :key="item.name">
            <span class="dot" :style="{ background: item.color }"></span>
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import echarts from '@/plugins/echarts';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import BigScreenSelector from '../bigscreen/BigScreenSelector.vue';
import leftBg from '@/assets/imgs/echarts/合格证/Frame 58_bg.png';
import {
  getCertificateCategoryDistribution,
  getCertificateOverview,
  type CertificateCategoryDistributionRespVO,
  type DashboardCertificateOverviewRespVO
} from '@/api/agri/dashboard/certificate';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const overview = ref<DashboardCertificateOverviewRespVO>({});
const categoryDistribution = ref<CertificateCategoryDistributionRespVO[]>([]);
const categoryColors = [
  '#3f6dff',
  '#ffb22c',
  '#3ba4ff',
  '#d8efff',
  '#39e3e7',
  '#8ad64c',
  '#7d60ff',
  '#ff8a34'
];

const overviewData = computed(() => [
  { label: '合格证开具', value: Number(overview.value.issueCount || 0), unit: '份', type: 'blue' },
  {
    label: '合格证存证',
    value: Number(overview.value.verificationCount || 0),
    unit: '份',
    type: 'green'
  },
  { label: '合格证溯源', value: Number(overview.value.traceCount || 0), unit: '次', type: 'orange' }
]);

const subjectData = computed(() => [
  { label: '开具主体', value: Number(overview.value.issueSubjectCount || 0) },
  { label: '存证主体', value: Number(overview.value.verificationSubjectCount || 0) }
]);

const loadOverviewData = async () => {
  try {
    const data = await getCertificateOverview(getBigScreenQueryParams());
    overview.value = data || {};
  } catch (error) {
    console.error('加载合格证概览数据失败', error);
    overview.value = {};
  }
};

const categoryItems = computed(() =>
  [...categoryDistribution.value]
    .map((item) => ({
      name: item.category || '--',
      value: Number(item.issueCount || 0)
    }))
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      color: categoryColors[index % categoryColors.length]
    }))
);

const pieItems = computed(() => categoryItems.value.filter((item) => item.value > 0));

const categoryPieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: ({ name, value }: { name: string; value: number }) => `${name}<br/>${value}`
  },
  series: [
    {
      type: 'pie',
      radius: ['42%', '62%'],
      center: ['38%', '50%'],
      minAngle: 6,
      avoidLabelOverlap: true,
      label: {
        show: true,
        color: '#d6eefe',
        fontSize: 12,
        formatter: (params: { name: string; value: number }) =>
          params.value > 0 ? `{name|${params.name}}\n{value|${params.value}}` : '',
        rich: {
          name: { color: '#d6eefe', fontSize: 12, lineHeight: 16 },
          value: { color: '#57e2ff', fontSize: 12, lineHeight: 16, fontWeight: 700 }
        }
      },
      labelLine: {
        show: true,
        length: 14,
        length2: 18,
        lineStyle: { color: 'rgba(255,255,255,0.85)', width: 1.2 }
      },
      itemStyle: {
        borderColor: 'rgba(7, 16, 38, 0.96)',
        borderWidth: 4,
        shadowBlur: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)'
      },
      data: pieItems.value.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: item.color },
            { offset: 1, color: 'rgba(15, 52, 95, 0.9)' }
          ])
        }
      }))
    }
  ]
}));

const loadCategoryDistribution = async () => {
  try {
    const data = await getCertificateCategoryDistribution(getBigScreenQueryParams());
    categoryDistribution.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载合格证品类分布失败', error);
    categoryDistribution.value = [];
  }
};

onMounted(() => {
  loadOverviewData();
  loadCategoryDistribution();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadOverviewData();
  loadCategoryDistribution();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: auto 0.8fr 0.6fr 1.1fr;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 10px 4px;
}


.overview-card {
  position: relative;
  height: 100px;
  background: rgba(14, 39, 90, 0.4);
  border: 1px solid rgba(37, 137, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  .corner-mark {
    position: absolute;
    width: 14px;
    height: 14px;

    &.top-left {
      top: 0;
      left: 0;
      border-top: 2px solid var(--theme-color);
      border-left: 2px solid var(--theme-color);
    }

    &.bottom-right {
      bottom: 0;
      right: 0;
      border-bottom: 2px solid var(--theme-color);
      border-right: 2px solid var(--theme-color);
    }
  }

  .card-inner {
    width: 100%;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card-label {
    font-size: 16px;
    color: #9ec2e6;
    margin-bottom: 6px;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(158, 194, 230, 0.3);
    margin-left: 10px;
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon-box {
    width: 44px;

    img {
      width: 100%;
      height: auto;
    }
  }

  .num-box {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .value-text {
      font-family: 'DIN Alternate', 'Inter', sans-serif;
      font-size: 34px;
      font-weight: 800;
      background: linear-gradient(to bottom, #ffffff 30%, var(--theme-light-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 8px var(--theme-glow-color));
      line-height: 1;
      margin-left: 0px;
    }

    .unit-text {
      font-size: 16px;
      color: #9ec2e6;
      opacity: 0.8;
    }
  }

  // 主题配色
  &.blue {
    --theme-color: #2589ff;
    --theme-light-color: #8cecff;
    --theme-glow-color: rgba(37, 137, 255, 0.6);
  }

  &.green {
    --theme-color: #00ffb4;
    --theme-light-color: #a7ffeb;
    --theme-glow-color: rgba(0, 255, 180, 0.5);
  }

  &.cyan {
    --theme-color: #00e5ff;
    --theme-light-color: #80f3ff;
    --theme-glow-color: rgba(0, 229, 255, 0.5);
  }

  &.orange {
    --theme-color: #ff9900;
    --theme-light-color: #ffcc80;
    --theme-glow-color: rgba(255, 153, 0, 0.5);
  }
}

.subject-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 30px;
}

.subject-item {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;

  .item-inner {
    width: 100%;
    text-align: center;
  }

  .label {
    margin: 0;
    color: #a7caea;
    font-size: 15px;
    margin-bottom: 8px;
  }

  .value-container {
    position: relative;
    padding-bottom: 25px;

    .value {
      color: #7feaff;
      font-size: 38px;
      line-height: 1;
      font-weight: 700;
      font-family: 'DIN Alternate', sans-serif;
      text-shadow: 0 0 10px rgba(127, 234, 255, 0.5);
    }

    .holographic-img {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 50px;
      pointer-events: none;
    }
  }

  .separator {
    width: 2px;
    height: 80px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent);
    position: absolute;
    right: 0;
    top: 20px;
  }
}

.hologram-effect {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 40px;
  pointer-events: none;

  .light-beam {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    background: radial-gradient(ellipse at bottom, rgba(0, 218, 255, 0.35) 0%, transparent 70%);
    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
  }

  .pedestal {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%) rotateX(65deg);
    width: 60px;
    height: 60px;

    .ring-1 {
      position: absolute;
      inset: 0;
      border: 2px solid rgba(0, 218, 255, 0.8);
      border-radius: 50%;
      box-shadow: 0 0 15px rgba(0, 218, 255, 0.6), inset 0 0 10px rgba(0, 218, 255, 0.4);
    }

    .ring-2 {
      position: absolute;
      inset: 8px;
      border: 1px solid rgba(0, 218, 255, 0.4);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 218, 255, 0.2) 0%, transparent 80%);
    }
  }
}

.category-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  align-items: center;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.pie-container {
  min-width: 0;
  height: 230px;
  padding-top: 4px;
}

.category-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 230px;
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(65, 190, 255, 0.5);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(8, 18, 42, 0.35);
  }
}

.legend-row {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(52, 116, 195, 0.55);
  background: linear-gradient(90deg, rgba(23, 51, 92, 0.78), rgba(10, 24, 56, 0.52));
  box-shadow: inset 0 0 16px rgba(66, 159, 255, 0.1);
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(87, 226, 255, 0.28);
}

.name {
  min-width: 0;
  color: #d6eefe;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value {
  color: #57e2ff;
  font-family: 'DIN Alternate', 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 700;
}
</style>
