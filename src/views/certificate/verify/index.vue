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
                <el-form :inline="true" :model="queryParams" class="custom-query-form" label-position="left">
                    <el-form-item label="合格证编号">
                        <el-input v-model="queryParams.certNo" placeholder="请输入" clearable class="custom-input" />
                    </el-form-item>
                    <el-form-item label="产品名称">
                        <el-input v-model="queryParams.productName" placeholder="请输入" clearable class="custom-input" />
                    </el-form-item>
                    <el-form-item label="生产经营企业/个人">
                        <el-input v-model="queryParams.entity" placeholder="请输入企业" clearable
                            class="custom-input w200" />
                    </el-form-item>
                    <el-form-item label="出证类型">
                        <el-select v-model="queryParams.certType" placeholder="请选择" clearable class="custom-select">
                            <el-option label="生产出证" value="produce" />
                            <el-option label="收购出证" value="purchase" />
                            <el-option label="销售出证" value="sell" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品产地">
                        <el-select v-model="queryParams.province" placeholder="省" clearable class="custom-select">
                            <el-option label="山东省" value="shandong" />
                            <el-option label="北京市" value="beijing" />
                        </el-select>
                        <el-select v-model="queryParams.city" placeholder="市" clearable class="custom-select">
                            <el-option label="胶州市" value="jiaozhou" />
                        </el-select>
                        <el-select v-model="queryParams.county" placeholder="县" clearable class="custom-select">
                            <el-option label="胶州县" value="jiaozhou" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="联系电话">
                        <el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable class="custom-input" />
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
                <el-table :data="tableData">
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
                    layout="prev, pager, next" class="custom-pagination" @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

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

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1);

// 表格数据
const tableData = ref([]);

// 模拟数据
const mockData = [
    {
        id: 1,
        certNo: 'HGZ20251211290',
        source: '本平台',
        productName: '白菜',
        productType: '蔬菜',
        origin: '山东省胶州市',
        entity: '山东胶州XXX合作社',
        type: '仅查验',
        verifyTime: '2025-12-12 16:00'
    },
    {
        id: 2,
        certNo: 'HGZ20251211290',
        source: '本平台',
        productName: '黄瓜',
        productType: '蔬菜',
        origin: '山东省胶州市',
        entity: '北京福农生态科技有限公司',
        type: '里验存证',
        verifyTime: '2025-12-12 16:00'
    },
    {
        id: 3,
        certNo: '--',
        productName: '其他',
        productType: '蔬菜',
        source: '其他',
        origin: '山东省胶州市',
        entity: '北京福农生态科技有限公司',
        type: '里验存证',
        verifyTime: '2025-12-12 16:00'
    }
];

onMounted(() => {
    loadData();
});

const loadData = () => {
    // 模拟加载数据
    tableData.value = mockData;
    total.value = mockData.length;
};

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

const handleExport = () => {
    ElMessage.info('导出功能开发中');
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

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
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
