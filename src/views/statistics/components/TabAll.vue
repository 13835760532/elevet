<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter
      v-model:range-type="dateRangeType"
      v-model:date-range="dateRange"
      description="全部业务统计周期"
      @search="loadData"
      @reset="handleReset"
    />

    <!-- 整体业务概况 -->
    <div class="card-section">
      <div class="section-title">整体业务概况</div>
      <div class="overview-cards">
        <!-- 蓝色卡片 -->
        <div class="stat-card blue-card">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务下发项</div>
            <div class="card-value">{{ formatNumber(overview.taskIssuedCount) }}</div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成项</div>
            <div class="card-value">{{ formatNumber(overview.taskCompletedCount) }}</div>
          </div>
        </div>
        <div class="stat-card blue-card-light">
          <div class="card-bg-icon">¥</div>
          <div class="card-info">
            <div class="card-title">任务完成率</div>
            <div class="card-value">{{ formatPercent(overview.taskCompletionRate) }}</div>
          </div>
        </div>

        <!-- 黄色卡片 -->
        <div class="stat-card yellow-card">
          <div class="card-bg-icon">🛡️</div>
          <div class="card-info">
            <div class="card-title">检测样品量</div>
            <div class="card-value">{{ formatNumber(overview.sampleCount) }}</div>
          </div>
        </div>

        <!-- 紫色卡片 -->
        <div class="stat-card purple-card">
          <div class="card-bg-icon">📄</div>
          <div class="card-info">
            <div class="card-title">合格证开具份</div>
            <div class="card-value">{{ formatNumber(overview.certificateIssueCount) }}</div>
          </div>
        </div>
        <div class="stat-card purple-card-light">
          <div class="card-bg-icon">📄</div>
          <div class="card-info">
            <div class="card-title">合格证查验量</div>
            <div class="card-value">{{ formatNumber(overview.certificateVerifyCount) }}</div>
          </div>
        </div>

        <!-- 青色卡片 -->
        <div class="stat-card teal-card">
          <div class="card-bg-icon">📦</div>
          <div class="card-info">
            <div class="card-title">农产品溯源查验</div>
            <div class="card-value">{{ formatNumber(certificateOverview.traceCount) }}</div>
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
            <div class="coverage-value">{{ formatNumber(overview.supervisorCount) }}</div>
          </div>
        </div>
        <div class="coverage-divider"></div>
        <div class="coverage-item">
          <div class="coverage-icon icon-purple">
            <Icon icon="ep:service" :size="32" color="#fff" />
          </div>
          <div class="coverage-info">
            <div class="coverage-title">检测机构</div>
            <div class="coverage-value">{{ formatNumber(overview.detectionOrgCount) }}</div>
          </div>
        </div>
        <div class="coverage-divider"></div>
        <div class="coverage-item">
          <div class="coverage-icon icon-red">
            <Icon icon="ep:view" :size="32" color="#fff" />
          </div>
          <div class="coverage-info">
            <div class="coverage-title">生产经营主体</div>
            <div class="coverage-value">{{ formatNumber(overview.enterpriseCount) }}</div>
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
          <Echart :options="mapChartOption" height="320px" />
        </div>
        <div class="map-right">
          <!-- 右侧柱状图列表 -->
          <div class="bar-chart-list">
            <div class="bar-item" v-for="(item, index) in rankData" :key="index">
              <span class="bar-label">{{ item.name }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
              <span class="bar-value">{{ formatNumber(item.value, item.fractionDigits || 0) }}</span>
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
              <div class="ranking-list category-list">
                <div class="ranking-item" v-for="(item, index) in categoryRiskData" :key="item.name">
                  <span :class="['rank-num', { 'top-three': index < 3 }]">{{ index + 1 }}</span>
                  <span class="rank-name">{{ item.name }}</span>
                  <span class="rank-value">{{ formatNumber(item.value, item.fractionDigits || 0) }}</span>
                </div>
              </div>
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
                <span :class="['rank-value', { 'top-three-val': index < 3 }]">{{ formatNumber(item.value, item.fractionDigits || 0) }}</span>
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
                <span class="v-bar-val">{{ formatNumber(item.value, item.fractionDigits || 0) }}</span>
                <div class="v-bar-track">
                  <div class="v-bar-fill green-fill" :style="{ height: item.percent + '%' }"></div>
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
import { computed, onMounted, ref, watch } from 'vue'
import StatisticsRangeFilter from './StatisticsRangeFilter.vue'
import { Echart } from '@/components/Echart'
import {
  getCategoryRisk,
  getDashboardMapData,
  getDashboardOverview,
  getPesticideRiskTop10,
  getProduceRiskTop10,
  getProductPesticideTop10,
  getRiskAreaTop10,
  type DashboardOverviewRespVO
} from '@/api/agri/dashboard'
import {
  getCertificateOverview,
  getCertificateMap,
  type DashboardCertificateOverviewRespVO
} from '@/api/agri/dashboard/certificate'
import { getTaskMap } from '@/api/agri/dashboard/task'
import { getNoticePage, type NoticeVO } from '@/api/system/notice'
import { buildRangeParams, formatNumber, formatPercent, getStatValue } from './statisticsData'
import { formatDate } from '@/utils/formatTime'

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const overview = ref<DashboardOverviewRespVO>({})
const certificateOverview = ref<DashboardCertificateOverviewRespVO>({})

const mapType = ref('检测量分布')

const rankData = ref<any[]>([])

const productRiskType = ref('检测量')
const testItemRiskType = ref('检测量')
const categoryRiskType = ref('检测量')
const regionRiskType = ref('产地')
const pesticideRiskType = ref('检测量')

const productRiskData = ref<any[]>([])
const testItemRiskData = ref<any[]>([])
const categoryRiskData = ref<any[]>([])
const regionRiskData = ref<any[]>([])
const pesticideRiskData = ref<any[]>([])
const noticeData = ref<Array<{ id?: number; time: string; title: string }>>([])

const queryParams = computed(() => buildRangeParams(dateRangeType.value, dateRange.value))

const toBarData = (list: any[], getName: (item: any) => string, statType: '检测量' | '阳性率') => {
  const rows = list.map((item) => ({
    name: getName(item),
    value: getStatValue(item, statType),
    fractionDigits: statType === '阳性率' ? 2 : 0
  }))
  const max = Math.max(...rows.map((item) => item.value), 0)
  return rows.map((item) => ({
    ...item,
    percent: max ? Math.max(4, Math.min(100, (item.value / max) * 100)) : 0
  }))
}

const mapChartOption = computed(() => ({
  grid: { top: 18, right: 16, bottom: 28, left: 56 },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'value' },
  yAxis: {
    type: 'category',
    inverse: true,
    data: rankData.value.map((item) => item.name)
  },
  series: [
    {
      type: 'bar',
      data: rankData.value.map((item) => item.value),
      barWidth: 12,
      itemStyle: { color: '#00B3ED', borderRadius: [0, 8, 8, 0] }
    }
  ]
}))

