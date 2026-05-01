import os

with open("src/views/statistics/index.vue", "r") as f:
    lines = f.readlines()

# Extract parts
template_start = -1
stat_content_start = -1
stat_content_end = -1
script_start = -1
script_end = -1
style_start = -1
style_end = -1

for i, line in enumerate(lines):
    if "<template>" in line: template_start = i
    if '<div class="stat-content">' in line: stat_content_start = i
    if line.strip() == "</div>" and i > stat_content_start and i < len(lines)-1 and lines[i+1].strip() == "</div>" and lines[i+2].strip() == "</template>":
        stat_content_end = i
    if "<script setup lang=\"ts\">" in line: script_start = i
    if "</script>" in line: script_end = i
    if "<style lang=\"scss\" scoped>" in line: style_start = i
    if "</style>" in line: style_end = i

print(f"stat_content: {stat_content_start} - {stat_content_end}")
print(f"script: {script_start} - {script_end}")
print(f"style: {style_start} - {style_end}")

tab_all_content = "<template>\n" + "".join(lines[stat_content_start:stat_content_end+1]) + "</template>\n\n" + "".join(lines[script_start:script_end+1]) + "\n\n" + "".join(lines[style_start:style_end+1])

with open("src/views/statistics/components/TabAll.vue", "w") as f:
    f.write(tab_all_content)

# Now rewrite index.vue
index_template = """<template>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TabAll from './components/TabAll.vue'
import TabTask from './components/TabTask.vue'

const currentTab = ref('task') // Set default to 'task' for testing
const tabs = [
  { label: '全部', value: 'all', icon: 'ep:user' },
  { label: '检测任务', value: 'task', icon: 'ep:message' },
  { label: '快速检测', value: 'quick', icon: 'ep:home-filled' },
  { label: '合格证开具', value: 'issue', icon: 'ep:document' },
  { label: '合格证收证', value: 'verify', icon: 'ep:document-checked' },
  { label: '建档备案', value: 'filing', icon: 'ep:folder' }
]
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
"""

with open("src/views/statistics/index.vue", "w") as f:
    f.write(index_template)

