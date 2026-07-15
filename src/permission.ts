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
let dynamicRoutesReady = false
let dynamicRoutesPromise: Promise<void> | null = null
const dynamicRouteReadyMark = '404Page'

const isBigScreenRoute = (path: string) => path.startsWith('/big-screen')

const hasBigScreenUserCache = () => {
  const userInfo = wsCache.get(CACHE_KEY.USER)
  return !!userInfo?.user
}

export const resetDynamicRouteState = () => {
  dynamicRoutesReady = false
  dynamicRoutesPromise = null
}

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

// 路由加载前
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
          const redirectPath = from.query.redirect || to.path
          // 修复跳转时不带参数的问题
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

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
