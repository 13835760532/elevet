<template>
  <section class="right-section">
    <BigPanelCard title="风险公告" :bg-image="noticeBg">
      <div class="announcement-list">
        <div class="announcement-item" v-for="(item, index) in displayNoticeList" :key="index">
          <p class="time">{{ formatDate(item.createTime, 'YYYY-MM-DD HH:mm') }}</p>
          <p class="desc">{{ item.title }}</p>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard
      title="区域风险排序TOP 10"
      :tabs="['产地', '检测地']"
      v-model:active-tab="rankTab"
      :bg-image="rankBg"
    >
      <div class="rank-table-wrap">
        <table class="rank-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>集中地区</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in currentRankData" :key="`${item.areaName}-${idx}`">
              <td>
                <img
                  v-if="idx < rankBadgeImages.length"
                  class="rank-badge-img"
                  :src="rankBadgeImages[idx]"
                  alt=""
                />
                <span v-else class="rank-badge">{{ String(item.rank).padStart(2, '0') }}</span>
              </td>
              <td>{{ item.areaName }}</td>
            </tr>
          </tbody>
        </table>
        <div class="rank-level-tabs">
          <button
            v-for="tab in areaLevelTabs"
            :key="tab"
            type="button"
            class="rank-level-tab"
            :class="{ active: tab === rankAreaLevelTab }"
            @click="rankAreaLevelTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard
      title="农产品-检测项风险TOP 10"
      :tabs="['检测总量', '阳性率']"
      v-model:active-tab="projectRiskTab"
      :bg-image="riskBg"
    >
      <div class="project-risk-chart">
        <Echart :options="currentProjectRiskOption" height="100%" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import BigPanelCard from './BigPanelCard.vue'
import noticeBg from '@/assets/imgs/echarts/首页/bg_fxgg.png'
import rankBg from '@/assets/imgs/echarts/首页/fxjzqy_bg.png'
import riskBg from '@/assets/imgs/echarts/首页/nclfx_bg.png'
import rankNo1 from '@/assets/imgs/new/01.png'
import rankNo2 from '@/assets/imgs/new/02.png'
import rankNo3 from '@/assets/imgs/new/03.png'
import {
  getProductPesticideTop10,
  getRiskAreaTop10,
  type ProductPesticideTopRespVO,
  type RiskAreaTopRespVO
} from '@/api/agri/dashboard'
import { getNoticePage, type NoticeVO } from '@/api/system/notice'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './config'
import { formatDate } from '@/utils/formatTime'

const noticeList = ref<NoticeVO[]>([])
const rankTab = ref('产地')
const rankAreaLevelTab = ref('城市')
const projectRiskTab = ref('检测总量')
const rankList = ref<RiskAreaTopRespVO[]>([])
const projectRiskList = ref<ProductPesticideTopRespVO[]>([])
const areaLevelTabs = ['城市', '区县']
const rankBadgeImages = [rankNo1, rankNo2, rankNo3]

const displayNoticeList = computed(() => noticeList.value.slice(0, 3))

const formatRankAreaName = (item: RiskAreaTopRespVO) =>
  item.areaName || item.cityName || item.districtName || item.provinceName || '--'

const currentRankData = computed(() => {
  const rows = rankList.value.map((item, index) => ({
    rank: item.rank || index + 1,
    areaName: formatRankAreaName(item)
  }))
  if (rows.length) return rows
  return Array.from({ length: 10 }, (_, index) => ({
    rank: index + 1,
    areaName: '--'
  }))
})

const displayProjectRiskList = computed(() => {
  const rows = projectRiskList.value.slice(0, 10)
  return rows.length
    ? rows
    : Array.from({ length: 10 }, () => ({
        combineName: '--',
        statValue: 0
      }))
})
const projectLabels = computed(() =>
  displayProjectRiskList.value.map((item) => item.combineName || '--')
)
const projectValues = computed(() =>
  displayProjectRiskList.value.map((item) => Number(item.statValue || 0))
)
const projectMax = computed(() => {
  const maxValue = Math.max(...projectValues.value, 0)
  if (projectRiskTab.value === '阳性率') {
    return 1
  }
  if (maxValue <= 0) return 100
  return Math.max(3, Math.ceil(maxValue / 3) * 3)
})
const formatProjectValue = (value: number) =>
  projectRiskTab.value === '阳性率' ? Number(value).toFixed(1) : `${Number(value)}`

