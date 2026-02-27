<template>
    <div class="page-container">
        <!-- 顶部 Tab 区域 -->
        <!-- <div class="tab-header">
            <div class="tab-group">
                <div class="tab-item" :class="{ active: activeTab === 'task' }" @click="activeTab = 'task'">任务抽检</div>
                <div class="tab-item" :class="{ active: activeTab === 'self' }" @click="activeTab = 'self'">自主检测</div>
            </div>
            <el-button @click="handleBack" class="back-btn">返回上一级</el-button>
        </div> -->
        <PageBack>
        </PageBack>

        <!-- 任务信息卡片 -->
        <div class="task-info-card">
            <h2 class="task-title">
                2026年1月北京市、天津市蔬菜快速检测-任务1
                <span class="task-code">（编号：RW20251101）</span>
            </h2>

            <div class="task-detail-grid">
                <!-- 左侧环形进度 -->
                <div class="progress-section">
                    <el-progress type="circle" :percentage="60" :width="120" color="#00B3ED" :stroke-width="10" />
                    <div class="progress-label">任务完成率</div>
                    <div class="progress-info">(600/1000)</div>
                </div>

                <!-- 右侧任务详情 -->
                <div class="info-section">
                    <div class="info-row">
                        <span class="label">所属方案</span>
                        <span class="value">2026年1月北京市、天津市蔬菜快速检测工作方案编号：FA-SC-202601-001</span>
                    </div>
                    <div class="info-row">
                        <span class="label">主管单位</span>
                        <span class="value link">农业农村部水产品质量监督检验测试中心（上海）</span>
                    </div>
                    <div class="info-row">
                        <span class="label">任务类型</span>
                        <span class="value link">快速检测</span>
                    </div>
                    <div class="info-row">
                        <span class="label">产品分类</span>
                        <span class="value link">蔬菜</span>
                    </div>
                    <div class="info-row">
                        <span class="label">检测地区</span>
                        <span class="value link">北京、天津</span>
                    </div>
                    <div class="info-row">
                        <span class="label">执行时间</span>
                        <span class="value link">2024年12月11日至2024年12月28日</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 抽样检测查询 -->
        <div class="query-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">抽样检测查询</h2>
            </div>

            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form" label-position="left">
                    <el-form-item label="样品">
                        <el-input v-model="queryParams.sampleName" placeholder="请输入样品编号或样品名称"
                            class="custom-input w180" />
                    </el-form-item>
                    <el-form-item label="承担单位">
                        <el-select v-model="queryParams.unit" placeholder="请选择" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="检测机构A" value="1" />
                            <el-option label="检测机构B" value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品分类">
                        <el-select v-model="queryParams.category" placeholder="请选择" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="蔬菜" value="vegetable" />
                            <el-option label="水果" value="fruit" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="采样场所">
                        <el-select v-model="queryParams.location" placeholder="请选择" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="农贸市场" value="market" />
                            <el-option label="超市" value="supermarket" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="检测状态">
                        <el-select v-model="queryParams.status" placeholder="请选择" class="custom-select">
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

            <!-- 操作按钮行 -->
            <div class="table-actions">
                <div class="action-left">
                    <el-button @click="handleExport">导出</el-button>
                </div>
                <div class="action-right">
                    <el-button type="primary" @click="handleBatchImport" class="primary-btn">检测批量导入</el-button>
                    <el-button type="primary" @click="handleSingleInput" class="primary-btn">检测单条录入</el-button>
                </div>
            </div>
            <p class="import-tip">*支持第三方检测结果批量导入</p>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="样品编号" prop="sampleNo" width="140" align="center" />
                    <el-table-column label="样品名称" prop="sampleName" width="100" align="center" />
                    <el-table-column label="产品分类" prop="category" width="80" align="center" />
                    <el-table-column label="产地" prop="origin" width="80" align="center" />
                    <el-table-column label="被检主体名称" prop="subjectName" min-width="120" show-overflow-tooltip />
                    <el-table-column label="抽检地区" prop="region" width="110" align="center" />
                    <el-table-column label="检测机构" prop="testOrg" min-width="140" show-overflow-tooltip />
                    <el-table-column label="检测时间" prop="testTime" width="100" align="center" />
                    <el-table-column label="检测结果" prop="testResult" width="100" align="center" />
                    <el-table-column label="检测状态" prop="testStatus" width="80" align="center">
                        <template #default="scope">
                            <span :class="['status-tag', statusMap[scope.row.testStatus]?.class]">
                                {{ statusMap[scope.row.testStatus]?.text }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="140" align="center" fixed="right">
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
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('task');

const queryParams = reactive({
    sampleName: '',
    unit: '',
    category: '',
    location: '',
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
        sampleNo: 'YP2025123000001',
        sampleName: '红豆',
        category: '蔬菜',
        origin: '山东济南',
        subjectName: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '盒马鲜生',
        testTime: '-',
        testResult: '-',
        testStatus: 0
    },
    {
        sampleNo: 'YP2025123000002',
        sampleName: '草莓',
        category: '水果',
        origin: '山东济南',
        subjectName: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '北京市平谷区农业综合检验检测中心',
        testTime: '2023-09-09',
        testResult: '阴性',
        testStatus: 1
    },
    {
        sampleNo: 'YP2025123000003',
        sampleName: '桂鱼',
        category: '水产品',
        origin: '辽宁大连',
        subjectName: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '北京果村蔬菜专业合作社',
        testTime: '2023-09-09',
        testResult: '结果异常（二维码模糊）',
        testStatus: 2
    }
]);



const handleBack = () => {
    router.back();
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
};

const handleDelete = (row) => {
    console.log('Delete:', row);
};

const handleView = (row) => {
    console.log('View:', row);
};

const handleRetest = (row) => {
    console.log('Retest:', row);
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

/* 顶部 Tab */
.tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 10px;
    padding: 16px 24px;

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

    .back-btn {
        border-radius: 8px;
    }
}

/* 任务信息卡片 */
.task-info-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

.task-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;

    .task-code {
        font-size: 14px;
        font-weight: 400;
        color: #666;
    }
}

.task-detail-grid {
    display: flex;
    gap: 60px;
    align-items: flex-start;
}

.progress-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 140px;

    .progress-label {
        font-size: 14px;
        color: #333;
        margin-top: 12px;
        font-weight: 500;
    }

    .progress-info {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
    }
}

.info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .info-row {
        display: flex;
        align-items: flex-start;
        font-size: 14px;

        .label {
            min-width: 70px;
            color: #333;
            font-weight: 500;

            &::after {
                content: '：';
            }
        }

        .value {
            color: #333;

            &.link {
                color: #00B3ED;
            }
        }
    }
}

/* 查询卡片 */
.query-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
    flex: 1;
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
    width: 120px !important;
}

/* 操作按钮行 */
.table-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-top: 16px;
    border-top: 1px dashed #D1D5DB;

    .action-left,
    .action-right {
        display: flex;
        gap: 12px;
    }

    .primary-btn {
        background-color: #00B3ED;
        border-color: #00B3ED;
        border-radius: 8px;
    }

    .el-button {
        border-radius: 8px;
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
</style>
