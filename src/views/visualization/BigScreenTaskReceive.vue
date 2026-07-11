<template>
  <div class="big-screen-shell">
    <BigScreenHeader active-menu="task" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />
    <div class="screen-data-summary" :title="dataSummaryText">
      <span class="summary-label">当前数据</span>
      <span class="summary-value">{{ dataSummaryText }}</span>
    </div>
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
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue'
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue'
import {
  formatBigScreenDataSummary,
  getBigScreenConfig,
  subscribeBigScreenRefresh,
  type BigScreenDataConfig
} from './components/bigscreen/config'
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
const dataConfig = ref<BigScreenDataConfig>(getBigScreenConfig())
const dataSummaryText = computed(() => formatBigScreenDataSummary(dataConfig.value))
const { visibility: panelVisibility, schedule } = useDeferredPanelMount()
let loadingTimer: number | null = null

const disposeConfigRefresh = subscribeBigScreenRefresh(() => {
  dataConfig.value = getBigScreenConfig()
})

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
  disposeConfigRefresh()
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
  grid-template-rows: minmax(0, 1fr) 260px;
  grid-template-areas:
    'left center right'
    'bottom bottom bottom';
  gap: 10px;
}

.screen-data-summary {
  position: absolute;
  top: 96px;
  left: 12px;
  z-index: 2;
  display: flex;
  width: 470px;
  height: 32px;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  color: rgb(206 230 255 / 86%);
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgb(2 20 54 / 82%),
    rgb(5 35 76 / 42%),
    rgb(2 20 54 / 10%)
  );
  border: 1px solid rgb(55 220 255 / 18%);
  box-shadow: inset 0 0 14px rgb(34 161 255 / 12%);
}

.summary-label {
  flex: 0 0 auto;
  font-size: 14px;
  color: #57e2ff;
}

.summary-value {
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  color: rgb(226 241 255 / 90%);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-left-panel {
  grid-area: left;
  min-height: 0;
  padding-top: 34px;
}

.task-center-panel {
  grid-area: center;
  min-height: 0;
}

.task-bottom-panel {
  grid-area: bottom;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.task-right-panel {
  grid-area: right;
  min-height: 0;
}
</style>
