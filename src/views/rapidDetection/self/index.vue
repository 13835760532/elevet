<template>
    <div class="page-container table-container">
        <!-- 快速检测标题 -->
        <div class="header-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">快速检测</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form" label-position="left">
                    <el-form-item label="样品">
                        <el-input v-model="queryParams.sampleName" placeholder="请输入样品编号或样品名称"
                            class="custom-input w180" />
                    </el-form-item>
                    <el-form-item label="承担单位">
                        <el-select v-model="queryParams.unit" placeholder="请选择" class="custom-select w180">
                            <el-option label="全部" value="" />
                            <el-option label="检测机构A" value="1" />
                            <el-option label="检测机构B" value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品分类">
                        <el-select v-model="queryParams.category" placeholder="请选择" class="custom-select w180">
                            <el-option label="全部" value="" />
                            <el-option label="蔬菜" value="vegetable" />
                            <el-option label="水果" value="fruit" />
                            <el-option label="水产品" value="seafood" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="抽检机构">
                        <el-select v-model="queryParams.testOrg" placeholder="请选择" class="custom-select w180">
                            <el-option label="全部" value="" />
                            <el-option label="机构一" value="1" />
                            <el-option label="机构二" value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="检测状态">
                        <el-select v-model="queryParams.status" placeholder="请选择" class="custom-select w180">
                            <el-option label="全部" value="" />
                            <el-option label="未检测" value="0" />
                            <el-option label="已检测" value="1" />
                            <el-option label="失败" value="2" />
                        </el-select>
                    </el-form-item>

                    <div class="query-btns">
                        <el-button @click="handleReset" class="reset-btn">重置</el-button>
                        <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                    </div>
                </el-form>
            </div>
        </div>

        <!-- Tabs 和数据区域 -->
        <div class="content-card">
            <div class="tabs-row">
                <div class="tab-group">
                </div>
                <div class="table-operate-action-btns-row">
                    <el-button @click="handleExport">导出</el-button>
                    <el-button @click="handleSetRule">设置数据上报规则</el-button>
                    <el-button type="primary" @click="handleBatchImport" class="primary-btn">检测批量导入</el-button>
                    <el-button type="primary" @click="handleSingleInput" class="primary-btn">检测单条录入</el-button>
                </div>
            </div>
            <p class="import-tip">*支持第三方检测结果批量 导入</p>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="样品编号" prop="sampleNo" width="130" align="center" />
                    <el-table-column label="样品名称" prop="sampleName" width="80" align="center" />
                    <el-table-column label="样品来源" prop="source" width="100" align="center" />
                    <el-table-column label="产品分类" prop="category" width="80" align="center" />
                    <el-table-column label="产地" prop="origin" width="80" align="center" />
                    <el-table-column label="被检主体名称" prop="subjectName" min-width="110" show-overflow-tooltip />
                    <el-table-column label="抽检地区" prop="region" width="100" align="center" />
                    <el-table-column label="检测机构" prop="testOrg" min-width="130" show-overflow-tooltip />
                    <el-table-column label="检测时间" prop="testTime" width="100" align="center" />
                    <el-table-column label="检测项目" prop="testItem" min-width="100" show-overflow-tooltip />
                    <el-table-column label="检测结果" prop="testResult" width="100" align="center" show-overflow-tooltip />
                    <el-table-column label="是否公开" prop="isPublic" width="80" align="center" />
                    <el-table-column label="检测状态" prop="testStatus" width="80" align="center">
                        <template #default="scope">
                            <span :class="['status-tag', statusMap[scope.row.testStatus]?.class]">
                                {{ statusMap[scope.row.testStatus]?.text }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="120" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <template v-if="scope.row.testStatus === 0">
                                    <span class="table-edit-operate" @click="handleTest(scope.row)">去检测</span>
                                    <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                                </template>
                                <template v-else-if="scope.row.testStatus === 1">
                                    <span class="table-view-operate" @click="handleView(scope.row)">查看详情</span>
                                </template>
                                <template v-else>
                                    <span class="table-edit-operate" @click="handleRetest(scope.row)">重新检测</span>
                                </template>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                    :total="total" background layout="prev, pager, next" class="custom-pagination" />
            </div>
        </div>

        <!-- 设置数据上报规则弹窗 -->
        <el-dialog v-model="ruleDialogVisible" width="500px" :show-close="true" class="rule-dialog">
            <template #header>
                <div class="dialog-header">
                    <h3 class="dialog-title">自主检测数据上报规则</h3>
                    <p class="dialog-desc">自主检测默认是不公开，设定开关与时间进行公开</p>
                </div>
            </template>

            <div class="rule-form">
                <div class="form-item">
                    <label class="form-label">检测结果面向政府公开</label>
                    <el-radio-group v-model="ruleForm.isPublic">
                        <el-radio :value="true">是</el-radio>
                        <el-radio :value="false">否</el-radio>
                    </el-radio-group>
                </div>

                <div class="form-item" v-if="ruleForm.isPublic">
                    <label class="form-label">公开时间</label>
                    <el-date-picker v-model="ruleForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px;"
                        class=" date-range-picker" />
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="ruleDialogVisible = false" class="cancel-btn">取消</el-button>
                    <el-button type="primary" @click="handleSaveRule" class="confirm-btn">修改</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('self');

const queryParams = reactive({
    sampleName: '',
    unit: '',
    category: '',
    testOrg: '',
    status: ''
});

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

const total = ref(28);

const statusMap = {
    0: { text: '未检测', class: 'status-pending' },
    1: { text: '已检测', class: 'status-done' },
    2: { text: '失败', class: 'status-failed' }
};

const tableList = ref([
    {
        sampleNo: 'RW2024213213_1',
        sampleName: '红豆',
        source: '田间/市场/其他',
        category: '蔬菜',
        origin: '山东济南',
        subjectName: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '盒马鲜生',
        testTime: '-',
        testItem: '对硫磷、甲拌磷...',
        testResult: '-',
        isPublic: '公开',
        testStatus: 0
    },
    {
        sampleNo: 'RW2024213213_1',
        sampleName: '草莓',
        source: '田间/市场/其他',
        category: '水果',
        origin: '山东济南',
        subjectName: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '北京市平谷区农业综合检验检测中心',
        testTime: '2023-09-09',
        testItem: '对硫磷、甲拌磷...',
        testResult: '阴性',
        isPublic: '不公开',
        testStatus: 1
    },
    {
        sampleNo: 'RW2024213213_1',
        sampleName: '桂鱼',
        source: '田间/市场/其他',
        category: '水产品',
        origin: '辽宁大连',
        subjectName: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '北京果村蔬菜专业合作社',
        testTime: '2023-09-09',
        testItem: '对硫磷、甲拌磷...',
        testResult: '结果异常（二维码模糊）',
        isPublic: '公开',
        testStatus: 2
    }
]);



const handleTabChange = (tab) => {
    activeTab.value = tab;
    if (tab === 'task') {
        router.push('/rapidDetection/task');
    }
};

const handleQuery = () => {
    console.log('Query:', queryParams);
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
};

const handleExport = () => {
    console.log('Export');
};

const handleExportTop = () => {
    console.log('Export Top');
};

// 数据上报规则弹窗
const ruleDialogVisible = ref(false);
const ruleForm = reactive({
    isPublic: true,
    dateRange: []
});

const handleSetRule = () => {
    ruleDialogVisible.value = true;
};

const handleSaveRule = () => {
    console.log('Save Rule:', ruleForm);
    ruleDialogVisible.value = false;
};

const handleBatchImport = () => {
    console.log('Batch Import');
    router.push('/rapidDetection/batchImportData');
};

const handleSingleInput = () => {
    console.log('Single Input');
    router.push('/rapidDetection/create');
};

const handleTest = (row) => {
    console.log('Test:', row);
    router.push('/rapidDetection/create');
};

const handleDelete = (row) => {
    console.log('Delete:', row);

};

const handleView = (row) => {
    console.log('View:', row);
    router.push('/rapidDetection/taskResult');
};

const handleRetest = (row) => {
    console.log('Retest:', row);
    router.push('/rapidDetection/create');
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

/* 头部查询卡片 */
.header-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;

    .blue-line {
        width: 4px;
        height: 16px;
        background: #00B3ED;
        border-radius: 2px;
    }

    .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}


:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
    width: 120px;
    background: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    box-shadow: none !important;
    padding: 0 12px;

    &:hover {
        border-color: #00B3ED;
    }

    &.is-focus {
        border-color: #00B3ED;
        box-shadow: 0 0 0 3px rgba(0, 179, 237, 0.1) !important;
    }
}

