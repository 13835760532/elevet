type CacheEntry<T> = {
  expireAt: number
  value?: T
  pending?: Promise<T>
  hasValue: boolean
}

const DEFAULT_CACHE_TTL = 30 * 1000
const MAX_CACHE_SIZE = 80
const requestCache = new Map<string, CacheEntry<unknown>>()

// 对对象键排序，保证属性插入顺序不同但语义相同的查询能够命中同一缓存键。
const stableSerialize = (value: unknown): string => {
  if (value === undefined) return ''
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((item) => stableSerialize(item)).join(',')}]`

  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize((value as Record<string, unknown>)[key])}`)
    .join(',')}}`
}

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

export const clearBigScreenRequestCache = () => {
  requestCache.clear()
}

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

export const pruneBigScreenRequestCache = (now = Date.now()) => {
  requestCache.forEach((entry, key) => {
    if (!entry.pending && entry.expireAt <= now) {
      requestCache.delete(key)
    }
  })
}
