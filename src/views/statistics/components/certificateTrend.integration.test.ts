import { describe, expect, it } from 'vitest'
import { buildCertificateTrendQueryParams } from './certificateTrend'
import { buildRangeParams } from './statisticsData'

describe('certificate service trend granularity', () => {
  it('uses daily points for week and month date ranges', () => {
    const weekRange = buildRangeParams('近一周', [])
    const monthRange = buildRangeParams('近一月', [])

    expect(buildCertificateTrendQueryParams(weekRange).timeGranularity).toBe('2')
    expect(buildCertificateTrendQueryParams(monthRange).timeGranularity).toBe('2')
  })

  it('uses monthly points for long date ranges', () => {
    expect(buildCertificateTrendQueryParams({ timeUnit: 'MONTH' }).timeGranularity).toBe('1')
  })
})
