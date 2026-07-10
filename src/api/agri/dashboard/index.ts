import request from '@/config/axios'

export interface DashboardQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
  queryDeptScope?: number
  areaType?: string | number
  areaCode?: string | number
}

export interface DashboardOverviewRespVO {
  supervisorCount?: number
  detectionOrgCount?: number
  enterpriseCount?: number
  taskIssuedCount?: number
  taskCompletedCount?: number
  taskCompletionRate?: number
  sampleCount?: number
  detectionItemCount?: number
  certificateIssueCount?: number
  certificateVerifyCount?: number
}

export interface TrendQueryParams extends DashboardQueryParams {
  statType: '1' | '2'
}

export interface TrendRespVO {
  month?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
  statValue?: number
}

export interface RiskAreaTopQueryParams extends DashboardQueryParams {
  areaType: '1' | '2'
  areaLevel: '1' | '2'
}

export interface RiskAreaTopRespVO {
  rank?: number
  provinceName?: string
  cityName?: string
  districtName?: string
  areaName?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
}

export interface ProductPesticideTopRespVO {
  rank?: number
  productName?: string
  pesticideName?: string
  combineName?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
  statValue?: number
}

export interface ProduceRiskTopRespVO {
  rank?: number
  productName?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
  statValue?: number
}

export interface PesticideRiskTopRespVO {
  rank?: number
  pesticideName?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
  statValue?: number
}

export interface MapDataQueryParams extends DashboardQueryParams {
  areaLevel: '1' | '2'
}

export interface MapDataRespVO {
  provinceName?: string
  cityName?: string
  districtName?: string
  areaName?: string
  sampleCount?: number
  detectionItemCount?: number
  positiveCount?: number
  positiveRate?: number
}

export interface CategoryRiskRespVO {
  category?: string
  detectionCount?: number
  positiveCount?: number
  positiveRate?: number
  statValue?: number
}

// 首页大屏 - 概览统计
export const getDashboardOverview = (params?: DashboardQueryParams) => {
  return request.get<DashboardOverviewRespVO>({
    url: '/agri/dashboard/overview',
    params
  })
}

// 首页大屏 - 月度检测趋势
export const getDashboardTrend = (params: TrendQueryParams) => {
  return request.get<TrendRespVO[]>({
    url: '/agri/dashboard/trend',
    params
  })
}

// 首页大屏 - 风险集中区域 TOP10
export const getRiskAreaTop10 = (params: RiskAreaTopQueryParams) => {
  return request.get<RiskAreaTopRespVO[]>({
    url: '/agri/dashboard/risk-area-top10',
    params
  })
}

// 首页大屏 - 产品检测项风险 TOP10
export const getProductPesticideTop10 = (params: TrendQueryParams) => {
  return request.get<ProductPesticideTopRespVO[]>({
    url: '/agri/dashboard/product-pesticide-top10',
    params
  })
}

// 首页大屏 - 农产品风险 TOP10
export const getProduceRiskTop10 = (params: TrendQueryParams) => {
  return request.get<ProduceRiskTopRespVO[]>({
    url: '/agri/dashboard/produce-risk-top10',
    params
  })
}

// 首页大屏 - 农药残留风险 TOP10
export const getPesticideRiskTop10 = (params: TrendQueryParams) => {
  return request.get<PesticideRiskTopRespVO[]>({
    url: '/agri/dashboard/pesticide-risk-top10',
    params
  })
}

// 首页大屏 - 地图热力数据
export const getDashboardMapData = (params: MapDataQueryParams) => {
  return request.get<MapDataRespVO[]>({
    url: '/agri/dashboard/map-data',
    params
  })
}

// 首页大屏 - 农产品品类风险分布
export const getCategoryRisk = (params: TrendQueryParams) => {
  return request.get<CategoryRiskRespVO[]>({
    url: '/agri/dashboard/category-risk',
    params
  })
}
