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
// 创建分发节点目标关联
export interface DistNodeTargetSaveReqVO {
  id?: number
  relationId: number
  levelId: number
  targetType: number // 1-个人(user) 2-机构(dept)
  targetId: number
  targetName: string
  deptId?: number
}

export const createDistNodeTarget = (data: DistNodeTargetSaveReqVO) => {
  return request.post({ url: '/biz/dist-node-target/create', data })
}
// 获取可指派的下级机构列表
export interface AssignableTargetReqVO {
  relationId?: string
  relationType?: string | number
  deptType?: string | number
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  keyword?: string
}

export interface AssignableTargetVO {
  targetId: number
  targetName: string
  targetNo?: string
  deptType: number
  areaLevel: number
  targetAreaCode: string
  socialCreditCode?: string
  contactName?: string
  contactPhone?: string
}

export const getAssignableTargets = (params: AssignableTargetReqVO): Promise<AssignableTargetVO[]> => {
  return request.get({ url: '/agri/dist-relation/assignable-targets', params })
}
