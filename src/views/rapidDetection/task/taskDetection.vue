<template>
    <div class="table-container">
        <PageBack />
        <div class="result-container">
            <!-- 任务信息卡片 -->
            <div class="guide-card task-info-card" v-loading="loadingInfo">
                <h2 class="task-title">
                    {{ taskDetail.taskName || '--' }}-{{ taskDetail.taskCode || '--' }}
                    <span class="task-code" v-if="taskDetail.assignDeptName || deptMap[taskDetail.assignDeptId]">【{{
                        taskDetail.assignDeptName || deptMap[taskDetail.assignDeptId] }}】</span>
                </h2>

                <div class="task-detail-grid">
                    <!-- 左侧环形进度 -->
                    <div class="progress-section">
                        <el-progress type="circle" :percentage="taskDetail.sampleCompletionRate || 0" :width="120"
                            color="#00B3ED" :stroke-width="10" />
                        <div class="progress-label">任务完成率</div>
                        <div class="progress-info">({{ taskDetail.sampleCompletedCount || 0 }}/{{ taskDetail.sampleCount
                            ||
                            0 }})</div>
                    </div>

                    <!-- 右侧任务详情 -->
                    <div class="info-section">
                        <div class="info-row">
                            <span class="label">所属方案</span>
                            <span class="value">{{ taskDetail.planInfo?.planName || taskDetail.planName ||
                                taskDetail.planId || '--' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">方案主管</span>
                            <span class="value link"
                                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 500px; display: inline-block; vertical-align: bottom;">
                                {{ taskDetail.planInfo?.issuerDeptName || taskDetail.issuerDeptName ||
                                    deptMap[taskDetail.planInfo?.issuerDeptId] || deptMap[taskDetail.issuerDeptId] || '--'
                                }}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="label">任务类型</span>
                            <span class="value link">{{ typeof taskDetail.taskType === 'number' ? (taskDetail.taskType
                                === 1
                                ? '快速检测' : '其它') : '--' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">产品分类</span>
                            <span class="value link">{{ taskDetail.detectionVarieties || '--' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">检测地区</span>
                            <span class="value link">{{ taskDetail.detectionArea || '--' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">执行时间</span>
                            <span class="value link">
                                {{ taskDetail.startDate ? taskDetail.startDate.split(' ')[0] : '--' }} 至 {{
                                    taskDetail.endDate ? taskDetail.endDate.split(' ')[0] : '--' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 抽样检测查询 -->
            <div class="query-card" style="margin-top: 10px">
                <div class="query-form-wrapper">
                    <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row"
                        label-position="left">
                        <el-form-item label="">
                            <el-input :prefix-icon="Search" v-model="queryParams.sampleKeyword" placeholder="样品编号或样品名称"
                                class="custom-input w220" />
                        </el-form-item>
                        <el-form-item label="">
                            <el-select v-model="queryParams.unit" placeholder="承担单位" class="custom-select" clearable>
                                <el-option label="全部" value="" />
                                <el-option v-for="item in deptOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="">
                            <el-tree-select
                                v-model="queryParams.category"
                                :data="produceCategoryTree"
                                :props="{ label: 'name', value: 'name', children: 'children' }"
                                node-key="name"
                                placeholder="产品分类"
                                class="custom-select"
                                popper-class="product-category-tree-popper"
                                :fit-input-width="false"
                                clearable
                                filterable
                                check-strictly
                            />
                        </el-form-item>
                        <el-form-item label="">
                            <el-select v-model="queryParams.location" placeholder="采样场所" class="custom-select"
                                clearable>
                                <el-option label="全部" value="" />
                                <el-option v-for="item in samplingLocationOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="">
                            <el-select v-model="queryParams.status" placeholder="检测状态" class="custom-select" clearable>
                                <el-option label="全部" value="" />
                                <el-option v-for="item in detectionStatusOptions" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </el-form-item>
                        <div class="query-btns">
                            <el-button @click="handleReset" class="reset-btn">重置</el-button>
                            <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                        </div>
                    </el-form>
                </div>

                <!-- 操作按钮行 -->
                <div class="table-actions" style="margin-bottom: 0;">
                    <div class="action-left">
                        <el-button @click="handleExport">导出</el-button>
                    </div>
                    <div class="action-right">
                        <el-button type="primary" @click="handleSingleInput" class="primary-btn">检测单条录入</el-button>
                    </div>
                </div>


                <!-- 数据表格区域 -->
                <div class="content-card" style="padding: 0; margin-top: 10px;">
                    <div class="table-wrapper">
                        <el-table :data="tableList" min-height="300" v-loading="loadingList" border="false">
                            <el-table-column label="序号" type="index" width="60" align="center" />
                            <el-table-column label="样品编号" prop="sampleCode" width="160" align="center" />
                            <el-table-column label="样品名称" prop="productName" width="100" align="center" />
                            <el-table-column label="样品来源" prop="sampleSource" width="110" align="center"
                                show-overflow-tooltip />
                            <el-table-column label="产品分类" prop="productCategory" width="90" align="center">
                                <template #default="scope">
                                    {{ getCategoryLabel(scope.row.productCategory) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="产地" prop="sampleArea" width="110" align="center"
                                show-overflow-tooltip />
                            <el-table-column label="被检主体名称" prop="subjectName" min-width="120" show-overflow-tooltip />
                            <el-table-column label="抽检地区" prop="detectionArea" width="110" align="center" />
                            <el-table-column label="检测机构" prop="detectionOrgName" min-width="140"
                                show-overflow-tooltip />
                            <el-table-column label="检测时间" prop="testTime" width="130" align="center" />
                            <el-table-column label="检测项目" prop="detectionItems" min-width="140" align="center"
                                show-overflow-tooltip />
                            <el-table-column label="检测结果" prop="testResult" width="100" align="center" />
                            <el-table-column label="是否公开" prop="publicFlagText" width="90" align="center" />
                            <el-table-column label="是否复检" prop="recheckText" width="90" align="center" />
                            <el-table-column label="检测状态" prop="status" width="100" align="center">
                                <template #default="scope">
                                    <span :class="['status-tag', statusMap[scope.row.status]?.apiClass]">
                                        {{ statusMap[scope.row.status]?.text }}
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="170" align="center" fixed="right">
                                <template #default="scope">
                                    <div class="table-operate-action-btns">
                                        <template v-if="scope.row.status === 0">
                                            <span class="table-edit-operate" @click="handleTest(scope.row)">去检测</span>
                                            <span class="table-delete-operate"
                                                @click="handleDelete(scope.row)">删除</span>
                                        </template>
                                        <template v-else-if="scope.row.status === 1">
                                            <span class="table-edit-operate" @click="handleRetest(scope.row)"
                                                v-if="!scope.row.recheckNo">复检结果</span>
                                            <span class="table-view-operate" @click="handleView(scope.row)">查看详情</span>
                                        </template>
                                        <template v-else>
                                            <span class="table-edit-operate" @click="handleTest(scope.row)">去检测</span>
                                        </template>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <!-- 分页区域 -->
                    <div class="pagination-wrapper">
                        <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                            :total="total" background layout="total, sizes, prev, pager, next, jumper"
                            @size-change="getList" @current-change="getList" class="custom-pagination" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, QuestionFilled } from '@element-plus/icons-vue';
import * as DetectionTaskApi from '@/api/agri/detectionTask';
import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import * as ProduceCategoryApi from '@/api/agri/produceCategory';
import * as DeptApi from '@/api/system/dept';
import { formatDate } from '@/utils/formatTime';
import { useDict } from '@/hooks/web/useDict';
import download from '@/utils/download';
import { useMessage } from '@/hooks/web/useMessage';
import { handleTree } from '@/utils/tree';

const router = useRouter();
const route = useRoute();
const activeTab = ref('task');
const message = useMessage();
const deptOptions = ref([]);
const productCategoryDict = useDict('agri_product_category', 'str');
const produceCategoryTree = ref([]);

/**
 * getCategoryLabel：优先从产品分类树中查找名称，兼容字典与原始值
 */
const getCategoryLabel = (val) => {
    if (!val && val !== 0) return '--';
    const findLabel = (nodes) => {
        for (const node of nodes) {
            if (String(node.code) === String(val) || String(node.name) === String(val) || String(node.id) === String(val)) {
                return node.name;
            }
            if (node.children?.length) {
                const found = findLabel(node.children);
                if (found) return found;
            }
        }
        return null;
    };
    const foundName = findLabel(produceCategoryTree.value);
    return foundName || productCategoryDict.getLabel(val) || val;
};

/** 加载农产品行业分类树（支持一级与二级分类） */
const loadProduceCategoryTree = async () => {
    try {
        const res = await ProduceCategoryApi.getProduceCategoryPage({
            pageNo: 1,
            pageSize: 1000,
            type: '1' // 1-分类
        });
        const list = res?.list || [];
        produceCategoryTree.value = handleTree(list);
    } catch (error) {
        console.error('加载农产品分类失败:', error);
    }
};

const samplingLocationOptions = ref([
    { label: '田间', value: '田间' },
    { label: '市场', value: '市场' },
    { label: '商超', value: '商超' },
    { label: '基地', value: '基地' },
    { label: '其他', value: '其他' }
]);
const detectionStatusOptions = ref([
    { label: '未检测', value: '0' },
    { label: '已检测', value: '1' },
    { label: '失败', value: '2' }
]);

const loadingInfo = ref(false);
const taskDetail = ref({});
const deptMap = ref({});

/** 初始化部门名称映射和当前任务详情，供任务概览及责任单位回显。 */
const initData = async () => {
    // 获取部门字典供映射使用
    try {
        const depts = await DeptApi.getSimpleDeptList();
        const map = {};
        depts.forEach(d => {
            map[d.id] = d.name;
        });
        deptMap.value = map;
    } catch { }

    const id = route.query.id || route.params.id;
    if (id) {
        loadingInfo.value = true;
        try {
            const data = await DetectionTaskApi.getDetectionTask(id);
            if (data) {
                taskDetail.value = data;
            }
        } catch (e) {
            console.error(e);
        } finally {
            loadingInfo.value = false;
        }
    }
}

const statusMap = {
    0: { text: '未检测', class: 'status-pending', apiClass: 'status-pending' },
    1: { text: '已检测', class: 'status-done', apiClass: 'status-completed' },
    2: { text: '失败', class: 'status-failed', apiClass: 'status-delayed' }
};

const queryParams = reactive({
    sampleKeyword: '',
    unit: '',
    category: '',
    location: '',
    status: ''
});

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

const total = ref(0);

const tableList = ref([]);
const loadingList = ref(false);

/**
 * 加载当前任务下的检测记录，并统一 AI 识别时间、检测项目、来源和结果状态的展示口径。
 */
const getList = async () => {
    loadingList.value = true;
    try {
        const req = {
            pageNo: pageParams.pageNum,
            pageSize: pageParams.pageSize,
            taskId: route.query.id || route.params.id,
            sampleCode: queryParams.sampleKeyword || undefined,
            sampleName: queryParams.sampleKeyword || undefined,
            productCategory: queryParams.category || undefined,
            detectionOrgName: queryParams.unit || undefined, // Unit / 机构名称
            status: queryParams.status !== '' ? queryParams.status : undefined,
            samplingLocation: queryParams.location !== '' ? queryParams.location : undefined,
        };

        const data = await DetectionRecordApi.getDetectionRecordPage(req);

        tableList.value = (data.list || []).map(item => {
            // 解析 AI JSON 时间
            let time = item.detectionDate ? formatDate(item.detectionDate, 'YYYY-MM-DD') : '-';
            if (item.aiRecognitionResult) {
                try {
                    const aiParse = JSON.parse(item.aiRecognitionResult);
                    if (aiParse.timestamp) {
                        time = formatDate(aiParse.timestamp, 'YYYY-MM-DD');
                    }
                } catch (e) { }
            }

            return {
                ...item,
                testTime: time,
                sampleSource: item.sampleSource || item.samplingLocation || '田间/市场/其他',
                sampleArea: item.sampleArea || item.sampleOrigin || '-',
                detectionItems: formatDetectionItems(item.aiRecognitionResult),
                publicFlagText: item.publicFlag ? '公开' : '不公开',
                recheckText: item.recheckNo ? '是' : '否',
                testResult: item.overallResult === 0 ? '阴性' : (item.overallResult === 1 ? '阳性' : (item.overallResult === 2 ? '结果异常' : '-'))
            };
        });
        total.value = data.total || 0;
    } catch (err) {
        console.error(err);
    } finally {
        loadingList.value = false;
    }
}

/** 从 AI 识别 JSON 中提取检测项目名称，旧数据不是标准 JSON 时直接保留原文本。 */
const formatDetectionItems = (value) => {
    if (!value) return '-';
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed?.results)) {
            const names = parsed.results.map((item) => item.codeName).filter(Boolean);
            return names.length ? names.join('、') : '-';
        }
    } catch { }
    return typeof value === 'string' ? value : '-';
};

/**\n * loadDeptOptions：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。\n */
const loadDeptOptions = async () => {
    try {
        const data = await DeptApi.searchDeptList({ deptType: 2 });
        deptOptions.value = (Array.isArray(data) ? data : []).map((item) => ({
            label: item.name,
            value: item.name,
            id: item.id
        }));
    } catch (error) {
        console.error(error);
        deptOptions.value = [];
    }
};

onMounted(() => {
    initData();
    loadDeptOptions();
    loadProduceCategoryTree();
    getList();
});

/**\n * handleBack：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleBack = () => {
    router.back();
};

/**\n * handleQuery：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleQuery = () => {
    pageParams.pageNum = 1;
    getList();
};

/**\n * handleReset：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleReset = () => {
    Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
    handleQuery();
};

/** 按当前任务及筛选条件导出检测记录，导出前由用户确认数据范围。 */
const handleExport = async () => {
    try {
        await message.confirm('是否确认导出当前筛选条件下的检测记录数据？');
        const data = await DetectionRecordApi.exportDetectionRecord({
            taskId: route.query.id || route.params.id || undefined,
            keyword: queryParams.sampleKeyword || undefined,
            productCategory: queryParams.category || undefined,
            status: queryParams.status !== '' ? queryParams.status : undefined,
            pageNo: pageParams.pageNum,
            pageSize: pageParams.pageSize
        });
        download.excel(data, '抽样检测记录.xlsx');
    } catch (error) {
        console.error(error);
    }
};

/**\n * handleBatchImport：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleBatchImport = () => {
    router.push('/rapidDetection/batchImportData');
};

/**\n * handleSingleInput：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSingleInput = () => {
    router.push({
        path: '/rapidDetection/taskDetectionCreate',
        query: { taskId: route.query.id || route.params.id || undefined },
    });
};

/**\n * handleTest：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleTest = (row) => {
    router.push({
        path: '/rapidDetection/taskDetectionCreate',
        query: { id: row.id, action: 'detect' }
    });
};

/**\n * handleDelete：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDelete = async (row) => {
    try {
        await DetectionRecordApi.deleteDetectionRecord(row.id);
        getList();
    } catch (e) { }
};

/**\n * handleView：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleView = (row) => {
    router.push('/rapidDetection/taskResult?id=' + row.id);
};

/**\n * handleRetest：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleRetest = (row) => {
    router.push({
        path: '/rapidDetection/taskDetectionCreate',
        query: { id: row.id, action: 'recheck' }
    });
};
</script>

<style lang="scss" scoped>
/* 容器样式继承自全局 .table-container */
.table-container {
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;
}

.result-container {
    flex: 1;
    overflow-y: auto;
}

.task-info-card {
    padding: 16px;
}

.task-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;

    .task-code {
        font-size: 14px;
        font-weight: 400;
        color: #666;
    }
}

.task-detail-grid {
    display: flex;
    gap: 60px;
    align-items: flex-start;
}

.progress-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 140px;

    .progress-label {
        font-size: 14px;
        color: #333;
        margin-top: 12px;
        font-weight: 500;
    }

    .progress-info {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
    }
}

.info-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .info-row {
        display: flex;
        align-items: flex-start;
        font-size: 14px;

        .label {
            min-width: 70px;
            color: #333;
            font-weight: 500;

            &::after {
                content: '：';
            }
        }

        .value {
            color: #333;

            &.link {
                color: #00B3ED;
            }
        }
    }
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
    flex: 1;
}

.import-tip {
    font-size: 12px;
    color: #999;
    margin: 0;
    text-align: right;
}

/* 表格 */
.table-wrapper {
    margin-bottom: 0;
    min-height: 300px;
}

/* 分页 */
.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 0;
}
</style>

<!-- 产品分类树形下拉弹出层全局样式 -->
<style lang="scss">
.product-category-tree-popper {
    min-width: 240px !important;
    max-width: 420px !important;

    .el-select-dropdown__wrap {
        max-height: 360px;
    }

    .el-tree {
        min-width: 100%;
        display: inline-block;
        padding: 6px 8px;
    }

    .el-tree-node__content {
        height: 32px;
        line-height: 32px;
        padding-right: 12px;
    }

    .el-tree-node__label {
        white-space: nowrap;
        overflow: visible;
        text-overflow: clip;
        font-size: 14px;
    }
}
</style>
