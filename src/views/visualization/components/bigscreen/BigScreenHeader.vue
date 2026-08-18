<template>
  <header class="screen-header">
    <button class="back-btn" type="button" aria-label="返回" @click="handleBack">
      <el-icon class="back-icon">
        <Back />
      </el-icon>
    </button>
    <div class="header-side left">
      <!-- 数据配置 -->
      <div v-if="showDataConfig" class="data-config-btn" @click="toggleConfig">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          class="computer-icon" style="filter: drop-shadow(0 0 5px rgba(0, 218, 255, 0.85));">
          <!-- 电脑屏幕外框 -->
          <rect x="2" y="3" width="20" height="13" rx="1.5" fill="rgba(0, 218, 255, 0.1)" stroke="#00daff"
            stroke-width="1.5" />
          <!-- 电脑底座支架 -->
          <path d="M12,16 L10,21 L14,21 Z" fill="rgba(0, 218, 255, 0.25)" stroke="#00daff" stroke-width="1.2"
            stroke-linejoin="round" />
          <!-- 屏幕内发光指示点 -->
          <circle cx="12" cy="9.5" r="1.5" fill="#00daff" style="filter: drop-shadow(0 0 3px #00daff);" />
        </svg>
        <span class="btn-label">数据配置</span>
        <div class="caret-icon"></div>
      </div>

      <template v-for="item in leftMenus" :key="item.key">
        <div v-if="item.key === 'task'" class="task-nav-wrapper">
          <div class="nav-btn task-nav-btn" :class="{ active: isMenuActive(item.key) }"
            :style="{ backgroundImage: `url(${isMenuActive(item.key) ? item.activeBg : item.bg})` }" role="button"
            @click="selectTaskEntry('issue')">
            <span class="btn-label"></span>
          </div>
          <transition name="task-subnav">
            <div v-if="isMenuActive(item.key)" class="task-subnav" role="tablist">
              <button v-for="option in taskEntryOptions" :key="option.key" class="task-subnav-option"
                :class="{ active: activeTaskEntry === option.key }" type="button" role="tab"
                :aria-selected="activeTaskEntry === option.key" @click="selectTaskEntry(option.key)">
                {{ option.label }}
              </button>
            </div>
          </transition>
        </div>
        <div v-else class="nav-btn" :class="{ active: isMenuActive(item.key) }"
          :style="{ backgroundImage: `url(${isMenuActive(item.key) ? item.activeBg : item.bg})` }"
          @click="handleMenuClick(item.key)">
          <span class="btn-label"></span>
        </div>
      </template>
      <!-- 数据配置弹窗 -->
      <div v-if="showConfig" class="data-config-panel">
        <div class="panel-header">
          <div class="header-icon-double">
            <span></span>
            <span></span>
          </div>
          <span class="header-title">数据配置</span>
        </div>

        <div class="panel-body">
          <div class="form-item">
            <div class="item-label">数据时间范围</div>
            <div class="field-shell">
              <el-date-picker v-model="configForm.timeRange" type="daterange" value-format="YYYY-MM-DD"
                range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="large" :teleported="false"
                class="custom-date-picker" popper-class="big-screen-date-popper" />
            </div>
          </div>

          <div class="form-item">
            <div class="item-label">默认显示范围</div>
            <div class="field-shell">
              <!-- 允许清空地区选择 -->
              <el-cascader v-model="configForm.regionPath" :options="areaOptions" :props="areaCascaderProps"
                :show-all-levels="true" :teleported="false" separator="" filterable clearable size="large"
                class="custom-cascader" popper-class="big-screen-area-popper">
                <template #default="{ data }">
                  <span>{{ data.name || data.originalName }}</span>
                </template>
              </el-cascader>
            </div>
          </div>

          <div class="form-item">
            <div class="item-label">统计数据范围</div>
            <div class="field-shell">
              <el-select v-model="configForm.dataScope" size="large" :teleported="false" class="custom-select"
                popper-class="big-screen-select-popper">
                <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
          </div>

          <div class="form-item">
            <div class="item-label">数据更新频次</div>
            <div class="frequency-input">
              <span>每</span>
              <el-input-number v-model="configForm.frequency" :min="1" :controls="false" size="small"
                class="custom-number-input" />
              <span>分钟更新一次</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <el-button class="save-btn" @click="saveConfig">保存配置</el-button>
          <el-button class="cancel-btn" @click="showConfig = false">取消</el-button>
        </div>
      </div>
    </div>
    <div class="header-center">
      <div class="title" @click="handleGoHome">
        <!-- 食检数智服务平台标题图片 -->
        <img :src="titleImg" alt="食检数智服务平台" />
      </div>
    </div>
    <div class="header-side right">
      <div class="nav-btn" v-for="item in rightMenus" :key="item.key" :class="{ active: activeMenu === item.key }"
        :style="{ backgroundImage: `url(${activeMenu === item.key ? item.activeBg : item.bg})` }"
        @click="handleMenuClick(item.key)">
        <span class="btn-label"></span>
      </div>
      <div class="assistant-badge">
        <div class="assistant-text">
          <strong>我是小壹</strong>
          <span>有任何问题都可以找我哦~</span>
        </div>
        <img :src="botImg" alt="assistant" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { List, Aim, Checked, Bell, Back } from '@element-plus/icons-vue'
