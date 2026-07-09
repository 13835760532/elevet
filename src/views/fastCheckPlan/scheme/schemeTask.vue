<template>
    <div class="page-container">
        <PageBack />

        <div style="flex:1;overflow-y: auto;">

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
                                <el-progress type="circle" :percentage="schemeInfo.taskProgress" :width="110"
                                    :stroke-width="10" color="#00B3ED" />
                            </div>
                            <p class="progress-label">任务总完成率</p>
                            <p class="progress-value">{{ schemeInfo.taskCompleted }}/{{ schemeInfo.sampleCount }}</p>
                        </div>
                    </div>

                    <!-- 右侧信息详情列表 -->
                    <div class="info-list">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">主管单位</span>
                                <span class="info-value highlight">
                                    {{ schemeInfo.issuerDeptName || schemeInfo.deptName }}</span>
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
                            <!-- <div class="info-item full-width">
                                <span class="info-label">检测项目</span>
                                <span class="info-value">{{ schemeInfo.detectionItems }}</span>
                            </div> -->
                        </div>

                        <div class="info-footer-desc">
                            <!-- 方案要求 -->
                            <div class="desc-section" v-if="schemeInfo.planRequirements">
                                <span class="info-label">方案要求</span>
                                <div class="desc-content">{{ schemeInfo.planRequirements }}</div>
                            </div>
                            <!-- 附件列表 -->
                            <div class="desc-section"
                                v-if="schemeInfo.planAttachments && schemeInfo.planAttachments.length > 0">
                                <span class="info-label">方案附件</span>
                                <div class="attachments-row">
                                    <div v-for="(file, index) in schemeInfo.planAttachments" :key="index"
                                        class="file-tag" @click="handlePreviewFile(file)">
                                        <el-icon>
                                            <Document />
                                        </el-icon> {{ file.name }}
                                        <span class="preview-hint">预览</span>
                                    </div>
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
                    <div class="task-list-operations">
                        <!-- 查询区域 -->
                        <div class="query-section" style="padding: 0;" v-if="allTaskList.length">
                            <el-form :model="queryParams" :inline="true"
                                class="custom-query-form custom-query-form-row">
                                <el-form-item label="" style="width: 200px!important">
                                    <el-input v-model="queryParams.task" placeholder="输入任务编号/任务名称"
                                        style="width: 200px!important" clearable />
                                </el-form-item>
                                <el-form-item label="">
                                    <el-select v-model="queryParams.deptType" placeholder="机构类型" style="width: 150px;"
                                        clearable @change="handleDeptTypeChange">
                                        <el-option label="监管机构" :value="1" />
                                        <el-option label="检测机构" :value="2" />
                                        <el-option label="生产经营企业" :value="3" />
                                        <el-option label="平台运营机构" :value="4" />
                                    </el-select>
                                </el-form-item>

                                <el-form-item label="">
                                    <el-select v-model="queryParams.status" placeholder="任务状态" style="width: 150px;"
                                        class="w120" clearable>
                                        <el-option label="进行中" value="进行中" />
                                        <el-option label="已完成" value="已完成" />
                                        <el-option label="已延期" value="已延期" />
                                        <el-option label="未开始" value="未开始" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="">
                                    <el-date-picker v-model="queryParams.dateRange" type="daterange" range-separator="-"
                                        start-placeholder="开始日期" end-placeholder="结束日期" class="date-picker-custom"
                                        style="width: 280px!important" value-format="YYYY-MM-DD" />
                                </el-form-item>
                                <div class="query-btns">
                                    <el-button @click="handleReset">重置</el-button>
                                    <el-button type="primary" class="search-btn" @click="handleQuery">查询</el-button>
                                </div>
                            </el-form>
                        </div>

                        <div class="separator-line" v-if="allTaskList.length"></div>

                        <!-- 操作按钮区域 -->
                        <div class="action-bar">
                            <el-button type="primary" class="new-task-btn" @click="handleCreateTask">
                                新建检测任务
                            </el-button>
                            <el-button type="primary" class="export-btn" @click="handleExport">
                                导出
                            </el-button>
                        </div>
                    </div>

                    <div v-if="allTaskList.length === 0 && !loading" class="empty-state">
                        <el-icon class="empty-icon" :size="64">
                            <Document />
                        </el-icon>
                        <p class="empty-text">尚未分配检测任务</p>
                        <el-button type="primary" class="new-task-btn" @click="handleCreateTask">
                            新建检测任务
                        </el-button>
                    </div>

                    <div v-else class="task-table">

                        <el-table :data="taskList" :header-cell-style="headerCellStyle" border style="width: 100%">
                            <el-table-column label="序号" type="index" width="60" align="center" />
                            <el-table-column label="任务编号" prop="taskNo" width="140" align="center" />
                            <el-table-column label="任务名称" prop="taskName" min-width="200" show-overflow-tooltip />
                            <el-table-column label="承担单位" prop="dept" min-width="160" show-overflow-tooltip />
                            <el-table-column label="检测区域范围" prop="region" width="120" align="center"
                                show-overflow-tooltip />
                            <el-table-column label="检测品种" prop="varieties" min-width="150" align="center"
                                show-overflow-tooltip />
                            <el-table-column label="检测项目" prop="items" min-width="150" align="center"
                                show-overflow-tooltip />
                            <el-table-column label="执行时间" prop="timeRange" width="200" align="center" />
                            <el-table-column label="任务完成率 (已完成样品数/总样品数)" width="250" align="center">
                                <template #default="scope">
                                    <div class="completion-rate-cell">
                                        <span class="rate-pct">{{ scope.row.percentage }}%</span>
                                        <span class="rate-counts">({{ scope.row.completed }}/{{ scope.row.total
                                        }})</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" prop="status" width="100" align="center">
                                <template #default="scope">
                                    <span :class="['status-tag', getTaskStatusClass(scope.row.status)]">
                                        {{ scope.row.status }}
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="160" align="center" fixed="right">
                                <template #default="scope">
                                    <div class="table-operate-action-btns">
                                        <span class="table-view-operate" @click="handleViewTask(scope.row)">查看</span>
                                        <span class="table-edit-operate" v-if="[1, 2].includes(+scope.row.status)"
                                            style="color: #00B3ED; margin-left: 10px;"
                                            @click="handleCreateSubTask(scope.row)">新建子任务</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 分页 -->
                        <div class="pagination-wrapper" style="margin-top: 20px;">
                            <el-pagination :current-page="pageParams.pageNum" :page-size="pageParams.pageSize"
                                :total="total" background layout="total, sizes, prev, pager, next, jumper"
                                class="custom-pagination" @current-change="handleTaskPageChange"
                                @size-change="handleTaskSizeChange" />
                        </div>
                    </div>
                </div>

                <!-- 检测进度 -->
                <div v-if="activeTab === 'progress'" class="tab-content">
                    <DetectionProgress :tableData="progressList" :total="progressTotal" :task-options="taskOptions"
                        :category-options="categoryOptions" @query="handleProgressQuery" @reset="handleProgressReset"
                        @view-detail="handleViewDetail" />
                </div>

                <!-- 进度历史 -->
                <div v-if="activeTab === 'history'" class="tab-content">
                    <ProgressHistory :treeData="historyData" />
                </div>
            </div>
        </div>

        <!-- 图片预览组件 -->
        <el-image-viewer v-if="showImageViewer" :url-list="[previewImageUrl]" @close="showImageViewer = false" />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Document, TrendCharts, Clock } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as DetectionPlanApi from '@/api/agri/detectionPlan';
