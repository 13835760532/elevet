import request from '@/config/axios'

export interface CertificateVO {
  id?: number
  certificateCode: string
  certificateType: number
  subjectId: number
  productId?: number
  productName: string
  detectionRecordId?: number[]
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

// 根据编号查询合格证详情（上游关联专用）
export const getCertificateByCode = (certificateCode: string) => {
  return request.get({ url: '/agri/certificate/query-upstream?certificateCode=' + certificateCode })
}

// 新增合格证记录
export const createCertificate = (data: CertificateVO) => {
  return request.post({ url: '/agri/certificate/create', data })
}

// 修改合格证记录
export const updateCertificate = (data: CertificateVO) => {
  return request.put({ url: '/agri/certificate/update', data })
}

// 作废合格证
export const voidCertificate = (data: { id: number; voidReason: string }) => {
  return request.put({ url: '/agri/certificate/void', data })
}

// 保存合格证草稿
export const saveDraft = (data: any) => {
  return request.post({ url: '/agri/certificate/save-draft', data })
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

// 查询查验存证列表分页
export const getCertificateVerificationPage = (params: any) => {
  return request.get({ url: '/agri/certificate-verification/page', params })
}

// 导出查验存证 Excel
export const exportCertificateVerification = (params: any) => {
  return request.download({ url: '/agri/certificate-verification/export-excel', params })
}

// 获取查验存证详情
export const getCertificateVerificationDetail = (id: number) => {
  return request.get({ url: '/agri/certificate-verification/detail?id=' + id })
}

// 删除合格证查验记录
export const deleteCertificateVerification = (id: number) => {
  return request.delete({ url: '/agri/certificate-verification/delete?id=' + id })
}

// 根据编号查询上游合格证
export const queryUpstreamCertificate = (certificateCode: string) => {
  return request.get({ url: '/agri/certificate/query-upstream?certificateCode=' + certificateCode })
}

// 合格证溯源 - 根据合格证编号查询合格证、检测报告及上游合格证
export const traceCertificate = (certificateCode: string) => {
  return request.get({ url: '/agri/certificate/trace?certificateCode=' + certificateCode })
}
