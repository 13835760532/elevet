import request from '@/config/axios'

export interface ProductVO {
  id?: number
  productCode: string
  productName: string
  subjectId: number
  category: string
  productSpec?: string
  productUnit?: string
  productImageUrl?: string
  productionArea?: string
  status?: number
}

// 查询产品档案列表
export const getProductPage = (params: any) => {
  return request.get({ url: '/agri/product/page', params })
}

// 查询产品档案详情
export const getProduct = (id: number) => {
  return request.get({ url: '/agri/product/get?id=' + id })
}

// 新增产品档案
export const createProduct = (data: ProductVO) => {
  return request.post({ url: '/agri/product/create', data })
}

// 修改产品档案
export const updateProduct = (data: ProductVO) => {
  return request.put({ url: '/agri/product/update', data })
}

// 删除产品档案
export const deleteProduct = (id: number) => {
  return request.delete({ url: '/agri/product/delete?id=' + id })
}

// 批量删除产品档案
export const deleteProductList = (ids: number[]) => {
  return request.delete({ url: '/agri/product/delete-list', params: { ids: ids.join(',') } })
}

// 导出产品档案 Excel
export const exportProduct = (params: any) => {
  return request.download({ url: '/agri/product/export-excel', params })
}

// 获得导入产品档案模板
export const getImportTemplate = () => {
  return request.download({ url: '/agri/product/get-import-template' })
}

// 导入产品档案
export const importProduct = (data: { file: File; updateSupport: boolean }) => {
  return request.post({
    url: '/agri/product/import',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
