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
                    <el-tree :data="regionTree" :props="treeProps" highlight-current node-key="id"
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
                        <h2 class="card-title">辖区合格证统计</h2>
                    </div>
                    <p class="page-subtitle">本机构管辖{{ currentJurisdictionLabel }}合格证开具、查验、存证情况统计</p>
                </div>

                <!-- 统计卡片区 -->
                <div class="query-card stats-section">
                    <div class="card-header">
                        <h2 class="card-title">辖区合格证概况</h2>
                    </div>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-label">{{ currentJurisdictionLabel }}合格证开具量</div>
                            <div class="stat-value">{{ statsData.certificateIssueCount }}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">{{ currentJurisdictionLabel }}合格证收证量</div>
                            <div class="stat-value">{{ statsData.archivedCount }}</div>
                        </div>
                    </div>
                </div>

                <!-- 搜索查询区 -->
                <div class="query-card">

                    <!-- 交互页签 -->
                    <div class="record-tabs">
                        <div class="tab-item" :class="{ active: activeTab === 'produce' }"
                            @click="handleTabChange('produce')">
                            合格证开具
                        </div>
                        <div class="tab-item" :class="{ active: activeTab === 'verify' }"
                            @click="handleTabChange('verify')">
                            合格证收证
                        </div>
                    </div>
                    <div class="query-form-wrapper">
                        <el-form :model="queryParams" class="custom-query-form custom-query-form-row"
                            label-position="left">
                            <div class="query-row main-filters">
                                <el-form-item label="" prop="dateRange">
                                    <el-date-picker v-model="queryParams.dateRange" type="daterange" range-separator="-"
                                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                                        class="date-picker custom-input" style="width: 240px !important;" />
                                </el-form-item>
                                <el-form-item label="" prop="certificateCode">
                                    <el-input :prefix-icon="Search" v-model="queryParams.certificateCode"
                                        placeholder="合格证编号" clearable class="custom-input w140" />
                                </el-form-item>
                                <el-form-item label="" prop="productName">
                                    <el-input :prefix-icon="Search" v-model="queryParams.productName"
                                        placeholder="产品名称" clearable class="custom-input w140" />
                                </el-form-item>
                                <el-form-item label="" prop="subjectName">
                                    <el-input :prefix-icon="Search" v-model="queryParams.subjectName"
                                        placeholder="生产经营企业" clearable class="custom-input w140" />
                                </el-form-item>
                                <el-form-item v-if="activeTab === 'produce'" label="" prop="status">
                                    <el-select v-model="queryParams.status" placeholder="开具状态" clearable
                                        class="custom-select w140">
                                        <el-option v-for="item in certificateStatusOptions" :key="item.value"
                                            :label="item.label" :value="item.value" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="" prop="productionArea">
                                    <div class="area-selectors">
                                        <AreaCascader v-model="areaIds" @select="handleAreaSelect" @change="handleAreaChange" placeholder="产品产地"
                                            checkStrictly :root-area-code="userDeptAreaCode" style="width: 200px;" />
                                    </div>
                                </el-form-item>
                                <el-form-item v-if="activeTab === 'verify'" label="" prop="certificateSource">
                                    <el-select v-model="queryParams.certificateSource" placeholder="来源" clearable
                                        class="custom-select w140">
                                        <el-option label="本平台" :value="1" />
                                        <el-option label="其他平台" :value="2" />
                                    </el-select>
                                </el-form-item>
                                <!-- <el-form-item v-if="activeTab === 'verify'" label="" prop="verificationType">
                                    <el-select v-model="queryParams.verificationType" placeholder="查验状态" clearable
                                        class="custom-select w100">
                                        <el-option label="仅查验" :value="1" />
                                        <el-option label="已存证" :value="2" />
                                    </el-select>
                                </el-form-item> -->
                                <el-form-item label="" prop="contactPhone">
                                    <el-input :prefix-icon="Search" v-model="queryParams.contactPhone"
                                        placeholder="联系电话" clearable class="custom-input w140" />
                                </el-form-item>

                                <div class="query-btns">
                                    <el-button type="primary" @click="handleSearch" class="search-btn">查询</el-button>
                                    <el-button @click="handleReset" class="reset-btn">重置</el-button>
                                </div>
                            </div>
                        </el-form>
                    </div>

                    <div class="table-actions">
                        <div class="action-left">
                            <div class="section-indicator"></div>
                            <h3 class="table-section-title">辖区合格证列表</h3>
                        </div>
                        <div class="action-right">
                            <el-button class="export-btn" :loading="exportLoading" @click="handleExport">导出</el-button>
                        </div>
                    </div>

                    <div class="table-wrapper">
                        <el-table ref="tableRef" :data="tableData" v-loading="loading" :height="tableHeight">
                            <el-table-column type="index" label="序号" width="60" align="center" />
                            <el-table-column prop="certificateCode" label="合格证编号" width="150" />
                            <el-table-column prop="certificateType" label="出证类型" width="100" align="center">
                                <template #default="scope">
                                    <el-tag v-if="scope.row.certificateType === 1">生产者</el-tag>
                                    <el-tag v-else-if="scope.row.certificateType === 2" type="success">收购者</el-tag>
                                    <el-tag v-else-if="scope.row.certificateType === 3" type="warning">批发市场</el-tag>
                                    <span v-else>--</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="productName" label="产品名称" width="100" align="center" />
                            <el-table-column prop="productCategory" label="产品类别" width="100" align="center" />
                            <el-table-column prop="productionArea" label="产地" width="150" show-overflow-tooltip />
                            <el-table-column prop="subjectName" label="生产经营主体" min-width="160" show-overflow-tooltip />
                            <el-table-column v-if="activeTab === 'produce'" prop="issueDate" label="开具日期" width="160"
                                align="center" :formatter="dateFormatter" />

                            <template v-if="activeTab === 'verify'">
                                <el-table-column prop="certificateSource" label="来源" width="100" align="center">
                                    <template #default="scope">
                                        <el-tag :type="scope.row.certificateSource === 1 ? 'primary' : 'info'"
                                            effect="plain">
                                            {{ scope.row.certificateSource === 1 ? '本平台' : '其他平台' }}
                                        </el-tag>
                                    </template>
                                </el-table-column>
                                <!-- <el-table-column prop="verificationType" label="查验状态" width="100" align="center">
                                    <template #default="scope">
                                        <el-tag :type="scope.row.verificationType === 2 ? 'success' : 'warning'">
                                            {{ scope.row.verificationType === 2 ? '已存证' : '仅查验' }}
                                        </el-tag>
                                    </template>
                                </el-table-column> -->
                                <el-table-column prop="verificationTime" label="查验时间" width="160" align="center"
                                    :formatter="dateFormatter" />
                            </template>

                            <el-table-column prop="contactName" label="联系人" width="100" align="center">
                                <template #header>
                                    <div>联系人</div>
                                    <div class="sub-header">(生产经营企业/个人)</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="contactPhone" label="联系电话" width="120" align="center">
                                <template #header>
                                    <div>联系电话</div>
                                    <div class="sub-header">(生产经营企业/个人)</div>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="180" fixed="right" align="center">
                                <template #default="scope">
                                    <div class="table-ops">
                                        <el-button v-if="activeTab === 'produce'" link type="primary"
                                            @click="handleEdit(scope.row)">编辑</el-button>
                                        <el-button link type="primary" @click="handleDetail(scope.row)">详情</el-button>
                                        <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    <div class="pagination-wrapper">
                        <div class="total-text">共 {{ total }} 条记录</div>
                        <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
                            background layout="total, sizes, prev, pager, next, jumper" class="custom-pagination"
                            @current-change="handleCurrentChange" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import * as CertificateApi from '@/api/agri/certificate';
