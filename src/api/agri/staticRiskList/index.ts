import request from '@/config/axios'

export interface StaticRiskListVO {
  id: number
  productCategory?: string
  productName?: string
  detectionItem?: string
  positiveItemCount?: number
  totalItemCount?: number
  positiveRate?: number
  foodCategory?: string
  foodSubcategory?: string
  foodType?: string
  unqualifiedItem?: string
  unqualifiedCount?: number
  createTime?: string
}

export interface StaticRiskListPageReqVO {
  timeDimension?: string
  productName?: string
  foodCategory?: string
  foodSubcategory?: string
  foodType?: string
  timeType?: string
  province?: string
  city?: string
  district?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  pageNo: number
  pageSize: number
}

// 查询高风险清单记录
export const getHighRiskList = (params: StaticRiskListPageReqVO) => {
  return request.get({ url: '/agri/static-risk-list/high-risk', params })
}
