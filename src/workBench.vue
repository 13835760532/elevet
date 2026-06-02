<template>
  <div class="workbench-page">
    <div class="page-header">
      <section class="workbench-title">我的工作台</section>
      <div class="report-filter">
        <el-select v-model="reportForm.year" class="filter-select is-year">
          <el-option v-for="item in yearOptions" :key="item" :label="`${item}年`" :value="item" />
        </el-select>
        <el-select v-model="reportForm.month" class="filter-select">
          <el-option v-for="item in monthOptions" :key="item" :label="`${item}月`" :value="item" />
        </el-select>
        <el-select v-model="reportForm.day" class="filter-select">
          <el-option v-for="item in dayOptions" :key="item" :label="`${item}日`" :value="item" />
        </el-select>
        <el-button class="query-btn" @click="handleReportQuery">查询</el-button>
      </div>
    </div>

    <section class="workbench-hero">
      <aside class="panel notice-panel">
        <div class="panel-header notice-header">
          <div>
            <h3>通知公告</h3>
            <p>显示最近5分钟风险公告</p>
          </div>
          <button class="text-action" type="button" @click="handleViewAllNotice">查看所有</button>
        </div>

        <div class="notice-list">
          <div v-for="(item, index) in noticeData" :key="item.id || index" class="notice-item">
            <div class="notice-badge-wrap">
              <span v-if="index < 2" class="notice-new">new</span>
              <span class="notice-badge" :class="item.type === 2 ? 'is-warning' : 'is-risk'">风险</span>
            </div>
            <div class="notice-content">
              <div class="notice-time">{{ item.time || '--' }}</div>
              <div class="notice-title">{{ item.title || '暂无风险公告' }}</div>
            </div>
          </div>
          <el-empty v-if="!noticeData.length" description="暂无风险公告" :image-size="80" />
        </div>
      </aside>

      <main class="warning-area">
        <div class="panel warning-topbar">
          <h3>农产品质量安全预警</h3>
          <button class="subscribe-btn" type="button" @click="handleSubscribe">
            <span class="subscribe-icon"></span>
            订阅日报/月报
          </button>
        </div>

        <div class="report-grid" v-loading="riskLoading">
          <article class="report-card">
            <div class="report-brand">
              <span class="shield-mark"></span>
              <strong>壹拾智检-农产品质量安全预警</strong>
            </div>
            <div class="report-divider"></div>
            <h2>农产品风险日报：{{ dailyReport.code }}</h2>
            <dl class="report-lines">
              <div v-for="line in dailyReport.lines" :key="line.label">
                <dt>{{ line.label }}</dt>
                <dd>{{ line.value }}</dd>
              </div>
            </dl>
            <button class="report-link" type="button" @click="handleViewReport(dailyReport)">[查看]</button>
          </article>

          <article class="report-card report-stack">
            <div class="report-brand">
              <span class="shield-mark"></span>
              <strong>壹拾智检-农产品质量安全预警</strong>
            </div>

            <div class="mini-report">
              <h2>农产品风险日报：{{ dailyReport.titleDate }}</h2>
              <dl class="report-lines compact">
                <div v-for="line in dailyReport.lines" :key="line.label">
                  <dt>{{ line.label }}</dt>
                  <dd>{{ line.value }}</dd>
                </div>
              </dl>
              <button class="report-link" type="button" @click="handleViewReport(dailyReport)">[查看]</button>
            </div>

            <div class="stack-divider"></div>

            <div class="mini-report">
              <h2>农产品风险月报：{{ monthlyReport.titleDate }}</h2>
              <dl class="report-lines compact">
                <div v-for="line in monthlyReport.lines" :key="line.label">
                  <dt>{{ line.label }}</dt>
                  <dd>{{ line.value }}</dd>
                </div>
              </dl>
              <button class="report-link" type="button" @click="handleViewReport(monthlyReport)">[查看]</button>
            </div>
          </article>
        </div>
      </main>
    </section>

    <section class="panel task-panel">
      <h3 class="section-title">待接收任务</h3>
      <el-table :data="taskData" :border="true" class="pending-table" header-cell-class-name="workbench-table-header">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="no" label="任务编号" align="center" width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="任务名称" align="center" min-width="170" show-overflow-tooltip />
        <el-table-column prop="planName" label="所属方案名称" align="center" min-width="190" show-overflow-tooltip />
        <el-table-column prop="org" label="方案主管单位" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="area" label="检测区域范围" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="variety" label="检测品种" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="item" label="检测项目" align="center" min-width="120" show-overflow-tooltip />
        <el-table-column prop="count" label="任务检测数量" align="center" width="110" />
        <el-table-column prop="time" label="执行时间" align="center" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="任务状态" align="center" width="110" />
        <el-table-column label="操作" align="center" width="90" fixed="right">
          <template #default="{ row }">
            <button class="table-link" type="button" @click="handleAcceptTask(row)">接收</button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-row">
        <span>合计{{ taskTotal }}条</span>
        <el-pagination v-model:current-page="taskQueryParams.pageNo" background layout="prev, pager, next"
          :page-size="taskQueryParams.pageSize" :total="taskTotal" @current-change="getTaskList" />
      </div>
    </section>

    <section class="panel track-panel">
      <div class="track-header">
        <h3 class="section-title">任务跟踪</h3>
        <div class="track-tabs">
          <button type="button" :class="{ active: activeTaskType === 'executed' }"
            @click="handleTrackTypeChange('executed')">
            我执行的任务
          </button>
          <button type="button" :class="{ active: activeTaskType === 'dispatched' }"
            @click="handleTrackTypeChange('dispatched')">
            我下发的任务
          </button>
        </div>
      </div>

      <div class="track-filters">
        <el-select v-model="trackForm.planName" placeholder="选择方案名称" clearable class="track-filter">
          <el-option v-for="item in trackPlanOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="trackForm.taskName" placeholder="选择任务名称" clearable class="track-filter">
          <el-option v-for="item in trackTaskOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="trackForm.owner" placeholder="主管单位" clearable class="track-filter">
          <el-option v-for="item in trackOwnerOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-input v-model="trackForm.keyword" placeholder="输入任务名称" clearable class="track-input" />
        <el-button type="primary" class="track-query" @click="handleTrackQuery">查询</el-button>
      </div>

      <div class="track-monitor-shell" v-loading="trackLoading">
        <div class="track-monitor-card" v-if="trackTreeData.children.length">
          <ProgressHistory :treeData="trackTreeData" />
        </div>
        <el-empty v-else description="暂无任务跟踪数据" :image-size="96" />
      </div>
    </section>

    <!-- Report Dialog -->
    <el-dialog v-model="reportDialogVisible" :title="currentReport?.name || '风险报告'" width="500px">
      <div v-if="currentReport">
        <div v-for="line in currentReport.lines" :key="line.label" style="margin-bottom: 12px;">
          <strong style="display: inline-block; width: 120px; color: #666;">{{ line.label }}：</strong>
          <span style="color: #333;">{{ line.value }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="reportDialogVisible = false">知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ProgressHistory from '@/components/ProgressHistory/index.vue'
import { getNoticePage } from '@/api/system/notice'
import {
  acceptDetectionTask,
  getDetectionTaskPage,
  getDetectionTaskTree,
  getDetectionSubTaskTree
} from '@/api/agri/detectionTask'
import { getHighRiskList, type StaticRiskListVO } from '@/api/agri/staticRiskList'
import { formatDate } from '@/utils/formatTime'

interface NoticeItem {
  id?: number
  time: string
  title: string
  type: number
}

interface TaskRow {
  id: number
  no: string
  name: string
  planName: string
  org: string
  area: string
  variety: string
  item: string
  count: number | string
  time: string
  status: string
}

interface TrackNode {
  name: string
  progress?: string
  warning?: boolean
  children?: TrackNode[]
}

interface SelectOption {
  label: string
  value: string | number
}

const router = useRouter()
const noticeData = ref<NoticeItem[]>([])
const taskData = ref<TaskRow[]>([])
const taskTotal = ref(0)
const riskLoading = ref(false)
const riskItems = ref<StaticRiskListVO[]>([])
const trackLoading = ref(false)
const trackTaskRows = ref<any[]>([])
const trackOptionsRows = ref<any[]>([])
const trackTreeNodes = ref<TrackNode[]>([])
const activeTaskType = ref<'executed' | 'dispatched'>('executed')

const reportDialogVisible = ref(false)
const currentReport = ref<typeof dailyReport.value>()

const today = new Date()
const reportForm = reactive({
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate()
})

const taskQueryParams = reactive({
  pageNo: 1,
  pageSize: 5,
  isAuto: false,
  status: 0
})

const trackForm = reactive({
  planName: '' as string | number | '',
  taskName: '' as string | number | '',
  owner: '',
  keyword: ''
})

const yearOptions = Array.from({ length: 6 }, (_, index) => today.getFullYear() - 5 + index)
const monthOptions = computed(() => {
  const maxMonth = reportForm.year === today.getFullYear() ? today.getMonth() + 1 : 12
  return Array.from({ length: maxMonth }, (_, index) => index + 1)
})
const dayOptions = computed(() => {
  const daysInMonth = new Date(reportForm.year, reportForm.month, 0).getDate()
  const maxDay = (reportForm.year === today.getFullYear() && reportForm.month === today.getMonth() + 1)
    ? Math.min(daysInMonth, today.getDate())
    : daysInMonth
  return Array.from({ length: maxDay }, (_, index) => index + 1)
})

const pad = (value: number) => String(value).padStart(2, '0')
const reportDateText = computed(() => `${reportForm.year}年${reportForm.month}月${reportForm.day}日`)
const reportCode = computed(() => `${reportForm.year}${pad(reportForm.month)}${pad(reportForm.day)}`)

const sortedRiskItems = computed(() =>
  [...riskItems.value].sort((a, b) => (Number(b.unqualifiedCount) || 0) - (Number(a.unqualifiedCount) || 0))
)

const getRiskProductName = (item?: StaticRiskListVO) =>
  item?.foodType || item?.foodSubcategory || item?.foodCategory || ''

const getRiskItemName = (item?: StaticRiskListVO) => item?.unqualifiedItem || ''

const uniqueJoin = (values: string[], limit = 3) => {
  const list = Array.from(new Set(values.filter(Boolean))).slice(0, limit)
  return list.length ? list.join('、') : '暂无数据'
}

const riskProductSummary = computed(() =>
  uniqueJoin(sortedRiskItems.value.map((item) => getRiskProductName(item)))
)

const riskItemSummary = computed(() =>
  uniqueJoin(sortedRiskItems.value.map((item) => getRiskItemName(item)))
)

const riskTotalCount = computed(() =>
  riskItems.value.reduce((total, item) => total + (Number(item.unqualifiedCount) || 0), 0)
)

const topRiskItem = computed(() => sortedRiskItems.value[0])

const dailyReport = computed(() => ({
  name: '农产品风险日报',
  titleDate: reportDateText.value,
  code: reportCode.value,
  lines: [
    { label: '高风险记录', value: riskItems.value.length ? `${riskItems.value.length} 项` : '暂无数据' },
    { label: '高风险产品', value: riskProductSummary.value },
    { label: '高风险项目', value: riskItemSummary.value },
    { label: '备注', value: riskItems.value.length ? '来源：高风险清单' : '暂无高风险清单数据' }
  ]
}))

const monthlyReport = computed(() => ({
  name: '农产品风险月报',
  titleDate: `${reportForm.year}年${reportForm.month}月`,
  code: `${reportForm.year}${pad(reportForm.month)}`,
  lines: [
    { label: '累计风险次数', value: riskTotalCount.value ? `${riskTotalCount.value} 次` : '暂无数据' },
    {
      label: '风险最高产品',
      value: topRiskItem.value
        ? `${getRiskProductName(topRiskItem.value) || '未知产品'}（${topRiskItem.value.unqualifiedCount || 0}次）`
        : '暂无数据'
    },
    { label: '重点不合格项', value: riskItemSummary.value },
    { label: '备注', value: riskItems.value.length ? '点击查看完整报告' : '暂无高风险清单数据' }
  ]
}))

const trackTreeData = computed(() => ({
  name: activeTaskType.value === 'executed' ? '我执行的任务' : '我下发的任务',
  children: trackTreeNodes.value
}))

const makeOptions = (rows: any[], getValue: (row: any) => string | number | undefined, getLabel: (row: any) => string | undefined) => {
  const map = new Map<string | number, SelectOption>()
  rows.forEach((row) => {
    const value = getValue(row)
    const label = getLabel(row)
    if (value !== undefined && value !== null && label && !map.has(value)) {
      map.set(value, { value, label })
    }
  })
  return Array.from(map.values())
}

const trackPlanOptions = computed(() =>
  makeOptions(
    trackOptionsRows.value,
    (row) => row.planId,
    (row) => row.planName || row.planInfo?.planName
  )
)

const trackTaskOptions = computed(() => {
  const rows = trackForm.planName
    ? trackOptionsRows.value.filter((row) => String(row.planId) === String(trackForm.planName))
    : trackOptionsRows.value
  return makeOptions(rows, (row) => row.id, (row) => row.taskName || row.taskCode)
})

const trackOwnerOptions = computed(() =>
  makeOptions(
    trackOptionsRows.value,
    (row) => row.planInfo?.issuerDeptName || row.issuerDeptName,
    (row) => row.planInfo?.issuerDeptName || row.issuerDeptName
  )
)

const getNoticeList = async () => {
  try {
    const res = await getNoticePage({ pageNo: 1, pageSize: 8 })
    noticeData.value = (res?.list || []).map((item: any) => ({
      id: item.id,
      time: item.createTime ? formatDate(item.createTime, 'YYYY-MM-DD HH:mm') : '',
      title: item.title,
      type: item.type
    }))
  } catch (error) {
    console.error('获取公告列表失败:', error)
    noticeData.value = []
  }
}

const getRiskList = async () => {
  riskLoading.value = true
  try {
    const res: any = await getHighRiskList({ pageNo: 1, pageSize: 10 })
    riskItems.value = Array.isArray(res) ? res : (res?.list || [])
  } catch (error) {
    console.error('获取高风险清单失败:', error)
    riskItems.value = []
  } finally {
    riskLoading.value = false
  }
}

const formatTaskTime = (startDate?: string, endDate?: string) => {
  const start = startDate ? String(startDate).split(' ')[0] : ''
  const end = endDate ? String(endDate).split(' ')[0] : ''
  if (start && end) return `${start}至${end}`
  return start || end || '--'
}

const getTaskList = async () => {
  try {
    const res = await getDetectionTaskPage(taskQueryParams)
    const rows = res?.list || []
    taskData.value = rows.map((item: any) => ({
      id: item.id,
      no: item.taskCode || '--',
      name: item.taskName || '--',
      planName: item.planName || item.planInfo?.planName || '--',
      org: item.planInfo?.issuerDeptName || item.issuerDeptName || '--',
      area: item.detectionArea || '--',
      variety: item.detectionVarieties || '--',
      item: item.detectionItems || '--',
      count: item.sampleCount ?? '--',
      time: formatTaskTime(item.startDate, item.endDate),
      status: '待接收'
    }))
    taskTotal.value = res?.total ?? rows.length
  } catch (error) {
    console.error('获取待接收任务失败:', error)
    taskData.value = []
    taskTotal.value = 0
  }
}

const flattenTree = (tree: any[]): any[] => {
  const result: any[] = []
  const walk = (nodes: any[]) => {
    nodes.forEach((node) => {
      result.push(node)
      if (Array.isArray(node.children) && node.children.length) {
        walk(node.children)
      }
    })
  }
  walk(Array.isArray(tree) ? tree : [])
  return result
}

const getNodeName = (node: any) =>
  node.assignDeptName ||
  node.deptName ||
  node.undertakeDeptName ||
  node.taskName ||
  node.taskCode ||
  '未命名任务'

const getNodeProgress = (node: any) => {
  const total = Number(node.sampleCount)
  const completed = Number(node.sampleCompletedCount)
  if (!Number.isFinite(total) || total <= 0) return ''
  return `(${Number.isFinite(completed) ? completed : 0}/${total})`
}

const normalizeTrackNode = (node: any): TrackNode => ({
  name: getNodeName(node),
  progress: getNodeProgress(node),
  warning: Number(node.status) === 2,
  children: Array.isArray(node.children) ? node.children.map((child: any) => normalizeTrackNode(child)) : []
})

const buildTrackNodes = (tree: any[], fallbackRows: any[] = []) => {
  if (Array.isArray(tree) && tree.length) {
    return tree.slice(0, 6).map((node: any) => normalizeTrackNode(node))
  }
  return fallbackRows.slice(0, 6).map((node: any) => normalizeTrackNode(node))
}

const getTaskTrackList = async (isInit = false) => {
  trackLoading.value = true
  try {
    const params: any = {
      pageNo: 1,
      pageSize: 20,
      isAuto: false
    }

    // 如果是初始化（或重置条件），记录下拉选项数据
    let optionRows: any[] = []
    if (isInit) {
      const res = await getDetectionTaskPage({ pageNo: 1, pageSize: 50, isAuto: false })
      optionRows = res?.list || []
      trackOptionsRows.value = optionRows
    }

    if (trackForm.planName) params.planId = trackForm.planName
    if (trackForm.keyword) params.taskName = trackForm.keyword

    const res = await getDetectionTaskPage(params)
    let rows = res?.list || []

    // 如果没有初始化获取，而 options 还是空，则容错填入
    if (!isInit && !trackOptionsRows.value.length) {
      trackOptionsRows.value = rows
    }

    if (trackForm.owner) {
      rows = rows.filter((row: any) =>
        String(row.planInfo?.issuerDeptName || row.issuerDeptName || '') === String(trackForm.owner)
      )
    }
    trackTaskRows.value = rows

    const selectedTask =
      rows.find((row: any) => String(row.id) === String(trackForm.taskName)) || rows[0]

    if (!selectedTask?.id) {
      trackTreeNodes.value = []
      return
    }

    let tree: any[] = []
    if (selectedTask.planId) {
      tree = await getDetectionTaskTree(selectedTask.planId)
    }
    if (!Array.isArray(tree) || !tree.length) {
      tree = await getDetectionSubTaskTree(selectedTask.id)
    }
    trackTreeNodes.value = buildTrackNodes(tree, rows)
  } catch (error) {
    console.error('获取任务跟踪失败:', error)
    trackTreeNodes.value = []
  } finally {
    trackLoading.value = false
  }
}

const handleAcceptTask = async (row: TaskRow) => {
  try {
    await ElMessageBox.confirm('确定要接收该检测任务吗？', '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await acceptDetectionTask(row.id)
    ElMessage.success('接收任务成功')
    getTaskList()
  } catch (error: any) {
    if (error !== 'cancel') console.error('接收任务失败:', error)
  }
}

const handleViewAllNotice = () => {
  router.push('/user/notify-message')
}

const handleSubscribe = () => {
  ElMessage.info('暂无日报/月报订阅接口')
}

const handleReportQuery = () => {
  getRiskList()
}

const handleViewReport = (report: typeof dailyReport.value) => {
  currentReport.value = report
  reportDialogVisible.value = true
}

const handleTrackQuery = () => {
  getTaskTrackList(false)
}

const handleTrackTypeChange = (type: 'executed' | 'dispatched') => {
  activeTaskType.value = type
  trackForm.planName = ''
  trackForm.taskName = ''
  trackForm.owner = ''
  trackForm.keyword = ''
  getTaskTrackList(true)
}

watch(
  () => [reportForm.year, reportForm.month],
  () => {
    if (reportForm.month > monthOptions.value.length) {
      reportForm.month = monthOptions.value.length
    }
    if (reportForm.day > dayOptions.value.length) {
      reportForm.day = dayOptions.value.length
    }
  }
)

onMounted(() => {
  getNoticeList()
  getRiskList()
  getTaskList()
  getTaskTrackList(true)
})
</script>

<style lang="scss" scoped>
/* Ultra Minimalist & Flat Design */
.workbench-page {
  /* Let the parent handle the page background */
  color: #333;
}

/* Remove all panel background, border, shadow styles that cause nesting */
.panel {
  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 24px;
}

/* Page Title */
.workbench-title {
  font-size: 20px;
  font-weight: bold;
  color: #111;
  display: flex;
  align-items: center;
  margin-bottom: 0;

  &::before {
    content: "";
    width: 4px;
    height: 18px;
    background: #00B3ED;
    margin-right: 12px;
    border-radius: 2px;
  }
}

/* Hero Section */
.workbench-hero {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.notice-panel {
  width: 360px;
  flex-shrink: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 42px;
  margin-top: 0;
  margin-bottom: 20px;

  >div {
    h3 {
      font-size: 16px;
      margin: 0 0 4px 0;
    }

    p {
      font-size: 12px;
      color: #999;
      margin: 0;
    }
  }
}

.text-action {
  color: #00B3ED;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f4f8fb;
  border-radius: 8px;
  padding: 20px;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  background: transparent;
  padding: 0;
}

.notice-badge-wrap {
  position: relative;
  margin-right: 12px;
}

.notice-new {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  line-height: 14px;
  padding: 0 4px;
  border-radius: 4px;
  transform: scale(0.8);
  transform-origin: top right;
}

.notice-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;

  &.is-risk {
    background: #ffeceb;
    color: #ff4d4f;
  }

  &.is-warning {
    background: #fff5e6;
    color: #ff9900;
  }
}

.notice-content {
  flex: 1;
  min-width: 0;
}

.notice-time {
  font-size: 12px;
  color: #999;
}

.notice-title {
  font-size: 14px;
  color: #333;
}

/* Warning Area */
.warning-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.warning-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 42px;
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    margin: 0;
  }
}

