<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="task" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />
    <main class="screen-main">
      <div class="task-left-panel">
        <LeftTaskReceiveSection v-if="panelVisibility.left" />
      </div>
      <div class="task-center-panel">
        <CenterTaskReceiveSection v-if="panelVisibility.center" />
      </div>
      <div class="task-bottom-panel">
        <BottomTaskReceiveSection v-if="panelVisibility.bottom" />
      </div>
      <div class="task-right-panel">
        <RightTaskReceiveSection v-if="panelVisibility.right" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue'
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue'
import { useDeferredPanelMount } from './useDeferredPanelMount'

const LeftTaskReceiveSection = defineAsyncComponent(
  () => import('./components/bigscreenTaskReceive/LeftTaskReceiveSection.vue')
)
const CenterTaskReceiveSection = defineAsyncComponent(
  () => import('./components/bigscreenTaskReceive/CenterTaskReceiveSection.vue')
)
const RightTaskReceiveSection = defineAsyncComponent(
  () => import('./components/bigscreenTaskReceive/RightTaskReceiveSection.vue')
)
const BottomTaskReceiveSection = defineAsyncComponent(
  () => import('./components/bigscreenTaskReceive/BottomTaskReceiveSection.vue')
)

defineOptions({ name: 'VisualizationBigScreenTaskReceive' })

const entranceLoading = ref(true)
const { visibility: panelVisibility, schedule } = useDeferredPanelMount()
let loadingTimer: number | null = null

onMounted(() => {
  schedule({
    immediate: ['left', 'center', 'right'],
    deferred: [{ key: 'bottom', delay: 120 }]
  })
  loadingTimer = window.setTimeout(() => {
    entranceLoading.value = false
    loadingTimer = null
  }, 520)
})

onUnmounted(() => {
  if (loadingTimer !== null) {
    window.clearTimeout(loadingTimer)
    loadingTimer = null
  }
})
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

.screen-main {
  flex: 1;
  min-height: 0;
  padding: 6px 12px 10px;
  display: grid;
  grid-template-columns: 470px minmax(0, 1fr) 560px;
  grid-template-rows: minmax(0, 1fr) 280px;
  grid-template-areas:
    'left center right'
    'bottom bottom .';
  gap: 10px;
}

.task-left-panel {
  grid-area: left;
  min-height: 0;
}

.task-center-panel {
  grid-area: center;
  min-height: 0;
}

.task-bottom-panel {
  grid-area: bottom;
  min-height: 0;
}

.task-right-panel {
  grid-area: right;
  min-height: 0;
}
</style>
