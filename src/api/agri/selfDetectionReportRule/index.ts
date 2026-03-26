import request from '@/config/axios'

export interface SelfDetectionReportRuleVO {
  id?: number
  deptId?: number
  enabled: boolean
  startTime?: string
  endTime?: string
  remark?: string
  createTime?: string
}

// 获得当前机构的自主检测数据上报规则
export const getCurrentSelfDetectionReportRule = () => {
  return request.get({ url: '/agri/self-detection-report-rule/get-current' })
}

// 创建自主检测数据上报规则
export const createSelfDetectionReportRule = (data: any) => {
  return request.post({ url: '/agri/self-detection-report-rule/create', data })
}

// 修改当前机构的自主检测数据上报规则
export const updateSelfDetectionReportRule = (data: any) => {
  return request.put({ url: '/agri/self-detection-report-rule/update', data })
}
