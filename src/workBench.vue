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
          <div class="notice-item" v-for="item in noticeData" :key="item.id">
            <div class="notice-tag">
              <span class="tag-new" v-if="item.id <= 2">new</span>
              <span :class="['tag-risk', { 'yellow': item.id === 3 || item.id === 5 }]">风险</span>
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
            <el-select v-model="year" class="year-select" size="small">
              <el-option label="2021年" value="2021" />
            </el-select>
            <el-select v-model="month" class="month-select" size="small">
              <el-option label="8月" value="8" />
            </el-select>
            <el-radio-group v-model="viewType" size="small" class="view-radio">
              <el-radio-button label="月" />
              <el-radio-button label="日" />
            </el-radio-group>
          </div>
        </div>
        <div class="calendar-wrapper">
          <el-calendar v-model="calendarValue">
            <template #dateCell="{ data }">
              <div class="date-cell">
                <div class="date-num" :class="{ 'is-not-current': data.type !== 'current-month' }">
                  {{ parseInt(data.day.split('-')[2], 10) }}
                </div>
                <div v-if="data.type === 'current-month'">
                  <div v-if="hasRisk(data.day)" class="risk-link">风险日报</div>
                  <div v-else-if="isToday(data.day)" class="no-risk">暂无风险</div>
                </div>
              </div>
            </template>
          </el-calendar>
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
            <template #default>
              <el-button type="primary" link class="action-btn">接收</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <div class="total-text">合计18条</div>
          <el-pagination background layout="prev, pager, next" :total="18" :page-size="5" />
        </div>
      </div>
    </div>

    <!-- 任务完成率趋势图 -->
    <div class="trend-section">
      <div class="trend-header">
        <div class="section-title">任务完成率趋势图</div>
        <div class="trend-actions">
          <el-button class="white-btn">我执行的任务</el-button>
          <el-button type="primary" class="blue-btn">我下发的任务</el-button>
        </div>
      </div>
      <!-- 占位，预留图表位置 -->
      <div class="trend-chart-placeholder"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const noticeData = ref([
  { id: 1, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 2, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 3, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 4, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 5, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 6, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
])

const year = ref('2021')
const month = ref('8')
const viewType = ref('月')
const calendarValue = ref(new Date(2021, 7, 1))

const hasRisk = (dayStr: string) => {
  const day = parseInt(dayStr.split('-')[2], 10)
  return day >= 6 && day <= 13 && dayStr.includes('-08-')
}

const isToday = (dayStr: string) => {
  return dayStr === '2021-08-05'
}

const taskData = ref([
  { id: 1, no: 'RW20251101', name: '2026年北京市快速检测任务', planName: '2026年1月北京市、天津市蔬菜快速检测工作方案', org: '农业农村部农产品质量安全监管司', area: '北京市、天津市', variety: '黄瓜、西红柿、韭菜...', item: '灭多威、毒死蜱、灭蝇胺...', count: 600, time: '2025-10-1至2025-12-28', status: '待接收' },
  { id: 2, no: 'RW20251101', name: '2025年天津快速检测任务', planName: '2026年1月北京市、天津市蔬菜快速检测工作方案', org: '农业农村部农产品质量安全监管司', area: '北京市、天津市', variety: '水果', item: '2', count: 900, time: '2025-10-1', status: '待接收' },
  { id: 3, no: 'RW20251101', name: '2025年丹东快速检测任务', planName: '2026年1月辽宁蔬菜快速检测工作方案', org: '辽宁省农业农村厅', area: '辽宁省丹东市', variety: '水果', item: '3', count: 850, time: '2025-10-1', status: '待接收' },
  { id: 4, no: 'RW20251101', name: '2025年沈阳快速检测任务', planName: '2026年1月辽宁蔬菜快速检测工作方案', org: '辽宁省农业农村厅', area: '辽宁省沈阳市', variety: '水果', item: '2', count: 950, time: '2025-10-1', status: '待接收' },
  { id: 5, no: 'RW20251101', name: '2025年大连快速检测任务', planName: '2026年1月辽宁蔬菜快速检测工作方案', org: '辽宁省农业农村厅', area: '辽宁省大连市', variety: '畜禽', item: '1', count: 1000, time: '2025-10-1', status: '待接收' }
])
</script>

<style lang="scss" scoped>
.workbench-container {
  background-color: #f5f7f9;
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
  padding: 20px;
  border: 1px solid #ebeef5;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 12px;

  .year-select {
    width: 90px;
  }

  .month-select {
    width: 70px;
  }

  .view-radio {
    margin-left: 8px;
  }
}

.calendar-wrapper {
  margin-top: 10px;

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
  }

  :deep(.el-calendar-table tr:last-child td) {
    border-bottom: none;
  }

  :deep(.el-calendar-table td.is-selected) {
    background-color: #f2f8fe;
  }

  :deep(.el-calendar-table .el-calendar-day) {
    height: 80px;
    padding: 8px;
  }

  :deep(.el-calendar-table th) {
    text-align: center;
    color: #666;
    font-weight: normal;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
  }
}

.date-cell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.date-num {
  font-size: 14px;
  color: #333;
  margin-top: 4px;

  &.is-not-current {
    color: #c0c4cc;
  }
}

.risk-link {
  font-size: 12px;
  color: #00B3ED;
  cursor: pointer;
  text-decoration: underline;
}

.no-risk {
  font-size: 12px;
  color: #333;
  font-weight: bold;
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
    border-radius: 4px 0 0 4px;
    color: #00B3ED;
    border-color: #00B3ED;
    margin-right: -1px;
    z-index: 1;

    &:hover,
    &:focus {
      background-color: #f2f8fe;
    }
  }

  .blue-btn {
    border-radius: 0 4px 4px 0;
    background-color: #00B3ED;
    border-color: #00B3ED;
  }
}
</style>