.custom-input {
    &.w180 {
        width: 180px;

        :deep(.el-input__wrapper) {
            width: 180px;
        }
    }
}

.custom-select {
    &.w180 {
        width: 180px !important;

        :deep(.el-select__wrapper) {
            width: 180px;
        }
    }
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
    flex: 1;
}

.tabs-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .tab-group {
        display: flex;
        gap: 0;
    }

    .tab-item {
        padding: 10px 32px;
        cursor: pointer;
        background: #E5E7EB;
        color: #333;
        font-size: 14px;
        transition: all 0.3s;

        &:first-child {
            border-radius: 4px 0 0 4px;
        }

        &:last-child {
            border-radius: 0 4px 4px 0;
        }

        &.active {
            background: #00B3ED;
            color: #fff;
        }
    }

    .table-operate-action-btns-row {
        display: flex;
        gap: 12px;

        .el-button {
            border-radius: 8px;
        }

        .primary-btn {
            background-color: #00B3ED;
            border-color: #00B3ED;
        }
    }
}

.import-tip {
    font-size: 12px;
    color: #999;
    margin: 0 0 16px 0;
    text-align: right;
}

/* 表格 */
.table-wrapper {
    margin-bottom: 24px;
}



/* 状态标签 */
.status-tag {
    font-size: 12px;

    &.status-pending {
        color: #999;
    }

    &.status-done {
        color: #52C41A;
    }

    &.status-failed {
        color: #F5222D;
    }
}

