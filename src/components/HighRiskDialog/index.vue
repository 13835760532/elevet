<template>
  <el-dialog v-model="visible" title="高风险农产品top10排序" width="86vw" :close-on-click-modal="false" class="high-risk-dialog"
    append-to-body>
    <div class="filter-header">
      <div class="filter-row">
        <div class="left-actions">
          <span class="filter-label">数据统计范围：</span>
          <el-select v-model="queryParams.timeDimension" placeholder="请选择" class="filter-input" style="width: 140px">
            <el-option label="累计" value="1" />
            <el-option label="上月度" value="2" />
            <el-option label="上年度" value="3" />
          </el-select>
          <span class="filter-label">农产品名称：</span>
          <el-input v-model="queryParams.productName" placeholder="请输入农产品名称" class="filter-input product-input"
            clearable @keyup.enter="handleQuery" />
        </div>
        <el-button type="primary" class="query-btn" @click="handleQuery" :loading="loading">
          查询
        </el-button>
        <!-- <el-tooltip placement="bottom-end">
          <template #content>
            <div style="line-height: 1.8; font-size: 13px;">
              查询结果说明：<br />
              农产品-检测项 (阳性检出量/总检测量阳性率)
            </div>
          </template>
<el-icon class="help-icon">
  <QuestionFilled />
</el-icon>
</el-tooltip> -->
      </div>
      <div class="filter-note">
        *注：监管机构仅能支持本行政区划下的检测结果；检测机构、生产经营企业仅能查看本机构检测结果；
      </div>
    </div>

    <!-- 表格部分 -->
    <div class="table-containers" v-loading="loading">
      <el-table :data="sortedTableData" border :header-cell-style="{
        textAlign: 'center',
        backgroundColor: '#F9FAFB',
        color: '#111827',
        fontWeight: 'bold'
      }" :cell-style="{ textAlign: 'center' }" height="400">
        <el-table-column label="序号" type="index" width="60" />
        <el-table-column label="品类" prop="productCategory" min-width="130" show-overflow-tooltip />
        <el-table-column label="农产品名称" prop="productName" min-width="140" show-overflow-tooltip />
        <el-table-column label="检测项" prop="detectionItem" min-width="160" show-overflow-tooltip />
        <el-table-column label="阳性项次" prop="positiveItemCount" width="110" sortable />
        <el-table-column label="总项次" prop="totalItemCount" width="100" />
        <el-table-column label="阳性率" prop="positiveRate" width="100">
          <template #default="{ row }">
            {{ formatPositiveRate(row.positiveRate) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize" :total="total"
          :page-sizes="[10, 20, 50, 100]" background layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange" @current-change="getList" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button class="action-btn action-btn-primary" @click="handleClose">了解并关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import * as StaticRiskListApi from '@/api/agri/staticRiskList'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 查询参数
const queryParams = reactive({
  timeDimension: '1',
  productName: '',
  pageNo: 1,
  pageSize: 10
})

const loading = ref(false)
const total = ref(0)
const tableData = ref([])

const sortedTableData = computed(() => {
  return [...tableData.value].sort(
    (a, b) => (Number(b.positiveItemCount) || 0) - (Number(a.positiveItemCount) || 0)
  )
})

const buildQueryParams = () => {
  const params = { ...queryParams }
  if (!params.productName) {
    delete params.productName
  }
  return params
}

const getList = async () => {
  loading.value = true
  try {
    const data = await StaticRiskListApi.getHighRiskList(buildQueryParams())
    tableData.value = data.list || []
    total.value = data.total || 0
  } catch (error) {
    console.error('获取高风险清单失败:', error)
  } finally {
    loading.value = false
  }
}

/** 加载数据 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const handleSizeChange = () => {
  queryParams.pageNo = 1
  getList()
}

const formatPositiveRate = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  const rate = Number(value)
  if (Number.isNaN(rate)) return '-'
  return `${rate.toFixed(2)}%`
}

const handleClose = () => {
  visible.value = false
}

watch(
  () => visible.value,
  (val) => {
    if (val && tableData.value.length === 0) {
      getList()
    }
  }
)
</script>

<style lang="scss">
.high-risk-dialog {
  border-radius: 10px !important;
  overflow: hidden;
  max-width: 1280px;

  .el-dialog__header {
    margin-right: 0;
    padding: 12px 20px 8px !important;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .el-dialog__headerbtn {
      display: none; // 隐藏右上角的关闭按钮(如果需要符合图里没有叉的样子)
    }
  }

  .el-dialog__body {
    padding: 8px 16px !important;
    background-color: #f8fafc;
  }

  .el-dialog__footer {
    padding: 8px 16px 12px !important;
    border-top: 1px dashed #e2e8f0;
  }
}
</style>
<style lang="scss" scoped>
.filter-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;

  .filter-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .query-btn {
      background-color: #00b3ed;
      border-color: #00b3ed;
      padding: 0 24px;
      height: 32px;
    }

    .help-icon {
      font-size: 20px;
      color: #ff4d4f;
      cursor: pointer;
      outline: none;
    }

    .filter-label {
      font-size: 14px;
      color: #333;
    }
  }

  .filter-note {
    font-size: 12px;
    color: #666;
  }

  .filter-input {
    width: 180px;

    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #e2e8f0 inset;
      border-radius: 6px;
    }
  }

  .product-input {
    width: 220px;
  }
}

.table-containers {
  background: #fff;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  :deep(.el-table) {
    --el-table-header-bg-color: #f8fafc;
    border-radius: 8px;
    overflow: hidden;

    .el-table__cell {
      padding: 8px 0 !important;
    }

    .el-table__header {
      th {
        border-bottom: 1px solid #e2e8f0;
      }
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;

  .action-btn {
    padding: 10px 24px;
    height: 40px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .action-btn-secondary {
    background-color: #fff;
    border-color: #dcdfe6;
    color: #606266;

    &:hover,
    &:focus {
      color: #00b3ed;
      border-color: #00b3ed;
      background-color: #f0fbff;
    }
  }

  .action-btn-primary {
    background-color: #00b3ed;
    border-color: #00b3ed;
    color: #fff;

    &:hover,
    &:focus {
      background-color: #0099cc;
      border-color: #0099cc;
    }
  }
}
</style>
