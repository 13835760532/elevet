<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="检测任务地域发布" :bg-image="centerBg">
      <div class="map-area">
        <Map mode="task" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import Map from '../Map.vue';
import centerBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';

</script>

<style scoped lang="scss">
.center-section {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.big-panel-center {
  flex: 1;
  min-height: 0;
}

.map-area {
  position: relative;
  min-height: 0;
  flex: 1;
}

.map-legend {
  position: absolute;
  right: 12px;
  bottom: 52px;
  min-width: 100px;
  padding: 7px 8px;
  background: rgba(4, 30, 66, 0.78);
  border: 1px solid rgba(63, 161, 255, 0.4);
  z-index: 2;

  .legend-title {
    color: #67dfff;
    font-size: 13px;
    margin-bottom: 4px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #9abedf;
    font-size: 12px;
    margin-bottom: 1px;

    .dot {
      width: 8px;
      height: 8px;
    }
  }
}
</style>
