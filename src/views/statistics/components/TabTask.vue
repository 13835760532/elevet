<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter v-model:range-type="dateRangeType" v-model:date-range="dateRange" description="检测任务统计周期"
      @search="handleSearch" @reset="handleReset">
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
            <div class="card-title">已发任务量</div>
            <div class="card-value">{{ formatNumber((overview as any).taskCount || total) }} <span class="unit">个</span>
            </div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务已下发（总检测量）</div>
            <div class="card-value">{{ formatNumber(overview.taskIssuedCount) }} <span class="unit">项次</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务已完成（总检测量）</div>
            <div class="card-value">{{ formatNumber(overview.taskCompletedCount) }} <span class="unit">项次</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成率（已完成/已下发）</div>
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
          <span class="t-tab" :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'">检测任务</span>
          <span class="t-divider">|</span>
          <span class="t-tab" :class="{ active: activeTab === 'result' }" @click="activeTab = 'result'">检测结果</span>
        </div>
        <el-button type="primary" class="export-btn" @click="handleExport" :loading="exportLoading">导出</el-button>
      </div>
      <div class="table-container">
        <el-table v-if="activeTab === 'task'" v-loading="loading" :data="filteredTableData" style="width: 100%"
          empty-text="暂无任务检测分析数据">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="taskNo" label="任务编号" align="center" />
          <el-table-column prop="taskName" label="任务名称" align="center" show-overflow-tooltip />
          <el-table-column prop="unit" label="承检单位" align="center" />
          <el-table-column prop="issued" label="任务下达" align="center" />
          <el-table-column prop="completed" label="任务完成" align="center" />
          <el-table-column prop="rate" label="当前完成率" align="center" />
        </el-table>

        <!-- 检测结果筛选区 -->
        <div class="result-filters" v-if="activeTab === 'result'">
          <el-input v-model="resultFilters.keyword" placeholder="任务名称/任务编号" class="filter-item input-item" clearable />
          <el-input v-model="resultFilters.sample" placeholder="样品" class="filter-item input-item" clearable />
          <el-select v-model="resultFilters.category" placeholder="产品分类" class="filter-item" clearable>
            <el-option v-for="item in productCategoryOptions" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
          <AreaCascader v-if="canViewAreaRange" v-model="resultFilters.area" placeholder="检测地区" checkStrictly
            :root-area-code="userDeptAreaCode" class="filter-item" style="width: 150px" @select="handleResultAreaSelect"
            @change="handleResultAreaChange" />
          <el-select v-if="canViewAreaRange" v-model="resultFilters.org" placeholder="检测机构" class="filter-item" clearable></el-select>
          <el-input v-else :model-value="currentDeptName" placeholder="检测机构" class="filter-item" disabled />
          <el-select v-model="resultFilters.result" placeholder="检测结果" class="filter-item" clearable>
            <el-option label="阴性" :value="0" />
            <el-option label="阳性" :value="1" />
            <el-option label="结果异常" :value="2" />
          </el-select>
        </div>

        <!-- 检测结果趋势图 -->
        <div class="chart-container" v-if="activeTab === 'result' && trendOption">
          <div class="chart-title">检测量</div>
          <Echart :options="trendOption" height="320px" />
        </div>

        <el-table v-if="activeTab === 'result'" v-loading="resultLoading" :data="resultTableData" style="width: 100%"
          empty-text="暂无检测结果数据">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="recordCode" label="任务编号" align="center" width="100" />
          <el-table-column prop="taskName" label="任务名称" align="center" show-overflow-tooltip min-width="120" />
          <el-table-column prop="sampleNo" label="样品编号" align="center" width="120" />
          <el-table-column prop="sampleName" label="样品名称" align="center" width="80" />
          <el-table-column prop="category" label="产品分类" align="center" width="80" />
          <el-table-column prop="origin" label="产地" align="center" width="100" />
          <el-table-column prop="subject" label="被检主体" align="center" width="120" show-overflow-tooltip />
          <el-table-column prop="inspectArea" label="抽检地区" align="center" width="100" />
          <el-table-column prop="inspectOrg" label="抽检机构" align="center" width="120" show-overflow-tooltip />
          <el-table-column prop="time" label="检测时间" align="center" width="100" />
          <el-table-column prop="resultLabel" label="检测结果" align="center" width="80" />
          <el-table-column prop="statusText" label="检测状态" align="center" width="80" />
        </el-table>

        <div class="pagination-container" v-if="activeTab === 'task'">
          <div class="total-text">合计：{{ total }}条</div>
          <el-pagination v-model:current-page="pageNo" v-model:page-size="pageSize" background
            layout="prev, pager, next" :total="total" @current-change="loadTaskPage" />
        </div>

        <div class="pagination-container" v-if="activeTab === 'result'">
          <div class="total-text">合计：{{ resultTotal }}条</div>
          <el-pagination v-model:current-page="resultPageNo" v-model:page-size="resultPageSize" background
            layout="prev, pager, next" :total="resultTotal" @current-change="loadResultPage" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useDebounceFn } from '@vueuse/core'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import Echart from '@/components/Echart/src/Echart.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import { useDict } from '@/hooks/web/useDict'
