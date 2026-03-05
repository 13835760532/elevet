import request from '@/config/axios'

/**
 * 通用文件上传接口
 * POST /admin-api/infra/file/upload
 * @param file 文件对象
 * @param directory 可选，文件目录
 * @returns 文件 URL 字符串
 */
export const uploadFile = (file: File, directory?: string) => {
  const data = new FormData()
  data.append('file', file)
  if (directory) {
    data.append('directory', directory)
  }
  return request.upload({ url: '/infra/file/upload', data })
}
