<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="inspect" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />
    <main class="screen-main">
      <div class="left-panel">
        <LeftQuickSection v-if="panelVisibility.left" />
      </div>
      <div class="center-panel">
        <CenterQuickSection v-if="panelVisibility.center" />
      </div>
      <div class="bottom-panel">
        <BottomQuickTrends v-if="panelVisibility.bottom" />
      </div>
      <div class="right-panel">
        <RightQuickSection v-if="panelVisibility.right" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue';
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue';
import { useDeferredPanelMount } from './useDeferredPanelMount';

const LeftQuickSection = defineAsyncComponent(
  () => import('./components/bigscreenQuick/LeftQuickSection.vue')
);
const CenterQuickSection = defineAsyncComponent(
  () => import('./components/bigscreenQuick/CenterQuickSection.vue')
);
const RightQuickSection = defineAsyncComponent(
  () => import('./components/bigscreenQuick/RightQuickSection.vue')
);
const BottomQuickTrends = defineAsyncComponent(
  () => import('./components/bigscreenQuick/BottomQuickTrends.vue')
);

defineOptions({ name: 'VisualizationBigScreenQuick' });

const entranceLoading = ref(true);
const { visibility: panelVisibility, schedule } = useDeferredPanelMount();
let loadingTimer: number | null = null;

onMounted(() => {
  schedule({
    immediate: ['left', 'center', 'right'],
    deferred: [
      { key: 'bottom', delay: 120 }
    ]
  });
  loadingTimer = window.setTimeout(() => {
    entranceLoading.value = false;
    loadingTimer = null;
  }, 520);
});

onUnmounted(() => {
  if (loadingTimer !== null) {
    window.clearTimeout(loadingTimer);
    loadingTimer = null;
  }
});
</script>

<style scoped lang="scss">
.big-screen-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: url('../../assets/imgs/echarts/首页/bg.png') no-repeat center center;
  background-size: 100% 100%;
}

.screen-toolbar {
  height: 40px;
  padding: 1px 12px 0;
  display: flex;
  align-items: center;
}

.toolbar-select {
  height: 30px;
  min-width: 460px;
  border: 1px solid rgba(50, 120, 207, 0.55);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: #a9caea;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;

  .caret {
    color: #48e8ff;
    font-size: 12px;
  }
}

.screen-main {
  flex: 1;
  min-height: 0;
  padding: 6px 12px 10px;
  display: grid;
  grid-template-columns: 470px minmax(0, 1fr) 460px;
  grid-template-rows: minmax(0, 1fr) 268px;
  grid-template-areas:
    'left center right'
    'bottom bottom right';
  gap: 10px;
}

.left-panel {
  grid-area: left;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.center-panel {
  grid-area: center;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.bottom-panel {
  grid-area: bottom;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.right-panel {
  grid-area: right;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}
</style>
