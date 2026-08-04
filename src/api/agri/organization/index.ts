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

// 后台更新机构及备案主体的请求头及字段配置 VO，继承创办机构及备案字段并新增对应更新字段
export interface UpdateDeptWithFilingReqVO extends CreateDeptWithFilingReqVO {
  id: number
  leaderUserId?: number
  phone?: string
  email?: string
}

// 机构及备案主体整合型详情页数据返回 VO
export interface OrganizationDeptWithFilingRespVO extends UpdateDeptWithFilingReqVO {}

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

// 后台更新机构及备案主体接口，同步修改机构自身资料及关联主体的档案数据
export const updateDeptWithFiling = (data: UpdateDeptWithFilingReqVO) => {
  return request.put({ url: '/agri/organization/update-dept-with-filing', data })
}

// 专门拉取和回显后台机构配合其所属已备案主体材料全部属性的详情接口
export const getDeptWithFiling = (deptId: number): Promise<OrganizationDeptWithFilingRespVO> => {
  return request.get({ url: '/agri/organization/dept-with-filing', params: { deptId } })
}
