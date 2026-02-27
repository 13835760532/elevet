<template>
    <div class="page-container">
        <!-- 顶部标题区 - 沿用 taskManagement.vue 风格 -->
        <div class="header-section">
            <div class="title-wrapper">
                <h1 class="page-title">农产品指标推荐</h1>
            </div>
            <div class="desc-box">
                根据产品名称或分类推荐不同的检测指标
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-container">
            <el-input v-model="searchQuery" placeholder="搜索农产品名称或关键词查询产品对应的指标" class="main-search-input" />
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </div>

        <!-- 数据网格区域 - 3列展示 -->
        <div class="data-grid">
            <div v-for="(item, index) in recommendData" :key="index" class="data-card">
                <div class="card-header">
                    <div class="info-row">
                        <span class="label">产品名称：</span>
                        <span class="value">{{ item.productName }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">产品分类：</span>
                        <span class="value">{{ item.categoryPath }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">检测指标：</span>
                        <span class="value"></span>
                    </div>
                </div>

                <div class="card-content">
                    <!-- 常规残留部分 -->
                    <div class="section-container">
                        <div class="tag-label gray">常规残留</div>
                        <el-table :data="item.normalIndexes" style="width: 100%" border>
                            <el-table-column prop="id" label="序号" width="60" align="center" />
                            <el-table-column prop="type" label="指标类型" align="center" />
                            <el-table-column prop="category" label="检测类别" align="center" />
                            <el-table-column prop="subType" label="检测项类别" align="center" />
                            <el-table-column prop="name" label="指标" align="center" />
                        </el-table>
                    </div>

                    <!-- 禁用农药部分 -->
                    <div class="section-container">
                        <div class="tag-label blue">禁用农药</div>
                        <el-table :data="item.forbiddenIndexes" style="width: 100%" border>
                            <el-table-column prop="id" label="序号" width="60" align="center" />
                            <el-table-column prop="type" label="指标类型" align="center" />
                            <el-table-column prop="category" label="检测类别" align="center" />
                            <el-table-column prop="subType" label="检测项类别" align="center" />
                            <el-table-column prop="name" label="指标" align="center" />
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const searchQuery = ref('');

const mockTableData = [
    { id: 1, type: '常规残留', category: '农药残留', subType: '有机磷类', name: '敌敌畏' },
    { id: 2, type: '常规残留', category: '农药残留', subType: '有机磷类', name: '敌敌畏' }
];

const recommendData = ref([
    {
        productName: '大白菜',
        categoryPath: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        normalIndexes: [...mockTableData],
        forbiddenIndexes: [...mockTableData]
    },
    {
        productName: '大白菜',
        categoryPath: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        normalIndexes: [...mockTableData],
        forbiddenIndexes: [...mockTableData]
    },
    {
        productName: '大白菜',
        categoryPath: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        normalIndexes: [...mockTableData],
        forbiddenIndexes: [...mockTableData]
    },
    {
        productName: '大白菜',
        categoryPath: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        normalIndexes: [...mockTableData],
        forbiddenIndexes: [...mockTableData]
    },
    {
        productName: '大白菜',
        categoryPath: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        normalIndexes: [...mockTableData],
        forbiddenIndexes: [...mockTableData]
    },
    {
        productName: '大白菜',
        categoryPath: '蔬菜 > 瓜类蔬菜 > 黄瓜',
        normalIndexes: [...mockTableData],
        forbiddenIndexes: [...mockTableData]
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

/* 数据网格区域 - 3列 */
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

        .label {}

        .value {
            font-weight: 600;
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
        // width: 100px;
        // height: 36px;
        // border-radius: 4px;
        font-size: 14px;
        font-weight: 500;

        // &.gray {
        //     background: #D1D5DB;
        //     color: #333;
        // }

        // &.blue {
        //     background: #8DB5F3;
        //     color: #FFFFFF;
        // }
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
