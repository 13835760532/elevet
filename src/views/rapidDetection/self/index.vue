<template>
    <div class="table-container">
        <!-- 快速检测标题 -->
        <div class="guide-card">
            <div class="card-header">
                <h2 class="card-title">快速检测</h2>
            </div>
        </div>

        <!-- 自主检测查询 -->
        <div class="query-card" style="flex: 1;">
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row"
                    label-position="left">
                    <el-form-item label="">
                        <el-input v-model="queryParams.sampleCode" placeholder="请输入编号查询" class="custom-input w160"
                            clearable />
                    </el-form-item>
                    <el-form-item label="">
                        <el-input v-model="queryParams.productName" placeholder="请输入样品名称" class="custom-input w160"
                            clearable />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.category" placeholder="产品分类" class="custom-select w140"
                            clearable>
                            <el-option label="全部" value="" />
                            <el-option v-for="dict in productCategoryOptions" :key="dict.value + ''" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <AreaCascader v-model="areaIds" @select="handleAreaSelect" placeholder="抽检地区"
                            style="width: 240px;" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.isRetest" placeholder="是否复检" class="custom-select w140"
                            clearable>
                            <el-option label="全部" value="" />
                            <el-option label="是" :value="true" />
                            <el-option label="否" :value="false" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.status" placeholder="检测状态" class="custom-select w140" clearable>
                            <el-option label="全部" value="" />
                            <el-option label="阴性" value="1" />
                            <el-option label="阳性" value="0" />
                            <el-option label="异常" value="2" />
                        </el-select>
                    </el-form-item>

                    <div class="query-btns">
                        <el-button @click="handleReset" class="reset-btn">重置</el-button>
                        <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 操作按钮行 -->
            <div class="table-actions">
                <div class="action-left">
                    <!-- <el-button type="primary" @click="handleBatchImport" class="primary-btn">检测批量导入</el-button> -->
                    <el-button type="primary" @click="handleSingleInput" class="primary-btn">检测单条录入</el-button>
                </div>
                <div class="action-right">
                    <el-button @click="handleExport">导出</el-button>
                    <el-button @click="handleSetRule">设置数据授权规则</el-button>
                </div>
            </div>
            <p class="import-tip"></p>
            <!-- 数据表格区域 -->
            <div class="content-card">
                <!-- 数据表格 -->
                <div class="table-wrapper" v-loading="loading" ref="tableWrapperRef">
                    <el-table :data="tableList" :height="tableHeight" :border="false">
                        <el-table-column label="序号" type="index" width="60" align="center" />
                        <el-table-column label="样品编号" prop="sampleCode" width="130" align="center" />
                        <el-table-column label="样品名称" prop="productName" width="80" align="center" />
                        <el-table-column label="样品来源" prop="samplingLocation" width="100" align="center" />
                        <el-table-column label="产品分类" prop="productCategory" min-width="100" align="center"
                            show-overflow-tooltip>
                            <template #default="scope">
                                {{ getCategoryLabel(scope.row.productCategory) == '--' ? scope.row.productCategory :
                                    getCategoryLabel(scope.row.productCategory) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="抽检地区" prop="detectionArea" min-width="110" align="center"
                            show-overflow-tooltip />
                        <el-table-column label="检测项目" prop="aiRecognitionResult" min-width="120" align="center"
                            show-overflow-tooltip>
                            <template #default="scope">
                                {{ scope.row.aiRecognitionResult }}
                            </template>
                        </el-table-column>
                        <el-table-column label="是否复检" prop="isRetest" width="90" align="center">
                            <template #default="scope">
                                <el-tag :type="scope.row.recheckNo ? 'warning' : 'info'">
                                    {{ scope.row.recheckNo ? '是' : '否' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="被检主体名称" prop="subjectName" min-width="110" show-overflow-tooltip />
                        <el-table-column label="检测机构" prop="detectionOrgName" min-width="130" show-overflow-tooltip>
                            <template #default="scope">
                                {{ scope.row.detectionOrgName || scope.row.subjectName || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="检测时间" prop="detectionDate" width="100" align="center">
                            <template #default="scope">
                                {{ scope.row.testTime || '-' }}
                            </template>
                        </el-table-column>
                        <el-table-column label="检测结果" prop="overallResult" width="100" align="center">
                            <template #default="scope">
                                <template
                                    v-if="scope.row.overallResult !== null && scope.row.overallResult !== undefined">
                                    <el-tag
                                        :type="scope.row.overallResult === 0 ? 'success' : (scope.row.overallResult === 1 ? 'danger' : 'warning')"
                                        size="small" effect="light">
                                        {{ scope.row.overallResult === 0 ? '阴性' : (scope.row.overallResult === 1 ? '阳性'
                                            : '结果异常') }}
                                    </el-tag>
                                </template>
                                <span v-else>--</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="是否公开" prop="publicFlag" width="80" align="center">
                            <template #default="scope">
                                <span>{{ scope.row.publicFlag ? '是' : '否' }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="200" align="center" fixed="right">
                            <template #default="scope">
                                <div class="table-operate-action-btns">
                                    <span class="table-view-operate"
                                        v-if="scope.row.status == 0 && !scope.row.reportGenerated"
                                        @click="handleDetect(scope.row)">去检测</span>
                                    <span class="table-view-operate" @click="handleView(scope.row)">查看详情</span>
                                    <span class="table-edit-operate" @click="handleRetest(scope.row)"
                                        v-if="scope.row.status && scope.row.recheckNo == 0">复检</span>
                                    <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>

                <!-- 分页区域 -->
                <div class="pagination-wrapper">
                    <el-pagination v-model:current-page="pageParams.pageNo" v-model:page-size="pageParams.pageSize"
                        :total="total" background layout="total, sizes, prev, pager, next, jumper"
                        @size-change="getList" @current-change="getList" class="custom-pagination" />
                </div>
            </div>
        </div>


        <!-- 设置数据上报规则弹窗 -->
        <el-dialog v-model="ruleDialogVisible" width="540px" :show-close="true" class="rule-dialog" align-center>
            <template #header>
                <div class="dialog-header">
                    <div class="title-with-accent">
                        <span class="accent-bar"></span>
                        <h3 class="dialog-title">设置数据授权规则</h3>
                    </div>
                    <p class="dialog-desc">检测结果授权政府查询设置</p>
                </div>
            </template>

            <div class="rule-form">
                <div class="form-item">
                    <label class="form-label">检测结果是否面向政府公开</label>
                    <el-radio-group v-model="ruleForm.isPublic">
                        <el-radio :value="true">是</el-radio>
                        <el-radio :value="false">否</el-radio>
                    </el-radio-group>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="ruleDialogVisible = false" class="cancel-btn">取消</el-button>
                    <el-button type="primary" @click="handleSaveRule" class="confirm-btn">修改</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDict } from '@/hooks/web/useDict';

const productCategoryDict = useDict('agri_product_category', 'str');
const productCategoryOptions = productCategoryDict.options;
const getCategoryLabel = (val: string) => productCategoryDict.getLabel(val);
import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import * as SelfDetectionReportRuleApi from '@/api/agri/selfDetectionReportRule';
import { useMessage } from '@/hooks/web/useMessage';
import { useTableHeight } from '@/hooks/web/useTableHeight';
import download from '@/utils/download';
import { formatDate } from '@/utils/formatTime';
import AreaCascader from '@/components/AreaCascader/index.vue';

const message = useMessage();
const router = useRouter();
const tableWrapperRef = ref(null);
const { tableHeight } = useTableHeight(tableWrapperRef, 86); // 增加偏置以适配内凹布局卡片
const loading = ref(false);

const queryParams = reactive({
    sampleCode: '',
    productName: '',
    category: '',
    area: '',
    isRetest: '',
    status: ''
});

const areaIds = ref([]);
const handleAreaSelect = (area: any) => {
    // 抽检地区全量拼接，并使用短横线分隔
    queryParams.area = [area.province, area.city, area.district].filter(Boolean).join('-');
};

const pageParams = reactive({
    pageNo: 1,
    pageSize: 10
});

const total = ref(0);
const tableList = ref([]);

const getList = async () => {
    loading.value = true;
    try {
        const data = await DetectionRecordApi.getDetectionRecordPage({
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize,
            selfDetection: 'true',
            sampleCode: queryParams.sampleCode,
            productCategory: queryParams.category,
            overallResult: queryParams.status,
            detectionArea: queryParams.area,
            rechecked: queryParams.isRetest,
            sampleName: queryParams.productName // 映射为名称搜索
        });
        data.list.forEach(item => {
            if (item.aiRecognitionResult) {
                let data = JSON.parse(item.aiRecognitionResult)
                item.aiRecognitionResult = data.results.map(item => item.codeName).join(', ');
                item.testTime = data.timestamp || '-';
            } else {
                item.testTime = '-';
                item.aiRecognitionResult = '-';
            }
            return item
        });
        tableList.value = data.list;
        total.value = data.total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

/** 解析检测项目 */
const getDetectionItems = (aiRecognitionResult: string) => {
    if (!aiRecognitionResult) return '-';
    try {
        const aiRes = JSON.parse(aiRecognitionResult);
        if (aiRes.results && Array.isArray(aiRes.results)) {
            return aiRes.results.map(item => item.timestamp).join(', ');
        }
    } catch (e) {
        return '-';
    }
    return '-';
};



const handleQuery = () => {
    pageParams.pageNo = 1;
    getList();
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
    areaIds.value = [];
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.confirm('是否确认导出所有检测记录数据项?');
        const data = await DetectionRecordApi.exportDetectionRecord(queryParams);
        download.excel(data, '检测记录.xlsx');
    } catch (error) {
        console.error(error);
    }
};

/* Removed unused handleExportTop */

// 数据上报规则弹窗
const ruleDialogVisible = ref(false);
const ruleForm = reactive<{
    id: number | undefined;
    isPublic: boolean;
    dateRange: string[];
}>({
    id: undefined,
    isPublic: true,
    dateRange: []
});

const handleSetRule = async () => {
    try {
        const data = await SelfDetectionReportRuleApi.getCurrentSelfDetectionReportRule();
        if (data) {
            ruleForm.id = data.id;
            ruleForm.isPublic = data.enabled;
            if (data.startTime && data.endTime) {
                // 确保日期字符串仅包含 YYYY-MM-DD
                ruleForm.dateRange = [
                    data.startTime.substring(0, 10),
                    data.endTime.substring(0, 10)
                ];
            } else {
                ruleForm.dateRange = [];
            }
        }
        ruleDialogVisible.value = true;
    } catch (error) {
        console.error('获取上报规则失败', error);
        message.error('获取上报规则失败');
    }
};

const handleSaveRule = async () => {
    try {
        const submitData = {
            id: ruleForm.id,
            enabled: ruleForm.isPublic,
            startTime: undefined,
            endTime: undefined
        };
        if (ruleForm.id) {
            await SelfDetectionReportRuleApi.updateSelfDetectionReportRule(submitData);
            message.success('数据上报规则修改成功');
        } else {
            await SelfDetectionReportRuleApi.createSelfDetectionReportRule(submitData);
            message.success('数据上报规则设置成功');
        }
        ruleDialogVisible.value = false;
        getList();
    } catch (error) {
        console.error('修改上报规则失败', error);
    }
};

/* Removed unused handleBatchImport */

const handleSingleInput = () => {
    console.log('Single Input');
    router.push('/rapidDetection/create');
};

/* Removed unused handleTest */

const handleDelete = async (row) => {
    try {
        await message.confirm('是否确认删除记录编号为"' + row.recordCode + '"的数据项?');
        await DetectionRecordApi.deleteDetectionRecord(row.id);
        message.success('删除成功');
        getList();
    } catch (error) {
        console.error(error);
    }
};

const handleDetect = (row) => {
    router.push({
        path: '/rapidDetection/create',
        query: { id: row.id, action: 'detect' }
    });
};

const handleView = (row) => {
    router.push('/rapidDetection/taskResult?id=' + row.id);
};

const handleRetest = async (row) => {
    try {
        await message.confirm('确认对该检测记录发起复检？复检仅支持一次。');
        router.push({
            path: '/rapidDetection/create',
            query: { id: row.id, action: 'recheck' }
        });
    } catch (e) {
        // 用户取消操作
    }
};

onMounted(() => {
    getList();
});
</script>

<style lang="scss" scoped>
.import-tip {
    font-size: 12px;
    color: #999;
    margin: 0;
    text-align: right;
}

/* 表格 */
.table-wrapper {
    margin-bottom: 24px;
}



/* 分页 */
.pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px 0;
}

/* 数据上报规则弹窗 */
/* 数据上报规则弹窗 */
:deep(.rule-dialog) {
    border-radius: 12px;
    overflow: hidden;
    padding: 0 !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);

    .el-dialog__header {
        padding: 0 !important;
        margin-right: 0;
        border-bottom: 1px solid #F1F5F9;
        background: #fff;
    }

    .el-dialog__body {
        padding: 14px;
    }

    .el-dialog__footer {
        padding: 14px;
        border-top: 1px solid #F1F5F9;
    }

    .el-dialog__headerbtn {
        top: 6px;
        right: 6px;
        font-size: 20px;

        &:hover .el-dialog__close {
            color: #00B3ED;
        }
    }

    .dialog-header {
        padding: 14px 10px;

        .title-with-accent {
            display: flex;
            align-items: center;
            gap: 12px;

            .dialog-title {
                font-size: 20px;
                font-weight: 700;
                color: #1E293B;
                margin: 0;
                letter-spacing: -0.01em;
            }
        }

        .dialog-desc {
            font-size: 12px;
            color: #64748B;
            margin: 0;
            padding-left: 16px;
        }
    }

    .rule-form {
        padding: 14px;
        margin-top: -4px;

        .form-item {
            margin-bottom: 14px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .form-label {
            display: block;
            font-size: 14px;
            color: #1a1a1a;
            margin-bottom: 4px;
        }

        :deep(.el-radio-group) {
            display: flex;
            gap: 32px;
        }

        :deep(.el-radio) {
            .el-radio__label {
                font-size: 15px;
                color: #333;
            }

            .el-radio__inner {
                width: 18px;
                height: 18px;
                border-color: #d9d9d9;
            }

            &.is-checked {
                .el-radio__inner {
                    border-color: #00B3ED;
                    background: #00B3ED;
                }
            }
        }

        .date-range-picker {
            width: 360px !important;
            height: 40px !important;
            border-radius: 4px;
            overflow: hidden;
            transition: all 0.2s;

            &.el-date-editor--daterange {
                width: 360px !important;
            }

            .el-range-input {
                background: transparent;
                font-size: 14px;
                color: #333;

                &::placeholder {
                    color: #999;
                }
            }

            .el-range-separator {
                color: #64748B;
                padding: 0 8px;
                font-size: 13px;
            }

            .el-range__icon {
                color: #00B3ED;
                font-size: 16px;
            }
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    .cancel-btn {
        min-width: 90px;
        height: 38px;
        border-radius: 8px;
        font-size: 14px;
        border-color: #d9d9d9;
        color: #666;

        &:hover {
            opacity: 0.8;
        }
    }

    .confirm-btn {
        min-width: 90px;
        height: 38px;
        border-radius: 8px;
        font-size: 14px;

        &:hover {
            opacity: 0.8;
        }
    }
}

.w140 {
    width: 140px !important;
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
