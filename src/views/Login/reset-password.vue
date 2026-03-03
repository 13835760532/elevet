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

<script setup>
import { ref, getCurrentInstance } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { smsResetPassword } from '@/api/login'

const loading = ref(false)
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const resetForm = ref({
    password: '',
    confirmPassword: ''
})

const equalToPassword = (rule, value, callback) => {
    if (resetForm.value.password !== value) {
        callback(new Error("两次输入的密码不一致"))
    } else {
        callback()
    }
}

const resetRules = {
    password: [
        { required: true, trigger: "blur", message: "请输入新密码" },
        { min: 8, message: "密码长度至少为 8 个字符", trigger: "blur" }
    ],
    confirmPassword: [
        { required: true, trigger: "blur", message: "请再次输入密码" },
        { validator: equalToPassword, trigger: "blur" }
    ]
}

function handleReset() {
    proxy.$refs.resetRef.validate(valid => {
        if (valid) {
            const { mobile, code } = route.query
            if (!mobile || !code) {
                ElMessage.error('缺失手机号或验证码信息，请返回上一步')
                return
            }
            loading.value = true
            smsResetPassword({ 
                mobile: mobile,
                code: code,
                password: resetForm.value.password
            }).then(() => {
                ElMessage.success('密码重置成功，请重新登录')
                router.push('/login')
            }).finally(() => {
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
