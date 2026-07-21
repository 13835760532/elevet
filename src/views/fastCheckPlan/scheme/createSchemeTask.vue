<template>
    <div class="page-container">
        <!-- 头部标题 -->
        <pageHeader title="创建检测任务" desc="支持检测方案按承检机构和检测行任务拆分，配置任务执行时间、检测数量、检测结果提交要求（检测品种、检测项目、检测地区、检测频率）" />
        <div class="flex-1">
            <!-- 方案信息展示 -->
            <div class="scheme-info-card">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="label">方案编号</span>
                        <span class="value">{{ schemeInfo.no }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">方案名称</span>
                        <span class="value">{{ schemeInfo.name }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">主管单位</span>
                        <span class="value link-text">{{ schemeInfo.dept }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">方案类型</span>
                        <span class="value">{{ schemeInfo.type }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">产品分类</span>
                        <span class="value">{{ schemeInfo.category }}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">计划总量</span>
                        <span class="value highlight">{{ schemeInfo.sampleCount }} 份</span>
                    </div>
                    <div class="info-item">
                        <span class="label">执行时间</span>
                        <span class="value">{{ schemeInfo.executionTime }}</span>
                    </div>
                </div>
            </div>

            <!-- 任务拆分表单 -->
            <div class="content-card">
                <h3 class="section-title">任务拆分</h3>

                <!-- 步骤1: 选择任务承担单位 -->
                <div class="step-section">
                    <h4 class="step-title">1、选择任务承担单位</h4>
                    <el-form label-width="80px" label-position="right" class="filter-form-inline">
                        <el-form-item label="所属区域" style="margin-bottom: 0; align-items: center">
                            <AreaCascader class="filter-select" v-model="areaPath" placeholder="请选择所属地区" checkStrictly
                                @select="
                                    (val) => {
                                        taskForm.province = val.province
                                        taskForm.city = val.city
                                        taskForm.district = val.district
                                        taskForm.provinceCode = val.provinceCode
                                        taskForm.cityCode = val.cityCode
                                        taskForm.districtCode = val.districtCode
                                        loadOrgOptions()
                                    }
                                " />
                        </el-form-item>

                        <el-form-item label="单位类型" style="margin-bottom: 0; align-items: center; margin-left: 24px">
                            <el-select v-model="taskForm.deptType" placeholder="请选择单位类型" class="filter-select"
                                :disabled="false" clearable @change="loadOrgOptions">
                                <el-option label="监管机构" :value="1" />
                                <el-option label="检测机构" :value="2" />
                                <el-option label="生产经营企业" :value="3" />
                                <el-option label="平台运营机构" :value="4" />
                            </el-select>
                        </el-form-item>
                    </el-form>

                    <div class="search-box">
                        <el-input v-model="searchKeyword" placeholder="输入机构名称" class="search-input"
                            @keyup.enter="loadOrgOptions">
                            <template #suffix>
                                <el-icon class="search-icon" @click="loadOrgOptions">
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>

                    <div class="org-list" v-loading="orgLoading">
                        <div class="org-item check-all-item">
                            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate"
                                @change="handleCheckAllChange">
                                全选 {{ orgOptions.length }}项
                            </el-checkbox>
                        </div>
                        <el-checkbox-group v-model="selectedOrgs" @change="handleCheckedOrgsChange">
                            <div class="org-item" v-for="org in orgOptions" :key="org.id">
                                <el-checkbox :label="org.id">{{ org.name }}</el-checkbox>
                            </div>
                        </el-checkbox-group>
                    </div>
                </div>

                <!-- 步骤2: 设置任务分配周期 -->
                <div class="step-section">
                    <h4 class="step-title">2、设置任务分配原则</h4>
                    <div class="allocation-config">
                        <div class="config-row">
                            <span class="config-label">任务检测量：</span>
                            <el-input v-model="taskForm.quantity" placeholder="任务检测量" type="number" :disabled="true"
                                class="quantity-input" />
                            <!-- <el-input v-model="taskForm.quantity" placeholder="任务检测量" type="number"
                                :disabled="taskForm.distributionType === 'manual'" class="quantity-input"
                                :class="{ 'error-input': isExceedLimit }" />
                            <span class="warning-text" :class="{ 'error-text': isExceedLimit }">
                                {{
                                    isExceedLimit
                                        ? `超出可用总量（剩余可用：${schemeInfo.sampleCount}）`
                                : '取值规则方案检测总量-已分发量'
                                }}
                            </span> -->
                        </div>
                        <div class="config-row">
                            <span class="config-label">分发方式：</span>
                            <el-radio-group v-model="taskForm.distributionType">
                                <el-radio label="average">平均分配</el-radio>
                                <el-radio label="manual">手动分配</el-radio>
                            </el-radio-group>
                        </div>
                        <div class="config-row">
                            <span class="config-label">执行时间：</span>
                            <div class="date-range-group">
                                <el-date-picker v-model="taskForm.startDate" type="date" placeholder="开始日期"
                                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker" disabled />
                                <span class="date-separator">至</span>
                                <el-date-picker v-model="taskForm.endDate" type="date" placeholder="结束日期"
                                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker" disabled />
                            </div>
                        </div>
                    </div>
                </div>

                <DetectionRequirementSection v-model="taskList" :sample-count="schemeInfo.sampleCount"
                    :distribution-type="taskForm.distributionType" :org-options="selectedOrgOptions"
                    :default-time-range="[taskForm.startDate, taskForm.endDate]"
                    :default-varieties="schemeInfo.category !== '--' ? schemeInfo.category : ''" />

                <!-- 底部按钮 -->
                <div class="footer-actions">
                    <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
                    <el-button type="primary" @click="handleSubmit" class="btn-submit">创建任务并下发</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DetectionRequirementSection from '@/components/DetectionRequirementSection/index.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import * as DetectionPlanApi from '@/api/agri/detectionPlan/index'
import * as OrganizationApi from '@/api/agri/organization/index'
import * as DistRelationApi from '@/api/agri/dist-relation/index'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'
import * as ProduceCategoryApi from '@/api/agri/produceCategory'
import { handleTree } from '@/utils/tree'

const router = useRouter()
const route = useRoute()
const planId = Number(route.query.id) || 1

const schemeInfo = reactive({
    no: '',
    name: '',
    dept: '',
    type: '',
    category: '--',
    executionTime: '--',
    sampleCount: 0
})

// 使用字典
const { getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE, 'int')
const { getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str')

const produceCategoryTree = ref([])

/**\n * getCategoryLabelFromTree：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getCategoryLabelFromTree = (val) => {
    if (!val) return '--'
    /**\n     * findLabel：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n     */
    const findLabel = (nodes) => {
        for (const node of nodes) {
            if (String(node.code) === String(val) || String(node.name) === String(val) || String(node.id) === String(val)) {
                return node.name
            }
            if (node.children?.length) {
                const found = findLabel(node.children)
                if (found) return found
            }
        }
        return null
    }
    const foundName = findLabel(produceCategoryTree.value)
    return foundName || getProductCategoryLabel(val) || val
}

/** 加载农产品行业分类树 */
const loadProduceCategoryTree = async () => {
    try {
        const res = await ProduceCategoryApi.getProduceCategoryPage({
            pageNo: 1,
            pageSize: 1000,
            type: '1' // 1-分类
        })
        const list = res?.list || []
        produceCategoryTree.value = handleTree(list)
    } catch (error) {
        console.error('加载农产品分类失败:', error)
    }
}

/** 加载方案摘要，并将方案周期与品种作为后续任务拆分的默认值。 */
const loadSchemeDetail = async () => {
    if (!planId) return
    try {
        const data = await DetectionPlanApi.getDetectionPlan(planId)
        schemeInfo.no = data.planCode
        schemeInfo.name = data.planName
        schemeInfo.dept = data.issuerDeptName || `部门ID: ${data.issuerDeptId}`
        schemeInfo.type = getPlanTypeLabel(data.planType)
        schemeInfo.category = data.targetCategory ? getCategoryLabelFromTree(data.targetCategory) : '--'
        // 同步已选的 taskList 品种
        if (taskList.value.length) {
            taskList.value.forEach(item => {
                if (!item.varieties || item.varieties === '待设置') {
                    item.varieties = schemeInfo.category !== '--' ? schemeInfo.category : '待设置'
                }
            })
        }
        schemeInfo.executionTime = `${data.planStartDate || ''} 至 ${data.planEndDate || ''}`
        schemeInfo.sampleCount = data.sampleCount || 0

        // 设置任务默认时间
        taskForm.startDate = data.planStartDate ? String(data.planStartDate).slice(0, 10) : ''
        taskForm.endDate = data.planEndDate ? String(data.planEndDate).slice(0, 10) : ''
    } catch (error) {
        console.error('获取方案详情失败:', error)
        ElMessage.error('加载方案详情失败')
    }
}

const taskForm = reactive({
    systemType: 1,
    deptType: 3,
    province: '',
    city: '',
    district: '',
    provinceCode: '',
    cityCode: '',
    districtCode: '',
    quantity: 0,
    distributionType: 'average',
    startDate: '',
    endDate: ''
})

const isExceedLimit = computed(() => {
    return Number(taskForm.quantity) > Number(schemeInfo.sampleCount)
})

const areaPath = ref([])

const searchKeyword = ref('')
const selectedOrgs = ref([])
const orgLoading = ref(false)
const checkAll = ref(false)
const isIndeterminate = ref(false)
const orgOptions = ref([])
const orgMapById = computed(() => {
    const map = new Map()
    orgOptions.value.forEach((org) => map.set(org.id, org))
    return map
})

const selectedOrgOptions = computed(() => {
    return selectedOrgs.value.map((id) => orgMapById.value.get(id)).filter(Boolean)
})

/**
 * 在机构筛选结果变化后剔除不可见的失效选择，并重算全选和半选状态。
 */
const reconcileSelectionState = () => {
    const currentIds = new Set(orgOptions.value.map((item) => item.id))
    selectedOrgs.value = selectedOrgs.value.filter((id) => currentIds.has(id))
    const checkedCount = selectedOrgs.value.length
    checkAll.value = checkedCount > 0 && checkedCount === orgOptions.value.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length
}

/** 按系统关系、机构类型和行政区划查询当前方案可分配的承担单位。 */
const loadOrgOptions = async () => {
    orgLoading.value = true
    try {
        const params = {
            keyword: searchKeyword.value?.trim(),
            relationType: taskForm.systemType,
            deptType: taskForm.deptType,
            provinceCode: taskForm.provinceCode,
            cityCode: taskForm.cityCode,
            districtCode: taskForm.districtCode
        }
        const response = await DistRelationApi.getAssignableTargets(params)
        orgOptions.value = (response || []).map((item) => ({
            id: item.targetId,
            name: item.targetName,
            socialCreditCode: item.socialCreditCode,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            address: '' // 新接口暂无 address 字段，设为空字符串
        }))
        reconcileSelectionState()
    } catch (error) {
        console.error('加载可分配机构失败:', error)
        ElMessage.error('加载可分配机构失败')
    } finally {
        orgLoading.value = false
    }
}

/**\n * applyOrgFilter：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const applyOrgFilter = () => {
    loadOrgOptions()
}

/**\n * handleCheckAllChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCheckAllChange = (val) => {
    selectedOrgs.value = val ? orgOptions.value.map((org) => org.id) : []
    isIndeterminate.value = false
}

/**\n * handleCheckedOrgsChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCheckedOrgsChange = (value) => {
    const checkedCount = value.length
    checkAll.value = checkedCount === orgOptions.value.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length
}

/**\n * buildDefaultExecutionTime：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const buildDefaultExecutionTime = () => {
    if (!taskForm.startDate || !taskForm.endDate) return '待设置'
    try {
        const s =
            typeof taskForm.startDate === 'string'
                ? taskForm.startDate.slice(0, 10)
                : new Date(taskForm.startDate).toISOString().slice(0, 10)
        const e =
            typeof taskForm.endDate === 'string'
                ? taskForm.endDate.slice(0, 10)
                : new Date(taskForm.endDate).toISOString().slice(0, 10)
        return `${s}～${e}`
    } catch (e) {
        return `${taskForm.startDate}～${taskForm.endDate}`
    }
}

/**\n * buildDefaultDetectionArea：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const buildDefaultDetectionArea = () => {
    return [taskForm.province, taskForm.city, taskForm.district].filter(Boolean).join('')
}

/**
 * 根据已选机构生成任务拆分行。
 * 平均分配时余数按机构顺序逐个补 1；手动分配时保留总量供用户逐行调整。
 */
const buildTaskRowsBySelectedOrgs = () => {
    const orgIds = selectedOrgs.value || []
    if (!orgIds.length) return []

    const total = Number(taskForm.quantity) || 0
    const isAverage = taskForm.distributionType === 'average'
    const avg = isAverage && orgIds.length ? Math.floor(total / orgIds.length) : 0
    const remain = isAverage && orgIds.length ? total % orgIds.length : 0
    const executionTime = buildDefaultExecutionTime()
    const region = buildDefaultDetectionArea() || '待设置'

    return orgIds.map((orgId, index) => {
        const org = orgMapById.value.get(orgId)
        const quantity = isAverage ? avg + (index < remain ? 1 : 0) : total
        return {
            deptId: orgId,
            subjectId: orgId,
            dept: org?.name || `机构${orgId}`,
            region,
            quantity: String(Math.max(0, quantity)),
            executionTime,
            varieties: schemeInfo.category !== '--' ? schemeInfo.category : '待设置',
            items: '待设置'
        }
    })
}

/** 从任务行主键、机构名称或当前选择中解析后端要求的承担部门 ID。 */
const resolveDeptId = (item) => {
    if (item.deptId) return Number(item.deptId)
    if (item.dept) {
        const matched = orgOptions.value.find((org) => org.name === item.dept)
        if (matched?.id) return Number(matched.id)
    }
    return Number(selectedOrgs.value[0]) || 0
}

let searchTimer = null
watch(
    () => searchKeyword.value,
    () => {
        if (searchTimer) clearTimeout(searchTimer)
        searchTimer = setTimeout(() => {
            applyOrgFilter()
        }, 300)
    }
)

watch(
    () => areaPath.value,
    (val) => {
        if (!val || val.length === 0) {
            taskForm.provinceCode = ''
            taskForm.cityCode = ''
            taskForm.districtCode = ''
            taskForm.province = ''
            taskForm.city = ''
            taskForm.district = ''
            loadOrgOptions()
        }
    },
    { deep: true }
)

const taskList = ref([])

/**
 * 同步机构选择与任务拆分行：取消机构时移除对应行，新增机构时补充默认任务行。
 * 已存在行保留用户手工修改的数量、区域和检测项目。
 */
watch(
    () => selectedOrgs.value,
    (newIds) => {
        const currentList = [...taskList.value]
        // 移除不再选中的机构
        const filteredList = currentList.filter((item) => newIds.includes(item.deptId))

        // 添加新选中的机构
        newIds.forEach((id) => {
            if (!filteredList.find((item) => item.deptId === id)) {
                const org = orgMapById.value.get(id)
                filteredList.push({
                    deptId: id,
                    subjectId: id,
                    dept: org?.name || `机构${id}`,
                    region: buildDefaultDetectionArea() || '待设置',
                    quantity: 0,
                    executionTime: buildDefaultExecutionTime(),
                    varieties: schemeInfo.category !== '--' ? schemeInfo.category : '待设置',
                    items: '待设置'
                })
            }
        })
        taskList.value = filteredList
    },
    { deep: true }
)

// 监听异步方案分类加载完毕，并自动同步到当前任务列表行的品种
watch(
    () => schemeInfo.category,
    (newVal) => {
        if (newVal && newVal !== '--' && taskList.value.length) {
            taskList.value.forEach((item) => {
                if (!item.varieties || item.varieties === '待设置') {
                    item.varieties = newVal
                }
            })
        }
    }
)

// 监听任务列表变化，手动分配时同步汇总检测总量
// watch(
//     taskList,
//     (newVal) => {
//         if (taskForm.distributionType === 'manual') {
//             const total = (newVal || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
//             taskForm.quantity = total > 0 ? total : 0
//         }
//     },
//     { deep: true, immediate: true }
// )

// 切换分配方式时的处理
// watch(
//     () => taskForm.distributionType,
//     (val) => {
//         if (val === 'manual') {
//             // 切换到手动时，根据当前列表重新计算总量
//             const total = taskList.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
//             taskForm.quantity = total
//         } else {
//             // 切换回平均分配时，通常恢复为原始可用总量
//             taskForm.quantity = schemeInfo.sampleCount || 0
//         }
//     }
// )

/**\n * handleCancel：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCancel = () => {
    router.back()
}

/**
 * 校验承担单位和任务总量后批量下发任务。
 * 每行执行时间拆分为起止日期，机构和样本数量转换为接口所需的 taskSplits。
 */
const handleSubmit = useDebounceFn(async () => {
    if (selectedOrgs.value.length === 0 && taskList.value.length === 0) {
        ElMessage.warning('请选择任务承担单位')
        return
    }

    const rows = taskList.value.length ? taskList.value : buildTaskRowsBySelectedOrgs()

    if (!rows.length) {
        ElMessage.warning('请先在第3步配置任务拆分')
        return
    }

    if (isExceedLimit.value) {
        ElMessage.error(
            `任务检测总量 (${taskForm.quantity}) 不能超过总任务量 (${schemeInfo.sampleCount})`
        )
        return
    }

    const taskSplits = rows
        .map((item) => {
            let startDate = undefined
            let endDate = undefined

            if (item.executionTime && item.executionTime !== '待设置') {
                const times = item.executionTime.split('～')
                if (times.length === 2) {
                    startDate = times[0].trim()
                    endDate = times[1].trim()
                }
            }

            const assignDeptId = resolveDeptId(item)
            const sampleCount = Number(item.quantity) || 0
            return {
                assignDeptId,
                sampleCount,
                subjectId: Number(item.subjectId) || assignDeptId,
                taskType: 1,
                detectionVarieties: item.varieties !== '待设置' ? item.varieties : undefined,
                detectionItems: item.items !== '待设置' ? item.items : undefined,
                detectionArea:
                    item.region !== '待设置' ? item.region : buildDefaultDetectionArea() || undefined,
                startDate: startDate || taskForm.startDate || undefined,
                endDate: endDate || taskForm.endDate || undefined
            }
        })
        .filter((item) => item.assignDeptId && item.sampleCount > 0)

    if (!taskSplits.length) {
        ElMessage.warning('任务拆分数据不完整，请检查承担单位和检测数量')
        return
    }

    const payload = {
        planId: planId,
        taskSplits
    }

    try {
        await DetectionPlanApi.splitPlanTasks(payload)

        ElMessage.success('任务创建及下发成功')
        setTimeout(() => {
            router.back()
        }, 1500)
    } catch (error) {
        console.error('任务下发失败', error)
        ElMessage.error('任务下发失败')
    }
}, 300)

// 页面初始化
onMounted(async () => {
    await loadProduceCategoryTree()
    loadSchemeDetail()
    loadOrgOptions()
})
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 90px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.flex-1 {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 方案信息卡片 */
.scheme-info-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px 32px;
}

.info-item {
    display: flex;
    gap: 12px;

    .label {
        font-size: 14px;
        color: #666;
        white-space: nowrap;
    }

    .value {
        font-size: 14px;
        color: #1e293b;
        font-weight: 500;

        &.highlight {
            color: #2563eb;
            font-weight: 600;
        }
    }
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
    flex: 1;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;
}

/* 步骤区域 */
.step-section {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #f0f0f0;

    &:last-of-type {
        border-bottom: none;
    }
}

.step-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
}

.full-width {
    width: 100%;
}

.filter-form-inline {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.filter-select {
    width: 220px !important;
}

/* 搜索框 */
.search-box {
    margin-top: 16px;

    .search-input {
        max-width: 600px;

        :deep(.el-input__wrapper) {
            background: #f9fafb;
        }
    }

    .search-icon {
        color: #999;
        cursor: pointer;
    }
}

/* 机构列表 */
.org-list {
    margin-top: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;

    .org-item {
        padding: 8px 0;
    }

    .check-all-item {
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;
    }
}

/* 分配配置 */
.allocation-config {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.config-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .config-label {
        font-size: 14px;
        color: #333;
        white-space: nowrap;
        min-width: 100px;
    }

    .quantity-input {
        width: 200px;
    }

    .warning-text {
        font-size: 13px;
        color: #f59e0b;
    }
}

.date-range-group {
    display: flex;
    align-items: center;
    gap: 12px;

    .date-picker {
        width: 180px;
    }

    .date-separator {
        color: #666;
        font-size: 14px;
    }
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px dashed #d1d5db;

    .el-button {
        min-width: 140px;
        height: 44px;
        border-radius: 8px;
        font-size: 14px;
    }

    .btn-cancel {
        background: #fff;
        border-color: #d1d5db;
        color: #333;
    }

    .btn-submit {
        background: #00b3ed;
        border-color: #00b3ed;
    }
}

.error-input {
    :deep(.el-input__wrapper) {
        box-shadow: 0 0 0 1px #f56c6c inset !important;

        &.is-disabled {
            box-shadow: 0 0 0 1px #f56c6c inset !important;
            background-color: #fffbfa !important;
        }
    }
}

.error-text {
    color: #f56c6c !important;
}
</style>
