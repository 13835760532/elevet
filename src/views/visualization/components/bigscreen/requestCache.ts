type CacheEntry<T> = {
  expireAt: number
  value?: T
  pending?: Promise<T>
  hasValue: boolean
}

const DEFAULT_CACHE_TTL = 30 * 1000
const MAX_CACHE_SIZE = 80
const requestCache = new Map<string, CacheEntry<unknown>>()

/**
 * 稳定序列化查询参数。
 *
 * 对对象键排序，保证属性插入顺序不同但语义相同的查询能够命中同一缓存键；数组
 * 保留原始顺序，因为数组顺序可能具有业务含义。
 */
const stableSerialize = (value: unknown): string => {
  if (value === undefined) return ''
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(',')}]`

  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`)
    .join(',')}}`
}

/**
 * 执行带短期缓存和并发合并的大屏请求。
 *
 * @param scope 业务域名称，用于隔离不同接口的缓存。
 * @param params 参与缓存键计算的查询参数。
 * @param request 真正发起网络请求的函数，仅在缓存未命中时调用。
 * @param ttl 缓存有效期，默认 30 秒。
 * @returns 接口结果；同一时刻的相同请求会共享一个 Promise。
 */
export const cachedBigScreenRequest = <T>(
  scope: string,
  params: unknown,
  request: () => Promise<T>,
  ttl = DEFAULT_CACHE_TTL
): Promise<T> => {
  const key = `${scope}:${stableSerialize(params)}`
  const now = Date.now()
  pruneBigScreenRequestCache(now)
  const cached = requestCache.get(key) as CacheEntry<T> | undefined

  if (cached) {
    // pending 也进入缓存，用于合并同一时刻由多个大屏面板发起的相同请求。
    if (cached.pending) return cached.pending
    if (cached.hasValue && cached.expireAt > now) return Promise.resolve(cached.value as T)
    requestCache.delete(key)
  }

  const pending = request()
    .then((value) => {
      requestCache.set(key, {
        expireAt: Date.now() + ttl,
        value,
        hasValue: true
      })
      trimBigScreenRequestCache()
      return value
    })
    .catch((error) => {
      // 失败结果不缓存；只删除当前 Promise 对应的条目，避免误删后来写入的新请求。
      if ((requestCache.get(key) as CacheEntry<T> | undefined)?.pending === pending) {
        requestCache.delete(key)
      }
      throw error
    })

  requestCache.set(key, {
    expireAt: now + ttl,
    pending,
    hasValue: false
  })
  trimBigScreenRequestCache()
  return pending
}

/** 清空所有大屏接口缓存，通常在配置保存或强制刷新时调用。 */
export const clearBigScreenRequestCache = () => {
  requestCache.clear()
}

/**
 * 将缓存容量限制在上限以内。
 *
 * 淘汰顺序遵循 Map 的插入顺序；执行中的 Promise 会被跳过，避免同一请求被重复发起。
 */
const trimBigScreenRequestCache = () => {
  let pendingSkipped = 0
  while (requestCache.size > MAX_CACHE_SIZE && pendingSkipped < requestCache.size) {
    const oldestKey = requestCache.keys().next().value
    if (!oldestKey) return
    const oldestEntry = requestCache.get(oldestKey)
    if (oldestEntry?.pending) {
      // 正在执行的请求不能淘汰，将其移动到 Map 尾部后继续寻找最旧的已完成项。
      requestCache.delete(oldestKey)
      requestCache.set(oldestKey, oldestEntry)
      pendingSkipped += 1
      continue
    }
    requestCache.delete(oldestKey)
    pendingSkipped = 0
  }
}

/** 删除已经过期且不在执行中的缓存项。 */
export const pruneBigScreenRequestCache = (now = Date.now()) => {
  requestCache.forEach((entry, key) => {
    if (!entry.pending && entry.expireAt <= now) {
      requestCache.delete(key)
    }
  })
}