import * as CertificateVerificationApi from '@/api/agri/certificateVerification';
import * as AreaApi from '@/api/system/area';
import download from '@/utils/download';
import { dateFormatter } from '@/utils/formatTime';
import AreaCascader from '@/components/AreaCascader/index.vue';
import { useTableHeight } from '@/hooks/web/useTableHeight';
import { CACHE_KEY, useCache } from '@/hooks/web/useCache';

const router = useRouter();
const tableRef = ref(null);
const { tableHeight } = useTableHeight(tableRef, 70);
const exportLoading = ref(false);
const { wsCache } = useCache();

const normalizeAreaValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') return '';
    return String(value);
};

const isSuperAdmin = () => {
    const userInfo = wsCache.get(CACHE_KEY.USER);
    const roles = userInfo?.roles || [];
    return Array.isArray(roles) && roles.includes('super_admin');
};

const getUserDeptAreaParams = () => {
    if (isSuperAdmin()) {
        return {
            areaCode: '',
            areaLevel: ''
        };
    }

    const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {};
    return {
        areaCode: normalizeAreaValue(userDept.areaCode),
        areaLevel: normalizeAreaValue(userDept.areaLevel || userDept.areaType)
    };
};

const getUserDeptAreaName = () => {
    const userDept = wsCache.get(CACHE_KEY.USER_DEPT) || {};
    return (
        userDept.districtName ||
        userDept.cityName ||
        userDept.provinceName ||
        userDept.areaName ||
        userDept.name ||
        '辖区'
    );
};

