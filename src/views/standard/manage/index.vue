<template>
    <div class="table-container">
        <!-- 标准限量查询 - 仿照 taskTable.vue 风格 -->
        <div class="query-card">
            <div class="card-header">
             
                <h2 class="card-title">国标限量</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form" label-position="left">
                    <el-form-item label="标准编号">
                        <el-input v-model="queryParams.standardNo" placeholder="请输入" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="农产品">
                        <el-input v-model="queryParams.productName" placeholder="请输入" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="目标物">
                        <el-input v-model="queryParams.targetObj" placeholder="请输入" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="默认限值单位">
                        <el-input v-model="queryParams.unit" placeholder="请输入" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="限值类型">
                        <el-select v-model="queryParams.limitType" placeholder="请选择" class="custom-select">
                            <el-option label="专属限值" value="exclusive" />
                            <el-option label="通用限值" value="general" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="queryParams.status" placeholder="请选择" class="custom-select">
                            <el-option label="启用" value="1" />
                            <el-option label="失效" value="0" />
                        </el-select>
                    </el-form-item>
                    <div class="query-btns">
                        <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                        <el-button @click="handleExport" class="export-btn">导出</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 操作按钮行 -->
            <div class="table-actions">
                <el-button type="primary" @click="handleAdd" class="add-btn">
                    <span>新建国标限量</span>
                </el-button>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="标准编号" prop="standardNo" width="120" align="center" />
                    <el-table-column label="标准名称" prop="standardName" min-width="180" show-overflow-tooltip />
                    <el-table-column label="农产品" prop="product" min-width="150" show-overflow-tooltip />
                    <el-table-column label="目标物" prop="target" min-width="150" show-overflow-tooltip />
                    <el-table-column label="限值" prop="limitValue" width="80" align="center" />
                    <el-table-column label="限值单位" prop="unit" width="100" align="center" />
                    <el-table-column label="限值类型" prop="limitType" width="100" align="center" />
                    <el-table-column label="状态" prop="status" width="80" align="center">
                        <template #default="scope">
                            <span :class="scope.row.status === '启用' ? 'status-enabled' : 'status-disabled'">
                                {{ scope.row.status }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="160" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                                <el-button link type="primary" @click="handleDelete(scope.row)">删除</el-button>
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

const queryParams = reactive({
    standardNo: '',
    productName: '',
    targetObj: '',
    unit: '',
    limitType: '',
    status: ''
});

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

const total = ref(100);

const tableList = ref([
    {
        standardNo: 'GB2763-2021',
        standardName: '食品国家安全标准 食品中农药最大限量',
        product: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        target: '农残 > 有机磷类 > 敌敌畏',
        limitValue: '0.1',
        unit: 'mg/kg',
        limitType: '专属限值',
        status: '启用'
    },
    {
        standardNo: 'GB2763-2021',
        standardName: '食品国家安全标准 食品中农药最大限量',
        product: '水果 > 柑橘类水果 > 西瓜',
        target: '农残 > 有机磷类 > 敌敌畏',
        limitValue: '0.05',
        unit: 'mg/kg',
        limitType: '专属限值',
        status: '失效'
    },
    {
        standardNo: 'GB2763-2021',
        standardName: '食品国家安全标准 食品中农药最大限量',
        product: '通用农产品',
        target: '农残 > 有机磷类 > 敌敌畏',
        limitValue: '0.02',
        unit: 'mg/kg',
        limitType: '通用限值',
        status: '启用'
    }
]);



const handleQuery = () => {
    console.log('Query:', queryParams);
};

const handleExport = () => {
    console.log('Export data');
};

const handleAdd = () => {
    console.log('Add new item');
};

const handleEdit = (row) => {
    console.log('Edit:', row);
};

const handleDelete = (row) => {
    console.log('Delete:', row);
};

const handleView = (row) => {
    console.log('View:', row);
};
</script>

<style lang="scss" scoped>
.table-container {
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
}

.query-card {
    background: #fff;
    backdrop-filter: blur(10px);
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


:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
    width: 160px;
    background: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    box-shadow: none !important;
    padding: 0 12px;
    height: 40px;

    &:hover {
        border-color: #00B3ED;
    }

    &.is-focus {
        border-color: #00B3ED;
        box-shadow: 0 0 0 3px rgba(0, 179, 237, 0.1) !important;
    }
}

/* 操作行 */
.table-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;

    .add-btn {
        height: 40px;
        padding: 0 20px;
        background-color: #00B3ED;
        border-color: #00B3ED;
        border-radius: 8px;
        font-weight: 600;
    }
}

/* 表格定制 */
.table-wrapper {
    margin-bottom: 24px;
}



.status-enabled {
    color: #333;
}

.status-disabled {
    color: #EF4444;
}

.table-operate-action-btns {
    display: flex;
    justify-content: center;
    gap: 8px;

    .el-button--link {
        font-size: 14px;
        font-weight: 500;
        color: #00B3ED;
        padding: 0 4px;
        position: relative;

        &:not(:last-child)::after {
            content: '|';
            position: absolute;
            right: -8px;
            color: #D1D5DB;
            pointer-events: none;
        }
    }
}

/* 分页适配 */
.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
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
</style>
