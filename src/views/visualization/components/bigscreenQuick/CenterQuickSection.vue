<template>
  <section class="center-quick-section">
    <BigPanelCard class="big-panel-center" title="快速检测地域分布图" :bg-image="centerBg">
      <div class="map-area">
        <VisualizationMap class="quick-map" mode="fast" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import centerBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';
import VisualizationMap from '../Map.vue';
</script>

<style scoped lang="scss">
.center-quick-section {
  min-width: 0;
}

.map-area {
  position: relative;
  min-height: 0;
  flex: 1;
}

.quick-map {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
