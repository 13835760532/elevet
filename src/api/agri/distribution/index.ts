import request from '@/config/axios'

export interface DistributionRelationVO {
  id?: number
  name: string
  ownerType: number
  ownerId: number
  relationType?: string
  maxLevel: number
  status: number
  remark?: string
  levels?: DistributionLevelVO[]
}

export interface DistributionLevelVO {
  id?: number
  levelSort: number
  levelGrade: string
  levelName?: string
  areaCode?: string
  areaName?: string
  // UI 辅助字段
  region?: string[]
}

// 查询分发关系列表
export const getDistributionPage = (params: any) => {
  return request.get({ url: '/agri/dist-relation/page', params })
}

// 查询分发关系详情
export const getDistribution = (id: number) => {
  return request.get({ url: '/agri/dist-relation/detail?id=' + id })
}

// 新增分发关系
export const createDistribution = (data: DistributionRelationVO) => {
  return request.post({ url: '/agri/dist-relation/create', data })
}

// 修改分发关系
export const updateDistribution = (data: DistributionRelationVO) => {
  return request.put({ url: '/agri/dist-relation/update', data })
}

// 更新分发关系状态
export const updateDistributionStatus = (id: number, status: number) => {
  return request.put({ url: '/agri/dist-relation/update-status', params: { id, status } })
}

// 删除分发关系
export const deleteDistribution = (id: number) => {
  return request.delete({ url: '/agri/dist-relation/delete?id=' + id })
}

// 导出分发关系 Excel
export const exportDistribution = (params: any) => {
  return request.download({ url: '/agri/dist-relation/export-excel', params })
}

// 获取可指派的下级机构列表
export const getAssignableTargets = (params: any) => {
  return request.get({ url: '/agri/dist-relation/assignable-targets', params })
}

// 向指定层级添加目标机构/用户
export const addTarget = (relationId: number, levelId: number, params: any) => {
  return request.post({
    url: `/agri/dist-relation/${relationId}/level/${levelId}/add-target`,
    params
  })
}

// 向指定层级批量添加目标机构
export const addTargetList = (relationId: number, levelId: number, data: any[]) => {
  return request.post({
    url: `/agri/dist-relation/${relationId}/level/${levelId}/add-target-list`,
    data
  })
}
