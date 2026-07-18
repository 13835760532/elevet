import router, { resetRouter } from './router'
import type { RouteRecordRaw } from 'vue-router'
import { isRelogin } from '@/config/axios/service'
import { getAccessToken, removeToken } from '@/utils/auth'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { useDictStoreWithOut } from '@/store/modules/dict'
import { useUserStoreWithOut } from '@/store/modules/user'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { CACHE_KEY, deleteUserCache, useCache } from '@/hooks/web/useCache'
import { ElMessage } from 'element-plus'

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()
const { wsCache } = useCache()
// 多个导航可能同时触发路由初始化。共享 Promise 用于合并请求，ready 标记用于快速返回。
// 该状态只描述当前浏览器会话中的路由注册情况，不写入缓存；账号切换或退出后必须显式重置。
let dynamicRoutesReady = false
let dynamicRoutesPromise: Promise<void> | null = null
const dynamicRouteReadyMark = '404Page'

/** 判断目标地址是否属于允许优先使用缓存渲染的监管大屏路由。 */
const isBigScreenRoute = (path: string) => path.startsWith('/big-screen')

/** 检查大屏首屏所需的用户缓存是否完整。 */
const hasBigScreenUserCache = () => {
  const userInfo = wsCache.get(CACHE_KEY.USER)
  return !!userInfo?.user
}

/** 重置动态路由初始化状态，登录、退出或切换账号时调用。 */
export const resetDynamicRouteState = () => {
  dynamicRoutesReady = false
  dynamicRoutesPromise = null
}

/**
 * 根据当前账号菜单生成并注册动态路由。
 *
 * 多个导航同时触发时共享同一个 Promise，避免重复请求菜单和重复注册路由；末尾
 * `404Page` 作为整组路由已经完成注册的标记。
 */
export const addDynamicRoutes = async () => {
  // 404Page 是动态路由集合的末尾标记；标记存在说明整组路由已经注册完成。
  if (dynamicRoutesReady && router.hasRoute(dynamicRouteReadyMark)) return
  dynamicRoutesReady = false
  if (!dynamicRoutesPromise) {
    dynamicRoutesPromise = (async () => {
      const permissionStore = usePermissionStoreWithOut()
      await permissionStore.generateRoutes()
      permissionStore.getAddRouters.forEach((route) => {
        const routeName = route.name
        if (!routeName || !router.hasRoute(routeName)) {
          router.addRoute(route as unknown as RouteRecordRaw)
        }
      })
      dynamicRoutesReady = true
    })().finally(() => {
      dynamicRoutesPromise = null
    })
  }
  await dynamicRoutesPromise
}

/** 将非首屏关键任务推迟到首次绘制或浏览器空闲阶段执行。 */
const runAfterFirstPaint = (callback: () => void) => {
  if (typeof window === 'undefined') {
    callback()
    return
  }
  window.setTimeout(() => {
    // 先结束当前同步任务；浏览器支持 requestIdleCallback 时再等待空闲时段执行。
    const requestIdle = (window as any).requestIdleCallback
    if (typeof requestIdle === 'function') {
      requestIdle(callback, { timeout: 3000 })
      return
    }
    callback()
  }, 0)
}

/**
 * 大屏使用缓存快速恢复后，在后台重新获取当前 Token 对应的用户信息。
 * 缓存只负责缩短首屏时间，接口结果仍是权限和机构信息的最终来源。
 */
const refreshBigScreenUserInBackground = (userStore: ReturnType<typeof useUserStoreWithOut>) => {
  // 缓存只负责快速恢复首屏，后台刷新仍是后续权限和用户信息的最终来源。
  runAfterFirstPaint(() => {
    void userStore
      .setUserInfoAction()
      .catch((error) => {
        console.error('后台刷新用户信息失败', error)
      })
  })
}

/**
 * 拆分重定向地址中的路径和查询参数。
 *
 * 登录拦截会把原始 `to.fullPath` 放入 redirect；完成动态路由注册后需要还原该地址。
 * 这里不使用 Router 解析，避免尚未注册目标动态路由时解析失败，同时保留所有查询参数。
 */
