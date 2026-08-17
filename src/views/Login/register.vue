<template>
  <div class="login-container register-container">
    <div class="register-card">
      <!-- Header Area -->
      <div class="register-header">
        <div class="logo-box">
          <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" />
        </div>
        <div class="title-box">
          <div class="main-title">农产品质量安全监管数智服务平台</div>
          <div class="sub-title">专业版(v2.0-2026)</div>
        </div>
      </div>

      <!-- Form Area -->
      <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
        <!-- 第一步：基础信息与验证 -->
        <div v-if="currentStep === 1">
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" type="text" placeholder="请输入用户名" />
          </el-form-item>

          <el-form-item prop="nickname">
            <el-input v-model="registerForm.nickname" type="text" placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item prop="mobile">
            <el-input v-model="registerForm.mobile" type="text" placeholder="请输入手机号" />
          </el-form-item>

          <div class="code-row">
            <el-form-item prop="code" class="code-input-item">
              <el-input v-model="registerForm.code" type="text" placeholder="请输入验证码" maxlength="6" />
            </el-form-item>
            <el-button class="send-code-btn" :disabled="countdown > 0" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}s后重新获取` : '发送验证码' }}
            </el-button>
          </div>

          <el-form-item>
            <el-button type="primary" class="register-submit-btn" @click.prevent="handleNextStep">
              下一步
            </el-button>
          </el-form-item>
        </div>

        <!-- 第二步：设置密码 -->
        <div v-if="currentStep === 2">
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码（至少8个字符）" />
          </el-form-item>

          <div class="password-requirements">
            <p class="req-title">密码要求：</p>
            <ul class="req-list">
              <li>• 至少 8 个字符</li>
              <li>• 建议包含大小写字母、数字和特殊符号</li>
            </ul>
          </div>

          <el-form-item prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
          </el-form-item>

          <el-form-item>
            <div class="step2-actions">
              <el-button :loading="loading" type="primary" class="register-submit-btn"
                @click.prevent="handleRegisterPre">
                {{ loading ? '注册中...' : '确认注册' }}
              </el-button>
              <el-button class="back-link-btn" @click="currentStep = 1">返回修改基础信息</el-button>
            </div>
          </el-form-item>
        </div>
      </el-form>

      <!-- Footer Links -->
      <div class="footer-links">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>

      <Verify v-if="captchaEnabled" ref="verify" :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }" mode="pop" @success="handleRegister" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { register, sendSmsCode } from "@/api/login"
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const countdown = ref(0)
const currentStep = ref(1)
const captchaEnabled = ref(import.meta.env.VITE_APP_CAPTCHA_ENABLE === 'true')
const captchaType = ref('blockPuzzle')
const verify = ref()
const { proxy } = getCurrentInstance()
const router = useRouter()

const registerForm = ref({
  username: '',
  nickname: '',
  mobile: '',
  code: '',
  password: '',
  confirmPassword: '',
  captchaVerification: ''
})

/**\n * equalToPassword：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的用户名" },
    { min: 4, max: 30, message: '用户账号长度必须介于 4 和 30 之间', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]{4,30}$/, message: '用户账号只能包含字母和数字', trigger: 'blur' }
  ],
  nickname: [
    { required: true, trigger: "blur", message: "请输入您的昵称" },
    { min: 2, max: 30, message: '用户昵称长度必须介于 2 和 30 之间', trigger: 'blur' }
  ],
  mobile: [
    { required: true, trigger: "blur", message: "请输入您的手机号" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号格式", trigger: "blur" }
  ],
  code: [
    { required: true, trigger: "blur", message: "请输入验证码" },
    { len: 6, message: "验证码长度应为 6 位", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 8, message: "密码长度至少为 8 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { validator: equalToPassword, trigger: "blur" }
  ]
}

/**\n * handleSendCode：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSendCode = () => {
  if (!registerForm.value.mobile) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(registerForm.value.mobile)) {
    ElMessage.warning('请输入正确的手机号格式')
    return
  }

  sendSmsCode({ mobile: registerForm.value.mobile, scene: 22 }).then(() => {
    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }).catch(() => { })
}

/**\n * handleNextStep：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleNextStep = async () => {
  if (!proxy.$refs.registerRef) return;

  // 仅校验第一步的关键字段
  const fields = ['username', 'nickname', 'mobile', 'code']
  try {
    const valid = await proxy.$refs.registerRef.validateField(fields)
    if (valid) {
      currentStep.value = 2
    }
  } catch (error) {
    // 校验失败，Element Plus 会自动显示红色报错文字，此处不需要额外处理
    console.warn('Step 1 validation failed', error)
  }
}

/**\n * handleRegisterPre：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
function handleRegisterPre() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      if (captchaEnabled.value) {
        verify.value.show()
      } else {
        handleRegister({})
      }
    }
  })
}

/**\n * handleRegister：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
function handleRegister(params) {
  loading.value = true
  const registerData = { ...registerForm.value }
  registerData.captchaVerification = params.captchaVerification

  register(registerData).then(res => {
    const username = registerForm.value.username || '用户'
    ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
      dangerouslyUseHTMLString: true,
      type: "success",
    }).then(() => {
      router.push("/login")
    }).catch(() => { })
  }).catch(() => {
    loading.value = false
  })
}
</script>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #D9EFFF 0%, #FFFFFF 100%);
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.register-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 467px;
  height: auto;
  background: #FFFFFF;
  box-shadow: 0px 3px 15px 0px rgba(0, 0, 0, 0.02);
  border-radius: 15px;
  padding-top: 76px;
  padding-bottom: 83px;
}

.register-header {
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
      font-size: 22px;
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

.form-title-section {
  width: 100%;
  text-align: left;
  margin-bottom: 16px;
  max-width: 350px;

  .form-title {
    font-size: 20px;
    color: #333333;
    font-weight: bold;
    margin: 0 0 10px 0;
  }

  .form-desc {
    font-size: 12px;
    color: #999;
    margin: 0;
  }
}

.register-form {
  width: 100%;
  max-width: 350px;

  :deep(.custom-input) {
    .el-input__wrapper {
      width: 100%;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: none !important;
      transition: all 0.3s;
      overflow: hidden;

      &:hover {
        border-color: #00B3ED; // 仅改变边框颜色，移除发光
      }

      &.is-focus {
        border-color: #00B3ED;
        background-color: #fff;
        box-shadow: none !important; // 彻底移除阴影
      }
    }

    input {
      font-size: 14px;
      color: #333;
      width: 100% !important;

      &::placeholder {
        color: #999999;
      }
    }
  }

  :deep(.el-input__password) {
    color: #999999;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #00B3ED;
    }
  }

  .el-form-item {
    margin-bottom: 12px !important;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.code-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  .code-input-item {
    flex: 1;
    margin-bottom: 0 !important;
  }

  .send-code-btn {
    width: 120px;
    height: 38px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    color: #666;
    font-size: 12px;
    background: #fff;
    transition: all 0.3s;

    &:hover:not(:disabled) {
      color: #00B3ED;
      border-color: #00B3ED;
      background: #f8faff;
    }

    &:disabled {
      background: #f5f7fa;
      color: #999;
    }
  }
}

.password-requirements {
  margin: 20px 0 15px 0;
  width: 100%;
  max-width: 350px;
  text-align: left;
  padding: 12px;
  background: #F8FAFC;
  border-radius: 8px;

  .req-title {
    font-size: 12px;
    color: #666;
    margin: 0 0 5px 0;
    font-weight: 500;
  }

  .req-list {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 12px;
    color: #999;
    line-height: 1.8;
  }
}

.register-submit-btn {
  width: 100%;
  background: #00B3ED;
  font-size: 14px;
  border: none;
  transition: all 0.3s;
  height: 44px;
  border-radius: 8px;
  color: #fff;
  margin-top: 20px;
}

.step2-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .back-link-btn {
    border: none;
    background: none;
    color: #999;
    font-size: 12px;
    padding: 0;
    height: auto;
    text-decoration: underline;
    cursor: pointer;
    margin-top: 5px;

    &:hover {
      color: #00B3ED;
    }
  }
}

.footer-links {
  margin-top: 15px;

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
