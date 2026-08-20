<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="860" class="tutorial-dialog">
    <template #title>
      <span class="tutorial-dialog-title">{{ dialogTitle }}</span>
    </template>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      :disabled="formType === 'detail'"
      label-width="96px"
    >
      <el-form-item label="教程标题" prop="title">
        <el-input
          v-model="formData.title"
          maxlength="128"
          show-word-limit
          placeholder="请输入教程标题"
        />
      </el-form-item>

      <el-form-item label="教程简介" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="请输入教程简介"
        />
      </el-form-item>

      <el-form-item label="教程类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button value="MANUAL">操作手册</el-radio-button>
          <el-radio-button value="VIDEO">操作视频</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="文件上传">
        <UploadFile
          v-model="formData.url"
          :disabled="formType === 'detail'"
          :file-size="uploadFileSize"
          :file-type="uploadFileTypes"
          :limit="1"
          directory="tutorial"
          replace-on-exceed
        />
      </el-form-item>

      <el-form-item :label="formData.type === 'VIDEO' ? '视频地址' : '文档地址'" prop="url">
        <el-input
          v-model="formData.url"
          maxlength="512"
          readonly
          :placeholder="
            formData.type === 'VIDEO' ? '上传后自动生成视频地址' : '上传后自动生成文档地址'
          "
        />
      </el-form-item>

      <el-form-item v-if="formData.type === 'MANUAL'" label="手册正文" prop="content">
        <Editor v-if="formType !== 'detail'" v-model="formData.content" height="260px" />
        <div
          v-else-if="formData.content"
          v-dompurify-html="formData.content"
          class="tutorial-content"
        ></div>
        <el-empty v-else description="暂无手册正文" :image-size="72" />
      </el-form-item>

      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="0">正常</el-radio>
          <el-radio :value="1">下线</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button
        v-if="formType !== 'detail'"
        type="primary"
        :disabled="formLoading"
        @click="submitForm"
      >
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">
        {{ formType === 'detail' ? '关 闭' : '取 消' }}
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as TutorialApi from '@/api/agri/tutorial'

defineOptions({ name: 'TutorialForm' })

type FormType = 'create' | 'update' | 'detail'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref<FormType>('create')
const formData = ref<TutorialApi.TutorialSaveReqVO>(createDefaultForm())
const formRef = ref()
const uploadFileSize = computed(() => (formData.value.type === 'VIDEO' ? 500 : 100))
const uploadFileTypes = computed(() =>
  formData.value.type === 'VIDEO'
    ? ['mp4', 'mov', 'webm', 'avi', 'mkv']
    : ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar']
)

const formRules = reactive({
  title: [{ required: true, message: '教程标题不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '教程类型不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '显示排序不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})

function createDefaultForm(): TutorialApi.TutorialSaveReqVO {
  return {
    id: undefined,
    title: '',
    summary: '',
    type: 'MANUAL',
    content: '',
    url: '',
    sort: 0,
    status: 0
  }
}

const resetForm = () => {
  formData.value = createDefaultForm()
  formRef.value?.resetFields()
}

const open = async (type: FormType, id?: number) => {
  formType.value = type
  dialogTitle.value = type === 'detail' ? '教程详情' : t(`action.${type}`)
  dialogVisible.value = true
  resetForm()

  if (!id) return

  formLoading.value = true
  try {
    const data = await TutorialApi.getTutorial(id)
    formData.value = {
      id: data.id,
      title: data.title,
      summary: data.summary || '',
      type: data.type,
      content: data.content || '',
      url: data.url || '',
      sort: data.sort,
      status: data.status
    }
  } finally {
    formLoading.value = false
  }
}

defineExpose({ open })

const emit = defineEmits<{ success: [] }>()

const submitForm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await TutorialApi.createTutorial(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await TutorialApi.updateTutorial(formData.value)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}
</script>

<style scoped lang="scss">
:global(.tutorial-dialog .el-dialog__header) {
  padding: 0 !important;
}

.tutorial-dialog-title {
  display: flex;
  align-items: center;
  height: 54px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
}

.tutorial-content {
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  color: var(--el-text-color-regular);
  line-height: 1.7;
  overflow-wrap: anywhere;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;

  :deep(img),
  :deep(video) {
    max-width: 100%;
    height: auto;
  }
}
</style>
