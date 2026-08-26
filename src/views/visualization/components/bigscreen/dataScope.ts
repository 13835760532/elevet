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

/**
 * 返回当前账号可选择的数据范围。
 *
 * 监管机构和超级管理员可查看辖区数据；普通机构只允许选择本机构下发或执行的数据。
 */
export const getBigScreenDataScopeOptions = (
  canViewJurisdictionScope: boolean
): BigScreenDataScopeOption[] =>
  canViewJurisdictionScope
    ? [jurisdictionScopeOption, ...organizationScopeOptions]
    : [...organizationScopeOptions]

/**
 * 校验并归一化数据范围。
 *
 * 兼容旧缓存值 `jurisdiction`。当账号不再具有辖区权限时，强制降级为本机构下发
 * 数据，防止账号切换后沿用前一账号的越权配置。
 */
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

/** 将前端语义化数据范围转换为后端约定的机构查询枚举。 */
export const getBigScreenQueryDeptScope = (scope: BigScreenDataScope): BigScreenQueryDeptScope =>
  queryDeptScopeByDataScope[scope]

/** 将前端语义化数据范围转换为后端接口约定的 dataScope 参数（辖区数据对应 AREA_REGULATE）。 */
export const getBigScreenApiDataScope = (scope?: BigScreenDataScope): string | undefined => {
  if (!scope) return undefined
  if (scope === 'all') return 'AREA_REGULATE'
  return scope
}

/** 根据数据范围返回配置面板和摘要中使用的中文名称。 */
export const getBigScreenDataScopeLabel = (scope: BigScreenDataScope) =>
  [jurisdictionScopeOption, ...organizationScopeOptions].find((option) => option.value === scope)
    ?.label || organizationScopeOptions[0].label
