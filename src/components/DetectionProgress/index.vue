<template>
    <div class="detection-progress">
        <!-- 查询区域 - 玻璃拟态子卡片 -->
        <div class="glass-sub-card query-card">
            <el-form :model="query" :inline="true" class="custom-query-form custom-query-form-row" label-position="left"
                label-width="80px">
                <el-form-item label="" label-width="80px">
                    <el-select-v2 v-model="query.task" placeholder="所属任务" clearable class="custom-select w200"
                        :options="taskOptions" />
                </el-form-item>
                <el-form-item label="" label-width="80px">
                    <el-select-v2 v-model="query.org" placeholder="抽检机构" clearable class="custom-select w150"
                        :options="orgOptions" />
                </el-form-item>
                <el-form-item label="" label-width="80px">
                    <el-input v-model="query.sample" placeholder="请输入样品编号/名称" clearable class="custom-input w200" />
                </el-form-item>
                <el-form-item label="" label-width="80px">
                    <el-select-v2 v-model="query.category" placeholder="产品分类" clearable class="custom-select w120"
                        :options="categoryOptions" />
                </el-form-item>
                <el-form-item label="" label-width="80px">
                    <el-select-v2 v-model="query.result" placeholder="检测结果" clearable class="custom-select w120"
                        :options="resultOptions" />
                </el-form-item>
                <el-form-item label="" label-width="80px">
                    <el-select-v2 v-model="query.status" placeholder="检测状态" clearable class="custom-select w120"
                        :options="statusOptions" />
                </el-form-item>

                <div class="query-btns">
                    <el-button @click="handleReset" class="reset-btn">重置</el-button>
                    <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                </div>
            </el-form>
        </div>

        <!-- 操作按钮与表格间隙 -->
        <div class="operation-header" v-if="createBtnFlag">
            <!-- <div class="right-actions">
                <el-button type="primary" class="btn-input" @click="handleSingleInput">单条录入</el-button>
            </div> -->
        </div>

        <!-- 检测结果表格 - 玻璃拟态风格 -->
        <div class="glass-sub-card table-card">
            <el-table :data="tableData" border class="transparent-table">
                <el-table-column label="序号" type="index" width="60" align="center" />
                <el-table-column label="样品编号" prop="sampleNo" width="130" />
                <el-table-column label="样品名称" prop="sampleName" width="100" align="center" />
                <el-table-column label="产品分类" prop="category" width="100" align="center" />
                <el-table-column label="产地" prop="origin" width="110" align="center" />
                <el-table-column label="被检主体" prop="subject" min-width="150" show-overflow-tooltip />
                <el-table-column label="抽检地区" prop="region" width="120" align="center" />
                <el-table-column label="抽检机构" prop="org" min-width="180" show-overflow-tooltip />
                <el-table-column label="检测时间" prop="testTime" width="110" align="center" />
                <el-table-column label="检测结果" prop="result" width="110" align="center">
                    <template #default="scope">
                        <el-tag :type="getResultTagType(scope.row.result)" size="small" effect="light"
                            class="status-pill">
                            {{ scope.row.result }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="检测状态" prop="status" width="100" align="center">
                    <template #default="scope">
                        <span :class="['status-dot', getStatusDotClass(scope.row.status)]"></span>
                        <span class="status-name">{{ scope.row.status }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center" fixed="right">
                    <template #default="scope">
                        <span class="table-link" @click="handleViewDetail(scope.row)">查看详情</span>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
                <el-pagination :current-page="page.pageNum" :page-size="page.pageSize" :total="total" background
                    layout="prev, pager, next" class="custom-pagination" @current-change="handleCurrentChange"
                    @size-change="handleSizeChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    // 表格数据
    tableData: {
        type: Array,
        default: () => []
    },
    // 总条数
    total: {
        type: Number,
        default: 0
    },
    // 任务选项
    taskOptions: {
        type: Array,
        default: () => []
    },
    // 机构选项
    orgOptions: {
        type: Array,
        default: () => []
    },
    // 产品分类选项
    categoryOptions: {
        type: Array,
        default: () => []
    },
    createBtnFlag: {
        type: Boolean,
        default: true
    }

});

