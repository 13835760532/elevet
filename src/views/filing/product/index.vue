<template>
    <div class="table-container">
        <!-- 主体建档 标题 -->
        <div class="guide-card">
            <div class="card-header">
             
                <h2 class="card-title">产品建档</h2>
            </div>
        </div>

        <!-- 主体建档查询 -->
        <div class="query-card">
            <div class="card-header">
             
                <h2 class="card-title">产品建档查询</h2>
            </div>
            <div class="query-form-wrapper">
                <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row" label-position="left">
                    <el-form-item label="主体名称">
                        <el-input v-model="queryParams.entityName" placeholder="请输入主体名称" class="custom-input" />
                    </el-form-item>
                    <el-form-item label="备案类型">
                        <el-select v-model="queryParams.filingType" placeholder="请选择" class="custom-select">
                            <el-option label="全部" value="" />
                            <el-option label="企业备案" value="enterprise" />
                            <el-option label="个人备案" value="personal" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="所属地">
                        <el-cascader v-model="queryParams.region" :options="regionOptions" placeholder="请选择"
                            class="custom-cascader" clearable />
                    </el-form-item>
                    <el-form-item label="主体代码">
                        <el-input v-model="queryParams.entityCode" placeholder="请输入企业代码或身份证"
                            class="custom-input w200" />
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
                </div>
                <div class="action-right">
                    <el-button @click="handleExport">导出</el-button>
                    <el-button type="primary" @click="handleBatchFiling" class="primary-btn">批量建档</el-button>
                    <el-button type="primary" @click="handleSingleFiling" class="primary-btn">单条建档</el-button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList" border="false">
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column prop="entityCode" width="170" align="center">
                        <template #header>
                            <div>主体代码</div>
                            <div style="font-size: 12px; color: #999; font-weight: normal;">（企业信用代码/身份证）</div>
                        </template>
                    </el-table-column>
                    <el-table-column label="主体名称" prop="entityName" width="120" show-overflow-tooltip />
                    <el-table-column label="备案类型" prop="filingType" width="100" align="center" />
                    <el-table-column label="主体类型" prop="entityType" width="100" align="center" />
                    <el-table-column label="主营产品" prop="mainProduct" width="100" align="center" />
                    <el-table-column label="所属地区" prop="region" width="140" align="center" show-overflow-tooltip />
                    <el-table-column label="创建时间" prop="createTime" width="110" align="center" />
                    <el-table-column label="创建机构" prop="createOrg" min-width="140" show-overflow-tooltip />
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
                <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize"
                    :total="total" background layout="prev, pager, next" class="custom-pagination" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const queryParams = reactive({
    entityName: '',
    filingType: '',
    region: [],
    entityCode: ''
});

const pageParams = reactive({
    pageNum: 1,
    pageSize: 10
});

const total = ref(28);

// 地区级联选项
const regionOptions = [
    {
        value: 'beijing',
        label: '北京市',
        children: [
            { value: 'chaoyang', label: '朝阳区' },
            { value: 'haidian', label: '海淀区' },
            { value: 'dongcheng', label: '东城区' },
            { value: 'xicheng', label: '西城区' }
        ]
    },
    {
        value: 'tianjin',
        label: '天津市',
        children: [
            { value: 'nankai', label: '南开区' },
            { value: 'hexi', label: '河西区' }
        ]
    }
];

const tableList = ref([
    {
        entityCode: '110201181878878686816',
        entityName: '晓辉农场',
        filingType: '企业备案',
        entityType: '生产',
        mainProduct: '黄瓜、西红柿',
        region: '北京市/北京市/海淀区',
        createTime: '20251219',
        createOrg: '北京市农业农村局'
    },
    {
        entityCode: '21030*******0925',
        entityName: '李慧',
        filingType: '个人备案',
        entityType: '收购',
        mainProduct: '西红柿',
        region: '北京市',
        createTime: '20251219',
        createOrg: '北京市农业农村局'
    },
    {
        entityCode: '110201181878878686816',
        entityName: '晓辉农场',
        filingType: '企业备案',
        entityType: '储存',
        mainProduct: '草莓',
        region: '北京市',
        createTime: '20251219',
        createOrg: '北京市农业农村局'
    },
    {
        entityCode: '',
        entityName: '',
        filingType: '',
        entityType: '运输',
        mainProduct: '',
        region: '',
        createTime: '',
        createOrg: ''
    },
    {
        entityCode: '',
        entityName: '',
        filingType: '',
        entityType: '加工',
        mainProduct: '',
        region: '',
        createTime: '',
        createOrg: ''
    }
]);



const handleQuery = () => {
    console.log('Query:', queryParams);
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

const handleFilingLog = () => {
    console.log('Filing Log');
};

const handleExport = () => {
    console.log('Export');
};

const handleBatchFiling = () => {
    router.push('/filing/productBatch');
};

const handleSingleFiling = () => {
    router.push('/filing/productCreate');
};

const handleEdit = (row) => {
    console.log('Edit:', row);
    router.push('/filing/productCreate');
};

const handleDelete = (row) => {
    console.log('Delete:', row);
};

const handleView = (row) => {
    console.log('View:', row);
    router.push('/filing/productDetail');
};
</script>

<style lang="scss" scoped></style>
