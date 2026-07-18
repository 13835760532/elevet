<template>
    <div class="page-container">
        <!-- 头部标题 -->
        <pageHeader title="任务转派" desc="对接收的任务进行转派分发" />
        <div class="flex-1">
            <!-- 方案及任务基础信息 (原型样式) -->
            <div class="scheme-info-card">
                <div class="info-header-main">
                    <h1 class="task-title">
                        {{ schemeInfo.name }}
                        <span class="task-no">（编号：{{ schemeInfo.no }}）</span>
                    </h1>
                </div>

                <div class="info-detail-list">
                    <div class="info-row">
                        <span class="info-label">所属方案</span>
                        <span class="info-value">
                            {{ schemeInfo.planName }}
                            <span class="sub-no">（编号：{{ schemeInfo.planNo }}）</span>
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">主管单位</span>
                        <span class="info-value highlight">{{ schemeInfo.dept }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">方案类型</span>
                        <span class="info-value highlight">{{ schemeInfo.type }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">剩余分发</span>
                        <span class="info-value highlight">{{ schemeInfo.sampleCount }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">执行时间</span>
                        <span class="info-value highlight">{{ schemeInfo.executionTimeLabel }}</span>
                    </div>
                </div>
            </div>

            <!-- 任务拆分表单 -->
            <div class="content-card">
                <h3 class="section-title">任务拆分</h3>

                <!-- 步骤1: 选择任务承担单位 -->
                <div class="step-section">
                    <h4 class="step-title">1、选择任务承担单位</h4>

                    <el-form class="filter-form-inline">
                        <el-form-item style="margin-bottom: 0; margin-right: 16px;">
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
                        <el-form-item style="margin-bottom: 0;">
                            <el-select v-model="taskForm.deptType" placeholder="选择机构类型" class="filter-select"
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
                    :default-time-range="[taskForm.startDate, taskForm.endDate]" />

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
import { ref, reactive, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DetectionRequirementSection from '@/components/DetectionRequirementSection/index.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import * as DetectionTaskApi from '@/api/agri/detectionTask/index'
import * as OrganizationApi from '@/api/agri/organization/index'
import * as DistRelationApi from '@/api/agri/dist-relation/index'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const planId = Number(route.query.id) || 1

const schemeInfo = reactive({
    no: '', // 任务编号
    name: '', // 任务名称
    planNo: '', // 方案编号
    planName: '', // 方案名称
    dept: '',
    type: '',
    category: '--',
    executionTime: '--',
    executionTimeLabel: '--',
    sampleCount: 0,
    varieties: '',
    items: ''
})

// 使用字典
const { getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE, 'int')
const { getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str')

// 加载方案详情
/** 加载方案详情及统计数据，作为任务数量、品种和执行周期的默认约束。 */
const loadSchemeDetail = async () => {
    try {
        let data = JSON.parse(window.sessionStorage.getItem('planInfo'))

        // 缓存为空或缺少方案数据时，通过路由任务ID重新请求后端接口拉取完整数据
        if (!data || !data.planInfo) {
            const id = Number(route.query.id) || planId
            if (id) {
                data = await DetectionTaskApi.getDetectionTask(id)
            }
        }

        data = data || {}
        console.log('Task Detail for echo:', data)
        const planInfo = data.planInfo || {}

        schemeInfo.no = data.taskCode || '--'
        schemeInfo.name = data.taskName || '--'
        schemeInfo.planNo = planInfo.planCode || data.planCode || '--'
        schemeInfo.planName = planInfo.planName || data.planName || '--'
        schemeInfo.dept = planInfo.issuerDeptName || data.issuerDeptName || (planInfo.issuerDeptId || data.issuerDeptId ? `部门ID: ${planInfo.issuerDeptId || data.issuerDeptId}` : '--')
        schemeInfo.type = getPlanTypeLabel(planInfo.planType !== undefined ? planInfo.planType : data.planType)

        const targetCategory = planInfo.targetCategory !== undefined ? planInfo.targetCategory : data.targetCategory
        schemeInfo.category = targetCategory ? getProductCategoryLabel(targetCategory) : '--'

        schemeInfo.executionTime = `${data.startDate || ''} 至 ${data.endDate || ''}`
        schemeInfo.executionTimeLabel =
            data.startDate && data.endDate
                ? `${data.startDate.slice(0, 4)}年${data.startDate.slice(5, 7)}月${data.startDate.slice(8, 10)}日至${data.endDate.slice(0, 4)}年${data.endDate.slice(5, 7)}月${data.endDate.slice(8, 10)}日`
                : '--'
        schemeInfo.sampleCount = data.sampleCount || 0
        schemeInfo.varieties = data.detectionVarieties || ''
        schemeInfo.items = data.detectionItems || ''

        // 设置任务默认数据
        taskForm.quantity = data.sampleCount
        taskForm.startDate = data.startDate ? String(data.startDate).slice(0, 10) : ''
        taskForm.endDate = data.endDate ? String(data.endDate).slice(0, 10) : ''
    } catch (error) {
        console.error('解析任务回显信息失败:', error)
        ElMessage.error('加载任务详情失败')
    }
}


const taskForm = reactive({
    systemType: 1,
    deptType: '',
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

const isExceedLimit = computed(() => {
    return Number(taskForm.quantity) > Number(schemeInfo.sampleCount)
})

/**
 * 过滤当前机构结果中已失效的选择，并同步全选和半选状态。
 * 行政区划、机构类型或关键词变更后，接口返回集合可能缩小；仅保留仍在返回集合中的 ID，
 * 防止用户看不到的历史选项被错误下发任务，同时让复选框状态反映当前可见列表。
 */
const reconcileSelectionState = () => {
    const currentIds = new Set(orgOptions.value.map((item) => item.id))
    selectedOrgs.value = selectedOrgs.value.filter((id) => currentIds.has(id))
    const checkedCount = selectedOrgs.value.length
    checkAll.value = checkedCount > 0 && checkedCount === orgOptions.value.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length
}

/**
 * 按机构类型、关键字和行政区划加载当前账号可下发的部门。
 * pageSize 设为 1000 是因为页面的“全选”语义覆盖当前筛选的全部机构，而不是单个分页；接口返回后
 * 会转换为任务行最小需要的联系人、信用代码和地址字段，不把后端原对象直接暴露给表单编辑。
 */
const loadOrgOptions = async () => {
    orgLoading.value = true
    try {
        const params = {
            name: searchKeyword.value?.trim(),
            deptType: taskForm.deptType || undefined,
            provinceCode: taskForm.provinceCode,
            cityCode: taskForm.cityCode,
            districtCode: taskForm.districtCode,
            pageNo: 1,
            pageSize: 1000 // 加载较大量以支持当前页全选，模拟原有体验
        }
        const response = await DistRelationApi.getAssignableDepts(params)
        orgOptions.value = (response.list || []).map((item) => ({
            id: item.deptId,
            name: item.name,
            socialCreditCode: item.socialCreditCode,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            address: item.address
        }))
        reconcileSelectionState()
    } catch (error) {
        console.error('加载可分配机构失败:', error)
        ElMessage.error('加载可分配机构失败')
    } finally {
        orgLoading.value = false
    }
}

const applyOrgFilter = () => {
    // 逻辑已整合到 loadOrgOptions 后端请求中
    loadOrgOptions()
}

const handleCheckAllChange = (val) => {
    selectedOrgs.value = val ? orgOptions.value.map((org) => org.id) : []
    isIndeterminate.value = false
}

const handleCheckedOrgsChange = (value) => {
    const checkedCount = value.length
    checkAll.value = checkedCount === orgOptions.value.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length
}

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

const buildDefaultDetectionArea = () => {
    return [taskForm.province, taskForm.city, taskForm.district].filter(Boolean).join('')
}

/**
 * 将任务总量拆分到已选部门。
 * 平均模式按商和余数分配，余数从列表前部依次加 1，保证总和严格等于输入总量；
 * 手动模式生成数量为 0 的行供后续编辑，避免预填总量导致实际下发数量被误认为已确认。
 * 每一行还会快照当前区域、执行时间和方案的检测品种/项目，后续修改筛选条件不会反向覆盖已编辑行。
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
        const quantity = isAverage ? avg + (index < remain ? 1 : 0) : 0 // 手动分配初始为 0
        return {
            deptId: orgId,
            subjectId: orgId,
            dept: org?.name || `机构${orgId}`,
            region,
            quantity: String(Math.max(0, quantity)),
            executionTime,
            varieties: schemeInfo.varieties || '待设置',
            items: schemeInfo.items || '待设置'
        }
    })
}

/** 兼容任务行中部门 ID 或部门名称两种数据形式，解析最终下发部门。 */
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

// 核心修复：监听选中机构变化，实时同步任务列表行
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
                    varieties: schemeInfo.varieties || '待设置',
                    items: schemeInfo.items || '待设置'
                })
            }
        })
        taskList.value = filteredList
    },
    { deep: true }
)
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
//             const data = JSON.parse(window.sessionStorage.getItem('planInfo')) || {}
//             taskForm.quantity = data.sampleCount || 0
//         }
//     }
// )

