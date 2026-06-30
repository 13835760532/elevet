<template>
  <div class="table-container" v-loading="loading">
    <!-- 机构查询卡片 -->
    <div class="query-card">

      <!-- 查询表单区域 -->
      <div class="query-form-wrapper">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="0"
          class="custom-query-form  custom-query-form-row flex flex-wrap justify-between items-center">
          <div class="flex flex-wrap gap-10px items-center">
            <el-form-item prop="name" class="!mb-0" style="margin-right: 0px!important;">
              <el-input v-model="queryParams.name" placeholder="搜索机构名称" clearable @keyup.enter="handleQuery"
                class="custom-input w240">
                <template #prefix>
                  <Icon icon="ep:search" />
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="status" class="!mb-0" style="margin-right: 0px!important;">
              <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="custom-select"
                style="width: 140px">
                <el-option v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)" :key="dict.value"
                  :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item prop="createTime" class="!mb-0">
              <el-date-picker v-model="queryParams.createTime" type="daterange" range-separator="至"
                start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD"
                style="width: 240px!important" />
            </el-form-item>
          </div>
          <div class="query-btns">
            <el-button @click="resetQuery" class="reset-btn">重置</el-button>
            <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
          </div>
        </el-form>
      </div>

      <!-- 操作按钮行 -->
      <div class="table-actions">
        <div class="actions-left flex gap-12px">
          <el-button type="primary" @click="openForm('create')" v-hasPermi="['system:dept:create']"
            class="!bg-[#00B3ED] !border-[#00B3ED] !px-20px">
            <Icon icon="ep:plus" class="mr-5px" /> 创建机构
          </el-button>
        </div>
        <div class="actions-right">
          <el-button @click="handleExport" v-hasPermi="['system:dept:export']">
            <Icon icon="ep:download" class="mr-5px" /> 导出
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="list" row-key="id" v-if="refreshTable" height="100%">
          <el-table-column label="机构ID" prop="id" width="80" align="center" />
          <el-table-column prop="name" label="机构名称" min-width="180" />

          <el-table-column prop="deptType" label="生产经营企业" width="120" align="center">
            <template #default="scope">
              {{ scope.row.deptType === 1 ? '监管机构' : scope.row.deptType === 2 ? '检测机构' : scope.row.deptType === 3 ?
                '生产经营企业' : '系统机构管理' }}
            </template>
          </el-table-column>
          <el-table-column prop="areaLevel" label="机构行政级别" width="120" align="center">
            <template #default="scope">
              {{ scope.row.areaLevel === 1 ? '省级' : scope.row.areaLevel === 2 ? '市级' : scope.row.areaLevel === 3 ? '区级'
                : ''
              }}
            </template>
          </el-table-column>
          <el-table-column label="所属行政区划" min-width="180">
            <template #default="scope">
              {{ formatArea(scope.row) || scope.row.address || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="contactName" label="联系人" width="100" align="center" />

          <el-table-column label="操作" align="center" fixed="right" width="180">
            <template #default="scope">
              <el-button link type="primary" @click="openDetail(scope.row.id)" v-hasPermi="['system:dept:query']">
                详情
              </el-button>
              <el-button link type="primary" @click="openForm('update', scope.row.id)"
                v-hasPermi="['system:dept:update']">
                编辑
              </el-button>
              <span class="mx-5px text-gray-300">|</span>
              <el-button link type="danger" @click="handleDelete(scope.row.id)" v-hasPermi="['system:dept:delete']">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize" :total="total"
          background layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 表单弹窗：添加/修改 -->
    <DeptForm ref="formRef" @success="getList" />

    <!-- 详情弹窗 -->
    <DeptDetail ref="detailRef" />
  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as DeptApi from '@/api/system/dept'
import * as AreaApi from '@/api/system/area'
import DeptForm from './DeptForm.vue'
import DeptDetail from './DeptDetail.vue'
import * as UserApi from '@/api/system/user'
import { useDict } from '@/hooks/web/useDict'

defineOptions({ name: 'SystemDept' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const router = useRouter()

const loading = ref(true) // 列表的加载中
const list = ref([]) // 列表的数据
const total = ref(0) // 列表的总页数
const userList = ref<UserApi.UserVO[]>([]) // 用户列表
const refreshTable = ref(true) // 重新渲染表格状态
const areaMap = ref<Record<string, string>>({}) // 地区字典

const formatArea = (row: any) => {
  const parts = []
  if (row.provinceCode && areaMap.value[String(row.provinceCode)]) parts.push(areaMap.value[String(row.provinceCode)])
  if (row.cityCode && areaMap.value[String(row.cityCode)]) parts.push(areaMap.value[String(row.cityCode)])
  if (row.districtCode && areaMap.value[String(row.districtCode)]) parts.push(areaMap.value[String(row.districtCode)])
  return parts.length > 0 ? parts.join('-') : ''
}

const buildAreaMap = (nodes: any[]) => {
  if (!nodes || !nodes.length) return
  for (const node of nodes) {
    areaMap.value[String(node.id)] = node.name
    if (node.children && node.children.length > 0) {
      buildAreaMap(node.children)
    }
  }
}

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  createTime: undefined
})
const queryFormRef = ref() // 搜索的表单
const detailRef = ref() // 详情的弹窗

/** 查询机构管理列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.pageNo = 1
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  if (type === 'create') {
    router.push('/system/dept/create')
  } else if (type === 'update') {
    router.push(`/system/dept/create?id=${id}`)
  } else {
    formRef.value.open(type, id)
  }
}

/** 打开详情 */
const openDetail = (id?: number) => {
  detailRef.value.open(id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await DeptApi.deleteDept(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch { }
}

/** 批量导出操作 */
const handleExport = () => {
  // TODO: 实现导出逻辑
  message.info('导出功能待实现')
}

/** 分页大小修改 */
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  handleQuery()
}

/** 页码修改 */
const handleCurrentChange = (val: number) => {
  queryParams.pageNo = val
  getList()
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 获取用户列表
  userList.value = await UserApi.getSimpleUserList()
  // 获取地区列表并构建字典
  const tree = await AreaApi.getAreaTree()
  buildAreaMap(tree)
})
</script>

<style lang="scss" scoped>
.table-container {
  height: calc(100vh - 86px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.query-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;
}

.card-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.query-form-wrapper {
  margin-bottom: 5px;
}

/* 搜索表单布局 */
.custom-query-form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.query-btns {
  display: flex;
  gap: 12px;

  .reset-btn {
    padding: 0 25px;
  }

  .search-btn {
    padding: 0 25px;
    background-color: #00B3ED;
    border-color: #00B3ED;
  }
}

/* 输入框定制 */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  box-shadow: none !important;

  &:hover {
    border-color: #00B3ED;
  }

  &.is-focus {
    border-color: #00B3ED;
  }
}

/* 操作按钮行 */
.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.export-btn {
  background: #fff;
  border: 1px solid #D1D5DB;
}

/* 表格定制 */
.table-wrapper {
  flex: 1;
  height: 0;
  margin-bottom: 12px;
}

:deep(.el-table) {
  --el-table-header-bg-color: #F8FAFC;
  border-radius: 8px;
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 10px 0;
}
</style>
