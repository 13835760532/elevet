<template>
  <section class="right-section">
    <BigPanelCard title="风险公告" :bg-image="noticeBg">
      <div v-if="!noticeEmpty" class="announcement-list" @scroll="handleScroll">
        <div class="announcement-item" v-for="(item, index) in displayNoticeList" :key="index"
          @click="handleViewNoticeDetail(item)" style="cursor: pointer;">
          <p class="time">{{ formatDate(item.createTime, 'YYYY-MM-DD HH:mm') }}</p>
          <p class="desc" v-html="item.content || '暂无风险公告'"></p>
        </div>
      </div>
      <BigDataEmpty v-else title="暂无风险公告" description="当前暂无可展示的风险公告" compact />
    </BigPanelCard>

    <BigPanelCard title="区域风险排序TOP 10" :tabs="['产地', '检测地']" v-model:active-tab="rankTab" :bg-image="rankBg">
      <div class="rank-table-wrap">
        <table v-if="!rankTableEmpty" class="rank-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>地区</th>
              <th>阳性量↓</th>
              <th>阳性率↓</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in currentRankData" :key="`rank-${idx}`">
              <td>
                <template v-if="!item.isEmpty">
                  <img v-if="idx < rankBadgeImages.length" class="rank-badge-img" :src="rankBadgeImages[idx]" alt="" />
                  <span v-else class="rank-badge">{{ String(item.rank).padStart(2, '0') }}</span>
                </template>
              </td>
              <td class="area-name-cell">
                <el-tooltip :content="item.areaName" placement="top" :show-after="100" effect="dark" popper-class="bigscreen-task-tooltip">
                  <div class="area-name-text">{{ item.areaName }}</div>
                </el-tooltip>
              </td>
              <td>{{ item.isEmpty ? '' : item.positiveCount }}</td>
              <td>{{ formatRateText(item) }}</td>
            </tr>
          </tbody>
        </table>
        <BigDataEmpty v-else title="暂无区域风险" description="当前筛选范围未返回区域风险排行" compact />
      </div>
      <div class="rank-level-tabs">
        <button v-for="tab in areaLevelTabs" :key="tab" type="button" class="rank-level-tab"
          :class="{ active: tab === rankAreaLevelTab }" @click="rankAreaLevelTab = tab">
          {{ tab }}
        </button>
      </div>
    </BigPanelCard>

    <BigPanelCard title="农产品-检测项风险TOP 10" :tabs="['检测总量', '阳性率']" v-model:active-tab="projectRiskTab"
      :bg-image="riskBg">
      <div class="project-risk-chart" style="position: relative;">
        <div v-if="!projectRiskEmpty" class="positive-count-summary">
          <span v-if="projectRiskTab === '阳性率'">阳性项次/总项次</span>
          <span v-else>检测总量</span>
        </div>
        <div v-if="!projectRiskEmpty" class="project-risk-axis-labels">
          <div v-for="(label, index) in projectLabels" :key="`${label}-${index}`" class="project-risk-axis-label">
            <span class="project-risk-axis-text">{{ truncateProjectLabel(label) }}</span>
            <span class="project-risk-label-tooltip">{{ label }}</span>
          </div>
        </div>
        <Echart v-if="!projectRiskEmpty" :options="currentProjectRiskOption" height="100%" />
        <BigDataEmpty v-else title="暂无组合风险" description="当前筛选范围未返回农产品-检测项风险" compact />
      </div>
    </BigPanelCard>

    <!-- Notice Detail Dialog -->
    <el-dialog v-model="noticeDialogVisible" title="公告详情" width="600px" class="big-screen-dialog">
      <div v-loading="noticeDetailLoading" class="notice-detail-container" style="min-height: 100px;">
        <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 8px; text-align: center; color: #fff;">{{
          currentNotice?.title }}</h3>
        <div style="font-size: 13px; color: #fff; text-align: center; margin-bottom: 20px;">
          发布时间：{{ currentNotice?.time || '--' }}
        </div>
        <div v-html="currentNotice?.content" class="notice-content-body"
          style="font-size: 16px; line-height: 1.6; color: #e0e6ed; overflow-wrap: break-word; border-top: 1px solid rgba(0, 179, 237, 0.2); padding-top: 16px;">
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="big-screen-btn" type="primary" @click="noticeDialogVisible = false">知道了</el-button>
        </span>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'
