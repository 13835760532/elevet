<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="cert" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />
    <main class="screen-main">
      <div class="left-panel">
        <LeftCertificateSection v-if="panelVisibility.left" />
      </div>
      <div class="center-panel">
        <CenterCertificateSection v-if="panelVisibility.center" />
      </div>
      <div class="right-panel">
        <RightCertificateSection v-if="panelVisibility.right" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue'
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue'
import { useDeferredPanelMount } from './useDeferredPanelMount'

const LeftCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/LeftCertificateSection.vue')
)
const CenterCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/CenterCertificateSection.vue')
)
const RightCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/RightCertificateSection.vue')
)

defineOptions({ name: 'VisualizationBigScreenCertificate' })

const entranceLoading = ref(true)
const { visibility: panelVisibility, schedule } = useDeferredPanelMount()
let loadingTimer: number | null = null

onMounted(() => {
  schedule({
    immediate: ['left', 'center', 'right'],
    deferred: []
  })
  loadingTimer = window.setTimeout(() => {
    entranceLoading.value = false
    loadingTimer = null
  }, 420)
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
  padding: 0 20px 10px;
  display: grid;
  grid-template-columns:
    minmax(0, 0.49fr)
    minmax(0, 1fr)
    minmax(0, 0.49fr);
  grid-template-areas: 'left center right';
  gap: 20px;
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

.right-panel {
  grid-area: right;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.screen-toolbar {
  height: 42px;
  padding: 2px 12px 0;
  display: flex;
  align-items: center;
}

.toolbar-select {
  height: 32px;
  min-width: 460px;
  border: 1px solid rgba(50, 120, 207, 0.55);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: #a9caea;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;

  .caret {
    color: #48e8ff;
    font-size: 12px;
  }
}
</style>