import { getAreaTree } from '@/api/system/area'
import botImg from '@/assets/imgs/echarts/bot.png'
import titleImg from '@/assets/imgs/食检数智服务平台.svg'
import taskBg from '@/assets/imgs/echarts/首页/jcrw_nor.png'
import taskBgActive from '@/assets/imgs/echarts/首页/jcrw_pr.png'
import inspectBg from '@/assets/imgs/echarts/首页/jiance_nor.png'
import inspectBgActive from '@/assets/imgs/echarts/首页/jiance_pr.jpg'
import certBg from '@/assets/imgs/echarts/首页/hegezheng_nor.png'
import certBgActive from '@/assets/imgs/echarts/首页/hgz_pr.png'
import warnBg from '@/assets/imgs/echarts/首页/xyyj_nor.png'
import warnBgActive from '@/assets/imgs/echarts/首页/xyyj_pr.png'
import {
  canViewBigScreenJurisdictionScope,
  dispatchBigScreenRefresh,
  getBigScreenConfig,
  getBigScreenUserDeptAreaParams,
  getDefaultBigScreenConfig,
  formatBigScreenRegionLabel,
  isBigScreenSuperAdmin,
  saveBigScreenConfig,
  type BigScreenDataConfig
} from './config'
import { getBigScreenDataScopeOptions, resolveBigScreenDataScope } from './dataScope'

const props = withDefaults(
  defineProps<{
    showDataConfig?: boolean
    activeMenu?: '' | 'task' | 'inspect' | 'cert' | 'warn'
  }>(),
  {
    showDataConfig: true,
    activeMenu: ''
  }
)
const { showDataConfig, activeMenu } = toRefs(props)
const emit = defineEmits(['update:activeMenu', 'toggleConfig'])
const router = useRouter()
const route = useRoute()

interface AreaNodeRespVO {
  id: number
  name: string
  originalName?: string
  children?: AreaNodeRespVO[]
}

const showConfig = ref(false)
const areaOptions = ref<AreaNodeRespVO[]>([])
const originalAreaOptions = ref<AreaNodeRespVO[]>([])
const areaOptionsLoaded = ref(false)
const areaOptionsLoading = ref(false)
let refreshTimer: number | null = null
const configForm = reactive({
  timeRange: getDefaultBigScreenConfig().timeRange as [string, string],
  dataScope: getDefaultBigScreenConfig().dataScope,
  regionPath: [] as number[],
  frequency: 5
})

const canViewJurisdictionScope = computed(() => canViewBigScreenJurisdictionScope())
const dataScopeOptions = computed(() =>
  getBigScreenDataScopeOptions(canViewJurisdictionScope.value)
)

const areaCascaderProps = {
  value: 'id',
  label: 'name',
  children: 'children',
  checkStrictly: true,
  emitPath: true,
  expandTrigger: 'hover'
}

const userDeptAreaCode = computed(() => getBigScreenUserDeptAreaParams().areaCode)

/**
 * 格式化级联选择器地区树。
 *
 * 直辖市数据中父子节点可能同名；此处保留原始名称用于回显，同时将重复子节点的
 * 展示名置空，避免界面出现“北京市北京市”一类重复文本。
 */
const formatCascaderAreaTree = (tree: AreaNodeRespVO[] = [], parentName = ''): AreaNodeRespVO[] =>
  tree.map((item) => {
    const node = { ...item }
    const isDuplicate = parentName && node.name === parentName
    const nodeName = node.name
    if (isDuplicate) {
      node.originalName = node.name
      node.name = ''
    }
    if (node.children?.length) {
      node.children = formatCascaderAreaTree(node.children, nodeName)
    }
    return node
  })

