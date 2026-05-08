<template>
  <div class="workbench-container">
    <div class="page-title">
      <span>我的工作台</span>
    </div>

    <!-- 上部布局 -->
    <div class="top-section">
      <!-- 业务风险公告 -->
      <div class="notice-card">
        <div class="card-header">
          <div class="title-wrapper">
            <span class="card-title">业务风险公告</span>
            <span class="card-subtitle">显示最近5分钟风险公告</span>
          </div>
          <span class="view-all">查看所有</span>
        </div>
        <div class="notice-list">
          <div class="notice-item" v-for="(item, index) in noticeData" :key="item.id">
            <div class="notice-tag">
              <span class="tag-new" v-if="index < 2">new</span>
              <span :class="['tag-risk', { 'yellow': item.type === 2 }]">{{ item.type === 2 ? '公告' : '通知' }}</span>
            </div>
            <div class="notice-content">
              <div class="notice-time">{{ item.time }}</div>
              <div class="notice-title">{{ item.title }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险预警日历 -->
      <div class="calendar-card">
        <div class="card-header border-none">
          <span class="card-title">风险预警（日报/月报）</span>
          <div class="calendar-actions">
            <el-select v-model="year" class="year-select" size="default">
              <el-option v-for="item in yearOptions" :key="item" :label="`${item}年`" :value="String(item)" />
            </el-select>
            <el-select v-model="month" class="month-select" size="default">
              <el-option v-for="item in monthOptions" :key="item" :label="`${item}月`" :value="String(item)" />
            </el-select>
            <el-radio-group v-model="viewType" size="default" class="view-radio">
              <el-radio-button label="月" />
              <el-radio-button label="日" />
            </el-radio-group>
          </div>
        </div>
        <div class="calendar-layout">
          <div class="calendar-wrapper">
            <el-calendar v-model="calendarValue">
              <template #date-cell="{ data }">
                <div
                  class="date-cell"
                  :class="{ 'is-active': selectedDate === data.day, 'is-risk-date': !!getRiskDetail(data.day), 'is-empty': data.type !== 'current-month' }"
                  :style="{ position: 'relative', width: '100%', height: '100%', padding: '10px', cursor: data.type !== 'current-month' ? 'default' : 'pointer', boxSizing: 'border-box', background: selectedDate === data.day ? '#eaf6fb' : 'transparent', borderRadius: selectedDate === data.day ? '4px' : '', opacity: data.type !== 'current-month' ? '0.5' : '1', transition: 'all 0.3s ease' }"
                  @click="handleDateClick(data.day, data.type)"
                >
                  <div
                    :style="{ position: 'absolute', top: '10px', left: '10px', fontSize: '14px', color: data.type !== 'current-month' ? '#dcdfe6' : '#666', lineHeight: '1', fontWeight: '400' }"
                  >
                    {{ parseInt(data.day.split('-')[2], 10) }}
                  </div>
                  <div
                    v-if="data.type === 'current-month'"
                    :style="{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '8px', boxSizing: 'border-box' }"
                  >
                    <template v-if="getRiskDetail(data.day)">
                      <button
                        type="button"
                        :title="getRiskDetail(data.day).title"
                        :style="{ border: '1px solid #fbc4c4', background: '#fef0f0', padding: '4px 6px', fontSize: '12px', fontWeight: '500', color: '#f56c6c', cursor: 'pointer', textDecoration: 'none', width: '96%', textAlign: 'center', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2', display: 'block' }"
                        @click.stop="selectRiskDetail(data.day)"
                      >
                        {{ getRiskDetail(data.day).title }}
                      </button>
                    </template>
                    <template v-else-if="isBaselineDay(data.day)">
                      <div
                        :style="{ border: '1px solid #e9e9eb', background: '#f4f4f5', padding: '4px 6px', fontSize: '12px', fontWeight: '500', color: '#909399', width: '96%', textAlign: 'center', borderRadius: '4px', boxSizing: 'border-box', lineHeight: '1.2' }"
                      >暂无风险</div>
                    </template>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>

          <!-- 右侧详情弹窗 (滑动出现) -->
          <Transition name="slide-fade">
            <div v-if="selectedRiskDetail && showDetail" class="risk-detail-panel">
              <div class="panel-header">
                <div class="detail-title">{{ selectedRiskDetail.title }}</div>
                <div class="close-btn" @click="showDetail = false">
                  <Icon icon="ep:close" />
                </div>
              </div>
              <div class="detail-content">
                <div class="detail-line"><strong>【所属区划】</strong>{{ selectedRiskDetail.region }}</div>
                <div class="detail-line"><strong>【农产品】</strong>{{ selectedRiskDetail.product }}</div>
                <div class="detail-line"><strong>【当前窗口】</strong>{{ selectedRiskDetail.window }}</div>
                <div class="detail-line"><strong>【样品总数】</strong>{{ selectedRiskDetail.sampleCount }}个</div>
                <div class="detail-line"><strong>【合格率】</strong>{{ selectedRiskDetail.passRate }}</div>
                <div class="detail-line"><strong>【历史基线】</strong>{{ selectedRiskDetail.baseline }}</div>
                <div class="detail-line"><strong>【预警阈值】</strong>{{ selectedRiskDetail.threshold }}</div>
                <div class="detail-line"><strong>【冷却信息】</strong>{{ selectedRiskDetail.cooldown }}</div>
                <div class="detail-line"><strong>【建议措施】</strong>{{ selectedRiskDetail.suggestion }}</div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- 待接收任务 -->
    <div class="task-section">
      <div class="section-title">待接收任务</div>
      <div class="table-container">
        <el-table :data="taskData" border style="width: 100%" header-cell-class-name="custom-header">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="no" label="任务编号" align="center" width="100" />
          <el-table-column prop="name" label="任务名称" align="center" min-width="140" show-overflow-tooltip />
          <el-table-column prop="planName" label="所属方案名称" align="center" min-width="180" show-overflow-tooltip />
          <el-table-column prop="org" label="方案主管单位" align="center" min-width="140" />
          <el-table-column prop="area" label="检测区域范围" align="center" min-width="120" />
          <el-table-column prop="variety" label="检测品种" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="item" label="检测项目" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="count" label="任务检测数量" align="center" width="100" />
          <el-table-column prop="time" label="执行时间" align="center" min-width="140" />
          <el-table-column prop="status" label="任务状态" align="center" width="80" />
          <el-table-column label="操作" align="center" width="80" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link class="action-btn" @click="handleAcceptTask(row)">接收</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <div class="total-text">合计{{ taskTotal }}条</div>
          <el-pagination background layout="prev, pager, next" :total="taskTotal" :page-size="taskQueryParams.pageSize"
            v-model:current-page="taskQueryParams.pageNo" @current-change="getTaskList" />
        </div>
      </div>
    </div>

    <!-- 任务完成率趋势图 -->
    <div class="trend-section">
      <div class="trend-header">
        <div class="section-title">任务完成率趋势图</div>
        <div class="trend-actions">
          <el-button 
            :type="activeTaskType === 'executed' ? 'primary' : 'default'"
            :class="activeTaskType === 'executed' ? 'blue-btn left-btn' : 'white-btn left-btn'"
            @click="toggleTaskType('executed')"
          >我执行的任务</el-button>
          <el-button 
            :type="activeTaskType === 'dispatched' ? 'primary' : 'default'"
            :class="activeTaskType === 'dispatched' ? 'blue-btn right-btn' : 'white-btn right-btn'"
            @click="toggleTaskType('dispatched')"
          >我下发的任务</el-button>
        </div>
      </div>
      <div class="trend-filters">
        <el-input v-model="trendForm.keyword" placeholder="任务名称/任务编号" clearable class="filter-item input-item" />
        <el-select v-model="trendForm.sample" placeholder="样品" clearable class="filter-item">
          <el-option label="样品A" value="A" />
          <el-option label="样品B" value="B" />
        </el-select>
        <el-select v-model="trendForm.category" placeholder="产品分类" clearable class="filter-item">
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.AGRI_PRODUCT_CATEGORY)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
        <AreaCascader v-model="trendForm.area" placeholder="检测地区" class="filter-item" />
        <el-select v-model="trendForm.org" placeholder="检测机构" clearable class="filter-item">
          <el-option label="机构A" value="A" />
          <el-option label="机构B" value="B" />
        </el-select>
        <el-select v-model="trendForm.result" placeholder="检测结果" clearable class="filter-item">
          <el-option label="合格" value="1" />
          <el-option label="不合格" value="0" />
        </el-select>
        <div style="flex: 1"></div>
        <el-button type="primary" class="export-btn blue-btn">导出</el-button>
      </div>
      <div class="trend-chart-title">
        <span class="title-text">任务完成率</span>
      </div>
      <div class="trend-chart-container" ref="trendChartRef"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted, markRaw, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNoticePage } from '@/api/system/notice'
