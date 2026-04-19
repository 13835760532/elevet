<template>
    <el-dialog v-model="visible" :title="title" width="650px" :before-close="handleClose" class="task-add-dialog">
        <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px" class="task-form">
            <el-form-item label="承担单位" prop="dept">
                <el-input v-model="formData.dept" placeholder="请输入承担单位名称" class="custom-input" />
            </el-form-item>
            <el-form-item label="检测地区" prop="region">
                <AreaCascader v-model="areaPath" class="full-width custom-cascader" placeholder="请选择检测地区"
                    @select="handleAreaSelect" />
            </el-form-item>
            <el-form-item label="检测数量" prop="quantity">
                <el-input-number v-model="formData.quantity" :min="0" class="full-width custom-number"
                    controls-position="right" />
            </el-form-item>
            <el-form-item label="执行时间" prop="timeRange">
                <el-date-picker v-model="formData.timeRange" type="daterange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
                    class="full-width custom-date-picker" />
            </el-form-item>
            <el-form-item label="检测品种" prop="varieties">
                <el-input v-model="formData.varieties" type="textarea" :rows="2" placeholder="示例：芹菜、黄瓜、正菜..." />
            </el-form-item>
            <el-form-item label="检测项目" prop="items">
                <el-input v-model="formData.items" type="textarea" :rows="2" placeholder="示例：甲拌磷、甲基..." />
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" @click="handleConfirm">确定并保存</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import AreaCascader from '@/components/AreaCascader/index.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '新增任务'
    },
    initialData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const formRef = ref(null);
const areaPath = ref([]);

const formData = reactive({
    dept: '',
    region: '',
    quantity: 0,
    timeRange: [],
    varieties: '',
    items: ''
});

const rules = {
    dept: [{ required: true, message: '请输入承担单位', trigger: 'blur' }],
    region: [{ required: true, message: '请选择检测地区', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入检测数量', trigger: 'blur' }],
    timeRange: [{ required: true, message: '请选择执行时间', trigger: 'change' }]
};

const handleAreaSelect = (val) => {
    formData.region = `${val.province || ''}${val.city || ''}${val.district || ''}`;
};

const handleClose = () => {
    visible.value = false;
};

const resetForm = () => {
    formData.dept = '';
    formData.region = '';
    formData.quantity = 0;
    formData.timeRange = [];
    formData.varieties = '';
    formData.items = '';
    areaPath.value = [];
    if (formRef.value) {
        formRef.value.clearValidate();
    }
};

const handleConfirm = async () => {
    if (!formRef.value) return;
    await formRef.value.validate((valid) => {
        if (valid) {
            const executionTime = formData.timeRange && formData.timeRange.length === 2
                ? `${formData.timeRange[0]}～${formData.timeRange[1]}`
                : '待设置';

            emit('confirm', {
                dept: formData.dept,
                region: formData.region,
                quantity: String(formData.quantity),
                executionTime: executionTime,
                varieties: formData.varieties || '待设置',
                items: formData.items || '待设置'
            });
            visible.value = false;
        }
    });
};

watch(() => props.modelValue, (val) => {
    if (val) {
        if (props.initialData) {
            // 回显逻辑
            formData.dept = props.initialData.dept || '';
            formData.region = props.initialData.region || '';
            formData.quantity = Number(props.initialData.quantity) || 0;
            formData.varieties = props.initialData.varieties === '待设置' ? '' : props.initialData.varieties;
            formData.items = props.initialData.items === '待设置' ? '' : props.initialData.items;

            if (props.initialData.executionTime && props.initialData.executionTime !== '待设置') {
                const times = props.initialData.executionTime.split('～');
                if (times.length === 2) {
                    formData.timeRange = [times[0].trim(), times[1].trim()];
                }
            } else {
                formData.timeRange = [];
            }
        } else {
            resetForm();
        }
    }
});
</script>

<style lang="scss">
.task-add-dialog {
    padding: 0 !important;

    :deep(.el-dialog) {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .el-dialog__body {
        padding: 20px 24px;
    }

    :deep(.el-dialog__header) {
        padding: 20px 24px;
        margin-right: 0;
        border-bottom: 1px solid #f1f5f9;
        background: #fff;

        .el-dialog__title {
            font-size: 18px;
            font-weight: 600;
            color: #0f172a;
            position: relative;
            padding-left: 12px;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 4px;
                height: 18px;
                background: #00B3ED;
                border-radius: 2px;
            }
        }
    }

    .el-dialog__footer {
        padding: 12px 24px;
        border-top: 1px solid #f1f5f9;
    }

    .full-width {
        width: 100% !important;
    }

    .task-form {
        :deep(.el-form-item) {
            margin-top: 14px;
            margin-bottom: 14px;

            .el-form-item__label {
                font-size: 14px;
                color: #475569;
                font-weight: 500;
                margin-bottom: 8px;
            }
        }

        .custom-input,
        .custom-number,
        .custom-cascader,
        .custom-date-picker {
            :deep(.el-input__wrapper) {
                background-color: #f8fafc;
                box-shadow: 0 0 0 1px #e2e8f0 inset;
                border-radius: 8px;
                padding: 8px 12px;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

                &:hover {
                    box-shadow: 0 0 0 1px #cbd5e1 inset;
                    background-color: #fff;
                }

                &.is-focus {
                    box-shadow: 0 0 0 2px rgba(0, 179, 237, 0.1), 0 0 0 1px #00B3ED inset !important;
                    background-color: #fff;
                }
            }
        }

        .custom-number {

            :deep(.el-input-number__increase),
            :deep(.el-input-number__decrease) {
                background-color: #f1f5f9;
                border-left: 1px solid #e2e8f0;
                color: #475569; // 增强图标可见度
                width: 32px;

                &:hover {
                    color: #00B3ED;
                    background-color: #e2e8f0;
                }

                // 针对 Element Plus 的内部图标
                i,
                .el-icon {
                    font-weight: bold;
                    color: #64748b;
                }
            }

            :deep(.el-input__wrapper) {
                padding-right: 0 !important; // 让按钮贴边
            }
        }
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        .el-button {
            padding: 10px 24px;
            height: 40px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 8px;
            transition: all 0.2s;

            &:not(.el-button--primary) {
                color: #64748b;
                border-color: #e2e8f0;

                &:hover {
                    color: #0f172a;
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }
            }

            &.el-button--primary {
                background: #00B3ED;
                border-color: #00B3ED;
                box-shadow: 0 4px 6px -1px rgba(0, 179, 237, 0.2);

                &:hover {
                    background: #00a2d7;
                    border-color: #00a2d7;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(0, 179, 237, 0.3);
                }

                &:active {
                    transform: translateY(0);
                }
            }
        }
    }

    .el-input-number.is-controls-right .el-input-number__decrease,
    .el-input-number.is-controls-right .el-input-number__increase {
        --el-input-number-controls-height: 20px;
    }
}
</style>