import {
  getTaskAnalysisPage,
  getTaskOverview,
  getTaskVolumeTrend,
  type DashboardTaskOverviewRespVO,
  type TaskAnalysisRespVO
} from '@/api/agri/dashboard/task'
import * as DetectionRecordApi from '@/api/agri/detectionRecord'
import * as DetectionTaskApi from '@/api/agri/detectionTask'
import {
  buildRangeParams,
  createCategoryAxis,
  createChartGrid,
  createChartTooltip,
  createLineSeries,
  createValueAxis,
  formatNumber,
  formatPercent,
  getCurrentUserDeptInfo,
  getEffectiveAreaParams,
  getSelectedAreaParams,
  getUserDeptAreaParams,
  isCurrentUserRegulatoryDept,
  normalizePagedResult,
  statisticsChartColors
} from './statisticsData'
import { ElMessage, ElMessageBox } from 'element-plus'
import download from '@/utils/download'

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const keyword = ref('')
const activeTab = ref('task')

const productCategoryOptions = useDict('agri_product_category', 'str').options
const resultFilters = ref({
  keyword: '',
  sample: '',
  category: '',
  area: [] as any,
  areaType: '',
  areaCode: '',
  org: '',
  result: ''
})
const handleResultAreaSelect = (area: any) => {
  if (!canViewAreaRange.value) return
  const selectedArea = getSelectedAreaParams(area)
  resultFilters.value.area = [area.province, area.city, area.district].filter(Boolean).join('-')
  resultFilters.value.areaType = selectedArea.areaType
  resultFilters.value.areaCode = selectedArea.areaCode
}
const handleResultAreaChange = (value: any) => {
  if (!canViewAreaRange.value) return
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    resultFilters.value.area = []
    resultFilters.value.areaType = ''
    resultFilters.value.areaCode = ''
  }
}
const trendOption = ref<any>(null)
const overview = ref<DashboardTaskOverviewRespVO>({})
const tableData = ref<TaskAnalysisRespVO[]>([])
const total = ref(0)
const pageNo = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const resultTableData = ref<any[]>([])
const resultTotal = ref(0)
const resultPageNo = ref(1)
const resultPageSize = ref(10)
const resultLoading = ref(false)
const exportLoading = ref(false)

const currentUserDeptInfo = computed(() => getCurrentUserDeptInfo())
const canViewAreaRange = computed(() => isCurrentUserRegulatoryDept())
const currentDeptId = computed(() => currentUserDeptInfo.value.id)
const currentDeptName = computed(() => currentUserDeptInfo.value.name || '')

const userDeptAreaCode = computed(() => getUserDeptAreaParams().areaCode)
const currentQueryParams = computed(() => ({
  ...buildRangeParams(dateRangeType.value, dateRange.value),
  ...getEffectiveAreaParams(),
  deptId: canViewAreaRange.value ? undefined : currentDeptId.value || undefined
}))