import { getDetectionTaskPage, acceptDetectionTask } from '@/api/agri/detectionTask'
import { formatDate } from '@/utils/formatTime'
import { getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import AreaCascader from '@/components/AreaCascader/index.vue'

const noticeData = ref<any[]>([])

const getNoticeList = async () => {
  try {
    const res = await getNoticePage({
      pageNo: 1,
      pageSize: 5
    })
    if (res?.list) {
      noticeData.value = res.list.map((item: any) => ({
        id: item.id,
        time: item.createTime ? formatDate(item.createTime, 'YYYY-MM-DD HH:mm') : '',
        title: item.title,
        type: item.type
      }))
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
  }
}

onMounted(() => {
  getNoticeList()
})

const yearOptions = [2021, 2022, 2023, 2024, 2025, 2026]
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1)
const currentDate = new Date()
const year = ref(String(currentDate.getFullYear()))
const month = ref(String(currentDate.getMonth() + 1))
const viewType = ref('日')
const calendarValue = ref(currentDate)
const selectedDate = ref('')
const showDetail = ref(false)

interface RiskDetail {
  day: string
  type: '月' | '日'
  title: string
  region: string
  product: string
  window: string
  sampleCount: number
  passRate: string
  baseline: string
  threshold: string
  cooldown: string
  suggestion: string
}

const activeRiskList = computed<RiskDetail[]>(() => {
  const y = year.value
  const m = month.value.padStart(2, '0')
  const prefix = `${y}-${m}`

  const data: RiskDetail[] = [
    {
      day: `${prefix}-02`,
      type: '日',
      title: '日报-农产品流通异常预警',
      region: 'G县',
      product: '白菜',
      window: '近3天',
      sampleCount: 15,
      passRate: '82.0%',
      baseline: '基于6个月有效数据',
      threshold: '90.00%',
      cooldown: '连续触发，请重点关注',
      suggestion: '建议对G县白菜批发市场进行抽检。'
    },
    {
      day: `${prefix}-06`,
      type: '日',
      title: '日报-农产品合格率突降预警',
      region: 'A县',
      product: '豇豆',
      window: '近7天',
      sampleCount: 45,
      passRate: '88.9%',
      baseline: '基于10个月有效数据（样品量≥30）',
      threshold: '93.05%',
      cooldown: '本次预警后7天内复预警，将及时处置。',
      suggestion: '立即对A县豇豆开展专项检查，排查重点经营主体。'
    },
    {
      day: `${prefix}-06`,
      type: '月',
      title: '月报-农产品质量风险重点预警',
      region: '全市',
      product: '时令蔬菜',
      window: `${y}年${m}月`,
      sampleCount: 150,
      passRate: '86.5%',
      baseline: '对比近6个月月度均值',
      threshold: '90.00%',
      cooldown: '持续关注，建议加大抽检力度',
      suggestion: '建议对全市时令蔬菜开展专项月度抽查。'
    },
    {
      day: `${prefix}-07`,
      type: '日',
      title: '日报-农产品合格率波动预警',
      region: 'B县',
      product: '菠菜',
      window: '近7天',
      sampleCount: 38,
      passRate: '87.4%',
      baseline: '基于12个月有效数据（样品量≥30）',
      threshold: '91.80%',
      cooldown: '连续触发将升级为重点关注。',
      suggestion: '建议对B县菠菜来源地开展复检，核查流通环节。'
    },
    {
      day: `${prefix}-08`,
      type: '日',
      title: '日报-农产品合格率异常预警',
      region: 'C镇',
      product: '黄瓜',
      window: '近7天',
      sampleCount: 42,
      passRate: '89.1%',
      baseline: '基于8个月有效数据（样品量≥30）',
      threshold: '92.30%',
      cooldown: '近14天内二次触发将直接推送监管人员。',
      suggestion: '建议对C镇黄瓜种植主体进行现场抽检。'
    },
    {
      day: `${prefix}-09`,
      type: '日',
      title: '日报-农产品合格率突降预警',
      region: 'A县',
      product: '豆角',
      window: '近7天',
      sampleCount: 45,
      passRate: '88.9%',
      baseline: '基于10个月有效数据（样品量≥30）',
      threshold: '93.05%',
      cooldown: '本次预警后7天内复预警，请及时处置。',
      suggestion: '立即对A县豆角开展专项检查，排查问题批次。'
    },
    {
      day: `${prefix}-10`,
      type: '日',
      title: '日报-农产品合格率异常预警',
      region: 'D区',
      product: '茄子',
      window: '近7天',
      sampleCount: 36,
      passRate: '86.2%',
      baseline: '基于11个月有效数据（样品量≥30）',
      threshold: '90.15%',
      cooldown: '当前预警处于首次触发。',
      suggestion: '建议对D区茄子经营主体进行重点核查。'
    },
    {
      day: `${prefix}-11`,
      type: '日',
      title: '日报-农产品合格率异常预警',
      region: 'E县',
      product: '韭菜',
      window: '近7天',
      sampleCount: 40,
      passRate: '85.5%',
      baseline: '基于9个月有效数据（样品量≥30）',
      threshold: '89.90%',
      cooldown: '连续两次低于基线，建议升级处理。',
      suggestion: '建议安排专项抽检并追溯韭菜来源。'
    },
    {
      day: `${prefix}-12`,
      type: '日',
      title: '日报-农产品合格率异常预警',
      region: 'F乡',
      product: '芹菜',
      window: '近7天',
      sampleCount: 34,
      passRate: '87.0%',
      baseline: '基于10个月有效数据（样品量≥30）',
      threshold: '91.60%',
      cooldown: '近7天内再次触发将自动推送。',
      suggestion: '建议对F乡芹菜开展高频抽检。'
    },
    {
      day: `${prefix}-13`,
      type: '日',
      title: '日报-农产品合格率突降预警',
      region: 'A县',
      product: '豆豆',
      window: '近7天',
      sampleCount: 45,
      passRate: '88.9%',
      baseline: '基于10个月有效数据（样品量≥30）',
      threshold: '93.05%',
      cooldown: '本次预警后7天内复预警，请及时处置。',
      suggestion: '立即对A县豆豆开展专项检查，排查问题主体。'
    },
    {
      day: `${prefix}-18`,
      type: '日',
      title: '日报-检测数据造假预警',
      region: 'H区',
      product: '多品类',
      window: '近1天',
      sampleCount: 120,
      passRate: '100%',
      baseline: '系统智能分析',
      threshold: '异常高合格率',
      cooldown: '立即触发核查机制',
      suggestion: '建议对H区检测机构进行飞行检查，核对原始记录。'
    },
    {
      day: `${prefix}-25`,
      type: '日',
      title: '日报-突发性集中不合格预警',
      region: '全市',
      product: '草莓',
      window: '近3天',
      sampleCount: 50,
      passRate: '75.2%',
      baseline: '农药残留专项监测',
      threshold: '95.00%',
      cooldown: '全网通报，暂停销售',
      suggestion: '紧急封存流通中的疑似问题草莓，启动溯源程序。'
    },
    {
      day: `${prefix}-12`,
      type: '月',
      title: '月报-农产品质量风险预警',
      region: '全市',
      product: '重点品类',
      window: `${y}年${m}月`,
      sampleCount: 318,
      passRate: '91.2%',
      baseline: '对比近12个月月度均值',
      threshold: '94.00%',
      cooldown: '月报预警每月汇总一次。',
      suggestion: '建议对重点品类启动月度复盘，并关注低于阈值地区。'
    }
  ]

  return data.filter((item) => item.type === viewType.value)
})

const getRiskDetail = (dayStr: string) =>
  activeRiskList.value.find((item) => item.day === dayStr)

const selectedRiskDetail = computed(() => getRiskDetail(selectedDate.value) || null)

const isBaselineDay = (dayStr: string) => {
  const prefix = `${year.value}-${month.value.padStart(2, '0')}`
  return dayStr === `${prefix}-05`
}

const syncCalendar = () => {
  calendarValue.value = new Date(Number(year.value), Number(month.value) - 1, 1)
  const firstRisk = activeRiskList.value.find((item) => item.day.startsWith(`${year.value}-${month.value.padStart(2, '0')}`))
  selectedDate.value = firstRisk?.day || `${year.value}-${month.value.padStart(2, '0')}-01`
  // 切换月份时，如果有预警则自动展示，没有则关闭
  showDetail.value = !!firstRisk
}

const selectRiskDetail = (dayStr: string) => {
  selectedDate.value = dayStr
  showDetail.value = true
}

const handleDateClick = (dayStr: string, type: string) => {
  if (type !== 'current-month') return
  selectedDate.value = dayStr
  // 如果该日期有风险，点击则自动弹出，否则保持原状
  if (getRiskDetail(dayStr)) {
    showDetail.value = true
  }
}

watch([year, month, viewType], () => {
  syncCalendar()
}, { immediate: true })

const taskData = ref<any[]>([])
const taskTotal = ref(0)
const taskQueryParams = ref({
  pageNo: 1,
  pageSize: 5,
  isAuto: false,
  status: 0, // 假设 0 为待接收状态，若不对可调整
})

const getTaskList = async () => {
  try {
    const res = await getDetectionTaskPage(taskQueryParams.value)
    if (res?.list) {
      taskData.value = res.list.map((item: any) => ({
        id: item.id,
        no: item.taskCode,
        name: item.taskName,
        planName: item.planName || item.planInfo?.planName,
        org: item.planInfo?.issuerDeptName || '--',
        area: item.detectionArea,
        variety: item.detectionVarieties,
        item: item.detectionItems,
        count: item.sampleCount,
        time: (item.startDate && item.endDate) ? `${item.startDate}至${item.endDate}` : '',
        status: '待接收'
      }))
      taskTotal.value = res.list.length || 0
    }
  } catch (error) {
    console.error('获取待接收任务失败:', error)
  }
}

const handleAcceptTask = async (row: any) => {
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
    if (error !== 'cancel') {
      console.error('接收任务失败:', error)
    }
  }
}

