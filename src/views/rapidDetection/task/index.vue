<template>
    <div class="page-container table-container">
        <!-- 页眉区域 -->
        <!-- <div class="page-header">
            <div class="header-title">
                <span class="title-line"></span>
                快速检测
            </div>
        </div> -->

        <!-- 查询卡片 -->
        <div class="search-card guide-card">
            <div class="card-header">
             
                <h2 class="card-title">抽样检测查询</h2>
            </div>
            <el-form :model="queryParams" ref="queryRef" :inline="true" class="custom-query-form">

                <el-form-item label="样品" prop="sampleName">
                    <el-input v-model="queryParams.sampleName" placeholder="请输入样品编号或样品名称" clearable />
                </el-form-item>

                <el-form-item label="产品分类" prop="productCategory">
                    <el-select v-model="queryParams.productCategory" placeholder="请选择" clearable style="width: 160px">
                        <el-option label="蔬菜" value="1" />
                        <el-option label="水果" value="2" />
                    </el-select>
                </el-form-item>

                <el-form-item label="采样场所" prop="samplingLocation">
                    <el-select v-model="queryParams.samplingLocation" placeholder="请选择" clearable style="width: 160px">
                        <el-option label="农贸市场" value="1" />
                        <el-option label="超市" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="抽检状态" prop="checkStatus">
                    <el-select v-model="queryParams.checkStatus" placeholder="请选择" clearable style="width: 160px">
                        <el-option label="进行中" value="1" />
                        <el-option label="已完成" value="2" />
                    </el-select>
                </el-form-item>
                <el-form-item label="任务" prop="taskName">
                    <el-input v-model="queryParams.taskName" placeholder="请输入任务编号或任务名称" clearable />
                </el-form-item>
                <el-form-item label="执行时间">
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>

                <div class="query-btns">
                    <el-button @click="resetQuery">重置</el-button>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                </div>
            </el-form>

        </div>

        <!-- Tabs 容器 -->
        <div class="tabs-container">
            <div class="custom-tabs">
                <div class="tab-flex">
                    <el-button plain @click="handleExport">导出</el-button>
                </div>
            </div>

            <!-- 表格区域 -->
            <div class="table-wrapper">
                <el-table v-loading="loading" :data="tableData" border>
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="任务编号" prop="taskNo" align="center" width="120" />
                    <el-table-column label="任务名称" prop="taskName" align="center" min-width="200"
                        show-overflow-tooltip />
                    <el-table-column label="监测区域" prop="area" align="center" width="100" />
                    <el-table-column label="任务分发单位" prop="dept" align="center" min-width="150" />
                    <el-table-column label="所属方案" prop="scheme" align="center" min-width="180" show-overflow-tooltip />
                    <el-table-column label="已检数/总任务数" align="center" width="150">
                        <template #default="{ row }">
                            {{ row.checkedNum }}/{{ row.totalNum }}
                        </template>
                    </el-table-column>
                    <el-table-column label="检测结果是否上报" prop="isReport" align="center" width="150">
                        <template #default="{ row }">
                            {{ row.isReport ? '是' : '否' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="执行周期" prop="period" align="center" width="200" />
                    <el-table-column label="状态" prop="status" align="center" width="100">
                        <template #default="{ row }">
                            <span :class="row.status === '进行中' ? 'status-ongoing' : 'status-done'">{{ row.status
                                }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center" width="180" fixed="right">
                        <template #default="{ row }">
                            <div class="table-operate-action-btns">
                                <span class="table-edit-operate" @click="handleCheck(row)">抽样检测</span>
                                <span class="table-view-operate" @click="handleDetail(row)">查看结果</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container">
                    <pagination v-show="total > 0" :total="total" v-model:page="pagination.pageNum"
                        v-model:limit="pagination.pageSize" layout="prev, pager, next, jumper, total"
                        @pagination="fetchData" class="custom-pagination" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTableData } from '@/hooks/useTableData'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeTab = ref('task')
const dateRange = ref([])

// 模拟 API 请求
const mockFetchApi = async (params) => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockData = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        taskNo: `RW${20261101 + i}`,
        taskName: i === 0
            ? '2026年北京蔬菜快速检测工作方案-海淀区任务'
            : i === 1
                ? '2026年全国快速检测工作方案-北京任务'
                : `2026年全国快速检测工作方案-北京任务${i}`,
        area: ['北京', '北京', '天津', '河北', '河北'][i % 5],
        dept: ['北京市市场监管局', '国家农业农村部', '农业农村部农产品质量安全检测测试中心', '农业农村部农产品质量安全检测测试中心', '农业部蔬菜品质监督检验测试中心（北京）'][i % 5],
        scheme: i === 0
            ? '2026年北京市快速检测工作方案'
            : i === 1
                ? '2026年全国快速检测工作方案-2工作方案'
                : '2026年北京市海淀区蔬菜快速检测工作方案',
        checkedNum: [300, 100, 700, 189, 123][i % 5],
        totalNum: [400, 500, 2000, 400, 500][i % 5],
        isReport: i !== 1 && i !== 4,
        period: '2026-1-1至2026-2-28',
        status: '进行中'
    }))

    return {
        rows: mockData,
        total: 5
    }
}

