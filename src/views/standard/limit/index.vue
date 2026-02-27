<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">国标限量</h1>
            </div>
            <div class="desc-box">
                根据产品名称查询对应的国标限量数据（GB2763-2021）
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-container">
            <el-input v-model="searchQuery" placeholder="搜索农药化学名称、食物名称、用途查询国标限量信息" class="main-search-input" />
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
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

/* 顶部标题区 - 沿用 taskManagement.vue 风格 */
.header-section {
    height: auco;
    padding: 16px;
    margin-bottom: 20px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
}

.title-line {
    width: 4px;
    height: 16px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    line-height: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.desc-box {
    font-size: 16px;
    color: #333333;
    line-height: 21px;
    padding-left: 16px;
}

/* 搜索区域 */
.search-container {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding: 0 2px;
}

.main-search-input {
    flex: 1;

    :deep(.el-input__wrapper) {
        background: #FFFFFF;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        box-shadow: none !important;
        padding: 0 16px;
        height: 56px;
        font-size: 16px;

        &:hover {
            border-color: #00B3ED;
        }

        &.is-focus {
            border-color: #00B3ED;
            box-shadow: 0 0 0 3px rgba(0, 179, 237, 0.1) !important;
        }
    }
}

.search-btn {
    width: auto;
    background: #00B3ED;
    border-color: #00B3ED;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;

    &:hover {
        background: #0099D1;
        border-color: #0099D1;
    }
}

/* 数据网格区域 */
.data-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
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
            font-weight: 500;
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
