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
                        <el-input :prefix-icon="Search" clearable v-model="queryParams.name" placeholder="搜索主体名称" class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="">
                        <el-select v-model="queryParams.type" placeholder="备案类型" class="custom-select" clearable>
                            <el-option label="全部" value="" />
                            <el-option label="企业备案" :value="1" />
                            <el-option label="个人备案" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="">
                        <!-- <el-cascader v-model="queryParams.region" :options="regionOptions" placeholder="所属地区"
                            class="custom-cascader" clearable /> -->
                    </el-form-item>
                    <el-form-item label="">
                        <el-input :prefix-icon="Search" clearable v-model="queryParams.socialCreditCode" placeholder="搜索主体代码/身份证"
                            class="custom-input w220" />
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
                    <el-table-column width="170" align="center">
                        <template #header>
                            <div>主体代码</div>
                            <div style="font-size: 12px; color: #999; font-weight: normal;">（企业信用代码/身份证）</div>
                        </template>
                        <template #default="scope">
                            {{ scope.row.socialCreditCode || scope.row.idCard || '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="主体名称" prop="name" width="180" show-overflow-tooltip />
                    <el-table-column label="备案类型" prop="type" width="100" align="center">
                        <template #default="scope">
                            <el-tag :type="scope.row.type === 2 ? 'warning' : 'info'">{{ scope.row.type === 2 ? '个人备案' : '企业备案' }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="主体类别" prop="category" width="100" align="center">
                        <template #default="scope">
                            <!-- 根据字典转换，这里做个兜底展示 -->
                            <el-tag v-if="scope.row.category">{{ scope.row.category }}</el-tag>
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
import * as SubjectApi from '@/api/agri/subject/index';
import { useMessage } from '@/hooks/web/useMessage';
import { ElMessageBox } from 'element-plus';
import download from '@/utils/download';

const { queryFormClass } = useFormLayout();

const router = useRouter();
const message = useMessage();
const loading = ref(false);
const exportLoading = ref(false);

const queryParams = reactive({
    name: '',
    type: undefined,
    socialCreditCode: ''
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
        const data = await SubjectApi.getSubjectPage({
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
    queryParams.name = '';
    queryParams.type = undefined;
    queryParams.socialCreditCode = '';
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        const res = await SubjectApi.exportSubject({
            ...queryParams,
            pageNo: pageParams.pageNo,
            pageSize: pageParams.pageSize || 100
        });
        download.excel(res, '主体档案导出.xls');
    } catch (error) {
        console.error('导出失败', error);
    } finally {
        exportLoading.value = false;
    }
};

const handleBatchFiling = () => {
    router.push('/filing/subjectBatch');
};

const handleSingleFiling = () => {
    router.push('/filing/subjectCreate');
};

const handleEdit = (row) => {
    router.push('/filing/subjectCreate?id=' + row.id);
};

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('是否确认删除主体名称为"' + row.name + '"的数据项?', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await SubjectApi.deleteSubject(row.id);
        message.success('删除成功');
        getList();
    } catch (error) {
        if (error !== 'cancel') {
            console.error(error);
        }
    }
};

const handleView = (row) => {
    router.push('/filing/subjectDetail?id=' + row.id);
};

onMounted(() => {
    getList();
});
</script>

<style lang="scss" scoped>
/* 页面特有样式（公共样式已在 App.vue 全局引入） */

/* 响应式 */
@media (max-width: 1400px) {
    .table-actions {
        flex-wrap: wrap;
        gap: 12px;
    }
}
</style>