import * as DetectionTaskApi from '@/api/agri/detectionTask';
import * as DeptApi from '@/api/system/dept';
import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import { useDict, DICT_TYPE } from '@/hooks/web/useDict';
import download from '@/utils/download';
import { formatDate } from '@/utils/formatTime';
import DetectionProgress from '@/components/DetectionProgress/index.vue';
import ProgressHistory from '@/components/ProgressHistory/index.vue';

const router = useRouter();
const route = useRoute();



const { getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE);
const { getLabel: getProductCategoryLabel, options: productCategoryOptions } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY);

// --- 状态定义 ---
const loading = ref(false);
const activeTab = ref('list');

// 方案基础信息
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

// 任务列表相关
const allTaskList = ref([]);
const taskList = ref([]);
const taskOptions = ref([]);
const total = ref(0);

const deptList = ref([]);
const deptTypeMap = ref({});
const deptNameTypeMap = ref({});

const queryParams = reactive({
    task: '',
    deptType: undefined,
    status: '',
    dateRange: []
});

const handleDeptTypeChange = () => {
    applyFilters();
};

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

// 检测进度/结果相关
const progressQuery = reactive({
    task: '',
    org: '',
    sample: '',
    category: '',
    result: '',
    status: ''
});

const progressPage = reactive({
    pageNum: 1,
    pageSize: 10
});

