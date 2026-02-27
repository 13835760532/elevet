<template>
    <div class="table-container">
        <!-- 检测任务指南 -->
        <div class="guide-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">检测任务指南</h2>
            </div>
            <!-- 第一行: 方案创建 -> 任务拆分 -> 任务下达 -->
            <div class="guide-steps">
                <div v-for="(step, index) in stepsRow1" :key="'row1-' + index" class="step-wrapper">
                    <div class="step-item"
                        :class="{ 'step-highlight': step.highlight, 'step-disabled': step.disabled }">
                        <span class="step-text">{{ step.title }}</span>
                    </div>
                    <div v-if="index < stepsRow1.length - 1" class="step-arrow">
                        <el-icon :size="18" color="#333">
                            <ArrowRight />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>

        <!-- 快检任务查询 -->
        <div class="query-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">快检任务查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form" label-position="left">
                    <el-form-item label="所属方案">
                        <el-input v-model="queryParams.scheme" placeholder="输入方案名称或编号" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="任务名称">
                        <el-input v-model="queryParams.taskName" placeholder="请输入任务编号或任务名称" class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="执行时间">
                        <div class="date-range-box">
                            <el-date-picker v-model="queryParams.startDate" type="date" placeholder="开始日期" />
                            <el-date-picker v-model="queryParams.endDate" type="date" placeholder="结束日期" />
                        </div>
                    </el-form-item>
                    <el-form-item label="任务状态">
                        <el-select v-model="queryParams.status" placeholder="请选择" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="待接收" value="0" />
                            <el-option label="已接收" value="1" />
                            <el-option label="待接收" value="2" />
                        </el-select>
                    </el-form-item>
                    <div class="query-btns">
                        <el-button @click="handleReset" class="reset-btn">重置</el-button>
                        <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                        <el-button type="primary" @click="handleExport" class="export-btn">导出</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="任务编号" prop="taskNo" width="120" align="center" />
                    <el-table-column label="任务名称" prop="taskName" min-width="180" show-overflow-tooltip />
                    <el-table-column label="所属方案名称" prop="schemeName" min-width="200" show-overflow-tooltip />
                    <el-table-column label="方案主管单位" prop="dept" min-width="180" show-overflow-tooltip />
                    <el-table-column label="检测区域范围" prop="region" width="120" align="center" />
                    <el-table-column label="检测品种" prop="category" min-width="120" show-overflow-tooltip />
                    <el-table-column label="检测项目" prop="items" width="100" align="center" />
                    <el-table-column label="任务检测数量" prop="taskCount" width="110" align="center" />
                    <el-table-column label="执行时间" prop="executeTime" width="180" align="center" />
                    <el-table-column label="任务完成率" width="160" align="center">
                        <template #default="scope">
                            <span>{{ scope.row.rate }} ({{ scope.row.finished }}/{{ scope.row.total }})</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="任务状态" prop="status" width="100" align="center">
                        <template #default="scope">
                            <span :class="['status-tag', statusMap[scope.row.status]?.class]">
                                {{ statusMap[scope.row.status]?.text }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="140" align="center" fixed="right">
                        <template #default="scope">
                            <div class="action-btns">
                                <span class="table-edit-operate" @click="handleReceive(scope.row)"
                                    v-if="scope.row.status === 0">接收</span>
                                <span class="table-edit-operate" @click="handleTransfer(scope.row)"
                                    v-if="scope.row.status === 1">转派</span>
                                <span class="table-view-operate" @click="handleView(scope.row)">查看</span>
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
import { ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'

const router = useRouter();

// 第一行步骤
const stepsRow1 = [
    { title: '方案创建', disabled: true },
    { title: '任务拆分', disabled: true },
    { title: '任务下达', disabled: true },
    { title: '任务接收', highlight: true },
    { title: '任务转派（按需拆分）', },
    { title: '检测结果查看', },
    { title: '任务进度监控' }
];
const queryParams = reactive({
    scheme: '',
    taskName: '',
    status: '',
    startDate: '',
    endDate: ''
});

const pageParams = reactive({
    pageNum: 1,
    pageSize: 5
});

const total = ref(28);

const statusMap = {
    0: { text: '待接收', class: 'status-pending' },
    1: { text: '已接收', class: 'status-received' },
    2: { text: '待接收', class: 'status-pending' }
};

const tableList = ref([
    {
        taskNo: 'RW20251101',
        taskName: '2026年北京市快速检测任务',
        schemeName: '2026年1月北京市、天津市蔬菜快速检测工作方案',
        dept: '农业农村部农产品质量安全监管司',
        region: '北京市、天津市',
        category: '黄瓜、西红柿、韭菜、芹菜、茄子',
        items: 600,
        taskCount: 600,
        executeTime: '2025-10-1至2025-12-28',
        rate: '100%',
        finished: 610,
        total: 600,
        status: 0
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年天津快速检测任务',
        schemeName: '2026年1月北京市、天津市蔬菜快速检测工作方案',
        dept: '农业农村部农产品质量安全监管司',
        region: '北京市、天津市',
        category: '水果',
        items: 2,
        taskCount: 900,
        executeTime: '2025-10-1',
        rate: '0%',
        finished: 0,
        total: 900,
        status: 1
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年丹东快速检测任务',
        schemeName: '2026年1月辽宁蔬菜快速检测工作方案',
        dept: '辽宁省农业农村厅',
        region: '辽宁省丹东市',
        category: '水果',
        items: 3,
        taskCount: 850,
        executeTime: '2025-10-1',
        rate: '0%',
        finished: 0,
        total: 850,
        status: 0
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年沈阳快速检测任务',
        schemeName: '2026年1月辽宁蔬菜快速检测工作方案',
        dept: '辽宁省农业农村厅',
        region: '辽宁省沈阳市',
        category: '水果',
        items: 2,
        taskCount: 950,
        executeTime: '2025-10-1',
        rate: '0%',
        finished: 0,
        total: 950,
        status: 0
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年大连快速检测任务',
        schemeName: '2026年1月辽宁蔬菜快速检测工作方案',
        dept: '辽宁省农业农村厅',
        region: '辽宁省大连市',
        category: '畜禽',
        items: 1,
        taskCount: 1000,
        executeTime: '2025-10-1',
        rate: '0%',
        finished: 0,
        total: 1000,
        status: 1
    }
]);



const handleQuery = () => {
    console.log('Query:', queryParams);
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
};

const handleExport = () => {
    console.log('Export');
};

const handleReceive = (row) => {
    ElMessage({ message: '接收成功', type: 'success' })
};

const handleTransfer = (row) => {
    router.push('/fastCheckPlan/taskAllocate');
};

const handleView = (row) => {
    console.log('View:', row);
    router.push('/fastCheckPlan/taskAllocate');
};
</script>

<style lang="scss" scoped>
.table-container {
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: none !important;
}

.guide-card,
.query-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

/* 指南步骤样式 - 圆角矩形按钮风格 */
.guide-steps {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    margin-top: 18px;

    .step-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .step-item {
        padding: 10px 28px;
        border: 1px solid #d9d9d9;
        background: #fff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        &.step-highlight {
            background: #00B3ED;
            border-color: #00B3ED;

            .step-text {
                color: #fff;
            }
        }

        .step-text {
            font-size: 14px;
            color: #333;
            font-weight: 400;
            white-space: nowrap;
        }
    }

    .step-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

/* 连接线 */
.guide-connector {
    display: flex;
    align-items: center;
    padding-left: 60px;
    height: 30px;

    .connector-line {
        width: 1px;
        height: 100%;
        background: #d9d9d9;
        margin-left: 80px;
    }
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
    width: 150px;
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
    width: 180px;

    &.w220 {
        width: 220px;
    }
}

.custom-select {
    width: 120px !important;
}

.date-range-box {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 260px;

    :deep(.el-input__wrapper) {
        flex: 1;
        width: 120px;
    }
}

/* 表格定制 */
.table-wrapper {
    margin-bottom: 24px;
}



/* 状态标签 */
.status-tag {
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &.status-pending {
        background-color: #E6F7FF;
        color: #00B3ED;
    }

    &.status-received {
        background-color: #F6FFED;
        color: #52C41A;
    }
}

.action-btns {
    display: flex;
    justify-content: center;
    gap: 8px;

    .el-button--link {
        font-weight: 500;
        color: #00B3ED;
    }
}

/* 分页适配 */
.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 0;
}

/* 响应式 */
@media (max-width: 1400px) {
    .guide-steps {
        flex-wrap: wrap;

        .step-arrow {
            display: none;
        }
    }
}
</style>
