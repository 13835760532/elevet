import request from '@/config/axios'

export interface WorkbenchRiskReportRespVO {
  reportType?: 'DAY' | 'MONTH'
  startDate?: string
  endDate?: string
  title?: string
  totalCount?: number
  positiveCount?: number
  positiveRate?: number
  highRiskProducts?: string[]
  highRiskItems?: string[]
  remark?: string
  hasData?: boolean
}

// 获取工作台风险月报
export const getRiskMonthly = (params: { monthDate?: string }) => {
  return request.get({
    url: '/agri/workbench/risk-monthly',
    params
  })
}

// 获取工作台风险日报
export const getRiskDaily = (params: { reportDate?: string }) => {
  return request.get({
    url: '/agri/workbench/risk-daily',
    params
  })
}
