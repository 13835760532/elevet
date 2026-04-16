<template>
    <div class="page-container">
        <PageBack />

        <!-- 方案信息卡片 -->
        <div class="scheme-info-card">
            <div class="info-header">
                <h2 class="scheme-title">{{ schemeInfo.name }}</h2>
                <span class="scheme-no">（编号：{{ schemeInfo.no }}）</span>
            </div>

            <div class="info-content">
                <!-- 左侧进度预览 -->
                <div class="progress-section-container">
                    <div class="progress-section">
                        <div class="progress-circle">
                            <el-progress 
                                type="circle" 
                                :percentage="schemeInfo.taskProgress" 
                                :width="110" 
                                :stroke-width="10"
                                color="#2563eb" 
                            />
                        </div>
                        <p class="progress-label">任务总完成率</p>
                        <p class="progress-value">{{ schemeInfo.taskCompleted }}/{{ schemeInfo.taskTotal }}</p>
                    </div>
                </div>

                <!-- 右侧信息详情列表 -->
                <div class="info-list">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">主管单位</span>
                            <span class="info-value highlight">{{ schemeInfo.deptName }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">方案类型</span>
                            <span class="info-value">{{ schemeInfo.type }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">方案周期</span>
                            <span class="info-value">{{ schemeInfo.period }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">检测地区</span>
                            <span class="info-value">{{ schemeInfo.region }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">产品分类</span>
                            <span class="info-value">{{ schemeInfo.category }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">执行时间</span>
                            <span class="info-value">{{ schemeInfo.executionTime }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">方案检测量</span>
                            <span class="info-value">{{ schemeInfo.sampleCount }} 份</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">方案状态</span>
                            <span :class="['status-tag', statusClass]">{{ schemeInfo.status }}</span>
                        </div>
                        <div class="info-item full-width">
                            <span class="info-label">检测项目</span>
                            <span class="info-value">{{ schemeInfo.detectionItems }}</span>
                        </div>
                    </div>
                    
                    <div class="info-footer-desc">
                        <!-- 方案要求 -->
                        <div class="desc-section" v-if="schemeInfo.planRequirements">
                            <span class="info-label">方案要求</span>
                            <div class="desc-content">{{ schemeInfo.planRequirements }}</div>
                        </div>
                        <!-- 附件列表 -->
                        <div class="desc-section" v-if="schemeInfo.planAttachments && schemeInfo.planAttachments.length > 0">
                            <span class="info-label">方案附件</span>
                            <div class="attachments-row">
                                <a v-for="(file, index) in schemeInfo.planAttachments" :key="index" :href="file.url" target="_blank" class="file-tag">
                                    <el-icon><Document /></el-icon> {{ file.name }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 标签页内容 -->
        <div class="content-card">
            <div class="tabs-header">
                <div class="tab-item" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
                    任务列表
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'progress' }" @click="activeTab = 'progress'">
                    检测结果
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
                    进度监控
                </div>
            </div>

            <!-- 任务列表 -->
            <div v-if="activeTab === 'list'" class="tab-content">
                <div v-if="taskList.length === 0" class="empty-state">
                    <el-icon class="empty-icon" :size="64">
                        <Document />
                    </el-icon>
                    <p class="empty-text">尚未分配检测任务</p>
                    <el-button type="primary" @click="handleCreateTask">
                        新建检测任务
                    </el-button>
                </div>

                <div v-else class="task-table">
                    <el-table :data="taskList" :header-cell-style="headerCellStyle" border>
                        <el-table-column label="序号" type="index" width="60" align="center" />
                        <el-table-column label="任务编号" prop="taskNo" width="160" />
                        <el-table-column label="任务名称" prop="taskName" min-width="200" show-overflow-tooltip />
                        <el-table-column label="承担单位" prop="dept" min-width="150" show-overflow-tooltip />
                        <el-table-column label="检测数量" prop="quantity" width="100" align="center" />
                        <el-table-column label="完成数量" prop="completed" width="100" align="center" />
                        <el-table-column label="任务状态" prop="status" width="100" align="center">
                            <template #default="scope">
                                <span :class="['status-tag', getTaskStatusClass(scope.row.status)]">
                                    {{ scope.row.status }}
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180" align="center" fixed="right">
                            <template #default="scope">
                                <div class="table-operate-action-btns">
                                    <span class="table-edit-operate" @click="handleEditTask(scope.row)">编辑</span>
                                    <span class="table-delete-operate" @click="handleDeleteTask(scope.row)">删除</span>
                                    <span class="table-view-operate" @click="handleViewTask(scope.row)">查看</span>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <div class="pagination-wrapper">
                        <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                            :total="total" background layout="prev, pager, next" class="custom-pagination" />
                    </div>
                </div>
            </div>

            <!-- 检测进度 -->
            <div v-if="activeTab === 'progress'" class="tab-content">
                <DetectionProgress :tableData="progressList" :total="progressTotal" @query="handleProgressQuery"
                    @reset="handleProgressReset" />
            </div>

            <!-- 进度历史 -->
            <div v-if="activeTab === 'history'" class="tab-content">
                <ProgressHistory :treeData="historyData" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Document, TrendCharts, Clock } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as DetectionPlanApi from '@/api/agri/detectionPlan';
import { useDict, DICT_TYPE } from '@/hooks/web/useDict';
import DetectionProgress from '@/components/DetectionProgress/index.vue';
import ProgressHistory from '@/components/ProgressHistory/index.vue';

const router = useRouter();
const route = useRoute();

const activeTab = ref('list');

const { getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE);
const { getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY);

const schemeInfo = reactive({
    id: null,
    name: '--',
    no: '--',
    deptId: null,
    deptName: '--',
    type: '--',
    period: '--',
    region: '--',
    category: '--',
    executionTime: '--',
    status: '--',
    statusValue: null,
    taskProgress: 0,
    taskCompleted: 0,
    taskTotal: 0,
    sampleProgress: 0,
    sampleCompleted: 0,
    sampleTotal: 0,
    sampleCount: 0,
    detectionItems: '--',
    planRequirements: '',
    planAttachments: []
});

// 状态映射
const statusMap = {
    0: { text: '未开始', class: 'status-not-started' },
    1: { text: '进行中', class: 'status-processing' },
    2: { text: '已延期', class: 'status-delayed' },
    3: { text: '已完成', class: 'status-completed' },
    4: { text: '已结束', class: 'status-finished' }
};

const statusClass = computed(() => {
    return statusMap[schemeInfo.statusValue]?.class || '';
});

// 部门列表映射（模拟，实际可从后端获取）
const getDeptLabel = (value) => {
    const map = {
        1: '北京市农业农村局',
        2: '农业农村部（上海）',
        3: '天津市农业农村委员会',
        4: '重庆市农业局'
    };
    return map[value] || '--';
};

/** 组装周期文本 */
const formatPeriod = (data) => {
    const typeMap = { 1: '年度', 2: '月度', 3: '周度' };
    const parts = [];
    if (data.planPeriodType) parts.push(typeMap[data.planPeriodType] || '');
    if (data.planPeriodYear) parts.push(data.planPeriodYear + '年');
    if (data.planPeriodMonth) parts.push(data.planPeriodMonth + '月');
    if (data.planPeriodWeek) parts.push('第' + data.planPeriodWeek + '周');
    return parts.join(' ') || '--';
};

const loadPlanData = async (id) => {
    try {
        const data = await DetectionPlanApi.getDetectionPlan(id);
        if (data) {
            schemeInfo.id = data.id;
            schemeInfo.name = data.planName;
            schemeInfo.no = data.planCode;
            schemeInfo.deptId = data.issuerDeptId;
            schemeInfo.deptName = getDeptLabel(data.issuerDeptId);
            schemeInfo.type = getPlanTypeLabel(data.planType);
            schemeInfo.period = formatPeriod(data);
            schemeInfo.region = data.targetArea || '--';
            // 使用字典获取分类名称
            schemeInfo.category = data.targetCategory ? getProductCategoryLabel(data.targetCategory) : '--';
            schemeInfo.executionTime = `${data.planStartDate || ''} 至 ${data.planEndDate || ''}`;
            schemeInfo.status = statusMap[data.status]?.text || '未知';
            schemeInfo.statusValue = data.status;
            schemeInfo.sampleCount = data.sampleCount || 0;
            schemeInfo.detectionItems = data.detectionItems || '--';
            schemeInfo.planRequirements = data.planRequirements || '';
            
            // 获取统计数据
            try {
                const stats = await DetectionPlanApi.getPlanStatistics(id);
                if (stats) {
                    schemeInfo.taskProgress = stats.completionRate || 0;
                    schemeInfo.taskCompleted = stats.taskCompletedCount || 0;
                    schemeInfo.taskTotal = stats.taskTotalCount || 0;
                    
                    schemeInfo.sampleProgress = stats.sampleCompletionRate || 0;
                    schemeInfo.sampleCompleted = stats.sampleCompletedCount || 0;
                    schemeInfo.sampleTotal = stats.sampleCount || 0;
                }
            } catch (err) {
                console.warn('获取方案统计失败', err);
            }
            
            // 处理附件解析
            if (data.planAttachments) {
                try {
                    // 如果后端存储的是 JSON 字符串
                    schemeInfo.planAttachments = JSON.parse(data.planAttachments);
                } catch (e) {
                    // 如果已经是对象或数组，或者解析失败
                    if (Array.isArray(data.planAttachments)) {
                        schemeInfo.planAttachments = data.planAttachments;
                    } else if (typeof data.planAttachments === 'string') {
                        // 如果逗号分隔的 URL
                        schemeInfo.planAttachments = data.planAttachments.split(',').map((url, index) => ({
                            name: `附件${index + 1}`,
                            url: url.trim()
                        }));
                    } else {
                        schemeInfo.planAttachments = [];
                    }
                }
            } else {
                schemeInfo.planAttachments = [];
            }
        }
    } catch (error) {
        console.error('获取方案详情失败：', error);
        ElMessage.error('获取方案详情失败');
    }
};

const loadTaskList = async (id) => {
    try {
        const tasks = await DetectionPlanApi.getPlanTasks(id);
        taskList.value = tasks.map(t => ({
            id: t.id,
            taskNo: t.taskCode,
            taskName: t.taskName,
            dept: getDeptLabel(t.assignDeptId), // 假设后端返回了承担部门ID
            quantity: t.sampleCount,
            completed: t.completedCount || 0, // 假设后端返回了完成数
            status: t.status === 3 ? '已完成' : (t.status === 1 ? '进行中' : '未开始')
        }));
        total.value = taskList.value.length;
    } catch (error) {
        console.error('获取任务列表失败：', error);
    }
};

onMounted(async () => {
    const id = route.query.id;
    if (id) {
        await loadPlanData(Number(id));
        await loadTaskList(Number(id));
    } else {
        ElMessage.warning('方案参数错误');
        router.back();
    }
});

const taskList = ref([]);
const total = ref(0);

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

const progressQuery = reactive({
    task: '',
    org: '',
    sample: '',
    category: '',
    result: '',
    status: ''
});

const progressTotal = ref(100);
const progressPage = reactive({
    pageNum: 1,
    pageSize: 10
});

const progressList = ref([
    {
        sampleNo: 'yp20242132131',
        sampleName: '豇豆',
        category: '蔬菜',
        origin: '山东-济南',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        org: '盒马鲜生',
        testTime: '--',
        result: '--',
        status: '未检测'
    },
    {
        sampleNo: 'yp20242132131',
        sampleName: '草莓',
        category: '水果',
        origin: '山东-济南',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        org: '北京市平谷区农业综合检验检测中心',
        testTime: '2023-09-09',
        result: '阴性',
        status: '已检测'
    },
    {
        sampleNo: 'yp20242132131',
        sampleName: '桂鱼',
        category: '水产品',
        origin: '辽宁-大连',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        org: '北京果村蔬菜专业合作社',
        testTime: '2023-09-09',
        result: '结果异常',
        status: '失败'
    }
]);

// 进度历史树形数据
const historyData = reactive({
    name: '农产品例行检测',
    children: [
        {
            name: '海淀区任务检测中心',
            progress: '(100/500)',
            children: [
                {
                    name: '三一检测机构',
                    progress: '(100/400)',
                    children: [
                        { name: '朝阳大悦城检测中心' },
                        { name: '顺意检测' }
                    ]
                },
                {
                    name: '三二检测机构',
                    progress: '(0/100)',
                    warning: true
                }
            ]
        },
        {
            name: '朝阳区任务检测中心',
            children: [
                { name: '三三检测机构' },
                { name: '三四检测机构' },
                { name: '三五检测机构' }
            ]
        },
        {
            name: '大兴区任务检测中心',
            children: [
                { name: '兴隆检测机构' }
            ]
        },
        {
            name: '昌平区任务检测中心',
            children: [
                { name: '七一检测机构' },
                { name: '七二检测机构' },
                { name: '七三检测机构' },
                { name: '七四检测机构' },
                { name: '七五检测机构' },
                { name: '七六检测机构' },
                { name: '七七检测机构' },
                { name: '七八检测机构' },
                { name: '七九检测机构' },
                { name: '八十检测机构' }
            ]
        },
        {
            name: '西城区任务检测中心',
            children: []
        }
    ]
});

const handleProgressQuery = () => {
    ElMessage.success('查询成功');
};

const handleProgressReset = () => {
    progressQuery.task = '';
    progressQuery.org = '';
    progressQuery.sample = '';
    progressQuery.category = '';
    progressQuery.result = '';
    progressQuery.status = '';
    ElMessage.success('重置成功');
};

const handleSingleInput = () => {
    router.push('/rapidDetection/create');
};

const handleBatchImport = () => {
    router.push('/rapidDetection/batchImportData');
};

const handleViewDetail = (row) => {
    router.push({
        path: '/taskDetection/taskDetail',
        query: { id: row.sampleNo }
    });
};

const getTaskStatusClass = (status) => {
    const statusMap = {
        '未开始': 'status-not-started',
        '进行中': 'status-processing',
        '已完成': 'status-completed'
    };
    return statusMap[status] || '';
};

const handleCreateTask = () => {
    router.push({
        path: '/fastCheckPlan/createSchemeTask',
        query: { id: schemeInfo.id }
    });
};

const handleEditTask = (row) => {
    router.push({
        path: '/taskDetection/taskManagement',
        query: { id: row.taskNo, mode: 'edit' }
    });
};

const handleDeleteTask = (row) => {
    ElMessageBox.confirm(
        `确定要删除任务"${row.taskName}"吗？删除后将无法恢复。`,
        '删除确认',
        {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        ElMessage.success('删除成功');
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

const handleViewTask = (row) => {
    router.push({
        path: '/taskDetection/taskDetail',
        query: { id: row.taskNo }
    });
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 方案信息卡片 */
.scheme-info-card {
    background: #fff;
    border-radius: 10px;
    padding: var( --page-container-padding);
}

.info-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;

    .scheme-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }

    .scheme-no {
        font-size: 14px;
        color: #666;
    }
}

.info-content {
    display: flex;
    gap: 40px;
    align-items: flex-start;
}

/* 进度环区域 */
.progress-section-container {
    padding: 20px 0;
    min-width: 160px;
    border-right: 1px solid #f0f2f5;
}

.progress-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .progress-circle {
        :deep(.el-progress__text) {
            font-size: 16px !important;
            font-weight: bold;
            color: #2563eb;
        }
    }

    .progress-label {
        font-size: 14px;
        color: #64748b;
        margin: 0;
    }

    .progress-value {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        margin: 0;
    }
}

/* 信息列表区域 */
.info-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 40px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    line-height: 1.6;

    &.full-width {
        grid-column: span 2;
    }

    .info-label {
        width: 84px;
        font-size: 14px;
        color: #64748b;
        flex-shrink: 0;
        position: relative;
        padding-right: 12px;
        
        &::after {
            content: "";
            position: absolute;
            right: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 1px;
            height: 12px;
            background: transparent;
        }
    }

    .info-value {
        flex: 1;
        font-size: 14px;
        color: #1e293b;
        word-break: break-all;

        &.highlight {
            color: #2563eb;
            font-weight: 500;
        }
    }
}

.info-footer-desc {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 8px;
}

.desc-section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .info-label {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
    }

    .desc-content {
        background: #f8fafc;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        color: #475569;
        line-height: 1.6;
        border: 1px solid #f1f5f9;
    }
}

.attachments-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.file-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #eff6ff;
    color: #2563eb;
    border-radius: 6px;
    font-size: 13px;
    text-decoration: none;
    border: 1px solid #dbeafe;
    transition: all 0.2s;

    &:hover {
        background: #dbeafe;
        transform: translateY(-1px);
    }
}

/* 状态标签 */
.status-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &.status-not-started {
        background: #f1f5f9;
        color: #64748b;
    }

    &.status-processing {
        background: #eff6ff;
        color: #2563eb;
    }

    &.status-delayed {
        background: #fffbeb;
        color: #d97706;
    }

    &.status-completed {
        background: #f0fdf4;
        color: #16a34a;
    }

    &.status-finished {
        background: #f8fafc;
        color: #475569;
    }
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

/* 标签页头部 */
.tabs-header {
    display: flex;
    border-bottom: 2px solid #f0f0f0;
    padding: 0 32px;

    .tab-item {
        padding: 16px 24px;
        font-size: 15px;
        font-weight: 500;
        color: #666;
        cursor: pointer;
        position: relative;
        transition: all 0.3s;

        &:hover {
            color: #00B3ED;
        }

        &.active {
            color: #00B3ED;

            &::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 2px;
                background: #00B3ED;
            }
        }
    }
}

/* 标签页内容 */
.tab-content {
    flex: 1;
    padding: var(--page-container-padding);
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;

    .empty-icon {
        color: #D1D5DB;
        margin-bottom: 16px;
    }

    .empty-text {
        font-size: 14px;
        color: #999;
        margin: 0 0 24px 0;
    }

    .create-task-btn {
        min-width: 140px;
        height: 44px;
        border-radius: 8px;
    }
}

/* 玻璃拟态子卡片通用样式 */
.glass-sub-card {
    background: #fff;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.5);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
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

        // .el-button {
        //     height: 44px;
        //     min-width: 120px;
        //     border-radius: 8px;
        //     font-weight: 600;
        //     letter-spacing: 1px;
        //     transition: all 0.2s;

        //     &:hover {
        //         transform: scale(1.02);
        //     }

        //     &:active {
        //         transform: scale(0.98);
        //     }
        // }
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
        padding: 20px;
        display: flex;
        justify-content: flex-end;
        background: rgba(255, 255, 255, 0.2);
        border-top: 1px solid rgba(235, 238, 245, 0.3);
    }
}

/* 进度历史树形结构 */
.history-tree {
    padding: 20px;
    overflow-x: auto;
}

.tree-root {
    display: flex;
    align-items: flex-start;
}

.root-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 30px;
    white-space: nowrap;
    margin-top: 20px;

    .node-text {
        font-size: 14px;
        color: #333;
        font-weight: 500;
    }
}

