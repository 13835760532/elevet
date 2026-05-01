<template>
    <div class="stat-content">
      <!-- 数据范围筛选 -->
      <div class="filter-section">
        <div class="filter-label">数据范围</div>
        <el-radio-group v-model="dateRangeType" class="date-radio">
          <el-radio-button label="近一周" />
          <el-radio-button label="近一月" />
          <el-radio-button label="今年" />
        </el-radio-group>
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
          end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker-custom" />
        <el-button type="primary" class="search-btn">查询</el-button>
        <el-button class="reset-btn">重置</el-button>
      </div>

      <!-- 整体业务概况 -->
      <div class="card-section">
        <div class="section-title">整体业务概况</div>
        <div class="overview-cards">
          <!-- 蓝色卡片 -->
          <div class="stat-card blue-card">
            <div class="card-bg-icon">¥</div>
            <div class="card-info">
              <div class="card-title">任务下发项</div>
              <div class="card-value">10,273</div>
            </div>
          </div>
          <div class="stat-card blue-card-light">
            <div class="card-bg-icon">¥</div>
            <div class="card-info">
              <div class="card-title">任务完成项</div>
              <div class="card-value">10,273</div>
            </div>
          </div>
          <div class="stat-card blue-card-light">
            <div class="card-bg-icon">¥</div>
            <div class="card-info">
              <div class="card-title">任务完成率</div>
              <div class="card-value">80%</div>
            </div>
          </div>

          <!-- 黄色卡片 -->
          <div class="stat-card yellow-card">
            <div class="card-bg-icon">🛡️</div>
            <div class="card-info">
              <div class="card-title">检测样品量</div>
              <div class="card-value">9,204</div>
            </div>
          </div>

          <!-- 紫色卡片 -->
          <div class="stat-card purple-card">
            <div class="card-bg-icon">📄</div>
            <div class="card-info">
              <div class="card-title">合格证开具份</div>
              <div class="card-value">6408</div>
            </div>
          </div>
          <div class="stat-card purple-card-light">
            <div class="card-bg-icon">📄</div>
            <div class="card-info">
              <div class="card-title">合格证查验量</div>
              <div class="card-value">6408</div>
            </div>
          </div>

          <!-- 青色卡片 -->
          <div class="stat-card teal-card">
            <div class="card-bg-icon">📦</div>
            <div class="card-info">
              <div class="card-title">农产品溯源查验</div>
              <div class="card-value">89402</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 业务覆盖群体 -->
      <div class="card-section">
        <div class="section-title">业务覆盖群体</div>
        <div class="coverage-group">
          <div class="coverage-item">
            <div class="coverage-icon icon-blue">
              <Icon icon="ep:monitor" :size="32" color="#fff" />
            </div>
            <div class="coverage-info">
              <div class="coverage-title">监管机构</div>
              <div class="coverage-value">1, 602</div>
            </div>
          </div>
          <div class="coverage-divider"></div>
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

      <!-- 业务分布地图 -->
      <div class="card-section map-section">
        <div class="map-header">
          <div class="section-title">业务分布地图</div>
          <div class="map-actions">
            <el-radio-group v-model="mapType" class="map-radio" size="small">
              <el-radio-button label="检测量分布" />
              <el-radio-button label="阳性率分布" />
              <el-radio-button label="任务监督分布" />
              <el-radio-button label="检测执行分布" />
              <el-radio-button label="合格证分布" />
            </el-radio-group>
            <span class="view-all">查看全部</span>
          </div>
        </div>
        <div class="map-container">
          <div class="map-left">
            <!-- 这里可以引入已有的 Map 组件 -->
            <div class="map-placeholder">地图加载中...</div>
          </div>
          <div class="map-right">
            <!-- 右侧柱状图列表 -->
            <div class="bar-chart-list">
              <div class="bar-item" v-for="(item, index) in rankData" :key="index">
                <span class="bar-label">{{ item.name }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="bar-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 业务风险及其他 -->
      <div class="risk-section-container">
        <div class="section-title">业务风险</div>
        <div class="risk-grid">
          <div class="risk-left">
            <div class="risk-card">
              <div class="risk-header">
                <span class="risk-title">产品风险top排行榜</span>
                <div class="risk-actions">
                  <el-radio-group v-model="productRiskType" class="map-radio" size="small">
                    <el-radio-button label="检测量" />
                    <el-radio-button label="阳性率" />
                  </el-radio-group>
                  <span class="view-all">查看所有</span>
                </div>
              </div>
              <div class="chart-content">
                <div class="horizontal-bar-list">
                  <div class="h-bar-item" v-for="(item, index) in productRiskData" :key="index">
                    <span class="h-bar-label">NO{{ index + 1 }} {{ item.name }}</span>
                    <div class="h-bar-track">
                      <div class="h-bar-fill yellow-fill" :style="{ width: item.percent + '%' }"></div>
                    </div>
                  </div>
                </div>
                <div class="h-bar-axis">
                  <span>0</span><span>0.2</span><span>0.4</span><span>0.6</span><span>0.8</span><span>1</span>
                </div>
              </div>
            </div>

            <div class="risk-card">
              <div class="risk-header">
                <span class="risk-title">产品检测项风险</span>
                <div class="risk-actions">
                  <el-radio-group v-model="testItemRiskType" class="map-radio" size="small">
                    <el-radio-button label="检测量" />
                    <el-radio-button label="阳性率" />
                  </el-radio-group>
                  <span class="view-all">查看所有</span>
                </div>
              </div>
              <div class="chart-content">
                <div class="horizontal-bar-list">
                  <div class="h-bar-item" v-for="(item, index) in testItemRiskData" :key="index">
                    <span class="h-bar-label">{{ item.name }}</span>
                    <div class="h-bar-track">
                      <div class="h-bar-fill yellow-fill" :style="{ width: item.percent + '%' }"></div>
                    </div>
                  </div>
                </div>
                <div class="h-bar-axis">
                  <span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span>
                </div>
              </div>
            </div>
          </div>

          <div class="risk-right">
            <div class="risk-card">
              <div class="risk-header">
                <span class="risk-title">农产品品类风险</span>
                <div class="risk-actions">
                  <el-radio-group v-model="categoryRiskType" class="map-radio" size="small">
                    <el-radio-button label="检测量" />
                    <el-radio-button label="阳性率" />
                  </el-radio-group>
                  <span class="view-all">查看所有</span>
                </div>
              </div>
              <div class="chart-content flex-center">
                <!-- 简单CSS饼图占位 -->
                <div class="pie-chart-mock"></div>
              </div>
            </div>

            <div class="risk-card">
              <div class="risk-header">
                <span class="risk-title">风险集中区域</span>
                <div class="risk-actions">
                  <el-radio-group v-model="regionRiskType" class="map-radio" size="small">
                    <el-radio-button label="产地" />
                    <el-radio-button label="检测地" />
                  </el-radio-group>
                  <span class="view-all">查看所有</span>
                </div>
              </div>
              <div class="chart-content">
                <div class="ranking-list">
                  <div class="ranking-item" v-for="(item, index) in regionRiskData" :key="index">
                    <span :class="['rank-num', { 'top-three': index < 3 }]">{{ item.rank }}</span>
                    <span class="rank-name">{{ item.name }}</span>
                    <span :class="['rank-value', { 'top-three-val': index < 3 }]">{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部两列 -->
        <div class="bottom-grid">
          <div class="risk-card">
            <div class="risk-header">
              <span class="risk-title">农药残留风险排行榜</span>
              <div class="risk-actions">
                <el-radio-group v-model="pesticideRiskType" class="map-radio" size="small">
                  <el-radio-button label="检测量" />
                  <el-radio-button label="阳性率" />
                </el-radio-group>
                <span class="view-all">查看所有</span>
              </div>
            </div>
            <div class="chart-content">
              <div class="vertical-bar-chart">
                <div class="v-bar-item" v-for="(item, index) in pesticideRiskData" :key="index">
                  <span class="v-bar-val">{{ item.value }}</span>
                  <div class="v-bar-track">
                    <div class="v-bar-fill green-fill" :style="{ height: (item.value / 500 * 100) + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="risk-card notice-card">
            <div class="risk-header">
              <div class="risk-title-wrapper">
                <span class="risk-title">业务风险公告</span>
                <span class="risk-subtitle">显示最近5分钟风险公告</span>
              </div>
              <span class="view-all">查看所有</span>
            </div>
            <div class="notice-list">
              <div class="notice-item" v-for="item in noticeData" :key="item.id">
                <div class="notice-tag">
                  <span class="tag-new" v-if="item.id < 3">new</span>
                  <span class="tag-risk">风险</span>
                </div>
                <div class="notice-content">
                  <div class="notice-time">{{ item.time }}</div>
                  <div class="notice-title">{{ item.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref('all')
const tabs = [
  { label: '全部', value: 'all', icon: 'ep:user' },
  { label: '检测任务', value: 'task', icon: 'ep:message' },
  { label: '快速检测', value: 'quick', icon: 'ep:home-filled' },
  { label: '合格证开具', value: 'issue', icon: 'ep:document' },
  { label: '合格证收证', value: 'verify', icon: 'ep:document-checked' },
  { label: '建档备案', value: 'filing', icon: 'ep:folder' }
]

const dateRangeType = ref('近一周')
const dateRange = ref([])

const mapType = ref('检测量分布')

const rankData = ref([
  { name: '浙江', value: 62310, percent: 95 },
  { name: '上海', value: 59190, percent: 90 },
  { name: '江苏', value: 45000, percent: 70 },
  { name: '安徽', value: 38000, percent: 60 },
  { name: '山东', value: 31000, percent: 50 },
  { name: '福建', value: 25000, percent: 40 },
])

const productRiskType = ref('检测量')
const testItemRiskType = ref('检测量')
const categoryRiskType = ref('检测量')
const regionRiskType = ref('产地')
const pesticideRiskType = ref('检测量')

const productRiskData = ref([
  { name: '芹菜', percent: 95 },
  { name: '菠菜', percent: 85 },
  { name: '韭菜', percent: 70 },
  { name: '萝卜', percent: 60 },
  { name: '青椒', percent: 55 },
  { name: '丝瓜', percent: 50 },
  { name: '南瓜', percent: 45 },
  { name: '黄瓜', percent: 42 },
  { name: '白菜', percent: 38 },
  { name: '生姜', percent: 25 },
])

const testItemRiskData = ref([
  { name: '丝瓜-甲氧基...', percent: 95 },
  { name: '地瓜-阿维菌素...', percent: 85 },
  { name: '四季豆-倍硫磷...', percent: 78 },
  { name: '南瓜-氟虫腈...', percent: 70 },
  { name: '西瓜-氟虫腈...', percent: 65 },
  { name: '白菜-毒死蜱...', percent: 55 },
  { name: '白菜-毒死蜱...', percent: 50 },
  { name: '白菜-毒死蜱...', percent: 45 },
  { name: '白菜-毒死蜱...', percent: 40 },
  { name: '白菜-毒死蜱...', percent: 35 },
])

const regionRiskData = ref([
  { rank: 1, name: '北京', value: 193 },
  { rank: 2, name: '上海', value: 187 },
  { rank: 3, name: '广州', value: 186 },
  { rank: 4, name: '武汉', value: 173 },
  { rank: 5, name: '南昌', value: 170 },
  { rank: 6, name: '山东', value: 162 },
  { rank: 7, name: '广西', value: 159 },
  { rank: 8, name: '广西', value: 159 },
  { rank: 9, name: '广西', value: 159 },
  { rank: 10, name: '广西', value: 159 },
])

const pesticideRiskData = ref([
  { name: '1', value: 460 },
  { name: '2', value: 450 },
  { name: '3', value: 430 },
  { name: '4', value: 400 },
  { name: '5', value: 350 },
  { name: '6', value: 175 },
  { name: '7', value: 150 },
  { name: '8', value: 130 },
  { name: '9', value: 120 },
])

const noticeData = ref([
  { id: 1, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 2, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 3, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 4, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
  { id: 5, time: '2025-10-01 17:56', title: '北京市昌平区东小口镇，农业农村局快检豇豆中发现氟虫腈超标;' },
])

</script>


<style lang="scss" scoped>
.statistics-container {
  min-height: calc(100vh - 120px);
  background-color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #333;
  border-radius: 8px;
}

/* 顶部 Tabs */
.stat-tabs-wrapper {
  background-color: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
}

.stat-tabs {
  display: flex;
  align-items: center;
  gap: 30px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 0;
  cursor: pointer;
  font-size: 15px;
  color: #606266;
  position: relative;
  transition: all 0.3s;

  &:hover {
    color: #00B3ED;
  }

  &.active {
    color: #00B3ED;
    font-weight: 500;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: #00B3ED;
      border-radius: 2px 2px 0 0;
    }
  }
}

.stat-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 16px 24px;
  border-radius: 4px;
  gap: 16px;

  .filter-label {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }

  .date-picker-custom {
    width: 260px;
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
  grid-template-columns: repeat(7, 1fr);
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
    font-size: 24px;
    font-weight: bold;
  }
}

/* 渐变色定义 */
.blue-card {
  background: linear-gradient(135deg, #6bb9ff 0%, #3e88ff 100%);
}

.blue-card-light {
  background: linear-gradient(135deg, #8dc8ff 0%, #61a6ff 100%);
}

.yellow-card {
  background: linear-gradient(135deg, #ffcf6b 0%, #faa63e 100%);
}

.purple-card {
  background: linear-gradient(135deg, #a395ff 0%, #7b61ff 100%);
}

.purple-card-light {
  background: linear-gradient(135deg, #b6aaff 0%, #907aff 100%);
}

.teal-card {
  background: linear-gradient(135deg, #74ded4 0%, #48b8ad 100%);
}

/* 业务覆盖群体 */
.coverage-group {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px 0;
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

  &.icon-blue {
    background-color: #00B3ED;
  }

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

/* 业务分布地图 */
.map-section {
  min-height: 400px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.map-actions {
  display: flex;
  align-items: center;
  gap: 20px;

  ::v-deep(.el-radio-button__inner) {
    border: none;
    background: transparent;
    color: #00B3ED;
    padding: 6px 16px;
    border-radius: 0;
  }

  ::v-deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: #00B3ED;
    color: #fff;
    box-shadow: none;
    border-radius: 2px;
  }

  .view-all {
    font-size: 14px;
    color: #333;
    cursor: pointer;
    font-weight: 500;
  }
}

.map-container {
  display: flex;
  gap: 40px;
  height: 350px;
}

.map-left {
  flex: 1;
  background-color: #f8fbff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.map-right {
  width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bar-chart-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;

  .bar-label {
    width: 40px;
    font-size: 14px;
    color: #666;
  }

  .bar-track {
    flex: 1;
    height: 12px;
    background-color: #f0f2f5;
    border-radius: 6px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background-color: #00B3ED;
    border-radius: 6px;
  }

  .bar-value {
    width: 50px;
    text-align: right;
    font-size: 14px;
    color: #333;
  }
}

/* 风险业务板块 */
.risk-section-container {
  margin-top: 20px;
  background-color: transparent;
}

.risk-grid {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.risk-left {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.risk-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.risk-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebeef5;
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.risk-title-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.risk-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.risk-subtitle {
  font-size: 12px;
  color: #999;
}

.risk-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.chart-content {
  position: relative;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px;
}

.horizontal-bar-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 10px;
}

.h-bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.h-bar-label {
  width: 120px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.h-bar-track {
  flex: 1;
  height: 12px;
  background-color: transparent;
}

.h-bar-fill {
  height: 100%;
  border-radius: 0 6px 6px 0;
}
.yellow-fill {
  background-color: #F8E71C;
}
.green-fill {
  background-color: #7ED321;
}

.h-bar-axis {
  display: flex;
  justify-content: space-between;
  margin-left: 132px;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 8px;
}

.pie-chart-mock {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    #8B5CF6 0% 30%,
    #3B82F6 30% 60%,
    #10B981 60% 80%,
    #F59E0B 80% 100%
  );
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90px;
    height: 90px;
    background-color: #fff;
    border-radius: 50%;
  }
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.rank-num.top-three {
  background-color: #ffe8cc;
  color: #fa8c16;
}

.rank-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.rank-value {
  font-size: 14px;
  color: #666;
}

.rank-value.top-three-val {
  color: #fa8c16;
}

.bottom-grid {
  display: flex;
  gap: 20px;
}

.bottom-grid .risk-card {
  flex: 2;
}

.bottom-grid .notice-card {
  flex: 1;
}

.vertical-bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 240px;
  padding-top: 30px;
  border-bottom: 1px solid #eee;
}

.v-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.v-bar-val {
  font-size: 12px;
  color: #7ED321;
}

.v-bar-track {
  width: 30px;
  height: 200px;
  background-color: transparent;
  display: flex;
  align-items: flex-end;
}

.v-bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
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
</style>
