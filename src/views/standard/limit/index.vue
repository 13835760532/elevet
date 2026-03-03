<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="guide-card" style="margin-bottom: 12px;">
            <div class="card-header">
                <h2 class="card-title">国标限量</h2>
            </div>
            <div class="header-desc" style="color: #666; font-size: 14px;">
                根据产品名称查询对应的国标限量数据（GB2763-2021）
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="query-card">
            <div class="query-form-wrapper">
                <el-form :inline="true" class="custom-query-form custom-query-form-row">
                    <el-form-item label="" style="margin-bottom: 0!important;">
                        <el-input :prefix-icon="Search" v-model="searchQuery" placeholder="搜索农药化学名称、食物名称、用途查询国标限量信息"
                            class="custom-input" style="width: 480px" clearable @keyup.enter="handleSearch" />
                    </el-form-item>
                    <div class="query-btns" style="margin-bottom: 0!important;">
                        <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
                    </div>
                </el-form>
            </div>
        </div>

        <!-- 数据网格区域 -->
        <div class="data-grid">
            <div v-for="(item, index) in limitData" :key="index" class="data-card">
                <div class="card-header">
                    <div class="info-row">
                        <span class="label">农药名称：</span>
                        <span class="value">{{ item.pesticideName }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">用途：</span>
                        <span class="value">{{ item.usage }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">产品范围：</span>
                        <span class="value">{{ item.usage }}</span>
                    </div>
                </div>

                <div class="card-content">
                    <el-table :data="item.products" style="width: 100%" border>
                        <el-table-column prop="category1" label="食物类别一" align="center" />
                        <el-table-column prop="category2" label="食物类别二" align="center" />
                        <el-table-column prop="foodName" label="食物名称" align="center" />
                        <el-table-column prop="mrl" label="最大残留限量 MRL (mg/kg)" align="center" width="160" />
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';

const searchQuery = ref('');

const limitData = ref([
    {
        pesticideName: '2.4-滴丁酸',
        usage: '除草剂',
        products: [
            { category1: '调味料', category2: '叶类调味料', foodName: '薄荷', mrl: '0.2' },
            { category1: '调味料', category2: '调味料', foodName: '留兰香', mrl: '0.2' },
            { category1: '调味料', category2: '种子调味料', foodName: '胡椒', mrl: '0.2' }
        ]
    },
    {
        pesticideName: '2.4-滴丁酸',
        usage: '除草剂',
        products: [
            { category1: '调味料', category2: '叶类调味料', foodName: '薄荷', mrl: '0.2' },
            { category1: '调味料', category2: '调味料', foodName: '留兰香', mrl: '0.2' },
            { category1: '调味料', category2: '种子调味料', foodName: '胡椒', mrl: '0.2' }
        ]
    },
    {
        pesticideName: '2.4-滴丁酸',
        usage: '除草剂',
        products: [
            { category1: '调味料', category2: '叶类调味料', foodName: '薄荷', mrl: '0.2' },
            { category1: '调味料', category2: '调味料', foodName: '留兰香', mrl: '0.2' },
            { category1: '调味料', category2: '种子调味料', foodName: '胡椒', mrl: '0.2' }
        ]
    },
    {
        pesticideName: '2.4-滴丁酸',
        usage: '除草剂',
        products: [
            { category1: '调味料', category2: '叶类调味料', foodName: '薄荷', mrl: '0.2' },
            { category1: '调味料', category2: '调味料', foodName: '留兰香', mrl: '0.2' },
            { category1: '调味料', category2: '种子调味料', foodName: '胡椒', mrl: '0.2' }
        ]
    }
]);

const handleSearch = () => {
    console.log('Searching for:', searchQuery.value);
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
}

/* 数据网格区域 */
.data-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.data-card {
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 10px;
    margin-bottom: 0;

    .info-row {
        display: flex;
        align-items: center;
        font-size: 14px;
        line-height: 18px;
        color: #333;

        .label {
            width: 80px;
            text-align: right;
        }

        .value {
            margin-left: 4px;
        }
    }

    .product-range-label {
        font-size: 20px;
        font-weight: 400;
        margin-top: 12px;
        color: #333;
    }
}

/* 响应式调整 */
@media (max-width: 1200px) {
    .data-grid {
        grid-template-columns: 1fr;
    }
}
</style>
