<template>
  <div class="big-data-empty" :class="{ compact }" role="status" aria-live="polite">
    <div class="empty-mark" aria-hidden="true"></div>
    <div class="empty-copy">
      <p class="empty-title">{{ title }}</p>
      <p class="empty-desc">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    compact?: boolean
    variant?: 'bars' | 'columns' | 'line' | 'donut'
  }>(),
  {
    title: '暂无数据',
    description: '当前筛选范围未返回可视化数据',
    compact: false,
    variant: 'bars'
  }
)
</script>

<style scoped lang="scss">
.big-data-empty {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  overflow: hidden;
  color: rgba(220, 247, 255, 0.88);
  background:
    radial-gradient(circle at center, rgba(35, 151, 214, 0.08), transparent 44%),
    linear-gradient(180deg, rgba(2, 15, 42, 0.08), rgba(4, 20, 50, 0.02));
}

.empty-mark {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  border: 1px solid rgba(94, 224, 255, 0.38);
  box-shadow:
    0 0 18px rgba(72, 212, 255, 0.14),
    inset 0 0 16px rgba(72, 212, 255, 0.1);
  position: relative;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
  }

  &::before {
    inset: 8px;
    border: 1px solid rgba(94, 224, 255, 0.28);
  }

  &::after {
    width: 6px;
    height: 6px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background: rgba(98, 236, 255, 0.78);
    box-shadow: 0 0 12px rgba(98, 236, 255, 0.52);
  }
}

.empty-copy {
  min-width: 0;
  text-align: left;
  text-shadow: 0 0 10px rgba(87, 226, 255, 0.16);
}

.empty-title {
  margin: 0;
  color: rgba(226, 249, 255, 0.9);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.3;
}

.empty-desc {
  margin: 4px 0 0;
  color: rgba(159, 199, 222, 0.62);
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0;
  white-space: normal;
}

.compact {
  min-height: 104px;
  gap: 10px;

  .empty-mark {
    width: 28px;
    height: 28px;
    flex-basis: 28px;
  }

  .empty-title {
    font-size: 14px;
  }

  .empty-desc {
    font-size: 11px;
  }
}
</style>