/* 分页 */
.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 0;
}

/* 数据上报规则弹窗 */
.rule-dialog {
    :deep(.el-dialog) {
        border-radius: 16px;
        overflow: hidden;
    }

    :deep(.el-dialog__header) {
        padding: 16px 24px 0;
        border-bottom: none;
    }

    :deep(.el-dialog__body) {
        padding: 0 24px;
    }

    :deep(.el-dialog__footer) {
        padding: 16px;
        border-top: none;
    }

    :deep(.el-dialog__headerbtn) {
        top: 20px;
        right: 20px;
        font-size: 18px;
    }
}

.dialog-header {
    .dialog-title {
        font-size: 20px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 8px 0;
    }

    .dialog-desc {
        font-size: 14px;
        color: #999;
        margin: 0;
    }
}

.rule-form {
    padding: 32px 0 24px;

    .form-item {
        margin-bottom: 28px;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .form-label {
        display: block;
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 16px;
    }

    :deep(.el-radio-group) {
        display: flex;
        gap: 48px;
    }

    :deep(.el-radio) {
        .el-radio__label {
            font-size: 15px;
            color: #333;
        }

        .el-radio__inner {
            width: 18px;
            height: 18px;
            border-color: #d9d9d9;
        }

        &.is-checked {
            .el-radio__inner {
                border-color: #00B3ED;
                background: #00B3ED;
            }
        }
    }

    .date-range-picker {
        width: 300px;
        height: 44px;

        :deep(.el-input__wrapper) {
            border-radius: 8px;
            box-shadow: 0 0 0 1px #E5E7EB inset;
        }

        :deep(.el-range-separator) {
            color: #999;
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 20px;

    .cancel-btn {
        min-width: 100px;
        height: 44px;
        border-radius: 8px;
        font-size: 15px;
        border-color: #d9d9d9;
        color: #666;

        &:hover {
            border-color: #b3b3b3;
            color: #333;
        }
    }

    .confirm-btn {
        min-width: 100px;
        height: 44px;
        border-radius: 8px;
        font-size: 15px;
    }
}
</style>
