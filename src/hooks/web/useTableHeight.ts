import { ref, onMounted, onUnmounted, nextTick, unref, Ref } from 'vue';

/**
 * 动态计算表格高度的 Hook
 * @param elementRef 挂载高度的元素引用（通常是 table-wrapper 或 el-table 实例）
 * @param offsetBottom 底部偏移量（通常包含分页器高度 + 间距，默认 80）
 * @returns 响应式高度值
 */
export function useTableHeight(elementRef: Ref<any>, offsetBottom = 100) {
  const tableHeight = ref<number | string>(400);

  const calculateHeight = async () => {
    await nextTick();
    const el = unref(elementRef);
    if (!el) return;

    // 如果是组件实例且暴露了 $el，则取 $el
    const targetEl = el.$el || el;
    if (!(targetEl instanceof HTMLElement)) return;

    const { top } = targetEl.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // 计算剩余高度：窗口总高 - 元素距离顶部高度 - 底部固定的偏移量
    const height = windowHeight - top - offsetBottom;
    
    // 设置最小高度，防止显示不全
    tableHeight.value = height > 200 ? height : 200;
  };

  onMounted(() => {
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', calculateHeight);
  });

  return {
    tableHeight,
    calculateHeight
  };
}
