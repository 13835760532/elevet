<template>
    <div class="table-container">
        <div class="page-layout">
            <!-- 左侧区域树 -->
            <div class="left-sidebar">
                <div class="sidebar-header">
                    <el-input v-model="searchRegion" placeholder="搜索辖区" :prefix-icon="Search" class="search-input" />
                    <div class="add-btn">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>
                </div>
                <div class="tree-wrapper">
                    <el-tree :data="regionTree" :props="treeProps" default-expand-all highlight-current node-key="id"
                        @node-click="handleNodeClick">
                        <template #default="{ node }">
                            <span class="custom-tree-node">
                                <span class="node-label">{{ node.label }}</span>
                            </span>
                        </template>
                    </el-tree>
                </div>
            </div>

            <!-- 右侧主内容区 -->
            <div class="main-content">
                <!-- 顶部标题区 -->
                <div class="guide-card">
                    <div class="card-header">
                     
                        <h2 class="card-title">辖区合格证</h2>
                    </div>
                    <p class="page-subtitle">本机构管辖地区合格证开具、查验、存证情况统计</p>
                </div>

                <!-- 统计卡片区 -->
                <div class="query-card stats-section">
                    <div class="card-header">
                     
                        <h2 class="card-title">辖区合格证概况</h2>
                    </div>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-label">辖区合格证开具量</div>
                            <div class="stat-value">29299292</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">辖区合格证存证量</div>
                            <div class="stat-value">29299292</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">辖区合格证查验次数</div>
                            <div class="stat-value">29299292</div>
                        </div>
                    </div>
                </div>

                <!-- 搜索查询区 -->
                <div class="query-card">
                    <div class="card-header">
                     
                        <h2 class="card-title">辖区合格证查询</h2>
                    </div>
                    <div class="query-form-wrapper">
                        <el-form :model="queryParams" :inline="true" class="custom-query-form" label-position="left">
                            <el-form-item label="统计周期">
                                <el-date-picker v-model="queryParams.dateRange" type="daterange" range-separator="至"
                                    start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                                    class="date-picker" />
                            </el-form-item>
                            <el-form-item label="合格证编号">
                                <el-input v-model="queryParams.certNo" placeholder="请输入" clearable
                                    class="custom-input" />
                            </el-form-item>
                            <el-form-item label="产品名称">
                                <el-input v-model="queryParams.productName" placeholder="请输入名称" clearable
                                    class="custom-input" />
                            </el-form-item>
                            <el-form-item label="生产经营企业/个人">
                                <el-input v-model="queryParams.entity" placeholder="请输入名称" clearable
                                    class="custom-input w200" />
                            </el-form-item>
                            <el-form-item label="出证类型">
                                <el-select v-model="queryParams.certType" placeholder="请选择" clearable
                                    class="custom-select">
                                    <el-option label="生产者出证" value="produce" />
                                    <el-option label="分销商出证" value="sell" />
                                    <el-option label="批发市场" value="wholesale" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="产品产地">
                                <el-select v-model="queryParams.province" placeholder="省" clearable
                                    class="custom-select">
                                    <el-option label="山东省" value="shandong" />
                                </el-select>
                                <el-select v-model="queryParams.city" placeholder="市" clearable class="custom-select">
                                    <el-option label="胶州市" value="jiaozhou" />
                                </el-select>
                                <el-select v-model="queryParams.county" placeholder="县" clearable class="custom-select">
                                    <el-option label="胶州区" value="jiaozhouqu" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="联系人">
                                <el-input v-model="queryParams.contact" placeholder="请输入联系电话" clearable
                                    class="custom-input" />
                            </el-form-item>
                            <div class="query-btns">
                                <el-button @click="handleReset" class="reset-btn">重置</el-button>
                                <el-button type="primary" @click="handleSearch" class="search-btn">查询</el-button>
                            </div>
                        </el-form>
                    </div>
                    <div class="table-actions">
                        <div class="action-left">
                            <div class="section-indicator"></div>
                            <h3 class="table-section-title">辖区合格证列表</h3>
                        </div>
                    </div>

                    <div class="table-wrapper">
                        <el-table :data="tableData">
                            <el-table-column type="index" label="序号" width="60" align="center" />
                            <el-table-column prop="certNo" label="合格证编号" min-width="150" />
                            <el-table-column prop="certType" label="出证类型" width="100" align="center" />
                            <el-table-column prop="productName" label="产品名称" width="80" align="center" />
                            <el-table-column prop="productType" label="产品类别" width="80" align="center" />
                            <el-table-column prop="origin" label="产地" min-width="100" />
                            <el-table-column prop="entity" label="生产经营主体" min-width="140" />
                            <el-table-column prop="issueDate" label="开具日期" width="140" align="center" />
                            <el-table-column prop="contact" label="联系人" width="120" align="center">
                                <template #header>
                                    <div>联系人</div>
                                    <div class="sub-header">(生产经营企业/个人)</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="phone" label="联系电话" width="120" align="center">
                                <template #header>
                                    <div>联系电话</div>
                                    <div class="sub-header">(生产经营企业/个人)</div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <div class="pagination-wrapper">
                        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
                            background layout="prev, pager, next" class="custom-pagination"
                            @current-change="handleCurrentChange" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';

// 搜索区域
const searchRegion = ref('');