const handleCancel = () => {
    router.back()
}

/**
 * 校验拆分数量并提交子任务列表。
 * 将页面中的执行时间文本、区域和数量转换成后端任务拆分结构；只有存在承担部门且数量大于 0 的行
 * 才会进入 subTaskSplits。提交前校验总量不超过方案额度，提交后由服务端作为最终并发和重复下发校验点。
 * 成功延迟返回用于让用户看到结果提示，失败时保留任务拆分表，方便修改后再次下发。
 */
const handleSubmit = async () => {
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

    const subTaskSplits = rows
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

    if (!subTaskSplits.length) {
        ElMessage.warning('任务拆分数据不完整，请检查承担单位和检测数量')
        return
    }

    try {
        await DetectionTaskApi.splitSubTasks({
            parentTaskId: planId,
            subTaskSplits
        })

        ElMessage.success('任务创建及下发成功')
        setTimeout(() => {
            router.back()
        }, 1500)
    } catch (error) {
        console.error('任务下发失败', error)
        ElMessage.error('任务下发失败')
    }
}

// 页面初始化
onMounted(() => {
    loadOrgOptions()
    loadSchemeDetail()
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
    background: #fff;
    border-radius: 6px;
    gap: 20px;
}

/* 方案信息卡片 (原型设计) */
.scheme-info-card {
    background: #fff;
    padding: 30px 40px;
    border-bottom: 1px solid #f0f0f0;

    .task-title {
        font-size: 28px;
        font-weight: 500;
        color: #1a1a1a;
        margin: 0 0 24px 0;
        letter-spacing: -0.5px;

        .task-no {
            font-size: 24px;
            color: #333;
        }
    }
}

.info-detail-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .info-row {
        display: flex;
        align-items: center;
        font-size: 16px;
        line-height: 1.5;

        .info-label {
            width: 100px;
            color: #333;
            flex-shrink: 0;
        }

        .info-value {
            color: #333;

            &.highlight {
                color: #00b3ed;
            }

            .sub-no {
                margin-left: 8px;
            }
        }
    }
}