const progressList = ref([]);
const progressTotal = ref(0);
let isLoadingResults = false;

// 历史进度相关
const historyData = ref({
    name: '监测方案',
    children: []
});

const categoryOptions = ref([]);

// 附件预览相关
const showImageViewer = ref(false);
const previewImageUrl = ref('');

const handlePreviewFile = (file) => {
    if (!file.url) return;
    const url = file.url.toLowerCase();
    const isImg = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

    if (isImg) {
        previewImageUrl.value = file.url;
        showImageViewer.value = true;
    } else {
        // PDF, Word, Excel 等其他文件，在新标签页打开（浏览器通常会处理 PDF 预览，其他文件会下载）
        window.open(file.url, '_blank');
    }
};

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

// 部门列表映射（从后端获取）
const deptMap = ref({});
const getDeptLabel = (value) => {
    return deptMap.value[value] || '--';
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
                    schemeInfo.taskProgress = stats.sampleCompletionRate || 0;
                    schemeInfo.taskCompleted = stats.sampleCompletedCount || 0;
                    schemeInfo.taskTotal = stats.taskTotalCount || 0;

                }
            } catch (err) {
                console.warn('获取方案统计失败', err);
            }

            // 处理附件解析
            if (data.planAttachments) {
                try {
                    let parsed;
                    if (typeof data.planAttachments === 'string') {
                        parsed = JSON.parse(data.planAttachments);
                    } else {
                        parsed = data.planAttachments;
                    }

                    if (Array.isArray(parsed)) {
                        schemeInfo.planAttachments = parsed.map((item, index) => {
                            // 格式 1: 字符串 URL ["http://..."]
                            if (typeof item === 'string') {
                                return {
                                    name: item.substring(item.lastIndexOf('/') + 1) || `附件${index + 1}`,
                                    url: item
                                };
                            }
                            // 格式 2: 对象 {name, url}
                            return item;
                        });
                    } else if (typeof data.planAttachments === 'string') {
                        // 兜底: 非 JSON 的普通逗号分隔字符串
                        schemeInfo.planAttachments = data.planAttachments.split(',').map((url, index) => ({
                            name: url.substring(url.lastIndexOf('/') + 1) || `附件${index + 1}`,
                            url: url.trim()
                        }));
                    }
                } catch (e) {
                    console.warn('解析附件失败', e);
                    schemeInfo.planAttachments = [];
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
        const allTasks = tasks || [];

        const results = allTasks.map(t => {
            const total = t.sampleCount || 0;
            const completed = t.completedCount || 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                id: t.id,
                parentId: t.parentId,
                taskNo: t.taskCode,
                taskName: t.taskName,
                assignDeptId: t.assignDeptId,
                dept: t.assignDeptName || getDeptLabel(t.assignDeptId),
                region: t.detectionArea || '--',
                varieties: t.detectionVarieties || '--',
                items: t.detectionItems || '--',
                timeRange: t.startDate && t.endDate ? `${t.startDate}至${t.endDate}` : '--',
                startDate: t.startDate,
                endDate: t.endDate,
                total,
                completed: t.sampleCompletedCount,
                percentage: t.sampleCompletionRate,
                status: t.status === 3 ? '已完成' : (t.status === 2 ? '已延期' : (t.status === 1 ? '进行中' : '未开始'))
            };
        });
        allTaskList.value = results;
        applyFilters();

        taskOptions.value = results.map(t => ({ label: t.taskName, value: t.id }));
        total.value = results.length;

        // 根据 parentId 组装历史进度树形数据
        const taskMap = new Map();
        const treeRoots = [];

        allTasks.forEach(t => {
            const totalCount = t.sampleCount || 0;
            const completedCount = t.completedCount || 0;
            taskMap.set(t.id, {
                id: t.id,
                name: t.taskName || t.assignDeptName || getDeptLabel(t.assignDeptId) || '未命名任务',
                progress: totalCount > 0 ? `(${completedCount}/${totalCount})` : '',
                warning: t.status === 2,
                children: [],
                parentId: t.parentId
            });
        });

        allTasks.forEach(t => {
            const node = taskMap.get(t.id);
            if (node.parentId && node.parentId !== 0 && taskMap.has(node.parentId)) {
                taskMap.get(node.parentId).children.push(node);
            } else {
                treeRoots.push(node);
            }
        });

        historyData.value = {
            name: schemeInfo.name || '监测方案',
            children: treeRoots
        };
    } catch (error) {
        console.error('获取任务列表失败：', error);
    }
};

