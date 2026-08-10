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
    @visible-change="handleVisibleChange"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick, onBeforeUnmount } from 'vue'
import * as AreaApi from '@/api/system/area'

const cascaderRef = ref(null)
let popperContentEl: HTMLElement | undefined

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
  },
  rootAreaCode: {
    type: [Number, String],
    default: ''
  },
  showNationwide: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'select'])

const cascaderValue = ref(props.modelValue)
const areaTree = ref<any[]>([])
const originalAreaTree = ref<any[]>([])

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
    let tree = formatAreaTree(data)
    if (props.showNationwide && !props.rootAreaCode) {
      tree = [{ id: 0, name: '全国', level: 0, type: 0 }, ...tree]
    }
    originalAreaTree.value = tree
    areaTree.value = limitTreeByRootArea(originalAreaTree.value, props.rootAreaCode)
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
  if (id === undefined || id === null || id === '' || !tree || tree.length === 0) return undefined
  for (const node of tree) {
    if (String(node.id) === String(id)) return [node.id]
    if (node.children && node.children.length > 0) {
      const path = findPathById(id, node.children)
      if (path) return [node.id, ...path]
    }
  }
  return undefined
}

const findNodeById = (id: any, tree: any[]): any | undefined => {
  if (id === undefined || id === null || id === '' || !tree || tree.length === 0) return undefined
  for (const node of tree) {
    if (String(node.id) === String(id)) return node
    if (node.children && node.children.length > 0) {
      const found = findNodeById(id, node.children)
      if (found) return found
    }
  }
  return undefined
}

const findNodePathById = (id: any, tree: any[]): any[] | undefined => {
  if (id === undefined || id === null || id === '' || !tree || tree.length === 0) return undefined
  for (const node of tree) {
    if (String(node.id) === String(id)) return [node]
    if (node.children && node.children.length > 0) {
      const path = findNodePathById(id, node.children)
      if (path) return [node, ...path]
    }
  }
  return undefined
}

const limitTreeByRootArea = (tree: any[], rootAreaCode: any) => {
  if (!rootAreaCode) return tree || []
  const rootNode = findNodeById(rootAreaCode, tree || [])
  return rootNode ? [rootNode] : tree || []
}

// 递归通过名称查找 ID 路径
const resolveNamesToIds = (names: string[], tree: any[]): any[] | undefined => {
  if (!names || names.length === 0 || !tree || tree.length === 0) return undefined
  let currentTree = tree
  const result: any[] = []
  for (const name of names) {
    if (!name) continue
    const found = currentTree.find(item => item.name === name)
    if (!found) return undefined
    result.push(found.id)
    currentTree = found.children || []
  }
  return result
}

const isChineseName = (value: unknown) =>
  typeof value === 'string' && /[\u4e00-\u9fa5]/.test(value)

const normalizeIncomingValue = (value: any) => {
  if (value === undefined || value === null || value === '') return value

  if (isChineseName(value)) {
    if (value === '全国') {
      return props.emitPath ? [0] : 0
    }
    const namePath = value.includes('-') ? value.split('-') : [value]
    const resolved = resolveNamesToIds(namePath, areaTree.value)
    if (!resolved) return undefined
    return props.emitPath ? resolved : resolved[resolved.length - 1]
  }

  if (Array.isArray(value) && value.length > 0) {
    if (isChineseName(value[0])) {
      if (value[0] === '全国') {
        return props.emitPath ? [0] : 0
      }
      const resolved = resolveNamesToIds(value as string[], areaTree.value)
      if (!resolved) return undefined
      return props.emitPath ? resolved : resolved[resolved.length - 1]
    }

    if (props.emitPath) return value
    return value[value.length - 1]
  }

  const resolved = findPathById(value, areaTree.value)
  if (!resolved) return value
  return props.emitPath ? resolved : resolved[resolved.length - 1]
}

