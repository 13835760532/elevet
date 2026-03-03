<template>
    <div class="table-container">
        <!-- 顶部标题区 -->
        <div class="guide-card">
            <div class="card-header">
             
                <h2 class="card-title">合格证查验（生产者/收购者/销售者）</h2>
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="query-card">
            <div class="card-header">
             
                <h2 class="card-title">合格证查验查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="" prop="certNo">
                        <el-input :prefix-icon="Search" v-model="queryParams.certNo" placeholder="搜索合格证编号" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="productName">
                        <el-input :prefix-icon="Search" v-model="queryParams.productName" placeholder="搜索产品名称" clearable class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="entity">
                        <el-input :prefix-icon="Search" v-model="queryParams.entity" placeholder="搜索生产经营企业/个人" clearable
                            class="custom-input w220" />
                    </el-form-item>
                    <el-form-item label="" prop="certType">
                        <el-select v-model="queryParams.certType" placeholder="出证类型" clearable class="custom-select">
                            <el-option label="生产出证" value="produce" />
                            <el-option label="收购出证" value="purchase" />
                            <el-option label="销售出证" value="sell" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="" prop="province">
                        <el-cascader placeholder="产品产地" v-model="queryParams.province" :options="provinceAndCityData" :props="{label: 'name', value: 'code'}" clearable class="custom-select" />
                        <!-- <el-select v-show="false" v-model="queryParams.province" placeholder="省" clearable class="custom-select">
                            <el-option label="山东省" value="shandong" />
                            <el-option label="北京市" value="beijing" />
                        </el-select>
                        <el-select v-model="queryParams.city" placeholder="产品产地/市" clearable class="custom-select">
                            <el-option label="胶州市" value="jiaozhou" />
                        </el-select>
                        <el-select v-model="queryParams.county" placeholder="县" clearable class="custom-select">
                            <el-option label="胶州县" value="jiaozhou" />
                        </el-select> -->
                    </el-form-item>
                    <el-form-item label="" prop="phone">
                        <el-input :prefix-icon="Search" v-model="queryParams.phone" placeholder="搜索联系电话" clearable class="custom-input" />
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
                    <div class="section-indicator"></div>
                    <h3 class="section-title">合格证查验/存证记录</h3>
                </div>
                <div class="action-right">
                    <el-button @click="handleExport">导出</el-button>
                    <el-button type="primary" class="primary-btn" @click="handleUpload">上传存证</el-button>
                    <el-button type="primary" class="primary-btn" @click="handleVerify">合格证查验</el-button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableData" v-loading="loading">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="certNo" label="合格证编号" min-width="140" />
                    <el-table-column prop="source" label="合格证来源" width="100" align="center" />
                    <el-table-column prop="productName" label="产品名称" width="100" align="center" />
                    <el-table-column prop="productType" label="产品类别" width="100" align="center" />
                    <el-table-column prop="origin" label="产地" width="100" align="center" />
                    <el-table-column prop="entity" label="生产经营主体" min-width="160" />
                    <el-table-column prop="type" label="类型" width="80" align="center">
                        <template #default="{ row }">
                            <el-tag :type="row.type === '仅查验' ? 'warning' : 'success'" size="small">
                                {{ row.type }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="verifyTime" label="查验时间" width="150" align="center" />
                    <el-table-column label="操作" width="140" align="center" fixed="right">
                        <template #default="{ row }">
                            <span class="table-edit-operate" @click="handleEdit(row)">编辑</span>
                            <span class="table-view-operate" @click="handleView(row)">详情</span>
                            <span class="table-delete-operate" @click="handleDelete(row)">删除</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页区域 -->
            <div class="pagination-wrapper">
                <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" background
                    layout="prev, pager, next" class="custom-pagination" @current-change="handleCurrentChange"
                    @size-change="handleSizeChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
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
// 查询参数
const queryParams = reactive({
    certNo: '',
    productName: '',
    entity: '',
    certType: '',
    province: '',
    city: '',
    county: '',
    phone: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const tableData = ref([]);
const loading = ref(false);

const loadData = async () => {
    loading.value = true;
    try {
        const params: any = {
            pageNo: pageNum.value,
            pageSize: pageSize.value,
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined
        };
        const data = await CertificateApi.getCertificatePage(params);
        const list = data.list || [];
        tableData.value = list.map((item: any) => ({
            ...item,
            certNo: item.certificateCode,
            productName: item.productName,
            // 本平台数据
            source: '本平台',
            type: '仅查验',
            verifyTime: item.issueDate
        }));
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
    ElMessage.success('查询成功');
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => {
        queryParams[key] = '';
    });
    handleSearch();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        const params: any = {
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined
        };
        const data = await CertificateApi.exportCertificate(params);
        download.excel(data, '合格证查验记录.xls');
    } catch {
    }
};

// 跳转到其他平台查验页面（上传存证）
const handleUpload = () => {
    router.push('/certificate/verify/other');
};

// 跳转到本平台查验页面
const handleVerify = () => {
    router.push('/certificate/verify/detail');
};

const handleEdit = (row) => {
    ElMessage.info(`编辑: ${row.certNo}`);
};

const handleView = (row) => {
    // 根据来源跳转到不同页面
    if (row.source === '本平台') {
        router.push('/certificate/verify/detail');
    } else {
        router.push('/certificate/verify/other');
    }
};

const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定要删除合格证编号为 "${row.certNo}" 的查验记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        ElMessage.success('删除成功');
    }).catch(() => { });
};

const handleSizeChange = (val) => {
    pageSize.value = val;
    loadData();
};

const handleCurrentChange = (val) => {
    pageNum.value = val;
    loadData();
};
</script>

<style lang="scss" scoped>
/* 页面特有样式（公共样式已在 App.vue 全局引入） */
.action-left {
    .section-indicator {
        width: 4px;
        height: 18px;
        background: #00B3ED;
        border-radius: 2px;
    }
}
</style>
