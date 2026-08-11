import request from '@/config/axios'

export interface ArchiveDashboardQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
  queryDeptScope?: number
  dataScope?: string
  areaType?: string | number
  areaCode?: string | number
}

export interface DashboardArchiveOverviewRespVO {
  productArchiveCount?: number
  subjectArchiveCount?: number
}

export interface DashboardArchiveProductTrendRespVO {
  counts?: number[]
  xaxis?: string[]
}

export interface DashboardArchiveProductCategoryRespVO {
  category?: string
  count?: number
}

export interface DashboardArchiveSubjectTypeRespVO {
  type?: number
  typeName?: string
  count?: number
}

export interface DashboardArchiveSubjectAreaRespVO {
  rank?: number
  provinceName?: string
  cityName?: string
  districtName?: string
  areaName?: string
  count?: number
}

// 建档备案大屏 - 概览
export const getArchiveOverview = (params?: ArchiveDashboardQueryParams) => {
  return request.get<DashboardArchiveOverviewRespVO>({
    url: '/agri/dashboard/archive/overview',
    params
  })
}

// 建档备案大屏 - 产品建档月度趋势
export const getArchiveProductTrend = (params?: ArchiveDashboardQueryParams) => {
  return request.get<DashboardArchiveProductTrendRespVO>({
    url: '/agri/dashboard/archive/product-trend',
    params
  })
}

// 建档备案大屏 - 产品品类分布
export const getArchiveProductCategoryDistribution = (params?: ArchiveDashboardQueryParams) => {
  return request.get<DashboardArchiveProductCategoryRespVO[]>({
    url: '/agri/dashboard/archive/product-category-distribution',
    params
  })
}

// 建档备案大屏 - 主体类型占比
export const getArchiveSubjectTypeDistribution = (params?: ArchiveDashboardQueryParams) => {
  return request.get<DashboardArchiveSubjectTypeRespVO[]>({
    url: '/agri/dashboard/archive/subject-type-distribution',
    params
  })
}

// 建档备案大屏 - 主体建档地区 TOP10
export const getArchiveSubjectAreaTop10 = (params?: ArchiveDashboardQueryParams) => {
  return request.get<DashboardArchiveSubjectAreaRespVO[]>({
    url: '/agri/dashboard/archive/subject-area-top10',
    params
  })
}
