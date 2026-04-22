import request from '@/config/axios'

export interface ProduceTargetLimitSearchReqVO {
  pageNo: number
  pageSize: number
  keyword?: string
}

export interface ProduceRangeVO {
  foodCategory?: string
  foodName?: string
  maxResidueLimit?: number
  unit?: string
}

export interface ProduceTargetLimitGroupRespVO {
  targetName: string
  produceRanges: ProduceRangeVO[]
}

// 根据关键字搜索农产品目标物标准限值（按目标物分组）
export const searchProduceTargetLimitByKeyword = (data: ProduceTargetLimitSearchReqVO) => {
  return request.post({ url: '/agri/produce-target-limit/search-by-keyword', data })
}
