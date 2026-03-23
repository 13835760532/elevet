<template>
    <div class="table-container">
        <!-- 标题卡 -->
        <div class="guide-card">
            <div class="card-header">
             
                <h2 class="card-title">合格证开具（生产者/收购者/销售者）</h2>
            </div>
        </div>

        <!-- 查询卡 -->
        <div class="query-card">
            <div class="card-header">
             
                <h2 class="card-title">合格证开具查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :model="queryParams" :inline="true" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="" prop="certNo">
                        <el-input :prefix-icon="Search" v-model="queryParams.certNo" placeholder="搜索合格证编号" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="productName">
                        <el-input :prefix-icon="Search" v-model="queryParams.productName" placeholder="搜索产品名称" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="entity">
                        <el-input :prefix-icon="Search" v-model="queryParams.entity" placeholder="搜索生产经营企业/个人" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="issueType">
                        <el-select v-model="queryParams.issueType" placeholder="出证类型" clearable class="custom-select">
                            <el-option label="生产者" :value="1" />
                            <el-option label="收购者" :value="2" />
                            <el-option label="批发市场" :value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="" prop="status">
                        <el-select v-model="queryParams.status" placeholder="状态" clearable class="custom-select">
                            <el-option label="有效" :value="1" />
                            <el-option label="作废" :value="2" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="" prop="province">
                        <AreaCascader v-model="areaIds" @select="handleAreaSelect" placeholder="请选择产地" style="width: 260px;" />
                        <!-- <el-cascader placeholder="产品产地" v-model="queryParams.province" :options="provinceAndCityData" :props="{label: 'name', value: 'code'}" clearable class="custom-select" /> -->
                        <!-- <el-select v-show="false" v-model="queryParams.province" placeholder="省" clearable class="custom-select">
                            <el-option label="山东省" value="shandong" />
                        </el-select>
                        <el-select v-model="queryParams.city" placeholder="产品产地/市" clearable class="custom-select">
                            <el-option label="青岛市" value="qingdao" />
                        </el-select>
                        <el-select v-model="queryParams.county" placeholder="县" clearable class="custom-select">
                            <el-option label="胶州市" value="jiaozhou" />
                        </el-select> -->
                    </el-form-item>
                    <el-form-item label="" prop="dateRange">
                        <el-date-picker style="width: 240px !important;" v-model="queryParams.dateRange" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" class="custom-datepicker" />
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
                    <el-button type="primary" class="primary-btn" @click="handleAdd">
                        <el-icon style="margin-right: 4px;">
                            <Edit />
                        </el-icon>合格证开具
                    </el-button>
                </div>
                <div class="action-right">
                    <el-button @click="handleExport" :loading="exportLoading">导出</el-button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" v-loading="loading">
                    <el-table-column label="序号" type="index" width="70" align="center" />
                    <el-table-column label="合格证编号" prop="certificateCode" width="160" align="center" />
                    <el-table-column label="出证类型" prop="certificateType" width="100" align="center">
                        <template #default="scope">
                            <span class="type-tag" :class="{ 'producer': scope.row.certificateType === 1, 'buyer': scope.row.certificateType === 2, 'seller': scope.row.certificateType === 3 }">
                                {{ scope.row.certificateType === 1 ? '生产者' : (scope.row.certificateType === 2 ? '收购者' : '批发市场') }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="产品名称" prop="productName" width="110" align="center" />
                    <el-table-column label="产品类别" prop="productCategory" width="110" align="center" />
                    <el-table-column label="产地" prop="productionArea" min-width="150" show-overflow-tooltip />
                    <el-table-column label="生产经营主体" prop="subjectName" min-width="200" show-overflow-tooltip />
                    <el-table-column label="状态" prop="status" width="80" align="center">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                                {{ row.status === 1 ? '有效' : '作废' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="开具日期" prop="issueDate" width="160" align="center" :formatter="dateFormatter" />
                    <el-table-column label="操作" width="200" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <span class="table-edit-operate" @click="handleEdit(scope.row)">编辑</span>
                                <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                                <span class="table-view-operate" @click="handleView(scope.row)">查看</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                    :total="total" layout="prev, pager, next" background class="custom-pagination"
                    @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Edit, Search } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import download from '@/utils/download';
import { dateFormatter } from '@/utils/formatTime';
import * as CertificateApi from '@/api/agri/certificate';

const router = useRouter();
const message = useMessage();

const areaIds = ref<string[]>([]);
const queryParams = reactive({
    certNo: '',
    productName: '',
    entity: '',
    issueType: undefined,
    status: 1,
    province: '',
    city: '',
    county: '',
    phone: '',
    productionArea: '',
    dateRange: [] as any
});

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

const loading = ref(false);
const exportLoading = ref(false);
const total = ref(0);

const tableList = ref([]);

const getList = async () => {
    loading.value = true;
    try {
        const params: any = {
            pageNo: pageParams.pageNum,
            pageSize: pageParams.pageSize,
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined,
            subjectName: queryParams.entity || undefined,
            certificateType: queryParams.issueType || undefined,
            productionArea: queryParams.productionArea || undefined,
            contactPhone: queryParams.phone || undefined,
            status: queryParams.status || undefined,
            startDate: queryParams.dateRange?.[0] || undefined,
            endDate: queryParams.dateRange?.[1] || undefined
        };
        const data = await CertificateApi.getCertificatePage(params);
        tableList.value = data.list || [];
        total.value = data.total || 0;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};
const handleAreaSelect = (area: any) => {
    queryParams.province = area.province;
    queryParams.city = area.city;
    queryParams.county = area.district;
    // 同时更新拼写的完整产地字符串，如果有需要的话
    queryParams.productionArea = [area.province, area.city, area.district].filter(Boolean).join('');
};

onMounted(() => {
    getList();
});

const handleQuery = () => {
    pageParams.pageNum = 1;
    getList();
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => {
        if (Array.isArray(queryParams[key])) {
            queryParams[key] = [];
        } else {
            queryParams[key] = undefined;
        }
    });
    queryParams.status = 1; // 重置时恢复默认有效状态
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        const params: any = {
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined,
            subjectName: queryParams.entity || undefined,
            certificateType: queryParams.issueType || undefined,
            productionArea: queryParams.productionArea || undefined,
            contactPhone: queryParams.phone || undefined,
            status: queryParams.status || undefined,
            startDate: queryParams.dateRange?.[0] || undefined,
            endDate: queryParams.dateRange?.[1] || undefined
        };
        const data = await CertificateApi.exportCertificate(params);
        download.excel(data, '合格证记录.xls');
    } catch {
    } finally {
        exportLoading.value = false;
    }
};

const handleAdd = () => {
    router.push('/certificate/issue/create');
};

const handleEdit = (row: any) => {
    router.push({ path: '/certificate/issue/create', query: { id: row.id } });
};

const handleView = (row: any) => {
    router.push(`/certificate/issue/detail/${row.id}`);
};

const handleDelete = async (row: any) => {
    try {
        await message.delConfirm();
        await CertificateApi.deleteCertificate(row.id);
        message.success('删除成功');
        getList();
    } catch {
    }
};

const handleCurrentChange = (val: number) => {
    pageParams.pageNum = val;
    getList();
};
</script>

<style lang="scss" scoped>
/* 页面特有样式（公共样式已在 App.vue 全局引入） */
.custom-datepicker {
    width: 260px !important;
}
.type-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &.producer {
        background: rgba(0, 179, 237, 0.1);
        color: #00B3ED;
        border: 1px solid rgba(0, 179, 237, 0.2);
    }
    
    &.seller {
        background: rgba(103, 194, 58, 0.1);
        color: #67c23a;
        border: 1px solid rgba(103, 194, 58, 0.2);
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
