<template>
  <section class="right-section">
    <BigPanelCard class="analysis-panel" title="合格证分析" :bg-image="rightBg">
      <div class="analysis-wrap">
        <p class="analysis-title">合格证出具类型</p>
        <div class="analysis-layout">
          <div class="analysis-pie">
            <Echart :options="analysisOption" height="100%" width="100%" />
          </div>
          <div class="analysis-legend">
            <div class="legend-row" v-for="item in analysisLegendItems" :key="item.name">
              <span class="dot" :style="{ background: item.color }"></span>
              <span class="name">{{ item.name }}</span>
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard
      class="rank-panel"
      title="合格证开具榜单"
      :tabs="['累计']"
      active-tab="累计"
    >
      <div class="rank-container">
        <table class="rank-table">
          <thead>
            <tr>
              <th width="92">排行</th>
              <th>开具主体</th>
              <th width="104">份数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in displayedIssueRank" :key="`issue-${idx}-${item.name}`">
              <td>
                <div class="rank-badge" :class="`badge-top-${idx + 1}`">
                  {{ String(idx + 1).padStart(2, '0') }}
                </div>
              </td>
              <td class="name-cell">{{ item.name }}</td>
              <td class="value-cell">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>

    <BigPanelCard
      class="rank-panel"
      title="合格证存证排行榜"
      :tabs="['累计']"
      active-tab="累计"
    >
      <div class="rank-container">
        <table class="rank-table">
          <thead>
            <tr>
              <th width="92">排行</th>
              <th>存证主体</th>
              <th width="104">份数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in displayedStoreRank" :key="`store-${idx}-${item.name}`">
              <td>
                <div class="rank-badge" :class="`badge-top-${idx + 1}`">
                  {{ String(idx + 1).padStart(2, '0') }}
                </div>
              </td>
              <td class="name-cell">{{ item.name }}</td>
              <td class="value-cell">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import BigPanelCard from '../bigscreen/BigPanelCard.vue'
import rightBg from '@/assets/imgs/echarts/合格证/Frame 60_bg.png'
import {
  getCertificateIssueTop10,
  getCertificateTypeDistribution,
  getCertificateVerificationTop10,
  type CertificateIssueTopRespVO,
  type CertificateTypeDistributionRespVO,
  type CertificateVerificationTopRespVO
} from '@/api/agri/dashboard/certificate'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config'
import { cachedBigScreenRequest } from '../bigscreen/requestCache'

interface RankItem {
  name: string
  value: number | string
}

const RANK_ROW_COUNT = 10

const PIE_TYPE_META: Record<number, { name: string; color: string }> = {
  1: { name: '生产者', color: '#3ba4ff' },
  2: { name: '收购者', color: '#76cf3f' },
  3: { name: '批发市场', color: '#f6b23c' }
}

const issueRank = ref<RankItem[]>([])
const distributionData = ref<CertificateTypeDistributionRespVO[]>([])
const storeRank = ref<RankItem[]>([])

const toTenRankRows = (list: RankItem[]) =>
  Array.from({ length: RANK_ROW_COUNT }, (_, index) => list[index] || { name: '--', value: '--' })

const normalizeDistribution = (list: CertificateTypeDistributionRespVO[] = []) => {
  const distributionMap = new Map(list.map((item) => [item.certificateType, item]))
  return [1, 2, 3]
    .map((type) => {
      const current = distributionMap.get(type)
      const meta = PIE_TYPE_META[type]
      return {
        value: Number(current?.count || 0),
        name: current?.typeName || meta.name,
        color: meta.color
      }
    })
    .sort((a, b) => b.value - a.value)
}

const analysisItems = computed(() => normalizeDistribution(distributionData.value))
const analysisPieItems = computed(() => analysisItems.value.filter((item) => item.value > 0))
const analysisLegendItems = computed(() =>
  analysisPieItems.value.length ? analysisPieItems.value : analysisItems.value
)
const displayedIssueRank = computed(() => toTenRankRows(issueRank.value))
const displayedStoreRank = computed(() => toTenRankRows(storeRank.value))