// 趋势图相关
const trendChartRef = ref<HTMLElement | null>(null)
let trendChartInstance: echarts.ECharts | null = null
const activeTaskType = ref('executed')

const trendForm = reactive({
  keyword: '',
  sample: '',
  category: '',
  area: '',
  org: '',
  result: ''
})

const getChartData = (type: string) => {
  if (type === 'executed') {
    return [20, 30, 60, 50, 40, 50, 44, 31, 32, 15, 18, 22]
  } else {
    return [40, 45, 30, 60, 55, 48, 50, 40, 35, 25, 30, 45]
  }
}

const toggleTaskType = (type: string) => {
  activeTaskType.value = type
  if (trendChartInstance) {
    trendChartInstance.setOption({
      series: [{
        data: getChartData(type)
      }]
    })
  }
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChartInstance = markRaw(echarts.init(trendChartRef.value))
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: '#e0e0e0'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 60,
      interval: 10,
      splitLine: {
        show: false
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      }
    },
    series: [
      {
        name: '任务完成率',
        type: 'line',
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 4,
        showSymbol: true,
        itemStyle: {
          color: '#00B3ED'
        },
        lineStyle: {
          color: '#00B3ED',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 179, 237, 0.4)' },
            { offset: 1, color: 'rgba(0, 179, 237, 0.1)' }
          ])
        },
        data: getChartData(activeTaskType.value)
      }
    ]
  }
  
  trendChartInstance.setOption(option)
  
  window.addEventListener('resize', () => {
    trendChartInstance?.resize()
  })
}

