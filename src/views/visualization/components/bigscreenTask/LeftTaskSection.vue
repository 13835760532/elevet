<template>
  <section class="left-section">

    <BigPanelCard title="任务下发概况" :bg-image="leftBg">
      <template #title-extra>
        <el-tooltip placement="bottom-end" popper-class="bigscreen-task-tooltip" effect="dark">
          <template #content>
            <div class="tooltip-text-content">
              任务下发量：本机构任务下发总量（统计：下发任务样品量）；<br />
              任务完成量：本机构下发任务完成量（统计：已下发任务完成抽样量）；<br />
              任务完成率：本机构的“任务下发量/完成任务量”；<br />
              <br />
              样品总量：本机构的“全部检测样品量”；<br />
              检测项总量：本机构的“全部样品总检测量”；<br />
              合格证开具：本机构的“合格证累计开具份数”；<br />
              合格证收证：本机构的“合格证累计收证份数”；
            </div>
          </template>
          <span class="question-icon">?</span>
        </el-tooltip>
      </template>
      <div class="summary-flex">
        <div class="summary-item" v-for="(item, index) in summaryData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value }}</span>
              <span class="unit" v-if="item.unit">{{ item.unit }}</span>
              <!-- 全息投影效果 -->
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <div v-if="index < summaryData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="快速检测概况" :bg-image="leftBg">
      <template #title-extra>
        <el-tooltip placement="bottom-end" popper-class="bigscreen-task-tooltip" effect="dark">
          <template #content>
            <div class="tooltip-text-content">
              样品总量：本机构“任务执行抽样量+自主检测抽样量”；<br />
              检测总量：本机构“任务执行+自主检测”的全部样品检测项总量；<br />
              检测阳性率：本机构全部样品检测项的阳性率，即“检测项阳性量/检测总量”；<br />
              任务完成量：本机构执行任务的“抽样数量”；<br />
              任务完成率：本机构“任务完成量/任务接收量”；<br />
              快速检测（本机构执行检测数据）
            </div>
          </template>
          <span class="question-icon">?</span>
        </el-tooltip>
      </template>
      <div class="summary-flex">
        <div class="summary-item" v-for="(item, index) in fastSummaryData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value }}</span>
              <span class="unit" v-if="item.unit">{{ item.unit }}</span>
              <!-- 全息投影效果 -->
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <div v-if="index < fastSummaryData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="任务覆盖群体" :bg-image="leftBg">
      <div class="cover-flex">
        <div class="cover-dial" v-for="(item, index) in coverData" :key="item.label">
          <div class="dial-wrap">
            <div class="dial-outer"></div>
            <img :src="item.icon" class="dial-icon" />
          </div>
          <div class="dial-info">
            <p class="label">{{ item.label }}</p>
            <p class="value">{{ item.value }}</p>
          </div>
          <div v-if="index === 0" class="dial-separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="检测样品品类" :bg-image="leftBg">
      <BigDataEmpty
        v-if="categoryEmpty"
        title="暂无品类数据"
        description="当前筛选范围未返回检测样品品类"
        compact
      />
      <div v-else class="category-layout">
        <div class="pie-container">
          <Echart :options="categoryPieOption" height="100%" width="100%" />
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
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import BigDataEmpty from '../bigscreen/BigDataEmpty.vue';
import leftBg from '@/assets/imgs/echarts/检测任务/erji_bg.png';
import iconOrg from '@/assets/imgs/echarts/检测任务/68.png';
import iconFactory from '@/assets/imgs/echarts/检测任务/69.png';
import {
  getTaskCategoryDistribution,
  getTaskOverview,
  type DashboardTaskOverviewRespVO,
  type TaskCategoryDistributionRespVO
} from '@/api/agri/dashboard/task';
import { getFastOverview, type DashboardFastOverviewRespVO } from '@/api/agri/dashboard/fast';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const overview = ref<DashboardTaskOverviewRespVO>({});
const fastOverview = ref<DashboardFastOverviewRespVO>({});
const categoryDistribution = ref<TaskCategoryDistributionRespVO[]>([]);
const categoryColors = ['#3f6dff', '#ffb22c', '#3ba4ff', '#d8efff', '#39e3e7', '#8ad64c', '#7d60ff', '#ff8a34'];

const formatCount = (value?: number) => Number(value || 0);
const formatRate = (value?: number) => Number(value || 0).toFixed(0);

const summaryData = computed(() => [
  { label: '任务下发量', value: formatCount(overview.value.taskIssuedCount), unit: '批次' },
  { label: '任务完成量', value: formatCount(overview.value.taskCompletedCount), unit: '批次' },
  { label: '任务完成率', value: formatRate(overview.value.taskCompletionRate), unit: '%' }
]);

const fastSummaryData = computed(() => [
  { label: '样品总量', value: formatCount(fastOverview.value.sampleBatchCount), unit: '批次' },
  { label: '检测总量', value: formatCount(fastOverview.value.detectionItemCount), unit: '项次' },
  { label: '检测阳性率', value: formatRate(fastOverview.value.itemPositiveRate), unit: '%' }
]);

const coverData = computed(() => [
  { label: '检测机构', value: formatCount(overview.value.detectionOrgCount), icon: iconOrg },
  { label: '生产经营主体', value: formatCount(overview.value.enterpriseCount), icon: iconFactory }
]);

