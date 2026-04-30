<template>
  <header class="screen-header">
    <div class="header-side left">
      <!-- 数据配置 -->
      <div v-if="showDataConfig" class="data-config-btn" @click="toggleConfig">
        <div class="hexagon-icon">
          <div class="inner-dot"></div>
        </div>
        <span class="btn-label">数据配置</span>
        <div class="caret-icon"></div>
      </div>

      <div class="nav-btn" v-for="item in leftMenus" :key="item.key" :class="{ active: activeMenu === item.key }"
        :style="{ backgroundImage: `url(${activeMenu === item.key ? item.activeBg : item.bg})` }"
        @click="$emit('update:activeMenu', item.key)">
        <span class="btn-label"></span>
      </div>
      <!-- 数据配置弹窗 -->
      <div v-if="showConfig" class="data-config-panel">
        <div class="panel-header">
          <div class="header-icon-double">
            <span></span>
            <span></span>
          </div>
          <span class="header-title">数据配置</span>
        </div>

        <div class="panel-body">
          <div class="form-item">
            <div class="item-label">数据时间范围</div>
            <div class="field-shell">
              <el-date-picker
                v-model="configForm.timeRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="large"
                :teleported="false"
                class="custom-date-picker"
                popper-class="big-screen-date-popper"
              />
            </div>
          </div>

          <div class="form-item">
            <div class="item-label">数据地区设置</div>
            <div class="field-shell">
              <el-cascader
                v-model="configForm.regionPath"
                :options="areaOptions"
                :props="areaCascaderProps"
                :show-all-levels="false"
                :teleported="false"
                separator="-"
                filterable
                clearable
                size="large"
                class="custom-cascader"
                popper-class="big-screen-area-popper"
              />
            </div>
          </div>

          <div class="form-item">
            <div class="item-label">风险公告更新频次</div>
            <div class="frequency-input">
              <span>每</span>
              <el-input-number v-model="configForm.frequency" :min="1" :controls="false" size="small"
                class="custom-number-input" />
              <span>分钟更新一次</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <el-button class="save-btn" @click="saveConfig">保存配置</el-button>
          <el-button class="cancel-btn" @click="showConfig = false">取消</el-button>
        </div>
      </div>
    </div>
    <div class="header-center">
      <h1>链安食检数智服务平台</h1>
    </div>
    <div class="header-side right">
      <div class="nav-btn" v-for="item in rightMenus" :key="item.key" :class="{ active: activeMenu === item.key }"
        :style="{ backgroundImage: `url(${activeMenu === item.key ? item.activeBg : item.bg})` }"
        @click="$emit('update:activeMenu', item.key)">
        <span class="btn-label"></span>
      </div>
      <div class="assistant-badge">
        <div class="assistant-text">
          <strong>我是小壹</strong>
          <span>有任何问题都可以找我哦~</span>
        </div>
        <img :src="botImg" alt="assistant" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue';
import { ElMessage } from 'element-plus';
import { List, Aim, Checked, Bell } from '@element-plus/icons-vue';
import { getAreaTree } from '@/api/system/area';
import botImg from '@/assets/imgs/echarts/bot.png';
import dataConfigBg from '@/assets/imgs/echarts/首页/sjpz_bg.png';
import taskBg from '@/assets/imgs/echarts/首页/jcrw_nor.png';
import taskBgActive from '@/assets/imgs/echarts/首页/jcrw_pr.png';
import inspectBg from '@/assets/imgs/echarts/首页/jiance_nor.png';
import inspectBgActive from '@/assets/imgs/echarts/首页/jiance_pr.jpg';
import certBg from '@/assets/imgs/echarts/首页/hegezheng_nor.png';
import certBgActive from '@/assets/imgs/echarts/首页/hgz_pr.png';
import warnBg from '@/assets/imgs/echarts/首页/xyyj_nor.png';
import warnBgActive from '@/assets/imgs/echarts/首页/xyyj_pr.png';
import {
  dispatchBigScreenRefresh,
  getBigScreenConfig,
  getDefaultBigScreenConfig,
  saveBigScreenConfig,
  type BigScreenDataConfig
} from './config';

