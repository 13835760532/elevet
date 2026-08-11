<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter v-model:range-type="dateRangeType" v-model:date-range="dateRange" description="快速检测统计周期"
      @search="handleSearch" @reset="handleReset">
      <template v-if="canViewAreaRange" #extra>
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
          <el-input v-model="filters.taskKeyword" placeholder="任务名称/任务编号" class="filter-item input-item" clearable />
          <el-select v-model="filters.type" placeholder="全部类型" class="filter-item">
            <el-option label="自主检测" value="1" />
            <el-option label="任务检测" value="2" />
          </el-select>
          <el-input v-model="filters.sample" placeholder="样品名称" class="filter-item" clearable />
          <el-select v-model="filters.category" placeholder="产品分类" class="filter-item" clearable>
            <el-option v-for="item in productCategoryOptions" :key="item.value" :label="item.label"
              :value="item.value" />
          </el-select>
          <AreaCascader v-model="detectionAreaIds" placeholder="检测地区" checkStrictly :root-area-code="userDeptAreaCode"
            class="filter-item" @select="handleDetectionAreaSelect" @change="handleDetectionAreaChange" />
          <el-select v-if="canViewAreaRange" v-model="filters.org" placeholder="检测机构" class="filter-item"></el-select>
          <el-input v-else :model-value="currentDeptName" placeholder="检测机构" class="filter-item" disabled />
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
            <el-button type="primary" class="search-btn" @click="searchTable">查询</el-button>
            <el-button class="reset-btn" @click="resetResultFilters">重置</el-button>
            <el-button type="primary" class="export-btn" @click="handleExport" :loading="exportLoading">导出</el-button>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container" style="display: flex; gap: 14px; margin-bottom: 16px;">
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
import { useDebounceFn } from '@vueuse/core'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import type { StatisticsDataScope } from '../statisticsTabs'
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
  createLineSeries,
  createCategoryAxis,
  createChartGrid,
  createChartTooltip,
  createValueAxis,
  formatNumber,
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
import dayjs from 'dayjs'

const props = withDefaults(
  defineProps<{
    queryDeptScope?: number
    selfDetection?: boolean
    dataScope?: StatisticsDataScope
  }>(),
  {
    queryDeptScope: 0,
    selfDetection: undefined,
    dataScope: 'SELF_ORG'
  }
)

const route = useRoute()

/** 从路由查询参数恢复快检筛选条件，支持其他业务页面带条件跳转。 */
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
const detectionAreaIds = ref<string[]>([])
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
  taskKeyword: '',
  type: '',
  sample: '',
  category: '',
  area: '',
  org: '',
  result: '',
  date: []
})

const currentUserDeptInfo = computed(() => getCurrentUserDeptInfo())
const canViewAreaRange = computed(() => isCurrentUserRegulatoryDept())
const currentDeptName = computed(() => currentUserDeptInfo.value.name || '')

const userDeptAreaCode = computed(() => getUserDeptAreaParams().areaCode)

const effectiveSelfDetection = computed(() => {
  if (props.selfDetection !== undefined) return props.selfDetection
  if (filters.type === '1') return true
  if (filters.type === '2') return false
  return undefined
})

const dashboardQueryParams = computed(() => ({
  ...buildRangeParams(dateRangeType.value, dateRange.value),
  ...getEffectiveAreaParams(canViewAreaRange.value ? areaParams : undefined),
  queryDeptScope: props.queryDeptScope,
  dataScope: props.dataScope,
  selfDetection: props.selfDetection,
  detectionOrgName: canViewAreaRange.value ? undefined : currentDeptName.value || undefined
}))



const sampleTrendOption = computed(() => {
  const xAxis = selfTrend.value.xaxis?.length
    ? selfTrend.value.xaxis
    : positiveTrend.value.xaxis || []
  return {
    grid: createChartGrid({ top: 24 }),
    tooltip: createChartTooltip('axis'),
    xAxis: createCategoryAxis(xAxis),
    yAxis: createValueAxis(),
    series: [
      createLineSeries({
        name: '样品量',
        data: selfTrend.value.sampleCounts || [],
        color: statisticsChartColors.primary,
        areaColor: statisticsChartColors.primarySoft
      })
    ]
  }
})

const positiveTrendOption = computed(() => {
  const xAxis = selfTrend.value.xaxis?.length
    ? selfTrend.value.xaxis
    : positiveTrend.value.xaxis || []
  return {
    grid: createChartGrid({ top: 24 }),
    tooltip: createChartTooltip('axis', {
      valueFormatter: (value: any) => value + '%'
    }),
    xAxis: createCategoryAxis(xAxis),
    yAxis: createValueAxis('', {
      min: 0,
      max: 100,
      interval: 25,
      axisLabel: {
        formatter: '{value}%'
      }
    }),
    series: [
      createLineSeries({
        name: '阳性率',
        data: positiveTrend.value.positiveRates || [],
        color: statisticsChartColors.green,
        areaColor: statisticsChartColors.greenSoft
      })
    ]
  }
})

/**\n * handleAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAreaSelect = (area: any) => {
  if (!canViewAreaRange.value) return
  Object.assign(areaParams, getSelectedAreaParams(area))
}

/**\n * handleAreaChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAreaChange = (value: any) => {
  if (!canViewAreaRange.value) return
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    areaParams.provinceName = ''
    areaParams.cityName = ''
    areaParams.areaType = ''
    areaParams.areaCode = ''
  }
}

/**\n * handleDetectionAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDetectionAreaSelect = (area: any) => {
  filters.area = area?.district || area?.city || area?.province || ''
}

/**\n * isEmptyCascaderValue：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const isEmptyCascaderValue = (value: any) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

/**\n * clearDetectionAreaFilter：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const clearDetectionAreaFilter = () => {
  filters.area = ''
  searchTable()
}

/**\n * handleDetectionAreaChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDetectionAreaChange = (value: any) => {
  if (isEmptyCascaderValue(value)) {
    clearDetectionAreaFilter()
  }
}

/** 解析接口可能返回的 JSON、数组或文本检测项，统一生成表格展示字符串。 */
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