const parseURL = (
  url: string | null | undefined
): { basePath: string; paramsObject: { [key: string]: string } } => {
  // 如果输入为 null 或 undefined，返回空字符串和空对象
  if (url == null) {
    return { basePath: '', paramsObject: {} }
  }

  // 找到问号 (?) 的位置，它之前是基础路径，之后是查询参数
  const questionMarkIndex = url.indexOf('?')
  let basePath = url
  const paramsObject: { [key: string]: string } = {}

  // 如果找到了问号，说明有查询参数
  if (questionMarkIndex !== -1) {
    // 获取 basePath
    basePath = url.substring(0, questionMarkIndex)

    // 从 URL 中获取查询字符串部分
    const queryString = url.substring(questionMarkIndex + 1)

    // 使用 URLSearchParams 遍历参数
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      // 封装进 paramsObject 对象
      paramsObject[key] = value
    })
  }

  // 返回 basePath 和 paramsObject
  return { basePath, paramsObject }
}

// 路由不重定向白名单
const whiteList = [
  '/login',
  '/social-login',
  '/auth-redirect',
  '/bind',
  '/register',
  '/forgotPassword',
  '/reset-password',
  '/oauthLogin/gitee'
]

/**
 * 全局导航守卫的会话恢复顺序：
 * 1. 无令牌时仅放行白名单，其余地址带 redirect 回登录页；
 * 2. 有令牌但用户状态未初始化时，先拉取用户、角色、权限和部门，再注册动态路由；
 * 3. 已有用户状态但动态路由尚未注册时，补注册后 replace 当前地址，避免首次进入命中 404；
 * 4. 大屏允许用同账号缓存先完成首屏渲染，后台刷新仍以接口结果为准。
 */
router.beforeEach(async (to, from, next) => {
  start()
  loadStart()
  if (getAccessToken()) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      const dictStore = useDictStoreWithOut()
      const userStore = useUserStoreWithOut()
      // 异步加载字典
      // 另外，间接 issue：https://gitee.com/yudaocode/yudao-ui-admin-vue3/issues/ID9FLI
      if (!dictStore.getIsSetDict) {
        if (isBigScreenRoute(to.path)) {
          runAfterFirstPaint(() => {
            void dictStore.setDictMap()
          })
        } else {
          dictStore.setDictMap().then()
        }
      }
      if (!userStore.getIsSetUser) {
        if (isBigScreenRoute(to.path) && hasBigScreenUserCache()) {
          // 大屏允许先使用缓存进入页面，避免用户信息接口阻塞全屏可视化首屏。
          const hydrated = userStore.hydrateUserInfoFromCache()
          if (hydrated) {
            next()
            refreshBigScreenUserInBackground(userStore)
            return
          }
        }
        isRelogin.show = true
        try {
          await userStore.setUserInfoAction()
          // 菜单由后端按角色过滤，用户信息完成后才能生成本次会话的动态路由。
          await addDynamicRoutes()
          // 优先消费登录页携带的 redirect；没有时使用当前目标地址。
          // decode + parseURL 用于恢复业务页面原有的 query，避免登录后筛选条件丢失。
          const redirectPath = from.query.redirect || to.path
          const redirect = decodeURIComponent(redirectPath as string)
          const { paramsObject: query } = parseURL(redirect)
          const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect, query }
          next(nextData)
        } catch (error) {
          resetDynamicRouteState()
          resetRouter()
          deleteUserCache()
          removeToken()
          userStore.resetState()
          usePermissionStoreWithOut().$reset()
          ElMessage.error(error instanceof Error ? error.message : '登录状态已失效，请重新登录')
          next(`/login?redirect=${to.fullPath}`)
        } finally {
          isRelogin.show = false
        }
      } else if (!dynamicRoutesReady && !isBigScreenRoute(to.path)) {
        await addDynamicRoutes()
        next({ ...to, replace: true })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
    }
  }
})

/** 无论导航来自菜单、浏览器历史还是重定向，均在此处收尾全局加载状态并同步页面标题。 */
router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
