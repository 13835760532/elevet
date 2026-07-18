import { useCache, CACHE_KEY } from '@/hooks/web/useCache'
import { TokenType } from '@/api/login/types'
import { decrypt, encrypt } from '@/utils/jsencrypt'

const { wsCache } = useCache()

const AccessTokenKey = 'ACCESS_TOKEN'
const RefreshTokenKey = 'REFRESH_TOKEN'

/**
 * 读取访问令牌。兼容历史代码曾使用的同名字符串 key，避免升级后把仍有效的会话误判为未登录。
 * 令牌本身不在此处校验时效，过期处理由请求拦截器和登录守卫统一负责。
 */
export const getAccessToken = () => {
  // 此处与TokenKey相同，此写法解决初始化时Cookies中不存在TokenKey报错
  const accessToken = wsCache.get(AccessTokenKey)
  return accessToken ? accessToken : wsCache.get('ACCESS_TOKEN')
}

/** 读取刷新令牌，仅供请求层在 accessToken 失效时换取新的会话令牌。 */
export const getRefreshToken = () => {
  return wsCache.get(RefreshTokenKey)
}

/**
 * 同时覆盖 accessToken 与 refreshToken，确保二者来自同一次登录或刷新响应。
 * 不在这里清理用户资料缓存，调用方需在账号切换时先完成完整的会话清理。
 */
export const setToken = (token: TokenType) => {
  wsCache.set(RefreshTokenKey, token.refreshToken)
  wsCache.set(AccessTokenKey, token.accessToken)
}

/** 只删除认证令牌；用户、部门和动态菜单缓存由 deleteUserCache 统一处理。 */
export const removeToken = () => {
  wsCache.delete(AccessTokenKey)
  wsCache.delete(RefreshTokenKey)
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return 'Bearer ' + token
}
// ========== 账号相关 ==========

export type LoginFormType = {
  tenantName: string
  username: string
  password: string
  rememberMe: boolean
}

/**
 * 读取“记住我”表单并解密密码字段。
 * 密码只用于回填登录界面，不能作为已登录凭据；缓存过期或不存在时返回 undefined。
 */
export const getLoginForm = () => {
  const loginForm: LoginFormType = wsCache.get(CACHE_KEY.LoginForm)
  if (loginForm) {
    loginForm.password = decrypt(loginForm.password) as string
  }
  return loginForm
}

/** 将登录表单密码加密后保存 30 天，避免明文直接落入浏览器存储。 */
export const setLoginForm = (loginForm: LoginFormType) => {
  loginForm.password = encrypt(loginForm.password) as string
  wsCache.set(CACHE_KEY.LoginForm, loginForm, { exp: 30 * 24 * 60 * 60 })
}

export const removeLoginForm = () => {
  wsCache.delete(CACHE_KEY.LoginForm)
}

// ========== 租户相关 ==========

export const getTenantId = () => {
  return wsCache.get(CACHE_KEY.TenantId)
}

export const setTenantId = (tenantId: number) => {
  wsCache.set(CACHE_KEY.TenantId, tenantId)
}

export const getVisitTenantId = () => {
  return wsCache.get(CACHE_KEY.VisitTenantId)
}

export const setVisitTenantId = (visitTenantId: number) => {
  wsCache.set(CACHE_KEY.VisitTenantId, visitTenantId)
}