const emit = defineEmits(['query', 'reset', 'single-input', 'batch-import', 'view-detail', 'page-change']);

const router = useRouter();

const resultOptions = [
    { label: '合格', value: 'qualified' },
    { label: '不合格', value: 'unqualified' }
];

const statusOptions = [
    { label: '已检测', value: 'tested' },
    { label: '未检测', value: 'untested' }
];

// 查询参数
const query = reactive({
    task: '',
    org: '',
    sample: '',
    category: '',
    result: '',
    status: ''
});

// 分页参数
const page = reactive({
    pageNum: 1,
    pageSize: 10
});

// 查询
const handleQuery = () => {
    emit('query', { ...query, ...page });
};

const handleSizeChange = (val) => {
    page.pageSize = val;
    page.pageNum = 1;
    handleQuery();
};

const handleCurrentChange = (val) => {
    page.pageNum = val;
    handleQuery();
};

// 重置
const handleReset = () => {
    query.task = '';
    query.org = '';
    query.sample = '';
    query.category = '';
    query.result = '';
    query.status = '';
    emit('reset');
};

// 单条录入
const handleSingleInput = () => {
    const currentRoute = router.currentRoute.value;
    router.push({
        path: '/rapidDetection/create',
        query: { id: currentRoute.query.id },
        state: {
            activeMenu: currentRoute.meta.activeMenu || currentRoute.path
        }
    });
};

// 批量导入
const handleBatchImport = () => {
    //   emit('batch-import');
    router.push('/rapidDetection/batchImportData');
};

// 查看详情
const handleViewDetail = (row) => {
    // emit('view-detail', row);
    router.push({
        path: '/rapidDetection/taskResult',
        query: { id: row.id }
    });
};

const getResultTagType = (result) => {
    switch (result) {
        case '阴性': return 'success';
        case '阳性': return 'danger';
        case '结果异常': return 'warning';
        default: return 'info';
    }
};

const getStatusDotClass = (status) => {
    switch (status) {
        case '已检测': return 'dot-success';
        case '未检测': return 'dot-info';
        case '失败': return 'dot-danger';
        default: return '';
    }
};
</script>

<style lang="scss" scoped>
/* 玻璃拟态子卡片通用样式 */
.glass-sub-card {
    background: #fff;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    padding: 6px !important;
}


/* 操作页头 */
.operation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 0 4px;

    .left-hint {
        .import-hint {
            font-size: 13px;
            color: #666;
            font-style: italic;
        }
    }

    .right-actions {
        display: flex;
        gap: 16px;
    }
}

/* 表格卡片定制 */
.table-card {
    padding: 0;
    overflow: hidden;

    :deep(.el-table) {
        background: transparent;

        &::before,
        &::after {
            display: none;
        }

        tr {
            background-color: transparent;
        }

        // th.el-table__cell {
        //     background-color: rgba(245, 247, 250, 0.5) !important;
        // }

        td.el-table__cell {
            border-bottom: 1px solid rgba(235, 238, 245, 0.5);
        }
    }

    .table-link {
        color: #999;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
            color: #00B3ED;
        }
    }

    .pagination-wrapper {
        margin-top: 14px;
        padding: 16px 20px;
        display: flex;
        justify-content: flex-end;
    }
}

.status-pill {
    font-weight: 600;
    border-radius: 4px;
    padding: 0 8px;
}

.status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 8px;
    vertical-align: middle;
}

.dot-success {
    background-color: #52c41a;
    box-shadow: 0 0 4px rgba(82, 196, 26, 0.4);
}

.dot-info {
    background-color: #bfbfbf;
}

.dot-danger {
    background-color: #ff4d4f;
    box-shadow: 0 0 4px rgba(255, 77, 79, 0.4);
}

.status-name {
    font-size: 13px;
    color: #475569;
    vertical-align: middle;
}
</style>