onMounted(async () => {
    const id = route.query.id;
    if (id) {
        // 先加载部门字典数据
        try {
            const depts = await DeptApi.getSimpleDeptList();
            deptList.value = depts || [];
            const map = {};
            const typeMap = {};
            const nameTypeMap = {};
            depts.forEach(d => {
                map[d.id] = d.name;
                if (d.deptType !== undefined && d.deptType !== null) {
                    typeMap[d.id] = d.deptType;
                    nameTypeMap[d.name] = d.deptType;
                }
            });
            deptMap.value = map;
            deptTypeMap.value = typeMap;
            deptNameTypeMap.value = nameTypeMap;
        } catch (e) {
            console.warn('获取部门列表失败', e);
        }

        // 初始化进度树形分类选项
        categoryOptions.value = (productCategoryOptions.value || []).map(opt => ({ label: opt.label, value: opt.value }));

        await loadPlanData(Number(id));
        await loadTaskList(Number(id));
        // 初始化加载检测结果
        handleProgressQuery();
    } else {
        ElMessage.warning('方案参数错误');
        router.back();
    }
});



const handleTaskSizeChange = (val) => {
    pageParams.pageSize = val;
    pageParams.pageNum = 1;
    // loadTaskList(route.query.id); 重新加载
};

const handleTaskPageChange = (val) => {
    pageParams.pageNum = val;
    // loadTaskList(route.query.id); 重新加载
};



