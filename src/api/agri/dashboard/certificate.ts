import request from '@/config/axios'

export interface CertificateDashboardQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
}

export interface CertificateVerificationTopRespVO {
  rank?: number
  subjectId?: number
  subjectName?: string
  count?: number
}

export interface CertificateIssueTopRespVO {
  rank?: number
  subjectId?: number
  subjectName?: string
  count?: number
}

export interface CertificateTypeDistributionRespVO {
  certificateType: number
  typeName?: string
  count?: number
}

export interface DashboardCertificateOverviewRespVO {
  issueCount?: number
  verificationCount?: number
  traceCount?: number
  issueSubjectCount?: number
  verificationSubjectCount?: number
}

export interface CertificateServiceTrendRespVO {
  issueCounts?: number[]
  verificationCounts?: number[]
  traceCounts?: number[]
  xaxis?: string[]
}

export interface CertificateMapItemVO {
  areaName?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  count?: number
}

export interface DashboardCertificateMapRespVO {
  issueList?: CertificateMapItemVO[]
  verificationList?: CertificateMapItemVO[]
}

export interface CertificateCategoryDistributionRespVO {
  category?: string
  issueCount?: number
}

// 合格证大屏 - 概览
export const getCertificateOverview = (params?: CertificateDashboardQueryParams) => {
  return request.get<DashboardCertificateOverviewRespVO>({
    url: '/agri/dashboard/certificate/overview',
    params
  })
}

// 合格证大屏 - 服务趋势
export const getCertificateServiceTrend = (params?: CertificateDashboardQueryParams) => {
  return request.get<CertificateServiceTrendRespVO>({
    url: '/agri/dashboard/certificate/service-trend',
    params
  })
}

// 合格证大屏 - 开具主体 TOP10
export const getCertificateIssueTop10 = (params?: CertificateDashboardQueryParams) => {
  return request.get<CertificateIssueTopRespVO[]>({
    url: '/agri/dashboard/certificate/issue-top10',
    params
  })
}

// 合格证大屏 - 地图
export const getCertificateMap = (
  params?: CertificateDashboardQueryParams & { areaLevel?: string }
) => {
  return request.get<DashboardCertificateMapRespVO>({
    url: '/agri/dashboard/certificate/map',
    params
  })
}

// 合格证大屏 - 品类开具分布
export const getCertificateCategoryDistribution = (params?: CertificateDashboardQueryParams) => {
  return request.get<CertificateCategoryDistributionRespVO[]>({
    url: '/agri/dashboard/certificate/category-distribution',
    params
  })
}

// 合格证大屏 - 存证主体 TOP10
export const getCertificateVerificationTop10 = (params?: CertificateDashboardQueryParams) => {
  return request.get<CertificateVerificationTopRespVO[]>({
    url: '/agri/dashboard/certificate/verification-top10',
    params
  })
}

// 合格证大屏 - 出具类型分布
export const getCertificateTypeDistribution = (params?: CertificateDashboardQueryParams) => {
  return request.get<CertificateTypeDistributionRespVO[]>({
    url: '/agri/dashboard/certificate/type-distribution',
    params
  })
}
