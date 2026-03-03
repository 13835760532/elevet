<template>
    <div class="table-container">
        <!-- 检测任务指南 -->
        <div class="guide-card">
            <div class="card-header">
             
                <h2 class="card-title">检测任务指南</h2>
            </div>
            <!-- 第一行: 方案创建 -> 任务拆分 -> 任务下达 -->
            <div class="guide-steps">
                <div v-for="(step, index) in stepsRow1" :key="'row1-' + index" class="step-container">
                    <div class="step-wrapper" :class="{ 'is-highlight': step.highlight, 'is-disabled': step.disabled }">
                        <div class="step-icon">{{ step.id }}</div>
                        <div class="step-content">
                            <div class="step-title">{{ step.title }}</div>
                            <div class="step-desc">{{ step.description }}</div>
                        </div>
                    </div>
                    <div v-if="index < stepsRow1.length - 1" class="step-arrow">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-svg">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- 快检任务查询 -->
        <div class="query-card">
            <div class="card-header">
             
                <h2 class="card-title">快检任务查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="">
                        <el-input :prefix-icon="Search" v-model="queryParams.scheme" placeholder="搜索所属方案名称或编号" class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-input :prefix-icon="Search" v-model="queryParams.taskName" placeholder="搜索任务名称或编号" class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.status" placeholder="全部状态" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="待接收" value="0" />
                            <el-option label="已接收" value="1" />
                            <el-option label="待接收" value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <el-date-picker v-model="queryParams.time" type="daterange" range-separator="至"
                            start-placeholder="执行开始时间" end-placeholder="执行结束时间" />
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
                            <div class="table-operate-action-btns">
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
import { ArrowRight, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'

const router = useRouter();

// 第一行步骤
const stepsRow1 = [
    { id: '01', title: '方案创建', description: '创建工作方案(如年度、专项)', disabled: true },
    { id: '02', title: '任务拆分', description: '按承建机构拆分检测任务', disabled: true },
    { id: '03', title: '任务下达', description: '任务下达至承检机构', disabled: true },
    { id: '04', title: '任务接收', description: '承检机构接收任务', highlight: true },
    { id: '05', title: '任务转派（按需拆分）', description: '按需向下转派或拆分任务' },
    { id: '06', title: '检测结果查看', description: '任务内检测结果查看' },
    { id: '07', title: '任务进度监控', description: '任务执行进度跟踪统计' }
];
const queryParams = reactive({
    scheme: '',
    taskName: '',
    status: '',
    time: [],
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

/* 指南步骤样式 - 忠实还原设计图 */
.guide-steps {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 12px;
    margin-top: 18px;
    padding: 8px 0;
    overflow-x: auto;

    &::-webkit-scrollbar {
        width: 0;
    }

    .step-container {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .step-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex-shrink: 0;
        
        &.is-disabled {
            .step-icon {
                border-color: #d9d9d9;
                color: #d9d9d9;
            }
            .step-title {
                color: #999;
            }
            .step-desc {
                color: #bfbfbf;
            }
        }
        
        &.is-highlight {
            .step-icon {
                background: #00B3ED;
                color: #fff;
                border-color: #00B3ED;
            }
            .step-title {
                color: #00B3ED;
                font-weight: 600;
            }
        }
    }

    .step-icon {
        width: 38px;
        height: 38px;
        border: 2px solid #71D1F5;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #71D1F5;
        font-weight: 600;
        margin-top: 2px;
    }

    .step-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .step-title {
        font-size: 14px;
        color: #00B3ED;
        font-weight: 500;
        white-space: nowrap;
    }

    .step-desc {
        font-size: 10px;
        color: #999;
        line-height: 1.4;
        white-space: nowrap;
    }

    .step-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        margin-top: 12px; // 对齐圆圈中心
        align-self: flex-start;

        .arrow-svg {
            width: 24px;
            height: 24px;
            color: #ccc;
        }
    }
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
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

.table-operate-action-btns {
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
