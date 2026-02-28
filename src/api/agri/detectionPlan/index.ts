import request from '@/config/axios'

export interface DetectionPlanVO {
  id?: number
  planCode?: string
  planName: string
  planType: number
  planPeriodType?: number
  planPeriodYear?: number
  planPeriodMonth?: number
  planPeriodWeek?: number
  planStartDate: string
  planEndDate: string
  issuerDeptId: number
  sampleCount?: number
  detectionItems?: string
  targetCategory?: string
  targetArea?: string
  planRequirements?: string
  planAttachments?: string
  status?: number
}

// 查询检测方案列表
export const getDetectionPlanPage = (params: any) => {
  return request.get({ url: '/agri/detection-plan/page', params })
}

// 查询检测方案详情
export const getDetectionPlan = (id: number) => {
  return request.get({ url: '/agri/detection-plan/get?id=' + id })
}

// 新增检测方案
export const createDetectionPlan = (data: DetectionPlanVO) => {
  return request.post({ url: '/agri/detection-plan/create', data })
}

// 修改检测方案
export const updateDetectionPlan = (data: DetectionPlanVO) => {
  return request.put({ url: '/agri/detection-plan/update', data })
}

// 删除检测方案
export const deleteDetectionPlan = (id: number) => {
  return request.delete({ url: '/agri/detection-plan/delete?id=' + id })
}

// 批量删除检测方案
export const deleteDetectionPlanList = (ids: number[]) => {
  return request.delete({ url: '/agri/detection-plan/delete-list', params: { ids: ids.join(',') } })
}

// 导出检测方案 Excel
export const exportDetectionPlan = (params: any) => {
  return request.download({ url: '/agri/detection-plan/export-excel', params })
}

// 拆分检测方案为任务
export const splitPlanTasks = (planId: number) => {
  return request.post({ url: `/agri/detection-plan/split-tasks`, params: { planId } })
}

// 获取方案任务列表
export const getPlanTasks = (planId: number) => {
  return request.get({ url: `/agri/detection-plan/tasks/${planId}` })
}

// 获取方案统计数据
export const getPlanStatistics = (planId: number) => {
  return request.get({ url: `/agri/detection-plan/statistics/${planId}` })
}
