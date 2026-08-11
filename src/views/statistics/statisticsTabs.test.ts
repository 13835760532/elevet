import { describe, expect, it } from 'vitest'
import {
  getGeneralQueryDeptScope,
  getStatisticsDataScope,
  getTaskQueryDeptScope,
  resolveStatisticsTab
} from './statisticsTabs'

describe('statistics tabs', () => {
  it('opens all statistics when the route has no explicit tab', () => {
    expect(resolveStatisticsTab(undefined)).toBe('all')
  })

  it('honors an explicit tab from the route query', () => {
    expect(resolveStatisticsTab('task')).toBe('task')
  })
})

describe('task statistics department scope', () => {
  it.each([
    ['issued', 3],
    ['executed', 2],
    ['all', 1],
    ['operation', 2]
  ] as const)('maps %s to queryDeptScope=%i', (command, scope) => {
    expect(getTaskQueryDeptScope(command)).toBe(scope)
  })

  it('falls back to the backend default scope for an unknown command', () => {
    expect(getTaskQueryDeptScope(undefined)).toBe(0)
  })
})

describe('general statistics department scope', () => {
  it.each([
    ['area', 1],
    ['operation', 2],
    ['own', 3]
  ] as const)('maps %s to queryDeptScope=%i', (command, scope) => {
    expect(getGeneralQueryDeptScope(command)).toBe(scope)
  })
})

describe('statistics data scope', () => {
  it.each([
    ['own', 'SELF_ORG'],
    ['self', 'SELF_ORG'],
    ['task', 'SELF_ORG'],
    ['issued', 'SELF_ORG'],
    ['executed', 'SELF_ORG'],
    ['area', 'AREA_REGULATE'],
    ['all', 'AREA_REGULATE'],
    ['operation', 'ALL']
  ] as const)('maps %s to dataScope=%s', (command, scope) => {
    expect(getStatisticsDataScope(command)).toBe(scope)
  })
})