const userDeptAreaCode = computed(() => getUserDeptAreaParams().areaCode);
const userDeptAreaName = ref(getUserDeptAreaName());

const findNodeById = (id: any, tree: any[]): any | undefined => {
    if (!id || !Array.isArray(tree)) return undefined;
    for (const node of tree) {
        if (String(node.id) === String(id)) return node;
        const found = findNodeById(id, node.children || []);
        if (found) return found;
    }
    return undefined;
};

const findNodePathById = (id: any, tree: any[]): any[] | undefined => {
    if (!id || !Array.isArray(tree)) return undefined;
    for (const node of tree) {
        if (String(node.id) === String(id)) return [node];
        const path = findNodePathById(id, node.children || []);
        if (path) return [node, ...path];
    }
    return undefined;
};

const limitTreeByRootArea = (tree: any[], rootAreaCode: any) => {
    if (!rootAreaCode) return tree || [];
    const rootNode = findNodeById(rootAreaCode, tree || []);
    return rootNode ? [rootNode] : tree || [];
};

// 搜索区域
const searchRegion = ref('');

// 区域树数据
const regionTree = ref([]);
const currentJurisdictionName = computed(() => {
    if (selectedArea.value?.displayName) return selectedArea.value.displayName;
    return userDeptAreaName.value || '辖区';
});
const currentJurisdictionLabel = computed(() => `辖区（${currentJurisdictionName.value}）`);

const treeProps = {
    children: 'children',
    label: 'name'
};

const getRegionTree = async () => {
    try {
        const data = await AreaApi.getAreaTree();
        const userDeptPath = findNodePathById(userDeptAreaCode.value, data || []);
        if (userDeptPath?.length) {
            userDeptAreaName.value = userDeptPath[userDeptPath.length - 1]?.name || userDeptAreaName.value;
        }
        const limitedTree = limitTreeByRootArea(data || [], userDeptAreaCode.value);
        regionTree.value = [
            { id: '', name: userDeptAreaCode.value ? '全部管理辖区' : '全部辖区' },
            ...limitedTree
        ];
    } catch (e) {
        console.error('获取区域树失败', e);
    }
};

// 查询参数
const queryParams = reactive({
    dateRange: [],
    certificateCode: '',
    productName: '',
    subjectName: '',
    certificateType: 1 as number | undefined,
    productionArea: '',
    province: '',
    city: '',
    county: '',
    certificateSource: undefined,
    verificationType: undefined,
    contactPhone: '',
    status: undefined as number | undefined
});

const areaIds = ref([]);
const handleAreaSelect = (area: any) => {
    queryParams.province = area.province;
    queryParams.city = area.city;
    queryParams.county = area.district;
    queryParams.productionArea = [area.province, area.city, area.district].filter(Boolean).join('');
};

