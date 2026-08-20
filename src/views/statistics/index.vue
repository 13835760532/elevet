<template>
  <div class="statistics-container">
    <!-- 顶部 Tabs -->
    <div class="stat-tabs-wrapper">
      <div class="stat-tabs">
        <template v-for="tab in tabs" :key="tab.value">
          <el-dropdown
            v-if="tab.dropdownOptions?.length"
            class="tab-dropdown"
            trigger="hover"
            placement="bottom-start"
            @command="(command) => handleDropdownCommand(tab.value, command)"
          >
            <div
              :class="['tab-item', { active: currentTab === tab.value }]"
              @click="handleTabChange(tab.value)"
            >
              <Icon :icon="tab.icon" :size="18" class="tab-icon" />
              <span class="tab-label">
                {{ tab.label }}
                <Icon icon="ep:arrow-down" :size="14" class="tab-arrow" />
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="option in tab.dropdownOptions"
                  :key="option.value"
                  :command="option.value"
                  :class="{ 'is-active-option': dropdownActiveCommands[tab.value] === option.value }"
                >
                  {{ option.label }}
                  <Icon
                    v-if="dropdownActiveCommands[tab.value] === option.value"
                    icon="ep:check"
                    :size="14"
                    style="margin-left: 8px; color: #00b3ed;"
                  />
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div
            v-else
            :class="['tab-item', { active: currentTab === tab.value }]"
            @click="handleTabChange(tab.value)"
          >
            <Icon :icon="tab.icon" :size="18" class="tab-icon" />
            <span>{{ tab.label }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- 动态内容 -->
    <div class="statistics-tab-body">
      <TabAll
        v-if="currentTab === 'all'"
        :query-dept-scope="tabDeptScopes.all"
        :data-scope="tabDataScopes.all"
      />
      <TabTask
        v-else-if="currentTab === 'task'"
        :query-dept-scope="taskDeptScope"
        :data-scope="tabDataScopes.task"
      />
      <TabQuick
        v-else-if="currentTab === 'quick'"
        :query-dept-scope="quickDeptScope"
        :self-detection="quickSelfDetection"
        :data-scope="tabDataScopes.quick"
      />
      <TabIssue
        v-else-if="currentTab === 'issue'"
        :query-dept-scope="tabDeptScopes.issue"
        :data-scope="tabDataScopes.issue"
      />
      <TabVerify
        v-else-if="currentTab === 'verify'"
        :query-dept-scope="tabDeptScopes.verify"
        :data-scope="tabDataScopes.verify"
      />
      <TabFiling
        v-else-if="currentTab === 'filing'"
        :query-dept-scope="tabDeptScopes.filing"
        :data-scope="tabDataScopes.filing"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabAll from './components/TabAll.vue'
import TabTask from './components/TabTask.vue'
import TabQuick from './components/TabQuick.vue'
import TabIssue from './components/TabIssue.vue'
import TabVerify from './components/TabVerify.vue'
import TabFiling from './components/TabFiling.vue'
import {
  isSuperAdmin,
  isCurrentUserRegulatoryDept
} from './components/statisticsData'
import {
  getGeneralQueryDeptScope,
  getTaskQueryDeptScope,
  getStatisticsDataScope,
  resolveStatisticsTab
} from './statisticsTabs'

const route = useRoute()
const router = useRouter()
const currentTab = ref('all')
const scopedTabValues = ['all', 'issue', 'verify', 'filing'] as const
type ScopedTabValue = (typeof scopedTabValues)[number]
type QuickCommand = 'self' | 'task' | 'all' | 'operation'

const tabDeptScopes = ref<Record<ScopedTabValue, number>>({
  all: 1,
  issue: 3,
  verify: 3,
  filing: 3
})
// 本机构统计的统一默认权限口径。监管机构切换到辖区选项时会在对应处理方法中改为 1。
const taskDeptScope = ref(3)
const quickDeptScope = ref<number | undefined>(3)
const quickSelfDetection = ref<boolean | undefined>(undefined)

const dropdownActiveCommands = ref<Record<string, string>>((() => {
  try {
    const saved = localStorage.getItem('statistics_dropdown_commands')
    const commands = saved ? JSON.parse(saved) : {}
    if (isCurrentUserRegulatoryDept()) {
      if (!commands.all) commands.all = 'area'
      if (!commands.task) commands.task = 'all'
      if (!commands.quick) commands.quick = 'all'
      if (!commands.issue) commands.issue = 'area'
      if (!commands.verify) commands.verify = 'area'
      if (!commands.filing) commands.filing = 'area'
    } else {
      if (!commands.all) commands.all = 'own'
      if (!commands.task) commands.task = 'issued'
      if (!commands.quick) commands.quick = 'self'
    }
    return commands
  } catch {
    const commands: Record<string, string> = {}
    if (isCurrentUserRegulatoryDept()) {
      commands.all = 'area'
      commands.task = 'all'
      commands.quick = 'all'
      commands.issue = 'area'
      commands.verify = 'area'
      commands.filing = 'area'
    } else {
      commands.all = 'own'
      commands.task = 'issued'
      commands.quick = 'self'
    }
    return commands
  }
})())

interface TabDropdownOption {
  label: string
  value: string
}

interface StatisticsTab {
  label: string
  value: string
  icon: string
  dropdownOptions?: TabDropdownOption[]
}

const isRegulatoryDept = computed(() => isCurrentUserRegulatoryDept())
const isSuperAdminRole = computed(() => isSuperAdmin())
const hasScopedDropdown = computed(() => isRegulatoryDept.value || isSuperAdminRole.value)

/** 只允许具备对应权限的账号把缓存中的下拉命令转换为扩大后的数据范围。 */
const getAuthorizedDataScope = (command: unknown) => {
  if (command === 'operation' && !isSuperAdminRole.value) {
    return getStatisticsDataScope('own')
  }
  if ((command === 'area' || command === 'all') && !isRegulatoryDept.value) {
    return getStatisticsDataScope('own')
  }
  return getStatisticsDataScope(command)
}

const tabDataScopes = computed(() => ({
  all: getAuthorizedDataScope(dropdownActiveCommands.value.all),
  task: getAuthorizedDataScope(dropdownActiveCommands.value.task),
  quick: getAuthorizedDataScope(dropdownActiveCommands.value.quick),
  issue: getAuthorizedDataScope(dropdownActiveCommands.value.issue),
  verify: getAuthorizedDataScope(dropdownActiveCommands.value.verify),
  filing: getAuthorizedDataScope(dropdownActiveCommands.value.filing)
}))

/** 仅 super_admin 角色的统计下拉追加运营管理统计口径。 */
const appendOperationOption = (options: TabDropdownOption[]) => {
  if (isSuperAdminRole.value) {
    options.push({ label: '运营管理统计', value: 'operation' })
  }
  return options
}

const allDropdownOptions = computed<TabDropdownOption[]>(() => {
  const options = [{ label: '本机构', value: 'own' }]
  if (isRegulatoryDept.value) {
    options.push({ label: '辖区内', value: 'area' })
  }
  return appendOperationOption(options)
})

const quickDropdownOptions = computed<TabDropdownOption[]>(() => {
  const options = [
    { label: '本机构自主检测', value: 'self' },
    { label: '本机构任务检测', value: 'task' }
  ]
  if (isRegulatoryDept.value) {
    options.push({ label: '辖区内快速检测', value: 'all' })
  }
  return appendOperationOption(options)
})

const taskDropdownOptions = computed<TabDropdownOption[]>(() => {
  const options = [
    { label: '本机构下发任务', value: 'issued' },
    { label: '本机构执行任务', value: 'executed' }
  ]
  if (isRegulatoryDept.value) {
    options.push({ label: '辖区内全部任务', value: 'all' })
  }
  return appendOperationOption(options)
})

const buildScopedDropdownOptions = (ownLabel: string, areaLabel: string) => {
  const options = [{ label: ownLabel, value: 'own' }]
  if (isRegulatoryDept.value) {
    options.push({ label: areaLabel, value: 'area' })
  }
  return appendOperationOption(options)
}

const issueDropdownOptions = computed(() =>
  buildScopedDropdownOptions('本机构合格证开具', '辖区内合格证开具')
)
const verifyDropdownOptions = computed(() =>
  buildScopedDropdownOptions('本机构合格证收取', '辖区内合格证收取')
)
const filingDropdownOptions = computed(() =>
  buildScopedDropdownOptions('本机构建档备案', '辖区内建档备案')
)

const tabs = computed<StatisticsTab[]>(() => [
  {
    label: '全部',
    value: 'all',
    icon: 'ep:user',
    dropdownOptions: hasScopedDropdown.value ? allDropdownOptions.value : undefined
  },
  {
    label: '检测任务',
    value: 'task',
    icon: 'ep:message',
    dropdownOptions: taskDropdownOptions.value
  },
  {
    label: '快速检测',
    value: 'quick',
    icon: 'ep:home-filled',
    dropdownOptions: quickDropdownOptions.value
  },
  {
    label: '合格证开具',
    value: 'issue',
    icon: 'ep:document',
    dropdownOptions: hasScopedDropdown.value ? issueDropdownOptions.value : undefined
  },
  {
    label: '合格证收证',
    value: 'verify',
    icon: 'ep:document-checked',
    dropdownOptions: hasScopedDropdown.value ? verifyDropdownOptions.value : undefined
  },
  {
    label: '建档备案',
    value: 'filing',
    icon: 'ep:folder',
    dropdownOptions: hasScopedDropdown.value ? filingDropdownOptions.value : undefined
  }
])


/**\n * handleTabChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleTabChange = (tabValue: string) => {
  currentTab.value = tabValue
  localStorage.setItem('statistics_current_tab', tabValue)
  if (route.query.tab !== tabValue) {
    router.replace({
      query: {
        ...route.query,
        tab: tabValue
      }
    })
  }
  if (tabValue === 'task') {
    const cmd = dropdownActiveCommands.value.task
    if (cmd) {
      setTaskScopeByCommand(cmd)
    } else {
      taskDeptScope.value = 3
    }
  }
  if (tabValue === 'quick') {
    const cmd = dropdownActiveCommands.value.quick
    if (cmd) {
      setQuickScopeByCommand(cmd)
    } else {
      quickDeptScope.value = 3
      quickSelfDetection.value = undefined
    }
  }
  if (scopedTabValues.includes(tabValue as ScopedTabValue)) {
    const cmd = dropdownActiveCommands.value[tabValue]
    if (cmd) {
      tabDeptScopes.value[tabValue as ScopedTabValue] = getQueryDeptScopeByCommand(cmd)
    } else {
      tabDeptScopes.value[tabValue as ScopedTabValue] = 3
    }
  }
}

/**\n * getQueryDeptScopeByCommand：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getQueryDeptScopeByCommand = (command: unknown) => {
  if (command === 'operation') {
    return isSuperAdminRole.value ? getGeneralQueryDeptScope(command) : 3
  }
  if (command === 'area') {
    return isRegulatoryDept.value ? getGeneralQueryDeptScope(command) : 3
  }
  return getGeneralQueryDeptScope('own')
}

/**\n * setQuickScopeByCommand：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const setQuickScopeByCommand = (command: unknown) => {
  const quickCommand = command as QuickCommand
  if (quickCommand === 'self') {
    quickDeptScope.value = undefined
    quickSelfDetection.value = true
    return
  }
  if (quickCommand === 'task') {
    quickDeptScope.value = 3
    quickSelfDetection.value = false
    return
  }
  if (quickCommand === 'all') {
    quickDeptScope.value = isRegulatoryDept.value ? 1 : 3
    quickSelfDetection.value = undefined
    return
  }
  if (quickCommand === 'operation') {
    quickDeptScope.value = isSuperAdminRole.value ? 2 : 3
    quickSelfDetection.value = undefined
    return
  }
  quickDeptScope.value = 3
  quickSelfDetection.value = undefined
}

/**\n * setTaskScopeByCommand：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const setTaskScopeByCommand = (command: unknown) => {
  if (command === 'operation') {
    taskDeptScope.value = isSuperAdminRole.value ? 2 : 3
    return
  }
  if (command === 'executed') {
    taskDeptScope.value = 2
    return
  }
  if (command === 'issued') {
    taskDeptScope.value = 3
    return
  }
  if (command === 'all') {
    taskDeptScope.value = isRegulatoryDept.value ? 1 : 3
    return
  }
  taskDeptScope.value = getTaskQueryDeptScope(command) || 3
}

/**\n * handleDropdownCommand：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDropdownCommand = (tabValue: string, command: unknown) => {
  currentTab.value = tabValue
  localStorage.setItem('statistics_current_tab', tabValue)
  dropdownActiveCommands.value[tabValue] = String(command)
  if (route.query.tab !== tabValue) {
    router.replace({
      query: {
        ...route.query,
        tab: tabValue
      }
    })
  }
  if (tabValue === 'task') {
    setTaskScopeByCommand(command)
  }
  if (tabValue === 'quick') {
    setQuickScopeByCommand(command)
  }
  if (scopedTabValues.includes(tabValue as ScopedTabValue)) {
    tabDeptScopes.value[tabValue as ScopedTabValue] = getQueryDeptScopeByCommand(command)
  }
}

/**\n * initTab：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。\n */
const initTab = () => {
  const queryTab = route.query.tab
  const savedTab = localStorage.getItem('statistics_current_tab')
  const targetTab = resolveStatisticsTab(queryTab || savedTab)
  handleTabChange(targetTab)
}

onMounted(() => {
  initTab()
})

watch(
  () => [route.path, route.query.tab],
  () => {
    initTab()
  }
)

watch(
  dropdownActiveCommands,
  (newVal) => {
    localStorage.setItem('statistics_dropdown_commands', JSON.stringify(newVal))
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.statistics-container {
  min-height: calc(100vh - 100px);
  background-color: #f5f8fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  color: #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.statistics-tab-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部 Tabs */
.stat-tabs-wrapper {
  background-color: #fff;
  padding: 0 28px;
  border-bottom: 1px solid #f0f2f5;
  position: sticky;
  top: 0;
  z-index: 10;
}

.stat-tabs {
  display: flex;
  align-items: center;
  gap: 36px;
}

.tab-dropdown {
  display: inline-flex;
}

.tab-dropdown :deep(.el-tooltip__trigger) {
  outline: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 0;
  cursor: pointer;
  font-size: 15px;
  color: #8c8c8c;
  position: relative;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  font-weight: 500;

  .tab-icon {
    transition: transform 0.3s;
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .tab-arrow {
    color: currentColor;
    opacity: 0.72;
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &:hover {
    color: #00b3ed;

    .tab-icon {
      transform: translateY(-2px);
    }

    .tab-arrow {
      opacity: 1;
      transform: translateY(1px);
    }
  }

  &.active {
    color: #00b3ed;
    font-weight: 600;

    .tab-arrow {
      opacity: 1;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #00b3ed 0%, #00f2fe 100%);
      border-radius: 4px 4px 0 0;
      box-shadow: 0 -2px 8px rgba(0, 179, 237, 0.2);
    }
  }
}

.statistics-tab-body :deep(.stat-content) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #f5f8fb;
  flex: 1;
}

.statistics-tab-body :deep(.statistics-range-filter) {
  margin-bottom: 0;
}

.statistics-tab-body :deep(.card-section) {
  padding: 20px;
  margin-bottom: 0;
  background: #fff;
  border: 1px solid #e7eef5;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(25 61 95 / 4%);
}

.statistics-tab-body :deep(.section-title) {
  display: flex;
  align-items: center;
  min-height: 24px;
  margin-bottom: 14px;
  line-height: 24px;
}

.statistics-tab-body :deep(.section-title::before) {
  width: 4px;
  height: 16px;
  margin-right: 10px;
  background: #00b3ed;
  border-radius: 4px;
}

.statistics-tab-body :deep(.overview-cards) {
  gap: 14px;
}

.statistics-tab-body :deep(.stat-card) {
  min-height: 96px;
  border-radius: 10px;
}

.statistics-tab-body :deep(.coverage-group) {
  padding: 20px;
  border-radius: 10px;
}

.statistics-tab-body :deep(.result-filters) {
  gap: 12px;
  padding: 14px;
  margin-bottom: 16px;
  background: #f8fbfd;
  border: 1px solid #edf3f8;
  border-radius: 10px;
}

.statistics-tab-body :deep(.filter-row-top),
.statistics-tab-body :deep(.filter-row-bottom) {
  gap: 12px;
}

.statistics-tab-body :deep(.chart-area-wrapper),
.statistics-tab-body :deep(.chart-container) {
  padding: 14px;
  margin-bottom: 16px;
  background: #fbfdff;
  border: 1px solid #edf3f8;
  border-radius: 10px;
}

.statistics-tab-body :deep(.chart-header) {
  margin-bottom: 14px;
}

.statistics-tab-body :deep(.charts-container) {
  gap: 14px !important;
  margin-bottom: 16px !important;
}

.statistics-tab-body :deep(.table-section) {
  min-height: 0;
}

.statistics-tab-body :deep(.table-header) {
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid #edf3f8;
}

.statistics-tab-body :deep(.table-container) {
  margin-top: 0;
}

.statistics-tab-body :deep(.pagination-container) {
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid #edf3f8;
}

.statistics-tab-body :deep(.risk-section-container) {
  margin-top: 0;
}

.statistics-tab-body :deep(.risk-grid),
.statistics-tab-body :deep(.bottom-grid) {
  gap: 14px;
  margin-bottom: 16px;
}

.statistics-tab-body :deep(.risk-card) {
  padding: 18px;
  border-color: #e7eef5;
  border-radius: 12px;
}

@media (width <=1360px) {
  .statistics-tab-body :deep(.stat-content) {
    padding: 16px 24px 24px;
  }
}

:deep(.el-dropdown-menu__item.is-active-option) {
  color: #00b3ed !important;
  font-weight: 600 !important;
  background-color: #f0f9ff !important;
}
</style>
