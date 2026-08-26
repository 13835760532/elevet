import { describe, expect, it } from 'vitest'
import {
  getBigScreenApiDataScope,
  getBigScreenDataScopeOptions,
  getBigScreenQueryDeptScope,
  resolveBigScreenDataScope
} from './dataScope'

describe('big-screen data scope options', () => {
  it('shows three scopes for regulatory departments and super admins', () => {
    expect(getBigScreenDataScopeOptions(true)).toEqual([
      { label: '本辖区监管范畴检测数据（默认）', value: 'all' },
      { label: '本机构下发采集数据', value: 'issued' },
      { label: '本机构执行任务采集数据', value: 'self' }
    ])
  })

  it('shows only organization scopes for other departments', () => {
    expect(getBigScreenDataScopeOptions(false)).toEqual([
      { label: '本机构下发采集数据', value: 'issued' },
      { label: '本机构执行任务采集数据', value: 'self' }
    ])
  })
})

describe('big-screen cached data scope', () => {
  it('uses the jurisdiction scope by default for regulatory departments and super admins', () => {
    expect(resolveBigScreenDataScope(undefined, true)).toBe('all')
    expect(resolveBigScreenDataScope('jurisdiction', true)).toBe('all')
  })

  it('falls back to an available organization scope for other departments', () => {
    expect(resolveBigScreenDataScope(undefined, false)).toBe('issued')
    expect(resolveBigScreenDataScope('all', false)).toBe('issued')
    expect(resolveBigScreenDataScope('jurisdiction', false)).toBe('issued')
  })

  it('keeps organization scopes for every department type', () => {
    expect(resolveBigScreenDataScope('issued', true)).toBe('issued')
    expect(resolveBigScreenDataScope('self', false)).toBe('self')
  })
})

describe('big-screen query department scope', () => {
  it.each([
    ['all', 1],
    ['self', 2],
    ['issued', 3]
  ] as const)('maps %s to queryDeptScope=%i', (scope, queryDeptScope) => {
    expect(getBigScreenQueryDeptScope(scope)).toBe(queryDeptScope)
  })
})

describe('big-screen API data scope', () => {
  it('maps "all" (jurisdiction) to AREA_REGULATE', () => {
    expect(getBigScreenApiDataScope('all')).toBe('AREA_REGULATE')
  })

  it('returns scope as is for organization scopes', () => {
    expect(getBigScreenApiDataScope('issued')).toBe('issued')
    expect(getBigScreenApiDataScope('self')).toBe('self')
  })

  it('returns undefined when scope is empty', () => {
    expect(getBigScreenApiDataScope(undefined)).toBeUndefined()
  })
})
