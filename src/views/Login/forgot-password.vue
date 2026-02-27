<template>
    <div class="login-container forgot-container">
        <div class="forgot-card">
            <!-- Header Area (Same as login_new.vue) -->
            <div class="forgot-header">
                <div class="logo-box">
                    <img src="@/assets/logo/logo.png" alt="logo" class="logo-img" />
                </div>
                <div class="title-box">
                    <div class="main-title">链安食检数智服务平台</div>
                    <div class="sub-title">专业版(v2.0-2026)</div>
                </div>
            </div>

            <!-- Page Title Section -->
            <div class="form-title-section">
                <h2 class="form-title">找回密码</h2>
                <p class="form-desc">通过手机号验证身份，重置你的密码</p>
            </div>

            <!-- Form Area -->
            <el-form ref="forgotRef" :model="forgotForm" :rules="forgotRules" class="forgot-form">
                <el-form-item prop="phonenumber">
                    <el-input v-model="forgotForm.phonenumber" type="text" placeholder="手机号/账号" />
                </el-form-item>

                <div class="code-row">
                    <el-form-item prop="code" class="code-input-item">
                        <el-input v-model="forgotForm.code" type="text" placeholder="请输入6位验证码"
                            maxlength="6" />
                    </el-form-item>
                    <el-button class="send-code-btn" :disabled="countdown > 0" @click="handleSendCode">
                        {{ countdown > 0 ? `${countdown}s后重新获取` : '发送验证码' }}
                    </el-button>
                </div>

                <p class="tip-text">我们将向您的手机号发送验证码请确保您能接收短信</p>

                <el-form-item class="btn-item">
                    <el-button :loading="loading" type="primary" class="action-btn submit-btn"
                        @click.prevent="handleContinue">
                        验证并继续
                    </el-button>
                </el-form-item>

                <el-form-item class="btn-item">
                    <el-button class="action-btn back-btn" @click="goBack">
                        返回登录
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { sendSmsCode } from '@/api/login'

const loading = ref(false)
const countdown = ref(0)
const isSmsSent = ref(false)
const { proxy } = getCurrentInstance()
const router = useRouter()

const forgotForm = ref({
    phonenumber: '',
    code: ''
})

const forgotRules = {
    phonenumber: [{ required: true, trigger: "blur", message: "请输入手机号" }],
    code: [
        { required: true, trigger: "blur", message: "请输入验证码" },
        { len: 6, message: "验证码长度应为6位", trigger: "blur" }
    ]
}

function handleSendCode() {
    if (!forgotForm.value.phonenumber) {
        ElMessage.warning('请先输入手机号')
        return
    }

    sendSmsCode({ mobile: forgotForm.value.phonenumber, scene: 4 }).then(() => {
        ElMessage.success('验证码已发送')
        isSmsSent.value = true
        countdown.value = 60
        const timer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
                clearInterval(timer)
            }
        }, 1000)
    }).catch(() => {})
}

function handleContinue() {
    // 1 添加判断-发送验证码
    if (!isSmsSent.value) {
        ElMessage.warning('请先获取并填写验证码')
        return
    }
    // 2 校验手机和验证码
    proxy.$refs.forgotRef.validate(valid => {
        if (valid) {
            loading.value = true
            router.push({
                path: "/reset-password",
                query: {
                    mobile: forgotForm.value.phonenumber,
                    code: forgotForm.value.code
                }
            })
            loading.value = false
        }
    })
}

function goBack() {
    router.push('/login')
}
</script>

<style lang="scss" scoped>
.forgot-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    background: linear-gradient(180deg, #D9EFFF 0%, #FFFFFF 100%);
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.forgot-card {
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

.forgot-header {
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

.form-title-section {
    width: 100%;
    max-width: 350px;
    text-align: left;
    margin-bottom: 25px;

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

.forgot-form {
    width: 100%;
    max-width: 350px;

    :deep(.custom-input) {
        .el-input__wrapper {
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: none !important;
            transition: all 0.3s;

            &:hover,
            &.is-focus {
                border-color: #00B3ED;
                box-shadow: none !important;
                background-color: #fff;
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

    .el-form-item {
        margin-bottom: 14px !important;

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

.tip-text {
    font-size: 12px;
    color: #999;
    margin: 10px 0 25px 0;
    line-height: 1.5;
}

.btn-item {
    margin-bottom: 12px !important;
}

.action-btn {
    width: 100%;
    font-size: 14px;
    transition: all 0.3s;
    border: none;
}

.submit-btn {
    background: #00B3ED;
    color: #fff;
}

.back-btn {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    color: #666;

    &:hover {
        border-color: #00B3ED !important;
        color: #00B3ED;
        background: #f8faff;
    }
}
</style>
