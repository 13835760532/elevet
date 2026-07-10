import {
  CERTIFICATE_TREND_GRANULARITY,
  type CertificateTrendTimeGranularity
} from '@/api/agri/dashboard/certificate'
import type { StatisticsQueryParams } from './statisticsData'

export type CertificateTrendTimeUnit = NonNullable<StatisticsQueryParams['timeUnit']>

export const getCertificateTrendTimeGranularity = (
  timeUnit?: CertificateTrendTimeUnit
): CertificateTrendTimeGranularity =>
  timeUnit === 'DAY'
    ? CERTIFICATE_TREND_GRANULARITY.DAY
    : CERTIFICATE_TREND_GRANULARITY.MONTH

export const buildCertificateTrendQueryParams = <T extends { timeUnit?: CertificateTrendTimeUnit }>(
  params: T
) => ({
  ...params,
  timeGranularity: getCertificateTrendTimeGranularity(params.timeUnit)
})
