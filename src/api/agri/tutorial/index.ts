import request from '@/config/axios'

export type TutorialType = 'MANUAL' | 'VIDEO'

export interface TutorialPageReqVO extends PageParam {
  keyword?: string
  type?: TutorialType
  status?: number
}

export interface TutorialRespVO {
  id: number
  title: string
  summary?: string
  type: TutorialType
  content?: string
  url?: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

export interface TutorialSaveReqVO {
  id?: number
  title: string
  summary?: string
  type: TutorialType
  content?: string
  url?: string
  sort: number
  status: number
}

export interface TutorialPageResult {
  list: TutorialRespVO[]
  total: number
}

/** 获取操作手册或操作视频分页数据。 */
export const getTutorialPage = (params: TutorialPageReqVO) => {
  return request.get<TutorialPageResult>({ url: '/agri/tutorial/page', params })
}

/** 获取教程详情。 */
export const getTutorial = (id: number) => {
  return request.get<TutorialRespVO>({ url: '/agri/tutorial/get', params: { id } })
}

/** 创建教程。 */
export const createTutorial = (data: TutorialSaveReqVO) => {
  return request.post<number>({ url: '/agri/tutorial/create', data })
}

/** 更新教程。 */
export const updateTutorial = (data: TutorialSaveReqVO) => {
  return request.put<boolean>({ url: '/agri/tutorial/update', data })
}

/** 删除教程。 */
export const deleteTutorial = (id: number) => {
  return request.delete<boolean>({ url: '/agri/tutorial/delete', params: { id } })
}

/** 校验当前用户的教程访问密码。 */
export const verifyTutorialAccessPassword = (password: string) => {
  return request.post<boolean>({
    url: '/agri/tutorial/verify-access-password',
    data: { password }
  })
}
