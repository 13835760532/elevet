<template>
    <div class="table-container">
        <!-- 标题卡 -->
        <div class="guide-card">
            <div class="card-header">
                <h2 class="card-title">合格证收证（生产者/收购者/销售者）</h2>
            </div>
        </div>

        <!-- 查询卡 -->
        <div class="query-card">
            <div class="card-header">
                <h2 class="card-title">合格证收证查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :model="queryParams" :inline="true" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="" prop="certNo">
                        <el-input :prefix-icon="Search" v-model="queryParams.certNo" placeholder="请输入合格证编号查询" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="productName">
                        <el-input :prefix-icon="Search" v-model="queryParams.productName" placeholder="请输入产品名称查询" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="entity">
                        <el-input :prefix-icon="Search" v-model="queryParams.entity" placeholder="请输入经营主体信息" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="certType">
                        <el-select v-model="queryParams.certType" placeholder="请选择出证类型" clearable class="custom-select">
                            <el-option label="生产者" :value="1" />
                            <el-option label="收购者" :value="2" />
                            <el-option label="批发市场" :value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="" prop="productionArea">
                        <AreaCascader v-model="areaIds" @select="handleAreaSelect" placeholder="请选择产地" style="width: 260px;" />
                    </el-form-item>
                    <el-form-item label="" prop="phone">
                        <el-input :prefix-icon="Search" v-model="queryParams.phone" placeholder="请输入联系电话" clearable class="custom-input w180" />
                    </el-form-item>
                    <div class="query-btns">
                        <el-button @click="handleReset" class="reset-btn">重置</el-button>
                        <el-button type="primary" @click="handleSearch" class="search-btn">查询</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 操作按钮行 -->
            <div class="table-actions">
                <div class="action-left">
                    <el-button type="primary" class="primary-btn" @click="handleVerify">
                        <el-icon style="margin-right: 4px;"><Edit /></el-icon>收证
                    </el-button>
                </div>
                <div class="action-right">
                    <!-- <el-button @click="handleExport" :loading="exportLoading">导出报告</el-button> -->
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableData" v-loading="loading">
                    <el-table-column label="序号" type="index" width="70" align="center" />
                    <el-table-column label="合格证编号" prop="certificateCode" width="160" align="center" />
                    <el-table-column label="来源" prop="certificateSource" width="100" align="center">
                        <template #default="{ row }">
                            <span class="source-tag" :class="row.certificateSource === 1 ? 'local' : 'other'">
                                {{ row.certificateSource === 1 ? '本平台' : '其他' }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="产品名称" prop="productName" width="110" align="center" />
                    <el-table-column label="产品类别" prop="productCategory" width="110" align="center" />
                    <el-table-column label="产地" prop="productionArea" min-width="150" show-overflow-tooltip />
                    <el-table-column label="生产经营主体" prop="subjectName" min-width="200" show-overflow-tooltip />
                    <el-table-column label="收证时间" prop="verificationTime" width="160" align="center" :formatter="dateFormatter" />
                    <el-table-column label="操作" width="160" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <span v-if="scope.row.certificateSource === 2" class="table-edit-operate" @click="handleEdit(scope.row)">编辑</span>
                                <span class="table-view-operate" @click="handleView(scope.row)">详情</span>
                                <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination 
                    v-model:current-page="pageNum" 
                    v-model:page-size="pageSize" 
                    :total="total" 
                    layout="prev, pager, next" 
                    background 
                    class="custom-pagination"
                    @current-change="handleCurrentChange"
                    @size-change="handleSizeChange" 
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Edit, Search } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import download from '@/utils/download';
import { dateFormatter } from '@/utils/formatTime';
import * as CertificateApi from '@/api/agri/certificate';

defineOptions({
    name: 'CertificateVerify'
});

const router = useRouter();
const message = useMessage();

const areaIds = ref<string[]>([]);
const queryParams = reactive({
    certNo: '',
    productName: '',
    entity: '',
    certType: undefined,
    productionArea: '',
    province: '',
    city: '',
    county: '',
    phone: ''
});

const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const tableData = ref([]);
const loading = ref(false);
const exportLoading = ref(false);

const handleAreaSelect = (area: any) => {
    queryParams.province = area.province;
    queryParams.city = area.city;
    queryParams.county = area.district;
    // 同时更新拼写的完整产地字符串，如果有需要的话
    queryParams.productionArea = [area.province, area.city, area.district].filter(Boolean).join('');
};
const loadData = async () => {
    loading.value = true;
    try {
        const params: any = {
            pageNo: pageNum.value,
            pageSize: pageSize.value,
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined,
            subjectName: queryParams.entity || undefined,
            certificateType: queryParams.certType || undefined,
            contactPhone: queryParams.phone || undefined,
            productionArea: queryParams.productionArea?.length ? queryParams.productionArea.join('/') : undefined,
        };
        const data = await CertificateApi.getCertificateVerificationPage(params);
        tableData.value = data.list || [];
        total.value = data.total || 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadData();
});

const handleSearch = () => {
    pageNum.value = 1;
    loadData();
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => {
        if (Array.isArray(queryParams[key])) {
            queryParams[key] = [];
        } else {
            queryParams[key] = undefined;
        }
    });
    handleSearch();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        const params: any = {
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined,
            subjectName: queryParams.entity || undefined,
            certificateType: queryParams.certType || undefined,
            contactPhone: queryParams.phone || undefined,
            productionArea: queryParams.productionArea?.length ? queryParams.productionArea.join('/') : undefined,
        };
        const data = await CertificateApi.exportCertificateVerification(params);
        download.excel(data, '合格证收证记录.xls');
    } catch { } finally {
        exportLoading.value = false;
    }
};

const handleVerify = () => {
    router.push('/certificate/verify/other');
};

const handleEdit = (row: any) => {
    // 编辑其他平台合格证 不现实 tab 切换
    router.push({ path: '/certificate/verify/other', query: { id: row.id } });
};

const handleView = (row: any) => {
    const path = '/certificate/verify/detail';
    router.push({ path, query: { id: row.id } });
};

const handleDelete = async (row: any) => {
    try {
        await message.delConfirm(`确定要删除合格证编号为 "${row.certificateCode}" 的查验记录吗？`);
        await CertificateApi.deleteCertificateVerification(row.id);
        message.success('删除成功');
        loadData();
    } catch (error) { }
};

const handleSizeChange = (val: number) => {
    pageSize.value = val;
    loadData();
};

const handleCurrentChange = (val: number) => {
    pageNum.value = val;
    loadData();
};
</script>

<style lang="scss" scoped>
/* 统一样式，引用 issue 风格 */
.source-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &.local {
        background: rgba(0, 179, 237, 0.1);
        color: #00B3ED;
        border: 1px solid rgba(0, 179, 237, 0.2);
    }
    
    &.other {
        background: rgba(144, 147, 153, 0.1);
        color: #909399;
        border: 1px solid rgba(144, 147, 153, 0.2);
    }
}

.table-operate-action-btns {
    display: flex;
    justify-content: center;
    gap: 12px;
    
    span {
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        
        &:hover {
            opacity: 0.8;
        }
    }
    
    .table-edit-operate {
        color: #00B3ED;
    }
    
    .table-view-operate {
        color: #67c23a;
    }
    
    .table-delete-operate {
        color: #f56c6c;
    }
}
</style>
