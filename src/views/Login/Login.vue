<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header Area -->
      <div class="login-header">
        <div class="logo-box">
          <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" />
        </div>
        <div class="title-box">
          <div class="main-title">壹拾智检数智服务平台</div>
          <div class="sub-title">专业版(v2.0-2026)</div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <div class="tab-item" :class="{ active: loginType === 'checking' }" @click="loginType = 'checking'">
          监管检测机构
        </div>
        <div class="tab-item" :class="{ active: loginType === 'business' }" @click="loginType = 'business'">
          生产经营主体
        </div>
      </div>

      <!-- Form Area -->
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" placeholder="请输入手机号" class="custom-input" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" show-password placeholder="请输入密码" class="custom-input">
          </el-input>
        </el-form-item>


        <div class="policy-section">
          <el-checkbox v-model="policyAgreed">
            <span class="policy-text">我已阅读并同意
              <a href="#" class="policy-link">《服务条款》</a>和
              <a href="#" class="policy-link">《隐私政策》</a>
            </span>
          </el-checkbox>
        </div>

        <el-form-item>
          <el-button :loading="loading" type="primary" class="login-submit-btn" @click.prevent="handleLoginPre">
            {{ loading ? '登 录 中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Footer Links -->
      <div class="footer-links">
        <span class="link" v-if="loginType === 'business'" @click="handleRegister">注册</span>
        <router-link to="/forgotPassword" class="link">忘记密码</router-link>
      </div>

      <Verify v-if="captchaEnabled" ref="verify" :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }" mode="pop" @success="handleLogin" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading, ElMessageBox } from 'element-plus'
import * as authUtil from '@/utils/auth'
import { resetRouter } from '@/router'
import { addDynamicRoutes, resetDynamicRouteState } from '@/permission'
import { deleteUserCache } from '@/hooks/web/useCache'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import * as LoginApi from '@/api/login'

const loginType = ref('checking') // checking | business
const policyAgreed = ref(false)
const loading = ref(false)
const captchaEnabled = ref(import.meta.env.VITE_APP_CAPTCHA_ENABLE === 'true')
const tenantEnabled = import.meta.env.VITE_APP_TENANT_ENABLE === 'true'
const isDesktopApp = import.meta.env.VITE_APP_DESKTOP === 'true'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()
const userStore = useUserStore()
const redirect = ref(route?.query?.redirect || '')

const verify = ref()
const captchaType = ref('blockPuzzle')

const loginForm = ref({
  tenantName: import.meta.env.VITE_APP_DEFAULT_LOGIN_TENANT || '',
  username: import.meta.env.VITE_APP_DEFAULT_LOGIN_USERNAME || '',
  password: import.meta.env.VITE_APP_DEFAULT_LOGIN_PASSWORD || '',
  captchaVerification: '',
  rememberMe: false
})

const loginRules = {
  username: [{ required: true, trigger: "blur", message: "请输入手机号" }],
  password: [{ required: true, trigger: "blur", message: "请输入密码" }]
}

/** 根据登录表单中的租户名称解析并写入请求头使用的租户 ID。 */
const getTenantId = async () => {
  if (tenantEnabled) {
    const res = await LoginApi.getTenantIdByName(loginForm.value.tenantName)
    authUtil.setTenantId(res)
  }
}

/** 从本地“记住我”缓存恢复账号、密码和租户，不覆盖环境变量提供的默认值。 */
const getLoginFormCache = () => {
  const cacheForm = authUtil.getLoginForm()
  if (cacheForm) {
    loginForm.value = {
      ...loginForm.value,
      username: cacheForm.username ? cacheForm.username : loginForm.value.username,
      password: cacheForm.password ? cacheForm.password : loginForm.value.password,
      rememberMe: cacheForm.rememberMe,
      tenantName: cacheForm.tenantName ? cacheForm.tenantName : loginForm.value.tenantName
    }
  }
}

/** 根据当前访问域名识别租户，用于多租户独立域名登录场景。 */
const getTenantByWebsite = async () => {
  if (tenantEnabled) {
    const website = location.host
    const res = await LoginApi.getTenantByWebsite(website)
    if (res) {
      loginForm.value.tenantName = res.name
      authUtil.setTenantId(res.id)
    }
  }
}

/**\n * handleRegister：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleRegister = () => {
  if (loginType.value === 'checking') {
    ElMessageBox.alert('请联系壹拾智检机构客服服务010-62133855', '注册提示', {
      confirmButtonText: '确定',
      type: 'info',
      center: true
    })
  } else {
    router.push('/register')
  }
}

/**
 * 执行登录前置校验。
 *
 * 先确认用户已同意服务条款，再校验表单；启用验证码时打开验证码组件，否则直接
 * 进入登录请求，确保两条登录路径共用同一提交逻辑。
 */
function handleLoginPre() {
  if (!policyAgreed.value) {
    ElMessage.warning('请阅读并勾选服务条款和隐私政策')
    return
  }

  proxy.$refs.loginRef.validate(async valid => {
    if (valid) {
      if (captchaEnabled.value) {
        verify.value.show()
      } else {
        await handleLogin({})
      }
    }
  })
}

/**
 * 完成登录、账号状态隔离和首次路由初始化。
 *
 * 新 Token 写入前会清理前一账号的用户、部门、菜单和动态路由缓存；随后重新获取
 * 当前账号信息并注册菜单路由，避免多账号切换时出现菜单串用或首次进入 404。
 */
const handleLogin = async (params) => {
  loading.value = true
  let globalLoading
  try {
    await getTenantId()
    const loginDataForm = { ...loginForm.value }
    loginDataForm.captchaVerification = params.captchaVerification
    loginDataForm.organizationType = loginType.value === 'checking' ? 1 : 2
    const res = await LoginApi.login(loginDataForm)
    if (!res) {
      return
    }
    globalLoading = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })

    if (loginDataForm.rememberMe) {
      authUtil.setLoginForm(loginDataForm)
    } else {
      authUtil.removeLoginForm()
    }

    // 新 token 不能复用前一个账号的用户、部门、菜单或动态路由状态。
    resetDynamicRouteState()
    resetRouter()
    deleteUserCache()
    userStore.resetState()
    permissionStore.$reset()
    authUtil.setToken(res)

    // 首页是静态路由，跳转前先完成用户和菜单初始化，避免布局首次挂载时读取到空菜单。
    try {
      await userStore.setUserInfoAction()
      await addDynamicRoutes()
    } catch (error) {
      resetDynamicRouteState()
      resetRouter()
      authUtil.removeToken()
      deleteUserCache()
      userStore.resetState()
      permissionStore.$reset()
      throw error
    }

    // 桌面安装包只承载登录与 AI 助手，没有来源页时直接进入助手；Web 端仍保持原首页行为。
    if (!redirect.value) {
      redirect.value = isDesktopApp ? '/ai-assistant' : '/'
    }

    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      await router.push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
  } finally {
    globalLoading?.close()
    loading.value = false
  }
}

