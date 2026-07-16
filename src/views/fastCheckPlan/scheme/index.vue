<template>
  <div class="table-container">
    <!-- 检测方案指南 -->
    <div class="guide-card">
      <div class="card-header">
        <h2 class="card-title">工作方案指南</h2>
      </div>
      <div class="guide-steps">
        <div v-for="(step, index) in steps" :key="index" class="step-container">
          <div class="step-wrapper">
            <div class="step-icon">{{ step.id }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.description }}</div>
            </div>
          </div>
          <div v-if="index < steps.length - 1" class="step-arrow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-svg">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 检测方案查询 -->
    <div class="query-card">
      <div class="query-form-wrapper">
        <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row"
          label-position="left">
          <el-form-item label="">
            <el-input :prefix-icon="Search" width="200" v-model="queryParams.keyword" placeholder="搜索方案编号或方案名称"
              class="custom-input w220" clearable />
          </el-form-item>
          <el-form-item label="">
            <el-tree-select v-model="queryParams.targetCategory" :data="produceCategoryTree"
              :props="{ label: 'name', value: 'code', children: 'children' }" node-key="code"
              placeholder="产品分类" class="custom-select" clearable filterable check-strictly />
          </el-form-item>
          <el-form-item label="">
            <el-select v-model="queryParams.status" placeholder="全部状态" class="custom-select" clearable>
              <el-option label="未开始" :value="0" />
              <el-option label="进行中" :value="1" />
              <el-option label="已延期" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="已结束" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-date-picker style="width: 240px!important;" v-model="queryParams.time" type="daterange"
              range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <div class="query-btns">
            <el-button @click="handleReset" class="reset-btn">重置</el-button>
            <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
          </div>
        </el-form>
      </div>

      <!-- 操作按钮行 -->
      <div class="table-actions">
        <div class="action-left">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon>
              <Plus />
            </el-icon>
            <span>创建方案</span>
          </el-button>
          <el-button type="danger" plain @click="handleBatchDelete" :disabled="selectedIds.length === 0"
            class="batch-delete-btn">
            <el-icon>
              <Delete />
            </el-icon>
            <span>批量删除</span>
          </el-button>
        </div>
        <div class="action-right">
          <el-button @click="handleExport" :loading="exportLoading" class="export-btn">
            <el-icon>
              <Download />
            </el-icon>
            <span>导出</span>
          </el-button>
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="table-wrapper">
        <el-table :data="tableList" :border="false" v-loading="loading" @selection-change="handleSelectionChange"
          height="100%">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="方案编号" prop="planCode" width="160" />
          <el-table-column label="方案名称" prop="planName" min-width="200" show-overflow-tooltip />
          <el-table-column label="产品分类" prop="targetCategory" width="110" align="center">
            <template #default="scope">
              <span>{{ getCategoryLabelFromTree(scope.row.targetCategory) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="检测区域" prop="targetArea" width="110" align="center" />
          <el-table-column label="主管单位" prop="issuerDeptName" width="180" show-overflow-tooltip />
          <el-table-column label="方案检测总量" prop="sampleCount" width="120" align="center" />
          <el-table-column label="方案开始日期" prop="planStartDate" width="120" align="center" />
          <el-table-column label="方案结束日期" prop="planEndDate" width="120" align="center" />
          <el-table-column label="任务方案完成率" width="150" align="center">
            <template #default="scope">
              <span v-if="scope.row.completionRate != null">
                {{ scope.row.completionRate }}% ({{ scope.row.taskCompletedCount || 0 }}/{{ scope.row.taskTotalCount ||
                  0 }})
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <span v-if="statusMap[scope.row.status]" :class="['status-tag', statusMap[scope.row.status].class]">
                {{ statusMap[scope.row.status].text }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <div class="table-operate-action-btns">
                <span class="table-edit-operate" @click="handleEdit(scope.row)" v-if="scope.row.status < 2">编辑</span>
                <span class="table-delete-operate" v-if="scope.row.status == 0"
                  @click="handleDelete(scope.row)">删除</span>
                <span class="table-view-operate" @click="handleView(scope.row)">查看</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pageParams.pageNo" v-model:page-size="pageParams.pageSize" :total="total"
          background layout="total, sizes, prev, pager, next, jumper" class="custom-pagination" @size-change="getList"
          @current-change="getList" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Delete, Download } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue'
import * as DetectionPlanApi from '@/api/agri/detectionPlan'
import * as ProduceCategoryApi from '@/api/agri/produceCategory'
import { handleTree } from '@/utils/tree'
import download from '@/utils/download'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'

const router = useRouter();

// 加载状态
const loading = ref(false)
const exportLoading = ref(false) // 导出加载状态
const selectedIds = ref([]) // 批量选中的 ID 列表

const steps = [
  { id: '01', title: '方案创建', description: '创建工作方案(如年度、专项)' },
  { id: '02', title: '任务拆分', description: '按承检机构拆分检测任务' },
  { id: '03', title: '任务下达', description: '任务下达至承检机构' },
  { id: '04', title: '检测结果查看', description: '任务内检测结果查看' },
  { id: '05', title: '方案进度跟踪', description: '任务执行进度统计' }
];

// 查询参数（keyword 同时搜索方案编码和名称）
const queryParams = reactive({
  keyword: '',
  targetCategory: '',
  status: undefined,
  time: []
});

// 分页参数（对接 API 使用 pageNo / pageSize）
const pageParams = reactive({
  pageNo: 1,
  pageSize: 10
});

const total = ref(0);

// 状态映射
const statusMap = {
  0: { text: '未开始', class: 'status-not-started' },
  1: { text: '进行中', class: 'status-processing' },
  2: { text: '已延期', class: 'status-delayed' },
  3: { text: '已完成', class: 'status-completed' },
  4: { text: '已结束', class: 'status-finished' }
};

// 使用字典
const { options: productCategoryOptions, getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str')

const produceCategoryTree = ref([])

const getCategoryLabelFromTree = (val) => {
  if (!val) return '--'
  const findLabel = (nodes) => {
    for (const node of nodes) {
      if (String(node.code) === String(val) || String(node.name) === String(val) || String(node.id) === String(val)) {
        return node.name
      }
      if (node.children?.length) {
        const found = findLabel(node.children)
        if (found) return found
      }
    }
    return null
  }
  const foundName = findLabel(produceCategoryTree.value)
  return foundName || getProductCategoryLabel(val) || val
}

/** 加载农产品行业分类树 */
const loadProduceCategoryTree = async () => {
  try {
    const res = await ProduceCategoryApi.getProduceCategoryPage({
      pageNo: 1,
      pageSize: 1000,
      type: '1' // 1-分类
    })
    const list = res?.list || []
    produceCategoryTree.value = handleTree(list)
  } catch (error) {
    console.error('加载农产品分类失败:', error)
  }
}

// 表格数据
const tableList = ref([]);

/** 获取列表数据 */
const getList = async () => {
  loading.value = true
  try {
    // 组装请求参数
    const params = {
      pageNo: pageParams.pageNo,
      pageSize: pageParams.pageSize
    }
    // 关键词搜索：同时传入 planCode 和 planName（后端会做 OR 查询，或根据实际逻辑处理）
    if (queryParams.keyword) {
      params.keyword = queryParams.keyword
    }
    // 目标品种
    if (queryParams.targetCategory) {
      params.targetCategory = queryParams.targetCategory
    }
    // 状态筛选
    if (queryParams.status !== undefined && queryParams.status !== null && queryParams.status !== '') {
      params.status = queryParams.status
    }
    // 日期范围
    if (queryParams.time && queryParams.time.length === 2) {
      params.planStartDate = queryParams.time[0]
      params.planEndDate = queryParams.time[1]
    }

    const res = await DetectionPlanApi.getDetectionPlanPage(params)
    tableList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('获取检测方案列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 查询功能
const handleQuery = () => {
  pageParams.pageNo = 1
  getList()
};

// 重置功能
const handleReset = () => {
  queryParams.keyword = ''
  queryParams.targetCategory = ''
  queryParams.status = undefined
  queryParams.time = []
  pageParams.pageNo = 1
  getList()
};

// 移除 watch，改用组件上的 @size-change 和 @current-change 事件

// 创建方案
const handleAdd = () => {
  router.push('/fastCheckPlan/schemeCreate');
};

// 编辑方案
const handleEdit = (row) => {
  router.push({
    path: '/fastCheckPlan/schemeCreate',
    query: { id: row.id, mode: 'edit' }
  });
};

// 删除方案（带二次确认）
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除方案"${row.planName}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    // 调用删除接口
    await DetectionPlanApi.deleteDetectionPlan(row.id)
    ElMessage.success('删除成功')
    // 刷新列表
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除检测方案失败：', error)
    }
  }
};

// 查看方案详情
const handleView = (row) => {
  router.push({
    path: '/fastCheckPlan/schemeTask',
    query: { id: row.id }
  });
};

/** 表格多选变化 */
const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(row => row.id)
}

/** 批量删除 */
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的方案')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个方案吗？删除后将无法恢复。`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    // 调用批量删除接口
    await DetectionPlanApi.deleteDetectionPlanList(selectedIds.value)
    selectedIds.value = []
    ElMessage.success('批量删除成功')
    // 刷新列表
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除检测方案失败：', error)
    }
  }
}

