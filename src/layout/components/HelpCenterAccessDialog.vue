<template>
  <el-dialog
    :model-value="modelValue"
    width="440px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    class="help-access-dialog"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="handleClosed"
  >
    <template #header>
      <h2 class="dialog-title">欢迎，进入壹拾智检帮助中心</h2>
    </template>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top">
      <el-form-item label="访问密码" prop="password">
        <el-input
          ref="passwordInputRef"
          v-model="formData.password"
          type="password"
          show-password
          autocomplete="off"
          placeholder="输入帮助中心访问密码"
          @keyup.enter="submit"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          show-password
          autocomplete="off"
          placeholder="确认您的密码"
          @keyup.enter="submit"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button class="access-button" type="primary" :loading="submitting" @click="submit">
        访问帮助中心
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { verifyTutorialAccessPassword } from '@/api/agri/tutorial'
import { grantHelpCenterAccess } from '@/utils/helpCenterAccess'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
  cancel: []
}>()

const message = useMessage()
const formRef = ref()
const passwordInputRef = ref()
const submitting = ref(false)
const verified = ref(false)
const formData = reactive({
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请再次输入访问密码'))
  } else if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const formRules = {
  password: [{ required: true, message: '请输入访问密码', trigger: 'blur' }],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: ['blur', 'change'] }]
}

const reset = () => {
  formData.password = ''
  formData.confirmPassword = ''
  verified.value = false
  formRef.value?.resetFields()
}

const submit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  submitting.value = true
  try {
    const verifiedPassword = await verifyTutorialAccessPassword(formData.password)
    if (!verifiedPassword) {
      message.error('访问密码错误')
      return
    }

    verified.value = true
    grantHelpCenterAccess()
    emit('update:modelValue', false)
    emit('success')
  } finally {
    submitting.value = false
  }
}

const handleClosed = () => {
  if (!verified.value) emit('cancel')
  reset()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return
    reset()
    nextTick(() => passwordInputRef.value?.focus())
  }
)
</script>

<style scoped lang="scss">
.dialog-title {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
}

:deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  min-height: 40px;
}

.access-button {
  width: 100%;
}
</style>
