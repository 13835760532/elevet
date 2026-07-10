import { describe, expect, it } from 'vitest'
import { getTaskQueryDeptScope, resolveStatisticsTab } from './statisticsTabs'

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
    ['all', 1]
  ] as const)('maps %s to queryDeptScope=%i', (command, scope) => {
    expect(getTaskQueryDeptScope(command)).toBe(scope)
  })

  it('falls back to the backend default scope for an unknown command', () => {
    expect(getTaskQueryDeptScope(undefined)).toBe(0)
  })
})