const handleAreaChange = (value: any) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        queryParams.province = '';
        queryParams.city = '';
        queryParams.county = '';
        queryParams.productionArea = '';
    }
};

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 页签状态
const activeTab = ref('produce');

const certificateStatusOptions = [
    { label: '未开具', value: 0 },
    { label: '已开具', value: 1 },
    { label: '已作废', value: 2 }
];

// 表格数据
const tableData = ref([]);
const loading = ref(false);

const statsData = reactive({
    certificateIssueCount: 0,
    verificationOnlyCount: 0,
    archivedCount: 0
});

const selectedArea = ref<any>(null);

const getEffectiveAreaParams = () => {
    if (selectedArea.value) {
        return {
            areaCode: selectedArea.value.areaCode,
            areaLevel: selectedArea.value.areaLevel
        };
    }

    const userDeptAreaParams = getUserDeptAreaParams();
    return {
        areaCode: userDeptAreaParams.areaCode || undefined,
        areaLevel: userDeptAreaParams.areaLevel || undefined
    };
};

const buildPageParams = () => {
    const areaParams = getEffectiveAreaParams();
    const params: any = {
        pageNo: pageNum.value,
        pageSize: pageSize.value,
        certificateCode: queryParams.certificateCode || undefined,
        productName: queryParams.productName || undefined,
        subjectName: queryParams.subjectName || undefined,
        productionArea: selectedArea.value?.productionArea || queryParams.productionArea || undefined,
        contactPhone: queryParams.contactPhone || undefined,
        startDate: queryParams.dateRange?.[0] || undefined,
        endDate: queryParams.dateRange?.[1] || undefined,
        areaCode: areaParams.areaCode,
        areaLevel: areaParams.areaLevel
    };

    if (activeTab.value === 'produce') {
        params.certificateType = 1;
        params.status =
            queryParams.status === 0 || queryParams.status
                ? queryParams.status
                : undefined;
    } else {
        params.certificateType = '2';
        params.certificateSource = queryParams.certificateSource || undefined;
        params.verificationType = queryParams.verificationType || undefined;
    }

    return params;
};

const loadStats = async () => {
    try {
        const params = getEffectiveAreaParams();
        const res = await CertificateVerificationApi.getStatistics(params);
        if (res) {
            statsData.certificateIssueCount = res.certificateIssueCount || 0;
            statsData.verificationOnlyCount = res.verificationOnlyCount || 0;
            statsData.archivedCount = res.archivedCount || 0;
        }
    } catch (e) {
        console.error('加载统计数据失败', e);
    }
};

const loadData = async () => {
    loading.value = true;
    try {
        let res;
        if (activeTab.value === 'produce') {
            res = await CertificateApi.getCertificatePage(buildPageParams());
        } else {
            res = await CertificateApi.getCertificateVerificationPage(buildPageParams());
        }

        tableData.value = res.list || [];
        total.value = res.total || 0;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    getRegionTree();
    loadStats();
    loadData();
});

// 页签切换处理
const handleTabChange = (tab: string) => {
    activeTab.value = tab;
    queryParams.certificateType = tab === 'produce' ? 1 : undefined;
    queryParams.status = undefined;
    queryParams.certificateSource = undefined;
    queryParams.verificationType = undefined;
    pageNum.value = 1;
    loadData();
};

const handleSearch = () => {
    pageNum.value = 1;
    loadData();
    ElMessage.success('查询成功');
};

const handleReset = () => {
    queryParams.dateRange = [];
    queryParams.certificateCode = '';
    queryParams.productName = '';
    queryParams.subjectName = '';
    queryParams.certificateType = undefined;
    queryParams.province = '';
    queryParams.city = '';
    queryParams.county = '';
    queryParams.productionArea = '';
    areaIds.value = [];
    queryParams.certificateSource = undefined;
    queryParams.verificationType = undefined;
    queryParams.contactPhone = '';
    queryParams.status = undefined;
    queryParams.certificateType = activeTab.value === 'produce' ? 1 : undefined;
    handleSearch();
};

