<template>
  <div class="table-container">
    <!-- 标题 -->
    <div class="guide-card">
      <div class="card-header">
        <h2 class="card-title">分发关系管理</h2>
      </div>
    </div>

    <!-- 查询表单 -->
    <div class="query-card">
      <div class="query-form-wrapper">
        <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row"
          label-position="left">
          <el-form-item prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入关系名称" clearable class="custom-input w180" />
          </el-form-item>
          <el-form-item prop="relationType">
            <el-select v-model="queryParams.relationType" placeholder="请选择关系类型" clearable class="custom-select w130">
              <el-option label="全部关系类型" value="" />
              <el-option v-for="dict in relationTypeOptions" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择关系状态" clearable class="custom-select w130">
              <el-option label="全部关系状态" value="" />
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <div class="query-btns" style="margin-left: auto;">
            <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
            <el-button @click="handleReset" class="reset-btn">重置</el-button>
          </div>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="table-actions">
        <div class="action-left">
          <el-button type="primary" @click="handleAdd" class="primary-btn">
            <Icon icon="ep:plus" class="mr-5px" /> 新建分发关系
          </el-button>
        </div>
        <div class="action-right">
          <el-button @click="handleExport" :loading="exportLoading">导出</el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-wrapper">
        <el-table ref="tableRef" :data="tableList" v-loading="loading" :height="tableHeight" border="false">
          <el-table-column label="层级ID" prop="id" width="80" align="center" />
          <el-table-column label="关系名称" prop="name" min-width="180" show-overflow-tooltip />
          <el-table-column label="关联账户 (个)" prop="targetCount" width="120" align="center" />
          <el-table-column label="关系类型" prop="relationType" width="150" align="center">
            <template #default="scope">
              {{ getRelationTypeLabel(scope.row.relationType) }}
            </template>
          </el-table-column>
          <el-table-column label="机构关系" prop="institutionRelation" width="150" align="center" />
          <el-table-column label="前端是否显示" prop="showFrontend" width="120" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.showFrontend ? 'success' : 'info'">
                {{ scope.row.showFrontend ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="关系状态" prop="status" width="100" align="center">
            <template #default="scope">
              <span :class="scope.row.status === 1 ? 'status-active' : 'status-disabled'">
                {{ scope.row.status === 1 ? '启用' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createTime" width="180" align="center" :formatter="dateFormatter" />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="scope">
              <div class="table-operate-action-btns">
                <span :class="scope.row.status === 1 ? 'table-delete-operate' : 'table-edit-operate'"
                  @click="handleStatusChange(scope.row)">
                  {{ scope.row.status === 1 ? '禁用' : '启用' }}
                </span>
                <span class="table-edit-operate" @click="handleEdit(scope.row)">编辑</span>
                <span class="table-view-operate" @click="handleEdit(scope.row)">管理账户</span>
                <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pageParams.pageNo" v-model:page-size="pageParams.pageSize" :total="total"
          background layout="total, sizes, prev, pager, next, jumper" class="custom-pagination" @size-change="getList"
          @current-change="getList" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTableHeight } from '@/hooks/web/useTableHeight'
import { dateFormatter } from '@/utils/formatTime'
import { useMessage } from '@/hooks/web/useMessage'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'
import { ElMessageBox } from 'element-plus'
import download from '@/utils/download'
import * as DistributionApi from '@/api/agri/distribution'

defineOptions({ name: 'DistributionRelation' })
const { options: relationTypeOptions, getLabel: getRelationTypeLabel } = useDict('dist_relation_type', 'str')
const router = useRouter()
const message = useMessage()
const loading = ref(false)
const exportLoading = ref(false)
const total = ref(0)
const tableList = ref([])
const tableRef = ref(null)
const { tableHeight } = useTableHeight(tableRef, 85)

const queryParams = reactive({
  name: '',
  relationType: '',
  status: undefined
})

const pageParams = reactive({
  pageNo: 1,
  pageSize: 10
})

const getList = async () => {
  loading.value = true
  try {
    const data = await DistributionApi.getDistributionPage({
      ...queryParams,
      pageNo: pageParams.pageNo,
      pageSize: pageParams.pageSize
    })
    tableList.value = data.list
    total.value = data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pageParams.pageNo = 1
  getList()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.relationType = ''
  queryParams.status = undefined
  handleQuery()
}

const handleAdd = () => {
  router.push('/user/distribution/relation-create')
}

const handleEdit = (row: any) => {
  router.push(`/user/distribution/relation-create?id=${row.id}`)
}

const handleStatusChange = async (row: any) => {
  const text = row.status === 1 ? '禁用' : '启用'
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await message.confirm(`是否确认${text}关系名称为"${row.name}"的数据项?`)
    await DistributionApi.updateDistributionStatus(row.id, newStatus)
    message.success(`${text}成功`)
    getList()
  } catch { }
}

const handleManageAccount = (row: any) => {
  // router.push(`/distribution/relation-account?id=${row.id}`)
  message.info('管理账户功能开发中...')
}

/** 删除按钮操作 */
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('是否确认删除关系名称为"' + row.name + '"的数据项?', '警告', {
      type: 'warning'
    })
    await DistributionApi.deleteDistribution(row.id)
    message.success('删除成功')
    getList()
  } catch { }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const res = await DistributionApi.exportDistribution({
      ...queryParams,
      pageNo: pageParams.pageNo,
      pageSize: pageParams.pageSize
    })
    download.excel(res, '分发关系数据.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.query-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.tip-text {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.status-active {
  color: #67c23a;
}

.status-disabled {
  color: #f56c6c;
}

.w180 {
  width: 180px !important;
}

.w130 {
  width: 130px !important;
}

.mr-5px {
  margin-right: 5px;
}

.table-operate-action-btns {
  display: flex;
  justify-content: center;
  gap: 12px;

  span {
    cursor: pointer;
    font-size: 14px;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
