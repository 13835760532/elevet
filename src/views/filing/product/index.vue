<template>
    <div class="table-container">
        <!-- 主体建档 标题 -->
        <div class="guide-card">
            <div class="card-header"> 
                <h2 class="card-title">产品建档</h2>
            </div>
        </div>

        <!-- 主体建档查询 -->
        <div class="query-card">
            <div class="card-header">
                <h2 class="card-title">产品建档查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="">
                        <el-input 
                            clearable 
                            v-model="queryParams.productCode" 
                            placeholder="请输入产品编码" 
                            class="custom-input w180" 
                        />
                    </el-form-item>
                    <el-form-item label="">
                        <el-input 
                            clearable 
                            v-model="queryParams.subjectName" 
                            placeholder="请输入主体名称" 
                            class="custom-input w180" 
                        />
                    </el-form-item>
                    <el-form-item label="">
                        <AreaCascader 
                            v-model="queryParams.region" 
                            placeholder="请选择产地"
                            class="custom-cascader w180"
                        />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.subjectType" placeholder="主体类型" class="custom-select w130" clearable>
                            <el-option label="全部" value="" />
                            <el-option label="企业备案" :value="1" />
                            <el-option label="个人备案" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <el-date-picker
                            v-model="queryParams.archiveTime"
                            type="date"
                            placeholder="建档日期"
                            value-format="YYYY-MM-DD"
                            class="custom-datepicker w160"
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
                    <el-table-column label="产品编号" prop="productCode" min-width="160" show-overflow-tooltip />
                    <el-table-column label="产品名称" prop="productName" min-width="120" show-overflow-tooltip />
                    <el-table-column label="所属主体" prop="subjectInfo.name" min-width="150" show-overflow-tooltip />
                    <el-table-column label="产品类别" prop="category" min-width="100" align="center" />
                    <el-table-column label="规格" prop="productSpec" min-width="100" align="center" />
                    <el-table-column label="产地" prop="productionArea" min-width="120" show-overflow-tooltip />
                    <el-table-column label="建档日期" prop="archiveDate" width="160" align="center" :formatter="dateFormatter" />
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
import * as ProductApi from '@/api/agri/product/index';
import { useMessage } from '@/hooks/web/useMessage';
import { ElMessageBox } from 'element-plus';
import download from '@/utils/download';
import { dateFormatter } from '@/utils/formatTime';
import AreaCascader from '@/components/AreaCascader/index.vue';
import { useTableHeight } from '@/hooks/web/useTableHeight';

defineOptions({
    name: 'ProductArchiveIndex'
});

const router = useRouter();
const message = useMessage();
const loading = ref(false);
const exportLoading = ref(false);

const queryParams = reactive({
    productCode: '',
    subjectName: '',
    region: [],
    subjectType: undefined,
    archiveTime: []
});

const pageParams = reactive({
    pageNo: 1,
    pageSize: 10
});

const total = ref(0);
const tableList = ref([]);

const getList = async () => {
    loading.value = true;
    try {
        const params = {
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize
        };
        // 处理产地
        if (queryParams.region && queryParams.region.length > 0) {
            params.productionArea = queryParams.region.join('-');
        }
        // 处理归档时间
        if (queryParams.archiveTime && queryParams.archiveTime.length === 2) {
            params.beginArchiveDate = queryParams.archiveTime[0] + ' 00:00:00';
            params.endArchiveDate = queryParams.archiveTime[1] + ' 23:59:59';
        }

        const data = await ProductApi.getProductPage(params);
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
    queryParams.productCode = '';
    queryParams.subjectName = '';
    queryParams.region = [];
    queryParams.subjectType = undefined;
    queryParams.archiveTime = [];
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        const params = {
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: 1000
        };
        const res = await ProductApi.exportProduct(params);
        download.excel(res, '产品档案导出.xls');
    } catch (error) {
        console.error('导出失败', error);
    } finally {
        exportLoading.value = false;
    }
};

const handleBatchFiling = () => { router.push('/filing/productBatch'); };
const handleSingleFiling = () => { router.push('/filing/productCreate'); };
const handleEdit = (row) => { router.push('/filing/productCreate?id=' + row.id); };

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('是否确认删除产品名称为"' + row.productName + '"的数据项?', '警告', {
            type: 'warning'
        });
        await ProductApi.deleteProduct(row.id);
        message.success('删除成功');
        getList();
    } catch (error) {}
};

const handleView = (row) => { router.push('/filing/productDetail?id=' + row.id); };

// 表格高度动态计算
const tableRef = ref(null);
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
    overflow: hidden !important;
}

.query-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 0;
    min-height: 0;
}

.table-wrapper {
    flex: 1;
    overflow: hidden;
    min-height: 0;
}

.w160 { width: 160px !important; }
.w130 { width: 130px !important; }
.w180 { width: 180px !important; }
.w220 { width: 220px !important; }

@media (max-width: 1500px) {
    .custom-query-form-row {
        gap: 12px;
        :deep(.el-form-item) {
            margin-right: 12px !important;
        }
    }
}
</style>