onMounted(() => {
  getNoticeList()
  getTaskList()
  nextTick(() => {
    initTrendChart()
  })
})
</script>

<style lang="scss" scoped>
.workbench-container {
  min-height: calc(100vh - 84px);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
}

.page-title {
  background-color: #fff;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.top-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 公告卡片 */
.notice-card {
  width: 340px;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  border: 1px solid #ebeef5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  &.border-none {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.card-subtitle {
  font-size: 12px;
  color: #999;
}

.view-all {
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.notice-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tag-new {
  background-color: #ff4d4f;
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
  line-height: 1;
  margin-bottom: -4px;
  z-index: 1;
}

.tag-risk {
  background-color: #52c41a;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;

  &.yellow {
    background-color: #faad14;
  }
}

.notice-content {
  flex: 1;
}

.notice-time {
  font-size: 12px;
  color: #333;
  margin-bottom: 4px;
  font-weight: 500;
}

.notice-title {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* 日历卡片 */
.calendar-card {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 26px 24px 24px;
  border: 1px solid #ebeef5;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 18px;

  .year-select {
    width: 180px;
  }

  .month-select {
    width: 140px;
  }

  .view-radio {
    margin-left: 0;
  }
}

.calendar-layout {
  position: relative;
  display: block;
  margin-top: 18px;
  overflow: hidden;
}

.calendar-wrapper {
  min-width: 0;

  :deep(.el-calendar__header) {
    display: none;
  }

  :deep(.el-calendar__body) {
    padding: 0;
  }

  :deep(.el-calendar-table td) {
    border-bottom: 1px solid #f0f0f0;
    border-right: none;
    border-left: none;
    border-top: none;
    vertical-align: top;
    transition: background-color 0.3s ease;
  }

  :deep(.el-calendar-table tr:last-child td) {
    border-bottom: none;
  }

  :deep(.el-calendar-table td.is-selected) {
    background-color: transparent;
  }

  :deep(.el-calendar-table .el-calendar-day) {
    height: 100px;
    padding: 10px;
    box-sizing: border-box;
  }

  :deep(.el-calendar-table th) {
    text-align: center;
    color: #999;
    font-weight: 400;
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 0;
    font-size: 14px;
  }
}

.calendar-wrapper {
  :deep(.date-cell) {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 10px;
    cursor: pointer;
    box-sizing: border-box;
    background: transparent;
    transition: all 0.3s ease;

    &:hover:not(.is-empty) {
      background: #fafcff;
    }

    &.is-active {
      background: #eaf6fb;
      border-radius: 4px;
    }

    &.is-empty {
      cursor: default;
      opacity: 0.5;
    }
  }

  :deep(.date-num) {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 14px;
    color: #666;
    line-height: 1;
    font-weight: 400;

    &.is-not-current {
      color: #dcdfe6;
    }
  }

  :deep(.date-meta) {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 8px;
    box-sizing: border-box;
  }

  :deep(.risk-link) {
    border: 1px solid #fbc4c4;
    background: #fef0f0;
    padding: 4px 6px;
    font-size: 12px;
    font-weight: 500;
    color: #f56c6c;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s ease;
    width: 96%;
    text-align: center;
    border-radius: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;

    &:hover {
      background: #f56c6c;
      color: #fff;
    }
  }

  :deep(.no-risk) {
    border: 1px solid #e9e9eb;
    background: #f4f4f5;
    padding: 4px 6px;
    font-size: 12px;
    font-weight: 500;
    color: #909399;
    width: 96%;
    text-align: center;
    border-radius: 4px;
    box-sizing: border-box;
    line-height: 1.2;
  }
}

.risk-detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 380px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #d9d9d9;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
  padding: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
    border-bottom: 1px solid #f0f0f0;

    .detail-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 0;
    }

    .close-btn {
      cursor: pointer;
      font-size: 20px;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;

      &:hover {
        color: #ff4d4f;
      }
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 18px 20px;
  }

  .detail-line {
    font-size: 14px;
    line-height: 2.2;
    word-break: break-all;
    color: #444;

    strong {
      color: #222;
      margin-right: 6px;
    }
  }
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
}

:deep(.calendar-actions .el-select .el-input__wrapper) {
  min-height: 62px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d9dfec inset;
}

:deep(.calendar-actions .el-select .el-input__inner) {
  font-size: 18px;
  color: #555;
}

:deep(.view-radio.el-radio-group) {
  border: 1px solid #d9dfec;
  border-radius: 6px;
  overflow: hidden;
  display: inline-flex;
}

:deep(.view-radio .el-radio-button__inner) {
  min-width: 60px;
  height: 36px;
  line-height: 36px;
  border: none !important;
  border-radius: 0 !important;
  font-size: 14px;
  color: #666;
  background: #fff;
  box-shadow: none !important;
  padding: 0 12px;
}

:deep(.view-radio .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #30b7f3;
  color: #fff;
}

/* 待接收任务 */
.task-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.table-container {
  :deep(.custom-header) {
    background-color: #f5f7fa !important;
    color: #333;
    font-weight: bold;
  }

  :deep(.el-table) {
    th.el-table__cell {
      text-align: center;
    }
  }

  .action-btn {
    color: #00B3ED;
    font-weight: 500;
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
  }
}

/* 趋势图 */
.trend-section {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  border: 1px solid #ebeef5;
  min-height: 200px;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.trend-actions {
  display: flex;
  gap: 0;

  .white-btn {
    color: #00B3ED;
    border-color: #00B3ED;
    background-color: #fff;
    z-index: 1;

    &:hover,
    &:focus {
      background-color: #f2f8fe;
      color: #00B3ED;
      border-color: #00B3ED;
    }
  }

  .blue-btn {
    background-color: #00B3ED;
    border-color: #00B3ED;
    color: #fff;
    
    &:hover,
    &:focus {
      background-color: #33c2f0;
      border-color: #33c2f0;
      color: #fff;
    }
  }
  
  .left-btn {
    border-radius: 4px 0 0 4px;
    margin-right: -1px;
  }
  
  .right-btn {
    border-radius: 0 4px 4px 0;
  }
}

.trend-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  .filter-item {
    width: 140px;
  }
  
  .input-item {
    width: 180px;
  }
  
  .export-btn {
    border-radius: 4px;
    background-color: #00B3ED;
    border-color: #00B3ED;
    color: #fff;
    
    &:hover,
    &:focus {
      background-color: #33c2f0;
      border-color: #33c2f0;
    }
  }
}

.trend-chart-title {
  margin-bottom: 10px;
  .title-text {
    font-size: 13px;
    color: #00B3ED;
    text-decoration: underline;
    cursor: pointer;
    font-weight: 500;
  }
}

.trend-chart-container {
  height: 400px;
  width: 100%;
}
</style>
