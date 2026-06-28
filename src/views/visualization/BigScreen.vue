<template>
  <div id="big-screen-shell" class="big-screen-shell">
    <BigScreenHeader v-model:active-menu="activeMenu" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />
    <div class="screen-data-summary" :class="renderMenu" :title="dataSummaryText">
      <span class="summary-label">当前数据</span>
      <span class="summary-value">{{ dataSummaryText }}</span>
    </div>

    <main class="screen-main" :class="renderMenu">
      <div class="screen-left-panel">
        <LeftCertificateSection v-if="renderMenu === 'cert' && panelVisibility.left" key="LeftCertificateSection" />
        <LeftTaskSection v-else-if="renderMenu === 'task' && panelVisibility.left" key="LeftTaskSection" />
        <LeftQuickSection v-else-if="renderMenu === 'inspect' && panelVisibility.left" key="LeftQuickSection" />
        <LeftSection v-else-if="panelVisibility.left" key="LeftSection" />
      </div>

      <div class="screen-center-panel">
        <PersistentCenterSection v-if="centerPanelMounted" :active-menu="renderMenu" />
      </div>

      <div class="screen-right-panel">
        <RightCertificateSection v-if="renderMenu === 'cert' && panelVisibility.right" key="RightCertificateSection" />
        <RightTaskSection v-else-if="renderMenu === 'task' && panelVisibility.right" key="RightTaskSection" />
        <RightQuickSection v-else-if="renderMenu === 'inspect' && panelVisibility.right" key="RightQuickSection" />
        <RightSection v-else-if="panelVisibility.right" key="RightSection" />
      </div>

      <div v-if="renderMenu === 'task'" class="screen-bottom-panel">
        <BottomTaskSection v-if="panelVisibility.bottom" key="BottomTaskSection" />
      </div>
      <div v-else-if="renderMenu === 'inspect'" class="screen-bottom-panel">
        <BottomQuickTrends v-if="panelVisibility.bottom" key="BottomQuickTrends" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue'
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue'
import { useDeferredPanelMount, type DeferredPanelPlan } from './useDeferredPanelMount'
import {
  formatBigScreenDataSummary,
  getBigScreenConfig,
  subscribeBigScreenRefresh,
  type BigScreenDataConfig
} from './components/bigscreen/config'

const LeftSection = defineAsyncComponent(() => import('./components/bigscreen/LeftSection.vue'))
const RightSection = defineAsyncComponent(() => import('./components/bigscreen/RightSection.vue'))
const PersistentCenterSection = defineAsyncComponent(
  () => import('./components/bigscreen/PersistentCenterSection.vue')
)

const LeftTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/LeftTaskSection.vue')
)
const RightTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/RightTaskSection.vue')
)
const BottomTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/BottomTaskSection.vue')
)

const LeftQuickSection = defineAsyncComponent(
  () => import('./components/bigscreenQuick/LeftQuickSection.vue')
)
const RightQuickSection = defineAsyncComponent(
  () => import('./components/bigscreenQuick/RightQuickSection.vue')
)
const BottomQuickTrends = defineAsyncComponent(
  () => import('./components/bigscreenQuick/BottomQuickTrends.vue')
)

const LeftCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/LeftCertificateSection.vue')
)
const RightCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/RightCertificateSection.vue')
)

defineOptions({ name: 'VisualizationBigScreen' })

type BigScreenMenu = '' | 'task' | 'inspect' | 'cert' | 'warn'
type BigScreenQueryKey = '' | 'task' | 'quick' | 'cert'
const INITIAL_LOADING_DELAY = 180
const SWITCH_LOADING_DELAY = 220
const SWITCH_RENDER_DELAY = 40

const queryKeyToMenu: Record<Exclude<BigScreenQueryKey, ''>, BigScreenMenu> = {
  task: 'task',
  quick: 'inspect',
  cert: 'cert'
}

const menuToQueryKey: Record<Exclude<BigScreenMenu, '' | 'warn'>, Exclude<BigScreenQueryKey, ''>> = {
  task: 'task',
  inspect: 'quick',
  cert: 'cert'
}

const getMenuFromRouteKey = (key: unknown): BigScreenMenu => {
  const queryKey = Array.isArray(key) ? key[0] : key
  return queryKeyToMenu[String(queryKey || '') as Exclude<BigScreenQueryKey, ''>] || ''
}

