<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="inspect" />
    <main class="screen-main">
      <LeftQuickSection class="left-panel" />
      <CenterQuickSection class="center-panel" />
      <BottomQuickTrends class="bottom-panel" />
      <RightQuickSection class="right-panel" />
    </main>
  </div>
</template>

<script setup lang="ts">
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import LeftQuickSection from './components/bigscreenQuick/LeftQuickSection.vue';
import CenterQuickSection from './components/bigscreenQuick/CenterQuickSection.vue';
import RightQuickSection from './components/bigscreenQuick/RightQuickSection.vue';
import BottomQuickTrends from './components/bigscreenQuick/BottomQuickTrends.vue';

defineOptions({ name: 'VisualizationBigScreenQuick' });
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
  min-height: 0;
}

.center-panel {
  grid-area: center;
  min-height: 0;
}

.bottom-panel {
  grid-area: bottom;
  min-height: 0;
}

.right-panel {
  grid-area: right;
  min-height: 0;
}
</style>
