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

/**
 * 新流程 - 上传合格证图片并解析 (包含本平台二维码识别与其他平台 OCR)
 * @param params { file: File, sourceHint?: number }
 */
export const parseImage = (params: { file: File, sourceHint?: number }) => {
  return request.post({
    url: '/agri/certificate-verification/parse-image',
    params,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
/**
 * 新流程 - 直接创建存证记录（已存证状态）
 * @param data { CreateArchiveReqVO }
 */// 直接创建存证记录
export const createArchive = async (data: any) => {
  return await request.post({ url: '/admin-api/agri/certificate-verification/create-archive', data })
}

// 更新合格证查验（通用）
export const updateCertificateVerification = async (data: any) => {
  return await request.put({ url: '/admin-api/agri/certificate-verification/update', data })
}