const getRouteKeyFromLocation = () => {
  if (typeof window === 'undefined') return ''
  const hash = window.location.hash || ''
  const queryStartIndex = hash.indexOf('?')
  if (queryStartIndex < 0) return ''
  return new URLSearchParams(hash.slice(queryStartIndex + 1)).get('key') || ''
}

const isThreeRendererRoute = () => {
  if (typeof window === 'undefined') return true
  const hash = window.location.hash || ''
  const queryStartIndex = hash.indexOf('?')
  if (queryStartIndex < 0) return true
  return new URLSearchParams(hash.slice(queryStartIndex + 1)).get('renderer') !== 'maptalks'
}

const syncLocationKey = (mode: BigScreenMenu) => {
  if (typeof window === 'undefined') return
  const nextKey = mode && mode !== 'warn' ? menuToQueryKey[mode] : ''
  const currentUrl = new URL(window.location.href)
  const hashPath = currentUrl.hash.split('?')[0] || '#/big-screen'
  const hashQuery = new URLSearchParams(
    currentUrl.hash.includes('?') ? currentUrl.hash.slice(currentUrl.hash.indexOf('?') + 1) : ''
  )

  if (nextKey) {
    hashQuery.set('key', nextKey)
  } else {
    hashQuery.delete('key')
  }

  const nextHashQuery = hashQuery.toString()
  currentUrl.hash = `${hashPath}${nextHashQuery ? `?${nextHashQuery}` : ''}`
  if (currentUrl.href !== window.location.href) {
    window.history.replaceState(window.history.state, '', currentUrl)
  }
}

const activeMenu = ref<BigScreenMenu>(getMenuFromRouteKey(getRouteKeyFromLocation()))
const renderMenu = ref<BigScreenMenu>(activeMenu.value)
const entranceLoading = ref(true)
const dataConfig = ref<BigScreenDataConfig>(getBigScreenConfig())
const { visibility: panelVisibility, schedule } = useDeferredPanelMount()
const centerPanelMounted = ref(false)
let loadingTimer: number | null = null
let switchRenderTimer: number | null = null
let mounted = false

const dataSummaryText = computed(() => formatBigScreenDataSummary(dataConfig.value))

const clearLoadingTimer = () => {
  if (loadingTimer !== null) {
    window.clearTimeout(loadingTimer)
    loadingTimer = null
  }
}

const clearSwitchRenderTimer = () => {
  if (switchRenderTimer !== null) {
    window.clearTimeout(switchRenderTimer)
    switchRenderTimer = null
  }
}

const showLoadingFor = (delay: number) => {
  entranceLoading.value = true
  clearLoadingTimer()
  loadingTimer = window.setTimeout(() => {
    entranceLoading.value = false
    loadingTimer = null
  }, delay)
}

const getPanelPlan = (mode: BigScreenMenu): DeferredPanelPlan => {
  if (isThreeRendererRoute()) {
    if (mode === 'task' || mode === 'inspect') {
      return {
        immediate: ['center'],
        deferred: [
          { key: 'left', delay: 80 },
          { key: 'right', delay: 160 },
          { key: 'bottom', delay: 260 }
        ]
      }
    }

    return {
      immediate: ['center'],
      deferred: [
        { key: 'left', delay: 80 },
        { key: 'right', delay: 160 }
      ]
    }
  }

  if (mode === 'task' || mode === 'inspect') {
    return {
      immediate: ['left', 'right'],
      deferred: [
        { key: 'center', delay: 60 },
        { key: 'bottom', delay: 160 }
      ]
    }
  }

  return {
    immediate: ['left', 'right'],
    deferred: [{ key: 'center', delay: mode === 'cert' ? 160 : 60 }]
  }
}

