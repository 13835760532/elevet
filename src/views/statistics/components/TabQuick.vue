<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter v-model:range-type="dateRangeType" v-model:date-range="dateRange" description="快速检测统计周期"
      @search="handleSearch" @reset="handleReset">
      <template #extra>
        <AreaCascader v-model="areaIds" placeholder="省/市/县" checkStrictly :root-area-code="userDeptAreaCode"
          @select="handleAreaSelect" @change="handleAreaChange" />
      </template>
    </StatisticsRangeFilter>

    <!-- 整体业务概况 -->
    <div class="card-section">
      <div class="section-title">整体业务概况</div>
      <div class="overview-cards">
        <div class="stat-card blue-card">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">检测样品总量</div>
            <div class="card-value">{{ formatNumber(overview.sampleBatchCount) }} <span class="unit">个</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">检测项目总量</div>
            <div class="card-value">{{ formatNumber(overview.detectionItemCount) }} <span class="unit">项次</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 检测结果 -->
    <div class="card-section">
      <div class="section-title">检测结果</div>

      <!-- 第二层筛选 -->
      <div class="result-filters">
        <!-- 第一行：常规选项 -->
        <div class="filter-row-top">
          <el-input v-model="filters.keyword" placeholder="任务名称/任务编号" class="filter-item input-item" />
          <el-select v-model="filters.type" placeholder="全部类型" class="filter-item">
            <el-option label="自主检测" value="1" />
            <el-option label="任务检测" value="2" />
          </el-select>
          <el-input v-model="filters.sample" placeholder="样品名称" class="filter-item" clearable />
          <el-select v-model="filters.category" placeholder="产品分类" class="filter-item" clearable>
            <el-option v-for="item in productCategoryOptions" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
          <el-input v-model="filters.area" placeholder="检测地区" class="filter-item" clearable />
          <el-select v-model="filters.org" placeholder="检测机构" class="filter-item"></el-select>
          <el-select v-model="filters.result" placeholder="检测结果" class="filter-item" clearable>
            <el-option label="阴性" :value="0" />
            <el-option label="阳性" :value="1" />
            <el-option label="结果异常" :value="2" />
          </el-select>
        </div>

        <!-- 第二行：时间筛选及查询动作 -->
        <div class="filter-row-bottom">
          <el-date-picker v-model="filters.date" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" class="filter-item date-picker-large" />
          <div class="filter-actions">
            <el-button type="primary" class="export-btn" @click="handleExport" :loading="exportLoading">导出</el-button>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container" style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div class="chart-area-wrapper" style="flex: 1; margin-bottom: 0;">
          <div class="chart-header">
            <div class="chart-legends">
              <div class="legend-item"><span class="legend-dot theme"></span>样品量</div>
            </div>
          </div>
          <Echart :options="sampleTrendOption" height="320px" />
        </div>

        <div class="chart-area-wrapper" style="flex: 1; margin-bottom: 0;">
          <div class="chart-header">
            <div class="chart-legends">
              <div class="legend-item"><span class="legend-dot theme"></span>阳性率</div>
            </div>
          </div>
          <Echart :options="positiveTrendOption" height="320px" />
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table v-loading="loading" :data="tableData" style="width: 100%" border
          header-cell-class-name="custom-header" empty-text="暂无快速检测记录">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="recordCode" label="任务编号" align="center" width="100" />
          <el-table-column prop="planName" label="任务名称" align="center" show-overflow-tooltip min-width="120" />
          <el-table-column prop="sampleNo" label="样品编号" align="center" width="120" />
          <el-table-column prop="sampleName" label="样品名称" align="center" width="80" />
          <el-table-column prop="category" label="产品分类" align="center" width="80" />
          <el-table-column prop="origin" label="产地" align="center" width="100" />
          <el-table-column prop="subject" label="被检主体" align="center" width="120" show-overflow-tooltip />
          <el-table-column prop="inspectArea" label="抽检地区" align="center" width="100" />
          <el-table-column prop="inspectOrg" label="抽检机构" align="center" width="120" show-overflow-tooltip />
          <el-table-column prop="time" label="检测时间" align="center" width="100" />
          <el-table-column prop="item" label="检测项目" align="center" width="120" show-overflow-tooltip />
          <el-table-column prop="result" label="检测结果" align="center" width="80" />
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
import { useRoute } from 'vue-router'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import { Echart } from '@/components/Echart'
import {
  getFastOverview,
  getFastPositiveRateTrend,
  getFastSelfSampleTrend,
  type DashboardFastOverviewRespVO,
  type FastPositiveRateTrendRespVO,
  type FastSelfSampleTrendRespVO
} from '@/api/agri/dashboard/fast'
import * as DetectionRecordApi from '@/api/agri/detectionRecord'
import { useDict } from '@/hooks/web/useDict'
import {
  buildRangeParams,
  formatNumber,
  getEffectiveAreaParams,
  getSelectedAreaParams,
  getUserDeptAreaParams,
  normalizePagedResult
} from './statisticsData'
import { ElMessage, ElMessageBox } from 'element-plus'
import download from '@/utils/download'
import dayjs from 'dayjs'

