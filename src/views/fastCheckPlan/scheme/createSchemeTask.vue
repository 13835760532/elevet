<template>
    <div class="page-container">
        <PageBack />

        <!-- 头部标题 -->
        <div class="header-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">创建检测任务</h2>
            </div>
            <p class="header-desc">支持检测方案按承检机构和检测行任务拆分，配置任务执行时间、检测数量、检测结果提交要求（检测品种、检测项目、检测地区、检测频率）</p>
        </div>

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
                    <span class="value link-text">{{ schemeInfo.type }}</span>
                </div>
                <div class="info-item">
                    <span class="label">剩余发放</span>
                    <span class="value">{{ schemeInfo.category }}</span>
                </div>
                <div class="info-item">
                    <span class="label">执行时间</span>
                    <span class="value link-text">{{ schemeInfo.executionTime }}</span>
                </div>
            </div>
        </div>

        <!-- 任务拆分表单 -->
        <div class="content-card">
            <h3 class="section-title">任务拆分</h3>

            <!-- 步骤1: 选择任务承担单位 -->
            <div class="step-section">
                <h4 class="step-title">1、选择任务承担单位</h4>
                <el-row :gutter="16" style="margin-bottom: 10px;">
                    <el-col :span="8">
                        <el-form-item label="单位类型" style="margin-bottom: 0;">
                            <el-select v-model="taskForm.unitType" placeholder="单位类型" class="full-width"
                                @change="handleProvinceChange">
                                <el-option label="承检机构" value="beijing" />
                                <el-option label="检测机构" value="tianjin" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="16">
                    <el-col :span="8">
                        <el-form-item label="所属区域" style="margin-bottom: 0;">
                            <el-select v-model="taskForm.province" placeholder="选择省份" class="full-width"
                                @change="handleProvinceChange">
                                <el-option label="北京市" value="beijing" />
                                <el-option label="天津市" value="tianjin" />
                                <el-option label="上海市" value="shanghai" />
                                <el-option label="广东省" value="guangdong" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-select v-model="taskForm.city" placeholder="请选择市" class="full-width"
                            :disabled="!taskForm.province">
                            <el-option label="市辖区" value="city" />
                        </el-select>
                    </el-col>
                    <el-col :span="8">
                        <el-select v-model="taskForm.district" placeholder="请选择区/县" class="full-width"
                            :disabled="!taskForm.city">
                            <el-option label="朝阳区" value="chaoyang" />
                            <el-option label="海淀区" value="haidian" />
                        </el-select>
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
                        <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">
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
                        <el-input v-model="taskForm.quantity" placeholder="1000" type="number" class="quantity-input" />
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
            <div class="step-section">
                <h4 class="step-title">3、设置具体检测要求</h4>
                <div class="summary-info">
                    <span class="summary-text">已选任务分配量：</span>
                    <span class="summary-value">20000</span>
                    <span class="divider">|</span>
                    <span class="summary-text">方案检测总量：</span>
                    <span class="summary-value">50000</span>
                    <el-button type="primary" @click="handleHighRiskQuery" class="batch-config-btn">
                        高风险查询
                    </el-button>
                </div>

                <div class="task-table-wrapper">
                    <el-table :data="displayTaskList" :header-cell-style="headerCellStyle" border>
                        <el-table-column label="序号" width="60" align="center">
                            <template #default="scope">
                                <div v-if="scope.row.isAdd" class="add-row-btn" @click="handleAddTaskRow">
                                    <el-icon :size="20" color="#00B3ED">
                                        <CirclePlusFilled />
                                    </el-icon>
                                </div>
                                <span v-else>{{ scope.$index + 1 }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="承担单位" prop="dept" width="150" show-overflow-tooltip>
                            <template #default="scope">
                                <span v-if="!scope.row.isAdd">{{ scope.row.dept }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="检测地区" prop="region" width="100" align="center">
                            <template #default="scope">
                                <span v-if="!scope.row.isAdd">{{ scope.row.region }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="检测数量" prop="quantity" width="100" align="center">
                            <template #default="scope">
                                <span v-if="!scope.row.isAdd">{{ scope.row.quantity }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="执行时间" prop="executionTime" width="200" align="center">
                            <template #default="scope">
                                <span v-if="!scope.row.isAdd" class="link-text">{{ scope.row.executionTime }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="检测品种" prop="varieties" align="center">
                            <template #default="scope">
                                <span v-if="!scope.row.isAdd" class="link-text">{{ scope.row.varieties }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="检测项目" prop="items" align="center">
                            <template #default="scope">
                                <span v-if="!scope.row.isAdd" class="link-text">{{ scope.row.items }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="130" align="center" fixed="right">
                            <template #default="scope">
                                <template v-if="!scope.row.isAdd">
                                    <span class="link-text" @click="handleConfigTask(scope.row)">设置要求</span>
                                    <span class="link-text ml10" style="color: #F56C6C;"
                                        @click="handleDeleteTask(scope.$index)">删除</span>
                                </template>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="footer-actions">
                <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
                <el-button type="primary" @click="handleSubmit" class="btn-submit">创建任务并下发</el-button>
            </div>
        </div>

        <!-- 检测要求弹窗 -->
        <RequirementDialog v-model="showRequirementDialog" :task-data="currentTaskData"
            @confirm="handleRequirementConfirm" />

        <!-- 高风险查询弹窗 -->
        <HighRiskDialog v-model="showHighRiskDialog" @confirm="handleHighRiskConfirm" />
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, CirclePlusFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import RequirementDialog from '@/components/RequirementDialog';
import HighRiskDialog from '@/components/HighRiskDialog/index.vue';

const router = useRouter();

const schemeInfo = reactive({
    no: 'FA-SC-202601-001',
    name: '2026年1月北京市、天津市蔬菜快速检测工作方案',
    dept: '农业农村部农产品质量监督检验测试中心（上海）',
    type: '快速检测',
    category: '1000',
    executionTime: '2024年12月1日至2024年12月28日'
});

const taskForm = reactive({
    unitType: '',
    province: '',
    city: '',
    district: '',
    quantity: '',
    distributionType: 'average',
    startDate: '',
    endDate: ''
});

const searchKeyword = ref('');
const selectedOrgs = ref([]);
const showRequirementDialog = ref(false);
const showHighRiskDialog = ref(false);
const currentTaskData = ref(null);

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

const displayTaskList = computed(() => {
    return [...taskList.value, { isAdd: true }];
});

const handleAddTaskRow = () => {
    taskList.value.push({
        dept: '待设置',
        region: '待设置',
        quantity: '0',
        executionTime: '待设置',
        varieties: '待设置',
        items: '待设置'
    });
};

const handleDeleteTask = (index) => {
    taskList.value.splice(index, 1);
};

const headerCellStyle = {
    backgroundColor: '#FFFFFF',
    color: '#333',
    fontWeight: '500',
    height: '50px',
    borderBottom: '1px solid #f0f0f0'
};

const handleProvinceChange = () => {
    taskForm.city = '';
    taskForm.district = '';
};

const handleHighRiskQuery = () => {
    showHighRiskDialog.value = true;
};

const handleHighRiskConfirm = (selectedItems) => {
    console.log('High risk selected:', selectedItems);
    ElMessage.success(`已设置${selectedItems.length}项高风险检测品种及要求`);

    // 如果需要可以将选中的品种和检测项填充到列表中
};

const handleConfigTask = (row) => {
    currentTaskData.value = row;
    showRequirementDialog.value = true;
};

const handleRequirementConfirm = (selectedItems) => {
    console.log('Selected requirements:', selectedItems);
    ElMessage.success('检测要求设置成功');
};

const handleCancel = () => {
    router.back();
};

const handleSubmit = () => {
    if (selectedOrgs.value.length === 0) {
        ElMessage.warning('请选择任务承担单位');
        return;
    }
    if (!taskForm.quantity) {
        ElMessage.warning('请输入任务检测量');
        return;
    }
    ElMessage.success('任务创建成功');
    setTimeout(() => {
        router.back();
    }, 1500);
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}


/* 方案信息卡片 */
.scheme-info-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px 32px;
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
        color: #333;

        &.link-text {
            color: #00B3ED;
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: 32px 40px;
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

/* 汇总信息 */
.summary-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #F0F9FF;
    border-radius: 8px;

    .summary-text {
        font-size: 14px;
        color: #666;
    }

    .summary-value {
        font-size: 14px;
        font-weight: 600;
        color: #00B3ED;
    }

    .divider {
        color: #D1D5DB;
    }

    .batch-config-btn {
        margin-left: auto;
        height: 36px;
        padding: 0 20px;
    }
}

/* 任务表格 */
.task-table-wrapper {
    .link-text {
        color: #00B3ED;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .ml10 {
        margin-left: 10px;
    }

    .add-row-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.1);
        }
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
