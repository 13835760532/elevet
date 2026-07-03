<template>
  <div class="statistics-container">
    <!-- 顶部 Tabs -->
    <div class="stat-tabs-wrapper">
      <div class="stat-tabs">
        <template v-for="tab in tabs" :key="tab.value">
          <el-dropdown
            v-if="tab.dropdownOptions?.length"
            class="tab-dropdown"
            trigger="hover"
            placement="bottom-start"
            @command="handleDropdownCommand(tab.value)"
          >
            <div
              :class="['tab-item', { active: currentTab === tab.value }]"
              @click="handleTabChange(tab.value)"
            >
              <Icon :icon="tab.icon" :size="18" class="tab-icon" />
              <span class="tab-label">
                {{ tab.label }}
                <Icon icon="ep:arrow-down" :size="14" class="tab-arrow" />
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="option in tab.dropdownOptions"
                  :key="option.value"
                  :command="option.value"
                >
                  {{ option.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div
            v-else
            :class="['tab-item', { active: currentTab === tab.value }]"
            @click="handleTabChange(tab.value)"
          >
            <Icon :icon="tab.icon" :size="18" class="tab-icon" />
            <span>{{ tab.label }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 动态内容 -->
    <div class="statistics-tab-body">
      <TabAll v-if="currentTab === 'all'" />
      <TabTask v-else-if="currentTab === 'task'" />
      <TabQuick v-else-if="currentTab === 'quick'" />
      <TabIssue v-else-if="currentTab === 'issue'" />
      <TabVerify v-else-if="currentTab === 'verify'" />
      <TabFiling v-else-if="currentTab === 'filing'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import TabAll from './components/TabAll.vue'
import TabTask from './components/TabTask.vue'
import TabQuick from './components/TabQuick.vue'
import TabIssue from './components/TabIssue.vue'
import TabVerify from './components/TabVerify.vue'
import TabFiling from './components/TabFiling.vue'

const route = useRoute()
const currentTab = ref('all')

interface TabDropdownOption {
  label: string
  value: string
}

interface StatisticsTab {
  label: string
  value: string
  icon: string
  dropdownOptions?: TabDropdownOption[]
}

const tabs: StatisticsTab[] = [
  { label: '全部', value: 'all', icon: 'ep:user' },
  {
    label: '检测任务',
    value: 'task',
    icon: 'ep:message',
    dropdownOptions: [
      { label: '本机构下发任务', value: 'issued' },
      { label: '本机构执行任务', value: 'executed' },
      { label: '辖区内全部任务', value: 'all' }
    ]
  },
  {
    label: '快速检测',
    value: 'quick',
    icon: 'ep:home-filled',
    dropdownOptions: [
      { label: '本机构自主检测', value: 'self' },
      { label: '本机构任务检测', value: 'task' },
      { label: '辖区内快速检测', value: 'all' }
    ]
  },
  {
    label: '合格证开具',
    value: 'issue',
    icon: 'ep:document',
    dropdownOptions: [
      { label: '本机构合格证开具', value: 'own' },
      { label: '辖区内合格证开具', value: 'area' }
    ]
  },
  {
    label: '合格证收证',
    value: 'verify',
    icon: 'ep:document-checked',
    dropdownOptions: [
      { label: '本机构合格证收取', value: 'own' },
      { label: '辖区内合格证收取', value: 'area' }
    ]
  },
  {
    label: '建档备案',
    value: 'filing',
    icon: 'ep:folder',
    dropdownOptions: [
      { label: '本机构建档备案', value: 'own' },
      { label: '辖区内建档备案', value: 'area' }
    ]
  }
]

const handleTabChange = (tabValue: string) => {
  currentTab.value = tabValue
}

const handleDropdownCommand = (tabValue: string) => {
  currentTab.value = tabValue
}

const initTab = () => {
  if (route.query.tab) {
    currentTab.value = route.query.tab as string
    return
  }
  if (route.path.endsWith('/quick')) {
    currentTab.value = 'quick'
    return
  }
  currentTab.value = 'all'
}

onMounted(() => {
  initTab()
})

watch(
  () => [route.path, route.query.tab],
  () => {
    initTab()
  }
)
</script>

<style lang="scss" scoped>
.statistics-container {
  min-height: calc(100vh - 120px);
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  color: #333;
  border-radius: 8px;
}

/* 顶部 Tabs */
.stat-tabs-wrapper {
  background-color: #fff;
  padding: 0 28px;
  border-bottom: 1px solid #f0f2f5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.stat-tabs {
  display: flex;
  align-items: center;
  gap: 36px;
}

.tab-dropdown {
  display: inline-flex;
}

.tab-dropdown :deep(.el-tooltip__trigger) {
  outline: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 0;
  cursor: pointer;
  font-size: 15px;
  color: #8c8c8c;
  position: relative;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-weight: 500;

  .tab-icon {
    transition: transform 0.3s;
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .tab-arrow {
    color: currentColor;
    opacity: 0.72;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &:hover {
    color: #00b3ed;

    .tab-icon {
      transform: translateY(-2px);
    }

    .tab-arrow {
      opacity: 1;
      transform: translateY(1px);
    }
  }

  &.active {
    color: #00b3ed;
    font-weight: 600;

    .tab-arrow {
      opacity: 1;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #00b3ed 0%, #00f2fe 100%);
      border-radius: 4px 4px 0 0;
      box-shadow: 0 -2px 8px rgba(0, 179, 237, 0.2);
    }
  }
}

.statistics-tab-body :deep(.stat-content) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f5f8fb;
}

.statistics-tab-body :deep(.statistics-range-filter) {
  margin-bottom: 0;
}

.statistics-tab-body :deep(.card-section) {
  padding: 20px;
  margin-bottom: 0;
  background: #fff;
  border: 1px solid #e7eef5;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(25 61 95 / 4%);
}

.statistics-tab-body :deep(.section-title) {
  display: flex;
  align-items: center;
  min-height: 24px;
  margin-bottom: 14px;
  line-height: 24px;
}

.statistics-tab-body :deep(.section-title::before) {
  width: 4px;
  height: 16px;
  margin-right: 10px;
  background: #00b3ed;
  border-radius: 4px;
}

.statistics-tab-body :deep(.overview-cards) {
  gap: 14px;
}

.statistics-tab-body :deep(.stat-card) {
  min-height: 96px;
  border-radius: 10px;
}

.statistics-tab-body :deep(.coverage-group) {
  padding: 20px;
  border-radius: 10px;
}

.statistics-tab-body :deep(.result-filters) {
  gap: 12px;
  padding: 14px;
  margin-bottom: 16px;
  background: #f8fbfd;
  border: 1px solid #edf3f8;
  border-radius: 10px;
}

.statistics-tab-body :deep(.filter-row-top),
.statistics-tab-body :deep(.filter-row-bottom) {
  gap: 12px;
}

.statistics-tab-body :deep(.chart-area-wrapper),
.statistics-tab-body :deep(.chart-container) {
  padding: 14px;
  margin-bottom: 16px;
  background: #fbfdff;
  border: 1px solid #edf3f8;
  border-radius: 10px;
}

.statistics-tab-body :deep(.chart-header) {
  margin-bottom: 14px;
}

.statistics-tab-body :deep(.charts-container) {
  gap: 14px !important;
  margin-bottom: 16px !important;
}

.statistics-tab-body :deep(.table-section) {
  min-height: 0;
}

.statistics-tab-body :deep(.table-header) {
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #edf3f8;
}

.statistics-tab-body :deep(.table-container) {
  margin-top: 0;
}

.statistics-tab-body :deep(.pagination-container) {
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #edf3f8;
}

.statistics-tab-body :deep(.risk-section-container) {
  margin-top: 0;
}

.statistics-tab-body :deep(.risk-grid),
.statistics-tab-body :deep(.bottom-grid) {
  gap: 14px;
  margin-bottom: 16px;
}

.statistics-tab-body :deep(.risk-card) {
  padding: 18px;
  border-color: #e7eef5;
  border-radius: 12px;
}

@media (width <=1360px) {
  .statistics-tab-body :deep(.stat-content) {
    padding: 16px 24px 24px;
  }
}
</style>
