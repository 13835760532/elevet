import request from '@/config/axios'

export const getProducePage = async (params) => {
  return await request.get({ url: '/agri/produce/page', params })
}
