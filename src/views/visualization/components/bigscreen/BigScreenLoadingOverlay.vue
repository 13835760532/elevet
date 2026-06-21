<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="screen-loading">
        <div class="loading-content">
          <div class="loading-ring"></div>
          <p class="loading-text">{{ text }}</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    text?: string
  }>(),
  {
    text: '大屏加载中...'
  }
)
</script>

<style scoped lang="scss">
.screen-loading {
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: rgba(2, 6, 23, 0.94);
  backdrop-filter: blur(4px);
  contain: layout paint;
  pointer-events: auto;
}

.loading-content {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  transform: translate(-50%, -50%);
}

.loading-ring {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 3px solid rgba(34, 211, 238, 0.18);
  border-top-color: rgba(34, 211, 238, 0.9);
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.2);
}

.loading-text {
  margin: 0;
  color: #9ec2e5;
  font-size: 14px;
  letter-spacing: 1px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
