import type { RouteLocationNormalized, Router, RouteRecordNormalized } from 'vue-router'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { isUrl } from '@/utils/is'
import { cloneDeep, omit } from 'lodash-es'
import qs from 'qs'

// Vite 在构建期生成页面模块表，后端只需下发 component 路径即可匹配真实组件。
const modules = import.meta.glob('../views/**/*.{vue,tsx}')
/**
 * 根据后端下发的 component 路径匹配 Vite 构建期收集的页面模块，并返回异步组件。
 * @param componentPath 例：`/bpm/oa/leave/detail`。无法匹配时返回 undefined，由调用方保留菜单并记录配置错误。
 */
export const registerComponent = (componentPath: string) => {
  for (const item in modules) {
    if (item.includes(componentPath)) {
      // 使用异步组件的方式来动态加载组件
      // @ts-ignore
      return defineAsyncComponent(modules[item])
    }
  }
}
/* Layout */
export const Layout = () => import('@/layout/Layout.vue')

/**
 * 为多级后端菜单提供不渲染实际页面的父路由组件。
 * 该占位层使深层子菜单仍可被 Vue Router 识别，同时不会额外引入 Layout 嵌套。
 */
export const getParentLayout = () => {
  return () =>
    new Promise((resolve) => {
      resolve({
        name: 'ParentLayout'
      })
    })
}

/**
 * 按 meta.rank 升序排列菜单。
 * rank 为 0 仅允许首页使用；其他页面误设为 0 只告警不改写，保留后端配置排查依据。
 */
export const ascending = (arr: any[]) => {
  arr.forEach((v) => {
    if (v?.meta?.rank === null) v.meta.rank = undefined
    if (v?.meta?.rank === 0) {
      if (v.name !== 'home' && v.path !== '/') {
        console.warn('rank only the home page can be 0')
      }
    }
  })
  return arr.sort((a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
    return a?.meta?.rank - b?.meta?.rank
  })
}

/**
 * 将 Vue Router 的响应式 Route 对象转换为可缓存、可传递的精简快照。
 * matched 中仅保留页面恢复需要的 meta/name/path，避免把组件实例和循环引用写入标签页缓存。
 */
export const getRawRoute = (route: RouteLocationNormalized): RouteLocationNormalized => {
  if (!route) return route
  const { matched, ...opt } = route
  return {
    ...opt,
    matched: (matched
      ? matched.map((item) => ({
          meta: item.meta,
          name: item.name,
          path: item.path
        }))
      : undefined) as RouteRecordNormalized[]
  }
}

/**
 * 把后端菜单协议转换成 Vue Router 路由。
 * 需要同时兼容目录、顶级叶子菜单、外链和历史 component 路径，因此组件匹配失败时
 * 只记录错误并保留菜单结构，避免单条错误配置阻断整套路由初始化。
 */
export const generateRoute = (routes: AppCustomRouteRecordRaw[]): AppRouteRecordRaw[] => {
  const res: AppRouteRecordRaw[] = []
  const modulesRoutesKeys = Object.keys(modules)
  for (const route of routes) {
    // 1. 生成 meta 菜单元数据
    const meta = {
      title: route.name,
      icon: route.icon,
      hidden: !route.visible,
      noCache: !route.keepAlive,
      alwaysShow:
        route.children &&
        route.children.length > 0 &&
        (route.alwaysShow !== undefined ? route.alwaysShow : true)
    } as any
    // 特殊逻辑：如果后端配置的 MenuDO.component 包含 ?，则表示需要传递参数
    // 此时，我们需要解析参数，并且将参数放到 meta.query 中
    // 这样，后续在 Vue 文件中，可以通过 const { currentRoute } = useRouter() 中，通过 meta.query 获取到参数
    if (route.component && route.component.indexOf('?') > -1) {
      const query = route.component.split('?')[1]
      route.component = route.component.split('?')[0]
      meta.query = qs.parse(query)
    }

    // 2. 生成 data（AppRouteRecordRaw）
    // 路由地址转首字母大写驼峰，作为路由名称，适配keepAlive
    let data: AppRouteRecordRaw = {
      path:
        route.path.indexOf('?') > -1 && !isUrl(route.path) ? route.path.split('?')[0] : route.path, // 注意，需要排除 http 这种 url，避免它带 ? 参数被截取掉
      name:
        route.componentName && route.componentName.length > 0
          ? route.componentName
          : toCamelCase(route.path, true),
      redirect: route.redirect,
      meta: meta
    }
    // Vue Router 的顶级业务页仍需挂在 Layout 下，因此包装成一个空路径子路由。
    if (!route.children && route.parentId == 0 && route.component) {
      data.component = Layout
      data.meta = {
        hidden: meta.hidden
      }
      data.name = toCamelCase(route.path, true) + 'Parent'
      data.redirect = ''
      meta.alwaysShow = true
      const childrenData: AppRouteRecordRaw = {
        path: '',
        name:
          route.componentName && route.componentName.length > 0
            ? route.componentName
            : toCamelCase(route.path, true),
        redirect: route.redirect,
        meta: meta
      }
      const componentStr = route?.component || route?.path
      let index = modulesRoutesKeys.findIndex(
        (ev) => 
          ev === `../views/${componentStr}.vue` || 
          ev === `../views/${componentStr}/index.vue` || 
          ev === `../views/${componentStr}.tsx` || 
          ev === `../views/${componentStr}/index.tsx`
      )
      if (index === -1) {
        index = modulesRoutesKeys.findIndex((ev) => ev.toLowerCase().includes(componentStr.toLowerCase()))
      }
      if (index !== -1) {
        childrenData.component = modules[modulesRoutesKeys[index]]
      } else {
        console.error(`[RouterHelper] Cannot find component for route: ${route.name}, path: ${route.path}, componentStr: ${componentStr}`)
      }
      data.children = [childrenData]
    } else {
      // 目录
      if (route.children?.length) {
        data.component = Layout
        data.redirect = getRedirect(route.path, route.children)
        // 外链
      } else if (isUrl(route.path)) {
        data = {
          path: '/external-link',
          component: Layout,
          meta: {
            name: route.name
          },
          children: [data]
        } as AppRouteRecordRaw
        // 菜单
      } else {
        // 对后端传component组件路径和不传做兼容（如果后端传component组件路径，那么path可以随便写，如果不传，component组件路径会根path保持一致）
        const componentStr = route?.component || route?.path
        let index = modulesRoutesKeys.findIndex(
          (ev) => 
            ev === `../views/${componentStr}.vue` || 
            ev === `../views/${componentStr}/index.vue` || 
            ev === `../views/${componentStr}.tsx` || 
            ev === `../views/${componentStr}/index.tsx`
        )
        if (index === -1) {
          index = modulesRoutesKeys.findIndex((ev) => ev.toLowerCase().includes(componentStr.toLowerCase()))
        }
        if (index !== -1) {
          data.component = modules[modulesRoutesKeys[index]]
        } else {
          console.error(`[RouterHelper] Cannot find component for menu: ${route.name}, path: ${route.path}, componentStr: ${componentStr}`)
        }
      }
      if (route.children) {
        data.children = generateRoute(route.children)
      }
    }
    res.push(data as AppRouteRecordRaw)
  }
  return res
}
/**
 * 递归计算目录菜单默认跳转到的第一个叶子节点。
 * 后端目录本身不一定配置页面组件，必须生成可访问的子页面地址作为 redirect。
 */