import BigPanelCard from './BigPanelCard.vue'
import BigDataEmpty from './BigDataEmpty.vue'
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
import { getNoticePage, getNotice, type NoticeVO } from '@/api/system/notice'
import {
  getBigScreenQueryParams,
  getBigScreenRiskAreaQueryParams,
  subscribeBigScreenRefresh
} from './config'
import { formatDate } from '@/utils/formatTime'

const noticeList = ref<NoticeVO[]>([])
const noticeDialogVisible = ref(false)
const noticeDetailLoading = ref(false)
const currentNotice = ref<{ title: string; time: string; content: string } | null>(null)
const rankTab = ref('产地')
const rankAreaLevelTab = ref('城市')
const projectRiskTab = ref('检测总量')
const rankList = ref<RiskAreaTopRespVO[]>([])
const projectRiskList = ref<ProductPesticideTopRespVO[]>([])
const areaLevelTabs = ['城市', '区县']
const rankBadgeImages = [rankNo1, rankNo2, rankNo3]

const displayNoticeList = computed(() => noticeList.value)
const noticeEmpty = computed(() => displayNoticeList.value.length === 0)

const formatRankAreaName = (item: RiskAreaTopRespVO) =>
  item.areaName || item.cityName || item.districtName || item.provinceName || '--'

const currentRankData = computed(() => {
  const rows = rankList.value.map((item, index) => ({
    rank: item.rank || index + 1,
    areaName: formatRankAreaName(item),
    positiveCount: item.positiveCount !== undefined && item.positiveCount !== null ? item.positiveCount : 0,
    positiveRate: item.positiveRate !== undefined && item.positiveRate !== null ? item.positiveRate : 0,
    detectionCount: item.detectionCount !== undefined && item.detectionCount !== null ? item.detectionCount : 0,
    isEmpty: false
  }))

  const result = [...rows]
  for (let i = result.length; i < 10; i++) {
    result.push({
      rank: i + 1,
      areaName: '',
      positiveCount: 0,
      positiveRate: 0,
      detectionCount: 0,
      isEmpty: true
    })
  }
  return result
})

const rankTableEmpty = computed(
  () => rankList.value.length === 0
)

const formatRateText = (item: any) => {
  if (item.isEmpty) return ''
  const rate = Number(item.positiveRate || 0)
  const rateStr = Number.isInteger(rate) ? String(rate) : rate.toFixed(1)
  return `${rateStr}% (${item.positiveCount}/${item.detectionCount})`
}

