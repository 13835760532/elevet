<template>
  <section class="center-section">
    <BigPanelCard class="big-panel-center" title="合格证地区分布图" :tabs="['开具', '存证']" v-model:active-tab="mapTab"
      :bg-image="mapBg">
      <div class="map-area">
        <Map mode="certificate" :certificate-tab="mapTab" />
      </div>
    </BigPanelCard>

    <BigPanelCard class="big-panel-center" title="合格证服务趋势图" :bg-image="trendBg">
      <div class="trend-head">{{ trendHead }}</div>
      <div class="trend-chart-wrap">
        <Echart v-if="!trendEmpty" :options="currentTrendOption" height="100%" />
        <BigDataEmpty
          v-else
          title="暂无合格证趋势"
          description="当前筛选范围未返回合格证服务趋势"
          compact
        />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import echarts from '@/plugins/echarts'
import { Echart } from '@/components/Echart'

import BigPanelCard from '../bigscreen/BigPanelCard.vue'
import BigDataEmpty from '../bigscreen/BigDataEmpty.vue'
import Map from '../Map.vue'
import mapBg from '@/assets/imgs/echarts/合格证/Frame 57_bg.png'
import trendBg from '@/assets/imgs/echarts/合格证/Frame 59_bg.png'
import {
  getCertificateServiceTrend,
  type CertificateServiceTrendRespVO
} from '@/api/agri/dashboard/certificate'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config'
import { cachedBigScreenRequest } from '../bigscreen/requestCache'

const mapTab = ref('开具')
const trendData = ref<CertificateServiceTrendRespVO>({})

const normalizeSeries = (series?: number[], length = 0) => {
  const result = Array.from({ length }, (_, index) => Number(series?.[index] || 0))
  return result
}

const createTrendOption = (
  xAxisData: string[],
  issueData: number[],
  storeData: number[],
  traceData: number[]
) => ({
  animation: false,
  grid: { left: 52, right: 96, top: 38, bottom: 36 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(6, 18, 42, 0.92)',
    borderColor: 'rgba(87, 226, 255, 0.35)',
    textStyle: { color: '#dff7ff' }
  },
  legend: {
    orient: 'vertical',
    right: 16,
    top: 52,
    itemWidth: 18,
    itemHeight: 2,
    textStyle: { color: '#8fb6da', fontSize: 12 },
    data: ['开具次数', '存证次数', '溯源次数']
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xAxisData,
    axisLabel: { color: 'rgba(198, 219, 239, 0.76)', fontSize: 12 },
    axisTick: { show: false },
    axisLine: { lineStyle: { color: 'rgba(72, 149, 214, 0.42)' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: 'rgba(198, 219, 239, 0.76)', fontSize: 12 },
    axisTick: { show: false },
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(45, 106, 184, 0.28)', type: 'dashed' } }
  },
  series: [
    {
      name: '开具次数',
      type: 'line',
      smooth: false,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#55e8ff' },
      lineStyle: { color: '#55e8ff', width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(85, 232, 255, 0.25)' },
          { offset: 1, color: 'rgba(85, 232, 255, 0.02)' }
        ])
      },
      data: issueData
    },
    {
      name: '存证次数',
      type: 'line',
      smooth: false,
      symbolSize: 5,
      lineStyle: { color: '#7bd644', width: 2 },
      itemStyle: { color: '#7bd644' },
      data: storeData
    },
    {
      name: '溯源次数',
      type: 'line',
      smooth: false,
      symbolSize: 5,
      lineStyle: { color: '#7d60ff', width: 2 },
      itemStyle: { color: '#7d60ff' },
      data: traceData
    }
  ]
})

const xAxisData = computed(() => {
  const axis = trendData.value.xaxis || []
  return axis
})

const currentTrendOption = computed(() =>
  createTrendOption(
    xAxisData.value,
    normalizeSeries(trendData.value.issueCounts, xAxisData.value.length),
    normalizeSeries(trendData.value.verificationCounts, xAxisData.value.length),
    normalizeSeries(trendData.value.traceCounts, xAxisData.value.length)
  )
)

const trendEmpty = computed(() => {
  if (!xAxisData.value.length) return true
  const total = [
    trendData.value.issueCounts,
    trendData.value.verificationCounts,
    trendData.value.traceCounts
  ].reduce(
    (sum, series) => sum + (series || []).reduce((current, item) => current + Number(item || 0), 0),
    0
  )
  return total <= 0
})

const trendHead = computed(() => {
  const axis = xAxisData.value
  if (!axis.length) return ''
  return `${axis[0]} - ${axis[axis.length - 1]}`
})

const loadTrendData = async () => {
  const params = getBigScreenQueryParams()
  try {
    const data = await cachedBigScreenRequest('certificate-service-trend', params, () =>
      getCertificateServiceTrend(params)
    )
    trendData.value = data || {}
  } catch (error) {
    console.error('加载合格证服务趋势失败', error)
    trendData.value = {}
  }
}

onMounted(() => {
  loadTrendData()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadTrendData()
})

onUnmounted(() => {
  disposeRefresh()
})
</script>

<style scoped lang="scss">
.center-section {
  display: grid;
  grid-template-rows: minmax(0, 2.18fr) minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.map-area {
  position: relative;
  min-height: 0;
  flex: 1;
}

.trend-chart-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.map-legend {
  position: absolute;
  right: 16px;
  bottom: 22px;
  z-index: 2;
  min-width: 106px;
  padding: 6px 8px;
  background: rgba(4, 30, 66, 0.78);
  border: 1px solid rgba(63, 161, 255, 0.4);

  .legend-title {
    color: #67dfff;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #9abedf;
    font-size: 11px;
    margin-bottom: 1px;

    .dot {
      width: 8px;
      height: 8px;
    }
  }
}

.trend-head {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 2;
  text-align: right;
  height: 16px;
  padding: 2px 12px 0;
  color: #9ec2e5;
  font-size: 12px;
}
</style>
