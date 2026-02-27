<template>
    <div class="detection-progress">
        <!-- 查询区域 - 玻璃拟态子卡片 -->
        <div class="glass-sub-card query-card">
            <el-form :model="query" :inline="true" class="custom-query-form" label-position="left">
                <el-form-item label="所属任务">
                    <el-select v-model="query.task" placeholder="请选择" clearable class="custom-select w200">
                        <el-option v-for="task in taskOptions" :key="task.value" :label="task.label"
                            :value="task.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="抽检机构">
                    <el-select v-model="query.org" placeholder="请选择" clearable class="custom-select w150">
                        <el-option v-for="org in orgOptions" :key="org.value" :label="org.label" :value="org.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="样品">
                    <el-input v-model="query.sample" placeholder="请输入样品编号/名称" clearable class="custom-input w200" />
                </el-form-item>
                <el-form-item label="产品分类">
                    <el-select v-model="query.category" placeholder="请选择" clearable class="custom-select w120">
                        <el-option v-for="cat in categoryOptions" :key="cat.value" :label="cat.label"
                            :value="cat.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="检测结果">
                    <el-select v-model="query.result" placeholder="请选择" clearable class="custom-select w120">
                        <el-option label="合格" value="qualified" />
                        <el-option label="不合格" value="unqualified" />
                    </el-select>
                </el-form-item>
                <el-form-item label="检测状态">
                    <el-select v-model="query.status" placeholder="请选择" clearable class="custom-select w120">
                        <el-option label="已检测" value="tested" />
                        <el-option label="未检测" value="untested" />
                    </el-select>
                </el-form-item>

                <div class="query-btns">
                    <el-button @click="handleReset" class="reset-btn">重置</el-button>
                    <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                </div>
            </el-form>
        </div>

        <!-- 操作按钮与表格间隙 -->
        <div class="operation-header">
            <div class="left-hint">
                <span class="import-hint">*支持第三方检测结果批量导入</span>
            </div>
            <div class="right-actions">
                <el-button type="primary" class="btn-input" @click="handleSingleInput">单条录入</el-button>
                <el-button type="primary" class="btn-import" @click="handleBatchImport">批量导入</el-button>
            </div>
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
                <el-table-column label="检测结果" prop="result" width="100" align="center" />
                <el-table-column label="检测状态" prop="status" width="90" align="center" />
                <el-table-column label="操作" width="100" align="center" fixed="right">
                    <template #default="scope">
                        <span class="table-link" @click="handleViewDetail(scope.row)">查看详情</span>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="page.pageNum" v-model:page-size="page.pageSize" :total="total"
                    background layout="prev, pager, next" class="custom-pagination" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue';
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
        default: () => [
            { label: '任务A', value: 'taskA' },
            { label: '任务B', value: 'taskB' }
        ]
    },
    // 机构选项
    orgOptions: {
        type: Array,
        default: () => [
            { label: '机构A', value: 'orgA' },
            { label: '机构B', value: 'orgB' }
        ]
    },
    // 产品分类选项
    categoryOptions: {
        type: Array,
        default: () => [
            { label: '蔬菜', value: 'vegetable' },
            { label: '水果', value: 'fruit' }
        ]
    }
});

const emit = defineEmits(['query', 'reset', 'single-input', 'batch-import', 'view-detail', 'page-change']);

const router = useRouter();

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
    emit('single-input');
    router.push('/rapidDetection/create');
};

// 批量导入
const handleBatchImport = () => {
    emit('batch-import');
    router.push('/rapidDetection/batchImportData');
};

// 查看详情
const handleViewDetail = (row) => {
    emit('view-detail', row);
    router.push({
        path: '/taskDetection/taskDetail',
        query: { id: row.sampleNo }
    });
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
        padding: 20px;
        display: flex;
        justify-content: flex-end;
        background: rgba(255, 255, 255, 0.2);
        border-top: 1px solid rgba(235, 238, 245, 0.3);
    }
}
</style>
