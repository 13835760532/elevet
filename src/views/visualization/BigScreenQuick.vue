<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="inspect" />

    <div class="screen-toolbar">
      <div class="toolbar-select" :style="{ backgroundImage: `url(${toolbarBg})` }">
        2025年度北京地区农产品质量安全风险预警【20250101-20251201】
        <span class="caret">▾</span>
      </div>
    </div>

    <main class="screen-main">
      <section class="top-grid">
        <LeftQuickSection />
        <CenterQuickSection />
        <RightQuickSection />
      </section>
      <BottomQuickTrends />
    </main>
  </div>
</template>

<script setup lang="ts">
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import LeftQuickSection from './components/bigscreenQuick/LeftQuickSection.vue';
import CenterQuickSection from './components/bigscreenQuick/CenterQuickSection.vue';
import RightQuickSection from './components/bigscreenQuick/RightQuickSection.vue';
import BottomQuickTrends from './components/bigscreenQuick/BottomQuickTrends.vue';
import toolbarBg from '@/assets/imgs/echarts/首页/Frame1_bg.png';

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
  padding: 6px 12px 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 240px;
  gap: 10px;
}

.top-grid {
  min-height: 0;
  display: grid;
  grid-template-columns: 470px minmax(0, 1fr) 460px;
  gap: 10px;
  overflow: hidden;
}
</style>
