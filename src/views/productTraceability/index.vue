<template>
    <div class="app-container traceability-container">
        <div class="search-box">
            <div class="title">农产品溯源查询</div>
            <div class="input-group">
                <el-input v-model="searchCode" placeholder="输入合格证编号，查询产品生命周期的合格证追溯信息" @keyup.enter="handleSearch">
                    <template #suffix>
                        <el-icon class="search-icon" @click="handleSearch">
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
                <button class="search-btn" @click="handleSearch">
                    扫码查询/查询
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

defineOptions({
    name: 'ProductTraceability'
});

const router = useRouter();
const searchCode = ref('');

const handleSearch = () => {
    if (!searchCode.value.trim()) {
        ElMessage.warning('请输入合格证编号');
        return;
    }
    router.push({
        path: '/productTraceability/traceabilityResult',
        query: { code: searchCode.value.trim() }
    });
};
</script>

<style scoped lang="scss">
.traceability-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: calc(100vh - 120px);
    padding: 24px;
}

.search-box {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
    padding: 100px 80px;
    width: 100%;
    max-width: 900px;
    text-align: center;
}

.title {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin-bottom: 60px;
    letter-spacing: 1px;
}

.input-group {
    display: flex;
    align-items: center;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;
    transition: all 0.3s;
    max-width: 800px;
    margin: 0 auto;

    &:focus-within {
        border-color: var(--el-color-primary, #1a5cff);
    }

    :deep(.el-input) {
        flex: 1;

        .el-input__wrapper {
            box-shadow: none !important;
            background: transparent;
            padding-left: 20px;
            padding-right: 15px;
        }

        .el-input__inner {
            height: 54px;
            font-size: 14px;
            color: #333;

            &::placeholder {
                color: #909399;
            }
        }
    }

    .search-icon {
        font-size: 20px;
        color: #606266;
        margin-right: 8px;
        cursor: pointer;
        transition: color 0.3s;

        &:hover {
            color: var(--el-color-primary, #1a5cff);
        }
    }

    .search-btn {
        height: 56px; // Slightly taller to cover borders seamlessly
        border-radius: 0;
        padding: 0 40px;
        font-size: 14px;
        border: none;
        background-color: #1a5cff; // The vibrant blue from the screenshot
        color: #fff;
        cursor: pointer;
        transition: background-color 0.3s, opacity 0.3s;
        outline: none;
        white-space: nowrap;

        &:hover {
            opacity: 0.9;
        }

        &:active {
            opacity: 0.8;
        }
    }
}
</style>
