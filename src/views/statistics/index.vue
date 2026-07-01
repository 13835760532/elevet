<template>
  <div class="statistics-container">
    <!-- 顶部 Tabs -->
    <div class="stat-tabs-wrapper">
      <div class="stat-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-item', { active: currentTab === tab.value }]"
          @click="currentTab = tab.value"
        >
          <Icon :icon="tab.icon" :size="18" class="tab-icon" />
          <span>{{ tab.label }}</span>
        </div>
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

const tabs = [
  { label: '全部', value: 'all', icon: 'ep:user' },
  { label: '检测任务', value: 'task', icon: 'ep:message' },
  { label: '快速检测', value: 'quick', icon: 'ep:home-filled' },
  { label: '合格证开具', value: 'issue', icon: 'ep:document' },
  { label: '合格证收证', value: 'verify', icon: 'ep:document-checked' },
  { label: '建档备案', value: 'filing', icon: 'ep:folder' }
]

const initTab = () => {
  if (route.query.tab) {
    currentTab.value = route.query.tab as string
    return
  }
  currentTab.value = 'all'
}

onMounted(() => {
  initTab()
})

watch(
  () => route.path,
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
  padding: 0 32px;
  border-bottom: 1px solid #f0f2f5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.stat-tabs {
  display: flex;
  align-items: center;
  gap: 40px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  cursor: pointer;
  font-size: 15px;
  color: #8c8c8c;
  position: relative;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-weight: 500;

  .tab-icon {
    transition: transform 0.3s;
  }

  &:hover {
    color: #00b3ed;
    .tab-icon {
      transform: translateY(-2px);
    }
  }

  &.active {
    color: #00b3ed;
    font-weight: 600;

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
  gap: 20px;
  padding: 20px 32px 28px;
  background: #f5f8fb;
}

.statistics-tab-body :deep(.statistics-range-filter) {
  margin-bottom: 0;
}

.statistics-tab-body :deep(.card-section) {
  padding: 24px;
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
  margin-bottom: 16px;
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
  gap: 16px;
}

.statistics-tab-body :deep(.stat-card) {
  min-height: 104px;
  border-radius: 10px;
}

.statistics-tab-body :deep(.coverage-group) {
  padding: 24px;
  border-radius: 10px;
}

.statistics-tab-body :deep(.result-filters) {
  gap: 12px;
  padding: 16px;
  margin-bottom: 20px;
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
  padding: 16px;
  margin-bottom: 20px;
  background: #fbfdff;
  border: 1px solid #edf3f8;
  border-radius: 10px;
}

.statistics-tab-body :deep(.chart-header) {
  margin-bottom: 16px;
}

.statistics-tab-body :deep(.charts-container) {
  gap: 16px !important;
  margin-bottom: 20px !important;
}

.statistics-tab-body :deep(.table-section) {
  min-height: 0;
}

.statistics-tab-body :deep(.table-header) {
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #edf3f8;
}

.statistics-tab-body :deep(.table-container) {
  margin-top: 0;
}

.statistics-tab-body :deep(.pagination-container) {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #edf3f8;
}

.statistics-tab-body :deep(.risk-section-container) {
  margin-top: 0;
}

.statistics-tab-body :deep(.risk-grid),
.statistics-tab-body :deep(.bottom-grid) {
  gap: 16px;
  margin-bottom: 20px;
}

.statistics-tab-body :deep(.risk-card) {
  padding: 20px;
  border-color: #e7eef5;
  border-radius: 12px;
}

@media (width <= 1360px) {
  .statistics-tab-body :deep(.stat-content) {
    padding: 20px 24px 28px;
  }
}
</style>
