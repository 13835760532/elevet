import request from '@/config/axios'
import {
  getMockTaskAnalysisPage,
  getMockTaskCategoryDistribution,
  getMockTaskMap,
  getMockTaskOverview,
  getMockTaskRiskTrend,
  getMockTaskVolumeTrend,
  resolveDashboardMock,
  shouldUseDashboardMock
} from './mock'

export interface TaskDashboardQueryParams {
  startDate?: string
  endDate?: string
  provinceName?: string
  cityName?: string
}

export interface DashboardTaskOverviewRespVO {
  taskIssuedCount?: number
  taskCompletedCount?: number
  taskCompletionRate?: number
  detectionOrgCount?: number
  enterpriseCount?: number
}

export interface TaskMapDataRespVO {
  areaName?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  taskIssuedCount?: number
  taskCompletedCount?: number
  taskCompletionRate?: number
}

export interface TaskCategoryDistributionRespVO {
  category?: string
  sampleCount?: number
}

export interface TaskAnalysisPageQueryParams extends TaskDashboardQueryParams {
  pageNo?: number
  pageSize?: number
}

export interface TaskAnalysisRespVO {
  taskId?: number
  taskName?: string
  undertakeDeptName?: string
  sampleCount?: number
  sampleCompletedCount?: number
  completionRate?: number
  createTime?: string
}

export interface TaskAnalysisPageResultRespVO {
  total: number
  list: TaskAnalysisRespVO[]
}

export interface TaskVolumeTrendRespVO {
  sampleCounts?: number[]
  itemCounts?: number[]
  xaxis?: string[]
}

export interface TaskRiskTrendRespVO {
  samplePositiveRates?: number[]
  itemPositiveRates?: number[]
  xaxis?: string[]
}

// 检测任务大屏 - 任务概览
export const getTaskOverview = (params?: TaskDashboardQueryParams) => {
  if (shouldUseDashboardMock()) {
    return resolveDashboardMock(() => getMockTaskOverview(params))
  }
  return request.get<DashboardTaskOverviewRespVO>({
    url: '/agri/dashboard/task/overview',
    params
  })
}

// 检测任务大屏 - 地图
export const getTaskMap = (params?: TaskDashboardQueryParams & { areaLevel?: string }) => {
  if (shouldUseDashboardMock()) {
    return resolveDashboardMock(() => getMockTaskMap((params?.areaLevel as '1' | '2') || '1', params))
  }
  return request.get<TaskMapDataRespVO[]>({
    url: '/agri/dashboard/task/map',
    params
  })
}

// 检测任务大屏 - 下发检测产品品类分布
export const getTaskCategoryDistribution = (params?: TaskDashboardQueryParams) => {
  if (shouldUseDashboardMock()) {
    return resolveDashboardMock(() => getMockTaskCategoryDistribution(params))
  }
  return request.get<TaskCategoryDistributionRespVO[]>({
    url: '/agri/dashboard/task/category-distribution',
    params
  })
}

// 检测任务大屏 - 任务检测分析分页
export const getTaskAnalysisPage = (params?: TaskAnalysisPageQueryParams) => {
  if (shouldUseDashboardMock()) {
    return resolveDashboardMock(() => getMockTaskAnalysisPage(params?.pageNo || 1, params?.pageSize || 10, params))
  }
  return request.get<TaskAnalysisPageResultRespVO>({
    url: '/agri/dashboard/task/analysis-page',
    params
  })
}

// 检测任务大屏 - 任务检测量态势
export const getTaskVolumeTrend = (params?: TaskDashboardQueryParams) => {
  if (shouldUseDashboardMock()) {
    return resolveDashboardMock(() => getMockTaskVolumeTrend(params))
  }
  return request.get<TaskVolumeTrendRespVO>({
    url: '/agri/dashboard/task/volume-trend',
    params
  })
}

// 检测任务大屏 - 检测风险态势
export const getTaskRiskTrend = (params?: TaskDashboardQueryParams) => {
  if (shouldUseDashboardMock()) {
    return resolveDashboardMock(() => getMockTaskRiskTrend(params))
  }
  return request.get<TaskRiskTrendRespVO>({
    url: '/agri/dashboard/task/risk-trend',
    params
  })
}
