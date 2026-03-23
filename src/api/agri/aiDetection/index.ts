import request from '@/config/axios'

/**
 * AI检测结果响应 VO
 */
export interface AiDetectionResultRespVO {
  aiImage: string
  timestamp: string
  results: ResultItem[]
}

/**
 * 检测结果项
 */
export interface ResultItem {
  cardChannel: string
  qrCode: string
  channel: string
  codeName: string
  result: string
  concentration?: string
  status: string
  codeID: string
  detectionDate: string
  detectionStatus: string
  cardOrder: string
}

/**
 * 上传图片进行AI检测
 * @param sampleName 样本名称
 * @param file 图片文件
 */
export const detectImage = (sampleName: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post({
    url: `/agri/ai-detection/detect?sampleName=${encodeURIComponent(sampleName || '')}`,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const AiDetectionApi = {
  detectImage
}
