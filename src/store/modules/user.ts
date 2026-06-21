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
    async setUserInfoAction() {
      if (!getAccessToken()) {
        this.resetState()
        return null
      }
      let userInfo = wsCache.get(CACHE_KEY.USER)
      if (!userInfo) {
        userInfo = await getInfo()
      } else {
        // 特殊：在有缓存的情况下，进行加载。但是即使加载失败，也不影响后续的操作，保证可以进入系统
        try {
          userInfo = await getInfo()
        } catch (error) {}
      }

      if (!isValidUserInfo(userInfo)) {
        removeToken()
        deleteUserCache()
        this.resetState()
        throw new Error('登录信息已失效，请重新登录')
      }

      this.permissions = new Set(userInfo.permissions || []) // 兜底为 [] https://t.zsxq.com/xCJew
      this.roles = userInfo.roles || []
      this.user = userInfo.user
      this.isSetUser = true
      wsCache.set(CACHE_KEY.USER, userInfo)
      wsCache.set(CACHE_KEY.ROLE_ROUTERS, userInfo.menus || [])
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
      await loginOut()
      removeToken()
      deleteUserCache() // 删除用户缓存
      this.resetState()
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
