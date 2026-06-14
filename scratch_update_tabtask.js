const fs = require('fs')

const path = '/Users/feng/Documents/react0630/拾壹/src/views/statistics/components/TabTask.vue'
let content = fs.readFileSync(path, 'utf8')

// 1. Template table area
const oldTables = `<el-table v-if="activeTab === 'result'" v-loading="resultLoading" :data="resultTableData" style="width: 100%" empty-text="暂无检测结果数据">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="recordId" label="检测记录ID" align="center" />
          <el-table-column prop="sampleId" label="样品ID" align="center" />
          <el-table-column prop="detectionItem" label="检测项目" align="center" />
          <el-table-column prop="detectionValue" label="检测值" align="center" />
          <el-table-column prop="unit" label="单位" align="center" />
          <el-table-column prop="limitValue" label="限量值" align="center" />
          <el-table-column prop="detectionMethod" label="检测方法" align="center" />
          <el-table-column prop="resultLabel" label="检测结果" align="center" />
        </el-table>`

const newTables = `<!-- 检测结果筛选区 -->
        <div class="result-filters" v-if="activeTab === 'result'">
          <el-input v-model="resultFilters.keyword" placeholder="任务名称/任务编号" class="filter-item input-item" clearable @change="loadResultPage" />
          <el-input v-model="resultFilters.sample" placeholder="样品" class="filter-item input-item" clearable @change="loadResultPage" />
          <el-select v-model="resultFilters.category" placeholder="产品分类" class="filter-item" clearable @change="loadResultPage">
            <el-option v-for="item in productCategoryOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <AreaCascader v-model="resultFilters.area" placeholder="检测地区" @select="handleResultAreaSelect" class="filter-item" style="width: 150px" />
          <el-select v-model="resultFilters.org" placeholder="检测机构" class="filter-item" clearable @change="loadResultPage"></el-select>
          <el-select v-model="resultFilters.result" placeholder="检测结果" class="filter-item" clearable @change="loadResultPage">
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

        <el-table v-if="activeTab === 'result'" v-loading="resultLoading" :data="resultTableData" style="width: 100%" empty-text="暂无检测结果数据">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="taskNo" label="任务编号" align="center" width="100" />
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
        </el-table>`

content = content.replace(oldTables, newTables)

// 2. Imports
const oldImports = `import {
  getTaskAnalysisPage,
  getTaskOverview,
  type DashboardTaskOverviewRespVO,
  type TaskAnalysisRespVO
} from '@/api/agri/dashboard/task'
import { getDetectionResultItemPage } from '@/api/agri/detectionResultItem'`

const newImports = `import Echart from '@/components/Echart/index.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import { useDict } from '@/hooks/web/useDict'
import {
  getTaskAnalysisPage,
  getTaskOverview,
  getTaskVolumeTrend,
  type DashboardTaskOverviewRespVO,
  type TaskAnalysisRespVO
} from '@/api/agri/dashboard/task'
import * as DetectionRecordApi from '@/api/agri/detectionRecord'`

content = content.replace(oldImports, newImports)

// 3. Variables
const oldVars = `const activeTab = ref('task')`
const newVars = `const activeTab = ref('task')

const productCategoryOptions = useDict('agri_product_category', 'str').options
const resultFilters = ref({
  keyword: '',
  sample: '',
  category: '',
  area: [] as any,
  org: '',
  result: ''
})
const handleResultAreaSelect = (area: any) => {
  resultFilters.value.area = [area.province, area.city, area.district].filter(Boolean).join('-')
  loadResultPage()
}
const trendOption = ref<any>(null)`

content = content.replace(oldVars, newVars)

// 4. loadResultPage
const oldLoadResult = `const loadResultPage = async () => {
  resultLoading.value = true
  try {
    const data = await getDetectionResultItemPage({
      pageNo: resultPageNo.value,
      pageSize: resultPageSize.value,
      detectionItem: keyword.value || undefined
    })
    const normalized = normalizePagedResult<any>(data)
    resultTableData.value = (normalized.list || []).map(item => ({
      ...item,
      resultLabel: item.result === 0 ? '阴性' : item.result === 1 ? '阳性' : item.result === 2 ? '结果异常' : '--'
    }))
    resultTotal.value = normalized.total || 0
  } catch (error) {
    console.error('[StatisticsTask] load result page failed:', error)
    resultTableData.value = []
    resultTotal.value = 0
  } finally {
    resultLoading.value = false
  }
}`

const newLoadResult = `const buildResultTableQuery = () => ({
  pageNo: resultPageNo.value,
  pageSize: resultPageSize.value,
  ...currentQueryParams.value,
  recordCode: resultFilters.value.keyword || undefined,
  sampleName: resultFilters.value.sample || undefined,
  productCategory: resultFilters.value.category || undefined,
  detectionArea: typeof resultFilters.value.area === 'string' ? resultFilters.value.area : undefined,
  detectionOrgName: resultFilters.value.org || undefined,
  overallResult: resultFilters.value.result !== '' ? resultFilters.value.result : undefined,
  selfDetection: 'false'
})

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

const loadTrend = async () => {
  try {
    const data = await getTaskVolumeTrend(currentQueryParams.value)
    if (data && data.xaxis) {
      trendOption.value = {
        grid: { top: 40, right: 20, bottom: 20, left: 40, containLabel: true },
        tooltip: { trigger: 'axis' },
        legend: {
          data: ['样品量', '检测量'],
          top: 0,
          right: 20,
          icon: 'circle'
        },
        xAxis: {
          type: 'category',
          data: data.xaxis,
          axisLine: { lineStyle: { color: '#E2E8F0' } },
          axisLabel: { color: '#64748B' }
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { type: 'dashed', color: '#E2E8F0' } },
          axisLabel: { color: '#64748B' }
        },
        series: [
          {
            name: '样品量',
            type: 'line',
            smooth: true,
            data: data.sampleCounts || [],
            itemStyle: { color: '#A855F7' },
            areaStyle: { color: 'rgba(168, 85, 247, 0.1)' }
          },
          {
            name: '检测量',
            type: 'line',
            smooth: true,
            data: data.itemCounts || [],
            itemStyle: { color: '#FDE047' },
            areaStyle: { color: 'rgba(253, 224, 71, 0.1)' }
          }
        ]
      }
    } else {
      trendOption.value = null
    }
  } catch (error) {
    console.error('Failed to load trend:', error)
    trendOption.value = null
  }
}`

content = content.replace(oldLoadResult, newLoadResult)

// 5. Watch & handleSearch
const oldWatch = `watch(activeTab, (val) => {
  if (val === 'task') {
    loadTaskPage()
  } else {
    loadResultPage()
  }
})`

const newWatch = `watch(activeTab, (val) => {
  if (val === 'task') {
    loadTaskPage()
  } else {
    loadTrend()
    loadResultPage()
  }
})`

content = content.replace(oldWatch, newWatch)

const oldHandleSearch = `const handleSearch = () => {
  pageNo.value = 1
  resultPageNo.value = 1
  loadOverview()
  if (activeTab.value === 'task') {
    loadTaskPage()
  } else {
    loadResultPage()
  }
}`

const newHandleSearch = `const handleSearch = () => {
  pageNo.value = 1
  resultPageNo.value = 1
  loadOverview()
  if (activeTab.value === 'task') {
    loadTaskPage()
  } else {
    loadTrend()
    loadResultPage()
  }
}`

content = content.replace(oldHandleSearch, newHandleSearch)

// 6. Styles
const styleAppend = `
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
</style>`

content = content.replace('</style>', styleAppend)

fs.writeFileSync(path, content)
console.log('Update success')
