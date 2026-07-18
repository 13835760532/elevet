import { defineStore } from 'pinia'
import { store } from '@/store'
import { cloneDeep } from 'lodash-es'
import remainingRouter from '@/router/modules/remaining'
import { flatMultiLevelRoutes, generateRoute } from '@/utils/routerHelper'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  menuTabRouters: AppRouteRecordRaw[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    menuTabRouters: []
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return flatMultiLevelRoutes(cloneDeep(this.addRouters))
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    }
  },
  actions: {
    /**
     * 把当前账号缓存中的后端菜单转换为前端可注册路由。
     *
     * 用户信息请求已负责刷新 ROLE_ROUTERS，本方法不重复请求接口；末尾追加的 404Page 是
     * 权限守卫判断“整组动态路由已注册”的完成标记，同时拦截没有权限或配置错误的地址。
     */
    async generateRoutes(): Promise<unknown> {
      return new Promise<void>(async (resolve) => {
        // 登录阶段已经把后端过滤后的菜单写入缓存；此处只负责转换为前端路由结构。
        let res: AppCustomRouteRecordRaw[] = []
        const roleRouters = wsCache.get(CACHE_KEY.ROLE_ROUTERS)
        if (roleRouters) {
          res = roleRouters as AppCustomRouteRecordRaw[]
        }
        const routerMap: AppRouteRecordRaw[] = generateRoute(res)
        // 404Page 同时是 permission.ts 判断动态路由是否完整注册的末尾标记。
        this.addRouters = routerMap.concat([
          {
            path: '/:path(.*)*',
            // redirect: '/404',
            component: () => import('@/views/Error/404.vue'),
            name: '404Page',
            meta: {
              hidden: true,
              breadcrumb: false
            }
          }
        ])
        // remainingRouter 提供登录、错误页等静态路由，routerMap 负责当前用户的业务菜单。
        this.routers = cloneDeep(remainingRouter).concat(routerMap)
        resolve()
      })
    },
    /** 为 cutMenu 布局保存当前顶级菜单对应的子路由集合，不写入持久化缓存。 */
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    }
  },
  persist: false
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