/* 内容卡片 */
.content-card {
    background: transparent;
    padding: 24px 40px;
    flex: 1;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;
}

/* 步骤区域 */
.step-section {
    margin-bottom: 40px;
    padding-bottom: 40px;
    border-bottom: 1px solid #eee;

    &:last-of-type {
        border-bottom: none;
    }
}

.step-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;
}

.full-width {
    width: 100%;
}

.filter-form-inline {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.filter-select {
    width: 220px !important;
}

/* 搜索框 */
.search-box {
    margin-bottom: 14px;

    .search-input {
        max-width: 430px;

        :deep(.el-input__wrapper) {
            border-width: 0px !important;
            height: 40px !important;
            background: #fff;
            box-shadow: 0 0 0 1px #dcdfe6 inset !important;

            &.is-focus {
                box-shadow: 0 0 0 1px #00b3ed inset !important;
            }
        }
    }
}

/* 机构列表 */
.org-list {
    margin-top: 16px;
    padding: 20px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;

    .org-item {
        padding: 10px 0;
    }

    .check-all-item {
        padding-bottom: 16px;
        margin-bottom: 16px;
        border-bottom: 1px solid #eee;
    }

    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #00b3ed;
        border-color: #00b3ed;
    }

    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
        color: #00b3ed;
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
    gap: 16px;

    .config-label {
        font-size: 15px;
        color: #333;
        white-space: nowrap;
        min-width: 100px;
    }

    .quantity-input {
        width: 160px;
    }

    .warning-text {
        font-size: 14px;
        color: #999;
    }

    :deep(.el-radio__input.is-checked .el-radio__inner) {
        border-color: #00b3ed;
        background: #00b3ed;
    }

    :deep(.el-radio__input.is-checked + .el-radio__label) {
        color: #00b3ed;
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
            /* 超额时即使禁用也显示淡红色背景 */
        }
    }
}

.error-text {
    color: #f56c6c !important;
}
</style>
