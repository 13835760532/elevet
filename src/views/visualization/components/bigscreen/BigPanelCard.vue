<template>
  <section class="panel-card">
    <header class="panel-header" :style="headerStyle">
      <div class="panel-title-wrap">
        <h3 class="panel-title">{{ title }}</h3>
      </div>
      <div class="panel-header-right">
        <slot name="title-extra" />
        <div v-if="tabs.length" class="panel-tabs">
          <button v-for="tab in tabs" :key="tab" class="panel-tab" :class="{ active: tab === currentActiveTab }"
            type="button" @click="handleTabClick(tab)">
            {{ tab }}
          </button>
        </div>
      </div>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    tabs?: string[]
    activeTab?: string
    bgImage?: string
    titleBgImage?: string
  }>(),
  {
    tabs: () => [],
    activeTab: '',
    bgImage: '',
    titleBgImage: ''
  }
)

const emit = defineEmits<{
  (e: 'update:activeTab', value: string): void
  (e: 'tab-click', value: string): void
}>()

const currentActiveTab = computed(() => props.activeTab || props.tabs[0] || '')

const headerStyle = computed(() =>
  props.titleBgImage
    ? {
      backgroundImage: `url('${props.titleBgImage}')`
    }
    : undefined
)

const handleTabClick = (tab: string) => {
  emit('update:activeTab', tab)
  emit('tab-click', tab)
}
</script>

<style scoped lang="scss">
.panel-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(0, 2, 31, 0.31) 0%, rgba(0, 2, 31, 0.31) 100%),
    linear-gradient(180deg, rgba(4, 19, 49, 0.18) 0%, rgba(5, 12, 34, 0.04) 100%);
  box-shadow: inset 0 0 28px rgba(2, 74, 168, 0.14);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: linear-gradient(90deg,
        rgba(32, 51, 159, 0) 0%,
        rgba(32, 45, 159, 1) 41%,
        rgba(133, 151, 229, 1) 51%,
        rgba(32, 62, 159, 1) 63%,
        rgba(32, 45, 159, 0) 100%);
    pointer-events: none;
  }
}

.panel-header {
  height: 46px;
  flex: 0 0 46px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: url('../../../../assets/imgs/echarts/首页/bg_fxgg.png') no-repeat center center;
  background-size: 100% 100%;
}

.panel-header-bottom {
  .panel-header {
    background: url('../../../../assets/imgs/echarts/检测任务/rwjcfx.png') no-repeat center center !important;
    background-size: 100% 46px !important;
  }
}

/* 中间特殊布局适配 */
.big-panel-center {
  height: 100%;

  .panel-body {
    padding: 0;
  }

  .panel-header {
    height: 46px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: url('../../../../assets/imgs/echarts/首页/nclfx_bg.png') no-repeat left center;
    background-size: 100% 46px;
  }
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  color: #e0efef;
  padding-left: 40px;
  line-height: 46px;
}

.panel-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 8px;
}

.panel-tabs {
  display: flex;
  gap: 14px;
}

.panel-tab {
  border: none;
  min-width: 62px;
  height: 34px;
  background: linear-gradient(180deg, rgba(21, 30, 63, 1) 0%, rgba(54, 68, 86, 0) 96.63%);
  color: #adccc9;
  font-size: 14px;
  padding: 0 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  border-top: 2px solid rgba(194, 212, 212, 1);

  &.active {
    background: linear-gradient(180deg, rgba(0, 35, 74, 1) 0%, rgba(60, 106, 214, 0) 100%);
    color: #c2d4d4;
    border-top-color: #eef6f6;
    font-weight: 400;
  }

  &:hover:not(.active) {
    color: #e0efef;
  }
}

.panel-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
