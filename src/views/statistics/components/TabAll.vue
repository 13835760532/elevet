<template>
  <div class="stat-content">
    <!-- 数据范围筛选 -->
    <StatisticsRangeFilter v-model:range-type="dateRangeType" v-model:date-range="dateRange" description="检测数据统计周期"
      @search="loadData" @reset="handleReset" />

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

        <!-- 橙色新卡片 -->
        <div class="stat-card orange-card">
          <div class="card-bg-icon">🧪</div>
          <div class="card-info">
            <div class="card-title">检测项目总量</div>
            <div class="card-value">{{ formatNumber(overview.detectionItemCount) }}</div>
          </div>
        </div>

        <!-- 紫色卡片 -->
        <div class="stat-card purple-card">
          <div class="card-bg-icon">📄</div>
          <div class="card-info">
            <div class="card-title">合格证开具份数</div>
            <div class="card-value">{{ formatNumber(overview.certificateIssueCount) }}</div>
          </div>
        </div>
        <div class="stat-card purple-card-light">
          <div class="card-bg-icon">📄</div>
          <div class="card-info">
            <div class="card-title">合格证收证份数</div>
            <div class="card-value">{{ formatNumber(overview.certificateVerifyCount) }}</div>
          </div>
        </div>

        <!-- 青色卡片 -->
        <div class="stat-card teal-card">
          <div class="card-bg-icon">📦</div>
          <div class="card-info">
            <div class="card-title">农产品查验份数</div>
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
        </div>
      </div>
      <div class="map-container">
        <div class="map-left">
          <Echart :options="mapChartOption" height="430px" width="100%" />
        </div>
        <div class="map-right">
          <!-- 右侧柱状图列表 -->
          <div class="bar-chart-list">
            <div class="bar-item" v-for="(item, index) in mapRankRows" :key="`${item.mapName}-${index}`">
              <span class="bar-label">{{ item.displayName }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
              <span class="bar-value">
                {{ formatNumber(item.value, item.fractionDigits || 0) }}{{ mapType === '阳性率分布' ? '%' : '' }}
              </span>
            </div>
          </div>
        </div>
        <div class="map-visual-legend" v-if="mapRows.length">
          <div class="legend-high">高</div>
          <div class="legend-scale"></div>
          <div class="legend-values">
            <span>{{ formatNumber(mapMaxValue, mapType === '阳性率分布' ? 2 : 0) }}</span>
            <span>{{ formatNumber(mapMinValue, mapType === '阳性率分布' ? 2 : 0) }}</span>
          </div>
          <div class="legend-low">低</div>
        </div>
      </div>
    </div>
    <!-- 业务风险及其他 -->
    <div class="risk-section-container">
      <div class="section-title">业务风险</div>
      <div class="risk-grid">
        <div class="risk-card" style="display: flex; flex-direction: column; height: 100%;">
          <div class="risk-header">
            <span class="risk-title">产品风险top排行榜</span>
            <div class="risk-actions">
              <el-radio-group v-model="productRiskType" class="map-radio" size="small">
                <el-radio-button label="检测量" />
                <el-radio-button label="阳性率" />
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content" style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
            <div class="horizontal-bar-list">
              <div class="h-bar-item" v-for="(item, index) in productRiskData" :key="index">
                <span class="h-bar-label">NO{{ index + 1 }} {{ item.name }}</span>
                <div class="h-bar-track">
                  <div class="h-bar-fill theme-fill" :style="{ width: item.percent + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="h-bar-axis">
              <span v-for="label in productRiskAxis" :key="label">{{ label }}</span>
            </div>
          </div>
        </div>

        <div class="risk-card">
          <div class="risk-header">
            <span class="risk-title">农产品品类风险</span>
            <div class="risk-actions">
              <el-radio-group v-model="categoryRiskType" class="map-radio" size="small">
                <el-radio-button label="检测量" />
                <el-radio-button label="阳性率" />
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div class="ranking-list category-list">
              <div class="ranking-header">
                <span class="header-rank">排名</span>
                <span class="header-name">品类名称</span>
                <span class="header-value">{{ categoryRiskType === '阳性率' ? '阳性率(%)' : categoryRiskType }}</span>
              </div>
              <div class="ranking-item" v-for="(item, index) in categoryRiskData" :key="item.name">
                <span :class="['rank-num', { 'top-three': index < 3 }]">{{ index + 1 }}</span>
                <span :class="['rank-name', { 'top-three-label': index < 3 }]">{{ item.name }}</span>
                <span class="rank-value">{{ formatNumber(item.value, item.fractionDigits || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="risk-card" style="display: flex; flex-direction: column; height: 100%;">
          <div class="risk-header">
            <span class="risk-title">检测项 风险top10</span>
            <div class="risk-actions">
              <el-radio-group v-model="pesticideRiskType" class="map-radio" size="small">
                <el-radio-button label="检测量" />
                <el-radio-button label="阳性率" />
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content" style="flex: 1; display: flex; flex-direction: column;">
            <div class="vertical-bar-chart">
              <div class="v-bar-item" v-for="(item, index) in pesticideRiskData" :key="index">
                <span class="v-bar-val">{{ item.displayValue }}</span>
                <div class="v-bar-track">
                  <div class="v-bar-fill green-fill" :style="{ height: item.percent + '%' }"></div>
                </div>
                <span class="v-bar-label" :title="item.name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="risk-card">
          <div class="risk-header">
            <span class="risk-title">区域风险排序</span>
            <div class="risk-actions">
              <el-radio-group v-model="regionRiskType" class="map-radio" size="small">
                <el-radio-button label="产地" />
                <el-radio-button label="检测地" />
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div class="ranking-list">
              <div class="ranking-header">
                <span class="header-rank">排名</span>
                <span class="header-name">区域名称</span>
                <span class="header-value">检测量</span>
              </div>
              <div class="ranking-item" v-for="(item, index) in regionRiskData" :key="index">
                <span :class="['rank-num', { 'top-three': index < 3 }]">{{ item.rank }}</span>
                <span :class="['rank-name', { 'top-three-label': index < 3 }]">{{ item.name }}</span>
                <span :class="['rank-value', { 'top-three-val': index < 3 }]">{{ formatNumber(item.value,
                  item.fractionDigits || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部两列 -->
      <div class="bottom-grid">
        <div class="risk-card" style="display: flex; flex-direction: column; height: 100%;">
          <div class="risk-header">
            <span class="risk-title">农产品-检测项 风险top10</span>
            <div class="risk-actions">
              <el-radio-group v-model="testItemRiskType" class="map-radio" size="small">
                <el-radio-button label="检测量" />
                <el-radio-button label="阳性率" />
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content" style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
            <div class="horizontal-bar-list">
              <div class="h-bar-item" v-for="(item, index) in testItemRiskData" :key="index">
                <span class="h-bar-label">{{ item.name }}</span>
                <div class="h-bar-track">
                  <div class="h-bar-fill theme-fill" :style="{ width: item.percent + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="h-bar-axis">
              <span v-for="label in testItemRiskAxis" :key="label">{{ label }}</span>
            </div>
          </div>
        </div>

        <div class="risk-card notice-card">
          <div class="risk-header">
            <div class="risk-title-wrapper">
              <span class="risk-title">业务风险公告</span>
              <span class="risk-subtitle">显示最近5分钟风险公告</span>
            </div>
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
import echarts from '@/plugins/echarts'
import chinaLiteGeo from '@/assets/data/map/geo/china-lite.json'
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
import dayjs from 'dayjs'

const REGION_SUFFIX_RE = /(省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区)$/g

const stripRegionSuffix = (name: string) => String(name || '').replace(REGION_SUFFIX_RE, '')

const STATISTICS_CHINA_MAP_NAME = 'statisticsChina'
const chinaMapFeatures = ((chinaLiteGeo as any)?.features || []) as any[]
const chinaMapNameLookup = new Map<string, string>()

chinaMapFeatures.forEach((feature) => {
  const featureName = String(feature?.properties?.name || '').trim()
  if (!featureName) return
  chinaMapNameLookup.set(featureName, featureName)
  chinaMapNameLookup.set(stripRegionSuffix(featureName), featureName)
})

echarts.registerMap(STATISTICS_CHINA_MAP_NAME, chinaLiteGeo as any)

const resolveMapName = (name: string) => {
  const rawName = String(name || '').trim()
  if (!rawName) return '--'
  const shortName = stripRegionSuffix(rawName)
  return chinaMapNameLookup.get(rawName) || chinaMapNameLookup.get(shortName) || rawName
}

const getProvinceDisplayName = (item: any) => {
  const areaName = String(item.areaName || '').trim()
  const provinceName = String(item.provinceName || '').trim()
  const rawName = provinceName || areaName.split(/[/-]/)[0] || item.cityName || '--'
  return stripRegionSuffix(rawName)
}

const getProvinceMapName = (item: any) => {
  const areaName = String(item.areaName || '').trim()
  const provinceName = String(item.provinceName || '').trim()
  return resolveMapName(provinceName || areaName.split(/[/-]/)[0] || item.cityName || '--')
}

const mergeProvinceRows = (rows: any[]) => {
  const merged = new Map<string, any>()
  rows.forEach((row) => {
    const key = row.mapName || row.displayName
    const oldRow = merged.get(key)
    if (!oldRow) {
      merged.set(key, { ...row })
      return
    }
    if (mapType.value === '阳性率分布') {
      merged.set(key, {
        ...oldRow,
        value: Math.max(oldRow.value, row.value)
      })
      return
    }
    merged.set(key, {
      ...oldRow,
      value: oldRow.value + row.value
    })
  })
  return Array.from(merged.values())
}

const dateRangeType = ref('近一周')
const dateRange = ref<string[]>([])
const overview = ref<DashboardOverviewRespVO>({})
const certificateOverview = ref<DashboardCertificateOverviewRespVO>({})

const mapType = ref('检测量分布')

const mapRows = ref<any[]>([])

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
  const rows = list.map((item) => {
    let val = getStatValue(item, statType)
    // Normalize decimals to 0-100 for percentage
    if (statType === '阳性率' && val <= 1 && val > 0) {
      val = val * 100
    }
    return {
      name: getName(item),
      value: val,
      fractionDigits: statType === '阳性率' ? 1 : 0,
      isPercent: statType === '阳性率'
    }
  })

  let axisMax = 100;
  if (statType === '检测量') {
    const rawMax = Math.max(...rows.map((item) => item.value), 0)
    let niceMax = Math.max(5, rawMax)
    const magnitude = Math.pow(10, Math.floor(Math.log10(niceMax)))
    const fraction = niceMax / magnitude
    let multiplier = 1
    if (fraction <= 1) multiplier = 1
    else if (fraction <= 2) multiplier = 2
    else if (fraction <= 5) multiplier = 5
    else multiplier = 10
    axisMax = multiplier * magnitude
  }

  return rows.map((item) => ({
    ...item,
    displayValue: item.isPercent ? `${formatNumber(item.value, 1)}%` : formatNumber(item.value, 0),
    percent: axisMax ? Math.max(4, Math.min(100, (item.value / axisMax) * 100)) : 0
  }))
}

const getAxisLabels = (data: any[], statType: '检测量' | '阳性率') => {
  if (statType === '阳性率') {
    return ['0', '20%', '40%', '60%', '80%', '100%']
  }
  const max = Math.max(...data.map(item => item.value), 0)
  let niceMax = Math.max(5, max)
  const magnitude = Math.pow(10, Math.floor(Math.log10(niceMax)))
  const fraction = niceMax / magnitude
  let multiplier = 1
  if (fraction <= 1) multiplier = 1
  else if (fraction <= 2) multiplier = 2
  else if (fraction <= 5) multiplier = 5
  else multiplier = 10

  niceMax = multiplier * magnitude
  const step = niceMax / 5
  return [0, 1, 2, 3, 4, 5].map(i => formatNumber(Math.round(i * step)))
}

const productRiskAxis = computed(() => getAxisLabels(productRiskData.value, productRiskType.value as any))
const testItemRiskAxis = computed(() => getAxisLabels(testItemRiskData.value, testItemRiskType.value as any))

const mapChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderColor: '#dce6f2',
    borderWidth: 1,
    textStyle: { color: '#2c3e50' },
    formatter: (params: any) => {
      const matched = mapRows.value.find((item) => item.mapName === params.name)
      const value = matched?.value ?? 0
      const valueText = formatNumber(value, matched?.fractionDigits || 0)
      return [
        `<div style="font-weight:600;margin-bottom:4px;">${matched?.displayName || stripRegionSuffix(params.name)}</div>`,
        `<div>业务类型：${mapType.value}</div>`,
        `<div>统计值：${valueText}${mapType.value === '阳性率分布' ? '%' : ''}</div>`
      ].join('')
    }
  },
  visualMap: {
    show: false,
    min: 0,
    max: Math.max(...mapRows.value.map((item) => item.value), 1),
    inRange: {
      color: ['#edf5ff', '#d7e8ff', '#b3d0ff', '#7fb1ff', '#3b82f6']
    }
  },
  series: [
    {
      name: mapType.value,
      type: 'map',
      map: STATISTICS_CHINA_MAP_NAME,
      mapType: STATISTICS_CHINA_MAP_NAME,
      roam: false,
      zoom: 1.08,
      top: '4%',
      bottom: '6%',
      left: '3%',
      right: '3%',
      aspectScale: 0.9,
      layoutCenter: ['50%', '52%'],
      layoutSize: '100%',
      label: {
        show: true,
        color: '#2f3a4f',
        fontSize: 12,
        formatter: (params: any) => stripRegionSuffix(params.name)
      },
      itemStyle: {
        areaColor: '#f7f9fd',
        borderColor: '#d8dde7',
        borderWidth: 1
      },
      emphasis: {
        label: { color: '#0f172a', fontWeight: 'bold' },
        itemStyle: {
          areaColor: '#7fb1ff',
          borderColor: '#3b82f6',
          borderWidth: 1.2
        }
      },
      data: mapRows.value.map((item) => ({
        name: item.mapName,
        value: item.value
      }))
    }
  ]
}))

const mapRankRows = computed(() => mapRows.value.slice(0, 13))
const mapMaxValue = computed(() => mapRankRows.value[0]?.value || 0)
const mapMinValue = computed(() => mapRankRows.value[mapRankRows.value.length - 1]?.value || 0)

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
    const rows = mergeProvinceRows(
      sourceList.map((item) => ({
        displayName: getProvinceDisplayName(item),
        mapName: getProvinceMapName(item),
        value: Number(
          mapType.value === '阳性率分布'
            ? (() => {
                const rate = Number(item.positiveRate || 0)
                return rate > 0 && rate <= 1 ? rate * 100 : rate
              })()
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
    )
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
    mapRows.value = rows.map((item) => ({
      ...item,
      percent: Math.max(4, Math.min(100, (item.value / (rows[0]?.value || 1)) * 100))
    }))
  } catch (error) {
    console.error('[StatisticsAll] load map data failed:', error)
    mapRows.value = []
  }
}

const DEFAULT_PRODUCT_RISK = [
  { productName: '示例一', detectionCount: 152, positiveRate: 0.85 },
  { productName: '示例二', detectionCount: 134, positiveRate: 0.72 },
  { productName: '示例三', detectionCount: 110, positiveRate: 0.61 },
  { productName: '示例四', detectionCount: 98, positiveRate: 0.55 },
  { productName: '示例五', detectionCount: 86, positiveRate: 0.45 },
  { productName: '示例六', detectionCount: 75, positiveRate: 0.38 },
  { productName: '示例七', detectionCount: 64, positiveRate: 0.22 },
  { productName: '示例八', detectionCount: 52, positiveRate: 0.18 },
  { productName: '示例九', detectionCount: 45, positiveRate: 0.12 },
  { productName: '示例十', detectionCount: 30, positiveRate: 0.08 }
]

const DEFAULT_PESTICIDE_RISK = [
  { pesticideName: '示例一', detectionCount: 120, positiveRate: 0.9 },
  { pesticideName: '示例二', detectionCount: 105, positiveRate: 0.8 },
  { pesticideName: '示例三', detectionCount: 95, positiveRate: 0.75 },
  { pesticideName: '示例四', detectionCount: 80, positiveRate: 0.6 },
  { pesticideName: '示例五', detectionCount: 75, positiveRate: 0.55 },
  { pesticideName: '示例六', detectionCount: 60, positiveRate: 0.45 },
  { pesticideName: '示例七', detectionCount: 50, positiveRate: 0.4 },
  { pesticideName: '示例八', detectionCount: 45, positiveRate: 0.35 },
  { pesticideName: '示例九', detectionCount: 30, positiveRate: 0.2 },
  { pesticideName: '示例十', detectionCount: 20, positiveRate: 0.15 }
]

const DEFAULT_PRODUCT_PESTICIDE = [
  { combineName: '示例一', detectionCount: 88, positiveRate: 0.12 },
  { combineName: '示例二', detectionCount: 76, positiveRate: 0.09 },
  { combineName: '示例三', detectionCount: 65, positiveRate: 0.85 },
  { combineName: '示例四', detectionCount: 54, positiveRate: 0.7 },
  { combineName: '示例五', detectionCount: 43, positiveRate: 0.65 },
  { combineName: '示例六', detectionCount: 38, positiveRate: 0.5 },
  { combineName: '示例七', detectionCount: 32, positiveRate: 0.45 },
  { combineName: '示例八', detectionCount: 28, positiveRate: 0.3 },
  { combineName: '示例九', detectionCount: 22, positiveRate: 0.25 },
  { combineName: '示例十', detectionCount: 15, positiveRate: 0.1 }
]

const DEFAULT_CATEGORY_RISK = [
  { category: '示例一', detectionCount: 520, positiveRate: 0.8 },
  { category: '示例二', detectionCount: 410, positiveRate: 0.6 },
  { category: '示例三', detectionCount: 330, positiveRate: 0.5 },
  { category: '示例四', detectionCount: 260, positiveRate: 0.4 },
  { category: '示例五', detectionCount: 190, positiveRate: 0.3 }
]

const DEFAULT_REGION_RISK = [
  { areaName: '示例一', detectionCount: 5000 },
  { areaName: '示例二', detectionCount: 4500 },
  { areaName: '示例三', detectionCount: 4000 },
  { areaName: '示例四', detectionCount: 3500 },
  { areaName: '示例五', detectionCount: 3000 },
  { areaName: '示例六', detectionCount: 2500 },
  { areaName: '示例七', detectionCount: 2000 },
  { areaName: '示例八', detectionCount: 1500 },
  { areaName: '示例九', detectionCount: 1000 },
  { areaName: '示例十', detectionCount: 500 }
]

const applyFallbackData = (
  productRiskList?: any[],
  productPesticideList?: any[],
  categoryRiskList?: any[],
  regionRiskList?: any[],
  pesticideRiskList?: any[]
) => {
  const pRisk = productRiskList?.length ? productRiskList : DEFAULT_PRODUCT_RISK
  productRiskData.value = toBarData(pRisk, (item) => item.productName || '--', productRiskType.value as any)

  const ppRisk = productPesticideList?.length ? productPesticideList : DEFAULT_PRODUCT_PESTICIDE
  testItemRiskData.value = toBarData(ppRisk, (item) => item.combineName || '--', testItemRiskType.value as any)

  const cRisk = categoryRiskList?.length ? categoryRiskList : DEFAULT_CATEGORY_RISK
  categoryRiskData.value = toBarData(cRisk, (item) => item.category || '--', categoryRiskType.value as any)

  const rRisk = regionRiskList?.length ? regionRiskList : DEFAULT_REGION_RISK
  const sortedRegionRiskList = [...rRisk].sort((a, b) => (b.detectionCount || 0) - (a.detectionCount || 0))
  regionRiskData.value = sortedRegionRiskList.map((item, index) => ({
    rank: index + 1,
    name: item.areaName || item.cityName || item.provinceName || '--',
    value: Number(item.detectionCount || 0),
    fractionDigits: 0
  }))

  const pestRisk = pesticideRiskList?.length ? pesticideRiskList : DEFAULT_PESTICIDE_RISK
  pesticideRiskData.value = toBarData(pestRisk, (item) => item.pesticideName || '--', pesticideRiskType.value as any)
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
    applyFallbackData(productRiskList, productPesticideList, categoryRiskList, regionRiskList, pesticideRiskList)
  } catch (error) {
    console.error('[StatisticsAll] load risk data failed:', error)
    applyFallbackData()
  }
}

const DEFAULT_RISK_NOTICES = [
  { id: 1, title: '示例一在抽检中发现农药残留呈阳性，已发预警' },
  { id: 2, title: '检测到示例二含有百菌清成分，存在高风险' },
  { id: 3, title: '示例三最新检测结果显示啶虫脒超标，请关注' },
  { id: 4, title: '示例四近期抽检发现克百威呈阳性风险' },
  { id: 5, title: '示例五在最新批次抽检中检出违禁农药成分' }
]

const loadNotices = async () => {
  try {
    // 此部分显示大屏中的风险内容，即按检测结果进行的风险公告（阳性内容）
    // TODO: 待后端提供对应接口后替换为真实 API 
    noticeData.value = DEFAULT_RISK_NOTICES.map((item, index) => ({
      id: item.id,
      time: dayjs().subtract(index + 1, 'minute').format('YYYY-MM-DD HH:mm'),
      title: item.title
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
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
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

.orange-card {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
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

  &.icon-blue {
    background: linear-gradient(135deg, #00B3ED, #0088cc);
  }

  &.icon-purple {
    background: linear-gradient(135deg, #8D76FF, #6c52ee);
  }

  &.icon-red {
    background: linear-gradient(135deg, #FF6B6B, #ee4c4c);
  }
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
  min-height: 520px;
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
  position: relative;
  display: flex;
  gap: 56px;
  height: 430px;
}

.map-left {
  flex: 1;
  min-width: 0;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.map-right {
  width: 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.bar-chart-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.bar-item {
  height: 23px;
  display: flex;
  align-items: center;
  gap: 14px;

  .bar-label {
    width: 48px;
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
    color: #5f6673;
    text-align: right;
    white-space: nowrap;
  }

  .bar-track {
    flex: 1;
    height: 15px;
    background-color: transparent;
    border-radius: 8px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background-color: #1e90ff;
    border-radius: 8px;
  }

  .bar-value {
    width: 68px;
    flex-shrink: 0;
    text-align: right;
    font-size: 18px;
    line-height: 1;
    color: #5f6673;
    font-variant-numeric: tabular-nums;
  }
}

.map-visual-legend {
  position: absolute;
  left: 0;
  bottom: 4px;
  display: grid;
  grid-template-columns: 28px 26px 56px;
  grid-template-rows: auto 116px auto;
  column-gap: 10px;
  align-items: center;
  color: #5f6673;
}

.legend-high,
.legend-low {
  grid-column: 1;
  font-size: 16px;
  font-weight: 600;
}

.legend-high {
  grid-row: 1;
}

.legend-low {
  grid-row: 3;
}

.legend-scale {
  grid-column: 1;
  grid-row: 2;
  width: 24px;
  height: 116px;
  border-radius: 2px;
  background: linear-gradient(to bottom, #3b82f6 0%, #8ab8ff 48%, #edf5ff 100%);
}

.legend-values {
  grid-column: 2 / 4;
  grid-row: 2;
  height: 116px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0;
  font-size: 16px;
  color: #5f6673;
  font-variant-numeric: tabular-nums;
}

/* 风险业务板块 */
.risk-section-container {
  margin-top: 20px;
  background-color: transparent;
}

.risk-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
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

.theme-fill {
  background-color: #00B3ED;
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
  gap: 12px;
}

.ranking-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 8px;
  margin-bottom: 4px;
  border-bottom: 1px dashed #ebeef5;
  color: #909399;
  font-size: 13px;
}

.header-rank {
  width: 28px;
  text-align: center;
}

.header-name {
  flex: 1;
}

.header-value {
  text-align: right;
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
  margin: 0 2px;
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

.top-three-label {
  font-weight: bold;
}

.rank-value {
  font-size: 14px;
  color: #666;
}

.rank-value.top-three-val {
  color: #fa8c16;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.vertical-bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
  min-height: 240px;
  padding-top: 30px;
  flex: 1;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.v-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.v-bar-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  width: 50px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-bar-val {
  font-size: 12px;
  color: #7ED321;
}

.v-bar-track {
  width: 30px;
  height: 100%;
  min-height: 150px;
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