const route = useRoute()

const initFiltersFromQuery = () => {
  // 回显检测结果（将字符串转成数字以匹配下拉框 :value="1" 等选项）
  if (route.query.overallResult !== undefined && route.query.overallResult !== null && route.query.overallResult !== '') {
    filters.result = Number(route.query.overallResult)
  }
  // 回显日期时间范围
  if (route.query.startDate && route.query.endDate) {
    filters.date = [route.query.startDate as string, route.query.endDate as string] as any
  }
}

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const areaIds = ref<string[]>([])
const areaParams = reactive({
  provinceName: '',
  cityName: '',
  areaType: '',
  areaCode: ''
})
const overview = ref<DashboardFastOverviewRespVO>({})
const selfTrend = ref<FastSelfSampleTrendRespVO>({})
const positiveTrend = ref<FastPositiveRateTrendRespVO>({})
const loading = ref(false)
const exportLoading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const { options: productCategoryOptions, getLabel: getCategoryLabel } = useDict('agri_product_category', 'str')

const filters = reactive({
  keyword: '',
  type: '',
  sample: '',
  category: '',
  area: '',
  org: '',
  result: '',
  date: []
})

const userDeptAreaCode = computed(() => getUserDeptAreaParams().areaCode)

const dashboardQueryParams = computed(() => ({
  ...buildRangeParams(dateRangeType.value, dateRange.value),
  ...getEffectiveAreaParams(areaParams)
}))



const sampleTrendOption = computed(() => {
  const xAxis = selfTrend.value.xaxis?.length
    ? selfTrend.value.xaxis
    : positiveTrend.value.xaxis || []
  return {
    grid: { top: 24, right: 36, bottom: 36, left: 48 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: xAxis },
    yAxis: { type: 'value', name: '样品量' },
    series: [
      {
        name: '样品量',
        type: 'bar',
        barMaxWidth: 30,
        data: selfTrend.value.sampleCounts || [],
        itemStyle: { color: '#00B3ED' }
      }
    ]
  }
})

const positiveTrendOption = computed(() => {
  const xAxis = selfTrend.value.xaxis?.length
    ? selfTrend.value.xaxis
    : positiveTrend.value.xaxis || []
  return {
    grid: { top: 24, right: 36, bottom: 36, left: 48 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: any) => value + '%'
    },
    xAxis: { type: 'category', data: xAxis },
    yAxis: { type: 'value', name: '阳性率(%)' },
    series: [
      {
        name: '阳性率',
        type: 'bar',
        barMaxWidth: 30,
        data: positiveTrend.value.positiveRates || [],
        itemStyle: { color: '#00B3ED' }
      }
    ]
  }
})

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

const parseDetectionItems = (value: any) => {
  if (!value) return '--'
  if (typeof value !== 'string') return '--'
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed?.results)) {
      return parsed.results.map((item: any) => item.codeName || item.detectionItem).filter(Boolean).join('、') || '--'
    }
  } catch (error) {
    return value || '--'
  }
  return '--'
}

const getResultLabel = (value: any) => {
  if (value === 0) return '阴性'
  if (value === 1) return '阳性'
  if (value === 2) return '结果异常'
  return '--'
}

const mapRecordRow = (item: any) => ({
  taskNo: item.taskCode || item.task?.taskCode || item.recordCode || '--',
  taskName: item.taskName || item.task?.taskName || item.planName || '--',
  recordCode: item.recordCode || '--',
  planName: item.planName || '--',
  type: item.taskId ? '任务检测' : '自主检测',
  sampleNo: item.sampleCode || item.recordCode || '--',
  sampleName: item.productName || item.sampleName || '--',
  category: item.productCategory ? getCategoryLabel(item.productCategory) : '--',
  origin: item.sampleArea || item.productionArea || item.sample?.productionArea || '--',
  subject: item.subjectName || '--',
  inspectArea: item.detectionArea || '--',
  inspectOrg: item.detectionOrgName || '--',
  time: item.detectionDate ? String(item.detectionDate).slice(0, 10) : '--',
  item: parseDetectionItems(item.aiRecognitionResult),
  result: getResultLabel(item.overallResult)
})

const loadDashboardData = async () => {
  try {
    const [overviewData, selfTrendData, positiveTrendData] = await Promise.all([
      getFastOverview(dashboardQueryParams.value),
      getFastSelfSampleTrend(dashboardQueryParams.value),
      getFastPositiveRateTrend(dashboardQueryParams.value)
    ])
    overview.value = overviewData || {}
    selfTrend.value = selfTrendData || {}
    positiveTrend.value = positiveTrendData || {}
  } catch (error) {
    console.error('[StatisticsQuick] load dashboard data failed:', error)
    overview.value = {}
    selfTrend.value = {}
    positiveTrend.value = {}
  }
}