/**
 * 按需加载行政区划树，并将可选范围限制在当前账号所属机构地区内。
 *
 * 同一组件生命周期只请求一次；账号不是超级管理员且历史配置越界时，自动回填
 * 当前机构地区。加载失败时保留空选项并记录错误，不影响大屏其他数据展示。
 */
const ensureAreaOptionsLoaded = async () => {
  if (areaOptionsLoaded.value || areaOptionsLoading.value) return
  areaOptionsLoading.value = true
  try {
    const data = await getAreaTree()
    originalAreaOptions.value = formatAreaTree((data || []) as AreaNodeRespVO[])
    const limitedTree = limitTreeByRootArea(originalAreaOptions.value, userDeptAreaCode.value)
    areaOptions.value = formatCascaderAreaTree(limitedTree)
    const cachedConfig = getBigScreenConfig()
    if (
      !isBigScreenSuperAdmin() &&
      (!cachedConfig.regionPath.length ||
        !isPathInRootArea(cachedConfig.regionPath, userDeptAreaCode.value))
    ) {
      configForm.regionPath = userDeptAreaCode.value
        ? resolvePathByAreaCode(userDeptAreaCode.value)
        : []
    } else if (cachedConfig.regionPath.length) {
      configForm.regionPath = [...cachedConfig.regionPath]
    }
    areaOptionsLoaded.value = true
  } catch (error) {
    console.error('加载地区树失败', error)
    areaOptions.value = []
  } finally {
    areaOptionsLoading.value = false
  }
}

/** 打开或关闭配置面板；首次打开时异步加载地区树。 */
const toggleConfig = () => {
  showConfig.value = !showConfig.value
  if (showConfig.value) {
    void ensureAreaOptionsLoaded()
  }
}

/** 将已生效的大屏配置复制到表单，避免直接修改缓存对象。 */
const syncConfigForm = (config: BigScreenDataConfig) => {
  configForm.timeRange = [...config.timeRange] as [string, string]
  configForm.dataScope = config.dataScope || getDefaultBigScreenConfig().dataScope
  configForm.regionPath = [...config.regionPath]
  configForm.frequency = config.frequency
}

/** 递归复制地区树，并删除叶子节点的空 `children` 字段以兼容级联组件。 */
const formatAreaTree = (tree: AreaNodeRespVO[] = []): AreaNodeRespVO[] =>
  tree.map((item) => {
    const node = { ...item }
    if (node.children?.length) {
      node.children = formatAreaTree(node.children)
    } else {
      delete node.children
    }
    return node
  })

/** 在地区树中递归查找指定行政区编码对应的节点。 */
const findNodeById = (id: number | string, tree: AreaNodeRespVO[]): AreaNodeRespVO | undefined => {
  if (!id) return undefined
  for (const node of tree) {
    if (String(node.id) === String(id)) return node
    if (node.children?.length) {
      const found = findNodeById(id, node.children)
      if (found) return found
    }
  }
  return undefined
}

/**
 * 查找从根节点到指定行政区编码的完整路径。
 *
 * @returns 级联组件使用的编码数组；未找到时返回空数组。
 */
const findPathById = (id: number | string, tree: AreaNodeRespVO[]): number[] => {
  if (!id) return []
  for (const node of tree) {
    if (String(node.id) === String(id)) return [node.id]
    if (node.children?.length) {
      const childPath = findPathById(id, node.children)
      if (childPath.length) return [node.id, ...childPath]
    }
  }
  return []
}

/** 将完整地区树裁剪为当前机构所属地区及其下级节点。 */
const limitTreeByRootArea = (tree: AreaNodeRespVO[], rootAreaCode?: string) => {
  if (!rootAreaCode) return tree
  const rootNode = findNodeById(rootAreaCode, tree)
  return rootNode ? [rootNode] : tree
}

/** 根据行政区编码生成级联选择器路径。 */
const resolvePathByAreaCode = (areaCode: number | string) =>
  findPathById(areaCode, originalAreaOptions.value)

/** 判断已保存的地区路径是否仍属于当前账号管辖根节点。 */
const isPathInRootArea = (path: number[], rootAreaCode?: string) => {
  if (!rootAreaCode) return true
  return Array.isArray(path) && path.some((id) => String(id) === String(rootAreaCode))
}