const handleNodeClick = (data: any, node: any) => {
    if (!data.id) {
        selectedArea.value = null;
    } else {
        const getFullName = (n: any): string => {
            if (!n || !n.data || !n.data.id) return '';
            return getFullName(n.parent) + (n.data.name || '');
        };
        selectedArea.value = {
            areaCode: data.id,
            areaLevel: data.type || node.level,
            productionArea: getFullName(node),
            displayName: data.name || getFullName(node)
        };
    }
    loadStats();
    pageNum.value = 1;
    loadData();
};

const handleExport = async () => {
    try {
        await ElMessageBox.confirm('是否确认导出当前筛选条件下的合格证数据？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        exportLoading.value = true;
        const params = { ...buildPageParams() };

        if (activeTab.value === 'produce') {
            const data = await CertificateApi.exportCertificate(params);
            download.excel(data, '辖区合格证记录.xls');
        } else {
            const data = await CertificateApi.exportCertificateVerification(params);
            download.excel(data, '辖区合格证查验存证记录.xls');
        }
        ElMessage.success('导出成功');
    } catch (e) {
        if (e !== 'cancel') {
            console.error('导出失败', e);
            ElMessage.error('导出失败');
        }
    } finally {
        exportLoading.value = false;
    }
};

const handleCurrentChange = (val) => {
    pageNum.value = val;
    loadData();
};

const handleEdit = (row: any) => {
    ElMessage.info(`编辑: ${row.certificateCode}`);
};

const handleDetail = (row: any) => {
    if (activeTab.value === 'produce') {
        // 开具合格证详情
        router.push(`/certificate/issue/detail/${row.id}`);
    } else {
        // 收证查验详情
        router.push({
            path: '/certificate/verify/detail',
            query: { id: row.id }
        });
    }
};

const handleDelete = async (row: any) => {
    try {
        await ElMessageBox.confirm(
            `确定要删除合格证编号为 ${row.certificateCode} 的记录吗？`,
            '警告',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        );

        if (activeTab.value === 'produce') {
            await CertificateApi.deleteCertificate(row.id);
        } else {
            await CertificateApi.deleteCertificateVerification(row.id);
        }

        ElMessage.success('删除成功');
        loadData();
    } catch (e) {
        if (e !== 'cancel') {
            console.error('删除失败', e);
            ElMessage.error('删除操作失败');
        }
    }
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
    background: #fff;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: calc(100vh - 86px);
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

    &::-webkit-scrollbar {
        width: 1px !important;
        display: none;
    }
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
    margin: 8px 0 0 0;
}

/* 查询表单行布局 */
.query-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;

    &:last-child {
        margin-bottom: 0;
        align-items: center;
    }

    :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 12px;

        .el-form-item__label {
            font-size: 13px;
            color: #333;
            font-weight: 500;
        }
    }
}

.main-filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 0;
    padding-bottom: 8px;
}

.area-selectors {
    display: flex;
    gap: 4px;

    .area-select {
        width: 80px;
    }
}

.w120 {
    width: 120px !important;
}

.w140 {
    width: 140px !important;
}

.w100 {
    width: 100px !important;
}

.query-btns {
    margin-left: auto;
    display: flex;
    gap: 8px;
    flex-shrink: 0;
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
    width: 240px !important;
}

/* 操作行内标题 */
.action-left {
    .section-indicator {
        width: 4px;
        height: 22px;
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
    line-height: 1.2;
}

.table-ops {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .el-button--link {
        padding: 0;
        font-size: 13px;
    }
}

.pagination-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;

    .total-text {
        font-size: 13px;
        color: #666;
    }
}

.record-tabs {
    display: flex;
    margin: 0px 0 16px 0;
    width: 500px;

    .tab-item {
        flex: 1;
        height: 44px;
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

        &+.tab-item {
            border-left: none;
        }

        &:hover {
            background: rgba(0, 179, 237, 0.05);
        }

        &.active {
            background: #00B3ED;
            color: #FFFFFF;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 179, 237, 0.2);
        }
    }
}
</style>
