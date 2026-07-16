import dayjs from 'dayjs'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import {
  getBigScreenDataScopeLabel,
  getBigScreenQueryDeptScope,
  resolveBigScreenDataScope,
  type BigScreenDataScope
} from './dataScope'

export const BIG_SCREEN_CONFIG_STORAGE_KEY = 'big-screen-data-config'
export const BIG_SCREEN_REFRESH_EVENT = 'big-screen-refresh'

export interface BigScreenDataConfig {
  timeRange: [string, string]
  dataScope: BigScreenDataScope
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
  dataScope: resolveBigScreenDataScope(undefined, canViewBigScreenJurisdictionScope()),
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

export const getBigScreenUserDeptType = () => {
  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const userInfo = wsCache.get(CACHE_KEY.USER) || {}
  return userDept.deptType ?? userInfo?.user?.deptType ?? userInfo.deptType
}

export const canViewBigScreenJurisdictionScope = () =>
  isBigScreenSuperAdmin() || Number(getBigScreenUserDeptType()) === 1

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
    const parsed = JSON.parse(raw) as Partial<BigScreenDataConfig> & { dataScope?: unknown }
    const defaults = getDefaultBigScreenConfig()
    // localStorage 可能来自旧版本；合并默认值，并归一化下方消费的核心字段。
    return {
      ...defaults,
      ...parsed,
      dataScope: resolveBigScreenDataScope(parsed.dataScope, canViewBigScreenJurisdictionScope()),
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

export const formatBigScreenRegionLabel = (label?: string) => {
  const value = String(label || '').trim()
  if (!value) return '全部地区'
  const parts = value
    .split('-')
    .map((item) => item.trim())
    .filter((item) => item && item !== '市辖区')

  return parts
    .filter((item, index) => item !== parts[index - 1])
    .join('')
}

export const formatBigScreenDataSummary = (config = getBigScreenConfig()) => {
  const [startDate, endDate] = config.timeRange || []
  const regionLabel = formatBigScreenRegionLabel(config.regionLabel)
  const timeLabel = startDate && endDate ? `${startDate} 至 ${endDate}` : '默认时间'
  const scopeLabel = getBigScreenDataScopeLabel(config.dataScope)
  return `${regionLabel}｜${timeLabel}｜${scopeLabel}`
}

export const getBigScreenQueryParams = () => {
  const config = getBigScreenConfig()
  return {
    startDate: config.timeRange?.[0] || undefined,
    endDate: config.timeRange?.[1] || undefined,
    dataScope: config.dataScope || undefined,
    queryDeptScope: getBigScreenQueryDeptScope(config.dataScope)
  }
}

export const getBigScreenRiskAreaQueryParams = () => {
  const config = getBigScreenConfig()
  const userDeptAreaParams = getBigScreenUserDeptAreaParams()
  // 只有区域风险 TOP10 按页面选择地区过滤；未选择时回落到所属机构。
  return {
    ...getBigScreenQueryParams(),
    provinceName: config.provinceName || undefined,
    cityName: config.cityName || undefined,
    areaCode: config.areaCode || userDeptAreaParams.areaCode || undefined
  }
}

export const dispatchBigScreenRefresh = (reason: 'save' | 'timer' | 'menu' = 'save') => {
  if (typeof window === 'undefined') return
  // 各面板彼此独立，通过同一浏览器事件刷新，避免组件之间形成直接引用。
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

export const getCachedAreaLevel = () => {
  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const config = getBigScreenConfig()
  
  const level = userDept.areaLevel || userDept.areaType || config.areaType
  if (level !== undefined && level !== null && level !== '') {
    return String(level)
  }
  return undefined
}

export const isMunicipality = (name?: string) => {
  if (!name) return false
  const n = String(name).trim()
  return n.includes('北京') || n.includes('上海') || n.includes('天津') || n.includes('重庆')
}