const props = withDefaults(
  defineProps<{
    showDataConfig?: boolean;
    activeMenu?: '' | 'task' | 'inspect' | 'cert' | 'warn';
  }>(),
  {
    showDataConfig: true,
    activeMenu: ''
  }
);
const { showDataConfig, activeMenu } = toRefs(props);
const emit = defineEmits(['update:activeMenu', 'toggleConfig']);

interface AreaNodeRespVO {
  id: number
  name: string
  children?: AreaNodeRespVO[]
}

const showConfig = ref(false);
const areaOptions = ref<AreaNodeRespVO[]>([]);
let refreshTimer: number | null = null;
const configForm = reactive({
  timeRange: getDefaultBigScreenConfig().timeRange as [string, string],
  regionPath: [] as number[],
  frequency: 5
});

const areaCascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: true
};

const toggleConfig = () => {
  showConfig.value = !showConfig.value;
};

const syncConfigForm = (config: BigScreenDataConfig) => {
  configForm.timeRange = [...config.timeRange] as [string, string];
  configForm.regionPath = [...config.regionPath];
  configForm.frequency = config.frequency;
};

const formatAreaTree = (tree: AreaNodeRespVO[] = []): AreaNodeRespVO[] =>
  tree.map((item) => {
    const node = { ...item };
    if (node.children?.length) {
      node.children = formatAreaTree(node.children);
    } else {
      delete node.children;
    }
    return node;
  });

const resolveDefaultRegionPath = (tree: AreaNodeRespVO[]): number[] => {
  const province = tree.find((item) => item.name.includes('山东') || item.name.includes('山东省')) || tree[0];
  const city = province?.children?.find((item) => item.name.includes('济南')) || province?.children?.[0];
  return [province?.id, city?.id].filter((item): item is number => typeof item === 'number');
};

const selectedRegionLabel = computed(() => {
  const labels: string[] = [];
  let currentTree = areaOptions.value;
  for (const id of configForm.regionPath) {
    const current = currentTree.find((item) => item.id === id);
    if (!current) break;
    labels.push(current.name);
    currentTree = current.children || [];
  }
  return labels.join('-');
});

const resolveRegionMetaByPath = (path: number[]) => {
  const labels: string[] = [];
  let currentTree = areaOptions.value;
  for (const id of path) {
    const current = currentTree.find((item) => item.id === id);
    if (!current) break;
    labels.push(current.name);
    currentTree = current.children || [];
  }
  return {
    regionLabel: labels.join('-'),
    provinceName: labels[0] || '',
    cityName: labels[1] || '',
    districtName: labels[2] || ''
  };
};

