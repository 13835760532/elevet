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
            <div class="query-form-wrapper">
                <el-form :model="queryParams" :inline="true" class="custom-query-form custom-query-form-row"
                    label-position="left">
                    <el-form-item label="" prop="certNo">
                        <el-input :prefix-icon="Search" v-model="queryParams.certNo" placeholder="合格证编号查询" clearable
                            class="custom-input w180" />
                    </el-form-item>
                    <el-form-item label="" prop="productName">
                        <el-input :prefix-icon="Search" v-model="queryParams.productName" placeholder="产品名称查询" clearable
                            class="custom-input w180" />
                    </el-form-item>
                    <el-form-item label="" prop="entity">
                        <el-input :prefix-icon="Search" v-model="queryParams.entity" placeholder="生产经营主体查询" clearable
                            class="custom-input w180" />
                    </el-form-item>
                    <el-form-item label="" prop="certType">
                        <el-select v-model="queryParams.certType" style="width: 150px!important" placeholder="出证类型"
                            clearable class="custom-select">
                            <el-option label="生产者" :value="1" />
                            <el-option label="收购者" :value="2" />
                            <el-option label="批发市场" :value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="" prop="productionArea">
                        <AreaCascader v-model="areaIds" @select="handleAreaSelect" placeholder="产品产地"
                            style="width: 200px;" :checkStrictly="true" />
                    </el-form-item>
                    <el-form-item label="" prop="phone">
                        <el-input :prefix-icon="Search" v-model="queryParams.phone" placeholder="联系电话" clearable
                            class="custom-input w180" />
                    </el-form-item>
                    <el-form-item label="" prop="dateRange">
                        <el-date-picker style="width: 240px !important;" v-model="queryParams.dateRange"
                            type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"
                            value-format="YYYY-MM-DD" class="custom-datepicker" />
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
                        <el-icon style="margin-right: 4px;">
                            <Edit />
                        </el-icon>收证
                    </el-button>
                </div>
                <div class="action-right">
                    <!-- <el-button @click="handleExport" :loading="exportLoading">导出报告</el-button> -->
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table ref="tableRef" :data="tableData" v-loading="loading" :height="tableHeight">
                    <el-table-column label="序号" type="index" width="70" align="center" />
                    <el-table-column label="合格证编号" prop="certificateCode" width="160" align="center" />
                    <el-table-column label="收证来源" prop="certificateSource" width="100" align="center">
                        <template #default="{ row }">
                            <span class="source-tag" :class="row.certificateSource === 1 ? 'local' : 'other'">
                                {{ row.certificateSource === 1 ? '本平台' : '其他' }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="出证类型" prop="certificateType" width="100" align="center">
                        <template #default="{ row }">
                            <span v-if="row.certificateType" class="type-tag"
                                :class="row.certificateType === 1 ? 'producer' : (row.certificateType === 2 ? 'buyer' : 'seller')">
                                {{ row.certificateType === 1 ? '生产者' : (row.certificateType === 2 ? '收购者' : '批发市场') }}
                            </span>
                            <span v-else>--</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="产品名称" prop="productName" width="110" align="center" />
                    <el-table-column label="产品类别" prop="productCategory" width="110" align="center">
                        <template #default="{ row }">
                            {{ getProductCategoryLabel(row.productCategory) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="产地" prop="productionArea" min-width="150" show-overflow-tooltip />
                    <el-table-column label="生产经营主体" prop="subjectName" min-width="200" show-overflow-tooltip />
                    <el-table-column label="收证时间" prop="verificationTime" width="160" align="center"
                        :formatter="dateFormatter" />
                    <el-table-column label="操作" width="160" align="center" fixed="right">
                        <template #default="scope">
                            <div class="table-operate-action-btns">
                                <span v-if="scope.row.certificateSource === 2" class="table-edit-operate"
                                    @click="handleEdit(scope.row)">编辑</span>
                                <span class="table-view-operate" @click="handleView(scope.row)">详情</span>
                                <span class="table-delete-operate" @click="handleDelete(scope.row)">删除</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
                    layout="total, sizes, prev, pager, next, jumper" background class="custom-pagination"
                    @current-change="handleCurrentChange" @size-change="handleSizeChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Edit, Search } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import download from '@/utils/download';
import { dateFormatter } from '@/utils/formatTime';
import * as CertificateApi from '@/api/agri/certificate';
import { useTableHeight } from '@/hooks/web/useTableHeight';
import { useDict } from '@/hooks/web/useDict';

defineOptions({
    name: 'CertificateVerify'
});

const { getLabel: getProductCategoryLabel } = useDict('agri_product_category', 'str');

const router = useRouter();
const message = useMessage();
const tableRef = ref(null);
const { tableHeight } = useTableHeight(tableRef, 70);

const areaIds = ref<string[]>([]);
const queryParams = reactive({
    certNo: '',
    productName: '',
    entity: '',
    certType: undefined,
    productionArea: [] as string[],
    province: '',
    city: '',
    county: '',
    phone: '',
    dateRange: [] as any
});

watch(areaIds, (newVal) => {
    if (!newVal || newVal.length === 0) {
        queryParams.province = '';
        queryParams.city = '';
        queryParams.county = '';
        queryParams.productionArea = [];
    }
});

const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const tableData = ref([]);
const loading = ref(false);
const exportLoading = ref(false);

/**\n * handleAreaSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAreaSelect = (area: any) => {
    queryParams.province = area.province;
    queryParams.city = area.city;
    queryParams.county = area.district;
    // 同时更新拼写的完整产地字符串，如果有需要的话
    queryParams.productionArea = [area.province, area.city, area.district].filter(Boolean);
};
/**
 * 加载收证查验记录。
 * 产地只提交地区级联的末级名称，日期范围扩展到起止日全天。
 */
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
            productionArea: queryParams.productionArea?.length ? queryParams.productionArea[queryParams.productionArea.length - 1] : undefined,
            createTime: queryParams.dateRange && queryParams.dateRange.length === 2 ? [queryParams.dateRange[0] + ' 00:00:00', queryParams.dateRange[1] + ' 23:59:59'] : undefined,
            dataScope: 'AREA_REGULATE'
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

/**\n * handleSearch：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSearch = () => {
    pageNum.value = 1;
    loadData();
};

/** 清空普通筛选项和地区级联值，并从第一页重新查询。 */
const handleReset = () => {
    Object.keys(queryParams).forEach(key => {
        if (Array.isArray(queryParams[key])) {
            queryParams[key] = [];
        } else {
            queryParams[key] = undefined;
        }
    });
    areaIds.value = [];
    handleSearch();
};

/** 按当前筛选条件导出查验记录，参数口径与列表查询保持一致。 */
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
            productionArea: queryParams.productionArea?.length ? queryParams.productionArea[queryParams.productionArea.length - 1] : undefined,
            createTime: queryParams.dateRange && queryParams.dateRange.length === 2 ? [queryParams.dateRange[0] + ' 00:00:00', queryParams.dateRange[1] + ' 23:59:59'] : undefined,
        };
        const data = await CertificateApi.exportCertificateVerification(params);
        download.excel(data, '合格证收证记录.xls');
    } catch { } finally {
        exportLoading.value = false;
    }
};

