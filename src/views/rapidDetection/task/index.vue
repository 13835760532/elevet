<template>
    <div class="table-container">
        <!-- 快速检测标题 -->
        <div class="guide-card">
            <div class="card-header">
                <h2 class="card-title">快速检测</h2>
            </div>
        </div>

        <!-- 抽样检测查询 -->
        <div class="query-card">
            <div class="card-header">
                <h2 class="card-title">抽样检测查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :model="queryParams" ref="queryRef" :inline="true"
                    class="custom-query-form custom-query-form-row">
                    <el-form-item label="" prop="taskNo">
                        <el-input v-model="queryParams.taskNo" placeholder="输入任务编号" class="w180" clearable />
                    </el-form-item>

                    <el-form-item label="" prop="taskName">
                        <el-input v-model="queryParams.taskName" placeholder="输入任务名称" class="w180" clearable />
                    </el-form-item>

                    <el-form-item label="" prop="isReport">
                        <el-select v-model="queryParams.isReport" placeholder="检测结果上报" clearable class="w150"
                            style="width: 150px;">
                            <el-option label="是" :value="true" />
                            <el-option label="否" :value="false" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="" prop="dateRange">
                        <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                            style="width: 240px" />
                    </el-form-item>

                    <el-form-item label="" prop="schemeName">
                        <el-input v-model="queryParams.schemeName" placeholder="输入方案名称" class="w180" clearable />
                    </el-form-item>

                    <el-form-item label="" prop="status">
                        <el-select v-model="queryParams.status" placeholder="任务状态" clearable class="w150"
                            style="width: 150px;">
                            <el-option v-for="dict in taskStatusOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="" prop="area">
                        <AreaCascader v-model="queryParams.area" placeholder="监测区域" style="width: 150px" />
                    </el-form-item>


                    <div class="query-btns" style="display: flex; gap: 10px; margin-left: 10px;">
                        <el-button @click="resetQuery">重置</el-button>
                        <el-button type="primary" @click="handleQuery">查询</el-button>
                    </div>
                </el-form>
            </div>
            <!-- 操作按钮行 -->
            <div class="table-actions">
                <div class="action-left">
                </div>
                <div class="action-right">
                    <el-button @click="handleExport">导出</el-button>
                </div>
            </div>

            <!-- 数据表格区域 -->
            <div class="content-card">
                <div class="table-wrapper">
                    <el-table v-loading="loading" :data="tableData" border="false">
                        <el-table-column label="序号" type="index" width="60" align="center" />
                        <el-table-column label="任务编号" prop="taskNo" align="center" width="120" />
                        <el-table-column label="任务名称" prop="taskName" align="center" min-width="200"
                            show-overflow-tooltip />
                        <el-table-column label="监测区域" prop="area" align="center" width="100" />
                        <el-table-column label="任务分发单位" prop="dept" align="center" min-width="150" />
                        <el-table-column label="所属方案" prop="scheme" align="center" min-width="180"
                            show-overflow-tooltip />
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
                                <dict-tag type="agri_task_status" :value="row.status" />
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

                    <!-- 分页区域 -->
                    <div class="pagination-wrapper">
                        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                            :total="total" background layout="total, sizes, prev, pager, next, jumper"
                            @size-change="fetchData" @current-change="fetchData" class="custom-pagination" />
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useTableData } from '@/hooks/useTableData'
import { useRouter } from 'vue-router'
import AreaCascader from '@/components/AreaCascader/index.vue'
import * as DetectionTaskApi from '@/api/agri/detectionTask/index'
import * as DeptApi from '@/api/system/dept'
import { useDict } from '@/hooks/web/useDict'

const router = useRouter()
const { options: taskStatusOptions } = useDict('agri_task_status', 'int')

const activeTab = ref('task')
const dateRange = ref([])

// 获取部门相关的字典
const deptMap = ref({})
DeptApi.getSimpleDeptList().then(depts => {
    const map = {};
    depts.forEach(d => {
        map[d.id] = d.name;
    });
    deptMap.value = map;
}).catch(e => { })

// 真实的 API 请求
const realFetchApi = async (params) => {
    const query = {
        pageNo: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        taskName: params.taskName,
        status: params.status,
        detectionArea: params.area ? (Array.isArray(params.area) ? params.area.join('-') : params.area) : undefined,
        isAuto: false // 控制为方案相关的抽检任务
    }

    // 处理时间
    if (dateRange.value && dateRange.value.length === 2) {
        query.startDate = dateRange.value[0] + ' 00:00:00'
        query.endDate = dateRange.value[1] + ' 23:59:59'
    }

    // 后端目前好像未显式支持 taskCode, schemeName, isReport等条件，这里先向后端透传或暂存
    if (params.taskNo) query.taskCode = params.taskNo;
    if (params.schemeName) query.planName = params.schemeName;

    try {
        const res = await DetectionTaskApi.getDetectionTaskPage(query)

        const rows = (res.list || []).map(item => ({
            id: item.id,
            taskNo: item.taskCode || '--',
            taskName: item.taskName || '--',
            area: item.detectionArea || '--',
            dept: item.assignDeptName || deptMap.value[item.assignDeptId] || item.assignDeptId || '--',
            scheme: item.planName || '--',
            checkedNum: item.sampleCompletedCount || 0,
            totalNum: item.sampleCount || 0,
            isReport: item.publicFlag || false,
            period: (item.startDate ? item.startDate.split(' ')[0] : '--') + '至' + (item.endDate ? item.endDate.split(' ')[0] : '--'),
            status: item.status
        }))

        return {
            rows: rows,
            total: res.total || 0
        }
    } catch (err) {
        console.error(err)
        return {
            rows: [],
            total: 0
        }
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
    fetchApi: realFetchApi,
    defaultQuery: {
        taskNo: '',
        taskName: '',
        isReport: undefined,
        schemeName: '',
        status: '',
        area: ''
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
        query: {
            id: row.id
        }
    })
}

function handleDetail(row) {
    console.log('查看结果', row)
    router.push({
        path: '/rapidDetection/taskResultList',
        query: {
            taskId: row.id
        }
    })
}
</script>

<style lang="scss" scoped>
/* 容器样式继承自全局 .table-container */

.content-card {
    background: #fff;
    border-radius: 10px;
    flex: 1;
}

.table-wrapper {
    margin-top: 0;

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

.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 0;
    margin-top: 20px;
}

/* 核心优化：确保操作按钮区域横向排布不折行 */
.table-operate-action-btns {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 12px !important;
    justify-content: center;
    align-items: center;

    span {
        white-space: nowrap;
        font-size: 13px;

        &:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
    }
}
</style>
