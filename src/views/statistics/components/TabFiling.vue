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
            <div class="card-value">10,273 <span class="unit">↑</span></div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">涉及生产经营主体量</div>
            <div class="card-value">10,273 <span class="unit">↑</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体建档 -->
    <div class="card-section">
      <div class="section-title">主体建档</div>
      
      <!-- 第二层筛选 -->
      <div class="result-filters">
        <el-input v-model="filtersSubject.name" placeholder="主体名称" class="filter-item input-item" />
        <el-select v-model="filtersSubject.filingType" placeholder="备案类型" class="filter-item"></el-select>
        <el-select v-model="filtersSubject.subjectType" placeholder="主体类型" class="filter-item"></el-select>
        <el-select v-model="filtersSubject.region" placeholder="所属地区" class="filter-item"></el-select>
        <el-button type="primary" class="export-btn">导出</el-button>
      </div>

      <!-- 图表区域 mock -->
      <div class="chart-area-wrapper">
        <div class="chart-header">
          <span class="chart-y-title">主体数量</span>
        </div>
        <div class="svg-chart-container">
          <div class="chart-y-axis">
            <span>60</span><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
          </div>
          <div class="svg-wrapper">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="width: 100%; height: 300px;">
              <!-- purple area only -->
              <path d="M0,250 C100,200 200,150 250,50 C300,60 400,150 500,200 C600,180 700,220 800,220 C900,250 1000,220 L1000,300 L0,300 Z" fill="rgba(163, 149, 255, 0.2)" stroke="#8D76FF" stroke-width="2"></path>
              <!-- Add data points markers -->
              <circle cx="0" cy="250" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="150" cy="180" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="250" cy="50" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="350" cy="100" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="450" cy="180" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="550" cy="190" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="650" cy="200" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="750" cy="220" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="850" cy="240" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="1000" cy="220" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
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
        <el-table :data="tableDataSubject" style="width: 100%" border header-cell-class-name="custom-header">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="主体代码 (企业信用代码/身份证)" align="center" min-width="180" show-overflow-tooltip />
          <el-table-column prop="name" label="主体名称" align="center" min-width="120" />
          <el-table-column prop="filingType" label="备案类型" align="center" width="120" />
          <el-table-column prop="subjectType" label="主体类型" align="center" width="100" />
          <el-table-column prop="mainProduct" label="主营产品" align="center" min-width="140" show-overflow-tooltip />
          <el-table-column prop="region" label="所属地区" align="center" min-width="160" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" align="center" width="120" />
          <el-table-column prop="createOrg" label="创建机构" align="center" min-width="140" show-overflow-tooltip />
        </el-table>
        
        <div class="pagination-container">
          <div class="total-text">合计：1891条</div>
          <el-pagination background layout="prev, pager, next" :total="1891" :page-size="10" />
        </div>
      </div>
    </div>

    <!-- 产品建档 -->
    <div class="card-section">
      <div class="section-title">产品建档</div>
      
      <!-- 图表区域 mock -->
      <div class="chart-area-wrapper">
        <div class="chart-header">
          <span class="chart-y-title">产品数量</span>
        </div>
        <div class="svg-chart-container">
          <div class="chart-y-axis">
            <span>60</span><span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
          </div>
          <div class="svg-wrapper">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style="width: 100%; height: 300px;">
              <!-- purple area only -->
              <path d="M0,250 C100,200 200,150 250,50 C300,60 400,150 500,200 C600,180 700,220 800,220 C900,250 1000,220 L1000,300 L0,300 Z" fill="rgba(163, 149, 255, 0.2)" stroke="#8D76FF" stroke-width="2"></path>
              <!-- Add data points markers -->
              <circle cx="0" cy="250" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="150" cy="180" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="250" cy="50" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="350" cy="100" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="450" cy="180" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="550" cy="190" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="650" cy="200" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="750" cy="220" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="850" cy="240" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
              <circle cx="1000" cy="220" r="3" fill="#fff" stroke="#8D76FF" stroke-width="1.5" />
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
        <el-table :data="tableDataProduct" style="width: 100%" border header-cell-class-name="custom-header">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="产品编码" align="center" min-width="160" show-overflow-tooltip />
          <el-table-column prop="name" label="产品名称" align="center" width="100" />
          <el-table-column prop="category" label="产品类别" align="center" width="100" />
          <el-table-column prop="origin" label="产品产地" align="center" width="100" />
          <el-table-column prop="subjectType" label="被检主体类型" align="center" width="120" />
          <el-table-column prop="subjectName" label="主体名称" align="center" min-width="160" show-overflow-tooltip />
          <el-table-column prop="filingDate" label="建档日期" align="center" width="120" />
          <el-table-column prop="createOrg" label="创建机构" align="center" min-width="140" show-overflow-tooltip />
        </el-table>
        
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const dateRangeType = ref('近一周')
const dateRange = ref([])
const region = ref('')

const filtersSubject = reactive({
  name: '',
  filingType: '',
  subjectType: '',
  region: ''
})

const tableDataSubject = ref([
  { code: '1102011818788786816', name: '晓辉农场', filingType: '企业备案', subjectType: '生产', mainProduct: '黄瓜、西红柿', region: '北京市/北京市/海淀区', createTime: '20251219', createOrg: '北京市农业农村局' },
  { code: '210*********0925', name: '李娜', filingType: '个人备案', subjectType: '收购', mainProduct: '西红柿', region: '北京市', createTime: '20251219', createOrg: '北京市农业农村局' },
  { code: '1102011818788786816', name: '晓辉农场', filingType: '企业备案', subjectType: '储存', mainProduct: '草莓', region: '北京市', createTime: '20251219', createOrg: '北京市农业农村局' },
])

const tableDataProduct = ref([
  { code: 'CP20251230000001', name: '草莓', category: '蔬菜', origin: '北京-海淀', subjectType: '企业备案', subjectName: '北京三快信息技术有限公司', filingDate: '2025-12-19', createOrg: '北京市农业农村局' },
  { code: 'CP20251230000002', name: '香蕉', category: '水果', origin: '河北-廊坊', subjectType: '个人备案', subjectName: '秦艳萍', filingDate: '2025-12-19', createOrg: '北京市农业农村局' },
  { code: 'CP20251230000003', name: '菠菜', category: '茶叶', origin: '山东-济南', subjectType: '企业备案', subjectName: '北京三快信息技术有限公司', filingDate: '2025-12-19', createOrg: '北京市农业农村局' },
  { code: 'CP20251230000004', name: '黄瓜', category: '畜禽产品', origin: '广州-东莞', subjectType: '个人备案', subjectName: '秦艳萍', filingDate: '2025-12-19', createOrg: '北京市农业农村局' },
  { code: 'CP20251230000006', name: '芹菜', category: '其他', origin: '山西-大同', subjectType: '企业备案', subjectName: '北京三快信息技术有限公司', filingDate: '2025-12-19', createOrg: '北京市农业农村局' },
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
