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
                        <el-input :prefix-icon="Search" clearable v-model="queryParams.productName" placeholder="搜索产品名称" class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-input :prefix-icon="Search" clearable v-model="queryParams.productCode" placeholder="搜索产品编号" class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-input v-model="queryParams.productionArea" placeholder="产地查询" class="custom-input w220" />
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
                <el-table :data="tableList" border="false" v-loading="loading">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="产品编号" prop="productCode" min-width="160" show-overflow-tooltip />
                    <el-table-column label="产品名称" prop="productName" min-width="120" show-overflow-tooltip />
                    <el-table-column label="所属主体" prop="subjectInfo.name" min-width="150" show-overflow-tooltip />
                    <el-table-column label="产品类别" prop="category" min-width="100" align="center" />
                    <el-table-column label="规格" prop="productSpec" min-width="100" align="center" />
                    <el-table-column label="产地" prop="productionArea" min-width="120" show-overflow-tooltip />
                    <el-table-column label="状态" align="center" width="80">
                        <template #default="scope">
                            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                                {{ scope.row.status === 1 ? '启用' : '禁用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" prop="createTime" width="160" align="center" />
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
import { Search } from '@element-plus/icons-vue';
import { useFormLayout } from '@/hooks/web/useFormLayout';
import * as ProductApi from '@/api/agri/product/index';
import { useMessage } from '@/hooks/web/useMessage';
import { ElMessageBox } from 'element-plus';
import download from '@/utils/download';

const { queryFormClass } = useFormLayout();

const router = useRouter();
const message = useMessage();
const loading = ref(false);
const exportLoading = ref(false);

const queryParams = reactive({
    productName: '',
    productCode: '',
    productionArea: ''
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
        const data = await ProductApi.getProductPage({
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize
        });
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
    Object.keys(queryParams).forEach(key => {
        queryParams[key] = '';
    });
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        const res = await ProductApi.exportProduct({
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize || 100
        });
        download.excel(res, '产品档案导出.xls');
    } catch (error) {
        console.error('导出失败', error);
    } finally {
        exportLoading.value = false;
    }
};

const handleBatchFiling = () => {
    router.push('/filing/productBatch');
};

const handleSingleFiling = () => {
    router.push('/filing/productCreate');
};

const handleEdit = (row) => {
    router.push('/filing/productCreate?id=' + row.id);
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('是否确认删除产品名称为"' + row.productName + '"的数据项?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await ProductApi.deleteProduct(row.id);
        message.success('删除成功');
        getList();
    } catch (error) {
        if (error !== 'cancel') {
            console.error(error);
        }
    }
};

const handleView = (row) => {
    router.push('/filing/productDetail?id=' + row.id);
};

onMounted(() => {
    getList();
});
</script>

<style lang="scss" scoped></style>
