<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="检测任务地域发布" :bg-image="centerBg">
      <div class="map-area">
        <Map mode="task" task-label="任务接收" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import BigPanelCard from '../bigscreen/BigPanelCard.vue'
import Map from '../Map.vue'
import centerBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png'
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
</style>
