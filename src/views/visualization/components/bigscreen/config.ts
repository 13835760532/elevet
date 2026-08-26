import dayjs from 'dayjs'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import {
  getBigScreenApiDataScope,
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

/**
 * 生成当前账号可用的大屏默认配置。
 *
 * 默认统计本年度数据，每 5 分钟刷新一次；数据范围会根据当前账号是否具有辖区
 * 查看权限自动选择，避免普通机构首次进入时请求到无权访问的辖区数据。
 */
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

/** 判断当前登录账号是否具有超级管理员角色。 */
export const isBigScreenSuperAdmin = () => {
  const { wsCache } = useCache()
  const userInfo = wsCache.get(CACHE_KEY.USER)
  const roles = userInfo?.roles || []
  return Array.isArray(roles) && roles.includes('super_admin')
}

/**
 * 获取当前账号所属机构类型。
 *
 * 优先读取独立的机构缓存，兼容旧版本将机构字段放在用户信息中的缓存结构。
 */
export const getBigScreenUserDeptType = () => {
  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const userInfo = wsCache.get(CACHE_KEY.USER) || {}
  return userDept.deptType ?? userInfo?.user?.deptType ?? userInfo.deptType
}

/** 判断当前账号是否允许查看“本辖区”维度的数据。 */
export const canViewBigScreenJurisdictionScope = () =>
  isBigScreenSuperAdmin() || Number(getBigScreenUserDeptType()) === 1

/** 判断当前登录账号是否属于全国级别（超级管理员、全国机构 areaLevel=0 或 areaCode=0/100000）。 */
export const isBigScreenNationwide = () => {
  if (isBigScreenSuperAdmin()) return true
  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const areaLevel = userDept.areaLevel ?? userDept.areaType
  const areaCode = String(userDept.areaCode || '').trim()
  return Number(areaLevel) === 0 || areaCode === '0' || areaCode === '100000'
}

/**
 * 获取当前账号所属机构的行政区划参数。
 *
 * 超级管理员与全国机构不附加地区约束；其他账号返回机构缓存中的行政级别和行政区编码，
 * 供地图初始范围及统计接口的权限回退使用。
 */
export const getBigScreenUserDeptAreaParams = () => {
  if (isBigScreenNationwide()) {
    return {
      areaType: '0',
      areaCode: ''
    }
  }

  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const areaLevel = userDept.areaLevel ?? userDept.areaType
  return {
    areaType: normalizeAreaValue(areaLevel),
    areaCode: normalizeAreaValue(userDept.areaCode)
  }
}

/**
 * 获取当前登录账号专属的大屏配置缓存 Key。
 *
 * 绑定用户 ID，实现多账号在同一浏览器登录时筛选范围、日期与配置的相互独立。
 */
export const getBigScreenConfigStorageKey = () => {
  const { wsCache } = useCache()
  const userInfo = wsCache.get(CACHE_KEY.USER) || {}
  const userId = userInfo?.user?.id ?? userInfo?.id ?? userInfo?.user?.username ?? userInfo?.username
  return userId !== undefined && userId !== null && userId !== ''
    ? `${BIG_SCREEN_CONFIG_STORAGE_KEY}_${userId}`
    : BIG_SCREEN_CONFIG_STORAGE_KEY
}

/**
 * 读取并校验浏览器中保存的大屏配置。
 *
 * 优先读取当前账号专属的缓存配置；读取时会合并最新默认值，并兼容旧版本的字段类型。
 * 缓存损坏或解析失败时不会阻断页面渲染，而是回退到当前账号的默认配置。
 */
export const getBigScreenConfig = (): BigScreenDataConfig => {
  if (typeof window === 'undefined') return getDefaultBigScreenConfig()
  try {
    const storageKey = getBigScreenConfigStorageKey()
    const raw = window.localStorage.getItem(storageKey)
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

/** 将完整的大屏配置持久化到当前浏览器（与当前登录账号绑定）。 */
export const saveBigScreenConfig = (config: BigScreenDataConfig) => {
  if (typeof window === 'undefined') return
  const storageKey = getBigScreenConfigStorageKey()
  window.localStorage.setItem(storageKey, JSON.stringify(config))
}

/**
 * 将级联地区名称格式化为面向用户的简洁文本。
 *
 * 会移除“市辖区”等无业务含义的中间节点，并合并直辖市树中可能出现的重复名称。
 */
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

/** 生成大屏头部展示的“地区｜时间｜数据范围”摘要。 */
export const formatBigScreenDataSummary = (config = getBigScreenConfig()) => {
  const [startDate, endDate] = config.timeRange || []
  const regionLabel = formatBigScreenRegionLabel(config.regionLabel)
  const timeLabel = startDate && endDate ? `${startDate} 至 ${endDate}` : '默认时间'
  const scopeLabel = getBigScreenDataScopeLabel(config.dataScope)
  return `${regionLabel}｜${timeLabel}｜${scopeLabel}`
}

/**
 * 将页面配置转换为大屏统计接口的公共查询参数。
 *
 * 此方法只处理时间和机构数据范围；具体地区字段由需要地区过滤的业务接口按需追加。
 */
export const getBigScreenQueryParams = () => {
  const config = getBigScreenConfig()
  return {
    startDate: config.timeRange?.[0] || undefined,
    endDate: config.timeRange?.[1] || undefined,
    dataScope: getBigScreenApiDataScope(config.dataScope),
    queryDeptScope: getBigScreenQueryDeptScope(config.dataScope)
  }
}

/**
 * 生成区域风险排行接口参数。
 *
 * 页面已选择地区时使用页面配置；未选择时回落到当前账号所属机构地区，确保普通
 * 账号不会查询到管辖范围之外的数据。
 */
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

/**
 * 广播大屏刷新事件。
 *
 * @param reason 刷新来源：保存配置、定时器或菜单切换。事件中附带最新配置和时间戳，
 * 各面板可独立订阅而不互相引用。
 */
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

/**
 * 订阅大屏刷新事件。
 *
 * @returns 取消订阅函数，组件卸载时必须调用，防止重复请求和事件监听泄漏。
 */
export const subscribeBigScreenRefresh = (callback: () => void) => {
  if (typeof window === 'undefined') return () => undefined
  const handler = () => callback()
  window.addEventListener(BIG_SCREEN_REFRESH_EVENT, handler)
  return () => window.removeEventListener(BIG_SCREEN_REFRESH_EVENT, handler)
}

/**
 * 获取地图当前应采用的行政级别。
 *
 * 机构缓存优先于页面选择，兼容 `areaLevel` 与历史字段 `areaType`；
 * 当为全国维度（0）时，大屏地图接口统一返回 '1'（省级汇总数据）。
 */
export const getCachedAreaLevel = () => {
  const { wsCache } = useCache()
  const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {}
  const config = getBigScreenConfig()
  
  const rawLevel = userDept.areaLevel ?? userDept.areaType ?? config.areaType
  if (rawLevel !== undefined && rawLevel !== null && rawLevel !== '') {
    const num = Number(rawLevel)
    if (num === 0) {
      // 全国维度时，接口聚合省级数据，areaLevel 传 '1'
      return '1'
    }
    return String(rawLevel)
  }
  return '1'
}

/** 判断地区名称是否属于四个直辖市之一。 */
export const isMunicipality = (name?: string) => {
  if (!name) return false
  const n = String(name).trim()
  return n.includes('北京') || n.includes('上海') || n.includes('天津') || n.includes('重庆')
}
