import request from '@/config/axios'

export interface DetectionRecordVO {
  id?: number
  recordCode: string
  sampleId: number
  taskId?: number
  detectionType: number
  detectionDate: string
  subjectName: string
  detectionOrgName?: string
  detector: string
  detectionArea: string
  detectionLocation?: string
  detectionMethod?: string
  detectStandard: string
  testPaperImageUrl?: string
  aiRecognitionResult?: string
  overallResult?: number
  remarks?: string
}

// 查询检测记录列表
export const getDetectionRecordPage = (params: any) => {
  return request.get({ url: '/agri/detection-record/page', params })
}

// 查询检测记录详情
export const getDetectionRecord = (id: number) => {
  return request.get({ url: '/agri/detection-record/get?id=' + id })
}

// 新增检测记录
export const createDetectionRecord = (data: DetectionRecordVO) => {
  return request.post({ url: '/agri/detection-record/create', data })
}

// 修改检测记录
export const updateDetectionRecord = (data: DetectionRecordVO) => {
  return request.put({ url: '/agri/detection-record/update', data })
}

// 删除检测记录
export const deleteDetectionRecord = (id: number) => {
  return request.delete({ url: '/agri/detection-record/delete?id=' + id })
}

// 新增复检
export const recheckDetectionRecord = (data: DetectionRecordVO) => {
  return request.post({ url: '/agri/detection-record/recheck', data })
}

// 批量删除检测记录
export const deleteDetectionRecordList = (ids: number[]) => {
  return request.delete({ url: '/agri/detection-record/delete-list', params: { ids: ids.join(',') } })
}

// 导出检测记录 Excel
export const exportDetectionRecord = (params: any) => {
  return request.download({ url: '/agri/detection-record/export-excel', params })
}

// 更新检测记录备注
export const updateDetectionRecordRemarks = (data: { id: number; remarks: string }) => {
  return request.put({ url: '/agri/detection-record/updateRemarks', data })
}

// 批量修改自主检测记录是否公开
export const updateSelfDetectionPublicFlag = (data: { ids: number[]; publicFlag: boolean }) => {
  return request.put({ url: '/agri/detection-record/update-public-flag', data })
}
