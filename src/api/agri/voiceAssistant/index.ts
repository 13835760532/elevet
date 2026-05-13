import request from '@/config/axios'

export interface VoiceAssistantAskReqVO {
  question: string
}

export interface DetectionItemHazardVO {
  itemName?: string
  restrictionType?: string
  restrictionLabel?: string
}

export interface RiskProductItemVO {
  rank?: number
  productName?: string
  category?: string
  positiveCount?: number
  positiveRate?: number
  detectionItems?: DetectionItemHazardVO[]
}

export interface PositiveItemVO {
  itemName?: string
  positiveCount?: number
  relatedProductName?: string
  restrictionType?: string
  restrictionLabel?: string
}

export interface RiskSummaryRespVO {
  totalCount?: number
  positiveCount?: number
  positiveRate?: number
  forbiddenCount?: number
  restrictedCount?: number
  regularCount?: number
  forbiddenItems?: string[]
  restrictedItems?: string[]
  regularItems?: string[]
}

export interface RiskMonthlyReportRespVO {
  month?: string
  area?: string
  totalCount?: number
  positiveCount?: number
  positiveRate?: number
  riskTopList?: RiskProductItemVO[]
  mainPositiveItems?: PositiveItemVO[]
  suggestion?: string
  summary?: RiskSummaryRespVO
}

export interface RegionRiskItemVO {
  rank?: number
  regionName?: string
  totalCount?: number
  positiveCount?: number
  positiveRate?: number
  topHazardLevel?: string
  topHazardLabel?: string
}

export interface RegionRiskRankingRespVO {
  month?: string
  parentArea?: string
  granularity?: string
  regionList?: RegionRiskItemVO[]
}

export interface ProjectRiskItemVO {
  rank?: number
  itemName?: string
  positiveCount?: number
  relatedProductName?: string
  restrictionType?: string
  restrictionLabel?: string
}

export interface CategoryProjectItemVO {
  category?: string
  mainItems?: string[]
  positiveCount?: number
}

export interface ProjectRiskRankingRespVO {
  month?: string
  area?: string
  projectList?: ProjectRiskItemVO[]
  categoryDistribution?: CategoryProjectItemVO[]
}

export interface RiskTrendCompareRespVO {
  currentMonth?: string
  previousMonth?: string
  area?: string
  current?: RiskMonthlyReportRespVO
  previous?: RiskMonthlyReportRespVO
  totalDiff?: number
  positiveDiff?: number
  positiveRateDiff?: number
  forbiddenDiff?: number
  restrictedDiff?: number
  regularDiff?: number
  riskTrend?: string
  keyAlert?: string
}

export interface CategoryRiskReportRespVO {
  month?: string
  area?: string
  category?: string
  totalCount?: number
  positiveCount?: number
  positiveRate?: number
  riskProductList?: RiskProductItemVO[]
  mainPositiveItems?: PositiveItemVO[]
  subCategoryHint?: string
  suggestion?: string
}

export interface VoiceAssistantAskRespVO {
  success?: boolean
  intent?: string
  voiceText?: string
  monthReport?: RiskMonthlyReportRespVO
  regionRanking?: RegionRiskRankingRespVO
  projectRanking?: ProjectRiskRankingRespVO
  trendCompare?: RiskTrendCompareRespVO
  categoryReport?: CategoryRiskReportRespVO
}

export const ask = (question: string) => {
  return request.post<VoiceAssistantAskRespVO>({
    url: '/agri/voice-assistant/ask',
    data: { question }
  })
}

export const VoiceAssistantApi = {
  ask
}
