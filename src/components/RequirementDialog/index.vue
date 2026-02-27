<template>
    <el-dialog v-model="visible" title="设置检测要求" width="900px" :before-close="handleClose" class="requirement-dialog">
        <div class="dialog-content">
            <el-table :data="requirementList" class="requirement-table">
                <el-table-column width="60" align="center">
                    <template #header>
                        <el-checkbox v-model="selectAll" @change="handleSelectAll" />
                    </template>
                    <template #default="scope">
                        <el-checkbox v-model="scope.row.selected" />
                    </template>
                </el-table-column>
                <el-table-column label="序号" type="index" width="80" align="center" />
                <el-table-column label="农产品" prop="product" width="120" align="center" />
                <el-table-column label="检测项" prop="testItem" min-width="150" align="center" />
                <el-table-column label="操作" width="120" align="center">
                    <template #default="scope">
                        <div class="action-buttons" v-if="scope.$index === requirementList.length - 1">
                            <el-button type="danger" circle size="small" @click="handleRemove(scope.$index)"
                                v-if="requirementList.length > 1">
                                <el-icon>
                                    <Close />
                                </el-icon>
                            </el-button>
                            <el-button type="primary" circle size="small" @click="handleAdd">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleSetAsTestProduct" class="btn-secondary">设为检测品种及项目</el-button>
                <el-button type="primary" @click="handleConfirm" class="btn-primary">了解并关闭</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Plus, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    taskData: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const selectAll = ref(false);

const requirementList = ref([
    { selected: true, product: '高昌', testItem: '甲霜灵' },
    { selected: true, product: '大葱', testItem: '克百威' },
    { selected: false, product: '其他', testItem: '其他' }
]);

watch(() => props.modelValue, (val) => {
    if (val) {
        // 弹窗打开时重置数据
        updateSelectAll();
    }
});

const updateSelectAll = () => {
    selectAll.value = requirementList.value.every(item => item.selected);
};

const handleSelectAll = (val) => {
    requirementList.value.forEach(item => {
        item.selected = val;
    });
};

const handleAdd = () => {
    requirementList.value.push({
        selected: false,
        product: '',
        testItem: ''
    });
    updateSelectAll();
};

const handleRemove = (index) => {
    requirementList.value.splice(index, 1);
    updateSelectAll();
};

const handleSetAsTestProduct = () => {
    const selectedItems = requirementList.value.filter(item => item.selected);
    if (selectedItems.length === 0) {
        ElMessage.warning('请至少选择一项');
        return;
    }
    ElMessage.success('已设为检测品种及项目');
    emit('confirm', selectedItems);
    visible.value = false;
};

const handleConfirm = () => {
    visible.value = false;
};

const handleClose = () => {
    visible.value = false;
};
</script>

<style lang="scss" scoped>
.requirement-dialog {
    :deep(.el-dialog__header) {
        padding: 16px 24px 16px;
        border-bottom: 1px solid #f0f0f0;

        .el-dialog__title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
    }

    :deep(.el-dialog__body) {
        padding: 16px;
    }

    :deep(.el-dialog__footer) {
        padding: 16px 24px;
        border-top: 1px dashed #D1D5DB;
    }
}

.dialog-content {
    .requirement-table {
        // border: 2px solid #00B3ED;

        :deep(.el-table__header) {
            th {
                background: #F9FAFB;
                color: #333;
                font-weight: 500;
                border: none;
            }
        }

        :deep(.el-table__body) {
            td {
                padding: 12px 0;
                border: none;
            }
        }

        :deep(.el-table__row) {
            border-bottom: 1px solid #f0f0f0;

            &:last-child {
                border-bottom: none;
            }
        }
    }

    .action-buttons {
        display: flex;
        justify-content: center;
        gap: 8px;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;

    .el-button {
        min-width: 140px;
        height: 40px;
        border-radius: 8px;
    }

    .btn-secondary {
        background: #fff;
        border-color: #D1D5DB;
        color: #333;

        &:hover {
            border-color: #00B3ED;
            color: #00B3ED;
        }
    }

    .btn-primary {
        background: #00B3ED;
        border-color: #00B3ED;
        color: #fff;

        &:hover {
            background: #0095c8;
            border-color: #0095c8;
        }
    }
}
</style>
