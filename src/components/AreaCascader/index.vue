<template>
  <el-cascader
    ref="cascaderRef"
    v-model="cascaderValue"
    :options="areaTree"
    :props="cascaderProps"
    :placeholder="placeholder"
    :disabled="disabled"
    popper-class="area-cascader-popper"
    clearable
    filterable
    class="area-cascader"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as AreaApi from '@/api/system/area'

const cascaderRef = ref(null)

const props = defineProps({
  modelValue: {
    type: [Number, String, Array],
    default: undefined
  },
  placeholder: {
    type: String,
    default: '请选择地区'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  checkStrictly: {
    type: Boolean,
    default: false
  },
  emitPath: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'select'])

const cascaderValue = ref(props.modelValue)
const areaTree = ref<any[]>([])

const cascaderProps = computed(() => ({
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: props.checkStrictly,
  emitPath: props.emitPath,
  expandTrigger: 'hover'
}))

const getAreaTree = async () => {
  try {
    const data = await AreaApi.getAreaTree()
    areaTree.value = formatAreaTree(data)
  } catch (error) {
    console.error('获取地区树失败', error)
  }
}

// 递归格式化地区树，处理空子孙节点
const formatAreaTree = (tree: any[]) => {
  if (!tree || tree.length === 0) return []
  return tree.map(item => {
    const node = { ...item }
    if (node.children && node.children.length > 0) {
      node.children = formatAreaTree(node.children)
    } else {
      delete node.children
    }
    return node
  })
}

// 递归通过 ID 查找完整路径
const findPathById = (id: any, tree: any[]): any[] | undefined => {
  if (!id || !tree || tree.length === 0) return undefined
  for (const node of tree) {
    if (String(node.id) === String(id)) return [node.id]
    if (node.children && node.children.length > 0) {
      const path = findPathById(id, node.children)
      if (path) return [node.id, ...path]
    }
  }
  return undefined
}

// 递归通过名称查找 ID 路径
const resolveNamesToIds = (names: string[], tree: any[]): any[] | undefined => {
  if (!names || names.length === 0 || !tree || tree.length === 0) return undefined;
  let currentTree = tree;
  const result: any[] = [];
  for (const name of names) {
    if (!name) continue;
    const found = currentTree.find(item => item.name === name);
    if (!found) return undefined;
    result.push(found.id);
    currentTree = found.children || [];
  }
  return result;
};

onMounted(async () => {
  await getAreaTree()
  // 在获取树之后，尝试根据初始 modelValue (如果是名称字符串或名称数组) 进行回显
  let initialValue = props.modelValue;
  if (typeof initialValue === 'string' && /[\u4e00-\u9fa5]/.test(initialValue)) {
     initialValue = initialValue.includes('-') ? initialValue.split('-') : [initialValue];
  }
  if (initialValue && Array.isArray(initialValue) && initialValue.length > 0) {
     if (typeof initialValue[0] === 'string' && /[\u4e00-\u9fa5]/.test(initialValue[0])) {
         const resolved = resolveNamesToIds(initialValue as string[], areaTree.value);
         if (resolved) {
            cascaderValue.value = props.emitPath ? resolved : resolved[resolved.length - 1];
         }
     } else {
        // 如果是 ID 数组，尝试从最后一个 ID 寻找完整路径以确保回显文字
        const lastId = initialValue[initialValue.length - 1];
        const resolved = findPathById(lastId, areaTree.value);
        if (resolved) {
          cascaderValue.value = props.emitPath ? resolved : resolved[resolved.length - 1];
        }
     }
  } else if (initialValue) {
    // 如果是单个 ID，寻找完整路径
    const resolved = findPathById(initialValue, areaTree.value);
    if (resolved) {
      cascaderValue.value = props.emitPath ? resolved : resolved[resolved.length - 1];
    }
  }
})

watch(
  () => props.modelValue,
  (val) => {
    let processVal = val;
    // 如果是名称字符串，尝试分割并匹配
    if (typeof processVal === 'string' && /[\u4e00-\u9fa5]/.test(processVal)) {
      processVal = processVal.includes('-') ? processVal.split('-') : [processVal];
    }

    if (processVal && Array.isArray(processVal) && processVal.length > 0) {
      if (typeof processVal[0] === 'string' && /[\u4e00-\u9fa5]/.test(processVal[0])) {
        const resolved = resolveNamesToIds(processVal as string[], areaTree.value);
        if (resolved) {
          cascaderValue.value = props.emitPath ? resolved : resolved[resolved.length - 1];
          return;
        }
      } else {
        // ID 数组处理：根据最后一个 ID 找完整路径
        const lastId = processVal[processVal.length - 1];
        const resolved = findPathById(lastId, areaTree.value);
        if (resolved) {
          cascaderValue.value = props.emitPath ? resolved : resolved[resolved.length - 1];
          return;
        }
      }
    } else if (val) {
      // 单个 ID 处理
      const resolved = findPathById(val, areaTree.value);
      if (resolved) {
        cascaderValue.value = props.emitPath ? resolved : resolved[resolved.length - 1];
        return;
      }
    }
    cascaderValue.value = val;
  }
)

const handleChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
  
  // 处理汉字名称提取并回调
  if (cascaderRef.value) {
    const checkedNodes = (cascaderRef.value as any).getCheckedNodes();
    if (checkedNodes && checkedNodes.length > 0) {
      const node = checkedNodes[0];
      const pathLabels = node.pathLabels || [];
      const pathValues = node.pathValues || [];
      emit('select', {
        province: pathLabels[0] || '',
        city: pathLabels[1] || '',
        district: pathLabels[2] || '',
        provinceCode: pathValues[0] || '',
        cityCode: pathValues[1] || '',
        districtCode: pathValues[2] || ''
      });
    }
  }
  
  // 终极版收起逻辑：模拟点击空白 + 穷举底层关闭字段
  setTimeout(() => {
    // 1. 模拟浏览器层面的点击空白行为
    document.body.click()

    // 2. 尝试组件层面的强行控制
    if (cascaderRef.value) {
      const el = cascaderRef.value as any
      // 执行原装关闭逻辑
      if (el.togglePopper) el.togglePopper(false)
      el.popperVisible = false
      el.dropdownVisible = false
      el.visible = false
      
      // 触发展开状态的深入监听
      if (el.popperPaneRef) {
         el.popperPaneRef.popperVisible = false
         el.popperPaneRef.visible = false
      }
      // 触发失焦
      el.blur?.()
    }
  }, 100)
}
</script>

<style scoped lang="scss">
.area-cascader {
  width: 100%;
}
:deep(.el-input) {
  width: 100%;
}
</style>

<!-- 全局样式，用于彻底干掉所有级联选择器面板中的单选框 -->
<style lang="scss">
.area-cascader-popper, .el-cascader-panel {
  .el-radio {
    width: 100% !important;
    height: 100% !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 10 !important;
    margin-right: 0 !important;
    opacity: 0 !important;
    cursor: pointer !important;

    .el-radio__input, .el-radio__inner {
      display: none !important;
    }
  }

  .el-cascader-node {
    position: relative !important;
    padding-left: 10px !important;
    
    &.is-active {
        color: var(--el-color-primary) !important;
        font-weight: bold !important;
    }
  }
}
</style>
