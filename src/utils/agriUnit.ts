import { computed, unref, watch, type Ref } from 'vue'
import type { DictDataType } from '@/utils/dict'
import { DICT_TYPE, getDictLabel, getStrDictOptions } from '@/utils/dict'
import { useDictStoreWithOut } from '@/store/modules/dict'

export const DEFAULT_AGRI_MEASUREMENT_UNIT = 'kg'
export const DEFAULT_PRODUCTION_SCALE_UNIT = '亩'

type UnitOption = Pick<DictDataType, 'label' | 'value'> & Partial<DictDataType>
type MaybeRef<T> = Ref<T> | T

const LEGACY_AGRI_UNIT_LABELS: Record<string, string> = {
  '1': '个',
  t: '吨',
  ton: '吨',
  kg: '千克',
  g: '克',
  box: '箱',
  bag: '袋',
  piece: '件',
  basket: '筐',
  unit: '个',
  pcs: '个',
  plate: '盘',
  bottle: '瓶',
  mu: '亩',
  ha: '公顷',
  亩: '亩',
  公顷: '公顷',
  平方米: '平方米',
  吨: '吨',
  千克: '千克',
  克: '克',
  箱: '箱',
  袋: '袋',
  件: '件',
  筐: '筐',
  个: '个',
  盘: '盘',
  瓶: '瓶'
}

const toOptionValue = (value: unknown) => (value ?? '').toString()

const matchesPreferredUnit = (option: UnitOption, preferredValues: string[]) => {
  const value = toOptionValue(option.value)
  return preferredValues.includes(value) || preferredValues.includes(option.label)
}

export const getAgriUnitLabel = (value?: string | number | null): string => {
  const unitValue = toOptionValue(value)
  if (!unitValue) return '--'
  return getDictLabel(DICT_TYPE.AGRI_MEASUREMENT_UNIT, unitValue) || LEGACY_AGRI_UNIT_LABELS[unitValue] || unitValue
}

export const createUnitOptionsWithLegacy = (
  dictOptions: Ref<UnitOption[]>,
  currentValues: Array<Ref<string | number | undefined | null> | string | number | undefined | null> = []
) => {
  return computed<UnitOption[]>(() => {
    const optionMap = new Map<string, UnitOption>()

    unref(dictOptions).forEach((option) => {
      optionMap.set(toOptionValue(option.value), option)
    })

    currentValues.forEach((currentValue) => {
      const value = toOptionValue(unref(currentValue))
      if (value && !optionMap.has(value)) {
        optionMap.set(value, {
          label: getAgriUnitLabel(value),
          value
        })
      }
    })

    return Array.from(optionMap.values())
  })
}

export const useAgriMeasurementUnitOptions = (
  currentValues: Array<MaybeRef<string | number | undefined | null>> = []
) => {
  const dictStore = useDictStoreWithOut()
  if (!dictStore.getIsSetDict) {
    dictStore.setDictMap().then()
  }
  const options = computed<UnitOption[]>(() => {
    if (!dictStore.getIsSetDict) return []
    return getStrDictOptions(DICT_TYPE.AGRI_MEASUREMENT_UNIT)
  })
  return createUnitOptionsWithLegacy(options, currentValues)
}

export const usePreferredAgriMeasurementUnitOptions = (
  targetValue: Ref<string | number | undefined | null>,
  preferredValues: string[],
  fallbackValue: string,
  enabled: MaybeRef<boolean> = true
) => {
  const options = useAgriMeasurementUnitOptions([targetValue])

  watch(
    [options, () => unref(targetValue), () => unref(enabled)],
    ([unitOptions, currentRawValue, enabledValue]) => {
      if (!enabledValue) return

      const currentValue = toOptionValue(currentRawValue)
      if (currentValue && currentValue !== fallbackValue) return

      const preferredOption = unitOptions.find((option) => matchesPreferredUnit(option, preferredValues))
      const nextValue = toOptionValue(preferredOption?.value || fallbackValue)
      if (nextValue && nextValue !== currentValue) {
        targetValue.value = nextValue
      }
    },
    { immediate: true }
  )

  return options
}
