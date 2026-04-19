<template>
  <div class="big-screen-selector" @click="toggle">
    <div class="selector-content">
      <span class="selector-text">{{ label }}</span>
      <div class="arrow-box">
        <el-icon :class="{ 'is-active': isOpen }">
          <CaretBottom />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CaretBottom } from '@element-plus/icons-vue';

defineProps({
  label: {
    type: String,
    default: '2025年度北京地区农产品质量安全风险预警【20250101-20251201】'
  }
});

const isOpen = ref(false);
const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped lang="scss">
.big-screen-selector {
  width: 95%;
  height: 46px;
  background: rgba(4, 28, 64, 0.4);
  border: 1px solid rgba(45, 137, 255, 0.5);
  box-shadow: inset 0 0 10px rgba(45, 137, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;

  &:hover {
    border-color: rgba(45, 137, 255, 0.8);
    background: rgba(4, 28, 64, 0.6);
  }

  .selector-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .selector-text {
    color: #bbdbfa;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: 0.5px;
  }

  .arrow-box {
    color: #43e4ff;
    font-size: 16px;
    display: flex;
    align-items: center;

    .el-icon {
      transition: transform 0.3s;

      &.is-active {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
