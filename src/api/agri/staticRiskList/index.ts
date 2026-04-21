import request from '@/config/axios'

export interface StaticRiskListVO {
  id: number
  foodCategory: string
  foodSubcategory: string
  foodType: string
  unqualifiedItem: string
  unqualifiedCount: number
  createTime: string
}

export interface StaticRiskListPageReqVO {
  foodCategory?: string
  foodSubcategory?: string
  foodType?: string
  pageNo: number
  pageSize: number
}

// 查询高风险清单记录
export const getHighRiskList = (params: StaticRiskListPageReqVO) => {
  return request.get({ url: '/agri/static-risk-list/high-risk', params })
}