const clearRefreshTimer = () => {
  if (refreshTimer !== null) {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const startRefreshTimer = (frequency: number) => {
  clearRefreshTimer();
  const intervalMinutes = Math.max(1, Number(frequency || 5));
  refreshTimer = window.setInterval(() => {
    dispatchBigScreenRefresh('timer');
  }, intervalMinutes * 60 * 1000);
};

const loadAreaOptions = async () => {
  try {
    const data = await getAreaTree();
    areaOptions.value = formatAreaTree((data || []) as AreaNodeRespVO[]);
    const cachedConfig = getBigScreenConfig();
    if (cachedConfig.regionPath.length) {
      configForm.regionPath = [...cachedConfig.regionPath];
    } else if (!configForm.regionPath.length && areaOptions.value.length) {
      configForm.regionPath = resolveDefaultRegionPath(areaOptions.value);
    }
  } catch (error) {
    console.error('加载地区树失败', error);
    areaOptions.value = [];
  }
};

const saveConfig = () => {
  const regionMeta = resolveRegionMetaByPath(configForm.regionPath);
  const nextConfig: BigScreenDataConfig = {
    timeRange: [...configForm.timeRange] as [string, string],
    regionPath: [...configForm.regionPath],
    regionLabel: regionMeta.regionLabel,
    provinceName: regionMeta.provinceName,
    cityName: regionMeta.cityName,
    districtName: regionMeta.districtName,
    frequency: Math.max(1, Number(configForm.frequency || 5))
  };
  saveBigScreenConfig(nextConfig);
  startRefreshTimer(nextConfig.frequency);
  console.log('保存配置:', nextConfig);
  ElMessage.success('数据配置已更新');
  showConfig.value = false;
  dispatchBigScreenRefresh('save');
};

const leftMenus = [
  { key: 'task', label: '检测任务', bg: taskBg, activeBg: taskBgActive, icon: List },
  { key: 'inspect', label: '快速检测', bg: inspectBg, activeBg: inspectBgActive, icon: Aim }
];

const rightMenus = [
  { key: 'cert', label: '合格证', bg: certBg, activeBg: certBgActive, icon: Checked },
  { key: 'warn', label: '小壹预警', bg: warnBg, activeBg: warnBgActive, icon: Bell }
];

onMounted(() => {
  syncConfigForm(getBigScreenConfig());
  loadAreaOptions();
  startRefreshTimer(getBigScreenConfig().frequency);
});

onUnmounted(() => {
  clearRefreshTimer();
});
</script>

<style scoped lang="scss">
.screen-header {
  height: 98px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 640px 1fr;
  align-items: center;
  background: url('@/assets/imgs/echarts/首页/tiile_bg.png') no-repeat center center;
  background-size: 100% 100%;
}

.header-side {
  display: flex;
  justify-content: flex-end;
  column-gap: 2px;
  /* 增加间距 */
  padding: 12px 30px 0;
  align-self: start;
  position: relative;
  /* 为弹窗定位 */

  &.right {
    justify-content: flex-start;
  }
}

.data-config-btn {
  height: 46px;
  min-width: 160px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
  cursor: pointer;
  gap: 10px;

  .hexagon-icon {
    width: 24px;
    height: 24px;
    background: rgba(0, 218, 255, 0.1);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    border: 1px solid rgba(0, 218, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;

    .inner-dot {
      width: 6px;
      height: 6px;
      background: #00daff;
      border-radius: 50%;
      box-shadow: 0 0 8px #00daff;
    }
  }

  .caret-icon {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #00daff;
    margin-left: 4px;
  }
}

.nav-btn {
  height: 46px;
  min-width: 140px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
  cursor: pointer;
  gap: 22px;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.2);
    text-shadow: 0 0 10px rgba(0, 218, 255, 0.8);
  }
}

/* 数据配置面板样式 */
.data-config-panel {
  position: absolute;
  top: 62px;
  left: 30px;
  width: 440px;
  background: linear-gradient(180deg, rgba(7, 26, 60, 0.98) 0%, rgba(4, 15, 40, 0.98) 100%);
  // border: 1px solid #1d91ff;
  box-shadow: 0 0 30px rgba(29, 145, 255, 0.35);
  z-index: 1000;
  padding: 1px;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 2%;
    width: 96%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #37dcff, transparent);
    box-shadow: 0 0 12px #37dcff;
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    pointer-events: none;
    right: -1px;
    bottom: -1px;
    border-right: 2px solid #37dcff;
    border-bottom: 2px solid #37dcff;
  }
}

.panel-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  background: url('@/assets/imgs/echarts/首页/sjpz_label.png') no-repeat center center;
  background-size: 100% 60px;

  .header-title {
    color: #fff;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
    padding-left: 40px;
    text-shadow: 0 0 10px rgba(166, 216, 255, 0.8);
  }
}

.panel-body {
  padding: 24px 24px 16px;
}

.form-item {
  margin-bottom: 24px;

  .item-label {
    color: #9ebfdd;
    font-size: 18px;
    margin-bottom: 12px;
  }
}

.field-shell {
  width: 100%;
}

.frequency-input {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d4eaff;
  font-size: 18px;
}

/* 自定义 Element Plus 样式 */
:deep(.custom-date-picker) {
  width: 100% !important;
  --el-date-editor-width: 100%;

  .el-input__wrapper,
  .el-range-editor.el-input__wrapper {
    min-height: 54px !important;
    background: rgba(13, 35, 75, 0.72) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 3px !important;
    padding: 0 14px !important;
  }

  .el-range-input,
  .el-input__inner {
    background: transparent !important;
    color: #d4eaff !important;
    font-size: 18px !important;
    height: 44px !important;

    &::placeholder {
      color: rgba(212, 234, 255, 0.5) !important;
    }
  }

  .el-range-separator {
    color: #9ebfdd !important;
    font-size: 18px;
  }

  .el-icon {
    color: #43e4ff !important;
    font-size: 18px;
  }
}

