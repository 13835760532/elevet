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

                    <el-form label-width="80px" label-position="right">
                        <el-row :gutter="16" style="margin-bottom: 20px;">
                            <el-col :span="16">
                                <el-form-item label="所属区域" style="margin-bottom: 0; align-items: center;">
                                    <AreaCascader class="full-width" v-model="areaPath" placeholder="请选择所属地区" @select="(val) => {
                                        taskForm.province = val.province;
                                        taskForm.city = val.city;
                                        taskForm.district = val.district;
                                    }" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>

                    <div class="search-box">
                        <el-input v-model="searchKeyword" placeholder="输入任务机构或被检人员或检测单位" class="search-input"
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
                    <h4 class="step-title">2、设置任务分配周期</h4>
                    <div class="allocation-config">
                        <div class="config-row">
                            <span class="config-label">任务检测量：</span>
                            <el-input v-model="taskForm.quantity" placeholder="1000" type="number"
                                class="quantity-input" />
                            <span class="warning-text">取值规则方案检测总量-已分发量</span>
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
                                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker" />
                                <span class="date-separator">至</span>
                                <el-date-picker v-model="taskForm.endDate" type="date" placeholder="结束日期"
                                    format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker" />
                            </div>
                        </div>
                    </div>
                </div>

                <DetectionRequirementSection v-model="taskList" :sample-count="taskForm.quantity"
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
import { ref, reactive, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import DetectionRequirementSection from '@/components/DetectionRequirementSection/index.vue';
import AreaCascader from '@/components/AreaCascader/index.vue';
import * as DetectionPlanApi from '@/api/agri/detectionPlan/index';
import * as DeptApi from '@/api/system/dept/index';
import * as DetectionTaskApi from '@/api/agri/detectionTask/index';
import { useDict, DICT_TYPE } from '@/hooks/web/useDict';
import { onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const planId = Number(route.query.id) || 1;

const schemeInfo = reactive({
    no: '',      // 任务编号
    name: '',    // 任务名称
    planNo: '',  // 方案编号
    planName: '',// 方案名称
    dept: '',
    type: '',
    category: '--',
    executionTime: '--',
    executionTimeLabel: '--',
    sampleCount: 0
});

// 使用字典
const { getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE, 'int')
const { getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str')

// 加载方案详情
const loadSchemeDetail = async () => {
    if (!planId) return
    try {
        const data = await DetectionTaskApi.getDetectionTask(planId)
        schemeInfo.no = data.taskCode
        schemeInfo.name = data.taskName
        schemeInfo.planNo = data.planCode
        schemeInfo.planName = data.planName
        schemeInfo.dept = data.issuerDeptName || `部门ID: ${data.issuerDeptId}`
        schemeInfo.type = getPlanTypeLabel(data.taskType)
        schemeInfo.category = data.targetCategory ? getProductCategoryLabel(data.targetCategory) : '--'
        schemeInfo.executionTime = `${data.startDate || ''} 至 ${data.endDate || ''}`
        schemeInfo.executionTimeLabel = data.startDate && data.endDate
            ? `${data.startDate.slice(0, 4)}年${data.startDate.slice(5, 7)}月${data.startDate.slice(8, 10)}日至${data.endDate.slice(0, 4)}年${data.endDate.slice(5, 7)}月${data.endDate.slice(8, 10)}日`
            : '--'
        schemeInfo.sampleCount = data.sampleCount || 0

        // 设置任务默认时间
        taskForm.startDate = data.startDate ? String(data.startDate).slice(0, 10) : ''
        taskForm.endDate = data.endDate ? String(data.endDate).slice(0, 10) : ''
    } catch (error) {
        console.error('获取任务详情失败:', error)
        ElMessage.error('加载任务详情失败')
    }
}

const taskForm = reactive({
    systemType: 1,
    deptType: 1,
    province: '',
    city: '',
    district: '',
    quantity: '',
    distributionType: 'average',
    startDate: '',
    endDate: ''
});

const areaPath = ref([]);

const searchKeyword = ref('');
const selectedOrgs = ref([]);
const orgLoading = ref(false);

const checkAll = ref(false);
const isIndeterminate = ref(false);
const orgOptions = ref([]);
const orgMapById = computed(() => {
    const map = new Map();
    orgOptions.value.forEach((org) => map.set(org.id, org));
    return map;
});

const selectedOrgOptions = computed(() => {
    return selectedOrgs.value.map(id => orgMapById.value.get(id)).filter(Boolean);
});

const getAreaFilter = () => {
    const path = Array.isArray(areaPath.value) ? areaPath.value : [];
    if (!path.length) return {};
    const levelMap = [1, 2, 3];
    const areaLevel = levelMap[Math.min(path.length, 3) - 1];
    const areaCode = String(path[path.length - 1] || '');
    if (!areaCode) return {};
    return { areaCode, areaLevel };
};

const reconcileSelectionState = () => {
    const currentIds = new Set(orgOptions.value.map((item) => item.id));
    selectedOrgs.value = selectedOrgs.value.filter((id) => currentIds.has(id));
    const checkedCount = selectedOrgs.value.length;
    checkAll.value = checkedCount > 0 && checkedCount === orgOptions.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length;
};

const loadOrgOptions = async () => {
    orgLoading.value = true;
    try {
        const params = {
            deptType: taskForm.deptType,
            keyword: searchKeyword.value?.trim() || undefined,
            ...getAreaFilter()
        };
        const list = await DeptApi.searchDeptList(params);
        orgOptions.value = (list || []).map((item) => ({
            id: item.id,
            name: item.name
        }));
        reconcileSelectionState();
    } catch (error) {
        console.error('加载检测机构失败:', error);
        ElMessage.error('加载检测机构失败');
    } finally {
        orgLoading.value = false;
    }
};

const handleCheckAllChange = (val) => {
    selectedOrgs.value = val ? orgOptions.value.map(org => org.id) : [];
    isIndeterminate.value = false;
};

const handleCheckedOrgsChange = (value) => {
    const checkedCount = value.length;
    checkAll.value = checkedCount === orgOptions.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length;
};

const buildDefaultExecutionTime = () => {
    if (!taskForm.startDate || !taskForm.endDate) return '待设置';
    try {
        const s = typeof taskForm.startDate === 'string' ? taskForm.startDate.slice(0, 10) : new Date(taskForm.startDate).toISOString().slice(0, 10);
        const e = typeof taskForm.endDate === 'string' ? taskForm.endDate.slice(0, 10) : new Date(taskForm.endDate).toISOString().slice(0, 10);
        return `${s}～${e}`;
    } catch (e) {
        return `${taskForm.startDate}～${taskForm.endDate}`;
    }
};

const buildDefaultDetectionArea = () => {
    return [taskForm.province, taskForm.city, taskForm.district].filter(Boolean).join('');
};

const buildTaskRowsBySelectedOrgs = () => {
    const orgIds = selectedOrgs.value || [];
    if (!orgIds.length) return [];

    const total = Number(taskForm.quantity) || 0;
    const isAverage = taskForm.distributionType === 'average';
    const avg = isAverage && orgIds.length ? Math.floor(total / orgIds.length) : 0;
    const remain = isAverage && orgIds.length ? total % orgIds.length : 0;
    const executionTime = buildDefaultExecutionTime();
    const region = buildDefaultDetectionArea() || '待设置';

    return orgIds.map((orgId, index) => {
        const org = orgMapById.value.get(orgId);
        const quantity = isAverage ? avg + (index < remain ? 1 : 0) : total;
        return {
            deptId: orgId,
            subjectId: orgId,
            dept: org?.name || `机构${orgId}`,
            region,
            quantity: String(Math.max(0, quantity)),
            executionTime,
            varieties: '待设置',
            items: '待设置'
        };
    });
};

const resolveDeptId = (item) => {
    if (item.deptId) return Number(item.deptId);
    if (item.dept) {
        const matched = orgOptions.value.find((org) => org.name === item.dept);
        if (matched?.id) return Number(matched.id);
    }
    return Number(selectedOrgs.value[0]) || 0;
};

let searchTimer = null;
watch(
    () => searchKeyword.value,
    () => {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            loadOrgOptions();
        }, 300);
    }
);

watch(
    () => taskForm.deptType,
    () => {
        loadOrgOptions();
    }
);

watch(
    () => areaPath.value,
    () => {
        loadOrgOptions();
    },
    { deep: true }
);

const taskList = ref([]);

const handleCancel = () => {
    router.back();
};

const handleSubmit = async () => {
    if (selectedOrgs.value.length === 0 && taskList.value.length === 0) {
        ElMessage.warning('请选择任务承担单位');
        return;
    }

    const rows = taskList.value.length ? taskList.value : buildTaskRowsBySelectedOrgs();
    if (!rows.length) {
        ElMessage.warning('请先在第3步配置任务拆分');
        return;
    }

    const subTaskSplits = rows.map(item => {
        let startDate = undefined;
        let endDate = undefined;

        if (item.executionTime && item.executionTime !== '待设置') {
            const times = item.executionTime.split('～');
            if (times.length === 2) {
                startDate = times[0].trim();
                endDate = times[1].trim();
            }
        }

        const assignDeptId = resolveDeptId(item);
        const sampleCount = Number(item.quantity) || 0;
        return {
            assignDeptId,
            sampleCount,
            subjectId: Number(item.subjectId) || assignDeptId,
            taskType: 1,
            detectionVarieties: item.varieties !== '待设置' ? item.varieties : undefined,
            detectionItems: item.items !== '待设置' ? item.items : undefined,
            detectionArea: item.region !== '待设置' ? item.region : (buildDefaultDetectionArea() || undefined),
            startDate: startDate || taskForm.startDate || undefined,
            endDate: endDate || taskForm.endDate || undefined
        };
    }).filter(item => item.assignDeptId && item.sampleCount > 0);

    if (!subTaskSplits.length) {
        ElMessage.warning('任务拆分数据不完整，请检查承担单位和检测数量');
        return;
    }

    try {
        await DetectionTaskApi.splitSubTasks({
            parentTaskId: planId,
            subTaskSplits
        });

        ElMessage.success('任务创建及下发成功');
        setTimeout(() => {
            router.back();
        }, 1500);
    } catch (error) {
        console.error('任务下发失败', error);
        ElMessage.error('任务下发失败');
    }
};
// 页面初始化
onMounted(() => {
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
                color: #00B3ED;
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

/* 搜索框 */
.search-box {
    margin-bottom: 24px;

    .search-input {
        max-width: 500px;

        :deep(.el-input__wrapper) {
            background: #fff;
            box-shadow: 0 0 0 1px #dcdfe6 inset !important;

            &.is-focus {
                box-shadow: 0 0 0 1px #00B3ED inset !important;
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
        background-color: #00B3ED;
        border-color: #00B3ED;
    }

    :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
        color: #00B3ED;
    }
}

/* 分配配置 */
.allocation-config {
    display: flex;
    flex-direction: column;
    gap: 24px;
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
        border-color: #00B3ED;
        background: #00B3ED;
    }

    :deep(.el-radio__input.is-checked + .el-radio__label) {
        color: #00B3ED;
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
    border-top: 1px dashed #D1D5DB;

    .el-button {
        min-width: 140px;
        height: 44px;
        border-radius: 8px;
        font-size: 14px;
    }

    .btn-cancel {
        background: #fff;
        border-color: #D1D5DB;
        color: #333;
    }

    .btn-submit {
        background: #00B3ED;
        border-color: #00B3ED;
    }
}
</style>
