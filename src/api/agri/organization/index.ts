import request from '@/config/axios'

export interface OrganizationFilingReqVO {
  subjectType: number
  name: string
  category?: string
  mainProducts?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  address?: string
  contactName: string
  contactPhone: string
  productionScale?: string
  productionScaleUnit?: string
  businessLicenseUrl?: string
  socialCreditCode?: string
  idCardFrontUrl?: string
  idCardBackUrl?: string
  qualificationUrls?: string
  introduction?: string
  legalPerson?: string
}

export interface CreateDeptWithFilingReqVO extends OrganizationFilingReqVO {
  parentId?: number
  sort: number
  status: number
  deptType: number
  industry?: string
  areaLevel?: number
  areaCode?: string
}

export interface EnterpriseDeptRespVO {
  deptId: number
  name: string
  socialCreditCode?: string
  contactName?: string
  contactPhone?: string
  address?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
}

// 机构备案
export const filingOrganization = (data: OrganizationFilingReqVO) => {
  return request.post({ url: '/agri/organization/filing', data })
}

// 创建机构 + 备案
export const createWithFiling = (data: OrganizationFilingReqVO) => {
  return request.post({ url: '/agri/organization/create-with-filing', data })
}

// 查询当前用户部门是否已备案
export const hasFiled = () => {
  return request.get({ url: '/agri/organization/has-filed' })
}

// 关联当前登录用户到指定机构
export const bindDept = (deptId: number) => {
  return request.post({ url: '/agri/organization/bind', params: { deptId } })
}

// 查询生产经营机构列表
export const getEnterpriseList = (): Promise<EnterpriseDeptRespVO[]> => {
  return request.get({ url: '/agri/organization/enterprise-list' })
}

// 后台创建机构 + 备案
export const createDeptWithFiling = (data: CreateDeptWithFilingReqVO) => {
  return request.post({ url: '/agri/organization/create-dept-with-filing', data })
}
