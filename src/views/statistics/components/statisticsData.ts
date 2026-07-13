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

export const getCurrentUserDeptInfo = () => {
  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const userInfo = wsCache.get(CACHE_KEY.USER) || {}
  const user = userInfo.user || {}

  // 兼容新旧登录缓存结构：优先使用独立机构缓存，再回落到用户对象和历史平铺字段。
  return {
    id: userDept.id ?? user.deptId ?? userInfo.deptId,
    name: userDept.name ?? user.deptName ?? userInfo.deptName,
    deptType: userDept.deptType ?? user.deptType ?? userInfo.deptType,
    areaType: userDept.areaType ?? userDept.areaLevel,
    areaCode: userDept.areaCode
  }
}

export const isCurrentUserRegulatoryDept = () => Number(getCurrentUserDeptInfo().deptType) === 1

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
  // 页面显式选择优先，缺失时使用当前机构范围；空字符串转为 undefined 以免污染查询串。
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

  // 后端按 31 天作为日/月聚合分界，前端图表必须使用同一口径。
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

export const statisticsChartColors = {
  primary: '#00a8e8',
  primarySoft: 'rgba(0, 168, 232, 0.08)',
  purple: '#8d76ff',
  purpleSoft: 'rgba(141, 118, 255, 0.08)',
  green: '#61cdbb',
  greenSoft: 'rgba(97, 205, 187, 0.08)',
  yellow: '#f4c542',
  yellowSoft: 'rgba(244, 197, 66, 0.08)',
  text: '#263445',
  muted: '#7b8794',
  grid: '#e9f1f8',
  axis: '#d5e0ea'
}

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const createChartTooltip = (trigger: 'axis' | 'item' = 'axis', extra: Record<string, any> = {}) => ({
  trigger,
  confine: true,
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  borderColor: '#dbe6f1',
  borderWidth: 1,
  padding: [10, 12],
  textStyle: {
    color: statisticsChartColors.text,
    fontSize: 12,
    lineHeight: 20
  },
  axisPointer:
    trigger === 'axis'
      ? {
          type: 'line',
          lineStyle: {
            color: hexToRgba(statisticsChartColors.primary, 0.34),
            width: 1,
            type: 'dashed'
          }
        }
      : undefined,
  ...extra
})

export const createChartGrid = (extra: Record<string, any> = {}) => ({
  top: 26,
  right: 30,
  bottom: 30,
  left: 44,
  containLabel: true,
  ...extra
})

export const createCategoryAxis = (data: any[] = [], extra: Record<string, any> = {}) => ({
  type: 'category',
  data,
  boundaryGap: true,
  axisLine: { lineStyle: { color: statisticsChartColors.axis } },
  axisTick: { show: false },
  axisLabel: {
    color: statisticsChartColors.muted,
    fontSize: 12,
    margin: 14
  },
  splitLine: { show: false },
  ...extra
})

export const createValueAxis = (name = '', extra: Record<string, any> = {}) => ({
  type: 'value',
  name,
  nameTextStyle: {
    color: statisticsChartColors.muted,
    fontSize: 12,
    padding: [0, 0, 8, 0]
  },
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: {
    color: statisticsChartColors.muted,
    fontSize: 12
  },
  splitLine: {
    lineStyle: {
      color: statisticsChartColors.grid,
      type: 'dashed'
    }
  },
  splitNumber: 4,
  ...extra
})

export const createLineSeries = ({
  name,
  data,
  color = statisticsChartColors.primary,
  areaColor,
  smooth = true
}: {
  name: string
  data: any[]
  color?: string
  areaColor?: string
  smooth?: boolean
}) => ({
  name,
  type: 'line',
  smooth: data.length > 2 ? smooth : false,
  symbol: 'circle',
  symbolSize: 7,
  showSymbol: true,
  z: 3,
  data,
  label: {
    show: data.length > 0 && data.length <= 6,
    position: 'top',
    distance: 10,
    color,
    fontSize: 12,
    fontWeight: 700,
    formatter: ({ value }: any) => formatNumber(value)
  },
  lineStyle: {
    color,
    width: 3.5,
    shadowColor: hexToRgba(color, 0.18),
    shadowBlur: 12,
    shadowOffsetY: 5
  },
  itemStyle: {
    color,
    borderColor: '#fff',
    borderWidth: 2.5,
    shadowColor: hexToRgba(color, 0.24),
    shadowBlur: 8
  },
  areaStyle: areaColor
    ? {
        opacity: 1,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: areaColor },
            { offset: 0.58, color: areaColor.replace('0.08', '0.035') },
            { offset: 1, color: 'rgba(255, 255, 255, 0)' }
          ]
        }
      }
    : undefined
})

export const createBarSeries = ({
  name,
  data,
  color = statisticsChartColors.primary,
  maxWidth = 28
}: {
  name: string
  data: any[]
  color?: string
  maxWidth?: number
}) => ({
  name,
  type: 'bar',
  barMaxWidth: maxWidth,
  data,
  itemStyle: {
    color: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color },
        { offset: 1, color: hexToRgba(color, 0.62) }
      ]
    },
    barBorderRadius: [8, 8, 0, 0],
    shadowColor: hexToRgba(color, 0.14),
    shadowBlur: 10,
    shadowOffsetY: 4
  }
})

export const createPieSeries = ({
  name,
  data,
  colors
}: {
  name: string
  data: any[]
  colors: string[]
}) => ({
  name,
  type: 'pie',
  radius: ['48%', '68%'],
  center: ['50%', '44%'],
  avoidLabelOverlap: true,
  data: data.map((item, index) => ({
    ...item,
    itemStyle: {
      color: colors[index % colors.length],
      borderColor: '#fff',
      borderWidth: 3
    },
    label: {
      color: colors[index % colors.length],
      fontSize: 12
    },
    labelLine: {
      length: 14,
      length2: 10,
      lineStyle: {
        color: colors[index % colors.length]
      }
    }
  }))
})

export const getStatValue = (
  item: { statValue?: number; detectionCount?: number; positiveRate?: number; positiveCount?: number },
  statType: '检测量' | '阳性率'
) => Number(statType === '阳性率' ? item.positiveRate || item.statValue || 0 : item.statValue || item.detectionCount || 0)

export const normalizePagedResult = <T = any>(data: any): { list: T[]; total: number } => ({
  list: Array.isArray(data?.list) ? data.list : [],
  total: Number(data?.total || 0)
})