const currentProjectRiskOption = computed(() => ({
  animation: false,
  grid: { left: 128, right: 18, top: 12, bottom: 34 },
  xAxis: {
    type: 'value',
    min: 0,
    max: projectMax.value,
    interval: projectRiskTab.value === '阳性率' ? 0.2 : undefined,
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      margin: 10,
      formatter: projectRiskTab.value === '阳性率' ? '{value}' : '{value}'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(123, 143, 174, 0.22)',
        type: [3, 5],
        width: 1
      }
    },
    axisLine: {
      lineStyle: { color: 'rgba(180, 188, 198, 0.42)', width: 2 }
    },
    axisTick: {
      show: true,
      length: 6,
      lineStyle: { color: 'rgba(180, 188, 198, 0.42)', width: 2 }
    }
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: projectLabels.value,
    axisTick: { show: false },
    axisLine: { show: false },
    axisLabel: {
      color: 'rgba(235, 241, 252, 0.78)',
      fontSize: 16,
      margin: 10,
      width: 112,
      overflow: 'truncate'
    }
  },
  series: [
    {
      type: 'bar',
      data: projectValues.value,
      barWidth: 13,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: 'rgba(9, 33, 72, 0.1)' },
          { offset: 0.28, color: '#145f92' },
          { offset: 1, color: '#43d9ef' }
        ])
      },
      label: {
        show: true,
        position: 'right',
        distance: 8,
        color: '#43e4ff',
        fontSize: 16,
        fontWeight: 700,
        formatter: ({ value }: { value: number }) => formatProjectValue(value)
      }
    }
  ]
}))

const loadRiskAreaTop10 = async () => {
  try {
    const data = await getRiskAreaTop10({
      ...getBigScreenQueryParams(),
      areaType: rankTab.value === '产地' ? '1' : '2',
      areaLevel: rankAreaLevelTab.value === '区县' ? '2' : '1'
    })
    rankList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载风险集中区域 TOP10 失败', error)
    rankList.value = []
  }
}

const loadProductPesticideTop10 = async () => {
  try {
    const data = await getProductPesticideTop10({
      ...getBigScreenQueryParams(),
      statType: projectRiskTab.value === '阳性率' ? '2' : '1'
    })
    projectRiskList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载产品检测项风险 TOP 10 失败', error)
    projectRiskList.value = []
  }
}

const loadNoticeList = async () => {
  try {
    const data = await getNoticePage({
      pageNo: 1,
      pageSize: 10,
      status: 0 // 开启状态
    } as PageParam & { status: number })
    noticeList.value = data?.list || []
  } catch (error) {
    console.error('加载风险公告失败', error)
    noticeList.value = []
  }
}

watch(
  () => rankTab.value,
  () => {
    loadRiskAreaTop10()
  }
)

watch(
  () => rankAreaLevelTab.value,
  () => {
    loadRiskAreaTop10()
  }
)

watch(
  () => projectRiskTab.value,
  () => {
    loadProductPesticideTop10()
  }
)

onMounted(() => {
  loadRiskAreaTop10()
  loadProductPesticideTop10()
  loadNoticeList()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadRiskAreaTop10()
  loadProductPesticideTop10()
  loadNoticeList()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.right-section {
  display: grid;
  grid-template-rows: 250px 390px minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
}

.announcement-list {
  height: 100%;
  overflow: auto;
  padding: 20px 12px 0;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #1f4b89;
  }
}

.announcement-item {
  padding: 0 0 14px;
  margin-bottom: 0;
  background: transparent;

  .time {
    margin: 0;
    color: rgba(232, 238, 248, 0.78);
    font-size: 16px;
    line-height: 22px;
    font-weight: 600;
  }

  .desc {
    margin: 4px 0 0;
    color: rgba(232, 238, 248, 0.72);
    font-size: 15px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.rank-level-tabs {
  position: absolute;
  right: 22px;
  bottom: 16px;
  display: flex;
  gap: 8px;
}

.rank-level-tab {
  min-width: 48px;
  height: 28px;
  border: 1px solid rgba(134, 176, 235, 0.72);
  background: rgba(6, 23, 52, 0.5);
  color: rgba(228, 238, 251, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.active {
    color: #ffffff;
    border-color: rgba(152, 205, 255, 0.9);
    background: rgba(11, 50, 94, 0.72);
  }
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    height: 28px;
    padding: 0;
    border-bottom: 1px solid rgba(22, 72, 127, 0.28);
    font-size: 16px;
  }

  th {
    text-align: center;
    color: rgba(255, 255, 255, 0.86);
    font-weight: 600;
    height: 36px;
    border-bottom-color: rgba(103, 178, 205, 0.58);
  }

  td {
    color: rgba(255, 255, 255, 0.88);
    text-align: center;
    font-weight: 600;
  }

  tbody tr:nth-child(odd) {
    background: rgba(13, 56, 99, 0.44);
  }

  tbody tr:nth-child(even) {
    background: rgba(0, 6, 20, 0.2);
  }

  th:first-child,
  td:first-child {
    width: 128px;
  }
}

.rank-table-wrap {
  position: relative;
  height: 100%;
  overflow: hidden;
  padding-top: 8px;
  padding-bottom: 46px;
}

.rank-badge {
  display: inline-block;
  min-width: 30px;
  height: 24px;
  line-height: 24px;
  font-family: 'DIN Alternate', 'Arial', sans-serif;
  font-weight: 700;
  color: rgba(228, 238, 251, 0.78);
  background: transparent;
}

.rank-badge-img {
  display: inline-block;
  width: 27px;
  height: 27px;
  object-fit: contain;
  vertical-align: middle;
}

.project-risk-chart {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 10px 0 0;
}
</style>