const buildTableQuery = () => {
  let rawStartDate: any = undefined
  let rawEndDate: any = undefined

  if (Array.isArray(filters.date) && filters.date.length === 2 && filters.date[0] && filters.date[1]) {
    rawStartDate = filters.date[0]
    rawEndDate = filters.date[1]
  } else {
    const dashboardParams = dashboardQueryParams.value
    rawStartDate = dashboardParams.startDate
    rawEndDate = dashboardParams.endDate
  }

  const detectionDate = rawStartDate && rawEndDate ? [
    formatExportDate(rawStartDate, false),
    formatExportDate(rawEndDate, true)
  ] : undefined

  return {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    ...getEffectiveAreaParams(areaParams),
    recordCode: filters.keyword || undefined,
    sampleName: filters.sample || undefined,
    productCategory: filters.category || undefined,
    detectionArea: filters.area || undefined,
    detectionOrgName: filters.org || undefined,
    overallResult: filters.result !== '' ? filters.result : undefined,
    selfDetection: filters.type === '1' ? 'true' : filters.type === '2' ? 'false' : undefined,
    detectionDate
  }
}

const formatExportDate = (dateVal: any, isEnd: boolean) => {
  if (!dateVal) return undefined
  const d = dayjs(dateVal)
  if (!d.isValid()) return undefined
  return isEnd ? d.endOf('day').format('YYYY-MM-DD HH:mm:ss') : d.startOf('day').format('YYYY-MM-DD HH:mm:ss')
}

const buildExportParams = () => {
  let rawStartDate: any = undefined
  let rawEndDate: any = undefined

  if (Array.isArray(filters.date) && filters.date.length === 2 && filters.date[0] && filters.date[1]) {
    rawStartDate = filters.date[0]
    rawEndDate = filters.date[1]
  } else {
    const dashboardParams = dashboardQueryParams.value
    rawStartDate = dashboardParams.startDate
    rawEndDate = dashboardParams.endDate
  }

  const detectionDate = rawStartDate && rawEndDate ? [
    formatExportDate(rawStartDate, false),
    formatExportDate(rawEndDate, true)
  ] : undefined

  return {
    ...getEffectiveAreaParams(areaParams),
    recordCode: filters.keyword || undefined,
    sampleName: filters.sample || undefined,
    productCategory: filters.category || undefined,
    detectionArea: filters.area || undefined,
    detectionOrgName: filters.org || undefined,
    overallResult: filters.result !== '' ? filters.result : undefined,
    selfDetection: filters.type === '1' ? 'true' : filters.type === '2' ? 'false' : undefined,
    detectionDate
  }
}

const loadTable = async () => {
  loading.value = true
  try {
    const data = await DetectionRecordApi.getDetectionRecordPage(buildTableQuery())
    const normalized = normalizePagedResult<any>(data)
    tableData.value = normalized.list.map(mapRecordRow)
    total.value = normalized.total
  } catch (error) {
    console.error('[StatisticsQuick] load table failed:', error)
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

const resetResultFilters = () => {
  filters.keyword = ''
  filters.type = ''
  filters.sample = ''
  filters.category = ''
  filters.area = ''
  filters.org = ''
  filters.result = ''
  filters.date = []
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
  resetResultFilters()
}

const handleExport = async () => {
  try {
    await ElMessageBox.confirm('确定要导出快速检测记录吗？', '导出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    exportLoading.value = true
    const params = buildExportParams()
    const data = await DetectionRecordApi.exportDetectionRecord(params)
    download.excel(data, '快速检测记录.xls')
    ElMessage.success('导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导出快速检测记录失败：', error)
      ElMessage.error('导出失败')
    }
  } finally {
    exportLoading.value = false
  }
}

watch([dateRangeType, dateRange], () => {
  pageNo.value = 1
  loadData()
})

onMounted(() => {
  initFiltersFromQuery()
  loadData()
})

watch(
  () => route.query,
  () => {
    initFiltersFromQuery()
    loadData()
  }
)

</script>

<style lang="scss" scoped>
$statistics-control-height: 42px;
$statistics-control-radius: 6px;

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
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;

  .filter-row-top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .filter-row-bottom {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .filter-actions {
    margin-left: auto;
    display: flex;
    gap: 12px;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  .filter-item {
    width: 130px;
  }

  .input-item {
    width: 160px;
  }

  .date-picker-large {
    width: 280px !important;
    max-width: 280px !important;
    flex: 0 0 280px !important;
  }

  :deep(.el-date-editor.date-picker-large) {
    width: 280px !important;
    max-width: 280px !important;
    flex: 0 0 280px !important;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor.el-input__wrapper),
  :deep(.el-date-editor.el-input) {
    min-height: $statistics-control-height;
    border-radius: $statistics-control-radius;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dfe8f2 inset;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-range-input),
  :deep(.el-range-separator) {
    height: $statistics-control-height;
    line-height: $statistics-control-height;
  }

  .export-btn {
    height: $statistics-control-height;
    border-radius: $statistics-control-radius;
    background-color: #00B3ED;
    border-color: #00B3ED;
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

  .chart-legends {
    display: flex;
    gap: 20px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #666;
  }

  .legend-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;

    &.theme {
      background-color: #00B3ED;
    }
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
  /* offset for x axis */
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
