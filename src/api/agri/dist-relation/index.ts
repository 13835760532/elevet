import request from '@/config/axios'

export interface AssignableDeptReqVO {
  name?: string
  deptType?: string | number
  status?: string | number
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  socialCreditCode?: string
  pageNo: number
  pageSize: number
}

export interface AssignableDeptRespVO {
  deptId: number
  name: string
  socialCreditCode?: string
  contactName?: string
  contactPhone?: string
  address?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

// 分页查询当前行政级别下可绑定机构列表
export const getAssignableDepts = (params: AssignableDeptReqVO): Promise<PageResult<AssignableDeptRespVO>> => {
  return request.get({ url: '/agri/dist-relation/assignable-depts', params })
}
