<template>
  <div ref="selectorRef" class="big-screen-selector">
    <button class="selector-trigger" type="button" @click="toggle">
      <div class="selector-content">
        <span class="selector-text">{{ displayLabel }}</span>
        <div v-if="hasMultipleOptions" class="arrow-box">
          <el-icon :class="{ 'is-active': isOpen }">
            <CaretBottom />
          </el-icon>
        </div>
      </div>
    </button>
    <transition name="selector-fade">
      <div v-if="isOpen" class="selector-dropdown">
        <button
          v-for="option in normalizedOptions"
          :key="option.value"
          type="button"
          class="selector-option"
          :class="{ active: option.value === currentValue }"
          @click.stop="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { CaretBottom } from '@element-plus/icons-vue';

interface SelectorOption {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    label?: string
    modelValue?: string
    options?: SelectorOption[]
  }>(),
  {
    label: '2025年度北京地区农产品质量安全风险预警【20250101-20251201】',
    modelValue: '',
    options: () => []
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>();

const isOpen = ref(false);
const selectorRef = ref<HTMLElement | null>(null);
const currentValue = ref(props.modelValue || '');

const normalizedOptions = computed<SelectorOption[]>(() =>
  props.options.length
    ? props.options
    : [{ label: props.label, value: props.label }]
);

const hasMultipleOptions = computed(() => normalizedOptions.value.length > 1);

const displayLabel = computed(() => {
  const current = normalizedOptions.value.find((item) => item.value === currentValue.value);
  return current?.label || normalizedOptions.value[0]?.label || props.label;
});

const toggle = () => {
  if (!hasMultipleOptions.value) return;
  isOpen.value = !isOpen.value;
};

const selectOption = (value: string) => {
  currentValue.value = value;
  emit('update:modelValue', value);
  emit('change', value);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (!selectorRef.value?.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

watch(
  () => props.modelValue,
  (value) => {
    currentValue.value = value || normalizedOptions.value[0]?.value || '';
  },
  { immediate: true }
);

watch(
  normalizedOptions,
  (options) => {
    if (!options.some((item) => item.value === currentValue.value)) {
      currentValue.value = options[0]?.value || '';
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
.big-screen-selector {
  position: relative;
  width: 95%;
}

.selector-trigger {
  width: 100%;
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
  appearance: none;
  justify-content: center;

  &:hover {
    border-color: rgba(45, 137, 255, 0.8);
    background: rgba(4, 28, 64, 0.6);
  }
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

.selector-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgba(5, 22, 55, 0.98);
  border: 1px solid rgba(45, 137, 255, 0.5);
  box-shadow: 0 10px 24px rgba(2, 16, 44, 0.55);
}

.selector-option {
  height: 40px;
  padding: 0 12px;
  border: 1px solid transparent;
  background: rgba(8, 37, 85, 0.72);
  color: #9fc7ea;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &.active {
    color: #ffffff;
    border-color: rgba(77, 234, 255, 0.7);
    background: linear-gradient(180deg, rgba(25, 99, 181, 0.92) 0%, rgba(7, 36, 92, 0.92) 100%);
  }
}

.selector-fade-enter-active,
.selector-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.selector-fade-enter-from,
.selector-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
