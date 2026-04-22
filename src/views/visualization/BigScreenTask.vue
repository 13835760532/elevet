<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="task" />
    <main class="screen-main">
      <LeftTaskSection class="task-left-panel" />
      <CenterTaskSection class="task-center-panel" />
      <BottomTaskSection class="task-bottom-panel" />
      <RightTaskSection class="task-right-panel" />
    </main>
  </div>
</template>

<script setup lang="ts">
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import LeftTaskSection from './components/bigscreenTask/LeftTaskSection.vue';
import CenterTaskSection from './components/bigscreenTask/CenterTaskSection.vue';
import RightTaskSection from './components/bigscreenTask/RightTaskSection.vue';
import BottomTaskSection from './components/bigscreenTask/BottomTaskSection.vue';

defineOptions({ name: 'VisualizationBigScreenTask' });
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
