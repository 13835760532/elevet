import request from '@/config/axios'

export interface DetectionTaskVO {
  id?: number
  taskCode?: string
  taskName: string
  parentId?: number
  ancestors?: string
  planId?: number
  subjectId?: number
  assignDeptId?: number
  taskType: number
  sampleCount?: number
  detectionVarieties?: string
  detectionItems?: string
  detectionArea?: string
  startDate?: string
  endDate?: string
  receiverId?: number
  receiveTime?: string
  status?: number
}

// 查询检测任务列表
export const getDetectionTaskPage = (params: any) => {
  return request.get({ url: '/agri/detection-task/page', params })
}

// 查询检测任务详情
export const getDetectionTask = (id: number) => {
  return request.get({ url: '/agri/detection-task/get?id=' + id })
}

// 新增检测任务
export const createDetectionTask = (data: DetectionTaskVO) => {
  return request.post({ url: '/agri/detection-task/create', data })
}

// 修改检测任务
export const updateDetectionTask = (data: DetectionTaskVO) => {
  return request.put({ url: '/agri/detection-task/update', data })
}

// 删除检测任务
export const deleteDetectionTask = (id: number) => {
  return request.delete({ url: '/agri/detection-task/delete?id=' + id })
}

// 批量删除检测任务
export const deleteDetectionTaskList = (ids: number[]) => {
  return request.delete({ url: '/agri/detection-task/delete-list', params: { ids: ids.join(',') } })
}

// 导出检测任务 Excel
export const exportDetectionTask = (params: any) => {
  return request.download({ url: '/agri/detection-task/export-excel', params })
}

// 接收检测任务
export const acceptDetectionTask = (id: number) => {
  return request.post({ url: `/agri/app/detection-task/accept/${id}` })
}

// 催办检测任务
export const urgeDetectionTask = (id: number) => {
  return request.put({ url: `/agri/detection-task/urge/${id}` })
}

// 撤回检测任务
export const withdrawDetectionTask = (id: number) => {
  return request.put({ url: `/agri/detection-task/withdraw/${id}` })
}

// 获取任务树
export const getDetectionTaskTree = (planId: number) => {
  return request.get({ url: `/agri/detection-task/tree/${planId}` })
}

// 获取子任务树
export const getDetectionSubTaskTree = (taskId: number) => {
  return request.get({ url: `/agri/detection-task/sub-tree/${taskId}` })
}

// 获取直接子任务列表
export const getDetectionSubTaskList = (parentId: number, params?: any) => {
  return request.get({ url: `/agri/detection-task/sub-tasks/${parentId}`, params })
}

// 拆分子任务
export const splitSubTasks = (data: any) => {
  return request.post({ url: '/agri/detection-task/split-sub-tasks', data })
}
