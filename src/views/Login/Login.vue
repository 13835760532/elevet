<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header Area -->
      <div class="login-header">
        <div class="logo-box">
          <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" />
        </div>
        <div class="title-box">
          <div class="main-title">链安食检数智服务平台</div>
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
        <router-link to="/register" class="link">注册</router-link>
        <router-link to="/forgotPassword" class="link">忘记密码</router-link>
      </div>

      <Verify
        v-if="captchaEnabled"
        ref="verify"
        :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }"
        mode="pop"
        @success="handleLogin"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import * as authUtil from '@/utils/auth'
import { usePermissionStore } from '@/store/modules/permission'
import * as LoginApi from '@/api/login'

const loginType = ref('checking') // checking | business
const policyAgreed = ref(false)
const loading = ref(false)
const captchaEnabled = ref(import.meta.env.VITE_APP_CAPTCHA_ENABLE === 'true')
const tenantEnabled = import.meta.env.VITE_APP_TENANT_ENABLE === 'true'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()
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

// 获取租户 ID
const getTenantId = async () => {
  if (tenantEnabled) {
    const res = await LoginApi.getTenantIdByName(loginForm.value.tenantName)
    authUtil.setTenantId(res)
  }
}

// 记住我
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

// 根据域名，获得租户信息
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

const handleLogin = async (params) => {
  loading.value = true
  try {
    await getTenantId()
    const loginDataForm = { ...loginForm.value }
    loginDataForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.login(loginDataForm)
    if (!res) {
      return
    }
    const globalLoading = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    
    if (loginDataForm.rememberMe) {
      authUtil.setLoginForm(loginDataForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    
    if (!redirect.value) {
      redirect.value = '/'
    }

    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      await router.push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
    globalLoading.close()
  } finally {
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
      font-weight: 500;
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
  justify-content: center;

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
  margin-top: 15px;
  display: flex;
  gap: 30px;

  .link {
    font-size: 12px;
    color: #666;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #3AB2F1;
    }
  }
}
</style>
