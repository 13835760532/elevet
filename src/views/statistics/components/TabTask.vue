<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <div class="filter-section filter-task">
      <div class="filter-left">
        <div class="filter-label">数据范围</div>
        <el-radio-group v-model="dateRangeType" class="date-radio">
          <el-radio-button label="近一周" />
          <el-radio-button label="近一月" />
          <el-radio-button label="今年" />
        </el-radio-group>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker-custom" />
        <el-select v-model="unit" placeholder="承担单位" class="unit-select" clearable>
          <el-option label="海淀区农检站" value="haidian" />
          <el-option label="昌平区农检站" value="changping" />
        </el-select>
        <el-input v-model="keyword" placeholder="任务名称/任务编号" class="keyword-input" clearable />
      </div>
      <div class="filter-right">
        <el-button class="reset-btn">重置</el-button>
        <el-button type="primary" class="search-btn">查询</el-button>
      </div>
    </div>

    <!-- 整体业务概况 -->
    <div class="card-section">
      <div class="section-title">整体业务概况</div>
      <div class="overview-cards">
        <div class="stat-card blue-card">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务下发（检测项）</div>
            <div class="card-value">10,273 <span class="unit">项次</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成（检测项）</div>
            <div class="card-value">10,273 <span class="unit">项次</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成率</div>
            <div class="card-value">80%</div>
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
            <div class="coverage-value">27, 030</div>
          </div>
        </div>
        <div class="coverage-divider"></div>
        <div class="coverage-item">
          <div class="coverage-icon icon-red">
            <Icon icon="ep:view" :size="32" color="#fff" />
          </div>
          <div class="coverage-info">
            <div class="coverage-title">生产经营主体</div>
            <div class="coverage-value">1, 452, 856</div>
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
        <el-button type="primary" class="export-btn">导出</el-button>
      </div>
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="taskNo" label="任务编号" align="center" />
          <el-table-column prop="taskName" label="任务名称" align="center" show-overflow-tooltip />
          <el-table-column prop="unit" label="承担单位" align="center" />
          <el-table-column prop="issued" label="任务下达" align="center" />
          <el-table-column prop="completed" label="任务完成" align="center" />
          <el-table-column prop="rate" label="当前完成率" align="center" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const dateRangeType = ref('近一周')
const dateRange = ref([])
const unit = ref('')
const keyword = ref('')

const tableData = ref([
  { taskNo: 'XXX', taskName: '2025北京蔬菜专项检测任务', unit: '海淀区农检站', issued: 100, completed: 85, rate: '30%' },
  { taskNo: 'XXX', taskName: '2025北京蔬菜专项检测任务', unit: '昌平区农检站', issued: 100, completed: 85, rate: '15%' },
  { taskNo: 'XXX', taskName: '2026北京蔬菜专项检测任务', unit: '海淀区农检站', issued: 100, completed: 85, rate: '20%' },
  { taskNo: 'XXX', taskName: '2025北京蔬菜专项检测任务', unit: '海淀区农检站', issued: 100, completed: 85, rate: '30%' },
  { taskNo: 'XXX', taskName: '2026北京蔬菜专项检测任务', unit: '昌平区农检站', issued: 100, completed: 85, rate: '15%' },
])

</script>

<style lang="scss" scoped>
.stat-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 16px 24px;
  border-radius: 4px;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .filter-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .filter-label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  .date-picker-custom {
    width: 260px;
  }
  
  .unit-select {
    width: 180px;
  }
  
  .keyword-input {
    width: 220px;
  }

  .search-btn {
    background-color: #00B3ED;
    border-color: #00B3ED;
  }
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
</style>
