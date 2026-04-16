<template>
  <section class="panel-card" :style="cardStyle">
    <header class="panel-header">
      <div class="panel-title-wrap">
        <h3 class="panel-title">{{ title }}</h3>
      </div>
      <div v-if="tabs.length" class="panel-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="panel-tab"
          :class="{ active: tab === activeTab }"
          type="button"
        >
          {{ tab }}
        </button>
      </div>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    tabs?: string[];
    activeTab?: string;
    bgImage?: string;
  }>(),
  {
    tabs: () => [],
    activeTab: '',
    bgImage: ''
  }
);
</script>

<style scoped lang="scss">
.panel-card {
  background: url('../../../../assets/imgs/echarts/首页/fxjzqy_bg.png');
  background-size: 100% 100%;
  box-shadow: inset 0 0 28px rgba(2, 74, 168, 0.2);
  position: relative;
}

.panel-header {
  height: 46px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: url('../../../../assets/imgs/echarts/首页/bg_fxgg.png') no-repeat center center;
  background-size: 100% 100%;
}
.big-panel-center{
  .panel-header {
    height: 46px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: url('../../../../assets/imgs/echarts/首页/fgqt_bg.png') no-repeat center center;
    background-size: 100% 100%;
  }
  .panel-body {
    padding: 0;
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
  font-weight: 700;
  letter-spacing: 1px;
  color: #E0EFEF;
  padding-left: 40px;
}

.panel-tabs {
  display: flex;
  gap: 12px;
  padding-right: 12px;
}

.panel-tab {
  border: none;
  background: rgba(10, 40, 95, 0.4);
  color: #92b0c9;
  font-size: 16px;
  padding: 6px 18px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  border-top: 2px solid #dcdcdc;

  &.active {
    background: linear-gradient(180deg, rgba(20, 80, 160, 0.8) 0%, rgba(10, 40, 90, 0.8) 100%);
    color: #fff;
    font-weight: 700;
  }

  &:hover:not(.active) {
    background: rgba(20, 80, 160, 0.4);
    color: #fff;
  }
}

.panel-body {
  padding: 12px;
}
</style>
