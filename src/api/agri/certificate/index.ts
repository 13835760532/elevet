import request from '@/config/axios'

export interface CertificateVO {
  id?: number
  certificateCode: string
  certificateType: number
  subjectId: number
  productId?: number
  productName: string
  detectionRecordId?: number
  productionDate?: string
  batchNo?: string
  quantity?: number
  unit?: string
  issueDate: string
  status?: number
  qrCode: string
  attachmentUrls?: string
}

// 查询合格证记录列表
export const getCertificatePage = (params: any) => {
  return request.get({ url: '/agri/certificate/page', params })
}

// 查询合格证记录详情
export const getCertificate = (id: number) => {
  return request.get({ url: '/agri/certificate/get?id=' + id })
}

// 新增合格证记录
export const createCertificate = (data: CertificateVO) => {
  return request.post({ url: '/agri/certificate/create', data })
}

// 修改合格证记录
export const updateCertificate = (data: CertificateVO) => {
  return request.put({ url: '/agri/certificate/update', data })
}

// 删除合格证记录
export const deleteCertificate = (id: number) => {
  return request.delete({ url: '/agri/certificate/delete?id=' + id })
}

// 批量删除合格证记录
export const deleteCertificateList = (ids: number[]) => {
  return request.delete({ url: '/agri/certificate/delete-list', params: { ids: ids.join(',') } })
}

// 导出合格证记录 Excel
export const exportCertificate = (params: any) => {
  return request.download({ url: '/agri/certificate/export-excel', params })
}
