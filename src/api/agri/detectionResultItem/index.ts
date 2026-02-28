import request from '@/config/axios'

export interface DetectionResultItemVO {
  id?: number
  recordId: number
  sampleId: number
  detectionItem: string
  pesticideId?: number
  detectionValue?: number
  unit?: string
  limitValue?: number
  detectionMethod?: string
  confidence?: number
  result?: number
}

// 查询检测结果项列表
export const getDetectionResultItemPage = (params: any) => {
  return request.get({ url: '/agri/detection-result-item/page', params })
}

// 查询检测结果项详情
export const getDetectionResultItem = (id: number) => {
  return request.get({ url: '/agri/detection-result-item/get?id=' + id })
}

// 新增检测结果项
export const createDetectionResultItem = (data: DetectionResultItemVO) => {
  return request.post({ url: '/agri/detection-result-item/create', data })
}

// 修改检测结果项
export const updateDetectionResultItem = (data: DetectionResultItemVO) => {
  return request.put({ url: '/agri/detection-result-item/update', data })
}

// 删除检测结果项
export const deleteDetectionResultItem = (id: number) => {
  return request.delete({ url: '/agri/detection-result-item/delete?id=' + id })
}

// 批量删除检测结果项
export const deleteDetectionResultItemList = (ids: number[]) => {
  return request.delete({ url: '/agri/detection-result-item/delete-list', params: { ids: ids.join(',') } })
}

// 导出检测结果项 Excel
export const exportDetectionResultItem = (params: any) => {
  return request.download({ url: '/agri/detection-result-item/export-excel', params })
}
