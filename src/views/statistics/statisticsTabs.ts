export type StatisticsTabValue = 'all' | 'task' | 'quick' | 'issue' | 'verify' | 'filing'
export type TaskCommand = 'issued' | 'executed' | 'all' | 'operation'
export type GeneralScopeCommand = 'area' | 'operation' | 'own'
export type StatisticsDataScope = 'SELF_ORG' | 'AREA_REGULATE' | 'ALL'

const statisticsTabValues: StatisticsTabValue[] = [
  'all',
  'task',
  'quick',
  'issue',
  'verify',
  'filing'
]

const taskQueryDeptScopes: Record<TaskCommand, 1 | 2 | 3> = {
  issued: 3,
  executed: 2,
  all: 1,
  operation: 2
}

const generalQueryDeptScopes: Record<GeneralScopeCommand, 1 | 2 | 3> = {
  area: 1,
  operation: 2,
  own: 3
}

export const resolveStatisticsTab = (tab: unknown): StatisticsTabValue => {
  if (typeof tab !== 'string') return 'all'
  return statisticsTabValues.includes(tab as StatisticsTabValue)
    ? (tab as StatisticsTabValue)
    : 'all'
}

export const getTaskQueryDeptScope = (command: unknown): 0 | 1 | 2 | 3 => {
  if (typeof command !== 'string' || !(command in taskQueryDeptScopes)) return 0
  return taskQueryDeptScopes[command as TaskCommand]
}

/** 将通用下拉命令转换为后端数据范围：辖区=1、运营管理=2、本机构=3。 */
export const getGeneralQueryDeptScope = (command: unknown): 0 | 1 | 2 | 3 => {
  if (typeof command !== 'string' || !(command in generalQueryDeptScopes)) return 0
  return generalQueryDeptScopes[command as GeneralScopeCommand]
}

/** 将统计下拉命令转换为后端统一的数据范围标识。 */
export const getStatisticsDataScope = (command: unknown): StatisticsDataScope => {
  if (command === 'operation') return 'ALL'
  if (command === 'area' || command === 'all') return 'AREA_REGULATE'
  return 'SELF_ORG'
}
