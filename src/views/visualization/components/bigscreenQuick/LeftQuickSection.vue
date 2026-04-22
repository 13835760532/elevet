<template>
  <section class="left-section">
    <BigScreenSelector />

    <BigPanelCard title="快速检测概况" :bg-image="leftBg">
      <div class="subject-grid">
        <div class="subject-item" v-for="(item, index) in overviewData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value }}</span>
              <!-- 全息投影效果 -->
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <!-- 分隔线 -->
          <div v-if="index < overviewData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="快检覆盖范围" :bg-image="leftBg">
      <div class="cover-flex">
        <div class="cover-dial" v-for="(item, index) in subjectData" :key="item.label">
          <div class="dial-wrap">
            <div class="dial-outer"></div>
            <img :src="item.icon" class="dial-icon" />
          </div>
          <div class="dial-info">
            <p class="label">{{ item.label }}</p>
            <p class="value">{{ item.value }}</p>
          </div>
          <div v-if="index === 0" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="快检产品品类" :bg-image="leftBg">
      <div class="pie-wrap" style="height: 260px;">
        <Echart :options="categoryPieOption" :height="240" width="100%" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import BigScreenSelector from '../bigscreen/BigScreenSelector.vue';
import leftBg from '@/assets/imgs/echarts/合格证/Frame 58_bg.png';
import iconOrg from '@/assets/imgs/echarts/检测任务/68.png';
import iconFactory from '@/assets/imgs/echarts/检测任务/69.png';
import {
  getFastCategoryDistribution,
  getFastOverview,
  type DashboardFastOverviewRespVO,
  type FastCategoryDistributionRespVO
} from '@/api/agri/dashboard/fast';

const overview = ref<DashboardFastOverviewRespVO>({});
const categoryDistribution = ref<FastCategoryDistributionRespVO[]>([]);

const overviewData = computed(() => [
  { label: '样品批次', value: Number(overview.value.sampleBatchCount || 0), unit: '', type: 'blue' },
  { label: '检测项次', value: Number(overview.value.detectionItemCount || 0), unit: '', type: 'green' },
  {
    label: '检测项阳性率',
    value: Number(overview.value.itemPositiveRate || 0),
    unit: '%',
    type: 'cyan'
  }
]);

const subjectData = computed(() => [
  { label: '生产经营主体', value: Number(overview.value.enterpriseCount || 0), icon: iconOrg },
  { label: '农产品品种', value: Number(overview.value.productVarietyCount || 0), icon: iconFactory }
]);

const loadOverview = async () => {
  try {
    const data = await getFastOverview();
    overview.value = data || {};
  } catch (error) {
    console.error('加载快速检测概览失败', error);
    overview.value = {};
  }
};

const pieColors = ['#3b82f6', '#f59e0b', '#06b6d4', '#cbd5e1', '#22d3ee', '#34d399', '#f97316'];

const categoryPieOption = reactive({
  tooltip: { trigger: 'item' },
  legend: {
    orient: 'vertical',
    right: 20,
    top: 'center',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { color: '#8eb6db', fontSize: 14 },
    data: []
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c|{c}}',
        padding: [0, -20],
        rich: {
          c: {
            color: '#4ce9ff',
            fontSize: 14,
            fontWeight: 'bold',
            padding: [4, 0]
          }
        },
        color: '#bbdbfa',
        fontSize: 14
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 25,
        lineStyle: { color: 'rgba(187, 219, 250, 0.5)' }
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: '#020617'
      },
      data: [],
      color: pieColors
    }
  ]
});

const updateCategoryChart = (list: FastCategoryDistributionRespVO[] = []) => {
  const chartData = list.map((item) => ({
    value: Number(item.sampleCount || 0),
    name: item.category || '--'
  }));
  categoryPieOption.legend.data = chartData.map((item) => item.name);
  categoryPieOption.series[0].data = chartData;
};

const loadCategoryDistribution = async () => {
  try {
    const data = await getFastCategoryDistribution();
    categoryDistribution.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载快速检测品类分布失败', error);
    categoryDistribution.value = [];
  }
  updateCategoryChart(categoryDistribution.value);
};

onMounted(() => {
  loadOverview();
  loadCategoryDistribution();
});
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: auto 200px 200px minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  padding-top: 18px;
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

}

.separator {
  width: 2px;
  height: 80px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent);
  position: absolute;
  right: 0;
  top: 20px;
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

.pie-wrap {
  width: 100%;
  height: 100%;
  padding-top: 10px;
}

.cover-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
}

.cover-dial {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  padding-top: 20px;

  .dial-wrap {
    position: relative;
    width: 80px;
    height: 80px;

    .dial-outer {
      position: absolute;
      inset: -4px;
      border: 2px dashed rgba(58, 226, 255, 0.4);
      border-radius: 50%;
      animation: dialRotate 10s linear infinite;
    }

    .dial-inner {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(14, 39, 90, 0.6) 0%, rgba(7, 20, 50, 0.9) 100%);
      border: 2px solid rgba(58, 226, 255, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(58, 226, 255, 0.3);

      &::after {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(58, 226, 255, 0.2);
        border-radius: 50%;
      }
    }

    .dial-icon {
      width: 80px;
      height: 80px;
      z-index: 2;
      filter: drop-shadow(0 0 5px rgba(58, 226, 255, 0.5));
    }
  }

  .dial-info {
    .label {
      margin: 0;
      color: #9ebfe0;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .value {
      margin: 0;
      color: #7ce9ff;
      font-family: 'DIN Alternate', sans-serif;
      font-size: 38px;
      font-weight: 700;
      line-height: 1;
    }
  }

  .dial-separator {
    width: 1px;
    height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
    position: absolute;
    right: -20px;
  }
}
</style>