const getSwitchPanelPlan = (mode: BigScreenMenu): DeferredPanelPlan => {
  if (isThreeRendererRoute()) {
    if (mode === 'task' || mode === 'inspect') {
      return {
        immediate: [],
        deferred: [
          { key: 'center', delay: 0 },
          { key: 'left', delay: 80 },
          { key: 'right', delay: 160 },
          { key: 'bottom', delay: 260 }
        ]
      }
    }

    return {
      immediate: [],
      deferred: [
        { key: 'center', delay: 0 },
        { key: 'left', delay: 80 },
        { key: 'right', delay: 160 }
      ]
    }
  }

  if (mode === 'task' || mode === 'inspect') {
    return {
      immediate: [],
      deferred: [
        { key: 'left', delay: 0 },
        { key: 'right', delay: 80 },
        { key: 'center', delay: 180 },
        { key: 'bottom', delay: 320 }
      ]
    }
  }

  return {
    immediate: [],
    deferred: [
      { key: 'left', delay: 0 },
      { key: 'right', delay: 60 },
      { key: 'center', delay: mode === 'cert' ? 260 : 160 }
    ]
  }
}

watch(
  () => activeMenu.value,
  (mode) => {
    if (mounted) {
      entranceLoading.value = true
      clearSwitchRenderTimer()
      switchRenderTimer = window.setTimeout(() => {
        renderMenu.value = mode
        schedule(getSwitchPanelPlan(mode))
        showLoadingFor(SWITCH_LOADING_DELAY)
        switchRenderTimer = null
      }, SWITCH_RENDER_DELAY)
    } else {
      renderMenu.value = mode
      schedule(getPanelPlan(mode))
    }
    syncLocationKey(mode)
  }
)

watch(
  () => panelVisibility.center,
  (visible) => {
    if (visible) centerPanelMounted.value = true
  }
)

onMounted(() => {
  mounted = true
  schedule(getPanelPlan(renderMenu.value))
  showLoadingFor(INITIAL_LOADING_DELAY)
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  dataConfig.value = getBigScreenConfig()
})

onUnmounted(() => {
  clearLoadingTimer()
  clearSwitchRenderTimer()
  disposeRefresh()
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
  // background: red!important;
}

.screen-toolbar {
  height: 46px;
  padding: 4px 20px;
  display: flex;
  align-items: center;
}

.toolbar-select {
  height: 34px;
  min-width: 500px;
  border: 1px solid rgba(50, 120, 207, 0.55);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: #a9caea;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;

  .caret {
    color: #48e8ff;
    font-size: 14px;
  }
}

.screen-data-summary {
  position: absolute;
  left: 10px;
  top: 96px;
  z-index: 2;
  width: 470px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border: 1px solid rgba(55, 220, 255, 0.18);
  background: linear-gradient(90deg, rgba(2, 20, 54, 0.82), rgba(5, 35, 76, 0.42), rgba(2, 20, 54, 0.1));
  box-shadow: inset 0 0 14px rgba(34, 161, 255, 0.12);
  color: rgba(206, 230, 255, 0.86);
  pointer-events: none;
}

.screen-data-summary.task,
.screen-data-summary.inspect {
  left: 12px;
}

.screen-data-summary.cert {
  left: 20px;
}

.summary-label {
  flex: 0 0 auto;
  color: #57e2ff;
  font-size: 14px;
}

.summary-value {
  min-width: 0;
  overflow: hidden;
  color: rgba(226, 241, 255, 0.9);
  font-size: 15px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.screen-main {
  flex: 1;
  min-height: 0;
  padding: 10px 10px 0;
  padding-bottom: 0;
  display: grid;
  grid-template-columns: 470px 1fr 470px;
  grid-template-areas: 'left center right';
  gap: 14px;
}

.screen-main.cert {
  padding: 10px 20px 10px;
  grid-template-columns:
    minmax(0, 0.49fr)
    minmax(0, 1fr)
    minmax(0, 0.49fr);
  gap: 20px;
}

.screen-left-panel {
  grid-area: left;
  display: flex;
  min-height: 0;
  padding-top: 34px;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.screen-center-panel {
  grid-area: center;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.screen-right-panel {
  grid-area: right;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.screen-main.task {
  padding: 6px 12px 10px;
  display: grid;
  grid-template-columns: 470px minmax(0, 1fr) 560px;
  grid-template-rows: minmax(0, 1fr) 260px;
  grid-template-areas:
    'left center right'
    'bottom bottom bottom';
  gap: 10px;
}

.screen-main.inspect {
  padding: 6px 12px 10px;
  grid-template-columns: 470px minmax(0, 1fr) 460px;
  grid-template-rows: minmax(0, 1fr) 268px;
  grid-template-areas:
    'left center right'
    'bottom bottom right';
  gap: 10px;
}

.screen-bottom-panel {
  grid-area: bottom;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}
</style>