const {
    tableData,
    loading,
    total,
    pagination,
    queryParams,
    fetchData,
    resetQuery,
} = useTableData({
    fetchApi: mockFetchApi,
    defaultQuery: {
        sampleName: '',
        productCategory: '',
        samplingLocation: '',
        checkStatus: '',
        taskName: ''
    },
    immediate: true
})

function handleQuery() {
    fetchData()
}

function handleTabChange(tab) {
    activeTab.value = tab
    fetchData()
}

function handleExport() {
    console.log('导出')
}

function handleCheck(row) {
    console.log('抽样检测', row)
    router.push({
        path: '/rapidDetection/taskDetection',
        params: {
            id: row.id
        }
    })
}

function handleDetail(row) {
    console.log('查看结果', row)
    router.push({
        path: '/rapidDetection/taskResult',
        params: {
            id: row.id
        }
    })
}
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
}

.page-header {
    height: auco;
    background: #fff;
    padding: 16px;
    display: flex;
    align-items: center;
    border-radius: 10px;
    border-bottom: 1px solid #eeeeee;
    margin-bottom: 16px;

    .header-title {
        font-size: 18px;
        font-weight: bold;
        color: #333333;
        display: flex;
        align-items: center;

        .title-line {
            width: 4px;
            height: 18px;
            background: #00b3ed;
            margin-right: 12px;
            border-radius: 2px;
        }
    }
}

.search-card {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 16px;

    .card-header {
        font-size: 16px;
        font-weight: bold;
        color: #333333;
        margin-bottom: 16px !important;
    }

    .mt10 {
        margin-top: 10px;
    }

    :deep(.el-form-item__label) {
        font-weight: bold;
        color: #333333;
    }

    .search-buttons {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;

        .el-button {
            padding: 0 25px;
        }
    }
}

.tabs-container {
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    padding: 16px;

    .custom-tabs {
        display: flex;
        margin-bottom: 0;

        .tab-item {
            padding: 12px 30px;
            cursor: pointer;
            background: #ffffff;
            color: #333333;
            border: 1px solid #e4e7ed;
            border-bottom: none;
            transition: all 0.3s;

            &.active {
                background: #00B3ED;
                color: #ffffff;
                border-color: #00B3ED;
            }

            &:first-child {
                border-radius: 4px 0 0 0;
            }

            &:last-child {
                border-radius: 0 4px 0 0;
            }
        }

        .tab-flex {
            display: flex;
            align-items: center;
            margin-left: auto;
        }
    }

    .table-wrapper {
        margin-top: 16px;

        .status-ongoing {
            color: #333333;
        }

        .divider {
            margin: 0 8px;
            color: #dcdfe6;
        }

        :deep(.el-table) {
            .el-button--link {
                color: #00B3ED;
                font-weight: normal;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;

}
</style>
