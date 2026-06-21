<template>
  <div id="big-screen-shell" class="big-screen-shell">
    <BigScreenHeader v-model:active-menu="activeMenu" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />

    <main class="screen-main" :class="renderMenu">
      <template v-if="renderMenu === 'cert'">
        <div class="cert-left-panel">
          <LeftCertificateSection v-if="panelVisibility.left" key="LeftCertificateSection" />
        </div>
        <div class="cert-center-panel">
          <CenterCertificateSection v-if="panelVisibility.center" key="CenterCertificateSection" />
        </div>
        <div class="cert-right-panel">
          <RightCertificateSection v-if="panelVisibility.right" key="RightCertificateSection" />
        </div>
      </template>
      <template v-else-if="renderMenu === 'task'">
        <div class="task-top-layout">
          <div class="task-left-panel">
            <LeftTaskSection v-if="panelVisibility.left" key="LeftTaskSection" />
          </div>
          <div class="task-center-panel">
            <CenterTaskSection v-if="panelVisibility.center" key="CenterTaskSection" />
          </div>
          <div class="task-right-panel">
            <RightTaskSection v-if="panelVisibility.right" key="RightTaskSection" />
          </div>
        </div>
        <div class="task-bottom-panel">
          <BottomTaskSection v-if="panelVisibility.bottom" key="BottomTaskSection" />
        </div>
      </template>
      <template v-else-if="renderMenu === 'inspect'">
        <div class="quick-left-panel">
          <LeftQuickSection v-if="panelVisibility.left" key="LeftQuickSection" />
        </div>
        <div class="quick-center-panel">
          <CenterQuickSection v-if="panelVisibility.center" key="CenterQuickSection" />
        </div>
        <div class="quick-bottom-panel">
          <BottomQuickTrends v-if="panelVisibility.bottom" key="BottomQuickTrends" />
        </div>
        <div class="quick-right-panel">
          <RightQuickSection v-if="panelVisibility.right" key="RightQuickSection" />
        </div>
      </template>
      <template v-else>
        <div class="default-left-panel">
          <LeftSection v-if="panelVisibility.left" key="LeftSection" />
        </div>
        <div class="default-center-panel">
          <CenterSection v-if="panelVisibility.center" key="CenterSection" />
        </div>
        <div class="default-right-panel">
          <RightSection v-if="panelVisibility.right" key="RightSection" />
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue'
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue'
import { useDeferredPanelMount, type DeferredPanelPlan } from './useDeferredPanelMount'

const LeftSection = defineAsyncComponent(() => import('./components/bigscreen/LeftSection.vue'))
const CenterSection = defineAsyncComponent(() => import('./components/bigscreen/CenterSection.vue'))
const RightSection = defineAsyncComponent(() => import('./components/bigscreen/RightSection.vue'))

const LeftTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/LeftTaskSection.vue')
)
const CenterTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/CenterTaskSection.vue')
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
const CenterQuickSection = defineAsyncComponent(
  () => import('./components/bigscreenQuick/CenterQuickSection.vue')
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
const CenterCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/CenterCertificateSection.vue')
)
const RightCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/RightCertificateSection.vue')
)

defineOptions({ name: 'VisualizationBigScreen' })

type BigScreenMenu = '' | 'task' | 'inspect' | 'cert' | 'warn'
type BigScreenQueryKey = '' | 'task' | 'quick' | 'cert'
const INITIAL_LOADING_DELAY = 420
const SWITCH_LOADING_DELAY = 420
const SWITCH_RENDER_DELAY = 80

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
const { visibility: panelVisibility, schedule } = useDeferredPanelMount()
let loadingTimer: number | null = null
let switchRenderTimer: number | null = null
let mounted = false

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
    deferred: [{ key: 'center', delay: 60 }]
  }
}

const getSwitchPanelPlan = (mode: BigScreenMenu): DeferredPanelPlan => {
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
      { key: 'right', delay: 80 },
      { key: 'center', delay: 180 }
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

onMounted(() => {
  mounted = true
  schedule(getPanelPlan(renderMenu.value))
  showLoadingFor(INITIAL_LOADING_DELAY)
})

onUnmounted(() => {
  clearLoadingTimer()
  clearSwitchRenderTimer()
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

.screen-main {
  flex: 1;
  min-height: 0;
  padding: 10px;
  padding-bottom: 0;
  display: grid;
  grid-template-columns: 470px 1fr 470px;
  grid-template-areas: 'left center right';
  gap: 14px;
}

.screen-main.cert {
  padding: 0 20px 10px;
  grid-template-columns:
    minmax(0, 0.49fr)
    minmax(0, 1fr)
    minmax(0, 0.49fr);
  gap: 20px;
}

.default-left-panel,
.cert-left-panel {
  grid-area: left;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.default-center-panel,
.cert-center-panel {
  grid-area: center;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.default-right-panel,
.cert-right-panel {
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-top-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 470px minmax(0, 1fr) 560px;
  grid-template-areas: 'left center right';
  gap: 10px;
}

.task-bottom-panel {
  height: 260px;
  flex-shrink: 0;
}

.task-left-panel {
  grid-area: left;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.task-center-panel {
  grid-area: center;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.task-right-panel {
  grid-area: right;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
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

.quick-left-panel {
  grid-area: left;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.quick-center-panel {
  grid-area: center;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.quick-bottom-panel {
  grid-area: bottom;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}

.quick-right-panel {
  grid-area: right;
  display: flex;
  min-height: 0;

  > * {
    flex: 1;
    min-height: 0;
  }
}
</style>