.subscribe-btn {
  color: #00B3ED;
  background: #e5f7fd;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.subscribe-icon {
  width: 14px;
  height: 14px;
  border: 1.5px solid #00B3ED;
  border-radius: 3px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    inset: 2px;
    background: #00B3ED;
    border-radius: 1px;
  }
}

.report-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-select {
  width: 110px;
}

.query-btn {
  background: #00B3ED;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 20px;
}

/* Report Grid */
.report-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.report-card {
  background: #f4f8fb;
  border-radius: 8px;
  padding: 20px;
  /* NO BORDER, NO SHADOW */
  border: none !important;
  box-shadow: none !important;
}

.report-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #111;
}

.shield-mark {
  width: 14px;
  height: 18px;
  background: #00B3ED;
  clip-path: polygon(50% 0, 92% 18%, 86% 64%, 50% 100%, 14% 64%, 8% 18%);
}

.report-divider,
.stack-divider {
  display: none;
  /* keep it clean */
}

.report-card h2,
.mini-report h2 {
  font-size: 15px;
  margin: 0 0 16px 0;
  color: #111;
}

.report-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;

  div {
    display: flex;
    font-size: 13px;
  }

  dt {
    width: 90px;
    color: #999;
  }

  dd {
    flex: 1;
    margin: 0;
    color: #333;
  }
}