:deep(.custom-cascader) {
  width: 100% !important;

  .el-input__wrapper {
    min-height: 54px !important;
    background: rgba(13, 35, 75, 0.72) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 3px !important;
    padding: 0 14px !important;
  }

  .el-input__inner {
    color: #d4eaff !important;
    font-size: 18px !important;
    height: 44px !important;
  }

  .el-input__suffix,
  .el-cascader__dropdown-icon,
  .el-input__icon {
    color: #00daff !important;
    font-size: 20px;
  }
}

:deep(.custom-number-input) {
  width: 100px !important;

  .el-input__wrapper {
    background: rgba(13, 35, 75, 0.6) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 2px;
    padding: 0 8px;
  }

  .el-input__inner {
    color: #d4eaff !important;
    font-size: 20px !important;
    text-align: left;
  }
}

.panel-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 20px;

  .el-button {
    flex: 1;
    height: 46px;
    font-size: 20px;
    border: none;
    border-radius: 0;
  }

  .save-btn {
    background: linear-gradient(90deg, #20c7d2 0%, #2aa9df 100%) !important;
    color: #fff !important;
    box-shadow: inset 0 0 0 1px rgba(130, 246, 255, 0.25), 0 0 18px rgba(32, 199, 210, 0.28);

    &:hover {
      filter: brightness(1.05);
    }
  }

  .cancel-btn {
    background: linear-gradient(180deg, rgba(18, 44, 92, 0.92) 0%, rgba(10, 28, 68, 0.92) 100%) !important;
    border: 1px solid rgba(57, 141, 231, 0.75) !important;
    color: #c4e1ff !important;
    box-shadow: inset 0 0 0 1px rgba(67, 196, 255, 0.08);

    &:hover {
      background: linear-gradient(180deg, rgba(22, 56, 114, 0.95) 0%, rgba(13, 36, 84, 0.95) 100%) !important;
    }
  }
}

.header-center {
  position: relative;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  h1 {
    margin: 0;
    color: #e7f6ff;
    font-size: 48px;
    font-weight: 800;
    letter-spacing: 2px;
    text-shadow: 0 0 15px rgba(63, 212, 255, 0.35);
  }
}

.center-glow {
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 74%;
  height: 3px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, #43e4ff, transparent);
}

.assistant-badge {
  height: 52px;
  border: 1px solid rgba(79, 152, 255, 0.75);
  background: linear-gradient(90deg, rgba(66, 83, 190, 0.65), rgba(34, 54, 157, 0.35));
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 40px;
    height: 40px;
  }
}

.assistant-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  strong {
    color: #8ecbff;
    font-size: 18px;
    font-weight: 700;
  }

  span {
    color: #d4eaff;
    font-size: 14px;
  }
}
</style>

<style lang="scss">
.big-screen-date-popper {
  z-index: 1200 !important;

  .el-picker-panel {
    border: 1px solid rgba(57, 141, 231, 0.55);
    background: rgba(8, 20, 54, 0.98);
    box-shadow: 0 10px 30px rgba(4, 18, 45, 0.5);
  }

  .el-date-range-picker__header {
    color: #d4eaff;

    div {
      color: #d4eaff;
    }

    button {
      color: #4ce9ff;
    }
  }

  .el-picker-panel__icon-btn,
  .el-date-table th,
  .el-month-table td .cell,
  .el-year-table td .cell {
    color: #c4e1ff;
  }

  .el-date-table td .cell {
    color: #d4eaff;
  }

  .el-date-table td.in-range .cell {
    background: rgba(67, 196, 255, 0.16);
  }

  .el-date-table td.start-date .cell,
  .el-date-table td.end-date .cell {
    background: #1ca9e8;
    color: #fff;
  }
}

.big-screen-area-popper {
  z-index: 1200 !important;

  .el-cascader-panel {
    min-width: 100%;
    border: 1px solid rgba(57, 141, 231, 0.55);
    background: rgba(8, 20, 54, 0.98);
    box-shadow: 0 10px 30px rgba(4, 18, 45, 0.5);
  }

  .el-cascader-menu {
    min-width: 160px;
    border-right-color: rgba(57, 141, 231, 0.2);
  }

  .el-cascader-node {
    color: #c4e1ff;

    &.is-active,
    &:hover {
      background: rgba(41, 112, 201, 0.18);
      color: #4ce9ff;
    }
  }
}
</style>
