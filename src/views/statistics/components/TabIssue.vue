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
        <el-select v-model="region" placeholder="省/市/县" class="region-select" clearable>
          <el-option label="北京市" value="beijing" />
          <el-option label="上海市" value="shanghai" />
        </el-select>
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
            <div class="card-title">涉及样品量</div>
            <div class="card-value">10,273 <span class="unit">个</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">涉及生产经营主体量</div>
            <div class="card-value">10,273 <span class="unit">个</span></div>
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
        <el-select v-model="filters.issueType" placeholder="出证类型" class="filter-item"></el-select>
        <el-select v-model="filters.productName" placeholder="产品名称" class="filter-item"></el-select>
        <el-select v-model="filters.category" placeholder="产品类别" class="filter-item"></el-select>
        <el-select v-model="filters.origin" placeholder="产地" class="filter-item"></el-select>
        <el-button type="primary" class="export-btn">导出</el-button>
      </div>

      <!-- 图表区域 mock -->
      <div class="chart-area-wrapper">
        <div class="chart-header">
          <span class="chart-y-title">合格证数量</span>
        </div>
        <div class="svg-chart-container">
          <div class="chart-y-axis">
            <span>60</span><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
          </div>
          <div class="svg-wrapper">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="width: 100%; height: 300px;">
              <!-- yellow area -->
              <path d="M0,50 C100,40 200,40 300,100 C400,120 500,250 600,180 C700,250 800,250 900,50 C950,50 1000,100 L1000,300 L0,300 Z" fill="rgba(250, 166, 62, 0.2)" stroke="#faa63e" stroke-width="2"></path>
              <!-- purple area -->
              <path d="M0,250 C100,200 200,150 250,50 C300,60 400,150 500,200 C600,180 700,220 800,220 C900,250 1000,220 L1000,300 L0,300 Z" fill="rgba(163, 149, 255, 0.2)" stroke="#8D76FF" stroke-width="2"></path>
            </svg>
            <div class="chart-x-axis">
              <span v-for="i in 12" :key="i">{{ i }}月</span>
            </div>
            <div class="chart-grid-lines">
              <div class="grid-line" v-for="i in 6" :key="i"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table :data="tableData" style="width: 100%" border header-cell-class-name="custom-header">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="certNo" label="合格证编号" align="center" min-width="140" />
          <el-table-column prop="issueType" label="出证类型" align="center" width="100" />
          <el-table-column prop="productName" label="产品名称" align="center" width="100" />
          <el-table-column prop="category" label="产品类别" align="center" width="100" />
          <el-table-column prop="origin" label="产地" align="center" min-width="120" show-overflow-tooltip />
          <el-table-column prop="subject" label="生产经营主体" align="center" min-width="180" show-overflow-tooltip />
          <el-table-column prop="date" label="开具日期" align="center" width="150" />
          <el-table-column prop="contact" label="联系人(生产经营企业/个人)" align="center" min-width="160" />
          <el-table-column prop="phone" label="联系电话(生产经营企业/个人)" align="center" min-width="160" />
        </el-table>
        
        <div class="pagination-container">
          <div class="total-text">合计：1891条</div>
          <el-pagination background layout="prev, pager, next" :total="1891" :page-size="10" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const dateRangeType = ref('近一周')
const dateRange = ref([])
const region = ref('')

const filters = reactive({
  certNo: '',
  issueType: '',
  productName: '',
  category: '',
  origin: ''
})

const tableData = ref([
  { certNo: 'HGZ2025121290', issueType: '生产者', productName: '白菜', category: '蔬菜', origin: '山东省胶州市', subject: '山东胶州XXX合作社', date: '2025-12-12 16:00', contact: '秦艳萍', phone: '198****9980' },
  { certNo: 'HGZ2025121290', issueType: '收购者', productName: '黄瓜', category: '蔬菜', origin: '山东省胶州市', subject: '北京福莱生态科技有限公司', date: '2025-12-12 16:00', contact: '秦艳萍', phone: '198****9980' },
  { certNo: 'HGZ2025121290', issueType: '收购者', productName: '黄瓜', category: '蔬菜', origin: '山东省胶州市', subject: '北京福莱生态科技有限公司', date: '2025-12-12 16:00', contact: '秦艳萍', phone: '198****9980' },
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
  
  .region-select {
    width: 140px;
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
    margin-left: auto;
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
