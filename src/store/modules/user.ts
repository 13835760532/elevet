import { store } from '@/store'
import { defineStore } from 'pinia'
import { getAccessToken, removeToken } from '@/utils/auth'
import { CACHE_KEY, useCache, deleteUserCache } from '@/hooks/web/useCache'
import { getInfo, loginOut } from '@/api/login'
import * as DeptApi from '@/api/system/dept'

const { wsCache } = useCache()

interface UserVO {
  id: number
  avatar: string
  nickname: string
  deptId: number
  username?: string
  email?: string
  deptName?: string
}

interface UserInfoVO {
  // USER 缓存
  permissions: Set<string>
  roles: string[]
  isSetUser: boolean
  user: UserVO
  deptInfo: DeptApi.DeptVO | null
}

const isValidUserInfo = (userInfo: any) => {
  return userInfo && typeof userInfo === 'object' && userInfo.user
}

const isCachedDeptMatched = (deptInfo: any, deptId?: number) => {
  if (!deptInfo) return false
  if (!deptId) return true
  return String(deptInfo.id) === String(deptId)
}

export const useUserStore = defineStore('admin-user', {
  state: (): UserInfoVO => ({
    permissions: new Set<string>(),
    roles: [],
    isSetUser: false,
    user: {
      id: 0,
      avatar: '',
      nickname: '',
      deptId: 0
    },
    deptInfo: null
  }),
  getters: {
    getPermissions(): Set<string> {
      return this.permissions
    },
    getRoles(): string[] {
      return this.roles
    },
    getIsSetUser(): boolean {
      return this.isSetUser
    },
    getUser(): UserVO {
      return this.user
    },
    getDeptInfo(): DeptApi.DeptVO | null {
      return this.deptInfo
    }
  },
  actions: {
    applyUserInfo(userInfo: any) {
      this.permissions = new Set(userInfo.permissions || []) // 兜底为 [] https://t.zsxq.com/xCJew
      this.roles = userInfo.roles || []
      this.user = userInfo.user
      this.isSetUser = true
      wsCache.set(CACHE_KEY.USER, userInfo)
      wsCache.set(CACHE_KEY.ROLE_ROUTERS, userInfo.menus || [])
    },
    hydrateUserInfoFromCache() {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      if (!isValidUserInfo(userInfo)) return false
      this.applyUserInfo(userInfo)

      const cachedDeptInfo = wsCache.get(CACHE_KEY.USER_DEPT)
      this.deptInfo = isCachedDeptMatched(cachedDeptInfo, this.user.deptId)
        ? cachedDeptInfo
        : null
      return true
    },
    async setUserInfoAction() {
      if (!getAccessToken()) {
        this.resetState()
        return null
      }
      // 当前会话必须以当前 token 对应的接口结果为准，不能在失败时复用其他账号的缓存。
      const userInfo = await getInfo()

      if (!isValidUserInfo(userInfo)) {
        removeToken()
        deleteUserCache()
        this.resetState()
        throw new Error('登录信息已失效，请重新登录')
      }

      this.applyUserInfo(userInfo)
      await this.setUserDeptInfoAction(this.user.deptId)
    },
    async setUserDeptInfoAction(deptId?: number) {
      if (!deptId) {
        this.deptInfo = null
        wsCache.delete(CACHE_KEY.USER_DEPT)
        return
      }
      try {
        const deptInfo = await DeptApi.getDept(deptId)
        this.deptInfo = deptInfo
        this.user = {
          ...this.user,
          deptName: deptInfo?.name || this.user.deptName
        }
        const userInfo = wsCache.get(CACHE_KEY.USER)
        if (userInfo?.user) {
          userInfo.user = this.user
          wsCache.set(CACHE_KEY.USER, userInfo)
        }
        wsCache.set(CACHE_KEY.USER_DEPT, deptInfo)
      } catch (error) {
        const cachedDeptInfo = wsCache.get(CACHE_KEY.USER_DEPT)
        this.deptInfo = cachedDeptInfo?.id === deptId ? cachedDeptInfo : null
        console.error('获取当前用户部门信息失败', error)
      }
    },
    async setUserAvatarAction(avatar: string) {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      // NOTE: 是否需要像`setUserInfoAction`一样判断`userInfo != null`
      this.user.avatar = avatar
      userInfo.user.avatar = avatar
      wsCache.set(CACHE_KEY.USER, userInfo)
    },
    async setUserNicknameAction(nickname: string) {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      // NOTE: 是否需要像`setUserInfoAction`一样判断`userInfo != null`
      this.user.nickname = nickname
      userInfo.user.nickname = nickname
      wsCache.set(CACHE_KEY.USER, userInfo)
    },
    async loginOut() {
      try {
        await loginOut()
      } finally {
        // 服务端登出失败也必须清理本地会话，避免回到登录页后继续使用旧 token。
        removeToken()
        deleteUserCache()
        this.resetState()
      }
    },
    resetState() {
      this.permissions = new Set<string>()
      this.roles = []
      this.isSetUser = false
      this.user = {
        id: 0,
        avatar: '',
        nickname: '',
        deptId: 0
      }
      this.deptInfo = null
    }
  }
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
