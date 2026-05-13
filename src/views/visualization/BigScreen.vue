<template>
  <div id="big-screen-shell" class="big-screen-shell">
    <BigScreenHeader v-model:active-menu="activeMenu" />
    <BigScreenLoadingOverlay :visible="entranceLoading" />

    <main class="screen-main" :class="activeMenu">
      <template v-if="activeMenu === 'cert'">
        <div class="cert-left-panel">
          <LeftCertificateSection v-if="panelVisibility.left" />
        </div>
        <div class="cert-center-panel">
          <CenterCertificateSection v-if="panelVisibility.center" />
        </div>
        <div class="cert-right-panel">
          <RightCertificateSection v-if="panelVisibility.right" />
        </div>
      </template>
      <template v-else-if="activeMenu === 'task'">
        <div class="task-top-layout">
          <div class="task-left-panel">
            <LeftTaskSection v-if="panelVisibility.left" />
          </div>
          <div class="task-center-panel">
            <CenterTaskSection v-if="panelVisibility.center" />
          </div>
          <div class="task-right-panel">
            <RightTaskSection v-if="panelVisibility.right" />
          </div>
        </div>
        <div class="task-bottom-panel">
          <BottomTaskSection v-if="panelVisibility.bottom" />
        </div>
      </template>
      <template v-else-if="activeMenu === 'inspect'">
        <div class="quick-left-panel">
          <LeftQuickSection v-if="panelVisibility.left" />
        </div>
        <div class="quick-center-panel">
          <CenterQuickSection v-if="panelVisibility.center" />
        </div>
        <div class="quick-bottom-panel">
          <BottomQuickTrends v-if="panelVisibility.bottom" />
        </div>
        <div class="quick-right-panel">
          <RightQuickSection v-if="panelVisibility.right" />
        </div>
      </template>
      <template v-else>
        <div class="default-left-panel">
          <LeftSection v-if="panelVisibility.left" />
        </div>
        <div class="default-center-panel">
          <CenterSection v-if="panelVisibility.center" />
        </div>
        <div class="default-right-panel">
          <RightSection v-if="panelVisibility.right" />
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, onUnmounted, ref, watch } from 'vue';
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import BigScreenLoadingOverlay from './components/bigscreen/BigScreenLoadingOverlay.vue';
import { useDeferredPanelMount, type DeferredPanelPlan } from './useDeferredPanelMount';

const LeftSection = defineAsyncComponent(() => import('./components/bigscreen/LeftSection.vue'));
const CenterSection = defineAsyncComponent(() => import('./components/bigscreen/CenterSection.vue'));
const RightSection = defineAsyncComponent(() => import('./components/bigscreen/RightSection.vue'));

const LeftTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/LeftTaskSection.vue')
);
const CenterTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/CenterTaskSection.vue')
);
const RightTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/RightTaskSection.vue')
);
const BottomTaskSection = defineAsyncComponent(
  () => import('./components/bigscreenTask/BottomTaskSection.vue')
);

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

const LeftCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/LeftCertificateSection.vue')
);
const CenterCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/CenterCertificateSection.vue')
);
const RightCertificateSection = defineAsyncComponent(
  () => import('./components/bigscreenCertificate/RightCertificateSection.vue')
);

defineOptions({ name: 'VisualizationBigScreen' });

type BigScreenMenu = '' | 'task' | 'inspect' | 'cert' | 'warn';

const activeMenu = ref<BigScreenMenu>('');
const entranceLoading = ref(true);
const { visibility: panelVisibility, schedule } = useDeferredPanelMount();
let loadingTimer: number | null = null;

const getPanelPlan = (mode: BigScreenMenu): DeferredPanelPlan => {
  if (mode === 'task' || mode === 'inspect') {
    return {
      immediate: ['left', 'center', 'right'],
      deferred: [
        { key: 'bottom', delay: 120 }
      ]
    };
  }

  return {
    immediate: ['left', 'center', 'right'],
    deferred: []
  };
};

watch(
  () => activeMenu.value,
  (mode) => {
    schedule(getPanelPlan(mode));
  }
);

onMounted(() => {
  schedule(getPanelPlan(activeMenu.value));
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
