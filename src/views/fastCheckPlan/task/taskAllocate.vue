<template>
    <div class="app-container">
        <PageBack />
        <div style="flex: 1; overflow: auto;">
            <div class="task-detail-card" v-loading="detailLoading">
                <div class="card-left">
                    <div class="left-info-col">
                        <div class="info-item">
                            <span class="label">任务名称：</span>
                            <span class="value">{{ taskDetail.taskName || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">任务编号：</span>
                            <span class="value">{{ taskDetail.taskCode || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">主管单位：</span>
                            <span class="value">{{ getTaskDeptLabel(taskDetail) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测品种：</span>
                            <span class="value">{{ taskDetail.detectionVarieties || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测项目：</span>
                            <span class="value">{{ getDetectionItemsLabel(taskDetail) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">执行时间：</span>
                            <span class="value">
                                {{ taskDetail.startDate ? (taskDetail.startDate + ' 至 ' + taskDetail.endDate) : '--' }}
                            </span>
                        </div>
                    </div>
                    <div class="progress-col">
                        <el-progress type="circle" :percentage="taskDetail.sampleCompletionRate || 0" :width="120"
                            color="#00B3ED" :stroke-width="10" />
                        <div class="progress-label">方案完成率</div>
                        <div class="progress-info">
                            ({{ taskDetail.sampleCompletedCount || 0 }}/{{ taskDetail.sampleCount || 0 }})
                        </div>
                    </div>
                </div>

                <div class="card-right">
                    <div class="stats-row">
                        <div class="info-col">
                            <div class="info-item">
                                <span class="label">所属方案：</span>
                                <span class="value">{{ taskDetail.planInfo?.planName || '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">方案编号：</span>
                                <span class="value">{{ taskDetail.planInfo?.planCode || '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">检测分类：</span>
                                <span class="value">{{ taskDetail.taskType === 1 ? '快速检测' : (taskDetail.taskType ||
                                    '--') }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">产品分类：</span>
                                <span class="value">{{ getTaskCategoryLabel(taskDetail) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">检测地区：</span>
                                <span class="value">{{ taskDetail.detectionArea || '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">执行时间：</span>
                                <span class="value">
                                    {{ taskDetail.startDate ? (taskDetail.startDate + ' 至 ' + taskDetail.endDate) : '--'
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部列表内容区域 -->
            <div class="list-content-area">
                <!-- Tabs 切换 -->
                <div class="custom-tabs">
                    <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
                        @click="activeTab = tab.key">{{ tab.label }}</div>
                </div>

                <div class="tab-pane-container">
                    <!-- 子任务列表 Tab -->
                    <template v-if="activeTab === 'subtask'">
                        <!-- 数据为空时的缺省页 -->
                        <div v-if="!loading && allTableData.length === 0" class="empty-state-container">
                            <div class="empty-content">
                                <div class="empty-icon-wrapper">
                                    <!-- 使用图标组件模拟截图中的图标 -->
                                    <el-icon class="custom-empty-icon">
                                        <List />
                                    </el-icon>
                                </div>
                                <div class="empty-text">尚未分配检测任务</div>
                                <el-button type="primary" class="empty-action-btn" @click="handleCreateTask">
                                    新建子任务（转派）
                                </el-button>
                            </div>
                        </div>

                        <!-- 原始表格展示逻辑 -->
                        <template v-else>
                            <!-- 查询表单 -->
                            <div class="query-section">
                                <el-form :model="queryParams" ref="queryRef" :inline="true"
                                    class="custom-query-form custom-query-form-row">
                                    <el-form-item label="">
                                        <el-input v-model="queryParams.task" placeholder="任务编号或任务名称" class="w200" />
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-input v-model="queryParams.unit" placeholder="承担单位" class="w150" />
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-select v-model="queryParams.status" style="width: 150px" placeholder="任务状态"
                                            class="w150">
                                            <el-option label="进行中" value="ongoing" />
                                            <el-option label="已完成" value="completed" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="">
                                        <el-date-picker v-model="queryParams.dateRange" type="daterange"
                                            style="width: 240px!important" range-separator="至" start-placeholder="开始日期"
                                            end-placeholder="结束日期" class="date-picker-custom" />
                                    </el-form-item>
                                    <div class="query-btns">
                                        <el-button @click="handleReset">重置</el-button>
                                        <el-button type="primary" @click="handleQuery">查询</el-button>
                                    </div>
                                </el-form>
                            </div>

                            <!-- 装饰线及操作按钮 -->
                            <div class="action-bar-row">
                                <div class="action-left">
                                    <div class="brand-btn" @click="handleCreateTask">
                                        新建子任务（转派）
                                        <el-icon class="flash-icon">
                                            <Lightning />
                                        </el-icon>
                                    </div>
                                </div>
                                <el-button class="export-btn" type="primary" @click="handleExport">导出</el-button>
                            </div>

                            <!-- 数据表格 -->
                            <div class="table-wrapper">
                                <el-table v-loading="loading" :data="tableData" border
                                    :header-cell-style="{ background: '#F3F4F6', color: '#333333', fontWeight: 'bold' }"
                                    :row-style="{ height: '60px' }">
                                    <el-table-column label="序号" type="index" width="60" align="center" />
                                    <el-table-column label="任务编号" prop="taskCode" align="center" width="120" />
                                    <el-table-column label="任务名称" prop="taskName" align="center" min-width="180"
                                        show-overflow-tooltip />
                                    <el-table-column label="承担单位" prop="assignDeptId" align="center" min-width="120">
                                        <template #default="{ row }">
                                            {{ getTaskDeptLabel(row) }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="检测区域范围" prop="detectionArea" align="center" width="120" />
                                    <el-table-column label="检测品种" prop="detectionVarieties" align="center"
                                        min-width="120" show-overflow-tooltip />
                                    <el-table-column label="检测项目" prop="detectionItems" align="center" min-width="120"
                                        show-overflow-tooltip>
                                        <template #default="{ row }">
                                            {{ getDetectionItemsLabel(row) }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="执行时间" align="center" width="200">
                                        <template #default="{ row }">
                                            {{ row.startDate ? (row.startDate + ' 至 ' + row.endDate) : '--' }}
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="任务完成率(已完成样品数/总样品数)" align="center" width="250">
                                        <template #default="{ row }">
                                            {{ row.sampleCompletionRate || 0 }}% ({{ row.sampleCompletedCount || 0 }}/{{
                                                row.sampleCount || 0 }})
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="状态" prop="status" align="center" width="100">
                                        <template #default="{ row }">
                                            <dict-tag :type="DICT_TYPE.AGRI_DETECTION_TASK_STATUS"
                                                :value="row.status" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" align="center" width="100" fixed="right">
                                        <template #default="{ row }">
                                            <span class="table-link" @click="handleView(row)">查看</span>
                                        </template>
                                    </el-table-column>
                                </el-table>

                                <!-- 分页 -->
                                <div class="pagination-footer">
                                    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize"
                                        :total="total" layout="total, sizes, prev, pager, next, jumper" background
                                        class="custom-pagination" @current-change="handlePageChange" />
                                </div>
                            </div>
                        </template>
                    </template>

                    <!-- 检测结果 Tab -->
                    <template v-if="activeTab === 'result'">
                        <DetectionProgress :tableData="progressList" :total="progressTotal" @query="handleProgressQuery"
                            @reset="handleProgressReset" />
                    </template>

                    <!-- 进度监控 Tab -->
                    <template v-if="activeTab === 'monitor'">
                        <ProgressHistory :treeData="historyData" />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Lightning, List } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import DetectionProgress from '@/components/DetectionProgress/index.vue'
import ProgressHistory from '@/components/ProgressHistory/index.vue'
import * as DetectionTaskApi from '@/api/agri/detectionTask/index'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'
import * as DeptApi from '@/api/system/dept'
import * as DetectionRecordApi from '@/api/agri/detectionRecord'
import { formatDate } from '@/utils/formatTime'


const router = useRouter()
const route = useRoute()
const taskId = route.query.id

const activeTab = ref('subtask')

watch(
    () => route.query.tab,
    (val) => {
        if (val === '2' || val === 'result') {
            activeTab.value = 'result'
        } else if (val === '3' || val === 'monitor') {
            activeTab.value = 'monitor'
        } else {
            activeTab.value = 'subtask'
        }
    },
    { immediate: true }
)
const loading = ref(false)
const detailLoading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const taskDetail = ref({})
const allTableData = ref([])
const tableData = ref([])
const queryRef = ref()

const deptMap = ref({})
const { getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str');
const tabs = [
    { label: '子任务列表', key: 'subtask' },
    { label: '检测结果', key: 'result' },
    { label: '进度监控', key: 'monitor' }
]

const queryParams = reactive({
    task: '',
    unit: '',
    status: '',
    dateRange: []
})

const resolveFirstValue = (...values) => {
    return values.find(value => value !== undefined && value !== null && value !== '' && value !== '--')
}

const getDeptLabel = (value) => {
    if (!value) return '--'
    return deptMap.value[value] || '--'
}

const getTaskDeptLabel = (task = {}) => {
    return resolveFirstValue(
        task.issuerDeptName,
        task.assignDeptName,
        task.deptName,
        task.planInfo?.issuerDeptName,
        getDeptLabel(task.issuerDeptId),
        getDeptLabel(task.assignDeptId),
        getDeptLabel(task.planInfo?.issuerDeptId)
    ) || '--'
}

const getTaskCategoryLabel = (task = {}) => {
    const category = resolveFirstValue(
        task.targetCategory,
        task.productCategory,
        task.planInfo?.targetCategory,
        task.planInfo?.productCategory
    )

    if (!category) return '--'
    const label = getProductCategoryLabel(category)
    return label !== '--' ? label : category
}

const getDetectionItemsLabel = (task = {}) => {
    return resolveFirstValue(task.detectionItems, task.planInfo?.detectionItems) || '--'
}



const loadTaskList = async () => {
    loading.value = true;
    try {
        const id = taskId || 0;
        if (id) {
            // 后端接口目前仅接收 parentId，我们在前端处理搜索和分页
            const data = await DetectionTaskApi.getDetectionSubTaskList(id);
            allTableData.value = data || [];
            handleFilter();

            // 组装历史进度树形数据
            const allTasks = data || [];
            const taskMap = new Map();
            const treeRoots = [];

            allTasks.forEach(t => {
                const total = t.sampleCount || 0;
                const completed = t.sampleCompletedCount || t.completedCount || 0;
                taskMap.set(t.id, {
                    id: t.id,
                    name: t.taskName || t.assignDeptName || getDeptLabel(t.assignDeptId) || '未命名任务',
                    progress: total > 0 ? `(${completed}/${total})` : '',
                    warning: t.status === 2,
                    children: [],
                    parentId: t.parentId
                });
            });

            allTasks.forEach(t => {
                const node = taskMap.get(t.id);
                // 当前页面的列表仅返回直接子任务（有的接口会返回整个树的平铺形式）
                if (node.parentId && node.parentId !== Number(id) && node.parentId !== 0 && taskMap.has(node.parentId)) {
                    taskMap.get(node.parentId).children.push(node);
                } else {
                    treeRoots.push(node);
                }
            });

            historyData.value = {
                name: taskDetail.value?.taskName || '分配任务',
                children: treeRoots
            };
        }
    } catch (error) {
        console.error('获取子任务列表失败:', error);
    } finally {
        loading.value = false;
    }
}

// 处理前端搜索和分页
const handleFilter = () => {
    let result = [...allTableData.value];

    // 搜索过滤
    if (queryParams.task) {
        result = result.filter(item =>
            (item.taskName && item.taskName.includes(queryParams.task)) ||
            (item.taskCode && item.taskCode.includes(queryParams.task))
        );
    }
    if (queryParams.unit) {
        result = result.filter(item => getTaskDeptLabel(item).includes(queryParams.unit));
    }
    if (queryParams.status) {
        result = result.filter(item => item.status === queryParams.status);
    }
    if (queryParams.dateRange && queryParams.dateRange.length === 2) {
        const start = queryParams.dateRange[0].getTime();
        const end = queryParams.dateRange[1].getTime();
        result = result.filter(item => {
            const itemDate = new Date(item.startDate).getTime();
            return itemDate >= start && itemDate <= end;
        });
    }

    total.value = result.length;

    // 分页切片
    const startIdx = (pageNum.value - 1) * pageSize.value;
    const endIdx = startIdx + pageSize.value;
    tableData.value = result.slice(startIdx, endIdx);
}

const getDetail = async () => {
    detailLoading.value = true;
    try {
        const id = taskId || 0;
        if (id) {
            const data = await DetectionTaskApi.getDetectionTask(id);
            taskDetail.value = data || {};
            await loadMissingDeptNames(data);
        }
    } catch (error) {
        console.error('获取任务详情失败:', error);
    } finally {
        detailLoading.value = false;
    }
}

const loadMissingDeptNames = async (detail = {}) => {
    const deptIds = [
        detail.issuerDeptId,
        detail.assignDeptId,
        detail.planInfo?.issuerDeptId
    ].filter(id => id && !deptMap.value[id])

    const uniqueDeptIds = [...new Set(deptIds)]
    if (!uniqueDeptIds.length) return

    await Promise.all(uniqueDeptIds.map(async (id) => {
        try {
            const dept = await DeptApi.getDept(id)
            if (dept?.name) {
                deptMap.value = {
                    ...deptMap.value,
                    [id]: dept.name
                }
            }
        } catch (e) {
            console.warn('获取部门详情失败', e)
        }
    }))
}

onMounted(async () => {
    if (taskId) {
        try {
            const depts = await DeptApi.getSimpleDeptList();
            const map = {};
            depts.forEach(d => {
                map[d.id] = d.name;
            });
            deptMap.value = map;
        } catch (e) {
            console.warn('获取部门列表失败', e);
        }

        await getDetail();
        await loadTaskList();
        // 初始化加载检测结果
        handleProgressQuery();
    }
})

function handleQuery() {
    pageNum.value = 1;
    handleFilter();
}

function handleReset() {
    if (queryRef.value) {
        queryRef.value.resetFields();
    }
    queryParams.task = ''
    queryParams.unit = ''
    queryParams.status = ''
    queryParams.dateRange = []
    handleQuery();
}

function handleCreateTask() {
    router.push({
        path: '/fastCheckPlan/task/createSchemeTask',
        query: { id: taskId }
    })
    window.sessionStorage.setItem('planInfo', JSON.stringify(taskDetail.value))
}

function handleExport() {
    console.log('Export Data')
}

function handleView(row) {
    if (row.id) {
        router.push({
            path: '/fastCheckPlan/taskAllocate',
            query: { id: row.id }
        });
    }
}

function handlePageChange(page) {
    pageNum.value = page;
    handleFilter();
}

// 检测进度数据
const progressTotal = ref(0)
const progressList = ref([])

let isLoadingResults = false; // 防重入锁

const loadDetectionResults = async (params = {}) => {
    if (isLoadingResults) return; // 防止递归调用
    isLoadingResults = true;
    try {
        const id = taskId;
        if (!id) return;

        const queryParams = {
            taskId: id, // 使用 taskId
            pageNo: params.pageNum || 1,
            pageSize: params.pageSize || 10,
            keyword: params.sample || undefined,
            productCategory: params.category || undefined,
            overallResult: params.result === 'qualified' ? 0 : (params.result === 'unqualified' ? 1 : undefined),
            status: params.status === 'tested' ? 1 : (params.status === 'untested' ? 0 : undefined)
        };

        const data = await DetectionRecordApi.getDetectionRecordPage(queryParams);
        progressList.value = (data.list || []).map(item => ({
            id: item.id,
            sampleNo: item.sampleCode || '--',
            sampleName: item.productName || '--',
            category: item.productCategory ? getProductCategoryLabel(item.productCategory) : '--',
            origin: item.sampleArea || '--',
            subject: item.subjectName || '--',
            region: item.detectionArea || '--',
            org: item.detectionOrgName || '--',
            testTime: item.detectionDate ? formatDate(item.detectionDate, 'YYYY-MM-DD') : '--',
            result: item.overallResult === 0 ? '阴性' : (item.overallResult === 1 ? '阳性' : (item.overallResult === 2 ? '结果异常' : '--')),
            status: item.status === 1 ? '已检测' : (item.status === 0 ? '未检测' : '失败')
        }));
        progressTotal.value = data.total || 0;
    } catch (error) {
        console.error('加载检测结果失败:', error);
    } finally {
        isLoadingResults = false;
    }
};

// 进度历史树形数据
const historyData = ref({
    name: '任务节点',
    children: []
})

function handleProgressQuery(params) {
    loadDetectionResults(params || {});
}

function handleProgressReset() {
    loadDetectionResults({});
}
</script>

<style lang="scss" scoped>
.app-container {
    padding: 0px;
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 14px;
    background: transparent;
}

/* 顶部详情卡片 */
.task-detail-card {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 40px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 12px;

    .info-item {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 1.6;

        .label {
            color: #333333;
            white-space: nowrap;
            min-width: 70px;
        }

        .value {
            color: #333333;
            font-weight: 500;
        }
    }


    .card-left {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
        border-right: 1px solid #eeeeee;
        padding-right: 40px;

        .left-info-col {
            min-width: 0;
        }

        .progress-col {
            flex: 0 0 150px;
        }
    }

    .progress-col {
        width: 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 20px;

        .progress-label {
            font-size: 14px;
            color: #333;
            margin-top: 15px;
            font-weight: bold;
        }

        .progress-info {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
    }

    .card-right {
        .stats-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .info-col {
            flex: 1;
        }
    }
}

/* 列表容器 */
.list-content-area {
    background: #fff;
    padding: 16px;
    border-radius: 10px;
    flex: 1;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);

    .custom-tabs {
        display: flex;
        background: #e4e7ed;
        border-radius: 4px;
        padding: 2px;
        width: fit-content;
        margin-bottom: 24px;

        .tab-item {
            padding: 8px 30px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            color: #333;
            transition: all 0.3s;

            &.active {
                background: #00B3ED;
                color: #ffffff;
            }
        }
    }

    .query-section {
        margin-bottom: 20px;
    }

    /* 操作行 */
    .action-bar-row {
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .brand-btn {
            display: flex;
            align-items: center;
            background: #00B3ED;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 179, 237, 0.3);

            .flash-icon {
                margin-left: 8px;
                font-size: 18px;
                color: #FFD25E;
            }
        }

        .export-btn {
            padding: 10px 30px;
            background: #00B3ED;
            border-color: #00B3ED;
        }
    }

    .table-wrapper {
        :deep(.el-table) {
            border-radius: 8px;
            overflow: hidden;

            .el-button--link {
                color: #00B3ED;
                text-decoration: underline;
            }
        }
    }

    .pagination-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;

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

/* 缺省页样式 */
.empty-state-container {
    padding: 60px 0;
    display: flex;
    justify-content: center;
    align-items: center;

    .empty-content {
        width: 100%;
        max-width: 800px;
        min-height: 300px;
        background: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .empty-icon-wrapper {
        .custom-empty-icon {
            font-size: 64px;
            color: #9CA3AF;
            padding: 12px;
            border: 2px solid #9CA3AF;
            border-radius: 8px;
        }
    }

    .empty-text {
        font-size: 20px;
        color: #333;
        font-weight: 500;
    }

    .empty-action-btn {
        padding: 12px 60px;
        font-size: 16px;
        height: 48px;
    }
}
</style>