/** 加载检测结果列表 */
const loadDetectionResults = async (params = {}) => {
    if (isLoadingResults) return; // 防止递归调用
    isLoadingResults = true;
    try {
        const id = route.query.id;
        if (!id) return;

        const queryParams = {
            planId: id,
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
            category: item.productCategory || '--',
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

const handleProgressQuery = (params) => {
    loadDetectionResults(params);
};

const handleProgressReset = () => {
    loadDetectionResults();
};

const handleSingleInput = () => {
    router.push('/rapidDetection/create');
};

const handleBatchImport = () => {
    router.push('/rapidDetection/batchImportData');
};

const handleViewDetail = (row) => {
    router.push({
        path: '/fastCheckPlan/resultDetail',
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

const handleQuery = () => {
    applyFilters();
};

const handleReset = () => {
    queryParams.task = '';
    queryParams.deptType = undefined;
    queryParams.status = '';
    queryParams.dateRange = [];
    applyFilters();
};

const applyFilters = () => {
    let filtered = [...allTaskList.value];

    if (queryParams.task) {
        const keyword = queryParams.task.toLowerCase();
        filtered = filtered.filter(t =>
            (t.taskNo && t.taskNo.toLowerCase().includes(keyword)) ||
            (t.taskName && t.taskName.toLowerCase().includes(keyword))
        );
    }

    if (queryParams.deptType !== undefined && queryParams.deptType !== null && queryParams.deptType !== '') {
        filtered = filtered.filter(t => {
            const typeById = deptTypeMap.value[t.assignDeptId];
            const typeByName = deptNameTypeMap.value[t.dept];
            const targetType = typeById !== undefined ? typeById : typeByName;
            return targetType === queryParams.deptType;
        });
    }

    if (queryParams.status) {
        filtered = filtered.filter(t => t.status === queryParams.status);
    }

    if (queryParams.dateRange && queryParams.dateRange.length === 2) {
        const start = new Date(queryParams.dateRange[0]);
        const end = new Date(queryParams.dateRange[1]);
        filtered = filtered.filter(t => {
            if (!t.startDate) return false;
            const taskDate = new Date(t.startDate);
            return taskDate >= start && taskDate <= end;
        });
    }

    taskList.value = filtered;
};

const handleExport = async () => {
    try {
        await ElMessageBox.confirm('是否确认导出所有检测任务数据？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        const params = {
            planId: route.query.id,
            taskName: queryParams.task || undefined,
            status: queryParams.status === '进行中' ? 1 :
                (queryParams.status === '已完成' ? 3 :
                    (queryParams.status === '已延期' ? 2 :
                        (queryParams.status === '未开始' ? 0 : undefined))),
            // 注意：OpenAPI 中 unit 对应关系可能需要根据实际业务调整，此处暂传为 subjectId
            subjectId: queryParams.unit || undefined
        };

        const res = await DetectionTaskApi.exportDetectionTask(params);
        if (res) {
            download.excel(res, '检测任务导出.xls');
            ElMessage.success('导出成功');
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('导出任务失败：', error);
            ElMessage.error('导出任务失败');
        }
    }
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
        path: '/fastCheckPlan/taskAllocate',
        query: { id: row.id }
    });
};

const handleCreateSubTask = (row) => {
    router.push({
        path: '/fastCheckPlan/createSchemeTask',
        query: {
            id: schemeInfo.id,
            parentId: row.id,
            mode: 'sub'
        }
    });
};
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 86px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 方案信息卡片 */
.scheme-info-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
    margin-bottom: 12px;
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

/* 任务列表表格自定义样式 */
.completion-rate-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    .rate-pct {
        font-weight: 600;
        color: #1e293b;
    }

    .rate-counts {
        font-size: 12px;
        color: #64748b;
    }
}

.table-operate-action-btns {
    display: flex;
    justify-content: center;
    gap: 12px;

    span {
        cursor: pointer;
        font-size: 14px;
        transition: opacity 0.2s;

        &:hover {
            opacity: 0.8;
        }
    }

    .table-view-operate {
        color: #00B3ED;
    }

    .table-edit-operate {
        color: #00B3ED;
        font-weight: 500;
    }
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
            color: #00B3ED;
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
            color: #00B3ED;
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
    color: #00B3ED;
    border-radius: 6px;
    font-size: 13px;
    text-decoration: none;
    border: 1px solid #dbeafe;
    transition: all 0.2s;
    cursor: pointer;

    &:hover {
        background: #dbeafe;
        transform: translateY(-1px);

        .preview-hint {
            opacity: 1;
        }
    }

    .preview-hint {
        font-size: 11px;
        opacity: 0.6;
        margin-left: 4px;
        border-left: 1px solid rgba(37, 99, 235, 0.2);
        padding-left: 6px;
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
        color: #00B3ED;
    }

    &.status-delayed {
        background: #FEF2F2;
        color: #B91C1C;
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

    }
}

/* 任务列表操作区域 */
.task-list-operations {
    padding-bottom: 14px;

    .query-section {
        padding: 10px 0;

        .custom-query-form {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;

            :deep(.el-form-item) {
                margin-right: 0;
                margin-bottom: 0;
                display: flex;
                align-items: center;

                .el-form-item__label {
                    padding-right: 8px;
                    font-weight: 500;
                    color: #475569;
                }
            }

            .query-btns {
                margin-left: auto;
                display: flex;
                gap: 12px;

                .search-btn {
                    background-color: #00B3ED;
                    border-color: #00B3ED;
                }
            }
        }
    }

    .separator-line {
        height: 1px;
        background-color: #f1f5f9;
        margin: 8px 0;
    }

    .action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;

        .new-task-btn,
        .export-btn {
            background-color: #00B3ED;
            border-color: #00B3ED;
        }

        .export-btn {
            margin-left: auto;
        }
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
        color: #00B3ED;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
    }

    .pagination-wrapper {
        padding: 20px;
        display: flex;
        justify-content: flex-end;
        background: rgba(255, 255, 255, 0.2);
        border-top: 1px solid rgba(235, 238, 245, 0.3);
        margin-top: 20px;
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