// 区域树数据 - 山西省
const regionTree = ref([
    {
        id: 1,
        label: '山西省',
        icon: '🏛️',
        children: [
            {
                id: 11,
                label: '太原市',
                icon: '🏙️',
                children: [
                    { id: 111, label: '小店区', icon: '📍' },
                    { id: 112, label: '迎泽区', icon: '📍' },
                    { id: 113, label: '杏花岭区', icon: '📍' },
                    { id: 114, label: '尖草坪区', icon: '📍' }
                ]
            },
            {
                id: 12,
                label: '大同市',
                icon: '🏙️',
                children: [
                    { id: 121, label: '平城区', icon: '📍' },
                    { id: 122, label: '云冈区', icon: '📍' },
                    { id: 123, label: '新荣区', icon: '📍' }
                ]
            },
            {
                id: 13,
                label: '阳泉市',
                icon: '🏙️',
                children: [
                    { id: 131, label: '城区', icon: '📍' },
                    { id: 132, label: '矿区', icon: '📍' },
                    { id: 133, label: '郊区', icon: '📍' }
                ]
            },
            {
                id: 14,
                label: '长治市',
                icon: '🏙️',
                children: [
                    {
                        id: 141,
                        label: '潞州区',
                        icon: '📍',
                        children: [
                            { id: 1411, label: '东街街道', icon: '🏘️' },
                            { id: 1412, label: '西街街道', icon: '🏘️' },
                            { id: 1413, label: '南街街道', icon: '🏘️' }
                        ]
                    },
                    { id: 142, label: '上党区', icon: '📍' },
                    { id: 143, label: '屯留区', icon: '📍' }
                ]
            },
            {
                id: 15,
                label: '晋城市',
                icon: '�️',
                children: [
                    { id: 151, label: '城区', icon: '📍' },
                    { id: 152, label: '泽州县', icon: '📍' },
                    { id: 153, label: '高平市', icon: '📍' }
                ]
            }
        ]
    }
]);

const treeProps = {
    children: 'children',
    label: 'label'
};

// 查询参数
const queryParams = reactive({
    dateRange: [],
    certNo: '',
    productName: '',
    entity: '',
    certType: '',
    province: '',
    city: '',
    county: '',
    contact: ''
});

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 表格数据
const tableData = ref([]);

// 模拟数据
const mockData = [
    {
        id: 1,
        certNo: 'HGZ20205121290',
        certType: '生产者出证',
        productName: '白菜',
        productType: '蔬菜',
        origin: '山东省胶州市',
        entity: '山东胶州XXX合作社',
        issueDate: '2025-12-12 16:00',
        contact: '秦地萍',
        phone: '19812319980'
    },
    {
        id: 2,
        certNo: 'HGZ20205121290',
        certType: '分销商出证',
        productName: '黄瓜',
        productType: '蔬菜',
        origin: '山东省胶州市',
        entity: '北京福农生态科技有限公司',
        issueDate: '2025-12-12 16:00',
        contact: '秦地萍',
        phone: '19812319980'
    },
    {
        id: 3,
        certNo: 'HGZ20205121290',
        certType: '批发市场',
        productName: '黄瓜',
        productType: '蔬菜',
        origin: '山东省胶州市',
        entity: '北京福农生态科技有限公司',
        issueDate: '2025-12-12 16:00',
        contact: '秦地萍',
        phone: '19812319980'
    }
];

onMounted(() => {
    loadData();
});

const loadData = () => {
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
        if (Array.isArray(queryParams[key])) {
            queryParams[key] = [];
        } else {
            queryParams[key] = '';
        }
    });
};

const handleNodeClick = (data) => {
    ElMessage.info(`选择区域: ${data.label}`);
};

const handleCurrentChange = (val) => {
    pageNum.value = val;
    loadData();
};
</script>

<style lang="scss" scoped>
/* 页面特有样式（公共样式已在 App.vue 全局引入） */

.page-layout {
    display: flex;
    height: 100%;
    gap: 16px;
}

/* 左侧边栏 */
.left-sidebar {
    width: 220px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .search-input {
        flex: 1;
    }

    .add-btn {
        width: 32px;
        height: 32px;
        border-radius: 4px;
        background-color: #00B3ED;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        cursor: pointer;
    }
}

.tree-wrapper {
    flex: 1;
    overflow-y: auto;
}

.custom-tree-node {
    display: flex;
    align-items: center;
    gap: 8px;

    .node-label {
        font-size: 14px;
        color: #333;
    }
}

:deep(.el-tree-node__content) {
    height: 36px;
    border-radius: 6px;

    &:hover {
        background: #f0f7ff;
    }
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
    background: #e6f4ff;
    color: #00B3ED;
}

/* 右侧主内容区 */
.main-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* 页面副标题 */
.page-subtitle {
    font-size: 14px;
    color: #666;
    margin: 8px 0 0 14px;
}

/* 统计卡片 */
.stats-cards {
    display: flex;
    gap: 16px;
}

.stat-card {
    flex: 1;
    padding: 20px 24px;
    border: 2px solid #00B3ED;
    border-radius: 12px;
    text-align: center;
    background: #fff;

    .stat-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #00B3ED;
    }
}

/* 日期选择器宽度 */
.date-picker {
    width: 280px;
}

/* 操作行内标题 */
.action-left {
    .section-indicator {
        width: 4px;
        height: 18px;
        background: #00B3ED;
        border-radius: 2px;
    }

    .table-section-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}

/* 表头子标题 */
.sub-header {
    font-size: 11px;
    color: #999;
    font-weight: normal;
}
</style>