const loadOverview = async () => {
  try {
    const [overviewData, certificateData] = await Promise.all([
      getDashboardOverview(queryParams.value),
      getCertificateOverview(queryParams.value)
    ])
    overview.value = overviewData || {}
    certificateOverview.value = certificateData || {}
  } catch (error) {
    console.error('[StatisticsAll] load overview failed:', error)
    overview.value = {}
    certificateOverview.value = {}
  }
}

const loadMapData = async () => {
  try {
    const isTaskMap = mapType.value === '任务监督分布' || mapType.value === '检测执行分布'
    const isCertificateMap = mapType.value === '合格证分布'
    const data = isTaskMap
      ? await getTaskMap({
          ...queryParams.value,
          areaLevel: '1'
        })
      : isCertificateMap
      ? await getCertificateMap({
          ...queryParams.value,
          areaLevel: '1'
        })
      : await getDashboardMapData({
          ...queryParams.value,
          areaLevel: '1'
        })
    const sourceList = isCertificateMap
      ? (data as any)?.issueList || []
      : Array.isArray(data)
      ? data
      : []
    const rows = sourceList
      .map((item) => ({
        name: item.areaName || item.cityName || item.provinceName || '--',
        value: Number(
          mapType.value === '阳性率分布'
            ? item.positiveRate || 0
            : mapType.value === '任务监督分布'
            ? item.taskIssuedCount || 0
            : mapType.value === '检测执行分布'
            ? item.taskCompletedCount || 0
            : mapType.value === '合格证分布'
            ? item.count || 0
            : item.sampleCount || 0
        ),
        fractionDigits: mapType.value === '阳性率分布' ? 2 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    const max = Math.max(...rows.map((item) => item.value), 0)
    rankData.value = rows.map((item) => ({
      ...item,
      percent: max ? Math.max(4, Math.min(100, (item.value / max) * 100)) : 0
    }))
  } catch (error) {
    console.error('[StatisticsAll] load map data failed:', error)
    rankData.value = []
  }
}

const loadRiskData = async () => {
  try {
    const [
      productRiskList,
      productPesticideList,
      categoryRiskList,
      regionRiskList,
      pesticideRiskList
    ] = await Promise.all([
      getProduceRiskTop10({
        ...queryParams.value,
        statType: productRiskType.value === '阳性率' ? '2' : '1'
      }),
      getProductPesticideTop10({
        ...queryParams.value,
        statType: testItemRiskType.value === '阳性率' ? '2' : '1'
      }),
      getCategoryRisk({
        ...queryParams.value,
        statType: categoryRiskType.value === '阳性率' ? '2' : '1'
      }),
      getRiskAreaTop10({
        ...queryParams.value,
        areaType: regionRiskType.value === '产地' ? '1' : '2',
        areaLevel: '1'
      }),
      getPesticideRiskTop10({
        ...queryParams.value,
        statType: pesticideRiskType.value === '阳性率' ? '2' : '1'
      })
    ])
    productRiskData.value = toBarData(productRiskList || [], (item) => item.productName || '--', productRiskType.value as any)
    testItemRiskData.value = toBarData(productPesticideList || [], (item) => item.combineName || '--', testItemRiskType.value as any)
    categoryRiskData.value = toBarData(categoryRiskList || [], (item) => item.category || '--', categoryRiskType.value as any)
    regionRiskData.value = (regionRiskList || []).map((item, index) => ({
      rank: item.rank || index + 1,
      name: item.areaName || item.cityName || item.provinceName || '--',
      value: Number(item.positiveRate || 0),
      fractionDigits: 2
    }))
    pesticideRiskData.value = toBarData(pesticideRiskList || [], (item) => item.pesticideName || '--', pesticideRiskType.value as any)
  } catch (error) {
    console.error('[StatisticsAll] load risk data failed:', error)
    productRiskData.value = []
    testItemRiskData.value = []
    categoryRiskData.value = []
    regionRiskData.value = []
    pesticideRiskData.value = []
  }
}

const loadNotices = async () => {
  try {
    const data = await getNoticePage({
      pageNo: 1,
      pageSize: 5,
      status: 0
    } as any)
    noticeData.value = ((data?.list || []) as NoticeVO[]).map((item) => ({
      id: item.id,
      time: item.createTime ? formatDate(item.createTime, 'YYYY-MM-DD HH:mm') : '--',
      title: item.title || '--'
    }))
  } catch (error) {
    console.error('[StatisticsAll] load notices failed:', error)
    noticeData.value = []
  }
}

const loadData = () => {
  loadOverview()
  loadMapData()
  loadRiskData()
  loadNotices()
}

const handleReset = () => {
  dateRangeType.value = '近一周'
  dateRange.value = []
  loadData()
}

watch([dateRangeType, dateRange], loadData)
watch([mapType], loadMapData)
watch([productRiskType, testItemRiskType, categoryRiskType, regionRiskType, pesticideRiskType], loadRiskData)

onMounted(() => {
  loadData()
})

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

/* 卡片通用 */
.card-section {
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background: #00B3ED;
    margin-right: 10px;
    border-radius: 2px;
  }
}

/* 整体业务概况卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 16px;
}

.stat-card {
  position: relative;
  height: 110px;
  border-radius: 12px;
  padding: 20px 16px;
  overflow: hidden;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
    &::before {
      opacity: 0.3;
      transform: scale(1.2);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: -20%;
    right: -10%;
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    transition: all 0.6s ease;
  }

  .card-bg-icon {
    position: absolute;
    right: 8px;
    bottom: -12px;
    font-size: 56px;
    opacity: 0.12;
    font-weight: 800;
    pointer-events: none;
  }

  .card-info {
    position: relative;
    z-index: 1;
  }

  .card-title {
    font-size: 13px;
    opacity: 0.85;
    margin-bottom: 6px;
    font-weight: 500;
    white-space: nowrap;
  }

  .card-value {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* 渐变色定义 */
.blue-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.blue-card-light {
  background: linear-gradient(135deg, #74ebd5 0%, #9face6 100%);
}

.yellow-card {
  background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%);
}

.purple-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.purple-card-light {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.teal-card {
  background: linear-gradient(135deg, #13f1fc 0%, #0470dc 100%);
}

/* 业务覆盖群体 */
.coverage-group {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 30px 0;
  background: #fafcff;
  border-radius: 12px;
}

.coverage-item {
  display: flex;
  align-items: center;
  gap: 24px;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
  }
}

.coverage-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

  &.icon-blue { background: linear-gradient(135deg, #00B3ED, #0088cc); }
  &.icon-purple { background: linear-gradient(135deg, #8D76FF, #6c52ee); }
  &.icon-red { background: linear-gradient(135deg, #FF6B6B, #ee4c4c); }
}

.coverage-info {
  .coverage-title {
    font-size: 14px;
    color: #888;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .coverage-value {
    font-size: 32px;
    font-weight: 800;
    color: #2c3e50;
  }
}

.coverage-divider {
  width: 1px;
  height: 70px;
  background: linear-gradient(to bottom, transparent, #e0e6ed, transparent);
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
