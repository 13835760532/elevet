<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter v-model:range-type="dateRangeType" v-model:date-range="dateRange" description="合格证统计周期"
      @search="handleSearch" @reset="handleReset">
      <template #extra>
        <AreaCascader
          v-model="areaIds"
          placeholder="省/市/县"
          checkStrictly
          :root-area-code="userDeptAreaCode"
          @select="handleAreaSelect"
          @change="handleAreaChange"
        />
      </template>
    </StatisticsRangeFilter>

    <!-- 整体业务概况 -->
    <div class="card-section">
      <div class="section-title">整体业务概况</div>
      <div class="overview-cards">
        <div class="stat-card blue-card">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">合格证开具份数</div>
            <div class="card-value">{{ formatNumber(overview.issueCount) }} <span class="unit">份</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">开具主体量</div>
            <div class="card-value">{{ formatNumber(overview.issueSubjectCount) }} <span class="unit">个</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 合格证开具 -->
    <div class="card-section">
      <div class="section-title">合格证开具</div>

      <!-- 第二层筛选 -->
      <div class="result-filters">
        <el-input v-model="filters.certNo" placeholder="合格证编号" class="filter-item input-item" />
        <el-select v-model="filters.issueType" placeholder="出证类型" class="filter-item" clearable>
          <el-option label="生产者" :value="1" />
          <el-option label="收购者" :value="2" />
          <el-option label="批发市场" :value="3" />
        </el-select>
        <el-input v-model="filters.productName" placeholder="产品名称" class="filter-item" clearable />
        <el-select v-model="filters.category" placeholder="产品类别" class="filter-item" clearable>
          <el-option v-for="item in productCategoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-input v-model="filters.origin" placeholder="产地" class="filter-item" clearable />
        <div class="filter-actions">
          <el-button type="primary" class="export-btn" @click="handleSearch">查询</el-button>
          <el-button type="primary" class="export-btn" @click="resetTableFilters">重置</el-button>
          <el-button type="primary" class="export-btn" @click="handleExport">导出</el-button>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="chart-area-wrapper">
        <div class="chart-header">
          <span class="chart-y-title">合格证数量</span>
        </div>
        <Echart :options="trendOption" height="320px" />
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table v-loading="loading" :data="tableData" style="width: 100%" border
          header-cell-class-name="custom-header" empty-text="暂无合格证开具记录">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="certNo" label="合格证编号" align="center" min-width="140" />
          <el-table-column prop="issueType" label="出证类型" align="center" width="100" />
          <el-table-column prop="productName" label="产品名称" align="center" width="100" />
          <el-table-column prop="category" label="产品类别" align="center" width="100" />
          <el-table-column prop="origin" label="产地" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="subject" label="生产经营主体" align="center" min-width="180" show-overflow-tooltip />
          <el-table-column prop="date" label="开具日期" align="center" width="150" />
        </el-table>

        <div class="pagination-container">
          <div class="total-text">合计：{{ total }}条</div>
          <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" background
            layout="prev, pager, next" :total="total" @current-change="loadTable" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import { Echart } from '@/components/Echart'
import {
  getCertificateOverview,
  getCertificateServiceTrend,
  type CertificateServiceTrendRespVO,
  type DashboardCertificateOverviewRespVO
} from '@/api/agri/dashboard/certificate'
import * as CertificateApi from '@/api/agri/certificate'
import {
  buildRangeParams,
  formatNumber,
  getEffectiveAreaParams,
  getSelectedAreaParams,
  getUserDeptAreaParams,
  normalizePagedResult
} from './statisticsData'
import { useDict } from '@/hooks/web/useDict'
import { ElMessage } from 'element-plus'

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const areaIds = ref<string[]>([])
const areaParams = reactive({
  provinceName: '',
  cityName: '',
  areaType: '',
  areaCode: ''
})
const overview = ref<DashboardCertificateOverviewRespVO>({})
const trend = ref<CertificateServiceTrendRespVO>({})
const tableData = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const { options: productCategoryOptions, getLabel: getProductCategoryLabel } = useDict('agri_product_category', 'str')

const filters = reactive({
  certNo: '',
  issueType: 3 as number | undefined,
  productName: '',
  category: '',
  origin: ''
})

const queryParams = computed(() => ({
  ...buildRangeParams(dateRangeType.value, dateRange.value),
  ...getEffectiveAreaParams(areaParams)
}))

const userDeptAreaCode = computed(() => getUserDeptAreaParams().areaCode)