/**\n * getResultLabel：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getResultLabel = (value: any) => {
  if (value === 0) return '阴性'
  if (value === 1) return '阳性'
  if (value === 2) return '结果异常'
  return '--'
}

/**\n * mapRecordRow：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const mapRecordRow = (item: any) => ({
  taskNo: item.taskCode || item.recordCode || '--',
  taskName: item.taskName || item.task?.taskName || item.planName || '--',
  recordCode: item.taskCode || item.recordCode || '--',
  keyword: item.recordCode || '--',
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

/** 并行加载快检概览、样品趋势和阳性率趋势图表数据。 */
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

/**
 * 组装快检列表查询参数。
 *
 * 合并顶部时间/地区范围、二级筛选、机构权限和自主/任务检测入口条件。
 */
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

  const areaQueryParams = canViewAreaRange.value ? getEffectiveAreaParams(areaParams) : {}
  const detectionOrgName = canViewAreaRange.value ? filters.org : currentDeptName.value

  return {
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    ...areaQueryParams,
    taskKeyword: filters.taskKeyword || undefined,
    sampleName: filters.sample || undefined,
    productCategory: filters.category || undefined,
    detectionArea: filters.area || undefined,
    detectionOrgName: detectionOrgName || undefined,
    overallResult: filters.result !== '' ? filters.result : undefined,
    queryDeptScope: props.queryDeptScope,
    dataScope: props.dataScope,
    selfDetection: effectiveSelfDetection.value,
    detectionDate
  }
}

/**\n * formatExportDate：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatExportDate = (dateVal: any, isEnd: boolean) => {
  if (!dateVal) return undefined
  const d = dayjs(dateVal)
  if (!d.isValid()) return undefined
  return isEnd ? d.endOf('day').format('YYYY-MM-DD HH:mm:ss') : d.startOf('day').format('YYYY-MM-DD HH:mm:ss')
}

/** 组装导出参数，并将日期范围扩展到起止日完整时刻。 */
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

  const areaQueryParams = canViewAreaRange.value ? getEffectiveAreaParams(areaParams) : {}
  const detectionOrgName = canViewAreaRange.value ? filters.org : currentDeptName.value

  return {
    ...areaQueryParams,
    taskKeyword: filters.taskKeyword || undefined,
    sampleName: filters.sample || undefined,
    productCategory: filters.category || undefined,
    detectionArea: filters.area || undefined,
    detectionOrgName: detectionOrgName || undefined,
    overallResult: filters.result !== '' ? filters.result : undefined,
    queryDeptScope: props.queryDeptScope,
    dataScope: props.dataScope,
    selfDetection: effectiveSelfDetection.value,
    detectionDate
  }
}

/** 加载快检分页并将接口记录标准化为表格行。 */
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

const searchTable = useDebounceFn(() => {
  pageNo.value = 1
  loadTable()
}, 300)

/**\n * loadData：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。\n */
const loadData = () => {
  loadDashboardData()
  loadTable()
}

/**\n * handleSearch：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSearch = () => {
  pageNo.value = 1
  loadData()
}

/**\n * resetResultFilters：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const resetResultFilters = () => {
  filters.taskKeyword = ''
  filters.type = ''
  filters.sample = ''
  filters.category = ''
  filters.area = ''
  detectionAreaIds.value = []
  filters.org = ''
  filters.result = ''
  filters.date = []
  handleSearch()
}

/**\n * handleReset：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
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

/** 用户确认后按当前全部筛选条件导出快速检测记录。 */
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

watch(areaParams, () => {
  pageNo.value = 1
  loadData()
})

watch(
  () => [props.queryDeptScope, props.selfDetection, props.dataScope],
  () => {
    pageNo.value = 1
    loadData()
  }
)

watch(
  detectionAreaIds,
  (value) => {
    if (isEmptyCascaderValue(value)) {
      clearDetectionAreaFilter()
    }
  },
  { deep: true }
)

watch(
  canViewAreaRange,
  (canView) => {
    if (canView) return
    areaIds.value = []
    areaParams.provinceName = ''
    areaParams.cityName = ''
    areaParams.areaType = ''
    areaParams.areaCode = ''
    filters.org = ''
  },
  { immediate: true }
)

watch(
  () => ({
    taskKeyword: filters.taskKeyword,
    type: filters.type,
    sample: filters.sample,
    category: filters.category,
    area: filters.area,
    org: filters.org,
    result: filters.result,
    date: Array.isArray(filters.date) ? [...filters.date] : filters.date
  }),
  () => {
    searchTable()
  },
  { deep: true }
)

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
  margin-bottom: 14px;
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
  gap: 12px;
  margin-bottom: 16px;

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

  .search-btn,
  .reset-btn,
  .export-btn {
    height: $statistics-control-height;
    border-radius: $statistics-control-radius;
  }

  .search-btn,
  .export-btn {
    background-color: #00B3ED;
    border-color: #00B3ED;
  }
}

/* 图表区域 */
.chart-area-wrapper {
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 14px;

  .chart-y-title {
    position: absolute;
    left: 0;
    font-size: 14px;
    color: #333;
    font-weight: bold;
  }

  .chart-legends {
    display: flex;
    gap: 14px;
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