const displayProjectRiskList = computed(() => {
  const sorted = [...projectRiskList.value].sort((a, b) => Number(b.statValue || 0) - Number(a.statValue || 0))
  return sorted.slice(0, 10)
})
const projectLabels = computed(() =>
  displayProjectRiskList.value.map((item) => item.combineName || '--')
)
const projectValues = computed(() =>
  displayProjectRiskList.value.map((item) => Number(item.statValue || 0))
)
const projectRiskEmpty = computed(
  () => displayProjectRiskList.value.length === 0
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

const formatProjectUnit = computed(() => (projectRiskTab.value === '阳性率' ? '%' : ''))

const truncateProjectLabel = (label: string, maxLength = 7) => {
  const chars = Array.from(label || '--')
  return chars.length > maxLength ? `${chars.slice(0, maxLength).join('')}...` : label
}

const currentProjectRiskOption = computed(() => ({
  animation: false,
  grid: { left: 128, right: 48, top: 12, bottom: 34 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' },
    formatter: (params: any) => {
      const item = Array.isArray(params) ? params[0] : params
      return `${item.name}<br/>${projectRiskTab.value}：${formatProjectValue(Number(item.value))}${formatProjectUnit.value}`
    }
  },
  xAxis: {
    type: 'value',
    min: 0,
    max: projectMax.value,
    interval: projectRiskTab.value === '阳性率' ? 0.2 : undefined,
    axisLabel: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 14,
      margin: 10,
      formatter: (value: number) => {
        if (projectRiskTab.value === '阳性率') {
          return `${Math.round(value * 100)}%`
        }
        return String(value)
      }
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
      show: false,
      color: 'rgba(235, 241, 252, 0.78)',
      fontSize: 16,
      margin: 10,
      width: 112,
      overflow: 'truncate',
      formatter: (value: string) => truncateProjectLabel(value)
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

/**
 * 加载区域风险 TOP10。
 *
 * 同时处理产地/检测地、城市/区县维度；直辖市需要将省市名称设置为同一值，以匹配
 * 后端区县聚合规则。
 */
const loadRiskAreaTop10 = async () => {
  try {
    const params = getBigScreenRiskAreaQueryParams()
    const currentAreaCode = String(params.areaCode || '').trim()
    const isMunicipality = ['110000', '120000', '310000', '500000'].includes(currentAreaCode) ||
                           /^(11|12|31|50)0000$/.test(currentAreaCode)

    let finalAreaLevel = rankAreaLevelTab.value === '区县' ? '3' : '2'
    let finalProvinceName = params.provinceName
    let finalCityName = params.cityName

    if (isMunicipality) {
      let name = ''
      if (currentAreaCode.startsWith('11')) name = '北京市'
      else if (currentAreaCode.startsWith('12')) name = '天津市'
      else if (currentAreaCode.startsWith('31')) name = '上海市'
      else if (currentAreaCode.startsWith('50')) name = '重庆市'
      
      if (name) {
        finalProvinceName = name
        finalCityName = name
      }
    }

    const data = await getRiskAreaTop10({
      ...params,
      areaType: rankTab.value === '产地' ? '1' : '2',
      areaLevel: finalAreaLevel,
      provinceName: finalProvinceName,
      cityName: finalCityName
    })
    rankList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载风险集中区域 TOP10 失败', error)
    rankList.value = []
  }
}

/** 加载“产品-检测项”组合风险 TOP10，并应用当前检测量/阳性率口径。 */
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

const noticePageNo = ref(1)
const noticeLoading = ref(false)
const noticeFinished = ref(false)

/**
 * 分页加载风险公告。
 *
 * @param isLoadMore 是否追加下一页；首次加载会重置页码和完成状态。
 */
const loadNoticeList = async (isLoadMore = false) => {
  if (noticeLoading.value) return
  if (isLoadMore && noticeFinished.value) return

  if (!isLoadMore) {
    noticePageNo.value = 1
    noticeFinished.value = false
  }

  noticeLoading.value = true
  try {
    const data = await getNoticePage({
      pageNo: noticePageNo.value,
      pageSize: 50, // 默认50一页
      status: 0, // 开启状态
      type: 2
    } as any)
    const list = (data?.list || []).filter(item => item.type == 2)
    if (isLoadMore) {
      noticeList.value = [...noticeList.value, ...list]
    } else {
      noticeList.value = list
    }
    
    // 如果返回的原始数据长度不足 50 条，说明数据已加载完
    if (!data?.list || data.list.length < 50) {
      noticeFinished.value = true
    } else {
      noticePageNo.value++
    }
  } catch (error) {
    console.error('加载风险公告失败', error)
    if (!isLoadMore) {
      noticeList.value = []
    }
  } finally {
    noticeLoading.value = false
  }
}

/** 公告列表滚动到底部缓冲区时自动加载下一页。 */
const handleScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const scrollBuffer = 10 // 触底缓冲区像素值
  if (
    target.scrollHeight - target.scrollTop <= target.clientHeight + scrollBuffer &&
    !noticeLoading.value &&
    !noticeFinished.value
  ) {
    loadNoticeList(true)
  }
}

/** 打开公告详情并按公告 ID 加载完整正文。 */
const handleViewNoticeDetail = async (item: any) => {
  if (!item.id) return
  currentNotice.value = {
    title: item.title,
    time: item.createTime ? formatDate(item.createTime, 'YYYY-MM-DD HH:mm') : '',
    content: ''
  }
  noticeDialogVisible.value = true
  noticeDetailLoading.value = true
  try {
    const res = await getNotice(item.id)
    if (currentNotice.value) {
      currentNotice.value.content = res.content || '暂无内容'
    }
  } catch (error) {
    console.error('加载公告详情失败', error)
    if (currentNotice.value) {
      currentNotice.value.content = '获取内容失败，请稍后重试'
    }
  } finally {
    noticeDetailLoading.value = false
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
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;

    :deep(*) {
      display: inline !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      font-size: inherit !important;
      line-height: inherit !important;
      color: inherit !important;
    }
  }
}

.rank-level-tabs {
  position: absolute;
  right: 4px;
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

  .area-name-cell {
    padding: 0 4px;
  }

  .area-name-text {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  tbody tr:nth-child(odd) {
    background: rgba(13, 56, 99, 0.44);
  }

  tbody tr:nth-child(even) {
    background: rgba(0, 6, 20, 0.2);
  }

  th:first-child,
  td:first-child {
    width: 60px;
  }

  th:nth-child(4),
  td:nth-child(4) {
    width: 160px;
    white-space: nowrap;
  }
}

.rank-table-wrap {
  position: relative;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 8px;
  padding-bottom: 50px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #1f4b89;
    border-radius: 3px;
  }
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
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 10px 0 0;
}

.project-risk-axis-labels {
  position: absolute;
  left: 0;
  top: 22px;
  bottom: 34px;
  z-index: 2;
  display: grid;
  grid-template-rows: repeat(10, minmax(0, 1fr));
  width: 118px;
  pointer-events: none;
}

.project-risk-axis-label {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 0;
  padding-right: 10px;
  color: rgba(235, 241, 252, 0.78);
  font-size: 16px;
  line-height: 20px;
  pointer-events: auto;
}

.project-risk-axis-text {
  display: block;
  max-width: 108px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.project-risk-label-tooltip {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  z-index: 20;
  width: max-content;
  max-width: 520px;
  padding: 6px 10px;
  border: 1px solid rgba(87, 226, 255, 0.35);
  border-radius: 4px;
  background: rgba(6, 18, 42, 0.94);
  color: #dff7ff;
  font-size: 14px;
  line-height: 20px;
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 0 12px rgba(67, 228, 255, 0.16);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-50%);
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.project-risk-axis-label:hover {
  color: #ffffff;

  .project-risk-label-tooltip {
    opacity: 1;
    visibility: visible;
  }
}

.positive-count-summary {
  position: absolute;
  top: 8px;
  right: 22px;
  z-index: 3;
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: rgba(214, 234, 255, 0.78);
  font-size: 14px;
  line-height: 18px;
  pointer-events: none;

  strong {
    color: #57e2ff;
    font-size: 16px;
    font-weight: 700;
    font-family: 'DIN Alternate', Arial, sans-serif;
    text-shadow: 0 0 8px rgba(87, 226, 255, 0.4);
  }
}

:deep(.big-screen-dialog) {
  background: rgba(8, 28, 54, 0.95) !important;
  border: 1px solid rgba(0, 179, 237, 0.6) !important;
  box-shadow: 0 0 25px rgba(0, 179, 237, 0.4) !important;
  border-radius: 8px !important;

  .el-dialog__header {
    border-bottom: 1px solid rgba(0, 179, 237, 0.2) !important;
    padding: 16px 20px !important;
    margin-right: 0 !important;

    .el-dialog__title {
      color: #ffffff !important;
      font-size: 18px !important;
      font-weight: bold !important;
    }

    .el-dialog__headerbtn {
      top: 4px !important;
      margin-top: 0 !important;

      .el-dialog__close {
        color: #ffffff !important;
        font-size: 20px !important;

        &:hover {
          color: #00b3ed !important;
        }
      }
    }
  }

  .el-dialog__body {
    padding: 24px 20px !important;
    color: #e0e6ed !important;
  }

  .el-dialog__footer {
    border-top: 1px solid rgba(0, 179, 237, 0.1) !important;
    padding: 16px 20px !important;
  }
}

:deep(.big-screen-btn) {
  background: linear-gradient(90deg, #00b3ed 0%, #00f2fe 100%) !important;
  border: none !important;
  color: #fff !important;
  font-weight: bold !important;
  box-shadow: 0 0 10px rgba(0, 179, 237, 0.4) !important;
  transition: all 0.3s !important;

  &:hover {
    opacity: 0.9 !important;
    box-shadow: 0 0 15px rgba(0, 179, 237, 0.6) !important;
  }

  &:active {
    opacity: 0.8 !important;
  }
}

:deep(.notice-detail-container.el-loading-parent--relative) {
  .el-loading-mask {
    background-color: rgba(8, 28, 54, 0.8) !important;

    .path {
      stroke: #00b3ed !important;
    }
  }
}
</style>

<style lang="scss">
.bigscreen-task-tooltip.el-popper {
  background: #061a38 !important;
  border: 1px solid #188bf5 !important;
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(24, 139, 245, 0.4) !important;
  font-size: 13px !important;
  line-height: 1.8 !important;

  .el-popper__arrow::before {
    background: #061a38 !important;
    border: 1px solid #188bf5 !important;
  }
}
</style>