const syncCascaderValue = (value: any) => {
  cascaderValue.value = normalizeIncomingValue(value)
}

const getCascaderExposeValue = (key: string) => {
  const exposedValue = cascaderRef.value?.[key]
  return exposedValue?.value ?? exposedValue
}

const removeLeafClickListener = () => {
  if (!popperContentEl) return
  popperContentEl.removeEventListener('click', handleLeafNodeClick, true)
  popperContentEl = undefined
}

const handleLeafNodeClick = (event: MouseEvent) => {
  if (props.checkStrictly) return

  const nodeEl = (event.target as HTMLElement | null)?.closest('.el-cascader-node') as HTMLElement | null
  if (!nodeEl) return

  const panelRef = getCascaderExposeValue('cascaderPanelRef')
  const uid = Number(nodeEl.id.split('-').pop())
  if (!panelRef || Number.isNaN(uid)) return

  const node = panelRef.getFlattedNodes?.(true)?.find((item) => item.uid === uid)
  if (!node || node.isDisabled || !node.isLeaf) return

  panelRef.handleCheckChange?.(node, true)
}

const handleVisibleChange = async (visible: boolean) => {
  removeLeafClickListener()
  if (!visible || props.checkStrictly) return

  await nextTick()
  const contentRef = getCascaderExposeValue('contentRef')
  if (!contentRef) return

  popperContentEl = contentRef
  popperContentEl.addEventListener('click', handleLeafNodeClick, true)
}

onMounted(async () => {
  await getAreaTree()
  syncCascaderValue(props.modelValue)
})

onBeforeUnmount(() => {
  removeLeafClickListener()
})

watch(
  () => props.modelValue,
  (val) => {
    syncCascaderValue(val)
  }
)

watch(
  () => props.rootAreaCode,
  async () => {
    await getAreaTree()
    syncCascaderValue(props.modelValue)
  }
)

watch(
  () => props.showNationwide,
  async () => {
    await getAreaTree()
    syncCascaderValue(props.modelValue)
  }
)

const handleChange = (val) => {
  emit('update:modelValue', val)
  emit('change', val)

  // 处理汉字名称提取并回调
  if (cascaderRef.value) {
    const checkedNodes = (cascaderRef.value as any).getCheckedNodes()
    if (checkedNodes && checkedNodes.length > 0) {
      const node = checkedNodes[0]
      const pathLabels = node.pathLabels || []
      const pathValues = node.pathValues || []
      const selectedValue = pathValues[pathValues.length - 1] !== undefined ? pathValues[pathValues.length - 1] : val
      const fullPathNodes = findNodePathById(selectedValue, originalAreaTree.value) || []
      const fullPathLabels = fullPathNodes.length ? fullPathNodes.map((item) => item.name) : pathLabels
      const fullPathValues = fullPathNodes.length ? fullPathNodes.map((item) => item.id) : pathValues
      const selectedNode = fullPathNodes[fullPathNodes.length - 1] || {}

      const isNation = String(selectedValue) === '0' || fullPathLabels[0] === '全国'
      const selectedLevel = isNation ? 0 : (selectedNode.type ?? selectedNode.level ?? (fullPathValues.length || ''))

      emit('select', {
        province: isNation ? '全国' : (fullPathLabels[0] || ''),
        city: isNation ? '' : (fullPathLabels[1] || ''),
        district: isNation ? '' : (fullPathLabels[2] || ''),
        provinceCode: isNation ? '' : (fullPathValues[0] || ''),
        cityCode: isNation ? '' : (fullPathValues[1] || ''),
        districtCode: isNation ? '' : (fullPathValues[2] || ''),
        selectedCode: selectedValue !== undefined ? selectedValue : '',
        selectedLevel
      })
    }
  }

  // 终极版收起逻辑：模拟点击空白 + 穷举底层关闭字段
  if (!props.checkStrictly || (Array.isArray(val) && val.length > 0) || val !== undefined) {
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
