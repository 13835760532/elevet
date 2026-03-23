import request from '@/config/axios'

export interface DetectionReportVO {
  id?: number
  recordId: number
  reportCode?: string
  status?: number
}

// 从检测记录一键生成检测报告
export const generateReport = (recordId: number) => {
  return request.post({
    url: `/agri/detection-report/generate?recordId=${recordId}`
  })
}

// 获取检测报告详情
export const getDetectionReport = (id: number) => {
  return request.get({ url: `/agri/detection-report/get?id=${id}` })
}

// 查询检测报告列表
export const getDetectionReportPage = (params: any) => {
  return request.get({ url: `/agri/detection-report/page`, params })
}

// 根据检测记录ID获得检测报告
export const getDetectionReportByRecordId = (recordId: number) => {
  return request.get({ url: `/agri/detection-report/get-by-record?recordId=${recordId}` })
}
