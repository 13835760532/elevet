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
                <el-form :model="queryParams" :inline="true" class="custom-query-form" label-position="left">
                    <el-form-item label="合格证编号">
                        <el-input v-model="queryParams.certNo" placeholder="请输入" clearable class="custom-input" />
                    </el-form-item>
                    <el-form-item label="产品名称">
                        <el-input v-model="queryParams.productName" placeholder="请输入" clearable class="custom-input" />
                    </el-form-item>
                    <el-form-item label="生产经营企业/个人">
                        <el-input v-model="queryParams.entity" placeholder="请输入" clearable class="custom-input w200" />
                    </el-form-item>
                    <el-form-item label="出证类型">
                        <el-select v-model="queryParams.issueType" placeholder="请选择" clearable class="custom-select">
                            <el-option label="生产者" value="producer" />
                            <el-option label="收购者" value="buyer" />
                            <el-option label="销售者" value="seller" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品产地">
                        <el-select v-model="queryParams.province" placeholder="省" clearable class="custom-select">
                            <el-option label="山东省" value="shandong" />
                        </el-select>
                        <el-select v-model="queryParams.city" placeholder="市" clearable class="custom-select">
                            <el-option label="青岛市" value="qingdao" />
                        </el-select>
                        <el-select v-model="queryParams.county" placeholder="县" clearable class="custom-select">
                            <el-option label="胶州市" value="jiaozhou" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="联系电话">
                        <el-input v-model="queryParams.phone" placeholder="请输入联系电话" clearable class="custom-input" />
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
                    <el-button @click="handleExport">导出</el-button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="table-wrapper">
                <el-table :data="tableList">
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
                    :total="total" layout="prev, pager, next" background class="custom-pagination" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Edit } from '@element-plus/icons-vue';

const router = useRouter();

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

const total = ref(60);

const tableList = ref([
    {
        certNo: 'HGZ2025121290',
        issueType: '生产者',
        productName: '白菜',
        productCategory: '蔬菜',
        origin: '山东省胶州市',
        entity: '山东胶州XXX合作社',
        issueDate: '2025-12-12 15:00',
        contact: '秦艳萍',
        phone: '19812319980'
    },
    {
        certNo: 'HGZ2025121290',
        issueType: '收购者',
        productName: '黄瓜',
        productCategory: '蔬菜',
        origin: '山东省胶州市',
        entity: '北京福莱生态科技有限公司',
        issueDate: '2025-12-12 15:00',
        contact: '秦艳萍',
        phone: '19812319980'
    },
    {
        certNo: 'HGZ2025121290',
        issueType: '收购者',
        productName: '黄瓜',
        productCategory: '蔬菜',
        origin: '山东省胶州市',
        entity: '北京福莱生态科技有限公司',
        issueDate: '2025-12-12 15:00',
        contact: '秦艳萍',
        phone: '19812319980'
    }
]);



const handleQuery = () => { console.log('Query:', queryParams); };
const handleReset = () => { Object.keys(queryParams).forEach(key => (queryParams[key] = '')); };
const handleExport = () => { console.log('Export'); };
const handleAdd = () => { router.push('/certificate/issue/create'); };
const handleEdit = (row) => { console.log('Edit', row); };
const handleView = (row) => { router.push(`/certificate/issue/detail/${row.certNo}`); };
const handleDelete = (row) => { console.log('Delete', row); };
</script>

<style lang="scss" scoped>
/* 页面特有样式（公共样式已在 App.vue 全局引入） */
</style>
