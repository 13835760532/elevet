<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter v-model:range-type="dateRangeType" v-model:date-range="dateRange" description="建档备案统计周期"
      @search="handleRangeSearch" @reset="handleRangeReset">
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
            <div class="card-title">样品档案量</div>
            <div class="card-value">
              {{ formatNumber(overview.productArchiveCount) }} <span class="unit">个</span>
            </div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">主体档案量 (生产经营企业或个人)</div>
            <div class="card-value">
              {{ formatNumber(overview.subjectArchiveCount) }} <span class="unit">个</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体建档 -->
    <div class="card-section">
      <div class="section-title">主体建档</div>

      <!-- 第二层筛选 -->
      <div class="result-filters">
        <el-input v-model="filtersSubject.name" placeholder="主体名称" class="filter-item input-item" clearable />
        <el-select v-model="filtersSubject.filingType" placeholder="建档类型" class="filter-item" clearable>
          <el-option v-for="dict in filingTypeOptions" :key="String(dict.value)" :label="dict.label"
            :value="dict.value" />
        </el-select>
        <el-select v-model="filtersSubject.subjectType" placeholder="主体类型" class="filter-item" clearable>
          <el-option v-for="dict in categoryOptions" :key="String(dict.value)" :label="dict.label"
            :value="dict.value" />
        </el-select>
        <AreaCascader v-model="filtersSubject.region" placeholder="所属地区" checkStrictly
          :root-area-code="userDeptAreaCode" class="filter-item area-filter" @select="handleSubjectAreaSelect"
          @change="handleSubjectAreaChange" />
        <div class="filter-actions">
          <el-button type="primary" class="search-btn" @click="handleSubjectSearch">查询</el-button>
          <el-button class="reset-btn" @click="handleSubjectReset">重置</el-button>
          <el-button type="primary" class="export-btn" :loading="subjectExportLoading" @click="handleSubjectExport">
            导出
          </el-button>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <div class="chart-area-wrapper">
          <div class="chart-header">
            <span class="chart-y-title">主体建档地区</span>
          </div>
          <Echart :options="subjectAreaOption" height="320px" />
        </div>
        <div class="chart-area-wrapper">
          <div class="chart-header">
            <span class="chart-y-title">主体类型占比</span>
          </div>
          <Echart :options="subjectTypeOption" height="320px" />
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table v-loading="subjectLoading" :data="tableDataSubject" style="width: 100%" border
          header-cell-class-name="custom-header" empty-text="暂无主体建档记录">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" align="center" min-width="180" show-overflow-tooltip>
            <template #header>
              <div>主体代码</div>
              <div style="font-size: 12px; font-weight: normal; color: #909399; margin-top: 2px;">(企业信用代码/身份证)</div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="主体名称" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="filingType" label="建档类型" align="center" width="120" />
          <el-table-column prop="subjectType" label="主体类型" align="center" width="100" />
          <el-table-column prop="mainProduct" label="主营产品" align="center" min-width="140" show-overflow-tooltip />
          <el-table-column prop="region" label="所属地区" align="center" min-width="160" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" align="center" width="120" />
          <el-table-column prop="createOrg" label="创建机构" align="center" min-width="140" show-overflow-tooltip />
        </el-table>

        <div class="pagination-container">
          <div class="total-text">合计：{{ subjectTotal }}条</div>
          <el-pagination v-model:current-page="subjectPageNo" v-model:page-size="subjectPageSize" background
            layout="prev, pager, next" :total="subjectTotal" @current-change="loadSubjectTable" />
        </div>
      </div>
    </div>

    <!-- 产品建档 -->
    <div class="card-section">
      <div class="section-title">产品建档</div>

      <!-- 第二层筛选 -->
      <div class="result-filters">
        <el-input v-model="filtersProduct.productCode" placeholder="产品编码" class="filter-item input-item" clearable />
        <el-input v-model="filtersProduct.productName" placeholder="产品名称" class="filter-item" clearable />
        <el-input v-model="filtersProduct.subjectName" placeholder="主体名称" class="filter-item" clearable />
        <AreaCascader v-model="filtersProduct.region" placeholder="产品产地" checkStrictly
          :root-area-code="userDeptAreaCode" class="filter-item area-filter" @select="handleProductAreaSelect"
          @change="handleProductAreaChange" />
        <div class="filter-actions">
          <el-button type="primary" class="search-btn" @click="handleProductSearch">查询</el-button>
          <el-button class="reset-btn" @click="handleProductReset">重置</el-button>
          <el-button type="primary" class="export-btn" :loading="productExportLoading" @click="handleProductExport">
            导出
          </el-button>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <div class="chart-area-wrapper">
          <div class="chart-header">
            <span class="chart-y-title">产品建档趋势</span>
          </div>
          <Echart :options="productTrendOption" height="320px" />
        </div>
        <div class="chart-area-wrapper">
          <div class="chart-header">
            <span class="chart-y-title">产品品类分布</span>
          </div>
          <Echart :options="productCategoryOption" height="320px" />
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table v-loading="productLoading" :data="tableDataProduct" style="width: 100%" border
          header-cell-class-name="custom-header" empty-text="暂无产品建档记录">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="产品编码" align="center" min-width="160" show-overflow-tooltip />
          <el-table-column prop="name" label="产品名称" align="center" width="100" show-overflow-tooltip />
          <el-table-column prop="category" label="产品类别" align="center" width="100" />
          <el-table-column prop="origin" label="产品产地" align="center" width="120" show-overflow-tooltip />
          <el-table-column prop="subjectName" label="主体名称" align="center" min-width="160" show-overflow-tooltip />
          <el-table-column prop="filingDate" label="建档日期" align="center" width="120" />
          <el-table-column prop="deptName" label="创建机构" align="center" min-width="140" show-overflow-tooltip />
        </el-table>

        <div class="pagination-container">
          <div class="total-text">合计：{{ productTotal }}条</div>
          <el-pagination v-model:current-page="productPageNo" v-model:page-size="productPageSize" background
            layout="prev, pager, next" :total="productTotal" @current-change="loadProductTable" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useDebounceFn } from '@vueuse/core'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import { Echart } from '@/components/Echart'
