<template>
  <div class="statistics-container">
    <!-- 顶部 Tabs -->
    <div class="stat-tabs-wrapper">
      <div class="stat-tabs">
        <div v-for="tab in tabs" :key="tab.value" :class="['tab-item', { active: currentTab === tab.value }]"
          @click="currentTab = tab.value">
          <Icon :icon="tab.icon" :size="18" class="tab-icon" />
          <span>{{ tab.label }}</span>
        </div>
      </div>
    </div>

    <!-- 动态内容 -->
    <TabAll v-if="currentTab === 'all'" />
    <TabTask v-else-if="currentTab === 'task'" />
    <TabQuick v-else-if="currentTab === 'quick'" />
    <TabIssue v-else-if="currentTab === 'issue'" />
    <TabVerify v-else-if="currentTab === 'verify'" />
    <TabFiling v-else-if="currentTab === 'filing'" />
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
  } else if (route.path.includes('quick') || route.path.includes('rapid')) {
    currentTab.value = 'quick'
  }
}

onMounted(() => {
  initTab()
})

watch(() => route.path, () => {
  initTab()
})
</script>

<style lang="scss" scoped>
.statistics-container {
  min-height: calc(100vh - 120px);
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
  border-radius: 8px;
}

/* 顶部 Tabs */
.stat-tabs-wrapper {
  background-color: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
}

.stat-tabs {
  display: flex;
  align-items: center;
  gap: 30px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  cursor: pointer;
  font-size: 15px;
  color: #606266;
  position: relative;
  transition: all 0.3s;

  &:hover {
    color: #00B3ED;
  }

  &.active {
    color: #00B3ED;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #00B3ED;
      border-radius: 2px 2px 0 0;
    }
  }
}
</style>
