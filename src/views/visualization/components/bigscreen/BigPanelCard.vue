<template>
  <section class="panel-card" :style="cardStyle">
    <header class="panel-header">
      <div class="panel-title-wrap">
        <span class="panel-title-arrow">›</span>
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

const cardStyle = computed(() => {
  if (!props.bgImage) return {};
  return {
    backgroundImage: `linear-gradient(180deg, rgba(8, 28, 70, 0.72) 0%, rgba(6, 20, 55, 0.56) 100%), url(${props.bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };
});
</script>

<style scoped lang="scss">
.panel-card {
  background: linear-gradient(180deg, rgba(8, 28, 70, 0.72) 0%, rgba(6, 20, 55, 0.56) 100%);
  border: 1px solid rgba(34, 122, 255, 0.35);
  box-shadow: inset 0 0 28px rgba(2, 74, 168, 0.2);
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    pointer-events: none;
  }

  &::before {
    top: -1px;
    left: -1px;
    border-top: 2px solid #37dcff;
    border-left: 2px solid #37dcff;
  }

  &::after {
    right: -1px;
    bottom: -1px;
    border-right: 2px solid #37dcff;
    border-bottom: 2px solid #37dcff;
  }
}

.panel-header {
  height: 46px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(31, 113, 226, 0.45);
  background: linear-gradient(90deg, rgba(10, 72, 160, 0.3) 0%, rgba(6, 32, 81, 0) 78%);
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title-arrow {
  font-size: 20px;
  line-height: 1;
  color: #38d9ff;
}

.panel-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #d9eeff;
}

.panel-tabs {
  display: flex;
  gap: 8px;
}

.panel-tab {
  border: 1px solid rgba(85, 143, 230, 0.5);
  background: rgba(8, 28, 66, 0.65);
  color: #8ab4db;
  font-size: 16px;
  padding: 4px 12px;
  cursor: default;

  &.active {
    color: #4be9ff;
    border-color: #3cc7f8;
    box-shadow: 0 0 10px rgba(17, 171, 226, 0.35) inset;
  }
}

.panel-body {
  padding: 12px;
}
</style>