/** 导出 Excel */
const handleExport = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要导出检测方案数据吗？',
      '导出确认',
      {
        confirmButtonText: '确定导出',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    exportLoading.value = true
    // 组装导出参数（与查询参数一致）
    const params = {}
    if (queryParams.keyword) {
      params.planCode = queryParams.keyword
      params.planName = queryParams.keyword
    }
    if (queryParams.targetCategory) {
      params.targetCategory = queryParams.targetCategory
    }
    if (queryParams.status !== undefined && queryParams.status !== null && queryParams.status !== '') {
      params.status = queryParams.status
    }
    if (queryParams.time && queryParams.time.length === 2) {
      params.planStartDate = queryParams.time[0]
      params.planEndDate = queryParams.time[1]
    }
    // 调用导出接口
    const data = await DetectionPlanApi.exportDetectionPlan(params)
    download.excel(data, '检测方案.xls')
    ElMessage.success('导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导出检测方案失败：', error)
    }
  } finally {
    exportLoading.value = false
  }
}

// 页面初始化时加载数据
onMounted(() => {
  loadProduceCategoryTree()
  getList()
})
</script>

<style lang="scss" scoped>
.table-container {
  height: calc(100vh - 86px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  box-sizing: border-box;
}

.guide-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  flex-shrink: 0;
}

