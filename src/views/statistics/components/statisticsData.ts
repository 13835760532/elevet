import dayjs from 'dayjs'

export interface StatisticsQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
}

export const buildRangeParams = (rangeType: string, dateRange: string[]): StatisticsQueryParams => {
  if (Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    return {
      startDate: dateRange[0],
      endDate: dateRange[1]
    }
  }

  const today = dayjs()
  if (rangeType === '近一周') {
    return {
      startDate: today.subtract(6, 'day').format('YYYY-MM-DD'),
      endDate: today.format('YYYY-MM-DD')
    }
  }
  if (rangeType === '近一月') {
    return {
      startDate: today.subtract(1, 'month').add(1, 'day').format('YYYY-MM-DD'),
      endDate: today.format('YYYY-MM-DD')
    }
  }

  return {
    startDate: today.startOf('year').format('YYYY-MM-DD'),
    endDate: today.format('YYYY-MM-DD')
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

export const formatPercent = (value?: number | string) => `${formatNumber(value, 2)}%`

export const getStatValue = (
  item: { statValue?: number; detectionCount?: number; positiveRate?: number; positiveCount?: number },
  statType: '检测量' | '阳性率'
) => Number(statType === '阳性率' ? item.positiveRate || item.statValue || 0 : item.statValue || item.detectionCount || 0)

export const normalizePagedResult = <T = any>(data: any): { list: T[]; total: number } => ({
  list: Array.isArray(data?.list) ? data.list : [],
  total: Number(data?.total || 0)
})
