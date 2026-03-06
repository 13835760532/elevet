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
                            <el-option label="生产者" value="producer" />
                            <el-option label="收购者" value="buyer" />
                            <el-option label="销售者" value="seller" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="" prop="province">
                        <el-cascader placeholder="产品产地" v-model="queryParams.province" :options="provinceAndCityData" :props="{label: 'name', value: 'code'}" clearable class="custom-select" />
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
                    <el-form-item label="" prop="phone">
                        <el-input :prefix-icon="Search" v-model="queryParams.phone" placeholder="搜索联系电话" clearable class="custom-input w220" />
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
                    <el-table-column label="合格证编号" prop="certNo" width="150" align="center" />
                    <el-table-column label="出证类型" prop="issueType" width="100" align="center">
                        <template #default="scope">
                            <span class="type-tag" :class="scope.row.issueType === '生产者' ? 'producer' : 'buyer'">{{
                                scope.row.issueType }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="产品名称" prop="productName" width="110" align="center" />
                    <el-table-column label="产品类别" prop="productCategory" width="110" align="center" />
                    <el-table-column label="产地" prop="origin" min-width="150" show-overflow-tooltip />
                    <el-table-column label="生产经营主体" prop="entity" min-width="200" show-overflow-tooltip />
                    <el-table-column label="开具日期" prop="issueDate" width="160" align="center" />
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
import * as CertificateApi from '@/api/agri/certificate';

const router = useRouter();
const message = useMessage();

const provinceAndCityData = [
    {
        "name": "山东省",
        "code": "370000",
        "children": [
            {
                "name": "青岛市",
                "code": "370200",
                "children": [
                    {
                        "name": "胶州市",
                        "code": "370281"
                    }
                ]
            }
        ]
    }
]

const queryParams = reactive({
    certNo: '',
    productName: '',
    entity: '',
    issueType: '',
    province: '',
    city: '',
    county: '',
    phone: ''
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
            status: 1 // 默认查询有效
        };
        const data = await CertificateApi.getCertificatePage(params);
        const list = data.list || [];
        tableList.value = list.map((item: any) => ({
            ...item,
            certNo: item.certificateCode,
            productName: item.productName,
            // 模拟字段或从 item 中提取
            issueType: item.certificateType === 1 ? '生产者' : '收购者',
            productCategory: '蔬菜', // 示例字段
            origin: item.origin || '山东省胶州市',
            entity: item.entityName || '某某生产经营主体',
            issueDate: item.issueDate || item.createTime || '-'
        }));
        total.value = data.total || 0;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getList();
});

const handleQuery = () => {
    pageParams.pageNum = 1;
    getList();
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
    handleQuery();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        exportLoading.value = true;
        const params: any = {
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined
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
.type-tag {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    
    &.producer {
        background: rgba(0, 179, 237, 0.1);
        color: #00B3ED;
        border: 1px solid rgba(0, 179, 237, 0.2);
    }
    
    &.buyer {
        background: rgba(255, 153, 0, 0.1);
        color: #FF9900;
        border: 1px solid rgba(255, 153, 0, 0.2);
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
