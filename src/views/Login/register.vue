<template>
  <div class="login-container register-container">
    <div class="register-card">
      <!-- Header Area -->
      <div class="register-header">
        <div class="logo-box">
          <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" />
        </div>
        <div class="title-box">
          <div class="main-title">链安食检数智服务平台</div>
          <div class="sub-title">专业版(v2.0-2026)</div>
        </div>
      </div>

      <!-- Form Title -->
      <div class="form-title-section">
        <h2 class="form-title">免费注册</h2>
        <p class="form-desc">请输入您的账号信息进行注册</p>
      </div>

      <!-- Form Area -->
      <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" type="text" placeholder="请输入用户名">
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" show-password placeholder="请输入密码（至少8个字符）">
          </el-input>
        </el-form-item>

        <div class="password-requirements">
          <p class="req-title">密码要求：</p>
          <ul class="req-list">
            <li>• 至少 8 个字符</li>
            <li>• 建议包含大小写字母、数字和特殊符号</li>
          </ul>
        </div>

        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" show-password placeholder="请再次输入密码">
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button :loading="loading" type="primary" class="register-submit-btn" @click.prevent="handleRegister">
            {{ loading ? '注册中...' : '注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Footer Links -->
      <div class="footer-links">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { register } from "@/api/login"
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const { proxy } = getCurrentInstance()
const router = useRouter()

const registerForm = ref({
  username: '', // 这里通常需要用户名，但原型图中只显示了设置密码，假设从上一步传递或后续补完
  password: '',
  confirmPassword: '',
  code: '', // 接口通常需要验证码
  uuid: ''
})

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
    { min: 4, max: 20, message: '用户账号长度必须介于 4 和 20 之间', trigger: 'blur' }
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

function handleRegister() {
  proxy.$refs.registerRef.validate(valid => {
    if (valid) {
      loading.value = true

      register(registerForm.value).then(res => {
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
      width: 100%!important;

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
  margin-top: 30px;

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
