import request from '@/config/axios'

export interface IndicatorLimitVO {
  id?: number
  productCategory?: string
  productCategoryLevel2?: string
  categoryName?: string
  purpose?: string
  targetCategory?: string
  targetType?: string
  targetName?: string
  limitType: number
  limitValue: number
  unit: string
}

// 查询指标限量标准列表
export const getIndicatorLimitPage = (params: any) => {
  return request.get({ url: '/agri/indicator-limit/page', params })
}

// 查询指标限量标准详情
export const getIndicatorLimit = (id: number) => {
  return request.get({ url: '/agri/indicator-limit/get?id=' + id })
}

// 新增指标限量标准
export const createIndicatorLimit = (data: IndicatorLimitVO) => {
  return request.post({ url: '/agri/indicator-limit/create', data })
}

// 修改指标限量标准
export const updateIndicatorLimit = (data: IndicatorLimitVO) => {
  return request.put({ url: '/agri/indicator-limit/update', data })
}

// 删除指标限量标准
export const deleteIndicatorLimit = (id: number) => {
  return request.delete({ url: '/agri/indicator-limit/delete?id=' + id })
}

// 批量删除指标限量标准
export const deleteIndicatorLimitList = (ids: number[]) => {
  return request.delete({ url: '/agri/indicator-limit/delete-list', params: { ids: ids.join(',') } })
}

// 导出指标限量标准 Excel
export const exportIndicatorLimit = (params: any) => {
  return request.download({ url: '/agri/indicator-limit/export-excel', params })
}

// 按检测对象分组查询指标限量标准
export const getIndicatorLimitGroupByTargetPage = (params: any) => {
  return request.get({ url: '/agri/indicator-limit/group-by-target-page', params })
}

// 按产品分组查询指标限量标准
export const getIndicatorLimitGroupByProductPage = (params: any) => {
  return request.get({ url: '/agri/indicator-limit/group-by-product-page', params })
}
