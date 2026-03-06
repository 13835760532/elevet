<template>
    <div class="header-section">
    
        <div class="header-main-part">
            <!-- <div class="brand-tag"></div> -->
            <div class="header-info">
                <h1 class="page-title">{{ title }}</h1>
                <p class="page-desc" v-if="desc">{{ desc }}</p>
                <slot name="desc" v-else></slot>
            </div>
            <div class="header-right-part" v-if="$slots.right">
                <slot name="right"></slot>
            </div>
        </div>
        <div class="header-left-part" @click="handleCancel">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false,
        default: ''
    }
})

const handleCancel = () => {
    router.back()
}
</script>

<style lang="scss" scoped>
/* 顶部标题区 - 扁平高级版 */
.header-section {
    padding-left: 16px;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    background: #fff;
    height: 88px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    z-index: 10;
}

.header-left-part {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 94px;
    cursor: pointer;
    color: #1E293B;
    font-size: 16px;
    font-weight: 500;
    // border-right: 1px solid #F1F5F9;
    transition: all 0.2s;

    &:hover {
        color: #00B3ED;
    }

    .el-icon {
        font-size: 18px;
    }
}

.header-main-part {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;

    .brand-tag {
        width: 4px;
        height: 48px;
        background: #00B3ED;
        border-radius: 2px;
        margin-right: 16px;
    }
}

.header-info {
    flex: 1;

    .page-title {
        font-size: 20px;
        font-weight: 700;
        color: #1E293B;
        margin: 0 0 6px 0;
        line-height: 1.2;
    }

    .page-desc {
        font-size: 14px;
        color: #64748B;
        margin: 0;
        line-height: 1.4;
    }
}
</style>
