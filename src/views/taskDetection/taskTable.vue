<template>
    <div class="table-container">
        <!-- 检测方案指南 -->
        <div class="guide-card">
            <div class="card-header">
             
                <h2 class="card-title">检测方案指南</h2>
            </div>
            <div class="guide-steps">
                <div v-for="(step, index) in steps" :key="index" class="step-wrapper">
                    <div class="step-item">
                        <div class="step-icon">{{ step.id }}</div>
                        <div class="step-text">{{ step.title }}</div>
                    </div>
                    <div v-if="index < steps.length - 1" class="step-arrow">
                        <el-icon :size="20" color="#333" style="font-weight: bold;">
                            <DArrowRight />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>

        <!-- 检测方案查询 -->
        <div class="query-card">
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form" label-position="left">
                    <el-form-item label="方案">
                        <el-input v-model="queryParams.scheme" placeholder="输入方案编号或方案名称" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="产品分类">
                        <el-select v-model="queryParams.category" placeholder="默认全部" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="蔬菜" value="vegetable" />
                            <el-option label="水果" value="fruit" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="方案状态">
                        <el-select v-model="queryParams.status" placeholder="请选择" class="custom-select">
                            <el-option label="未开始" value="0" />
                            <el-option label="进行中" value="1" />
                            <el-option label="已延期" value="2" />
                            <el-option label="已完成" value="3" />
                            <el-option label="已结束" value="4" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="方案时间">
                        <div class="date-range-box">
                            <el-date-picker v-model="queryParams.startDate" type="date" placeholder="开始时间" />
                            <el-date-picker v-model="queryParams.endDate" type="date" placeholder="结束时间" />
                        </div>
                    </el-form-item>
                    <div class="query-btns">
                        <el-button @click="handleReset" class="reset-btn">重置</el-button>
                        <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 操作按钮行 -->
            <div class="table-actions">
                <el-button type="primary" @click="handleAdd" class="add-btn">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    <span>创建方案</span>
                </el-button>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="方案编号" prop="schemeNo" width="160" />
                    <el-table-column label="方案名称" prop="schemeName" min-width="200" show-overflow-tooltip />
                    <el-table-column label="产品分类" prop="category" width="100" align="center" />
                    <el-table-column label="检测区域" prop="region" width="100" align="center" />
                    <el-table-column label="主管单位" prop="dept" min-width="150" show-overflow-tooltip />
                    <el-table-column label="方案检测总量" prop="total" width="120" align="center" />
                    <el-table-column label="方案开始日期" prop="startDate" width="120" align="center" />
                    <el-table-column label="方案结束日期" prop="endDate" width="120" align="center" />
                    <el-table-column label="任务方案完成率" prop="rate" width="120" align="center" />
                    <el-table-column label="状态" prop="status" width="100" align="center">
                        <template #default="scope">
                            <span :class="['status-tag', statusMap[scope.row.status].class]">
                                {{ statusMap[scope.row.status].text }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <el-button link type="primary" @click="handleEdit(scope.row)"
                                    v-if="scope.row.status < 2">编辑</el-button>
                                <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                                <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                    :total="total" background layout="total, sizes, prev, pager, next, jumper" class="custom-pagination" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';

const router = useRouter();

const steps = [
    { id: '01', title: '方案创建' },
    { id: '02', title: '任务拆分' },
    { id: '03', title: '任务下达' },
    { id: '04', title: '检测结果' },
    { id: '05', title: '检测结果查看' },
    { id: '06', title: '方案跟进追踪' }
];

const queryParams = reactive({
    scheme: '',
    category: '',
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
    0: { text: '未开始', class: 'status-not-started' },
    1: { text: '进行中', class: 'status-processing' },
    2: { text: '已延期', class: 'status-delayed' },
    3: { text: '已完成', class: 'status-completed' },
    4: { text: '已结束', class: 'status-finished' }
};

const tableList = ref([
    { schemeNo: 'FA-SC-202512-001', schemeName: '2025年全国大豆专项检查', category: '蔬菜', region: '全国', dept: '农业农村部农产品质量安全监管司', total: '9000', startDate: '2025-10-1', endDate: '2025-12-28', rate: '100%', status: 0 },
    { schemeNo: 'FA-SC-202512-001', schemeName: '2025年全国大豆专项检查', category: '蔬菜', region: '全国', dept: '农业农村部农产品质量安全监管司', total: '9000', startDate: '2025-10-1', endDate: '2025-12-28', rate: '100%', status: 1 },
    { schemeNo: 'FA-SC-202512-001', schemeName: '2025年全国大豆专项检查', category: '蔬菜', region: '全国', dept: '农业农村部农产品质量安全监管司', total: '9000', startDate: '2025-10-1', endDate: '2025-12-28', rate: '100%', status: 2 },
    { schemeNo: 'FA-SC-202512-001', schemeName: '2025年全国大豆专项检查', category: '蔬菜', region: '全国', dept: '农业农村部农产品质量安全监管司', total: '9000', startDate: '2025-10-1', endDate: '2025-12-28', rate: '100%', status: 3 },
    { schemeNo: 'FA-SC-202512-001', schemeName: '2025年全国大豆专项检查', category: '蔬菜', region: '全国', dept: '农业农村部农产品质量安全监管司', total: '9000', startDate: '2025-10-1', endDate: '2025-12-28', rate: '100%', status: 4 }
]);



/**\n * handleQuery：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleQuery = () => {
    console.log('Query:', queryParams);
};

/**\n * handleReset：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleReset = () => {
    Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
};

/**\n * handleAdd：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAdd = () => {
    router.push('/taskDetection/taskManagement');
};

/**\n * handleEdit：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleEdit = (row) => {
    console.log('Edit:', row);
};

/**\n * handleDelete：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDelete = (row) => {
    console.log('Delete:', row);
};

/**\n * handleView：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleView = (row) => {
    router.push('/taskDetection/taskDetail');
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
}

.guide-card,
.query-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;

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

/* 指南步骤样式 */
.guide-steps {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 32px;
    padding: 10px 0;

    .step-wrapper {
        display: flex;
        align-items: center;
        gap: 32px;
    }

    .step-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .step-icon {
            width: 32px;
            height: 32px;
            border: 1.5px solid #00B3ED;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #00B3ED;
            font-weight: 500;
        }

        .step-text {
            font-size: 14px;
            color: #00B3ED;
            font-weight: 400;
        }
    }

    .step-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        opacity: 1;
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
    height: 40px;
    line-height: 40px;

    &:hover {
        border-color: #00B3ED;
    }

    &.is-focus {
        border-color: #00B3ED;
        box-shadow: 0 0 0 3px rgba(0, 179, 237, 0.1) !important;
    }
}

.custom-input {
    width: 180x;
}

.custom-select {
    width: 160px !important;
}

.date-range-box {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 240px;

    :deep(.el-input__wrapper) {
        height: 40px;
        line-height: 40px;
        flex: 1;
    }

    :deep(.el-input) {
        height: 40px;
        line-height: 40px;
    }
}

/* 操作行 */
.table-actions {
    margin-bottom: 24px;

    .add-btn {
        height: 40px;
        padding: 0 20px;
        background-color: #00B3ED;
        border-color: #00B3ED;
        border-radius: 8px;
        font-weight: 500;

        .el-icon {
            margin-right: 6px;
        }
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

    &.status-not-started {
        background-color: #E6F7FF;
        color: #00B3ED;
    }

    &.status-processing {
        background-color: #FFF7E6;
        color: #FA8C16;
    }

    &.status-delayed {
        background-color: #FFF1F0;
        color: #F5222D;
    }

    &.status-completed {
        background-color: #F6FFED;
        color: #52C41A;
    }

    &.status-finished {
        background-color: #F5F5F5;
        color: #8C8C8C;
    }
}

.table-operate-action-btns {
    display: flex;
    justify-content: center;
    gap: 12px;

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

:deep(.custom-pagination) {
    .el-pager li.is-active {
        background-color: #00B3ED !important;
        color: #fff !important;
    }

    .el-pager li:hover {
        color: #00B3ED;
    }
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