.node-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #00B3ED;
    background: #fff;
    flex-shrink: 0;
    position: relative;
    z-index: 2;

    &.root-dot {
        width: 10px;
        height: 10px;
        border-color: #004CEE;
    }
}

.tree-level {
    display: flex;
    flex-direction: column;
    position: relative;
}

.tree-branch {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding: 12px 0;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: -26px;
        width: 1px;
        background: #e1e1e1;
    }

    &:first-child::before {
        top: 26px;
    }

    &:last-child::before {
        bottom: auto;
        height: 21px;
    }

    &:only-child::before {
        display: none;
    }
}

.branch-line {
    width: 30px;
    height: 1px;
    background: #e1e1e1;
    margin-top: 13px;
    flex-shrink: 0;
}

.branch-content {
    display: flex;
    align-items: flex-start;
}

.node-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 20px;
    white-space: nowrap;
    position: relative;
    margin-top: 4px;

    .node-text {
        font-size: 14px;
        color: #333;
    }

    .node-progress {
        font-size: 12px;
        color: #F5A623;
        margin-left: 4px;

        &.warning {
            color: #F5222D;
        }
    }
}

.level1-node .node-dot {
    border-color: #00B3ED;
}

.level2-node .node-dot {
    border-color: #F5A623;
}

.level3-node .node-dot {
    border-color: #52C41A;
}

.level-2,
.level-3 {
    margin-left: 20px;
    margin-top: -12px;
}
</style>
