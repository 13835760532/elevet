import { ref, onMounted } from 'vue'
import { getIntDictOptions, getStrDictOptions, getDictLabel, DICT_TYPE } from '@/utils/dict'
import type { DictDataType, NumberDictDataType } from '@/utils/dict'

/**
 * 通用字典 Hook
 * 封装字典数据获取，提供响应式的字典选项列表和标签查询
 *
 * @param dictType 字典类型（使用 DICT_TYPE 枚举值）
 * @param valueType 值类型：'int' | 'str'，默认 'int'
 *
 * @example
 * // 获取方案类型字典
 * const { options, getLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE)
 *
 * // 模板中使用
 * // <el-option v-for="dict in options" :key="dict.value" :label="dict.label" :value="dict.value" />
 * // <span>{{ getLabel(row.planType) }}</span>
 */
export const useDict = (dictType: string, valueType: 'int' | 'str' = 'int') => {
  // 字典选项列表
  const options = ref<DictDataType[] | NumberDictDataType[]>([])

  /** 加载字典数据 */
  const loadDict = () => {
    if (valueType === 'int') {
      options.value = getIntDictOptions(dictType)
    } else {
      options.value = getStrDictOptions(dictType)
    }
  }

  /** 根据值获取标签文本 */
  const getLabel = (value: any): string => {
    return getDictLabel(dictType, value) || value || '--'
  }

  // 立即加载
  loadDict()

  // 也在 onMounted 时加载，确保 store 初始化完成后能拿到数据
  onMounted(() => {
    loadDict()
  })

  return {
    options,
    getLabel,
    loadDict,
    DICT_TYPE
  }
}

// 导出 DICT_TYPE 供外部直接使用
export { DICT_TYPE } from '@/utils/dict'
