<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter
      v-model:range-type="dateRangeType"
      v-model:date-range="dateRange"
      description="检测任务统计周期"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra>
        <el-input v-model="keyword" placeholder="任务名称/任务编号" clearable />
      </template>
    </StatisticsRangeFilter>

    <!-- 整体业务概况 -->
    <div class="card-section">
      <div class="section-title">整体业务概况</div>
      <div class="overview-cards">
        <div class="stat-card blue-card">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务下发（检测项）</div>
            <div class="card-value">{{ formatNumber(overview.taskIssuedCount) }} <span class="unit">项次</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成（检测项）</div>
            <div class="card-value">{{ formatNumber(overview.taskCompletedCount) }} <span class="unit">项次</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成率</div>
            <div class="card-value">{{ formatPercent(overview.taskCompletionRate) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 业务覆盖群体 -->
    <div class="card-section">
      <div class="section-title">业务覆盖群体</div>
      <div class="coverage-group">
        <div class="coverage-item">
          <div class="coverage-icon icon-purple">
            <Icon icon="ep:service" :size="32" color="#fff" />
          </div>
          <div class="coverage-info">
            <div class="coverage-title">检测机构</div>
            <div class="coverage-value">{{ formatNumber(overview.detectionOrgCount) }}</div>
          </div>
        </div>
        <div class="coverage-divider"></div>
        <div class="coverage-item">
          <div class="coverage-icon icon-red">
            <Icon icon="ep:view" :size="32" color="#fff" />
          </div>
          <div class="coverage-info">
            <div class="coverage-title">生产经营主体</div>
            <div class="coverage-value">{{ formatNumber(overview.enterpriseCount) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="card-section table-section">
      <div class="table-header">
        <div class="table-tabs">
          <span class="t-tab active">检测任务</span>
          <span class="t-divider">|</span>
          <span class="t-tab">检测结果</span>
        </div>
        <el-button type="primary" class="export-btn" @click="handleExport">导出</el-button>
      </div>
      <div class="table-container">
        <el-table v-loading="loading" :data="filteredTableData" style="width: 100%" empty-text="暂无任务检测分析数据">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="taskNo" label="任务编号" align="center" />
          <el-table-column prop="taskName" label="任务名称" align="center" show-overflow-tooltip />
          <el-table-column prop="unit" label="承担单位" align="center" />
          <el-table-column prop="issued" label="任务下达" align="center" />
          <el-table-column prop="completed" label="任务完成" align="center" />
          <el-table-column prop="rate" label="当前完成率" align="center" />
        </el-table>
        <div class="pagination-container">
          <div class="total-text">合计：{{ total }}条</div>
          <el-pagination
            v-model:current-page="pageNo"
            v-model:page-size="pageSize"
            background
            layout="prev, pager, next"
            :total="total"
            @current-change="loadTaskPage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import {
  getTaskAnalysisPage,
  getTaskOverview,
  type DashboardTaskOverviewRespVO,
  type TaskAnalysisRespVO
} from '@/api/agri/dashboard/task'
import { buildRangeParams, formatNumber, formatPercent, normalizePagedResult } from './statisticsData'
import { ElMessage } from 'element-plus'

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const keyword = ref('')
const overview = ref<DashboardTaskOverviewRespVO>({})
const tableData = ref<TaskAnalysisRespVO[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const currentQueryParams = computed(() => buildRangeParams(dateRangeType.value, dateRange.value))

const filteredTableData = computed(() => {
  const keywordValue = keyword.value.trim()
  const source = tableData.value.map((item) => ({
    taskNo: item.taskId ? String(item.taskId) : '--',
    taskName: item.taskName || '--',
    unit: item.undertakeDeptName || '--',
    issued: formatNumber(item.sampleCount),
    completed: formatNumber(item.sampleCompletedCount),
    rate: formatPercent(item.completionRate)
  }))
  if (!keywordValue) return source
  return source.filter(
    (item) => item.taskNo.includes(keywordValue) || item.taskName.includes(keywordValue)
  )
})

const loadOverview = async () => {
  try {
    overview.value = (await getTaskOverview(currentQueryParams.value)) || {}
  } catch (error) {
    console.error('[StatisticsTask] load overview failed:', error)
    overview.value = {}
  }
}

const loadTaskPage = async () => {
  loading.value = true
  try {
    const data = await getTaskAnalysisPage({
      ...currentQueryParams.value,
      pageNo: pageNo.value,
      pageSize: pageSize.value
    })
    const normalized = normalizePagedResult<TaskAnalysisRespVO>(data)
    tableData.value = normalized.list
    total.value = normalized.total
  } catch (error) {
    console.error('[StatisticsTask] load task page failed:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const loadData = () => {
  loadOverview()
  loadTaskPage()
}

const handleSearch = () => {
  pageNo.value = 1
  loadData()
}

const handleReset = () => {
  dateRangeType.value = '近一周'
  dateRange.value = []
  keyword.value = ''
  pageNo.value = 1
  loadData()
}

const handleExport = () => {
  ElMessage.info('当前统计页暂未提供导出接口')
}

watch([dateRangeType, dateRange], () => {
  pageNo.value = 1
  loadData()
})

onMounted(() => {
  loadData()
})

</script>

<style lang="scss" scoped>
.stat-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用 */
.card-section {
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

/* 整体业务概况卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  position: relative;
  height: 100px;
  border-radius: 8px;
  padding: 20px 16px;
  overflow: hidden;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .card-bg-icon {
    position: absolute;
    right: 10px;
    bottom: -10px;
    font-size: 60px;
    opacity: 0.15;
    font-weight: bold;
  }

  .card-title {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  .card-value {
    font-size: 28px;
    font-weight: bold;
    display: flex;
    align-items: baseline;
    gap: 4px;
    
    .unit {
      font-size: 14px;
      font-weight: normal;
    }
  }
}

/* 渐变色定义 */
.blue-card {
  background: linear-gradient(135deg, #6bb9ff 0%, #3e88ff 100%);
}

.blue-card-light {
  background: linear-gradient(135deg, #8dc8ff 0%, #61a6ff 100%);
}

/* 业务覆盖群体 */
.coverage-group {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 0;
  gap: 120px;
}

.coverage-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.coverage-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-purple {
    background-color: #8D76FF;
  }

  &.icon-red {
    background-color: #FF6B6B;
  }
}

.coverage-info {
  .coverage-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .coverage-value {
    font-size: 28px;
    font-weight: bold;
    color: #333;
  }
}

.coverage-divider {
  width: 1px;
  height: 60px;
  background-color: #eee;
}

/* 列表区域 */
.table-section {
  min-height: 400px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
}

.table-tabs {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  
  .t-tab {
    cursor: pointer;
    color: #333;
    transition: color 0.3s;
    
    &.active {
      color: #00B3ED;
    }
    
    &:hover {
      color: #00B3ED;
    }
  }
  
  .t-divider {
    margin: 0 16px;
    color: #e4e7ed;
  }
}

.export-btn {
  background-color: #00B3ED;
  border-color: #00B3ED;
}

.table-container {
  margin-top: 10px;
  
  ::v-deep(.el-table__header-wrapper th) {
    background-color: #f8fbff;
    color: #333;
    font-weight: bold;
  }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  .total-text {
    font-size: 14px;
    color: #333;
    font-weight: bold;
  }
}
</style>
