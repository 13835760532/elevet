import dayjs from 'dayjs'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

export interface StatisticsQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
  areaType?: string | number
  areaCode?: string | number
  dateType?: number
  timeUnit?: 'DAY' | 'MONTH'
}

const normalizeAreaValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

export const isSuperAdmin = () => {
  const { wsCache } = useCache()
  const userInfo = wsCache.get(CACHE_KEY.USER)
  const roles = userInfo?.roles || []
  return Array.isArray(roles) && roles.includes('super_admin')
}

export const getUserDeptAreaParams = () => {
  if (isSuperAdmin()) {
    return {
      areaType: '',
      areaCode: ''
    }
  }

  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  return {
    areaType: normalizeAreaValue(userDept.areaType || userDept.areaLevel),
    areaCode: normalizeAreaValue(userDept.areaCode)
  }
}

export const getSelectedAreaParams = (area: any) => ({
  provinceName: area?.province || '',
  cityName: area?.city || '',
  areaCode: normalizeAreaValue(
    area?.selectedCode || area?.districtCode || area?.cityCode || area?.provinceCode
  ),
  areaType: normalizeAreaValue(
    area?.selectedLevel || (area?.districtCode ? 3 : area?.cityCode ? 2 : area?.provinceCode ? 1 : '')
  )
})

export const getEffectiveAreaParams = (areaParams?: {
  provinceName?: string
  cityName?: string
  areaType?: string | number
  areaCode?: string | number
}) => {
  const userDeptAreaParams = getUserDeptAreaParams()
  return {
    provinceName: areaParams?.provinceName || undefined,
    cityName: areaParams?.cityName || undefined,
    areaType: areaParams?.areaType || userDeptAreaParams.areaType || undefined,
    areaCode: areaParams?.areaCode || userDeptAreaParams.areaCode || undefined
  }
}

export const buildRangeParams = (rangeType: string, dateRange: string[]): StatisticsQueryParams => {
  let startDate = ''
  let endDate = ''

  if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    startDate = dateRange[0]
    endDate = dateRange[1]
  } else {
    const today = dayjs()
    if (rangeType === '近一周') {
      startDate = today.subtract(6, 'day').format('YYYY-MM-DD')
      endDate = today.format('YYYY-MM-DD')
    } else if (rangeType === '近一月') {
      startDate = today.subtract(1, 'month').add(1, 'day').format('YYYY-MM-DD')
      endDate = today.format('YYYY-MM-DD')
    } else if (rangeType === '去年') {
      startDate = today.subtract(1, 'year').startOf('year').format('YYYY-MM-DD')
      endDate = today.subtract(1, 'year').endOf('year').format('YYYY-MM-DD')
    } else {
      // 默认当年
      startDate = today.startOf('year').format('YYYY-MM-DD')
      endDate = today.format('YYYY-MM-DD')
    }
  }

  const diff = dayjs(endDate).diff(dayjs(startDate), 'day')
  const isDaily = diff <= 31

  return {
    startDate,
    endDate,
    dateType: isDaily ? 1 : 2, // 1按天 2按月
    timeUnit: isDaily ? 'DAY' : 'MONTH'
  }
}

export const formatNumber = (value?: number | string, fractionDigits = 0) => {
  const numeric = Number(value || 0)
  if (!Number.isFinite(numeric)) return '0'
  return numeric.toLocaleString('zh-CN', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })
}

export const formatPercent = (value?: number | string) => `${formatNumber(value, 1)}%`

export const getStatValue = (
  item: { statValue?: number; detectionCount?: number; positiveRate?: number; positiveCount?: number },
  statType: '检测量' | '阳性率'
) => Number(statType === '阳性率' ? item.positiveRate || item.statValue || 0 : item.statValue || item.detectionCount || 0)

export const normalizePagedResult = <T = any>(data: any): { list: T[]; total: number } => ({
  list: Array.isArray(data?.list) ? data.list : [],
  total: Number(data?.total || 0)
})
