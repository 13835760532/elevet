<template>
  <HelpCenterAccessDialog
    v-model="accessDialogVisible"
    @success="handleAccessSuccess"
    @cancel="handleAccessCancel"
  />

  <template v-if="accessGranted">
    <ContentWrap>
      <el-form
        ref="queryFormRef"
        class="tutorial-query-form -mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="0"
      >
        <el-form-item prop="keyword">
          <el-input
            v-model="queryParams.keyword"
            class="!w-240px"
            clearable
            placeholder="请输入标题或简介"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="type">
          <el-select
            v-model="queryParams.type"
            class="!w-180px"
            clearable
            placeholder="请选择教程类型"
          >
            <el-option label="操作手册" value="MANUAL" />
            <el-option label="操作视频" value="VIDEO" />
          </el-select>
        </el-form-item>
        <el-form-item prop="status">
          <el-select
            v-model="queryParams.status"
            class="!w-160px"
            clearable
            placeholder="请选择状态"
          >
            <el-option label="正常" :value="0" />
            <el-option label="下线" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="tutorial-query-actions !mr-0">
          <el-button @click="handleQuery"> <Icon icon="ep:search" class="mr-5px" />搜索 </el-button>
          <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-5px" />重置 </el-button>
          <el-button type="primary" plain @click="openForm('create')">
            <Icon icon="ep:plus" class="mr-5px" />新增
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>

    <ContentWrap>
      <el-table v-loading="loading" :data="list">
        <el-table-column label="编号" align="center" prop="id" width="90" />
        <el-table-column label="标题" prop="title" min-width="220" show-overflow-tooltip />
        <el-table-column label="类型" align="center" prop="type" width="110">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'MANUAL' ? 'primary' : 'success'">
              {{ scope.row.type === 'MANUAL' ? '操作手册' : '操作视频' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="简介" prop="summary" min-width="260" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.summary || '--' }}</template>
        </el-table-column>
        <el-table-column label="排序" align="center" prop="sort" width="90" />
        <el-table-column label="状态" align="center" prop="status" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 0 ? 'success' : 'info'">
              {{ scope.row.status === 0 ? '正常' : '下线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="更新时间"
          align="center"
          prop="updateTime"
          width="180"
          :formatter="dateFormatter"
        />
        <el-table-column label="操作" align="center" fixed="right" width="180">
          <template #default="scope">
            <el-button link type="primary" @click="openForm('detail', scope.row.id)"
              >详情</el-button
            >
            <el-button link type="primary" @click="openForm('update', scope.row.id)"
              >编辑</el-button
            >
            <el-button link type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        :total="total"
        v-model:page="queryParams.pageNo"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </ContentWrap>

    <TutorialForm ref="formRef" @success="getList" />
  </template>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as TutorialApi from '@/api/agri/tutorial'
import HelpCenterAccessDialog from '@/layout/components/HelpCenterAccessDialog.vue'
import { isHelpCenterAccessGranted, revokeHelpCenterAccess } from '@/utils/helpCenterAccess'
import TutorialForm from './TutorialForm.vue'

defineOptions({ name: 'TutorialManagement' })

const message = useMessage()
const { t } = useI18n()
const router = useRouter()

const accessGranted = ref(isHelpCenterAccessGranted())
const accessDialogVisible = ref(!accessGranted.value)

const handleAccessSuccess = () => {
  accessGranted.value = true
}

const handleAccessCancel = () => {
  if (!accessGranted.value) router.replace('/index')
}

const handleAccessExpired = () => {
  revokeHelpCenterAccess()
  accessGranted.value = false
  accessDialogVisible.value = true
  list.value = []
  total.value = 0
}

const loading = ref(false)
const list = ref<TutorialApi.TutorialRespVO[]>([])
const total = ref(0)
const queryParams = reactive<TutorialApi.TutorialPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  keyword: '',
  type: undefined,
  status: undefined
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await TutorialApi.getTutorialPage(queryParams)
    list.value = data?.list || []
    total.value = data?.total || 0
  } catch {
    handleAccessExpired()
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  void getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const formRef = ref<InstanceType<typeof TutorialForm>>()

const openForm = (type: 'create' | 'update' | 'detail', id?: number) => {
  formRef.value?.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await TutorialApi.deleteTutorial(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {
    // 取消删除时无需额外提示。
  }
}

onMounted(() => {
  if (accessGranted.value) void getList()
})

watch(accessGranted, (granted) => {
  if (granted) void getList()
})
</script>

<style scoped lang="scss">
.tutorial-query-form {
  display: flex;
  flex-wrap: wrap;
}

.tutorial-query-actions {
  margin-left: auto;
}
</style>
