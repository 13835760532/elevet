import request from '@/config/axios'

export interface SubjectVO {
  id?: number
  userId?: number
  name: string
  type: number
  category?: string
  socialCreditCode?: string
  legalPerson?: string
  businessLicenseUrl?: string
  qualificationUrls?: string
  idCard?: string
  idCardFrontUrl?: string
  idCardBackUrl?: string
  contactName: string
  contactPhone: string
  provinceCode?: string
  cityCode?: string
}

// 查询主体档案列表
export const getSubjectPage = (params: any) => {
  return request.get({ url: '/agri/subject/page', params })
}

// 查询主体档案详情
export const getSubject = (id: number) => {
  return request.get({ url: '/agri/subject/get?id=' + id })
}

// 我的主体档案
export const getMySubject = () => {
  return request.get({ url: '/agri/subject/my' })
}

// 新增主体档案
export const createSubject = (data: SubjectVO) => {
  return request.post({ url: '/agri/subject/create', data })
}

// 修改主体档案
export const updateSubject = (data: SubjectVO) => {
  return request.put({ url: '/agri/subject/update', data })
}

// 删除主体档案
export const deleteSubject = (id: number) => {
  return request.delete({ url: '/agri/subject/delete?id=' + id })
}

// 批量删除主体档案
export const deleteSubjectList = (ids: number[]) => {
  return request.delete({ url: '/agri/subject/delete-list', params: { ids: ids.join(',') } })
}

// 导出主体档案 Excel
export const exportSubject = (params: any) => {
  return request.download({ url: '/agri/subject/export-excel', params })
}