import {
  getArchiveOverview,
  getArchiveProductCategoryDistribution,
  getArchiveProductTrend,
  getArchiveSubjectAreaTop10,
  getArchiveSubjectTypeDistribution,
  type DashboardArchiveOverviewRespVO,
  type DashboardArchiveProductCategoryRespVO,
  type DashboardArchiveProductTrendRespVO,
  type DashboardArchiveSubjectAreaRespVO,
  type DashboardArchiveSubjectTypeRespVO
} from '@/api/agri/dashboard/archive'
import * as ProductApi from '@/api/agri/product'
import * as SubjectApi from '@/api/agri/subject'
import {
  buildRangeParams,
  createBarSeries,
  createCategoryAxis,
  createChartGrid,
  createChartTooltip,
  createLineSeries,
  createPieSeries,
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
import { useDict } from '@/hooks/web/useDict'
import download from '@/utils/download'

const props = withDefaults(
  defineProps<{
    queryDeptScope?: number
  }>(),
  {
    queryDeptScope: 0
  }
)

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const areaIds = ref<string[]>([])
const areaParams = reactive({
  provinceName: '',
  cityName: '',
  districtName: '',
  areaType: '',
  areaCode: ''
})
const overview = ref<DashboardArchiveOverviewRespVO>({})
const productTrend = ref<DashboardArchiveProductTrendRespVO>({})
const productCategoryDistribution = ref<DashboardArchiveProductCategoryRespVO[]>([])
const subjectTypeDistribution = ref<DashboardArchiveSubjectTypeRespVO[]>([])
const subjectAreaTop = ref<DashboardArchiveSubjectAreaRespVO[]>([])

const subjectLoading = ref(false)
const productLoading = ref(false)
const subjectExportLoading = ref(false)
const productExportLoading = ref(false)
const tableDataSubject = ref<any[]>([])
const tableDataProduct = ref<any[]>([])
const subjectTotal = ref(0)
const productTotal = ref(0)
const subjectPageNo = ref(1)
const subjectPageSize = ref(10)
const productPageNo = ref(1)
const productPageSize = ref(10)

const { options: categoryOptions, getLabel: getCategoryLabel } = useDict(
  'agri_subject_category',
  'str'
)
const { options: filingTypeOptions, getLabel: getFilingTypeLabel } = useDict(
  'agri_filing_type',
  'int'
)
const { getLabel: getProductCategoryLabel } = useDict('agri_product_category', 'str')

const filtersSubject = reactive({
  name: '',
  filingType: undefined as number | string | undefined,
  subjectType: undefined as number | string | undefined,
  region: [] as string[]
})

const filtersProduct = reactive({
  productCode: '',
  productName: '',
  subjectName: '',
  region: [] as string[]
})

const subjectAreaNames = ref<string[]>([])
const productAreaNames = ref<string[]>([])

const currentUserDeptInfo = computed(() => getCurrentUserDeptInfo())
const canViewAreaRange = computed(() => isCurrentUserRegulatoryDept())
const currentDeptId = computed(() => currentUserDeptInfo.value.id)
const currentDeptName = computed(() => currentUserDeptInfo.value.name || '')

const userDeptAreaCode = computed(() => getUserDeptAreaParams().areaCode)

const hasNoPermission = computed(() => props.queryDeptScope === 1)

const dashboardQueryParams = computed(() => ({
  ...buildRangeParams(dateRangeType.value, dateRange.value),
  ...getEffectiveAreaParams(canViewAreaRange.value ? areaParams : undefined),
  queryDeptScope: props.queryDeptScope,
  deptId: canViewAreaRange.value ? undefined : currentDeptId.value || undefined,
  deptName: canViewAreaRange.value ? undefined : currentDeptName.value || undefined
}))

/** 辖区内建档备案无权限时重置所有数据为0并清空列表与图表。 */
const resetAllDataToZero = () => {
  overview.value = {
    productArchiveCount: 0,
    subjectArchiveCount: 0
  } as any
  productTrend.value = {}
  productCategoryDistribution.value = []
  subjectTypeDistribution.value = []
  subjectAreaTop.value = []
  tableDataSubject.value = []
  subjectTotal.value = 0
  tableDataProduct.value = []
  productTotal.value = 0
  subjectLoading.value = false
  productLoading.value = false
}

const globalAreaNames = computed(() =>
  [areaParams.provinceName, areaParams.cityName, areaParams.districtName].filter(Boolean)
)

const archiveProductPalette = [
  statisticsChartColors.primary,
  '#4fc3e6',
  statisticsChartColors.green,
  '#8ddfcd',
  '#acd8ff',
  statisticsChartColors.purple,
  '#b8a8ff',
  statisticsChartColors.yellow
]
const archiveSubjectPalette = [statisticsChartColors.primary, statisticsChartColors.green]

const subjectAreaOption = computed(() => {
  const list = [...subjectAreaTop.value].sort((a, b) => Number(a.rank || 0) - Number(b.rank || 0))
  return {
    grid: createChartGrid({ top: 28, bottom: 52 }),
    tooltip: createChartTooltip('axis'),
    xAxis: createCategoryAxis(
      list.map(
        (item) => item.areaName || item.districtName || item.cityName || item.provinceName || '--'
      ),
      { axisLabel: { color: statisticsChartColors.muted, fontSize: 12, interval: 0, rotate: 22 } }
    ),
    yAxis: createValueAxis(),
    series: [
      createBarSeries({
        name: '主体数',
        data: list.map((item) => Number(item.count || 0)),
        color: statisticsChartColors.primary
      })
    ]
  }
})

const subjectTypeOption = computed(() => ({
  color: archiveSubjectPalette,
  tooltip: createChartTooltip('item'),
  legend: {
    bottom: 0,
    icon: 'circle',
    itemWidth: 9,
    itemHeight: 9,
    textStyle: { color: statisticsChartColors.muted, fontSize: 12 }
  },
  series: [
    createPieSeries({
      name: '主体类型',
      data: subjectTypeDistribution.value.map((item, index) => ({
        name: item.typeName || (item.type !== undefined ? getFilingTypeText(item.type) : '--'),
        value: Number(item.count || 0)
      })),
      colors: archiveSubjectPalette
    })
  ]
}))

const productTrendOption = computed(() => ({
  grid: createChartGrid({ top: 30 }),
  tooltip: createChartTooltip('axis'),
  xAxis: createCategoryAxis(productTrend.value.xaxis || [], { boundaryGap: false }),
  yAxis: createValueAxis(),
  series: [
    createLineSeries({
      name: '产品建档数',
      data: productTrend.value.counts || [],
      color: statisticsChartColors.purple,
      areaColor: statisticsChartColors.purpleSoft
    })
  ]
}))

const productCategoryOption = computed(() => ({
  color: archiveProductPalette,
  tooltip: createChartTooltip('item'),
  legend: {
    bottom: 0,
    icon: 'circle',
    itemWidth: 9,
    itemHeight: 9,
    textStyle: { color: statisticsChartColors.muted, fontSize: 12 }
  },
  series: [
    createPieSeries({
      name: '产品品类',
      data: productCategoryDistribution.value.map((item, index) => ({
        name: getProductCategoryText(item.category),
        value: Number(item.count || 0)
      })),
      colors: archiveProductPalette
    })
  ]
}))

/**\n * isEmptyValue：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const isEmptyValue = (value: any) => value === undefined || value === null || value === ''

/**\n * formatDateText：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatDateText = (value: any) => {
  if (!value) return '--'
  const date = dayjs(value)
  return date.isValid() ? date.format('YYYY-MM-DD') : String(value).slice(0, 10)
}

/**\n * formatAreaText：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatAreaText = (...items: any[]) => items.filter(Boolean).join('/') || '--'

/**\n * getFilingTypeText：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getFilingTypeText = (value: any) => {
  const label = getFilingTypeLabel(value)
  return label === '--' ? value || '--' : label
}

/**\n * getSubjectCategoryText：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getSubjectCategoryText = (value: any) => {
  const label = getCategoryLabel(value)
  return label === '--' ? value || '--' : label
}

/**\n * getProductCategoryText：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getProductCategoryText = (value: any) => {
  const label = getProductCategoryLabel(value)
  return label === '--' ? value || '--' : label
}

/**\n * buildDateTimeRange：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const buildDateTimeRange = () => {
  const { startDate, endDate } = dashboardQueryParams.value
  if (!startDate || !endDate) return undefined
  return [
    dayjs(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ]
}

/**\n * isEmptyCascaderValue：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const isEmptyCascaderValue = (value: any) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

const normalizeArray = <T,>(value: T[] | undefined | null) => (Array.isArray(value) ? value : [])

/**\n * getLastAreaName：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getLastAreaName = (areaNames: string[]) => {
  const effectiveAreaNames = areaNames.filter(Boolean)
  return effectiveAreaNames[effectiveAreaNames.length - 1] || ''
}

/** 将主体所属地区名称转换为后端要求的省市县和行政级别参数。 */
const buildSubjectAreaParams = (areaNames: string[]) => {
  const lastAreaName = getLastAreaName(areaNames)
  const level = areaNames.filter(Boolean).length
  return {
    provinceCode: level === 1 ? lastAreaName : undefined,
    cityCode: level === 2 ? lastAreaName : undefined,
    districtCode: level === 3 ? lastAreaName : undefined
  }
}

/** 将产品产地选择转换为后端查询使用的地区参数。 */
const buildProductAreaParams = (areaNames: string[]) => {
  const lastAreaName = getLastAreaName(areaNames)
  const level = areaNames.filter(Boolean).length
  return {
    productionArea: lastAreaName || undefined,
    provinceCode: level === 1 ? lastAreaName : undefined,
    cityCode: level === 2 ? lastAreaName : undefined,
    districtCode: level === 3 ? lastAreaName : undefined
  }
}

/** 组装主体建档分页/导出查询，合并时间、机构权限和地区筛选。 */
const buildSubjectQuery = (pageNo: number, pageSize: number) => {
  const createTime = buildDateTimeRange()
  const areaNames = subjectAreaNames.value.length ? subjectAreaNames.value : globalAreaNames.value
  return {
    pageNo,
    pageSize,
    deptId: canViewAreaRange.value ? undefined : currentDeptId.value || undefined,
    deptName: canViewAreaRange.value ? undefined : currentDeptName.value || undefined,
    queryDeptScope: props.queryDeptScope,
    name: filtersSubject.name || undefined,
    type: isEmptyValue(filtersSubject.filingType) ? undefined : filtersSubject.filingType,
    category: isEmptyValue(filtersSubject.subjectType) ? undefined : filtersSubject.subjectType,
    ...buildSubjectAreaParams(areaNames),
    createTime,
    beginCreateTime: createTime?.[0],
    endCreateTime: createTime?.[1]
  }
}

/** 组装产品建档分页/导出查询，确保页面选择地区优先于全局地区范围。 */
const buildProductQuery = (pageNo: number, pageSize: number) => {
  const createTime = buildDateTimeRange()
  const areaNames = productAreaNames.value.length ? productAreaNames.value : globalAreaNames.value
  return {
    pageNo,
    pageSize,
    deptId: canViewAreaRange.value ? undefined : currentDeptId.value || undefined,
    deptName: canViewAreaRange.value ? undefined : currentDeptName.value || undefined,
    queryDeptScope: props.queryDeptScope,
    productCode: filtersProduct.productCode || undefined,
    productName: filtersProduct.productName || undefined,
    subjectName: filtersProduct.subjectName || undefined,
    ...buildProductAreaParams(areaNames),
    createTime,
    beginArchiveDate: createTime?.[0],
    endArchiveDate: createTime?.[1]
  }
}

/**\n * handleAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAreaSelect = (area: any) => {
  if (!canViewAreaRange.value) return
  Object.assign(areaParams, {
    ...getSelectedAreaParams(area),
    districtName: area?.district || ''
  })
}

/**\n * handleAreaChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAreaChange = (value: any) => {
  if (!canViewAreaRange.value) return
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    areaParams.provinceName = ''
    areaParams.cityName = ''
    areaParams.districtName = ''
    areaParams.areaType = ''
    areaParams.areaCode = ''
  }
}

/**\n * handleSubjectAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSubjectAreaSelect = (area: any) => {
  subjectAreaNames.value = [area?.province, area?.city, area?.district].filter(Boolean)
}

/**\n * handleSubjectAreaChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSubjectAreaChange = (value: any) => {
  if (isEmptyCascaderValue(value)) {
    subjectAreaNames.value = []
    searchSubjectTable()
  }
}

/**\n * handleProductAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleProductAreaSelect = (area: any) => {
  productAreaNames.value = [area?.province, area?.city, area?.district].filter(Boolean)
}

/**\n * handleProductAreaChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleProductAreaChange = (value: any) => {
  if (isEmptyCascaderValue(value)) {
    productAreaNames.value = []
    searchProductTable()
  }
}

/**\n * mapSubjectRow：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const mapSubjectRow = (item: any) => ({
  code: item.socialCreditCode || item.idCard || '--',
  name: item.name || '--',
  filingType: item.type !== undefined && item.type !== null ? getFilingTypeText(item.type) : '--',
  subjectType: item.category ? getSubjectCategoryText(item.category) : '--',
  mainProduct: item.mainProducts || '--',
  region: formatAreaText(item.provinceCode, item.cityCode, item.districtCode),
  createTime: formatDateText(item.createTime),
  createOrg: item.deptName || item.createDeptName || item.dept?.name || '--'
})

/**\n * mapProductRow：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const mapProductRow = (item: any) => ({
  code: item.productCode || '--',
  name: item.productName || '--',
  category: item.category ? getProductCategoryText(item.category) : '--',
  origin:
    item.productionArea || formatAreaText(item.provinceCode, item.cityCode, item.districtCode),
  subjectName: item.subjectInfo?.name || item.subjectName || '--',
  filingDate: formatDateText(item.archiveDate || item.createTime),
  deptName: item.deptName || '--'
})

/** 并行加载建档概览、地区分布、主体类型和产品趋势等图表数据，无权限时直接置空。 */
const loadDashboardData = async () => {
  if (hasNoPermission.value) {
    overview.value = { productArchiveCount: 0, subjectArchiveCount: 0 } as any
    productTrend.value = {}
    productCategoryDistribution.value = []
    subjectTypeDistribution.value = []
    subjectAreaTop.value = []
    return
  }
  try {
    const [overviewData, productTrendData, productCategoryData, subjectTypeData, subjectAreaData] =
      await Promise.all([
        getArchiveOverview(dashboardQueryParams.value),
        getArchiveProductTrend(dashboardQueryParams.value),
        getArchiveProductCategoryDistribution(dashboardQueryParams.value),
        getArchiveSubjectTypeDistribution(dashboardQueryParams.value),
        getArchiveSubjectAreaTop10(dashboardQueryParams.value)
      ])
    overview.value = overviewData || {}
    productTrend.value = productTrendData || {}
    productCategoryDistribution.value = Array.isArray(productCategoryData)
      ? productCategoryData
      : []
    subjectTypeDistribution.value = Array.isArray(subjectTypeData) ? subjectTypeData : []
    subjectAreaTop.value = Array.isArray(subjectAreaData) ? subjectAreaData : []
  } catch (error) {
    console.error('[StatisticsFiling] load dashboard data failed:', error)
    overview.value = {}
    productTrend.value = {}
    productCategoryDistribution.value = []
    subjectTypeDistribution.value = []
    subjectAreaTop.value = []
  }
}

/** 加载主体建档分页并转换为表格展示结构，无权限时直接置空。 */
const loadSubjectTable = async () => {
  if (hasNoPermission.value) {
    tableDataSubject.value = []
    subjectTotal.value = 0
    subjectLoading.value = false
    return
  }
  subjectLoading.value = true
  try {
    const data = await SubjectApi.getSubjectPage(
      buildSubjectQuery(subjectPageNo.value, subjectPageSize.value)
    )
    const normalized = normalizePagedResult<any>(data)
    tableDataSubject.value = normalized.list.map(mapSubjectRow)
    subjectTotal.value = normalized.total
  } catch (error) {
    console.error('[StatisticsFiling] load subject table failed:', error)
    tableDataSubject.value = []
    subjectTotal.value = 0
  } finally {
    subjectLoading.value = false
  }
}

/** 加载产品建档分页并转换为表格展示结构，无权限时直接置空。 */
const loadProductTable = async () => {
  if (hasNoPermission.value) {
    tableDataProduct.value = []
    productTotal.value = 0
    productLoading.value = false
    return
  }
  productLoading.value = true
  try {
    const data = await ProductApi.getProductPage(
      buildProductQuery(productPageNo.value, productPageSize.value)
    )
    const normalized = normalizePagedResult<any>(data)
    tableDataProduct.value = normalized.list.map(mapProductRow)
    console.log(tableDataProduct.value)
    productTotal.value = normalized.total
  } catch (error) {
    console.error('[StatisticsFiling] load product table failed:', error)
    tableDataProduct.value = []
    productTotal.value = 0
  } finally {
    productLoading.value = false
  }
}

/**
 * loadTables：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。
 */
const loadTables = () => {
  loadSubjectTable()
  loadProductTable()
}

/**
 * loadData：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。
 */
const loadData = () => {
  if (hasNoPermission.value) {
    resetAllDataToZero()
    ElMessage.warning('暂无权限')
    return
  }
  loadDashboardData()
  loadTables()
}

/**
 * handleRangeSearch：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。
 */
const handleRangeSearch = () => {
  subjectPageNo.value = 1
  productPageNo.value = 1
  loadData()
}

/**
 * handleRangeReset：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。
 */
const handleRangeReset = () => {
  dateRangeType.value = '近一周'
  dateRange.value = []
  areaIds.value = []
  areaParams.provinceName = ''
  areaParams.cityName = ''
  areaParams.districtName = ''
  areaParams.areaType = ''
  areaParams.areaCode = ''
  handleRangeSearch()
}

/**
 * handleSubjectSearch：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。
 */
const handleSubjectSearch = () => {
  subjectPageNo.value = 1
  if (hasNoPermission.value) {
    tableDataSubject.value = []
    subjectTotal.value = 0
    ElMessage.warning('暂无权限')
    return
  }
  loadSubjectTable()
}

const searchSubjectTable = useDebounceFn(() => {
  handleSubjectSearch()
}, 300)

/**
 * handleSubjectReset：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。
 */
const handleSubjectReset = () => {
  filtersSubject.name = ''
  filtersSubject.filingType = undefined
  filtersSubject.subjectType = undefined
  filtersSubject.region = []
  subjectAreaNames.value = []
  handleSubjectSearch()
}

/**
 * handleProductSearch：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。
 */
const handleProductSearch = () => {
  productPageNo.value = 1
  if (hasNoPermission.value) {
    tableDataProduct.value = []
    productTotal.value = 0
    ElMessage.warning('暂无权限')
    return
  }
  loadProductTable()
}

const searchProductTable = useDebounceFn(() => {
  handleProductSearch()
}, 300)

/**
 * handleProductReset：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。
 */
const handleProductReset = () => {
  filtersProduct.productCode = ''
  filtersProduct.productName = ''
  filtersProduct.subjectName = ''
  filtersProduct.region = []
  productAreaNames.value = []
  handleProductSearch()
}

/** 按当前主体筛选条件导出最多 1000 条建档数据。 */
const handleSubjectExport = async () => {
  if (hasNoPermission.value) {
    ElMessage.warning('暂无权限')
    return
  }
  try {
    await ElMessageBox.confirm('确定要导出主体建档数据吗？', '导出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    subjectExportLoading.value = true
    const data = await SubjectApi.exportSubject(buildSubjectQuery(subjectPageNo.value, 1000))
    download.excel(data, '主体建档数据.xls')
    ElMessage.success('导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[StatisticsFiling] export subject failed:', error)
      ElMessage.error('导出失败')
    }
  } finally {
    subjectExportLoading.value = false
  }
}

/** 按当前产品筛选条件导出最多 1000 条建档数据。 */
const handleProductExport = async () => {
  if (hasNoPermission.value) {
    ElMessage.warning('暂无权限')
    return
  }
  try {
    await ElMessageBox.confirm('确定要导出产品建档数据吗？', '导出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    productExportLoading.value = true
    const data = await ProductApi.exportProduct(buildProductQuery(productPageNo.value, 1000))
    download.excel(data, '产品建档数据.xls')
    ElMessage.success('导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[StatisticsFiling] export product failed:', error)
      ElMessage.error('导出失败')
    }
  } finally {
    productExportLoading.value = false
  }
}

watch([dateRangeType, dateRange], () => {
  subjectPageNo.value = 1
  productPageNo.value = 1
  loadData()
})

watch(areaParams, () => {
  subjectPageNo.value = 1
  productPageNo.value = 1
  loadData()
})

watch(
  () => props.queryDeptScope,
  () => {
    subjectPageNo.value = 1
    productPageNo.value = 1
    loadData()
  }
)

watch(
  canViewAreaRange,
  (canView) => {
    if (canView) return
    areaIds.value = []
    areaParams.provinceName = ''
    areaParams.cityName = ''
    areaParams.districtName = ''
    areaParams.areaType = ''
    areaParams.areaCode = ''
    filtersSubject.region = []
    filtersProduct.region = []
    subjectAreaNames.value = []
    productAreaNames.value = []
  },
  { immediate: true }
)

watch(
  () => ({
    name: filtersSubject.name,
    filingType: filtersSubject.filingType,
    subjectType: filtersSubject.subjectType,
    region: [...normalizeArray(filtersSubject.region)],
    areaNames: [...subjectAreaNames.value]
  }),
  () => {
    searchSubjectTable()
  }
)

watch(
  () => ({
    productCode: filtersProduct.productCode,
    productName: filtersProduct.productName,
    subjectName: filtersProduct.subjectName,
    region: [...normalizeArray(filtersProduct.region)],
    areaNames: [...productAreaNames.value]
  }),
  () => {
    searchProductTable()
  }
)

onMounted(() => {
  loadData()
})
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
      font-size: 16px;
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
  margin-bottom: 20px;

  .filter-item {
    width: 140px;
  }

  .input-item {
    width: 180px;
  }

  .area-filter {
    width: 180px;
  }

  .filter-actions {
    margin-left: auto;
    display: flex;
    gap: 12px;
  }

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: $statistics-control-height;
    border-radius: $statistics-control-radius;
    box-shadow: 0 0 0 1px #dfe8f2 inset;
  }

  .reset-btn,
  .search-btn,
  .export-btn {
    height: $statistics-control-height;
    border-radius: $statistics-control-radius;
  }

  .search-btn,
  .export-btn {
    background-color: #00b3ed;
    border-color: #00b3ed;
  }
}

/* 图表区域 */
.charts-container {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.chart-area-wrapper {
  flex: 1;
  min-width: 0;
  margin-bottom: 16px;
}

.chart-header {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-bottom: 14px;

  .chart-y-title {
    font-size: 14px;
    color: #333;
    font-weight: bold;
  }
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
