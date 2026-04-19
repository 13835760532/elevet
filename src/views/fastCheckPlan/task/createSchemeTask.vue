<template>
    <div class="page-container">
        <!-- 头部标题 -->
        <pageHeader title="任务转派" desc="对接收的任务进行转派分发" />
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

                    <el-row :gutter="16" style="margin-bottom: 20px;">
                        <el-col :span="12">
                            <el-form-item label="所属区域" style="margin-bottom: 0;">
                                <AreaCascader class="full-width" v-model="areaPath" placeholder="请选择所属地区" @select="(val) => {
                                    taskForm.province = val.province;
                                    taskForm.city = val.city;
                                    taskForm.district = val.district;
                                }" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <div class="search-box">
                        <el-input v-model="searchKeyword" placeholder="输入任务机构或被检人员或检测单位" class="search-input">
                            <template #suffix>
                                <el-icon class="search-icon">
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>

                    <div class="org-list">
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
                                    class="date-picker" />
                                <span class="date-separator">至</span>
                                <el-date-picker v-model="taskForm.endDate" type="date" placeholder="结束日期"
                                    class="date-picker" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 步骤3: 设置具体检测要求 -->
                <DetectionRequirementSection v-model="taskList" :sample-count="schemeInfo.sampleCount" />

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
import { ref, reactive, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import DetectionRequirementSection from '@/components/DetectionRequirementSection/index.vue';
import AreaCascader from '@/components/AreaCascader/index.vue';
import * as DetectionPlanApi from '@/api/agri/detectionPlan/index';
import { useDict, DICT_TYPE } from '@/hooks/web/useDict';
import { onMounted } from 'vue';

const router = useRouter();
const route = useRoute();
const planId = Number(route.query.id) || 1;

const schemeInfo = reactive({
    no: '',
    name: '',
    dept: '',
    type: '',
    category: '--',
    executionTime: '--',
    sampleCount: 0
});

// 使用字典
const { getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE, 'int')
const { getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str')

// 加载方案详情
const loadSchemeDetail = async () => {
    if (!planId) return
    try {
        const data = await DetectionPlanApi.getDetectionPlan(planId)
        schemeInfo.no = data.planCode
        schemeInfo.name = data.planName
        schemeInfo.dept = data.issuerDeptName || `部门ID: ${data.issuerDeptId}`
        schemeInfo.type = getPlanTypeLabel(data.planType)
        schemeInfo.category = data.targetCategory ? getProductCategoryLabel(data.targetCategory) : '--'
        schemeInfo.executionTime = `${data.planStartDate || ''} 至 ${data.planEndDate || ''}`
        schemeInfo.sampleCount = data.sampleCount || 0

        // 设置任务默认时间
        taskForm.startDate = data.planStartDate
        taskForm.endDate = data.planEndDate
    } catch (error) {
        console.error('获取方案详情失败:', error)
        ElMessage.error('加载方案详情失败')
    }
}

const taskForm = reactive({
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

const checkAll = ref(false);
const isIndeterminate = ref(false);
const orgOptions = ref([
    { id: 'org1', name: '北京市一级抽检机构' },
    { id: 'org2', name: '北京市二级抽检机构' },
    { id: 'org3', name: '北京市三级抽检机构' },
    { id: 'org4', name: '北京市四级抽检机构' },
    { id: 'org5', name: '北京市五环抽检机构' }
]);

const handleCheckAllChange = (val) => {
    selectedOrgs.value = val ? orgOptions.value.map(org => org.id) : [];
    isIndeterminate.value = false;
};

const handleCheckedOrgsChange = (value) => {
    const checkedCount = value.length;
    checkAll.value = checkedCount === orgOptions.value.length;
    isIndeterminate.value = checkedCount > 0 && checkedCount < orgOptions.value.length;
};

const taskList = ref([
    {
        dept: '杭州市检测所A',
        region: '北京',
        quantity: '2000',
        executionTime: '2025-10-22～2025-10-09',
        varieties: '芹菜、黄瓜、正菜...',
        items: '甲拌磷、甲基...'
    },
    {
        dept: '杭州市检测所B',
        region: '上海',
        quantity: '2000',
        executionTime: '2025-10-22～2025-10-09',
        varieties: '芹菜、黄瓜、正菜...',
        items: '甲拌磷、甲基...'
    },
    {
        dept: '杭州市检测所C',
        region: '广州',
        quantity: '2000',
        executionTime: '2025-10-22～2025-10-09',
        varieties: '芹菜、黄瓜、正菜...',
        items: '甲拌磷、甲基...'
    }
]);

const handleCancel = () => {
    router.back();
};

const handleSubmit = async () => {
    if (selectedOrgs.value.length === 0 && taskList.value.length === 0) {
        ElMessage.warning('请选择任务承担单位或分配任务');
        return;
    }

    const taskSplits = taskList.value.map(item => {
        let startDate = undefined;
        let endDate = undefined;

        if (item.executionTime && item.executionTime !== '待设置') {
            const times = item.executionTime.split('～');
            if (times.length === 2) {
                startDate = times[0].trim();
                endDate = times[1].trim();
            }
        }

        return {
            assignDeptId: item.deptId || 1, // 当前列表数据中如果没有给出 id 暂时用 1 替代
            sampleCount: Number(item.quantity) || 0,
            subjectId: item.subjectId || 1, // 当前接口必须项
            taskType: 1,
            detectionVarieties: item.varieties !== '待设置' ? item.varieties : undefined,
            detectionItems: item.items !== '待设置' ? item.items : undefined,
            detectionArea: item.region !== '待设置' ? item.region : undefined,
            startDate,
            endDate
        };
    });

    try {
        await DetectionPlanApi.splitPlanTasks({
            planId: planId,
            taskSplits: taskSplits
        });

        ElMessage.success('任务创建及下发成功');
        setTimeout(() => {
            router.back();
        }, 1500);
    } catch (error) {
        console.error('任务下发失败', error);
    }
};
// 页面初始化
onMounted(() => {
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

/* 搜索框 */
.search-box {
    margin-top: 16px;

    .search-input {
        max-width: 600px;

        :deep(.el-input__wrapper) {
            background: #F9FAFB;
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
    background: #F9FAFB;
    border-radius: 8px;

    .org-item {
        padding: 8px 0;
    }

    .check-all-item {
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid #E5E7EB;
    }
}

/* 分配配置 */
.allocation-config {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
        color: #F59E0B;
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
