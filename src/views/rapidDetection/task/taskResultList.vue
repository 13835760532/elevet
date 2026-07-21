<template>
    <div class="table-container page-container ">
        <!-- 快速检测标题 -->
        <PageHeader title="快速检测" :showBack="true"></PageHeader>

        <!-- 检测查询 -->
        <div class="query-card">
            <div class="query-form-wrapper" style="padding-top: 10px;">
                <el-form :model="queryParams" ref="queryRef" :inline="true"
                    class="custom-query-form custom-query-form-row">
                    <el-form-item label="" prop="sampleCode">
                        <el-input v-model="queryParams.sampleCode" placeholder="请输入样品编号" class="w160" clearable />
                    </el-form-item>

                    <el-form-item label="" prop="productName">
                        <el-input v-model="queryParams.productName" placeholder="请输入样品名称" class="w140" clearable />
                    </el-form-item>

                    <el-form-item label="" prop="category">
                        <el-select v-model="queryParams.category" placeholder="产品分类" clearable class="w120">
                            <el-option label="全部" value="" />
                            <el-option v-for="dict in productCategoryOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="" prop="area">
                        <AreaCascader v-model="areaIds" @select="handleAreaSelect" placeholder="抽检地区"
                            style="width: 160px" />
                    </el-form-item>

                    <el-form-item label="" prop="isRetest">
                        <el-select v-model="queryParams.isRetest" placeholder="是否复检" clearable class="w120">
                            <el-option label="全部" value="" />
                            <el-option label="是" value="true" />
                            <el-option label="否" value="false" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="" prop="overallResult">
                        <el-select v-model="queryParams.overallResult" placeholder="检测结果" clearable class="w120">
                            <el-option label="全部" value="" />
                            <el-option label="阴性" value="0" />
                            <el-option label="阳性" value="1" />
                            <el-option label="异常" value="2" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="" prop="status">
                        <el-select v-model="queryParams.status" placeholder="检测状态" clearable class="w120">
                            <el-option label="全部" value="" />
                            <el-option label="未检测" value="0" />
                            <el-option label="已检测" value="1" />
                            <el-option label="失败" value="2" />
                        </el-select>
                    </el-form-item>

                    <div class="query-btns" style="display: flex; gap: 10px; margin-left: 10px;">
                        <el-button type="primary" @click="handleQuery">查询</el-button>
                        <el-button @click="resetQuery">重置</el-button>
                    </div>
                </el-form>
            </div>

            <div class="content-card">

                <!-- 任务信息和操作 -->
                <div class="task-info-actions">
                    <div class="task-title">
                        {{ taskDetail?.taskName || '2026年北京蔬菜快速检测工作方案-海淀区任务RW20261101' }}
                    </div>
                    <div class="action-buttons-wrapper">
                        <div class="buttons-row">
                            <el-button @click="handleExport">导出</el-button>
                            <el-button type="primary" @click="handleSingleInput">检测单条录入</el-button>
                        </div>
                        <div class="btn-tip">*支持第三方检测结果批量导入</div>
                    </div>
                </div>

                <!-- 数据表格区域 -->
                <div class="table-wrapper">
                    <el-table v-loading="loading" :data="tableList" border="false"
                        :header-cell-style="{ background: '#F8FAFC', color: '#475569', fontWeight: '500' }">
                        <el-table-column label="序号" type="index" width="60" align="center" />
                        <el-table-column label="样品编号" prop="sampleCode" width="160" align="center" />
                        <el-table-column label="样品名称" prop="productName" width="90" align="center" />
                        <el-table-column label="样品来源" prop="sampleSource" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column label="产品分类" prop="productCategory" width="80" align="center">
                            <template #default="scope">
                                {{ getCategoryLabel(scope.row.productCategory) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="产地" prop="sampleArea" width="100" align="center"
                            show-overflow-tooltip />
                        <el-table-column label="被检主体名称" prop="subjectName" min-width="110" show-overflow-tooltip />
                        <el-table-column label="抽检地区" prop="detectionArea" width="110" align="center" />
                        <el-table-column label="检测机构" prop="detectionOrgName" min-width="130" show-overflow-tooltip>
                            <template #default="scope">
                                {{ scope.row.detectionOrgName || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="检测时间" prop="testTime" width="130" align="center" />
                        <el-table-column label="检测项目" prop="aiRecognitionResult" min-width="120" align="center"
                            show-overflow-tooltip />
                        <el-table-column label="检测结果" prop="overallResult" width="100" align="center">
                            <template #default="scope">
                                <span v-if="scope.row.overallResult === 0">阴性</span>
                                <span v-else-if="scope.row.overallResult === 1">阳性</span>
                                <span v-else-if="scope.row.overallResult === 2">结果异常<br>(二维码模糊)</span>
                                <span v-else>-</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="是否公开" prop="publicFlag" width="80" align="center">
                            <template #default="scope">
                                <span>{{ scope.row.publicFlag ? '公开' : '不公开' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="是否复检" prop="isRetest" width="80" align="center">
                            <template #default="scope">
                                <span>{{ scope.row.recheckNo ? '是' : '否' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="检测状态" prop="statusText" width="80" align="center" />

                        <el-table-column label="操作" width="150" align="center" fixed="right">
                            <template #default="scope">
                                <div class="table-operate-action-btns">
                                    <template v-if="scope.row.status === 0">
                                        <span class="table-edit-operate" @click="handleDetect(scope.row)">去检测</span>
                                        <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                                    </template>
                                    <template v-else-if="scope.row.status === 1">
                                        <span class="table-edit-operate" @click="handleRetest(scope.row)"
                                            v-if="scope.row.recheckNo === 0">复检数据</span>
                                        <span class="table-view-operate" @click="handleView(scope.row)">查看详情</span>
                                    </template>
                                    <template v-else>
                                        <span class="table-edit-operate" @click="handleDetect(scope.row)">去检测</span>
                                    </template>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 分页区域 -->
                    <div class="pagination-wrapper">
                        <el-pagination v-model:current-page="pageParams.pageNo" v-model:page-size="pageParams.pageSize"
                            :total="total" background layout="total, sizes, prev, pager, next, jumper"
                            @size-change="getList" @current-change="getList" class="custom-pagination" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDict } from '@/hooks/web/useDict';
import { formatDate } from '@/utils/formatTime';
import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import * as DetectionTaskApi from '@/api/agri/detectionTask';
import AreaCascader from '@/components/AreaCascader/index.vue';
import { useMessage } from '@/hooks/web/useMessage';
import download from '@/utils/download';

const message = useMessage();
const router = useRouter();
const route = useRoute();
const loading = ref(false);

const productCategoryDict = useDict('agri_product_category', 'str');
const productCategoryOptions = productCategoryDict.options;
/**\n * getCategoryLabel：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getCategoryLabel = (val: string) => productCategoryDict.getLabel(val);

const activeTab = ref('task');

const queryParams = reactive({
    sampleCode: '',
    productName: '',
    category: '',
    area: '',
    isRetest: '',
    overallResult: '',
    status: ''
});

const areaIds = ref([]);
/**\n * handleAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAreaSelect = (area: any) => {
    queryParams.area = [area.province, area.city, area.district].filter(Boolean).join('-');
};

// 监听地区清空，同步将 queryParams.area 置空
watch(areaIds, (newVal) => {
    if (!newVal || newVal.length === 0) {
        queryParams.area = '';
    }
});

const pageParams = reactive({
    pageNo: 1,
    pageSize: 10
});

const total = ref(0);
const tableList = ref([]);
const taskId = route.query.taskId || route.query.id || route.params.id;
const taskDetail = ref<any>(null);

/** 加载路由指定的任务详情，失败时保留列表功能可用。 */
const getTaskDetail = async () => {
    if (taskId) {
        try {
            taskDetail.value = await DetectionTaskApi.getDetectionTask(Number(taskId));
        } catch (e) { }
    }
}

/**
 * 加载当前任务的检测结果，并解析 AI 项目及检测时间。
 * AI 数据缺失或格式异常时回退记录检测时间，保证历史记录仍可展示。
 */
const getList = async () => {
    loading.value = true;
    try {
        const req = {
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize,
            sampleCode: queryParams.sampleCode,
            productCategory: queryParams.category,
            overallResult: queryParams.overallResult,
            detectionArea: queryParams.area,
            rechecked: queryParams.isRetest,
            sampleName: queryParams.productName,
            status: queryParams.status,
            taskId: taskId
        } as any;

        const data = await DetectionRecordApi.getDetectionRecordPage(req);
        data.list.forEach((item: any) => {
            if (item.aiRecognitionResult) {
                try {
                    let parsed = JSON.parse(item.aiRecognitionResult)
                    item.aiRecognitionResult = (parsed.results || []).map((r: any) => r.codeName).join(', ');
                    item.testTime = parsed.timestamp ? formatDate(parsed.timestamp, 'YYYY-MM-DD') : '-';
                } catch (e) {
                    item.testTime = item.detectionDate ? formatDate(item.detectionDate, 'YYYY-MM-DD') : '-';
                }
            } else {
                item.testTime = item.detectionDate ? formatDate(item.detectionDate, 'YYYY-MM-DD') : '-';
                item.aiRecognitionResult = '-';
            }

            // source mock
            if (!item.sampleSource) item.sampleSource = '田间/市场/其他';

            item.statusText = item.status === 1 ? '已检测' : (item.status === 0 ? '未检测' : '失败');
            return item;
        });

        tableList.value = data.list;
        total.value = data.total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

/**\n * handleQuery：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleQuery = () => {
    pageParams.pageNo = 1;
    getList();
};

/**\n * resetQuery：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const resetQuery = () => {
    Object.keys(queryParams).forEach(key => (queryParams as any)[key] = '');
    areaIds.value = [];
    handleQuery();
};

/** 按当前任务及完整筛选条件导出结果，参数口径与列表查询保持一致。 */
const handleExport = async () => {
    try {
        await message.confirm('是否确认导出当前筛选条件下的检测记录数据？');
        const data = await DetectionRecordApi.exportDetectionRecord({
            taskId: taskId || undefined,
            sampleCode: queryParams.sampleCode || undefined,
            sampleName: queryParams.productName || undefined,
            productCategory: queryParams.category || undefined,
            detectionArea: queryParams.area || undefined,
            rechecked: queryParams.isRetest !== '' ? queryParams.isRetest : undefined,
            overallResult: queryParams.overallResult !== '' ? queryParams.overallResult : undefined,
            status: queryParams.status !== '' ? queryParams.status : undefined,
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize
        });
        download.excel(data, '检测结果记录.xlsx');
    } catch (error) {
        console.error(error);
    }
};

/**\n * handleSingleInput：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSingleInput = () => {
    router.push({
        path: '/rapidDetection/taskDetectionCreate',
        query: {
            taskId: taskId,
            action: 'add'
        }
    });
};

/**\n * handleDelete：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDelete = async (row: any) => {
    try {
        await message.confirm('是否确认删除该记录?');
        await DetectionRecordApi.deleteDetectionRecord(row.id);
        message.success('删除成功');
        getList();
    } catch (error) {
        console.error(error);
    }
};

/**\n * handleDetect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDetect = (row: any) => {
    router.push({
        path: '/rapidDetection/taskDetectionCreate',
        query: { id: row.id, action: 'detect' }
    });
};

/**\n * handleView：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleView = (row: any) => {
    router.push('/rapidDetection/taskResult?id=' + row.id);
};

/**\n * handleRetest：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleRetest = (row: any) => {
    router.push({
        path: '/rapidDetection/taskDetectionCreate',
        query: { id: row.id, action: 'recheck' }
    });
};

onMounted(() => {
    getTaskDetail();
    getList();
});
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;
}

.query-card {
    flex: 1;
    overflow-y: auto;
}

.content-card {
    background: transparent;
    border-radius: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.tabs-container {
    padding: 0 0;
    margin-bottom: 20px;
    background: transparent;

    .custom-tabs {
        display: flex;
        background: #fff;
        width: fit-content;
        border: 1px solid #E2E8F0;
        border-radius: 4px;
        overflow: hidden;

        .tab-item {
            padding: 10px 30px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            color: #475569;

            &:not(:last-child) {
                border-right: 1px solid #E2E8F0;
            }

            &.active {
                background: #00B3ED;
                color: #fff;
                font-weight: 500;
            }

            &:hover:not(.active) {
                background: #F8FAFC;
            }
        }
    }
}

.task-info-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 20px 0 10px 0;
    margin-bottom: 10px;

    .task-title {
        font-size: 16px;
        color: #1a1a1a;
        font-weight: 500;
        margin-left: 10px;
    }

    .action-buttons-wrapper {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .buttons-row {
            display: flex;
            gap: 12px;

            .gray-btn {
                background: #f3f4f6;
                border-color: #f3f4f6;
                color: #9ca3af;
            }

            .el-button--primary {
                background-color: #00B3ED;
                border-color: #00B3ED;
            }
        }

        .btn-tip {
            font-size: 12px;
            color: #666;
            margin-top: 6px;
        }
    }
}

.table-wrapper {
    background: #fff;
    flex: 1;
    border-top: 1px solid #E2E8F0;
    display: flex;
    flex-direction: column;

    :deep(.el-table) {
        min-height: 300px;
    }
}

/* 分页 */
.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px 10px;
    background: #fff;
    margin-top: 20px;
}

/* 操作列 */
.table-operate-action-btns {
    display: flex !important;
    flex-wrap: nowrap !important;
    gap: 12px !important;
    justify-content: center;
    align-items: center;

    span {
        white-space: nowrap;
        font-size: 13px;
        color: #00B3ED;
        cursor: pointer;

        &:hover {
            opacity: 0.8;
            text-decoration: underline;
        }
    }
}

.w120 {
    width: 120px !important;
}

.w140 {
    width: 140px !important;
}

.w160 {
    width: 160px !important;
}
</style>
