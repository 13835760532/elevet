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

// 机构备案
export const filingOrganization = (data: OrganizationFilingReqVO) => {
  return request.post({ url: '/agri/organization/filing', data })
}

// 查询当前用户部门是否已备案
export const hasFiled = () => {
  return request.get({ url: '/agri/organization/has-filed' })
}
