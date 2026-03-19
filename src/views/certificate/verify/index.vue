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
                            <el-option label="生产者" :value="1" />
                            <el-option label="收购者" :value="2" />
                            <el-option label="批发市场" :value="3" />
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

            <!-- 页签切换 -->
            <div class="record-tabs">
                <div class="tab-item" :class="{ active: activeTab === 'all' }" @click="handleTabChange('all')">
                    全部记录
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'deposit' }" @click="handleTabChange('deposit')">
                    合格证存证
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'verify' }" @click="handleTabChange('verify')">
                    合格证查验
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableData" v-loading="loading">
                    <el-table-column type="index" label="序号" width="60" align="center" />
                    <el-table-column prop="certificateCode" label="合格证编号" min-width="160" />
                    <el-table-column prop="certificateSource" label="合格证来源" width="120" align="center">
                        <template #default="{ row }">
                            {{ row.certificateSource === 1 ? '本平台' : '其他平台' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="productName" label="产品名称" width="100" align="center" />
                    <el-table-column prop="productCategory" label="产品类别" width="100" align="center" />
                    <el-table-column prop="productionArea" label="产地" width="120" align="center" show-overflow-tooltip />
                    <el-table-column prop="subjectName" label="生产经营主体" min-width="160" show-overflow-tooltip />
                    <el-table-column prop="verificationType" label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="row.verificationType === 1 ? 'warning' : 'success'" size="small">
                                {{ row.verificationType === 1 ? '仅查验' : '已存证' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="verificationTime" label="查验时间" width="160" align="center" :formatter="dateFormatter" />
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
import { dateFormatter } from '@/utils/formatTime';
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
    province: [] as any,
    city: '',
    county: '',
    phone: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 页签状态
const activeTab = ref('all');

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
            productName: queryParams.productName || undefined,
            subjectName: queryParams.entity || undefined,
            certificateType: queryParams.certType || undefined,
            contactPhone: queryParams.phone || undefined,
            productionArea: queryParams.province ? queryParams.province.join('/') : undefined,
            verificationType: activeTab.value === 'all' ? undefined : (activeTab.value === 'deposit' ? 2 : 1)
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

// 页签切换处理
const handleTabChange = (tab: string) => {
    activeTab.value = tab;
    pageNum.value = 1;
    loadData();
};

const handleSearch = () => {
    pageNum.value = 1;
    loadData();
    ElMessage.success('查询成功');
};

const handleReset = () => {
    Object.keys(queryParams).forEach(key => {
        if (Array.isArray(queryParams[key])) {
            queryParams[key] = [];
        } else {
            queryParams[key] = '';
        }
    });
    handleSearch();
};

const handleExport = async () => {
    try {
        await message.exportConfirm();
        const params: any = {
            certificateCode: queryParams.certNo || undefined,
            productName: queryParams.productName || undefined,
            subjectName: queryParams.entity || undefined,
            certificateType: queryParams.certType || undefined,
            contactPhone: queryParams.phone || undefined,
            productionArea: queryParams.province ? queryParams.province.join('/') : undefined,
            verificationType: activeTab.value === 'all' ? undefined : (activeTab.value === 'deposit' ? 2 : 1)
        };
        const data = await CertificateApi.exportCertificateVerification(params);
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

const handleEdit = (row: any) => {
    ElMessage.info(`编辑: ${row.certificateCode}`);
};

const handleView = (row: any) => {
    // 根据来源跳转到不同页面，并携带详情 ID
    const path = row.certificateSource === 1 ? '/certificate/verify/detail' : '/certificate/verify/other';
    router.push({ path, query: { id: row.id } });
};

const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(`确定要删除合格证编号为 "${row.certificateCode}" 的查验记录吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        await CertificateApi.deleteCertificateVerification(row.id);
        ElMessage.success('删除成功');
        loadData();
    } catch (error) {
        if (error !== 'cancel') {
            console.error(error);
        }
    }
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
        height: 22px;
        background: #00B3ED;
        border-radius: 2px;
    }
}

.record-tabs {
    display: flex;
    margin: 0px 0 20px 0;
    
    .tab-item {
        width: 140px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #333;
        background: #FFFFFF;
        border: 1px solid #00B3ED;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        
        &:first-child {
            border-radius: 4px 0 0 4px;
        }
        
        &:last-child {
            border-radius: 0 4px 4px 0;
        }
        
        & + .tab-item {
            border-left: none;
        }
        
        &:hover {
            background: rgba(0, 179, 237, 0.05);
        }
        
        &.active {
            background: #00B3ED;
            color: #FFFFFF;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(45, 92, 246, 0.2);
        }
    }
}
</style>