/**
 * 将级联路径解析为接口和界面共同使用的地区元数据。
 *
 * 返回完整路径、展示名称、省市县名称、末级行政区编码及层级。路径来自旧缓存时会
 * 先按末级编码重新解析，修复地区树结构升级造成的路径缺失。
 */
const resolveRegionMetaByPath = (path?: number[] | null) => {
  const labels: string[] = []
  const safePath = path || []
  const fullPath = safePath.length ? resolvePathByAreaCode(safePath[safePath.length - 1]) || safePath : []
  let currentTree = originalAreaOptions.value
  for (const id of fullPath) {
    const current = currentTree.find((item) => item.id === id)
    if (!current) break
    labels.push(current.name)
    currentTree = current.children || []
  }
  const selectedCode = fullPath[fullPath.length - 1]
  return {
    regionPath: fullPath,
    regionLabel: formatBigScreenRegionLabel(labels.join('-')),
    provinceName: labels[0] || '',
    cityName: labels[1] || '',
    districtName: labels[2] || '',
    areaCode: selectedCode ? String(selectedCode) : '',
    areaType: fullPath.length ? String(fullPath.length) : ''
  }
}

/** 清理当前数据自动刷新定时器。 */
const clearRefreshTimer = () => {
  if (refreshTimer !== null) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
}

/**
 * 按分钟启动大屏自动刷新。
 *
 * 频率最小为 1 分钟；每次重建定时器前先清理旧实例，防止重复刷新。
 */
const startRefreshTimer = (frequency: number) => {
  clearRefreshTimer()
  const intervalMinutes = Math.max(1, Number(frequency || 5))
  refreshTimer = window.setInterval(
    () => {
      dispatchBigScreenRefresh('timer')
    },
    intervalMinutes * 60 * 1000
  )
}

/**
 * 校验并保存配置表单。
 *
 * 保存后会同步持久化、重建刷新定时器并广播刷新事件，使所有独立面板在同一轮更新
 * 中读取一致的时间、地区和数据范围。
 */
const saveConfig = () => {
  const timeRange = configForm.timeRange && configForm.timeRange.length === 2
    ? configForm.timeRange
    : getDefaultBigScreenConfig().timeRange

  const regionMeta = resolveRegionMetaByPath(configForm.regionPath)
  const nextConfig: BigScreenDataConfig = {
    timeRange: [...timeRange] as [string, string],
    dataScope: resolveBigScreenDataScope(configForm.dataScope, canViewJurisdictionScope.value),
    regionPath: [...regionMeta.regionPath],
    regionLabel: regionMeta.regionLabel,
    provinceName: regionMeta.provinceName,
    cityName: regionMeta.cityName,
    districtName: regionMeta.districtName,
    areaType: regionMeta.areaType,
    areaCode: regionMeta.areaCode,
    frequency: Math.max(1, Number(configForm.frequency || 5))
  }
  saveBigScreenConfig(nextConfig)
  startRefreshTimer(nextConfig.frequency)
  console.log('保存配置:', nextConfig)
  ElMessage.success('数据配置已更新')
  showConfig.value = false
  dispatchBigScreenRefresh('save')
}

const leftMenus = [
  { key: 'task', label: '检测任务', bg: taskBg, activeBg: taskBgActive, icon: List },
  { key: 'inspect', label: '快速检测', bg: inspectBg, activeBg: inspectBgActive, icon: Aim }
]

const rightMenus = [
  { key: 'cert', label: '合格证', bg: certBg, activeBg: certBgActive, icon: Checked },
  { key: 'warn', label: '小壹预警', bg: warnBg, activeBg: warnBgActive, icon: Bell }
]

const taskEntryOptions = [
  { key: 'issue', label: '任务下发' },
  { key: 'receive', label: '任务接收' }
] as const

type TaskEntryKey = (typeof taskEntryOptions)[number]['key']

const activeTaskEntry = computed<TaskEntryKey>(() =>
  route.path === '/big-screen-task-receive' ? 'receive' : 'issue'
)

/**\n * isMenuActive：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const isMenuActive = (key: '' | 'task' | 'inspect' | 'cert' | 'warn') => activeMenu.value === key

/**
 * 处理“任务下发/任务接收”二级入口。
 *
 * 当前已经位于大屏主页时仅更新菜单状态；跨页面时通过路由跳转，避免产生重复导航。
 */
