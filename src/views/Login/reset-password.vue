<template>
    <div class="login-container reset-container">
        <div class="reset-card">
            <!-- Header Area -->
            <div class="reset-header">
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
                <h2 class="form-title">重设密码</h2>
                <p class="form-desc">请输入你的新密码，确保密码安全且易于记忆</p>
            </div>

            <!-- Form Area -->
            <el-form ref="resetRef" :model="resetForm" :rules="resetRules" class="reset-form">
                <el-form-item v-if="!(route.query.mobile && route.query.code)" prop="mobile">
                    <el-input v-model="resetForm.mobile" type="text" placeholder="手机号" />
                </el-form-item>

                <div v-if="!(route.query.mobile && route.query.code)" class="code-row">
                    <el-form-item prop="code" class="code-input-item">
                        <el-input v-model="resetForm.code" type="text" placeholder="验证码" />
                    </el-form-item>
                    <el-button class="send-code-btn" :disabled="countdown > 0" @click="handleSendCode">
                        {{ countdown > 0 ? `${countdown}s后重新获取` : '发送验证码' }}
                    </el-button>
                </div>

                <el-form-item prop="password">
                    <el-input v-model="resetForm.password" type="password" show-password
                        placeholder="请输入新密码（至少8个字符）">
                    </el-input>
                </el-form-item>

                <!-- Password Requirements -->
                <div class="password-requirements">
                    <p class="req-title">密码要求：</p>
                    <ul class="req-list">
                        <li>• 至少 8 个字符</li>
                        <li>• 建议包含大小写字母、数字和特殊符号</li>
                    </ul>
                </div>

                <el-form-item prop="confirmPassword">
                    <el-input v-model="resetForm.confirmPassword" type="password" show-password
                        placeholder="请再次输入密码">
                    </el-input>
                </el-form-item>

                <el-form-item class="submit-item">
                    <el-button :loading="loading" type="primary" class="reset-submit-btn" @click.prevent="handleReset">
                        确认重设密码
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { smsResetPassword, sendSmsCode } from '@/api/login'
import type { ResetPasswordVO } from '@/api/login/types'

const loading = ref(false)
const countdown = ref(0)
const isSmsSent = ref(false)
const instance = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const resetForm = ref({
    mobile: '',
    code: '',
    password: '',
    confirmPassword: ''
})

const equalToPassword = (_rule: any, value: any, callback: any) => {
    if (resetForm.value.password !== value) {
        callback(new Error("两次输入的密码不一致"))
    } else {
        callback()
    }
}

const resetRules = {
    mobile: [{ required: true, trigger: "blur", message: "手机号不能为空" }],
    code: [{ required: true, trigger: "blur", message: "验证码不能为空" }],
    password: [
        { required: true, trigger: "blur", message: "请输入新密码" },
        { min: 8, message: "密码长度至少为 8 个字符", trigger: "blur" }
    ],
    confirmPassword: [
        { required: true, trigger: "blur", message: "请再次输入密码" },
        { validator: equalToPassword, trigger: "blur" }
    ]
}

onMounted(() => {
    // 从路由参数中预填手机号和验证码
    if (route.query.mobile) {
        resetForm.value.mobile = route.query.mobile as string
    }
    if (route.query.code) {
        resetForm.value.code = route.query.code as string
        isSmsSent.value = true // 如果 URL 带了 code，认为已发送
    }
})

function handleSendCode() {
    if (!resetForm.value.mobile) {
        ElMessage.warning('请先输入手机号')
        return
    }

    sendSmsCode({ mobile: resetForm.value.mobile, scene: 23 }).then(() => {
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

function handleReset() {
    const formRef = instance?.proxy?.$refs.resetRef as any
    formRef?.validate((valid: boolean) => {
        if (valid) {
            loading.value = true
            const data: ResetPasswordVO = {
                mobile: resetForm.value.mobile,
                code: resetForm.value.code,
                password: resetForm.value.password
            }
            
            smsResetPassword(data).then(() => {
                ElMessage.success('密码重置成功，请重新登录')
                router.push('/login')
            }).catch(() => {
                loading.value = false
            })
        }
    })
}
</script>

<style lang="scss" scoped>
.reset-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    background: linear-gradient(180deg, #D9EFFF 0%, #FFFFFF 100%);
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.reset-card {
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

.reset-header {
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

.reset-form {
    width: 100%;
    max-width: 350px;

    :deep(.custom-input) {
        .el-input__wrapper {
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: none !important;
            transition: all 0.3s;
            overflow: hidden;

            &:hover {
                border-color: #00B3ED;
            }

            &.is-focus {
                border-color: #00B3ED;
                background-color: #fff;
                box-shadow: none !important;
            }
        }

        input {
            font-size: 14px;
            color: #333;

            &::placeholder {
                color: #999999;
            }
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
    margin: 5px 0 15px 0;
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

.submit-item {
    margin-top: 30px;
}

.reset-submit-btn {
    width: 100%;
    background: #00B3ED;
    font-size: 14px;
    border: none;
    transition: all 0.3s;
    color: #fff;
    &:active {
        transform: translateY(0);
    }
}
</style>