const trendOption = computed(() => ({
  grid: { top: 24, right: 32, bottom: 36, left: 48 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', boundaryGap: false, data: trend.value.xaxis || [] },
  yAxis: { type: 'value' },
  series: [
    {
      name: '开具份数',
      type: 'line',
      data: trend.value.issueCounts || [],
      itemStyle: { color: '#00B3ED' }
    }
  ]
}))

const getIssueTypeLabel = (value?: number) => {
  if (value === 1) return '生产者'
  if (value === 2) return '收购者'
  if (value === 3) return '批发市场'
  return '--'
}

const maskPhone = (value?: string) => {
  if (!value) return '--'
  return value.replace(/(\d{3})\d{4}(\d{2,4})/, '$1****$2')
}

const handleAreaSelect = (area: any) => {
  Object.assign(areaParams, getSelectedAreaParams(area))
}

const handleAreaChange = (value: any) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    areaParams.provinceName = ''
    areaParams.cityName = ''
    areaParams.areaType = ''
    areaParams.areaCode = ''
  }
}

const mapRow = (item: any) => ({
  certNo: item.certificateCode || '--',
  issueType: getIssueTypeLabel(item.certificateType),
  productName: item.productName || '--',
  category: item.productCategory ? getProductCategoryLabel(item.productCategory) : '--',
  origin: item.productionArea || '--',
  subject: item.subjectName || '--',
  date: item.issueDate || '--',
  contact: item.contactName || '--',
  phone: maskPhone(item.contactPhone)
})

const loadDashboardData = async () => {
  try {
    const [overviewData, trendData] = await Promise.all([
      getCertificateOverview(queryParams.value),
      getCertificateServiceTrend(queryParams.value)
    ])
    overview.value = overviewData || {}
    trend.value = trendData || {}
  } catch (error) {
    console.error('[StatisticsIssue] load dashboard data failed:', error)
    overview.value = {}
    trend.value = {}
  }
}

const loadTable = async () => {
  loading.value = true
  try {
    const data = await CertificateApi.getCertificatePage({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      certificateCode: filters.certNo || undefined,
      certificateType: filters.issueType,
      productName: filters.productName || undefined,
      productCategory: filters.category || undefined,
      productionArea: filters.origin || undefined,
      startDate: queryParams.value.startDate,
      endDate: queryParams.value.endDate,
      areaType: queryParams.value.areaType,
      areaCode: queryParams.value.areaCode
    })
    const normalized = normalizePagedResult<any>(data)
    tableData.value = normalized.list.map(mapRow)
    total.value = normalized.total
  } catch (error) {
    console.error('[StatisticsIssue] load table failed:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const loadData = () => {
  loadDashboardData()
  loadTable()
}

const handleSearch = () => {
  pageNo.value = 1
  loadData()
}

const resetTableFilters = () => {
  filters.certNo = ''
  filters.issueType = 3
  filters.productName = ''
  filters.category = ''
  filters.origin = ''
  handleSearch()
}

const handleReset = () => {
  dateRangeType.value = '近一周'
  dateRange.value = []
  areaIds.value = []
  areaParams.provinceName = ''
  areaParams.cityName = ''
  areaParams.areaType = ''
  areaParams.areaCode = ''
  resetTableFilters()
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
  grid-template-columns: repeat(4, 1fr);
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

/* 结果筛选区 */
.result-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;

  .filter-item {
    width: 140px;
  }

  .input-item {
    width: 180px;
  }

  .export-btn {
    background-color: #00B3ED;
    border-color: #00B3ED;
  }

  .filter-actions {
    margin-left: auto;
    display: flex;
    gap: 12px;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

/* 图表区域 */
.chart-area-wrapper {
  margin-bottom: 30px;
}

.chart-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 20px;

  .chart-y-title {
    position: absolute;
    left: 0;
    font-size: 14px;
    color: #333;
    font-weight: bold;
  }
}

.svg-chart-container {
  display: flex;
  height: 320px;
  position: relative;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 12px;
  padding-bottom: 20px;
  font-size: 12px;
  color: #999;
  text-align: right;
  width: 30px;
}

.svg-wrapper {
  flex: 1;
  position: relative;
}

.chart-grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;

  .grid-line {
    width: 100%;
    height: 1px;
    background-color: #f0f0f0;
  }
}

.chart-x-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  padding: 0 10px;
}

/* 表格区域 */
.table-container {
  margin-top: 10px;

  ::v-deep(.custom-header) {
    background-color: #f5f7fa !important;
    color: #333;
    font-weight: bold;
    white-space: pre-line;
    line-height: 1.4;
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
