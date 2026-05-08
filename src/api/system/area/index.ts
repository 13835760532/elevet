import request from '@/config/axios'

// 获得地区树
export const getAreaTree = async () => {
  return await request.get({ url: '/system/area/tree' })
}

// 按关键字+级别搜索地区（树形，每个命中节点带完整子树）
export const searchAreaTree = async (params: { keyword: string; type?: number }) => {
  return await request.get({ url: '/system/area/search-tree', params })
}

// 获得 IP 对应的地区名
export const getAreaByIp = async (ip: string) => {
  return await request.get({ url: '/system/area/get-by-ip?ip=' + ip })
}

