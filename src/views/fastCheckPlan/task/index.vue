<template>
    <div class="table-container" v-loading="loading">
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
                        <el-input :prefix-icon="Search" v-model="queryParams.taskName" placeholder="搜索任务名称或编号" class="custom-input w220" clearable @keyup.enter="handleQuery" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.status" placeholder="任务状态" class="custom-select" clearable style="width: 140px">
                            <el-option v-for="dict in getIntDictOptions(DICT_TYPE.AGRI_DETECTION_TASK_STATUS)" :key="dict.value" :label="dict.label" :value="dict.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <el-date-picker 
                            v-model="queryDateRange" 
                            type="daterange" 
                            range-separator="至"
                            start-placeholder="开始日期" 
                            end-placeholder="结束日期" 
                            value-format="YYYY-MM-DD"
                            @change="handleDateChange"
                        />
                    </el-form-item>
                    <div class="query-btns">
                        <el-button @click="handleReset" class="reset-btn">重置</el-button>
                        <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 操作按钮行 -->
            <div class="table-actions">
                <div class="actions-left">
                </div>
                <div class="actions-right">
                    <el-button @click="handleExport" class="export-btn" :loading="exportLoading">导出</el-button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false" v-loading="loading">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="任务编码" prop="taskCode" width="160" align="center" />
                    <el-table-column label="任务名称" prop="taskName" min-width="180" show-overflow-tooltip />
                    <el-table-column label="检测地区" prop="detectionArea" width="120" align="center" />
                    <el-table-column label="检测品种" prop="detectionVarieties" min-width="120" show-overflow-tooltip />
                    <el-table-column label="检测进度" width="180" align="center">
                        <template #default="scope">
                            <div class="progress-box">
                                <el-progress 
                                    :percentage="scope.row.sampleCompletionRate || 0" 
                                    :stroke-width="8" 
                                    color="#00B3ED"
                                    :show-text="false"
                                />
                                <span class="progress-text">{{ scope.row.sampleCompletedCount }}/{{ scope.row.sampleCount }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="时间范围" width="200" align="center">
                        <template #default="scope">
                            {{ scope.row.startDate }} ~ {{ scope.row.endDate }}
                        </template>
                    </el-table-column>
                    <el-table-column label="最后催办" prop="lastUrgeTime" width="160" align="center">
                        <template #default="scope">
                            <span>{{ scope.row.lastUrgeTime ? formatDate(scope.row.lastUrgeTime) : '--' }}</span>
                            <el-tag v-if="scope.row.urgeCount" size="small" type="danger" style="margin-left: 4px">{{ scope.row.urgeCount }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="任务状态" prop="status" width="100" align="center">
                        <template #default="scope">
                            <dict-tag :type="DICT_TYPE.AGRI_DETECTION_TASK_STATUS" :value="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <el-button link type="primary" @click="handleReceive(scope.row)" v-if="scope.row.status === 1">接收任务</el-button>
                                <el-button link type="primary" @click="handleUrge(scope.row)" v-if="scope.row.status === 2">项目催办</el-button>
                                <el-button link type="primary" @click="handleView(scope.row)">查看详情</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination 
                    v-model:current-page="queryParams.pageNo" 
                    v-model:page-size="queryParams.pageSize"
                    :total="total" 
                    background 
                    layout="total, sizes, prev, pager, next, jumper" 
                    class="custom-pagination"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as DetectionTaskApi from '@/api/agri/detectionTask/index';
import { formatDate } from '@/utils/formatTime';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';

defineOptions({
    name: 'DetectionTaskIndex'
});

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

const loading = ref(false);
const exportLoading = ref(false);
const total = ref(0);
const tableList = ref([]);
const queryDateRange = ref([]);

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    taskName: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined
});

/**
 * 获取列表数据
 */
const getList = async () => {
    loading.value = true;
    try {
        const data = await DetectionTaskApi.getDetectionTaskPage(queryParams);
        tableList.value = data.list;
        total.value = data.total;
    } catch (error) {
        console.error('获取列表失败', error);
    } finally {
        loading.value = false;
    }
};

const handleQuery = () => {
    queryParams.pageNo = 1;
    getList();
};

const handleReset = () => {
    queryParams.pageNo = 1;
    queryParams.taskName = undefined;
    queryParams.status = undefined;
    queryParams.startDate = undefined;
    queryParams.endDate = undefined;
    queryDateRange.value = [];
    getList();
};

const handleDateChange = (val) => {
    if (val) {
        queryParams.startDate = val[0];
        queryParams.endDate = val[1];
    } else {
        queryParams.startDate = undefined;
        queryParams.endDate = undefined;
    }
};

const handleExport = async () => {
    try {
        await ElMessageBox.confirm('是否确认导出所有检测任务数据项?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        exportLoading.value = true;
        await DetectionTaskApi.exportDetectionTask(queryParams);
    } catch (error) {
        console.error('导出失败', error);
    } finally {
        exportLoading.value = false;
    }
};

const handleReceive = async (row) => {
    try {
        await ElMessageBox.confirm(`是否确认接收任务：${row.taskName}?`, '提示', {
            confirmButtonText: '接收',
            cancelButtonText: '取消',
            type: 'info'
        });
        await DetectionTaskApi.acceptDetectionTask(row.id);
        ElMessage.success('接收成功');
        getList();
    } catch (error) {
        // 取消
    }
};

const handleUrge = async (row) => {
    try {
        await DetectionTaskApi.urgeDetectionTask(row.id);
        ElMessage.success('已催办');
        getList();
    } catch (error) {
        console.error('催办失败', error);
    }
};

const handleView = (row) => {
    router.push({
        path: '/fastCheckPlan/taskAllocate',
        query: { id: row.id }
    });
};

const handleSizeChange = (val) => {
    queryParams.pageSize = val;
    handleQuery();
};

const handleCurrentChange = (val) => {
    queryParams.pageNo = val;
    getList();
};

onMounted(() => {
    getList();
});
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

/* 指南步骤样式 */
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
        margin-top: 12px; 
        align-self: flex-start;

        .arrow-svg {
            width: 24px;
            height: 24px;
            color: #ccc;
        }
    }
}

:deep(.el-table) {
    --el-table-header-bg-color: #F8FAFC;
    border-radius: 8px;
    overflow: hidden;
}

/* 进度条盒子 */
.progress-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    
    .el-progress {
        width: 100%;
    }
    
    .progress-text {
        font-size: 12px;
        color: #64748B;
    }
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
    background: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    box-shadow: none !important;

    &:hover { border-color: #00B3ED; }
    &.is-focus { border-color: #00B3ED; }
}

/* 操作按钮 */
.table-operate-action-btns {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 20px 0;
}
</style>
