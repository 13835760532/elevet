import request from '@/config/axios'

/**
 * 本平台合格证查验
 * @param data { certificateCode: string; verificationType: number }
 */
export const verifyLocal = (data: { certificateCode: string; verificationType?: number }) => {
  return request.post({ url: '/agri/certificate-verification/verify-local', data })
}

/**
 * 其他平台合格证查验/存证
 */
export const verifyExternal = (data: any) => {
  return request.post({ url: '/agri/certificate-verification/verify-external', data })
}

/**
 * 获得查验存证详情
 * @param id 编号
 */
export const getVerification = (id: number) => {
  return request.get({ url: '/agri/certificate-verification/get?id=' + id })
}

/**
 * 查验存证列表分页
 * @param params 分页查询参数
 */
export const getCertificateVerificationPage = (params: any) => {
  return request.get({ url: '/agri/certificate-verification/page', params })
}

/**
 * 辖区统计
 * @param deptId 部门编号
 */
export const getStatistics = (deptId?: number) => {
  return request.get({ url: '/agri/certificate-verification/statistics', params: { deptId } })
}
