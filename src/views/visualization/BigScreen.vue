<template>
  <div id="big-screen-shell" class="big-screen-shell">
    <div id="big-screen-root" ref="screenRef" class="big-screen-root" :style="{ backgroundImage: `url(${screenBg})` }">
      <BigScreenHeader />

      <div class="screen-toolbar">
        <div class="toolbar-select" :style="{ backgroundImage: `url(${dataConfigBg})` }">
          2025年度北京地区农产品质量安全风险预警【20250101-20251201】
          <span class="caret">▾</span>
        </div>
      </div>

      <main class="screen-main">
        <LeftSection />
        <CenterSection />
        <RightSection />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import LeftSection from './components/bigscreen/LeftSection.vue';
import CenterSection from './components/bigscreen/CenterSection.vue';
import RightSection from './components/bigscreen/RightSection.vue';
import screenBg from '@/assets/imgs/echarts/首页/bg.png';
import dataConfigBg from '@/assets/imgs/echarts/首页/Frame1_bg.png';
import autofit from './autofit';

defineOptions({ name: 'VisualizationBigScreen' });

onMounted(() => {
  autofit.init({
    el: '#big-screen-root',
    container: '#big-screen-shell',
    dw: 1920,
    dh: 1180,
    resize: true,
    delay: 120
  });
});

onUnmounted(() => {
  autofit.destroy();
});
</script>

<style scoped lang="scss">
.big-screen-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 132, 255, 0.2), transparent 38%),
    radial-gradient(circle at 80% 80%, rgba(0, 190, 255, 0.12), transparent 42%),
    linear-gradient(180deg, #020917 0%, #010612 100%);
}

.big-screen-root {
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 0;
  left: 0;
  transform: none;
  transform-origin: left top;
  display: flex;
  flex-direction: column;
  color: #ecf7ff;
  border-radius: 14px;
  overflow: hidden;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid rgba(58, 135, 227, 0.5);
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
  padding: 0 18px 14px;
  display: grid;
  grid-template-columns: 470px 1fr 470px;
  gap: 14px;
}
</style>