.query-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}


.query-form-wrapper {
  display: flex;
  flex-wrap: wrap;
}

/* 指南步骤样式 - 忠实还原设计图 */
.guide-steps {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 18px;
  padding: 8px 0;
  overflow-x: auto;

  &::-webkit-scrollbar {
    width: 0;
  }

  .step-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .step-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-shrink: 0;
  }

  .step-wrapper-active {

    .step-title {
      font-size: 14px;
      color: #00B3ED;
      white-space: nowrap;
      font-weight: 600;
    }

    .step-icon {
      opacity: 1;
    }
  }

  .step-icon {
    width: 38px;
    height: 38px;
    border: 2px solid #00B3ED;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #00B3ED;
    font-weight: 600;
    margin-top: 2px;
    opacity: 0.8;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .step-title {
    font-size: 14px;
    color: #00B3ED;
    white-space: nowrap;
    font-weight: 600;
  }

  .step-desc {
    font-size: 12px;
    color: #999;
    line-height: 1.4;
    white-space: nowrap;
  }

  .step-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    margin-top: 12px; // 对齐圆圈中心
    align-self: flex-start;

    .arrow-svg {
      width: 24px;
      height: 24px;
      color: #ccc;
    }
  }
}


:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  box-shadow: none !important;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;

  &:hover {
    border-color: #00B3ED;
  }

  &.is-focus {
    border-color: #00B3ED;
    box-shadow: none !important;
  }
}

.date-range-box {
  display: flex;
  align-items: center;
  width: 282px;

  :deep(.el-input__wrapper) {
    flex: 1;
    width: 142px;
  }
}

/* 操作行 */
.table-actions {
  margin-bottom: 24px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 12px;

  .table-actions-left {
    display: flex;
    gap: 12px;
  }

  .add-btn {
    padding: 0 20px;
    background-color: #00B3ED;
    border-color: #00B3ED;
    border-radius: 8px;
    font-weight: 500;

    .el-icon {
      margin-right: 6px;
    }
  }

  .batch-delete-btn,
  .export-btn {
    border-radius: 8px;
    font-weight: 500;

    .el-icon {
      margin-right: 6px;
    }
  }
}

/* 表格定制 */
.table-wrapper {
  margin-bottom: 16px;
  flex: 1;
  height: 0;
}



/* 状态标签 */
.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.status-not-started {
    background-color: #E6F7FF;
    color: #00B3ED;
  }

  &.status-processing {
    background-color: #FFF7E6;
    color: #FA8C16;
  }

  &.status-delayed {
    background-color: #FFF1F0;
    color: #F5222D;
  }

  &.status-completed {
    background-color: #F6FFED;
    color: #52C41A;
  }

  &.status-finished {
    background-color: #F5F5F5;
    color: #8C8C8C;
  }
}

/* 分页适配 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 0;
}

/* 响应式 */
@media (max-width: 1400px) {
  .guide-steps {
    flex-wrap: wrap;

    .step-arrow {
      display: none;
    }
  }
}
</style>
