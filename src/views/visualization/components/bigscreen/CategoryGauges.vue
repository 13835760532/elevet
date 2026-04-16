<template>
  <div class="category-gauges">
    <div class="gauge-item" v-for="item in items" :key="item.name">
      <div class="gauge-wrap">
        <div class="gauge-wrap-img"></div>
        <!-- 中间文本 -->
        <div class="gauge-text">
          <div class="label">{{ item.name }}</div>
          <div class="value" :style="{ color: item.color }">{{ item.value }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { name: '蔬菜', value: 49, color: '#2d7bff' },
  { name: '水果', value: 49, color: '#49d3f8' },
  { name: '禽畜', value: 49, color: '#95d34a' },
  { name: '水产', value: 49, color: '#efbd3f' },
  { name: '茶叶', value: 49, color: '#f49a38' }
];
</script>

<style scoped lang="scss">
.category-gauges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  gap: 20px 10px;
}

.gauge-item {
  width: 120px;
  height: 120px;
  flex: none;
  
  &:nth-child(4) {
    margin-left: 0px;
  }
}

.gauge-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gauge-wrap-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('@/assets/imgs/echarts/首页/a.png') no-repeat center center;
  background-size: 100% 100%;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gauge-svg {
  width: 100%;
  height: 100%;
  
  circle {
    fill: none;
    stroke-width: 4;
  }
  
  .gauge-bg {
    stroke: rgba(110, 215, 255, 0.15);
  }
  
  .gauge-inner-dotted {
    stroke: rgba(110, 215, 255, 0.35);
    stroke-width: 1;
  }
  
  .gauge-progress {
    stroke-width: 4;
    transition: stroke-dasharray 0.3s ease;
  }
}

.gauge-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  .label {
    color: #bbdbfa;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 20px;
    font-weight: 800;
    font-family: 'Din', sans-serif;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  }
}
</style>
