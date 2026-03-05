import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile as uploadFileApi } from '@/api/common'

/** 文件项类型 */
interface FileItem {
  name: string
  size: number
  status: 'uploading' | 'success' | 'fail'
  url: string
  uid: number
}

/** Hook 配置项 */
interface UseFileUploadOptions {
  /** 上传目录（可选） */
  directory?: string
  /** 最大文件大小（MB），默认 10MB */
  maxSize?: number
  /** 允许的文件类型后缀数组，如 ['.docx', '.pdf', '.jpg'] */
  accept?: string[]
  /** 最大文件数量，默认 5 */
  maxCount?: number
}

/**
 * 通用文件上传 Hook
 * 支持多文件上传、文件类型/大小校验、上传进度管理
 *
 * @example
 * const { fileList, uploadedUrls, handleChange, handleRemove, uploading } = useFileUpload({
 *   directory: 'detection-plan',
 *   maxSize: 10,
 *   accept: ['.docx', '.pdf', '.jpg', '.jpeg', '.png'],
 *   maxCount: 5
 * })
 */
export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    directory = '',
    maxSize = 10,
    accept = [],
    maxCount = 5
  } = options

  // 文件展示列表（包含文件信息）
  const fileList = ref<FileItem[]>([])
  // 已上传成功的文件 URL 列表
  const uploadedUrls = ref<string[]>([])
  // 上传中状态
  const uploading = ref(false)

  /**
   * 校验文件
   */
  const validateFile = (file: File): boolean => {
    // 校验文件类型
    if (accept.length > 0) {
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase()
      if (!accept.includes(ext)) {
        ElMessage.warning(`不支持的文件格式：${ext}，请上传 ${accept.join('、')} 格式的文件`)
        return false
      }
    }
    // 校验文件大小
    if (file.size / 1024 / 1024 > maxSize) {
      ElMessage.warning(`文件大小不能超过 ${maxSize}MB`)
      return false
    }
    // 校验文件数量
    if (fileList.value.length >= maxCount) {
      ElMessage.warning(`最多只能上传 ${maxCount} 个文件`)
      return false
    }
    return true
  }

  /**
   * 处理文件选择（el-upload 的 on-change 回调）
   * 自动上传文件到服务器
   */
  const handleChange = async (fileInfo: any) => {
    const rawFile: File = fileInfo.raw || fileInfo
    // 校验
    if (!validateFile(rawFile)) return

    // 添加到文件列表（先展示，状态为 uploading）
    const fileItem: FileItem = {
      name: rawFile.name,
      size: rawFile.size,
      status: 'uploading',
      url: '',
      uid: fileInfo.uid || Date.now()
    }
    fileList.value.push(fileItem)

    // 上传到服务器
    uploading.value = true
    try {
      const res = await uploadFileApi(rawFile, directory)
      // 上传成功，更新文件状态和 URL
      const url: string = typeof res === 'string' ? res : (res as any)?.data || res
      fileItem.status = 'success'
      fileItem.url = url
      uploadedUrls.value.push(url)
      ElMessage.success(`文件 ${rawFile.name} 上传成功`)
    } catch (error) {
      // 上传失败，更新状态
      fileItem.status = 'fail'
      console.error('文件上传失败：', error)
      ElMessage.error(`文件 ${rawFile.name} 上传失败`)
    } finally {
      uploading.value = false
    }
  }

  /**
   * 移除文件
   */
  const handleRemove = (index: number) => {
    const removed = fileList.value[index]
    if (removed && removed.url) {
      // 从已上传 URL 列表中移除
      const urlIndex = uploadedUrls.value.indexOf(removed.url)
      if (urlIndex > -1) {
        uploadedUrls.value.splice(urlIndex, 1)
      }
    }
    fileList.value.splice(index, 1)
  }

  /**
   * 获取附件 JSON 字符串（用于提交表单）
   */
  const getAttachmentsJson = (): string => {
    const urls = uploadedUrls.value.filter(Boolean)
    return urls.length > 0 ? JSON.stringify(urls) : ''
  }

  /**
   * 设置已有的附件（编辑模式回填）
   * @param jsonStr JSON 格式的 URL 数组字符串
   */
  const setAttachments = (jsonStr: string) => {
    if (!jsonStr) return
    try {
      const urls = JSON.parse(jsonStr)
      if (Array.isArray(urls)) {
        uploadedUrls.value = [...urls]
        fileList.value = urls.map((url: string, i: number) => ({
          name: url.split('/').pop() || `附件${i + 1}`,
          size: 0,
          status: 'success' as const,
          url: url,
          uid: Date.now() + i
        }))
      }
    } catch (e) {
      console.warn('附件数据解析失败：', e)
    }
  }

  /**
   * 清空所有文件
   */
  const clearFiles = () => {
    fileList.value = []
    uploadedUrls.value = []
  }

  return {
    fileList,
    uploadedUrls,
    uploading,
    handleChange,
    handleRemove,
    getAttachmentsJson,
    setAttachments,
    clearFiles
  }
}