/** 加载检测任务概览指标。 */
const loadOverviewData = async () => {
  try {
    const data = await getTaskOverview(getBigScreenQueryParams());
    overview.value = data || {};
  } catch (error) {
    console.error('加载检测任务概览失败', error);
    overview.value = {};
  }
};

/** 加载快速检测概览，用于任务大屏的补充业务指标。 */
const loadFastOverviewData = async () => {
  try {
    const data = await getFastOverview(getBigScreenQueryParams());
    fastOverview.value = data || {};
  } catch (error) {
    console.error('加载快速检测概览失败', error);
    fastOverview.value = {};
  }
};

const categoryItems = computed(() => {
  const orderedCategories = ['蔬菜', '水果', '畜禽', '水产', '茶叶', '食用菌', '谷物', '其他'];
  const distMap = new Map(
    categoryDistribution.value.map((item) => [item.category, Number(item.sampleCount || 0)])
  );
  return orderedCategories.map((name, index) => {
    const value = distMap.get(name) || 0;
    return {
      name,
      value,
      color: categoryColors[index % categoryColors.length]
    };
  });
});

const pieItems = computed(() => categoryItems.value.filter((item) => item.value > 0));
const categoryEmpty = computed(() => pieItems.value.length === 0);

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
      radius: ['66%', '78%'],
      center: ['38%', '50%'],
      silent: true,
      z: 0,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        borderColor: 'rgba(7, 16, 38, 0.96)',
        borderWidth: 5,
        opacity: 0.22,
        shadowBlur: 10,
        shadowColor: 'rgba(33, 151, 255, 0.38)'
      },
      data: pieItems.value.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color
        }
      }))
    },
    {
      type: 'pie',
      radius: ['48%', '66%'],
      center: ['38%', '50%'],
      minAngle: 6,
      avoidLabelOverlap: true,
      z: 2,
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
        length: 10,
        length2: 14,
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
          color: item.color
        }
      }))
    }
  ]
}));

/** 加载任务样品品类分布，并按固定业务品类顺序展示。 */
const loadCategoryDistribution = async () => {
  try {
    const data = await getTaskCategoryDistribution(getBigScreenQueryParams());
    categoryDistribution.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('加载检测任务品类分布失败', error);
    categoryDistribution.value = [];
  }
};

onMounted(() => {
  loadOverviewData();
  loadCategoryDistribution();
  loadFastOverviewData();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadOverviewData();
  loadCategoryDistribution();
  loadFastOverviewData();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr);
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.summary-flex {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
}

.summary-item {
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
    margin-bottom: 6px;
  }

  .value-container {
    position: relative;
    padding-bottom: 30px;

    .value {
      color: #7feaff;
      font-size: 28px;
      line-height: 1;
      font-weight: 700;
      font-family: 'DIN Alternate', sans-serif;
      text-shadow: 0 0 15px rgba(127, 234, 255, 0.5);
    }

    .unit {
      color: #a7caea;
      font-size: 16px;
      margin-left: 4px;
      font-weight: normal;
      text-shadow: none;
    }

    .holographic-img {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: auto;
      pointer-events: none;
      animation: float 3s ease-in-out infinite;
    }
  }

  .separator {
    width: 1px;
    height: 100%;
    background: linear-gradient(to bottom, transparent, rgba(66, 142, 228, 0.4), transparent);
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
  }
}

.hologram-pedestal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 40px;

  .light-beam {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 70px;
    background: radial-gradient(ellipse at bottom, rgba(0, 218, 255, 0.35) 0%, transparent 75%);
    clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
  }

  .pedestal-ring {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%) rotateX(65deg);
    width: 70px;
    height: 70px;
    border: 2px solid rgba(0, 218, 255, 0.8);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 218, 255, 0.7), inset 0 0 10px rgba(0, 218, 255, 0.4);
    background: radial-gradient(circle, rgba(0, 218, 255, 0.15) 0%, transparent 80%);
  }
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

.category-layout {
  width: 100%;
  height: 100%;
  padding-top: 10px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  align-items: center;
  gap: 10px;
}

.pie-container {
  width: 100%;
  height: 100%;
}

.category-legend {
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(4, 1fr);
  grid-auto-flow: column;
  padding: 8px 0;
  gap: 8px 12px;
  overflow: hidden;
}

.category-legend::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.legend-row {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  align-items: center;
  gap: 4px;
  min-height: 16px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 0;
    box-shadow: 0 0 8px rgba(87, 226, 255, 0.22);
  }

  .name {
    color: #cdd9df;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value {
    display: none;
  }
}

@keyframes dialRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.question-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 6px;
  line-height: 1;
  transition: all 0.2s ease;
  user-select: none;
}

.question-icon:hover {
  border-color: #57e2ff;
  color: #57e2ff;
  background: rgba(87, 226, 255, 0.1);
}
</style>

<style lang="scss">
.bigscreen-task-tooltip.el-popper {
  background: rgba(6, 18, 42, 0.96) !important;
  border: 1px solid rgba(87, 226, 255, 0.45) !important;
  color: #dff7ff !important;
  --el-bg-color-overlay: rgba(6, 18, 42, 0.96) !important;
  --el-border-color-light: rgba(87, 226, 255, 0.45) !important;

  .tooltip-text-content {
    font-size: 14px;
    line-height: 1.8;
    color: #dff7ff !important;
    font-family: sans-serif;
  }
}
</style>
