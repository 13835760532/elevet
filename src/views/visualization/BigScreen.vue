<template>
  <div id="big-screen-shell" class="big-screen-shell">
    <BigScreenHeader v-model:active-menu="activeMenu" />

    <main class="screen-main" :class="activeMenu">
      <template v-if="activeMenu === 'cert'">
        <LeftCertificateSection />
        <CenterCertificateSection />
        <RightCertificateSection />
      </template>
      <template v-else-if="activeMenu === 'task'">
        <div class="task-top-layout">
          <LeftTaskSection />
          <CenterTaskSection />
          <RightTaskSection />
        </div>
        <BottomTaskSection class="task-bottom-panel" />
      </template>
      <template v-else-if="activeMenu === 'inspect'">
        <LeftQuickSection class="quick-left-panel" />
        <CenterQuickSection class="quick-center-panel" />
        <BottomQuickTrends class="quick-bottom-panel" />
        <RightQuickSection class="quick-right-panel" />
      </template>
      <template v-else>
        <LeftSection />
        <CenterSection />
        <RightSection />
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
// 首页组件
import LeftSection from './components/bigscreen/LeftSection.vue';
import CenterSection from './components/bigscreen/CenterSection.vue';
import RightSection from './components/bigscreen/RightSection.vue';
// 任务视角
import LeftTaskSection from './components/bigscreenTask/LeftTaskSection.vue';
import CenterTaskSection from './components/bigscreenTask/CenterTaskSection.vue';
import RightTaskSection from './components/bigscreenTask/RightTaskSection.vue';
import BottomTaskSection from './components/bigscreenTask/BottomTaskSection.vue';
// 快检视角
import LeftQuickSection from './components/bigscreenQuick/LeftQuickSection.vue';
import CenterQuickSection from './components/bigscreenQuick/CenterQuickSection.vue';
import RightQuickSection from './components/bigscreenQuick/RightQuickSection.vue';
import BottomQuickTrends from './components/bigscreenQuick/BottomQuickTrends.vue';
// 合格证视角
import LeftCertificateSection from './components/bigscreenCertificate/LeftCertificateSection.vue';
import CenterCertificateSection from './components/bigscreenCertificate/CenterCertificateSection.vue';
import RightCertificateSection from './components/bigscreenCertificate/RightCertificateSection.vue';

defineOptions({ name: 'VisualizationBigScreen' });

const activeMenu = ref('cert'); // 默认进入合格证视角以查看效果
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
  gap: 14px;
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
  gap: 10px;
}

.task-bottom-panel {
  height: 260px;
  flex-shrink: 0;
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
  min-height: 0;
}

.quick-center-panel {
  grid-area: center;
  min-height: 0;
}

.quick-bottom-panel {
  grid-area: bottom;
  min-height: 0;
}

.quick-right-panel {
  grid-area: right;
  min-height: 0;
}
</style>
