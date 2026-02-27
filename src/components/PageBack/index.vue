<template>
    <div class="page-back-nav">
        <div class="back-btn" @click="handleBack">
            <el-icon class="back-icon">
                <ArrowLeft />
            </el-icon>
            <span class="back-text">{{ text }}</span>
        </div>
        <slot></slot>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

const props = defineProps({
    // 返回按钮文字
    text: {
        type: String,
        default: '返回'
    },
    // 自定义返回路径，不传则默认返回上一页
    to: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['back']);
const router = useRouter();

const handleBack = () => {
    emit('back');
    if (props.to) {
        router.push(props.to);
    } else {
        router.back();
    }
};
</script>

<style lang="scss" scoped>
.page-back-nav {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 4px 0;
    background: #fff;
    border-radius: 10px;

    .back-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: all 0.3s;
        color: #333;
        margin-right: 12px;

        &:hover {
            color: #00B3ED;
        }

        .back-icon {
            font-size: 16px;
        }

        .back-text {
            font-size: 14px;
            font-weight: 500;
        }
    }
}
</style>
