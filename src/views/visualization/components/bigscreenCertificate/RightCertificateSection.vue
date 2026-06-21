<template>
  <section class="right-section">
    <BigPanelCard title="合格证分析" :bg-image="rightBg">
      <div class="analysis-wrap">
        <p class="analysis-title">合格证出具类型</p>
        <div class="analysis-layout">
          <div class="analysis-pie">
            <Echart :options="analysisOption" height="100%" width="100%" />
          </div>
          <div class="analysis-legend">
            <div class="legend-row" v-for="item in analysisItems" :key="item.name">
              <span class="dot" :style="{ background: item.color }"></span>
              <span class="name">{{ item.name }}</span>
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证开具榜单" :tabs="['累计']" active-tab="累计" :bg-image="rightBg">
      <div class="rank-container">
        <table class="rank-table">
          <thead>
            <tr>
              <th width="80">排行</th>
              <th>开具主体</th>
              <th width="100">份数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in issueRank" :key="item.name + idx">
              <td>
                <div class="rank-badge" :class="`top-${idx + 1}`">
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

    <BigPanelCard title="合格证存证排行榜" :tabs="['累计']" active-tab="累计" :bg-image="rightBg">
      <div class="rank-container">
        <table class="rank-table">
          <thead>
            <tr>
              <th width="80">排行</th>
              <th>存证主体</th>
              <th width="100">份数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in storeRank" :key="item.name + idx">
              <td>
                <div class="rank-badge" :class="`top-${idx + 1}`">
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

interface RankItem {
  name: string
  value: number
}

const PIE_TYPE_META: Record<number, { name: string; color: string }> = {
  1: { name: '生产者', color: '#3ba4ff' },
  2: { name: '收购者', color: '#76cf3f' },
  3: { name: '批发市场', color: '#f6b23c' }
}

const issueRank = ref<RankItem[]>([])
const distributionData = ref<CertificateTypeDistributionRespVO[]>([])
const storeRank = ref<RankItem[]>([])

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
      radius: ['48%', '68%'],
      center: ['50%', '52%'],
      minAngle: 8,
      avoidLabelOverlap: true,
      label: {
        show: true,
        color: '#d6eefe',
        fontSize: 11,
        formatter: (params: { name: string; value: number }) =>
          params.value > 0 ? `{name|${params.name}}\n{value|${params.value}}` : '',
        rich: {
          name: { color: '#d6eefe', fontSize: 11, lineHeight: 15 },
          value: { color: '#57e2ff', fontSize: 11, lineHeight: 15, fontWeight: 700 }
        }
      },
      labelLine: {
        show: true,
        length: 12,
        length2: 16,
        lineStyle: { color: 'rgba(255,255,255,0.85)', width: 1.1 }
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

const loadDashboardData = async () => {
  try {
    const [typeDistribution, issueTop10, verificationTop10] = await Promise.all([
      getCertificateTypeDistribution(getBigScreenQueryParams()),
      getCertificateIssueTop10(getBigScreenQueryParams()),
      getCertificateVerificationTop10(getBigScreenQueryParams())
    ])
    distributionData.value = Array.isArray(typeDistribution) ? typeDistribution : []
    issueRank.value = formatIssueRankList(Array.isArray(issueTop10) ? issueTop10 : [])
    storeRank.value = formatRankList(Array.isArray(verificationTop10) ? verificationTop10 : [])
  } catch (error) {
    console.error('加载合格证大屏右侧数据失败', error)
    distributionData.value = []
    issueRank.value = []
    storeRank.value = []
  }
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
  grid-template-rows: 264px minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  min-height: 0;
}

.analysis-wrap {
  height: 100%;

  .analysis-title {
    margin: 4px 10px 0;
    color: #a9caea;
    font-size: 14px;
    font-weight: 700;
  }
}

.analysis-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 118px;
  align-items: center;
  gap: 8px;
  height: calc(100% - 28px);
  min-height: 0;
  padding: 4px 10px 8px;
}

.analysis-pie {
  min-width: 0;
  height: 100%;
}

.analysis-legend {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.legend-row {
  display: grid;
  grid-template-columns: 9px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 0;
  box-shadow: 0 0 8px rgba(87, 226, 255, 0.28);
}

.name {
  min-width: 0;
  color: #d6eefe;
  font-size: 12px;
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
  padding: 4px 12px 8px;
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th {
    height: 28px;
    color: rgba(211, 231, 246, 0.84);
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    background: rgba(158, 194, 229, 0.1);
  }

  td {
    height: 25px;
    padding: 1px 0;
    color: #d6eefe;
    font-size: 13px;
    text-align: center;
  }

  tbody tr:nth-child(odd) {
    background: rgba(13, 56, 99, 0.44);
  }

  tbody tr:nth-child(even) {
    background: rgba(0, 6, 20, 0.2);
  }

  .name-cell {
    color: #bbdbfa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value-cell {
    font-family: 'DIN Alternate', sans-serif;
    color: #d6eefe;
  }
}

.rank-badge {
  display: inline-block;
  width: 30px;
  height: 18px;
  line-height: 18px;
  font-family: 'DIN Alternate', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #8fa7c1;
  background: transparent;
  position: relative;
  border: 0;

  // 通用 L 型护角装饰
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    opacity: 0;
  }

  &.top-1,
  &.top-2,
  &.top-3 {
    border-color: transparent;

    &::before {
      opacity: 1;
      top: -1px;
      left: -1px;
      border-top: 2px solid var(--rank-color);
      border-left: 2px solid var(--rank-color);
    }

    &::after {
      opacity: 1;
      bottom: -1px;
      right: -1px;
      border-bottom: 2px solid var(--rank-color);
      border-right: 2px solid var(--rank-color);
    }
  }

  &.top-1 {
    --rank-color: #2de17c;
    color: #2de17c;
    background: rgba(23, 91, 53, 0.86);
  }

  &.top-2 {
    --rank-color: #37d4ff;
    color: #37d4ff;
    background: rgba(9, 75, 87, 0.86);
  }

  &.top-3 {
    --rank-color: #f6be35;
    color: #f6be35;
    background: rgba(103, 73, 9, 0.86);
  }
}
</style>
