import request from '@/config/axios'

export interface FastDashboardQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
}

export interface FastPositiveRateTrendRespVO {
  positiveRates?: number[]
  xaxis?: string[]
}

export interface FastSelfSampleTrendRespVO {
  sampleCounts?: number[]
  xaxis?: string[]
}

export interface DashboardFastOverviewRespVO {
  sampleBatchCount?: number
  detectionItemCount?: number
  itemPositiveRate?: number
  enterpriseCount?: number
  productVarietyCount?: number
}

export interface FastPesticideTopRespVO {
  rank?: number
  pesticideName?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
}

export interface FastCategoryTopRespVO {
  rank?: number
  category?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
  statValue?: number
}

export interface FastMapDataRespVO {
  areaName?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  sampleCount?: number
  positiveCount?: number
  positiveRate?: number
}

export interface FastCategoryDistributionRespVO {
  category?: string
  sampleCount?: number
}

export interface FastCategoryPesticideTopRespVO {
  rank?: number
  category?: string
  pesticideName?: string
  combineName?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
}

// 快速检测大屏 - 概览
export const getFastOverview = (params?: FastDashboardQueryParams) => {
  return request.get<DashboardFastOverviewRespVO>({
    url: '/agri/dashboard/fast/overview',
    params
  })
}

// 快速检测大屏 - 阳性率月度态势
export const getFastPositiveRateTrend = (params?: FastDashboardQueryParams) => {
  return request.get<FastPositiveRateTrendRespVO>({
    url: '/agri/dashboard/fast/positive-rate-trend',
    params
  })
}

// 快速检测大屏 - 自主检测样本量月度态势
export const getFastSelfSampleTrend = (params?: FastDashboardQueryParams) => {
  return request.get<FastSelfSampleTrendRespVO>({
    url: '/agri/dashboard/fast/self-sample-trend',
    params
  })
}

// 快速检测大屏 - 检测项 TOP10
export const getFastPesticideTop10 = (params?: FastDashboardQueryParams) => {
  return request.get<FastPesticideTopRespVO[]>({
    url: '/agri/dashboard/fast/pesticide-top10',
    params
  })
}

// 快速检测大屏 - 农产品品类 TOP10
export const getFastCategoryTop10 = (
  params: FastDashboardQueryParams & { statType: '1' | '2' }
) => {
  return request.get<FastCategoryTopRespVO[]>({
    url: '/agri/dashboard/fast/category-top10',
    params
  })
}

// 快速检测大屏 - 地图
export const getFastMap = (params?: FastDashboardQueryParams & { areaLevel?: string }) => {
  return request.get<FastMapDataRespVO[]>({
    url: '/agri/dashboard/fast/map',
    params
  })
}

// 快速检测大屏 - 自主检测品类分布
export const getFastCategoryDistribution = (params?: FastDashboardQueryParams) => {
  return request.get<FastCategoryDistributionRespVO[]>({
    url: '/agri/dashboard/fast/category-distribution',
    params
  })
}

// 快速检测大屏 - 产品品类-检测项 TOP10
export const getFastCategoryPesticideTop10 = (params?: FastDashboardQueryParams) => {
  return request.get<FastCategoryPesticideTopRespVO[]>({
    url: '/agri/dashboard/fast/category-pesticide-top10',
    params
  })
}