.report-link {
  color: #00B3ED;
  border: none;
  background: none;
  padding: 0;
  margin-top: 16px;
  margin-left: 90px;
  cursor: pointer;
  font-size: 13px;
}

.mini-report {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* Task and Track Panel */
.task-panel,
.track-panel {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;

  &::before {
    content: "";
    width: 4px;
    height: 16px;
    background: #00B3ED;
    margin-right: 10px;
    border-radius: 2px;
  }
}

/* Table */
.pending-table {
  /* NO BORDER */
  border: none !important;
}

:deep(.el-table) {
  --el-table-border-color: transparent;
  --el-table-border: none;

  &::before,
  &::after {
    display: none;
  }
}

:deep(.workbench-table-header) {
  background: #fafafa !important;
  color: #666;
  font-weight: normal;
}

:deep(.el-table th.el-table__cell.is-leaf) {
  border-bottom: none;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #f5f5f5;
}

.table-link {
  color: #00B3ED;
  background: none;
  border: none;
  cursor: pointer;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}

.pagination-row>span {
  margin-right: 16px;
}

/* Track Panel Specific */
.track-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .section-title {
    margin: 0;
  }
}

.track-tabs {
  display: flex;
  gap: 20px;

  button {
    background: none;
    border: none;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    padding-bottom: 4px;

    &.active {
      color: #00B3ED;
      font-weight: bold;
      border-bottom: 2px solid #00B3ED;
    }
  }
}

.track-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.track-filter,
.track-input {
  width: 180px;
}

.track-query {
  background: #00B3ED;
  color: #fff;
  border: none;
  border-radius: 4px;
}

.track-monitor-shell {
  min-height: 260px;
}

.track-monitor-card {
  min-height: 260px;
  padding: 20px 24px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);

  :deep(.history-tree) {
    padding: 8px 0 0;
    min-width: 100%;
  }

  :deep(.root-node .node-text) {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
  }

  :deep(.node-item .node-text) {
    color: #374151;
    font-weight: 500;
  }

  :deep(.node-progress) {
    color: #F59E0B;
    font-weight: 600;
  }

  :deep(.node-progress.warning) {
    color: #EF4444;
  }

  :deep(.node-dot) {
    border-width: 2px;
  }

  :deep(.branch-line),
  :deep(.tree-branch::before) {
    background: #D1D5DB;
  }
}
</style>