const analysisOption = computed(() => ({
  animation: false,
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: ({ name, value }: { name: string; value: number }) => `${name}<br/>${value}`
  },
  series: [
    {
      type: 'pie',
      radius: ['69%', '78%'],
      center: ['46%', '54%'],
      silent: true,
      z: 0,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: {
        color: 'rgba(44, 150, 255, 0.12)',
        shadowBlur: 12,
        shadowColor: 'rgba(37, 156, 255, 0.36)'
      },
      data: [
        {
          value: Math.max(
            analysisPieItems.value.reduce((total, item) => total + item.value, 0),
            1
          ),
          name: ''
        }
      ]
    },
    {
      type: 'pie',
      radius: ['48%', '66%'],
      center: ['46%', '54%'],
      minAngle: 8,
      avoidLabelOverlap: true,
      z: 2,
      label: {
        show: true,
        color: '#d6eefe',
        fontSize: 12,
        formatter: (params: { name: string; value: number; dataIndex: number }) => {
          if (params.value <= 0) return ''
          const valueStyle = `value${params.dataIndex}`
          return `{name|${params.name}}\n{${valueStyle}|${params.value}}`
        },
        rich: {
          name: { color: '#d6eefe', fontSize: 12, lineHeight: 16 },
          ...Object.fromEntries(
            analysisPieItems.value.map((item, index) => [
              `value${index}`,
              { color: item.color, fontSize: 12, lineHeight: 16, fontWeight: 700 }
            ])
          )
        }
      },
      labelLine: {
        show: true,
        length: 11,
        length2: 18,
        lineStyle: { color: 'rgba(222, 246, 255, 0.86)', width: 1.2 }
      },
      itemStyle: {
        borderColor: 'rgba(7, 16, 38, 0.96)',
        borderWidth: 4,
        shadowBlur: 8,
        shadowColor: 'rgba(0, 0, 0, 0.2)'
      },
      data: analysisPieItems.value.map((item) => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: item.color },
            { offset: 1, color: 'rgba(15, 52, 95, 0.9)' }
          ])
        },
        labelLine: {
          lineStyle: { color: item.color }
        }
      }))
    }
  ]
}))

const formatRankList = (list: CertificateVerificationTopRespVO[] = []) =>
  list.map((item) => ({
    name: item.subjectName || '--',
    value: Number(item.count || 0)
  }))

const formatIssueRankList = (list: CertificateIssueTopRespVO[] = []) =>
  list.map((item) => ({
    name: item.subjectName || '--',
    value: Number(item.count || 0)
  }))

const loadDashboardData = () => {
  const params = getBigScreenQueryParams()

  cachedBigScreenRequest('certificate-type-distribution', params, () =>
    getCertificateTypeDistribution(params)
  )
    .then((data) => {
      distributionData.value = Array.isArray(data) ? data : []
    })
    .catch((error) => {
      console.error('加载合格证出具类型失败', error)
      distributionData.value = []
    })

  cachedBigScreenRequest('certificate-issue-top10', params, () => getCertificateIssueTop10(params))
    .then((data) => {
      issueRank.value = formatIssueRankList(Array.isArray(data) ? data : [])
    })
    .catch((error) => {
      console.error('加载合格证开具榜单失败', error)
      issueRank.value = []
    })

  cachedBigScreenRequest('certificate-verification-top10', params, () =>
    getCertificateVerificationTop10(params)
  )
    .then((data) => {
      storeRank.value = formatRankList(Array.isArray(data) ? data : [])
    })
    .catch((error) => {
      console.error('加载合格证存证排行榜失败', error)
      storeRank.value = []
    })
}