const selectTaskEntry = (key: TaskEntryKey) => {
  if (key === 'receive') {
    if (route.path !== '/big-screen-task-receive') {
      router.push('/big-screen-task-receive')
    }
    return
  }

  if (route.path === '/big-screen') {
    emit('update:activeMenu', 'task')
    return
  }

  router.push({
    path: '/big-screen',
    query: { key: 'task' }
  })
}

/**
 * 处理大屏一级菜单点击。
 *
 * 任务菜单交由二级入口处理，预警菜单进入 AI 助手，其余菜单在大屏主页内切换或
 * 从其他页面导航回大屏并带上对应查询参数。
 */
const handleMenuClick = (key: '' | 'task' | 'inspect' | 'cert' | 'warn') => {
  if (key === 'task') {
    selectTaskEntry('issue')
    return
  }
  if (key === 'warn') {
    router.push('/ai-assistant')
    return
  }

  const keyMap: Record<string, string | undefined> = {
    task: 'task',
    inspect: 'quick',
    cert: 'cert',
    '': undefined
  }
  if (route.path === '/big-screen') {
    emit('update:activeMenu', key)
    return
  }

  router.push({
    path: '/big-screen',
    query: keyMap[key] ? { key: keyMap[key] } : undefined
  })
}

/** 返回大屏总览；在当前页面时只清空菜单状态。 */
const handleGoHome = () => {
  if (route.path === '/big-screen') {
    emit('update:activeMenu', '')
    return
  }
  router.push('/big-screen')
}

/** 优先返回浏览历史；没有可返回页面时跳转系统首页。 */
const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/index')
}

onMounted(async () => {
  const cachedConfig = getBigScreenConfig()
  syncConfigForm(cachedConfig)
  startRefreshTimer(cachedConfig.frequency)

  // 切换账号或老账号缓存的地区不在当前账号的管辖范围内时，自动同步保存并应用当前账号的默认管理地区
  const needAutoReset =
    !isBigScreenSuperAdmin() &&
    (!cachedConfig.regionPath.length ||
      !isPathInRootArea(cachedConfig.regionPath, userDeptAreaCode.value))

  if (needAutoReset) {
    try {
      await ensureAreaOptionsLoaded()
      if (configForm.regionPath.length > 0) {
        const regionMeta = resolveRegionMetaByPath(configForm.regionPath)
        const nextConfig: BigScreenDataConfig = {
          timeRange: [...configForm.timeRange] as [string, string],
          dataScope: resolveBigScreenDataScope(configForm.dataScope, canViewJurisdictionScope.value),
          regionPath: [...regionMeta.regionPath],
          regionLabel: regionMeta.regionLabel,
          provinceName: regionMeta.provinceName,
          cityName: regionMeta.cityName,
          districtName: regionMeta.districtName,
          areaType: regionMeta.areaType,
          areaCode: regionMeta.areaCode,
          frequency: Math.max(1, Number(configForm.frequency || 5))
        }
        saveBigScreenConfig(nextConfig)
        syncConfigForm(nextConfig)
        dispatchBigScreenRefresh('save')
      }
    } catch (e) {
      console.error('自动初始化并应用默认行政区划失败', e)
    }
  }
})

onUnmounted(() => {
  clearRefreshTimer()
})
</script>

<style scoped lang="scss">
.screen-header {
  flex: 0 0 98px;
  height: 98px;
  min-height: 98px;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(560px, 680px) minmax(0, 1fr);
  align-items: center;
  background: url('@/assets/imgs/echarts/首页/tiile_bg.png') no-repeat center center;
  background-size: cover;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 38px;
  top: 9px;
  z-index: 2;
  width: 76px;
  height: 56px;
  border: 0;
  padding: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    .back-icon {
      filter: drop-shadow(0 0 12px rgba(74, 238, 241, 0.75));
      transform: translateX(-2px);
    }
  }
}

.back-icon {
  color: #4aeef1;
  font-size: 40px;
  filter: drop-shadow(0 0 8px rgba(31, 234, 241, 0.24));
  transition:
    filter 0.18s ease,
    transform 0.18s ease;
}

.header-side {
  min-width: 0;
  display: flex;
  justify-content: flex-end;
  column-gap: 2px;
  padding: 12px 20px 0;
  align-self: start;
  position: relative;

  &.right {
    justify-content: flex-start;
  }
}

.data-config-btn {
  height: 46px;
  min-width: 160px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
  cursor: pointer;
  gap: 10px;

  .caret-icon {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #00daff;
    margin-left: 4px;
  }
}

