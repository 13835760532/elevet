export type BigScreenDataScope = 'all' | 'issued' | 'self'

export interface BigScreenDataScopeOption {
  label: string
  value: BigScreenDataScope
}

export type BigScreenQueryDeptScope = 1 | 2 | 3

const jurisdictionScopeOption: BigScreenDataScopeOption = {
  label: '本辖区监管范畴检测数据（默认）',
  value: 'all'
}

const organizationScopeOptions: BigScreenDataScopeOption[] = [
  { label: '本机构下发采集数据', value: 'issued' },
  { label: '本机构执行任务采集数据', value: 'self' }
]

export const getBigScreenDataScopeOptions = (
  canViewJurisdictionScope: boolean
): BigScreenDataScopeOption[] =>
  canViewJurisdictionScope
    ? [jurisdictionScopeOption, ...organizationScopeOptions]
    : [...organizationScopeOptions]

export const resolveBigScreenDataScope = (
  scope: unknown,
  canViewJurisdictionScope: boolean
): BigScreenDataScope => {
  // 历史缓存中的 jurisdiction 等价于 all；无辖区权限的用户必须降级为本机构下发数据。
  if (scope === 'issued' || scope === 'self') return scope
  if (canViewJurisdictionScope && (scope === 'all' || scope === 'jurisdiction')) return 'all'
  return canViewJurisdictionScope ? 'all' : 'issued'
}

const queryDeptScopeByDataScope: Record<BigScreenDataScope, BigScreenQueryDeptScope> = {
  // 数字值是后端统计接口约定，集中维护可避免各个大屏面板自行硬编码。
  all: 1,
  self: 2,
  issued: 3
}

export const getBigScreenQueryDeptScope = (scope: BigScreenDataScope): BigScreenQueryDeptScope =>
  queryDeptScopeByDataScope[scope]

export const getBigScreenDataScopeLabel = (scope: BigScreenDataScope) =>
  [jurisdictionScopeOption, ...organizationScopeOptions].find((option) => option.value === scope)
    ?.label || organizationScopeOptions[0].label
