<template>
    <div class="page-container" v-loading="loading">
        <!-- 统一头部区域 -->
        <div class="header-section">
            <div class="header-top">
                <h2 class="page-title">农产品指标推荐</h2>
                <p class="page-desc">根据农产品名称、分类快速查询并推荐对应的检测指标</p>
            </div>

            <div class="search-bar">
                <el-form :inline="true" @submit.prevent>
                    <el-form-item class="!mb-0" style="margin-right: 0;">
                        <el-input :prefix-icon="Search" v-model="queryParams.keyword" placeholder="搜索农产品名称或关键词查询指标"
                            class="custom-search-input" clearable @keyup.enter="handleSearch" />
                    </el-form-item>
                    <el-button type="primary" class="search-btn" @click="handleSearch">
                        <Icon icon="ep:search" class="mr-5px" /> 搜索
                    </el-button>
                </el-form>
            </div>
        </div>

        <!-- 数据网格区域 -->
        <div class="grid-container">
            <div v-if="list.length > 0" class="data-grid">
                <div v-for="(item, index) in list" :key="index" class="data-card">
                    <div class="card-info">
                        <div class="info-row">
                            <span class="label">农产品名称：</span>
                            <span class="value name-highlight">{{ item.produceName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">产品分类：</span>
                            <span class="value">{{ item.fullCategory || '--' }}</span>
                        </div>
                    </div>

                    <div class="card-table">
                        <el-table :data="item.targetRanges" style="width: 100%" border size="small">
                            <el-table-column prop="targetCategory" label="指标分类" align="center" width="130"
                                show-overflow-tooltip />
                            <el-table-column prop="targetName" label="目标物名称" align="center" min-width="120" />
                            <el-table-column label="禁限类型" align="center" width="100">
                                <template #default="scope">
                                    <el-tag :type="getRestrictionTag(scope.row.restrictionType)" size="small">
                                        {{ getRestrictionLabel(scope.row.restrictionType) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>

            <!-- 无数据状态 -->
            <el-empty v-else-if="!loading" description="暂无相关推荐指标信息" />
        </div>

        <!-- 底部固定分页栏 -->
        <div class="footer-pagination" v-if="total > 0">
            <el-pagination v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize"
                :total="total" background layout="total, prev, pager, next" @current-change="handleCurrentChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as ProduceTargetLimitApi from '@/api/agri/produceTargetLimit'

defineOptions({ name: 'StandardRecommend' })

const loading = ref(false)
const list = ref<ProduceTargetLimitApi.ProduceTargetLimitProduceGroupRespVO[]>([])
const total = ref(0)

const queryParams = reactive({
    pageNo: 1,
    pageSize: 10,
    keyword: ''
})

/** 获取禁限类型标签色 */
const getRestrictionTag = (type: string) => {
    switch (type) {
        case '1': return 'danger' // 禁用
        case '2': return 'warning' // 限用
        case '3': return 'success' // 常规
        default: return 'info'
    }
}

/** 获取禁限类型文字 */
const getRestrictionLabel = (type: string) => {
    switch (type) {
        case '1': return '禁用'
        case '2': return '限用'
        case '3': return '常规'
        default: return '未知'
    }
}

/** 获取数据列表 */
const getList = async () => {
    loading.value = true
    try {
        const data = await ProduceTargetLimitApi.recommendTargetsByProduct(queryParams)
        list.value = data.list
        total.value = data.total
    } catch (error) {
        console.error('Fetch recommend targets failed:', error)
    } finally {
        loading.value = false
    }
}

/** 搜索操作 */
const handleSearch = () => {
    queryParams.pageNo = 1
    getList()
}

/** 页码切换 */
const handleCurrentChange = (val: number) => {
    queryParams.pageNo = val
    getList()
}

onMounted(() => {
    getList()
})
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    overflow: hidden;
}

/* 头部样式 */
.header-section {
    background: #fff;
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;

    .header-top {
        margin-bottom: 16px;

        .page-title {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            margin: 0 0 4px 0;
        }

        .page-desc {
            font-size: 13px;
            color: #909399;
            margin: 0;
        }
    }

    .search-bar {
        .custom-search-input {
            width: 520px;

            :deep(.el-input__wrapper) {
                background-color: #f4f6f8;
                box-shadow: none;
                border: 1px solid transparent;
                transition: all 0.3s;

                &:hover,
                &.is-focus {
                    border-color: #00B3ED;
                    background-color: #fff;
                }
            }
        }

        .search-btn {
            background-color: #00B3ED;
            border-color: #00B3ED;
            padding: 0 24px;
            height: 32px;
            margin-left: 12px;
        }
    }
}

/* 内容区域 */
.grid-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
}

.data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding-bottom: 20px;
}

.data-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
}

.card-info {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .info-row {
        display: flex;
        font-size: 14px;
        align-items: center;

        .label {
            color: #606266;
            width: 90px;
            text-align: right;
            flex-shrink: 0;
        }

        .value {
            color: #303133;

            &.name-highlight {
                color: #00B3ED;
                font-weight: 600;
            }
        }
    }
}

/* 底部工具栏 */
.footer-pagination {
    background: #fff;
    padding: 12px 24px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
}

:deep(.el-table) {
    --el-table-header-bg-color: #f8fafc;
    border-radius: 4px;

    th.el-table__cell {
        font-weight: 600;
        color: #606266;
    }
}

/* 响应式适配 */
@media (max-width: 1100px) {
    .data-grid {
        grid-template-columns: 1fr;
    }
}
</style>