.nav-btn {
  height: 46px;
  width: 178px;
  min-width: 150px;
  flex: 0 1 178px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
  cursor: pointer;
  gap: 22px;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.2);
    text-shadow: 0 0 10px rgba(0, 218, 255, 0.8);
  }
}

.task-nav-wrapper {
  position: relative;
  min-width: 150px;
  flex: 0 1 178px;
  height: 46px;
}

.task-nav-btn {
  position: relative;
  width: 100%;
  height: 100%;
}

.task-subnav {
  position: absolute;
  top: 52px;
  left: 4px;
  z-index: 1100;
  width: calc(100% - 8px);
  height: 30px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px;
  padding: 2px;
  border-top: 1px solid rgba(82, 229, 255, 0.78);
  background:
    linear-gradient(180deg, rgba(11, 50, 88, 0.82), rgba(4, 18, 44, 0.9)),
    rgba(3, 14, 35, 0.88);
  box-shadow:
    inset 0 1px 0 rgba(177, 249, 255, 0.12),
    0 0 16px rgba(34, 217, 255, 0.2);

  &::before {
    position: absolute;
    top: -9px;
    left: 18px;
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 8px solid #20e4ff;
    filter: drop-shadow(0 0 8px rgba(32, 228, 255, 0.82));
    content: '';
  }
}

.task-subnav-option {
  width: 100%;
  height: 26px;
  border: 0;
  background: transparent;
  color: rgba(193, 224, 245, 0.84);
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0;
  text-align: center;
  text-shadow: 0 0 8px rgba(72, 205, 255, 0.22);
  transition:
    background 0.16s ease,
    color 0.16s ease,
    text-shadow 0.16s ease;

  &:hover,
  &.active {
    background: linear-gradient(180deg, rgba(42, 226, 255, 0.24), rgba(19, 117, 180, 0.18));
    color: #f4fdff;
    text-shadow: 0 0 12px rgba(72, 231, 255, 0.72);
  }
}

.task-subnav-enter-active,
.task-subnav-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.task-subnav-enter-from,
.task-subnav-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 数据配置面板样式 */
.data-config-panel {
  position: absolute;
  top: 62px;
  left: 30px;
  width: 440px;
  background: linear-gradient(180deg, rgba(7, 26, 60, 0.98) 0%, rgba(4, 15, 40, 0.98) 100%);
  // border: 1px solid #1d91ff;
  box-shadow: 0 0 30px rgba(29, 145, 255, 0.35);
  z-index: 1500;
  padding: 1px;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 2%;
    width: 96%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #37dcff, transparent);
    box-shadow: 0 0 12px #37dcff;
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    pointer-events: none;
    right: -1px;
    bottom: -1px;
    border-right: 2px solid #37dcff;
    border-bottom: 2px solid #37dcff;
  }
}

.panel-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  background: url('@/assets/imgs/echarts/首页/sjpz_label.png') no-repeat center center;
  background-size: 100% 60px;

  .header-title {
    color: #fff;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
    padding-left: 40px;
    text-shadow: 0 0 10px rgba(166, 216, 255, 0.8);
  }
}

.panel-body {
  padding: 24px 24px 16px;
}

.form-item {
  margin-bottom: 24px;

  .item-label {
    color: #9ebfdd;
    font-size: 18px;
    margin-bottom: 12px;
  }
}

.field-shell {
  width: 100%;
}

.frequency-input {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d4eaff;
  font-size: 18px;
}

/* 自定义 Element Plus 样式 */
:deep(.custom-date-picker) {
  width: 100% !important;
  --el-date-editor-width: 100%;

  &.el-input__wrapper,
  &.el-range-editor,
  .el-input__wrapper,
  .el-range-editor.el-input__wrapper {
    min-height: 54px !important;
    background: rgba(13, 35, 75, 0.72) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 3px !important;
    padding: 0 14px !important;
  }

  .el-range-input,
  .el-input__inner {
    background: transparent !important;
    color: #d4eaff !important;
    font-size: 18px !important;
    height: 44px !important;

    &::placeholder {
      color: rgba(212, 234, 255, 0.5) !important;
    }
  }

  .el-range-separator {
    color: #9ebfdd !important;
    font-size: 18px;
  }

  .el-icon {
    color: #43e4ff !important;
    font-size: 18px;
  }
}