/**\n * handleVerify：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleVerify = () => {
    router.push('/certificate/verify/other');
};

/**\n * handleEdit：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleEdit = (row: any) => {
    // 编辑其他平台合格证 不现实 tab 切换
    router.push({ path: '/certificate/verify/other', query: { id: row.id } });
};

/**\n * handleView：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleView = (row: any) => {
    const path = '/certificate/verify/detail';
    router.push({ path, query: { id: row.id } });
};

/**\n * handleDelete：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDelete = async (row: any) => {
    try {
        await message.delConfirm(`确定要删除合格证编号为 "${row.certificateCode}" 的查验记录吗？`);
        await CertificateApi.deleteCertificateVerification(row.id);
        message.success('删除成功');
        loadData();
    } catch (error) { }
};

/**\n * handleSizeChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSizeChange = (val: number) => {
    pageSize.value = val;
    loadData();
};

/**\n * handleCurrentChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCurrentChange = (val: number) => {
    pageNum.value = val;
    loadData();
};
</script>

<style lang="scss" scoped>
/* 统一样式，引用 issue 风格 */
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

    &.buyer {
        background: rgba(255, 149, 0, 0.1);
        color: #FF9500;
        border: 1px solid rgba(255, 149, 0, 0.2);
    }
}

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