onMounted(() => {
  getLoginFormCache()
  getTenantByWebsite()
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #D9EFFF 0%, #FFFFFF 100%);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 467px;
  height: auto;
  background: #FFFFFF;
  box-shadow: 0px 3 15px 0px rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding-top: 76px;
  padding-bottom: 83px;
}

.login-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 23px;
  width: 100%;
  justify-content: center;

  .logo-box {
    width: 54px;
    height: 54px;
    margin-right: 9px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .title-box {
    .main-title {
      font-size: 30px;
      line-height: 34px;
      color: #00B3ED;
      margin: 0;
      font-weight: 600;
      letter-spacing: 2px;
    }

    .sub-title {
      font-size: 14px;
      line-height: 18px;
      color: #82BF25;
      margin: 5px 0 0 0;
      font-weight: 400;
      text-align: center;
    }
  }
}

.tab-switcher {
  display: flex;
  width: 100%;
  justify-content: center;
  margin-bottom: 15px;
  gap: 30px;

  .tab-item {
    font-size: 16px;
    line-height: 20px;
    color: #333333;
    cursor: pointer;
    position: relative;
    padding-bottom: 8px;
    transition: all 0.3s;

    &.active {
      color: #00B3ED;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: #00B3ED;
        border-radius: 2px;
      }
    }
  }

  .tab-item:not(.active) {
    color: #666;
  }
}

.login-form {
  width: 100%;
  max-width: 350px;

  :deep(.custom-input) {
    width: 100% !important;

    .el-input__wrapper {
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: none !important;
      transition: all 0.3s;

      &:hover,
      &.is-focus {
        border-color: #00B3ED;
        background-color: #fff;
        box-shadow: none !important;
      }
    }

    input {
      font-size: 16px;
      color: #333;

      &::placeholder {
        color: #999999;
      }
    }
  }

  .pwd-eye {
    cursor: pointer;
    color: #999999;
  }

  .code-item {
    :deep(.el-form-item__content) {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .code-input {
      flex: 1;
    }

    .login-code {
      height: 50px;
      width: 120px;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      border: 1px solid #E4E7ED;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;

      .login-code-img {
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }
  }

  .el-form-item {
    margin-bottom: 14px !important;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.policy-section {
  margin: 11px 0 30px 0;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;

  label {
    height: 14px;
  }

  .policy-text {
    font-size: 12px;
    color: #999;
    line-height: 14px;

    .policy-link {
      color: #00B3ED;
      text-decoration: none;
    }
  }

  :deep(.el-checkbox__label) {
    padding-left: 8px;
  }

  :deep(.el-checkbox__inner) {
    border-radius: 50%; // 圆形勾选框
    width: 12px;
    height: 12px;
  }
}

.login-submit-btn {
  width: 400px;
  background: #00B3ED;
  font-size: 14px;
  border: none;
  transition: all 0.3s;
  color: #fff;

  &:active {
    transform: translateY(0);
  }
}

.footer-links {
  width: 350px;
  margin: 15px auto 0;
  display: flex;
  justify-content: space-between;
  gap: 30px;

  .link {
    font-size: 12px;
    color: #666;
    text-decoration: none;
    transition: color 0.3s;
    cursor: pointer;

    &:hover {
      color: #3AB2F1;
    }
  }
}
</style>