:deep(.custom-cascader) {
  width: 100% !important;

  .el-input__wrapper {
    min-height: 54px !important;
    background: rgba(13, 35, 75, 0.72) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 3px !important;
    padding: 0 14px !important;
  }

  .el-input__inner {
    color: #d4eaff !important;
    font-size: 18px !important;
    height: 44px !important;
  }

  .el-input__suffix,
  .el-cascader__dropdown-icon,
  .el-input__icon {
    color: #00daff !important;
    font-size: 20px;
  }
}

:deep(.custom-select) {
  width: 100% !important;

  .el-select__wrapper {
    min-height: 54px !important;
    background: rgba(13, 35, 75, 0.72) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 3px !important;
    padding: 0 14px !important;
  }

  .el-select__selected-item,
  .el-select__placeholder {
    color: #d4eaff !important;
    font-size: 18px !important;
  }

  .el-select__caret {
    color: #00daff !important;
    font-size: 20px;
  }
}

:deep(.custom-number-input) {
  width: 100px !important;

  .el-input__wrapper {
    background: rgba(13, 35, 75, 0.6) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 2px;
    padding: 0 8px;
  }

  .el-input__inner {
    color: #d4eaff !important;
    font-size: 20px !important;
    text-align: left;
  }
}

.panel-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 20px;

  .el-button {
    flex: 1;
    height: 46px;
    font-size: 20px;
    border: none;
    border-radius: 0;
  }

  .save-btn {
    background: linear-gradient(90deg, #20c7d2 0%, #2aa9df 100%) !important;
    color: #fff !important;
    box-shadow:
      inset 0 0 0 1px rgba(130, 246, 255, 0.25),
      0 0 18px rgba(32, 199, 210, 0.28);

    &:hover {
      filter: brightness(1.05);
    }
  }

  .cancel-btn {
    background: linear-gradient(180deg,
        rgba(18, 44, 92, 0.92) 0%,
        rgba(10, 28, 68, 0.92) 100%) !important;
    border: 1px solid rgba(57, 141, 231, 0.75) !important;
    color: #c4e1ff !important;
    box-shadow: inset 0 0 0 1px rgba(67, 196, 255, 0.08);

    &:hover {
      background: linear-gradient(180deg,
          rgba(22, 56, 114, 0.95) 0%,
          rgba(13, 36, 84, 0.95) 100%) !important;
    }
  }
}

.header-center {
  position: relative;
  min-width: 0;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  h1 {
    margin: 0;
    line-height: 0;
    color: #e7f6ff;
    font-size: 48px;
    font-weight: 800;
    letter-spacing: 2px;
    text-shadow: 0 0 15px rgba(63, 212, 255, 0.35);
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      text-shadow: 0 0 25px rgba(63, 212, 255, 0.75);
      filter: brightness(1.15);
    }

    img {
      display: block;
      width: auto;
      max-width: 100%;
      height: 72px;
      object-fit: contain;
    }
  }

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    transition: all 0.25s ease;
    margin-top: -20px;

    img {
      display: block;
      height: 44px;
      width: auto;
      max-width: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 8px rgba(67, 228, 255, 0.35));
      transition: filter 0.25s ease;
    }

    &:hover {
      filter: brightness(1.12);

      img {
        filter: drop-shadow(0 0 14px rgba(67, 228, 255, 0.65));
      }
    }
  }
}

.center-glow {
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 74%;
  height: 3px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, #43e4ff, transparent);
}

.assistant-badge {
  width: 220px;
  min-width: 0;
  flex: 0 1 220px;
  box-sizing: border-box;
  height: 52px;
  border: 1px solid rgba(79, 152, 255, 0.75);
  background: linear-gradient(90deg, rgba(66, 83, 190, 0.65), rgba(34, 54, 157, 0.35));
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  img {
    width: 40px;
    height: 40px;
  }
}

