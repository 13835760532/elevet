import request from '@/config/axios'

export const getProduceCategoryPage = async (params) => {
  return await request.get({ url: '/agri/produce-category/page', params })
}