const filteredTableData = computed(() => {
  const keywordValue = keyword.value.trim()
  const source = tableData.value.map((item) => ({
    taskNo: item.taskCode || item.taskNo || (item.taskId ? String(item.taskId) : '--'),
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
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...currentQueryParams.value
    })
    const normalized = normalizePagedResult<TaskAnalysisRespVO>(data)
    tableData.value = normalized.list || []
    total.value = normalized.total || 0
  } catch (error) {
    console.error('[StatisticsTask] load page failed:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const buildResultTableQuery = () => {
  const queryParams = { ...currentQueryParams.value } as any
  const detectionDate = queryParams.startDate && queryParams.endDate ? [
    dayjs(queryParams.startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(queryParams.endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ] : undefined

  delete queryParams.startDate
  delete queryParams.endDate

  const areaType = canViewAreaRange.value ? resultFilters.value.areaType || currentQueryParams.value.areaType : undefined
  const areaCode = canViewAreaRange.value ? resultFilters.value.areaCode || currentQueryParams.value.areaCode : undefined
  const detectionOrgName = canViewAreaRange.value ? resultFilters.value.org : currentDeptName.value

  return {
    pageNo: resultPageNo.value,
    pageSize: resultPageSize.value,
    ...queryParams,
    recordCode: resultFilters.value.keyword || undefined,
    sampleName: resultFilters.value.sample || undefined,
    productCategory: resultFilters.value.category || undefined,
    detectionArea: typeof resultFilters.value.area === 'string' ? resultFilters.value.area : undefined,
    areaType,
    areaCode,
    detectionOrgName: detectionOrgName || undefined,
    overallResult: resultFilters.value.result !== '' ? resultFilters.value.result : undefined,
    selfDetection: 'false',
    detectionDate
  }
}

const buildResultExportQuery = () => {
  const queryParams = { ...currentQueryParams.value } as any
  const detectionDate = queryParams.startDate && queryParams.endDate ? [
    dayjs(queryParams.startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(queryParams.endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ] : undefined

  delete queryParams.startDate
  delete queryParams.endDate

  const areaType = canViewAreaRange.value ? resultFilters.value.areaType || currentQueryParams.value.areaType : undefined
  const areaCode = canViewAreaRange.value ? resultFilters.value.areaCode || currentQueryParams.value.areaCode : undefined
  const detectionOrgName = canViewAreaRange.value ? resultFilters.value.org : currentDeptName.value

  return {
    ...queryParams,
    recordCode: resultFilters.value.keyword || undefined,
    sampleName: resultFilters.value.sample || undefined,
    productCategory: resultFilters.value.category || undefined,
    detectionArea: typeof resultFilters.value.area === 'string' ? resultFilters.value.area : undefined,
    areaType,
    areaCode,
    detectionOrgName: detectionOrgName || undefined,
    overallResult: resultFilters.value.result !== '' ? resultFilters.value.result : undefined,
    selfDetection: 'false',
    detectionDate
  }
}

const loadResultPage = async () => {
  resultLoading.value = true
  try {
    const data = await DetectionRecordApi.getDetectionRecordPage(buildResultTableQuery())
    const normalized = normalizePagedResult<any>(data)
    resultTableData.value = (normalized.list || []).map(item => ({
      ...item,
      taskNo: item.taskCode || item.task?.taskCode || (item.taskId ? String(item.taskId) : '--'),
      taskName: item.taskName || item.task?.taskName || '--',
      sampleNo: item.sampleCode || item.recordCode || '--',
      sampleName: item.productName || item.sampleName || '--',
      category: item.productCategory ? productCategoryOptions.value?.find(o => o.value === item.productCategory)?.label || item.productCategory : '--',
      origin: item.sampleArea || item.productionArea || item.sample?.productionArea || '--',
      subject: item.subjectName || '--',
      inspectArea: item.detectionArea || '--',
      inspectOrg: item.detectionOrgName || '--',
      time: item.detectionDate ? String(item.detectionDate).slice(0, 10) : '--',
      resultLabel: item.overallResult === 0 ? '阴性' : item.overallResult === 1 ? '阳性' : item.overallResult === 2 ? '结果异常' : '--',
      statusText: item.status === 1 ? '已检测' : (item.status === 0 ? '未检测' : '失败')
    }))
    resultTotal.value = normalized.total || 0
  } catch (error) {
    console.error('[StatisticsTask] load result page failed:', error)
    resultTableData.value = []
    resultTotal.value = 0
  } finally {
    resultLoading.value = false
  }
}

const searchResultPage = useDebounceFn(() => {
  if (activeTab.value !== 'result') return
  resultPageNo.value = 1
  loadResultPage()
}, 300)

const loadTrend = async () => {
  try {
    const data = await getTaskVolumeTrend(currentQueryParams.value)
    if (data && data.xaxis) {
      trendOption.value = {
        grid: createChartGrid({ top: 46, right: 24 }),
        tooltip: createChartTooltip('axis'),
        legend: {
          data: ['样品量', '检测量'],
          top: 0,
          right: 20,
          icon: 'circle',
          itemWidth: 9,
          itemHeight: 9,
          textStyle: {
            color: statisticsChartColors.muted,
            fontSize: 12
          }
        },
        xAxis: createCategoryAxis(data.xaxis),
        yAxis: createValueAxis(),
        series: [
          createLineSeries({
            name: '样品量',
            data: data.sampleCounts || [],
            color: statisticsChartColors.purple,
            areaColor: statisticsChartColors.purpleSoft
          }),
          createLineSeries({
            name: '检测量',
            data: data.itemCounts || [],
            color: statisticsChartColors.yellow,
            areaColor: statisticsChartColors.yellowSoft
          })
        ]
      }
    } else {
      trendOption.value = null
    }
  } catch (error) {
    console.error('Failed to load trend:', error)
    trendOption.value = null
  }
}

const handleSearch = () => {
  pageNo.value = 1
  resultPageNo.value = 1
  loadOverview()
  if (activeTab.value === 'task') {
    loadTaskPage()
  } else {
    loadTrend()
    loadResultPage()
  }
}

const handleReset = () => {
  dateRangeType.value = '当年'
  dateRange.value = []
  keyword.value = ''
  handleSearch()
}

const handleExport = async () => {
  if (activeTab.value === 'task') {
    try {
      await ElMessageBox.confirm('确定要导出检测任务数据吗？', '导出确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      exportLoading.value = true
      const params: any = {
        ...currentQueryParams.value,
        taskName: keyword.value ? keyword.value.trim() : undefined
      }
      if (params.startDate) {
        params.startDate = `${params.startDate} 00:00:00`
      }
      if (params.endDate) {
        params.endDate = `${params.endDate} 23:59:59`
      }
      const data = await DetectionTaskApi.exportDetectionTask(params)
      download.excel(data, '检测任务.xls')
      ElMessage.success('导出成功')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('导出检测任务失败：', error)
        ElMessage.error('导出失败')
      }
    } finally {
      exportLoading.value = false
    }
  } else if (activeTab.value === 'result') {
    try {
      await ElMessageBox.confirm('确定要导出检测结果数据吗？', '导出确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      exportLoading.value = true
      const params = buildResultExportQuery()
      const data = await DetectionRecordApi.exportDetectionRecord(params)
      download.excel(data, '检测结果.xls')
      ElMessage.success('导出成功')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('导出检测结果失败：', error)
        ElMessage.error('导出失败')
      }
    } finally {
      exportLoading.value = false
    }
  }
}

watch([dateRangeType, dateRange], () => {
  handleSearch()
})

watch(
  canViewAreaRange,
  (canView) => {
    if (canView) return
    resultFilters.value.area = []
    resultFilters.value.areaType = ''
    resultFilters.value.areaCode = ''
    resultFilters.value.org = ''
  },
  { immediate: true }
)

watch(
  () => ({
    keyword: resultFilters.value.keyword,
    sample: resultFilters.value.sample,
    category: resultFilters.value.category,
    area: Array.isArray(resultFilters.value.area)
      ? [...resultFilters.value.area]
      : resultFilters.value.area,
    areaType: resultFilters.value.areaType,
    areaCode: resultFilters.value.areaCode,
    org: resultFilters.value.org,
    result: resultFilters.value.result
  }),
  () => {
    searchResultPage()
  },
  { deep: true }
)

watch(activeTab, (val) => {
  if (val === 'task') {
    loadTaskPage()
  } else {
    loadTrend()
    loadResultPage()
  }
})

onMounted(() => {
  handleSearch()
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

.result-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;

  .filter-item {
    width: 140px;

    &.input-item {
      width: 160px;
    }
  }
}

.chart-container {
  margin-bottom: 20px;
  background: #fff;
  padding: 10px 0;

  .chart-title {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    margin-bottom: 10px;
    padding-left: 10px;
  }
}
</style>