.assistant-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  strong {
    color: #8ecbff;
    font-size: 18px;
    font-weight: 700;
  }

  span {
    display: block;
    overflow: hidden;
    color: #d4eaff;
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>

<style lang="scss">
.big-screen-date-popper {
  z-index: 1200 !important;

  // Set CSS variables for internal Element Plus elements (arrows, borders, inputs)
  --el-bg-color-overlay: rgba(8, 20, 54, 0.98) !important;
  --el-border-color-light: rgba(57, 141, 231, 0.55) !important;
  --el-text-color-regular: #d4eaff !important;
  --el-text-color-primary: #d4eaff !important;
  --el-datepicker-text-color: #d4eaff !important;
  --el-datepicker-off-text-color: rgba(196, 225, 255, 0.35) !important;
  --el-datepicker-header-text-color: #d4eaff !important;
  --el-fill-color-blank: rgba(8, 20, 54, 0.98) !important;

  &.el-popper,
  &.el-datepicker__popper {
    background: rgba(8, 20, 54, 0.98) !important;
    border: 1px solid rgba(57, 141, 231, 0.55) !important;
    box-shadow: 0 10px 30px rgba(4, 18, 45, 0.5) !important;
  }

  // Clear white background of panels and bodies
  .el-picker-panel,
  .el-date-range-picker,
  .el-picker-panel__body,
  .el-date-range-picker__content {
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    color: #d4eaff !important;
  }

  .el-date-range-picker__header {
    color: #d4eaff !important;

    div {
      color: #d4eaff !important;
    }

    button {
      color: #4ce9ff !important;
    }
  }

  .el-picker-panel__icon-btn,
  .el-date-table th,
  .el-month-table td .cell,
  .el-year-table td .cell {
    color: #c4e1ff !important;
  }

  // Clear white background of calendar table, rows, and cells
  .el-date-table,
  .el-date-table tr,
  .el-date-table td,
  .el-date-table td .el-date-table-cell,
  .el-date-table td .cell {
    background: transparent !important;
    background-color: transparent !important;
    color: #d4eaff !important;
  }

  // Disabled cells
  .el-date-table td.disabled,
  .el-date-table td.disabled .el-date-table-cell,
  .el-date-table td.disabled .cell {
    background: rgba(255, 255, 255, 0.03) !important;
    color: rgba(196, 225, 255, 0.25) !important;
  }

  // Hover state for available cells
  .el-date-table td.available:hover,
  .el-date-table td.available:hover .el-date-table-cell,
  .el-date-table td.available:hover .cell {
    background: rgba(67, 196, 255, 0.12) !important;
    color: #4ce9ff !important;
  }

  // In-range state
  .el-date-table td.in-range,
  .el-date-table td.in-range .el-date-table-cell,
  .el-date-table td.in-range .cell {
    background: rgba(67, 196, 255, 0.16) !important;
    color: #d4eaff !important;
  }

  // Start date / End date selected state
  .el-date-table td.start-date .el-date-table-cell,
  .el-date-table td.start-date .cell,
  .el-date-table td.end-date .el-date-table-cell,
  .el-date-table td.end-date .cell {
    background: #1ca9e8 !important;
    color: #fff !important;
  }
}

.big-screen-area-popper {
  z-index: 1200 !important;

  .el-cascader-panel {
    min-width: 100%;
    border: 1px solid rgba(57, 141, 231, 0.55);
    background: rgba(8, 20, 54, 0.98);
    box-shadow: 0 10px 30px rgba(4, 18, 45, 0.5);

    // 干掉级联选择器面板中的单选框，使点击整行文本即可选中
    .el-radio {
      width: 100% !important;
      height: 100% !important;
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 10 !important;
      margin-right: 0 !important;
      opacity: 0 !important;
      cursor: pointer !important;

      .el-radio__input,
      .el-radio__inner {
        display: none !important;
      }
    }
  }

  .el-cascader-menu {
    min-width: 160px;
    border-right-color: rgba(57, 141, 231, 0.2);
  }

  .el-cascader-node {
    color: #c4e1ff;
    position: relative !important; // 重要，配合绝对定位的 .el-radio

    &.is-active,
    &:hover {
      background: rgba(41, 112, 201, 0.18);
      color: #4ce9ff;
    }
  }
}

.big-screen-select-popper {
  z-index: 1200 !important;
  border: 1px solid rgba(57, 141, 231, 0.55) !important;
  background: rgba(8, 20, 54, 0.98) !important;
  box-shadow: 0 10px 30px rgba(4, 18, 45, 0.5) !important;

  .el-popper__arrow::before {
    background: rgba(8, 20, 54, 0.98) !important;
    border: 1px solid rgba(57, 141, 231, 0.55) !important;
  }

  .el-select-dropdown {
    background: transparent !important;
  }

  .el-select-dropdown__item {
    color: #c4e1ff !important;
    font-size: 16px !important;

    &.is-selected,
    &.hover,
    &.is-hovering,
    &:hover {
      background: rgba(41, 112, 201, 0.18) !important;
      color: #4ce9ff !important;
    }
  }
}
</style>
