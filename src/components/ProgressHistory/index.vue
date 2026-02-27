<template>
    <div class="history-tree">
        <!-- 根节点 -->
        <div class="tree-root">
            <div class="root-node">
                <span class="node-dot root-dot"></span>
                <span class="node-text">{{ treeData.name }}</span>
            </div>
            <!-- 一级子节点 -->
            <div class="tree-level level-1">
                <div v-for="(level1, idx1) in treeData.children" :key="idx1" class="tree-branch">
                    <div class="branch-line"></div>
                    <div class="branch-content">
                        <div class="node-item level1-node">
                            <span class="node-dot"></span>
                            <span class="node-text">{{ level1.name }}</span>
                            <span v-if="level1.progress" class="node-progress">{{ level1.progress }}</span>
                        </div>
                        <!-- 二级子节点 -->
                        <div v-if="level1.children && level1.children.length" class="tree-level level-2">
                            <div v-for="(level2, idx2) in level1.children" :key="idx2" class="tree-branch">
                                <div class="branch-line"></div>
                                <div class="branch-content">
                                    <div class="node-item level2-node">
                                        <span class="node-dot"></span>
                                        <span class="node-text">{{ level2.name }}</span>
                                        <span v-if="level2.progress" class="node-progress"
                                            :class="{ 'warning': level2.warning }">{{ level2.progress }}</span>
                                    </div>
                                    <!-- 三级子节点 -->
                                    <div v-if="level2.children && level2.children.length" class="tree-level level-3">
                                        <div v-for="(level3, idx3) in level2.children" :key="idx3" class="tree-branch">
                                            <div class="branch-line"></div>
                                            <div class="branch-content">
                                                <div class="node-item level3-node">
                                                    <span class="node-dot"></span>
                                                    <span class="node-text">{{ level3.name }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    // 树形数据
    treeData: {
        type: Object,
        default: () => ({
            name: '农产品例行检测',
            children: []
        })
    }
});
</script>

<style lang="scss" scoped>
/* 进度历史树形结构 */
.history-tree {
    padding: 20px;
    overflow-x: auto;
}

.tree-root {
    display: flex;
    align-items: flex-start;
}

.root-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 30px;
    white-space: nowrap;
    margin-top: 20px;

    .node-text {
        font-size: 14px;
        color: #333;
        font-weight: 500;
    }
}

.node-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #00B3ED;
    background: #fff;
    flex-shrink: 0;
    position: relative;
    z-index: 2;

    &.root-dot {
        width: 10px;
        height: 10px;
        border-color: #004CEE;
    }
}

.tree-level {
    display: flex;
    flex-direction: column;
    position: relative;
}

.tree-branch {
    display: flex;
    align-items: flex-start;
    position: relative;
    padding: 12px 0;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: -26px;
        width: 1px;
        background: #e1e1e1;
    }

    &:first-child::before {
        top: 26px;
    }

    &:last-child::before {
        bottom: auto;
        height: 21px;
    }

    &:only-child::before {
        display: none;
    }
}

.branch-line {
    width: 30px;
    height: 1px;
    background: #e1e1e1;
    margin-top: 13px;
    flex-shrink: 0;
}

.branch-content {
    display: flex;
    align-items: flex-start;
}

.node-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 20px;
    white-space: nowrap;
    position: relative;
    margin-top: 4px;

    .node-text {
        font-size: 14px;
        color: #333;
    }

    .node-progress {
        font-size: 12px;
        color: #F5A623;
        margin-left: 4px;

        &.warning {
            color: #F5222D;
        }
    }
}

.level1-node .node-dot {
    border-color: #00B3ED;
}

.level2-node .node-dot {
    border-color: #F5A623;
}

.level3-node .node-dot {
    border-color: #52C41A;
}

.level-2,
.level-3 {
    margin-left: 20px;
    margin-top: -12px;
}
</style>
