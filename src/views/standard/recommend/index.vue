<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="guide-card" style="margin-bottom: 12px;">
            <div class="card-header">
                <h2 class="card-title">农产品指标推荐</h2>
            </div>
            <div class="header-desc" style="color: #666; font-size: 14px;">
                根据产品名称、分类或目标物名称推荐不同的检测指标
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="query-card">
            <div class="query-form-wrapper">
                <el-form :inline="true" class="custom-query-form custom-query-form-row" @submit.prevent>
                    <el-form-item label="" style="margin-bottom: 0!important;">
                        <el-input :prefix-icon="Search" v-model="searchQuery" placeholder="搜索农产品名称、关键词或目标物以查询标准限值"
                            class="custom-input" style="width: 480px" clearable @keyup.enter="handleSearch" @clear="handleSearch" />
                    </el-form-item>
                    <div class="query-btns" style="margin-bottom: 0!important;">
                        <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
                    </div>
                </el-form>
            </div>
        </div>

        <!-- 数据无结果提示 -->
        <el-empty v-if="!loading && recommendData.length === 0" description="暂无相关标准限量指标" style="margin-top: 60px;" />

        <!-- 数据网格区域 -->
        <div class="data-grid" v-loading="loading">
            <div v-for="(item, index) in recommendData" :key="index" class="data-card">
                <div class="card-header">
                    <div class="info-row">
                        <span class="label">目标物名称：</span>
                        <span class="value" style="font-weight: 600; font-size: 16px; color: var(--el-color-primary)">{{ item.targetName }}</span>
                    </div>
                </div>

                <div class="card-content">
                    <div class="section-container">
                        <div class="tag-label blue">产品范围限值：</div>
                        <el-table :data="item.produceRanges" style="width: 100%" border max-height="300">
                            <el-table-column type="index" label="序号" width="60" align="center" />
                            <el-table-column prop="foodCategory" label="食品类别" align="center" show-overflow-tooltip />
                            <el-table-column prop="foodName" label="食品名称" align="center" show-overflow-tooltip />
                            <el-table-column prop="maxResidueLimit" label="最大残留限量 (MRL)" align="center" width="160" />
                            <el-table-column prop="unit" label="单位" align="center" width="100" />
                        </el-table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <Pagination
            v-if="total > 0"
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
            style="margin-top: 20px; justify-content: flex-end;"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { searchProduceTargetLimitByKeyword, ProduceTargetLimitGroupRespVO } from '@/api/agri/produceTargetLimit';

const searchQuery = ref('');
const recommendData = ref<ProduceTargetLimitGroupRespVO[]>([]);
const total = ref(0);
const loading = ref(false);

const queryParams = ref({
    pageNo: 1,
    pageSize: 10,
});

const getList = async () => {
    loading.value = true;
    try {
        const res = await searchProduceTargetLimitByKeyword({
            ...queryParams.value,
            keyword: searchQuery.value
        });
        recommendData.value = res.list || [];
        total.value = res.total || 0;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const handleSearch = () => {
    queryParams.value.pageNo = 1;
    getList();
};

onMounted(() => {
    getList();
});
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
    padding-bottom: 20px;
}

/* 搜索区域的边距调整 */
.query-card {
    margin-bottom: 16px;
}

/* 数据网格区域 - 2列 */
.data-grid {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.data-card {
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    row-gap: 10px;
    margin-bottom: 0;

    .info-row {
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 18px;
        color: #333;

        .value {
            margin-left: 4px;
        }
    }
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .section-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .tag-label {
        display: inline-flex;
        align-items: flex-start;
        justify-content: flex-start;
        font-size: 14px;
        font-weight: 500;
        color: #333;
        
        &.blue {
            color: var(--el-color-primary);
        }
    }
}

/* 响应式调整 */
@media (max-width: 1600px) {
    .data-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 1000px) {
    .data-grid {
        grid-template-columns: 1fr;
    }
}
</style>
