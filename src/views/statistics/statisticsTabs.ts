export type StatisticsTabValue = 'all' | 'task' | 'quick' | 'issue' | 'verify' | 'filing'
export type TaskCommand = 'issued' | 'executed' | 'all'

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
  all: 1
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
