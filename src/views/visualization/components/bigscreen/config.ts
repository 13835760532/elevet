import dayjs from 'dayjs'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

export const BIG_SCREEN_CONFIG_STORAGE_KEY = 'big-screen-data-config'
export const BIG_SCREEN_REFRESH_EVENT = 'big-screen-refresh'

export interface BigScreenDataConfig {
  timeRange: [string, string]
  regionPath: number[]
  regionLabel: string
  provinceName: string
  cityName: string
  districtName: string
  areaType: string
  areaCode: string
  frequency: number
}

const today = dayjs().format('YYYY-MM-DD')
const defaultStart = dayjs().startOf('year').format('YYYY-MM-DD')

export const getDefaultBigScreenConfig = (): BigScreenDataConfig => ({
  timeRange: [defaultStart, today],
  regionPath: [],
  regionLabel: '',
  provinceName: '',
  cityName: '',
  districtName: '',
  areaType: '',
  areaCode: '',
  frequency: 5
})

const normalizeAreaValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') return ''
  return String(value)
}

export const isBigScreenSuperAdmin = () => {
  const { wsCache } = useCache()
  const userInfo = wsCache.get(CACHE_KEY.USER)
  const roles = userInfo?.roles || []
  return Array.isArray(roles) && roles.includes('super_admin')
}

export const getBigScreenUserDeptAreaParams = () => {
  if (isBigScreenSuperAdmin()) {
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

export const getBigScreenConfig = (): BigScreenDataConfig => {
  if (typeof window === 'undefined') return getDefaultBigScreenConfig()
  try {
    const raw = window.localStorage.getItem(BIG_SCREEN_CONFIG_STORAGE_KEY)
    if (!raw) return getDefaultBigScreenConfig()
    const parsed = JSON.parse(raw) as Partial<BigScreenDataConfig>
    const defaults = getDefaultBigScreenConfig()
    return {
      ...defaults,
      ...parsed,
      timeRange:
        Array.isArray(parsed.timeRange) && parsed.timeRange.length === 2
          ? [String(parsed.timeRange[0]), String(parsed.timeRange[1])]
          : defaults.timeRange,
      regionPath: Array.isArray(parsed.regionPath)
        ? parsed.regionPath.map((item) => Number(item)).filter((item) => !Number.isNaN(item))
        : [],
      frequency: Math.max(1, Number(parsed.frequency || defaults.frequency))
    }
  } catch (error) {
    console.error('读取大屏配置缓存失败', error)
    return getDefaultBigScreenConfig()
  }
}

export const saveBigScreenConfig = (config: BigScreenDataConfig) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(BIG_SCREEN_CONFIG_STORAGE_KEY, JSON.stringify(config))
}

export const getBigScreenQueryParams = () => {
  const config = getBigScreenConfig()
  const userDeptAreaParams = getBigScreenUserDeptAreaParams()
  return {
    startDate: config.timeRange?.[0] || undefined,
    endDate: config.timeRange?.[1] || undefined,
    provinceName: config.provinceName || undefined,
    cityName: config.cityName || undefined,
    areaType: config.areaType || userDeptAreaParams.areaType || undefined,
    areaCode: config.areaCode || userDeptAreaParams.areaCode || undefined
  }
}

export const dispatchBigScreenRefresh = (reason: 'save' | 'timer' | 'menu' = 'save') => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(BIG_SCREEN_REFRESH_EVENT, {
      detail: {
        reason,
        config: getBigScreenConfig(),
        timestamp: Date.now()
      }
    })
  )
}

export const subscribeBigScreenRefresh = (callback: () => void) => {
  if (typeof window === 'undefined') return () => undefined
  const handler = () => callback()
  window.addEventListener(BIG_SCREEN_REFRESH_EVENT, handler)
  return () => window.removeEventListener(BIG_SCREEN_REFRESH_EVENT, handler)
}