export const getRedirect = (parentPath: string, children: AppCustomRouteRecordRaw[]) => {
  if (!children || children.length == 0) {
    return parentPath
  }
  const path = generateRoutePath(parentPath, children[0].path)
  // 递归子节点
  if (children[0].children) return getRedirect(path, children[0].children)
}
const generateRoutePath = (parentPath: string, path: string) => {
  if (parentPath.endsWith('/')) {
    parentPath = parentPath.slice(0, -1) // 移除默认的 /
  }
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  return parentPath + path
}
/**
 * 拼接父子路由路径，同时保留外链原样返回并压缩重复斜杠。
 * 空子路径代表目录默认页，直接返回父路径以避免生成无效的尾随分隔符。
 */
export const pathResolve = (parentPath: string, path: string) => {
  if (isUrl(path)) return path
  if (!path) return parentPath // 修复 path 为空时返回 parentPath，避免拼接出错 https://t.zsxq.com/QVr6b
  const childPath = path.startsWith('/') ? path : `/${path}`
  return `${parentPath}${childPath}`.replace(/\/+/g, '/')
}

/**
 * 标签页缓存只支持两级路由，因此将更深的后端菜单扁平提升到同一个路由模块下。
 * 输入会深拷贝，避免权限 store 的原始动态路由在标签页转换后被破坏。
 */
export const flatMultiLevelRoutes = (routes: AppRouteRecordRaw[]) => {
  const modules: AppRouteRecordRaw[] = cloneDeep(routes)
  for (let index = 0; index < modules.length; index++) {
    const route = modules[index]
    if (!isMultipleRoute(route)) {
      continue
    }
    promoteRouteLevel(route)
  }
  return modules
}

// 层级是否大于2
const isMultipleRoute = (route: AppRouteRecordRaw) => {
  if (!route || !Reflect.has(route, 'children') || !route.children?.length) {
    return false
  }

  const children = route.children

  let flag = false
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    if (child.children?.length) {
      flag = true
      break
    }
  }
  return flag
}

// 生成二级路由
const promoteRouteLevel = (route: AppRouteRecordRaw) => {
  let router: Router | null = createRouter({
    routes: [route as RouteRecordRaw],
    history: createWebHashHistory()
  })

  const routes = router.getRoutes()
  addToChildren(routes, route.children || [], route)
  router = null

  route.children = route.children?.map((item) => omit(item, 'children'))
}

// 添加所有子菜单
const addToChildren = (
  routes: RouteRecordNormalized[],
  children: AppRouteRecordRaw[],
  routeModule: AppRouteRecordRaw
) => {
  for (let index = 0; index < children.length; index++) {
    const child = children[index]
    const route = routes.find((item) => item.name === child.name)
    if (!route) {
      continue
    }
    routeModule.children = routeModule.children || []
    if (!routeModule.children.find((item) => item.name === route.name)) {
      routeModule.children?.push(route as unknown as AppRouteRecordRaw)
    }
    if (child.children?.length) {
      addToChildren(routes, child.children, routeModule)
    }
  }
}
const toCamelCase = (str: string, upperCaseFirst: boolean) => {
  str = (str || '')
    .replace(/-(.)/g, function (group1: string) {
      return group1.toUpperCase()
    })
    .replaceAll('-', '')

  if (upperCaseFirst && str) {
    str = str.charAt(0).toUpperCase() + str.slice(1)
  }

  return str
}
