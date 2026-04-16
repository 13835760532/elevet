<template>
  <div id="big-screen-shell" class="big-screen-shell">
    <BigScreenHeader />

    <main class="screen-main">
      <LeftSection />
      <CenterSection />
      <RightSection />
    </main>
  </div>
</template>

<script setup lang="ts">
import BigScreenHeader from './components/bigscreen/BigScreenHeader.vue';
import LeftSection from './components/bigscreen/LeftSection.vue';
import CenterSection from './components/bigscreen/CenterSection.vue';
import RightSection from './components/bigscreen/RightSection.vue';

defineOptions({ name: 'VisualizationBigScreen' });
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
</style>
