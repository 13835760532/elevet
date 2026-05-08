import request from '@/config/axios'

export interface ProduceRangeVO {
  foodCategory: string
  foodName: string
  maxResidueLimit: number
  unit: string
}

export interface ProduceTargetLimitGroupRespVO {
  targetName: string
  mainPurpose: string
  produceRanges: ProduceRangeVO[]
}

export interface TargetRangeVO {
  targetCategory: string
  targetName: string
  restrictionType: string
}

export interface ProduceTargetLimitProduceGroupRespVO {
  produceName: string
  fullCategory: string
  targetRanges: TargetRangeVO[]
}

export interface ProduceTargetLimitSearchReqVO {
  pageNo: number
  pageSize: number
  keyword?: string
}

/** 国标限量：根据关键字搜索农产品或者目标物对应的标准限值（按目标物分组） */
export const searchProduceTargetLimitByKeyword = (data: ProduceTargetLimitSearchReqVO) => {
  return request.post({ url: '/agri/produce-target-limit/search-by-keyword', data })
}

/** 指标推荐：搜索农产品名称或关键词查询产品对应的指标 */
export const recommendTargetsByProduct = (data: ProduceTargetLimitSearchReqVO) => {
  return request.post({ url: '/agri/produce-target-limit/recommend-targets-by-product', data })
}
