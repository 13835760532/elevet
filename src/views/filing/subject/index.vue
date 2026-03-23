<template>
    <div class="table-container">
        <!-- 主体建档 标题 -->
        <div class="guide-card">
            <div class="card-header">
                <h2 class="card-title">主体建档</h2>
            </div>
        </div>

        <!-- 主体建档查询 -->
        <div class="query-card">
            <div class="card-header">
                <h2 class="card-title">主体建档查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="">
                        <el-input 
                            clearable 
                            v-model="queryParams.name" 
                            placeholder="请输入主体名称" 
                            class="custom-input w180" 
                        />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.type" placeholder="备案类型" class="custom-select w130" clearable>
                            <el-option label="全部" value="" />
                            <el-option label="企业备案" :value="1" />
                            <el-option label="个人备案" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <AreaCascader 
                            v-model="queryParams.region" 
                            placeholder="请选择所属地区"
                            class="custom-cascader w180"
                        />
                    </el-form-item>
                    <el-form-item label="">
                        <el-input 
                            clearable 
                            v-model="queryParams.socialCreditCode" 
                            placeholder="请输入企业代码或身份证"
                            class="custom-input w180" 
                        />
                    </el-form-item>
                    <el-form-item label="">
                        <el-date-picker
                            v-model="queryParams.createTime"
                            type="date"
                            placeholder="创建日期"
                            value-format="YYYY-MM-DD"
                            class="custom-datepicker w180"
                        />
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
                    <el-button type="primary" @click="handleBatchFiling" class="primary-btn">批量建档</el-button>
                    <el-button type="primary" @click="handleSingleFiling" class="primary-btn">单条建档</el-button>
                </div>
                <div class="action-right">
                    <el-button @click="handleExport" :loading="exportLoading">导出</el-button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table ref="tableRef" :data="tableList" border="false" v-loading="loading" :height="tableHeight">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column width="170" align="center">
                        <template #header>
                            <div>主体代码</div>
                            <div style="font-size: 12px; color: #999; font-weight: normal;">（企业信用代码/身份证）</div>
                        </template>
                        <template #default="scope">
                            {{ scope.row.socialCreditCode || scope.row.idCard || '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="主体名称" prop="name" min-width="180" show-overflow-tooltip />
                    <el-table-column label="备案类型" prop="type" width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.type === 2 ? 'warning' : 'info'">{{ scope.row.type ? getFilingTypeLabel(scope.row.type) : '--' }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="主体类别" prop="category" width="100" align="center">
                        <template #default="scope">
                            <el-tag v-if="scope.row.category" effect="light" type="primary">{{ getCategoryLabel(scope.row.category) }}</el-tag>
                            <span v-else>--</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="主营产品" prop="mainProducts" width="120" align="center" show-overflow-tooltip />
                    <el-table-column label="联系人" prop="contactName" width="100" align="center" />
                    <el-table-column label="电话" prop="contactPhone" width="120" align="center" />
                    <el-table-column label="所属地区" align="center" width="160" show-overflow-tooltip>
                        <template #default="scope">
                            {{ scope.row.provinceCode ? `${scope.row.provinceCode}${scope.row.cityCode}${scope.row.districtCode}` : '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop="createTime" width="160" align="center" :formatter="dateFormatter" />
                    <el-table-column label="操作" width="160" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <span class="table-edit-operate" @click="handleEdit(scope.row)">编辑</span>
                                <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                                <span class="table-view-operate" @click="handleView(scope.row)">详情</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageParams.pageNo" v-model:page-size="pageParams.pageSize"
                    :total="total" background layout="total, prev, pager, next, sizes" class="custom-pagination" 
                    @size-change="getList" @current-change="getList" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as SubjectApi from '@/api/agri/subject/index';
import { useMessage } from '@/hooks/web/useMessage';
import { ElMessageBox } from 'element-plus';
import download from '@/utils/download';
import { dateFormatter } from '@/utils/formatTime';
import { useDict } from '@/hooks/web/useDict';
import AreaCascader from '@/components/AreaCascader/index.vue';
import { useTableHeight } from '@/hooks/web/useTableHeight';

defineOptions({
    name: 'SubjectArchiveIndex'
});

const { getLabel: getCategoryLabel } = useDict('agri_subject_category', 'str');
const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');

const router = useRouter();
const message = useMessage();
const loading = ref(false);
const exportLoading = ref(false);

const queryParams = reactive({
    name: '',
    type: undefined,
    socialCreditCode: '',
    region: [],
    createTime: []
});

const pageParams = reactive({
    pageNo: 1,
    pageSize: 10
});

const total = ref(0);
const tableList = ref([]);

/**
 * 获取列表数据
 */
const getList = async () => {
    loading.value = true;
    try {
        const params = {
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize
        };
        // 处理地区
        if (queryParams.region && queryParams.region.length > 0) {
            params.provinceCode = queryParams.region[0];
            params.cityCode = queryParams.region[1];
            params.districtCode = queryParams.region[2];
        }
        // 处理时间范围
        if (queryParams.createTime && queryParams.createTime.length === 2) {
            params.beginCreateTime = queryParams.createTime[0] + ' 00:00:00';
            params.endCreateTime = queryParams.createTime[1] + ' 23:59:59';
        }

        const data = await SubjectApi.getSubjectPage(params);
        tableList.value = data.list;
        total.value = data.total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const handleQuery = () => {
    pageParams.pageNo = 1;
    getList();
};

const handleReset = () => {
    queryParams.name = '';
    queryParams.type = undefined;
    queryParams.socialCreditCode = '';
    queryParams.region = [];
    queryParams.createTime = [];
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        
        const params = {
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: 1000 // 导出较多数据
        };
        if (queryParams.region && queryParams.region.length > 0) {
            params.provinceCode = queryParams.region[0];
            params.cityCode = queryParams.region[1];
            params.districtCode = queryParams.region[2];
        }
        if (queryParams.createTime && queryParams.createTime.length === 2) {
            params.beginCreateTime = queryParams.createTime[0] + ' 00:00:00';
            params.endCreateTime = queryParams.createTime[1] + ' 23:59:59';
        }

        const res = await SubjectApi.exportSubject(params);
        download.excel(res, '主体档案导出.xls');
    } catch (error) {
        console.error('导出失败', error);
    } finally {
        exportLoading.value = false;
    }
};

const handleBatchFiling = () => { router.push('/filing/subjectBatch'); };
const handleSingleFiling = () => { router.push('/filing/subjectCreate'); };
const handleEdit = (row) => { router.push('/filing/subjectCreate?id=' + row.id); };

/**
 * 删除
 */
const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('是否确认删除主体名称为"' + row.name + '"的数据项?', '警告', {
            type: 'warning'
        });
        await SubjectApi.deleteSubject(row.id);
        message.success('删除成功');
        getList();
    } catch (error) {}
};

const handleView = (row) => { router.push('/filing/subjectDetail?id=' + row.id); };

// 表格高度动态计算
const tableRef = ref(null);
// 底部偏移：分页器约 60px + 环境间距（内补丁/外补丁等）
// 增加偏移量以确保不出现多余滚动条
const { tableHeight } = useTableHeight(tableRef, 85);

onMounted(() => {
    getList();
});
</script>

<style lang="scss" scoped>
.table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden !important; /* 强制禁止外层滚动条 */
}

.query-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 0;
    min-height: 0; /* 允许 Flex 子项收缩 */
}

.table-wrapper {
    flex: 1;
    overflow: hidden;
    min-height: 0;
}

/* 响应式调整 */
.w180 { width: 180px !important; }
.w100 { width: 100px !important; }
.w60 { width: 60px !important; }
.w80 { width: 80px !important; }
.w130 { width: 130px !important; }
.w200 { width: 200px !important; }
.w240 { width: 240px !important; }

@media (max-width: 1500px) {
    .custom-query-form-row {
        gap: 12px;
        :deep(.el-form-item) {
            margin-right: 12px !important;
        }
    }
}
</style>
