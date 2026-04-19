<template>
  <div class="big-screen-shell">
    <BigScreenHeader :show-data-config="false" active-menu="cert" />

    <div class="screen-toolbar">
      <div class="toolbar-select" :style="{ backgroundImage: `url(${toolbarBg})` }">
        2025年度北京地区农产品质量安全风险预警【20250101-20251201】
        <span class="caret">▾</span>
      </div>
    </div>

    <main class="screen-main">
      <LeftCertificateSection />
      <CenterCertificateSection />
      <RightCertificateSection />
    </main>
  </div>
</template>

<script setup lang="ts">
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import LeftCertificateSection from './components/bigscreenCertificate/LeftCertificateSection.vue';
import CenterCertificateSection from './components/bigscreenCertificate/CenterCertificateSection.vue';
import RightCertificateSection from './components/bigscreenCertificate/RightCertificateSection.vue';
import toolbarBg from '@/assets/imgs/echarts/首页/Frame1_bg.png';

defineOptions({ name: 'VisualizationBigScreenCertificate' });
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
  padding: 8px 12px 0;
  display: grid;
  grid-template-columns: 470px 1fr 460px;
  gap: 12px;
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
