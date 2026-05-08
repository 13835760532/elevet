<template>
  <Dialog v-model="dialogVisible" title="范围内的机构" width="1100px" :scroll="true" maxHeight="calc(80vh - 120px)" align-center class="institution-user-dialog">
    <div class="dialog-header">
      <div class="header-info">
        <div class="info-item">层级名称：{{ levelName }}</div>
      </div>
    </div>

    <!-- 本地过滤搜索表单 -->
    <div class="search-form">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="机构名称">
          <el-input v-model="queryParams.name" placeholder="请输入机构名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="机构类型">
          <el-select v-model="queryParams.deptType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="监管机构" :value="1" />
            <el-option label="检测机构" :value="2" />
            <el-option label="企业" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="开启" :value="0" />
            <el-option label="关闭" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <el-table ref="tableRef" :data="list" v-loading="loading" border @selection-change="handleSelectionChange"
      max-height="400" row-key="id">
      <el-table-column type="selection" width="55" align="center" :reserve-selection="true" />
      <el-table-column label="机构名称" prop="name" align="center" min-width="180" show-overflow-tooltip />
      <el-table-column label="机构类型" prop="deptType" align="center" width="120">
        <template #default="scope">
          <el-tag :type="getDeptTypeTag(scope.row.deptType)">
            {{ getDeptTypeLabel(scope.row.deptType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="行政级别" prop="areaLevel" align="center" width="120">
        <template #default="scope">
          {{ getAreaLevelLabel(scope.row.areaLevel) }}
        </template>
      </el-table-column>
      <el-table-column label="联系人" prop="contactName" align="center" width="120" />
      <el-table-column label="联系电话" prop="contactPhone" align="center" width="130" />
      <el-table-column label="账号状态" prop="status" align="center" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize" :total="total"
        layout="total, sizes, prev, pager, next, jumper" background @current-change="getList" @size-change="getList" />
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { getDeptPage } from '@/api/system/dept'
import { useMessage } from '@/hooks/web/useMessage'
import { formatDate } from '@/utils/formatTime'
import type { ElTable } from 'element-plus'

const message = useMessage()
const dialogVisible = ref(false)

const tableRef = ref<InstanceType<typeof ElTable>>()
const levelName = ref('')
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const selectedRows = ref<any[]>([])
const initialSelectedIds = ref<number[]>([])

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  deptType: undefined,
  status: undefined,
  areaCode: undefined,
  areaLevel: undefined
})

const getAreaLevelLabel = (level: number) => {
  const map: any = {
    1: '省级',
    2: '市级',
    3: '区县级',
    4: '乡镇级',
    5: '村级'
  }
  return map[level] || '--'
}

const getDeptTypeLabel = (type: number) => {
  const map: any = {
    0: '虚拟节点',
    1: '监管机构',
    2: '检测机构',
    3: '企业',
    4: '系统部门'
  }
  return map[type] || '未知'
}

const getDeptTypeTag = (type: number) => {
  const map: any = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: ''
  }
  return map[type] || 'info'
}

const getList = async () => {
  loading.value = true
  try {
    const data = await getDeptPage(queryParams)
    list.value = data.list || []
    total.value = data.total || 0

    // 数据加载后，如果是首次打开，尝试回显勾选
    if (initialSelectedIds.value.length > 0) {
      nextTick(() => {
        list.value.forEach((row) => {
          if (initialSelectedIds.value.includes(row.id)) {
            tableRef.value?.toggleRowSelection(row, true)
          }
        })
      })
    }
  } catch (error) {
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}



const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  const areaCode = queryParams.areaCode
  const areaLevel = queryParams.areaLevel

  // 重置表单但保留传入的过滤条件
  Object.assign(queryParams, {
    pageNo: 1,
    pageSize: 10,
    name: '',
    deptType: undefined,
    status: undefined,
    areaCode,
    areaLevel
  })
  getList()
}

const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val
}

const emit = defineEmits(['confirm'])

const handleConfirm = () => {
  if (selectedRows.value.length === 0) {
    message.warning('请至少选择一个机构')
    return
  }
  emit('confirm', selectedRows.value)
  dialogVisible.value = false
}

const open = (name: string, params: any = {}) => {
  levelName.value = name || '层级'

  // 回显逻辑：记录初始选中的 ID
  if (params.selectedTargets && Array.isArray(params.selectedTargets)) {
    initialSelectedIds.value = params.selectedTargets.map((t: any) => t.targetId || t.id)
    selectedRows.value = [...params.selectedTargets]
  } else {
    initialSelectedIds.value = []
    selectedRows.value = []
  }

  // 清除表格之前的内部选择状态
  nextTick(() => {
    tableRef.value?.clearSelection()
  })

  // 将传入的层级过滤条件同步到查询参数中
  queryParams.areaCode = params.areaCode
  queryParams.areaLevel = null
  queryParams.pageNo = 1

  dialogVisible.value = true
  getList()
}

defineExpose({ open })
</script>

<style lang="scss">
.institution-user-dialog {
  &.com-dialog {
    // 遮罩层上下居中
    .#{$elNamespace}-overlay-dialog {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
    }
    .#{$elNamespace}-dialog {
      max-height: 80vh !important;
      margin: 0 !important;
    }
    .#{$elNamespace}-dialog__footer {
      border-top: 1px solid var(--el-border-color);
    }
  }
}
</style>

<style scoped lang="scss">
.dialog-header {
  margin-bottom: 24px;

  .header-info {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    line-height: 1.8;
  }
}

.search-form {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