onMounted(() => {
  loadDashboardData()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadDashboardData()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.right-section {
  display: grid;
  grid-template-rows: minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  height: 100%;
  min-height: 0;
}

.analysis-panel,
.rank-panel {
  background:
    linear-gradient(180deg, rgba(0, 7, 32, 0.1) 0%, rgba(0, 7, 32, 0.32) 100%), rgba(0, 6, 26, 0.42);
}

.analysis-panel {
  :deep(.panel-body) {
    padding: 0 18px 12px;
  }
}

.rank-panel {
  :deep(.panel-body) {
    padding: 0 24px 12px;
  }

  :deep(.panel-tabs) {
    gap: 0;
    padding-right: 8px;
  }

  :deep(.panel-tab) {
    min-width: 0;
    height: 30px;
    padding: 0 24px 0 4px;
    border: 0;
    background: transparent;
    color: rgba(224, 239, 239, 0.92);
    font-size: 16px;
    font-weight: 500;
    line-height: 30px;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 2px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 10px solid #56f3f2;
      transform: translateY(-34%);
      filter: drop-shadow(0 0 5px rgba(86, 243, 242, 0.65));
    }

    &.active {
      border: 0;
      background: transparent;
      color: #e0efef;
    }
  }
}

.analysis-wrap {
  height: 100%;
  min-height: 0;

  .analysis-title {
    margin: 10px 12px 0;
    color: #88c9e6;
    font-size: 18px;
    font-weight: 700;
    line-height: 24px;
  }
}

.analysis-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 128px;
  align-items: center;
  gap: 4px;
  height: calc(100% - 34px);
  min-height: 0;
  padding: 0 6px 0 2px;
}

.analysis-pie {
  min-width: 0;
  height: 100%;
  min-height: 0;
}

.analysis-legend {
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
  min-width: 0;
}

.legend-row {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 28px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 0;
  box-shadow: 0 0 8px rgba(87, 226, 255, 0.26);
}

.name {
  min-width: 0;
  color: #cbd8dd;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.value {
  display: none;
  color: #57e2ff;
  font-family: 'DIN Alternate', 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 700;
}

.rank-container {
  height: 100%;
  overflow: hidden;
  padding: 0 0 4px;
}

.rank-table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  thead {
    height: 33px;
  }

  tbody {
    height: calc(100% - 33px);
  }

  tbody tr {
    height: 10%;
  }

  th {
    height: 33px;
    border-bottom: 1px solid rgba(89, 209, 243, 0.7);
    color: rgba(211, 231, 246, 0.92);
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    background: rgba(0, 61, 91, 0.82);
  }

  td {
    padding: 0;
    color: #d6eefe;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
  }

  tbody tr:nth-child(odd) {
    background: rgba(5, 47, 82, 0.62);
  }

  tbody tr:nth-child(even) {
    background: rgba(0, 7, 27, 0.34);
  }

  .name-cell {
    color: rgba(214, 225, 230, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value-cell {
    font-family: 'DIN Alternate', sans-serif;
    color: rgba(214, 225, 230, 0.92);
  }
}

.rank-badge {
  --rank-bg: transparent;
  --rank-color: rgba(216, 224, 228, 0.74);
  position: relative;
  z-index: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 22px;
  line-height: 22px;
  font-family: 'DIN Alternate', sans-serif;
  font-weight: 700;
  font-size: 16px;
  color: var(--rank-color);
  border: 0;

  &::before {
    content: '';
    position: absolute;
    inset: 1px 0;
    z-index: -1;
    border: 1px solid var(--rank-color);
    background: var(--rank-bg);
    box-shadow: 0 0 7px var(--rank-color);
    opacity: 0;
    transform: skewX(-8deg);
  }

  &.badge-top-1,
  &.badge-top-2,
  &.badge-top-3 {
    &::before {
      opacity: 1;
    }
  }

  &.badge-top-1 {
    --rank-color: #2de17c;
    --rank-bg: rgba(16, 89, 62, 0.72);
  }

  &.badge-top-2 {
    --rank-color: #37d4ff;
    --rank-bg: rgba(9, 75, 87, 0.68);
  }

  &.badge-top-3 {
    --rank-color: #f6be35;
    --rank-bg: rgba(103, 73, 9, 0.68);
  }
}

.rank-panel {
  :deep(.panel-header) {
    background: none !important;
    height: 36px !important;
    flex: 0 0 36px !important;
  }

  :deep(.panel-title) {
    padding-left: 10px !important;
    color: #88c9e6 !important;
    line-height: 36px !important;
  }

  :deep(.panel-tab) {
    border-top: none !important;
    height: 26px !important;
    line-height: 26px !important;
  }
}
</style>
