import request from '@/config/axios'

export interface SampleVO {
  id?: number
  sampleCode: string
  productId: number
  taskId?: number
  batchNo?: string
  productionDate?: string
  sampleSource?: string
  sampleImageUrl?: string
  sampleQuantity?: number
  samplingDate: string
  sampler: string
}

// 查询检测样品列表
export const getSamplePage = (params: any) => {
  return request.get({ url: '/agri/sample/page', params })
}

// 查询检测样品详情
export const getSample = (id: number) => {
  return request.get({ url: '/agri/sample/get?id=' + id })
}

// 新增检测样品
export const createSample = (data: SampleVO) => {
  return request.post({ url: '/agri/sample/create', data })
}

// 修改检测样品
export const updateSample = (data: SampleVO) => {
  return request.put({ url: '/agri/sample/update', data })
}

// 删除检测样品
export const deleteSample = (id: number) => {
  return request.delete({ url: '/agri/sample/delete?id=' + id })
}

// 批量删除检测样品
export const deleteSampleList = (ids: number[]) => {
  return request.delete({ url: '/agri/sample/delete-list', params: { ids: ids.join(',') } })
}

// 导出检测样品 Excel
export const exportSample = (params: any) => {
  return request.download({ url: '/agri/sample/export-excel', params })
}
