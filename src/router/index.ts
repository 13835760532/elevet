import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import remainingRouter from './modules/remaining'

const staticRouteNames = new Set<string>()

const collectStaticRouteNames = (routes: AppRouteRecordRaw[]) => {
  routes.forEach((route) => {
    if (route.name) {
      staticRouteNames.add(String(route.name))
    }
    if (route.children?.length) {
      collectStaticRouteNames(route.children)
    }
  })
}

// remainingRouter 中的页面不依赖后端菜单权限，重置动态路由时必须始终保留。
collectStaticRouteNames(remainingRouter)

// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(import.meta.env.VITE_BASE_PATH),
  strict: true,
  routes: remainingRouter as RouteRecordRaw[],
  scrollBehavior: () => {
    // 新开标签时、返回标签时，滚动条回到顶部，否则会保留上次标签的滚动位置。
    const scrollbarWrap = document.querySelector('.v-layout-content-scrollbar .el-scrollbar__wrap')
    if (scrollbarWrap) {
      // scrollbarWrap.scrollTo({ left: 0, top: 0, behavior: 'auto' })
      scrollbarWrap.scrollTop = 0
    }
    return { left: 0, top: 0 }
  }
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !staticRouteNames.has(String(name))) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
