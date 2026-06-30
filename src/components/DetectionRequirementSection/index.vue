<template>
    <div class="step-section">
        <h4 class="step-title">{{ title }}</h4>
        <div class="summary-info">
            <span class="summary-text">已选任务分配量：</span>
            <span class="summary-value" :class="{ 'error-text': isExceedLimit }">{{ selectedQuantity }}</span>
            <span class="divider">|</span>
            <span class="summary-text">任务总样品量：</span>
            <span class="summary-value">{{ sampleCount }}</span>
            <el-button type="primary" @click="handleHighRiskQuery" class="batch-config-btn">
                高风险查询
            </el-button>
        </div>

        <div class="task-table-wrapper">
            <el-table :data="displayTaskList" :header-cell-style="headerCellStyle" :span-method="spanMethod"
                class="premium-table">
                <el-table-column label="序号" width="60" align="center" class-name="index-col">
                    <template #default="scope">
                        <div v-if="scope.row.isAdd" class="add-row-full" @click="handleAddTaskRow">
                            <el-icon class="add-icon">
                                <Plus />
                            </el-icon>
                            <span>添加任务行</span>
                        </div>
                        <span v-else class="index-badge">{{ scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="承担单位" prop="dept" width="200" show-overflow-tooltip>
                    <template #default="scope">
                        <el-select v-if="!scope.row.isAdd" v-model="scope.row.deptId" placeholder="请选择承担单位" size="small"
                            class="full-width" @change="(val) => handleDeptChange(scope.row, val)">
                            <el-option v-for="org in orgOptions" :key="org.id" :label="org.name" :value="org.id"
                                :disabled="isOrgDisabled(org.id, scope.$index)" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="检测地区" prop="region" width="150" align="center">
                    <template #default="scope">
                        <el-input v-if="!scope.row.isAdd" v-model="scope.row.region" placeholder="请输入检测地区"
                            size="small" />
                    </template>
                </el-table-column>
                <el-table-column label="待检样品量" prop="quantity" width="80" align="center">
                    <template #default="scope">
                        <el-input-number v-if="!scope.row.isAdd" v-model="scope.row.quantity" :min="0" :precision="0"
                            :disabled="quantityReadonly" controls-position="right" size="small" class="cell-number"
                            @change="handleRowQuantityChange" />
                    </template>
                </el-table-column>
                <el-table-column label="执行时间" prop="executionTime" width="280" align="center">
                    <template #default="scope">
                        <el-date-picker v-if="!scope.row.isAdd" v-model="scope.row.timeRange" type="daterange"
                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD" size="small" class="cell-date" style="width: 230px!important;"
                            @change="handleTimeRangeChange(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column label="检测品种" prop="varieties" align="center">
                    <template #default="scope">
                        <el-input v-if="!scope.row.isAdd" v-model="scope.row.varieties" placeholder="请输入检测品种"
                            size="small" />
                    </template>
                </el-table-column>
                <el-table-column label="检测项目" prop="items" align="center">
                    <template #default="scope">
                        <el-input v-if="!scope.row.isAdd" v-model="scope.row.items" placeholder="请输入检测项目"
                            size="small" />
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="center" fixed="right">
                    <template #default="scope">
                        <template v-if="!scope.row.isAdd">
                            <span class="link-text" style="color: #F56C6C;"
                                @click="handleDeleteTask(scope.$index)">删除</span>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 高风险查询弹窗 -->
        <HighRiskDialog v-model="highRiskVisible" @confirm="handleHighRiskConfirm" />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import HighRiskDialog from '../HighRiskDialog/index.vue';

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    sampleCount: {
        type: [Number, String],
        default: 0
    },
    title: {
        type: String,
        default: '3、设置具体检测要求'
    },
    distributionType: {
        type: String,
        default: 'average'
    },
    orgOptions: {
        type: Array,
        default: () => []
    },
    defaultTimeRange: {
        type: Array,
        default: () => []
    },
    defaultVarieties: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue']);

const taskList = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const highRiskVisible = ref(false);

const displayTaskList = computed(() => {
    return [...taskList.value, { isAdd: true }];
});

const selectedQuantity = computed(() => {
    return taskList.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

const isExceedLimit = computed(() => {
    return Number(selectedQuantity.value) > Number(props.sampleCount);
});

const quantityReadonly = computed(() => props.distributionType === 'average');

const spanMethod = ({ row, column, rowIndex, columnIndex }) => {
    if (row.isAdd) {
        if (columnIndex === 0) {
            return [1, 8];
        } else {
            return [0, 0];
        }
    }
};

const normalizeRow = (row) => {
    if (!row) return;
    row.deptId = row.deptId || undefined;
    row.dept = row.dept || '';
    row.region = row.region || '';
    row.quantity = Number(row.quantity) || 0;
    row.varieties = row.varieties && row.varieties !== '待设置' ? row.varieties : '';
    row.items = row.items && row.items !== '待设置' ? row.items : '';
    if (!Array.isArray(row.timeRange)) {
        if (row.executionTime && row.executionTime !== '待设置') {
            const times = row.executionTime.split('～').map((i) => i.trim());
            row.timeRange = times.length === 2 ? times : [];
        } else {
            row.timeRange = [];
        }
    }
};

const handleDeptChange = (row, deptId) => {
    const org = props.orgOptions.find(o => o.id === deptId);
    if (org) {
        row.dept = org.name;
    }
};

const isOrgDisabled = (orgId, currentIndex) => {
    return taskList.value.some((item, index) => item.deptId === orgId && index !== currentIndex);
};

watch(
    () => taskList.value,
    (list) => {
        (list || []).forEach(normalizeRow);
    },
    { immediate: true, deep: true }
);

/** 平均分配逻辑实现 */
const recalculateAverageQuantity = () => {
    const list = taskList.value;
    if (!list || list.length === 0) return;

    const total = Number(props.sampleCount) || 0;
    const count = list.length;
    const avg = Math.floor(total / count);
    const remainder = total % count;

    let isChanged = false;
    const newList = list.map((item, index) => {
        const targetVal = avg + (index < remainder ? 1 : 0);
        if (Number(item.quantity) !== targetVal) {
            isChanged = true;
            return { ...item, quantity: targetVal };
        }
        return item;
    });

    if (isChanged) {
        emit('update:modelValue', newList);
    }
};

// 监听触发平均分配的因素
watch(
    [() => props.distributionType, () => props.sampleCount, () => taskList.value.length],
    ([type]) => {
        if (type === 'average') {
            recalculateAverageQuantity();
        }
    },
    { immediate: true }
);

const handleTimeRangeChange = (row) => {
    if (!Array.isArray(row.timeRange) || row.timeRange.length !== 2) {
        row.executionTime = '待设置';
        return;
    }
    row.executionTime = `${row.timeRange[0]}～${row.timeRange[1]}`;
};

const handleAddTaskRow = () => {
    const newList = [...taskList.value];

    let defaultDeptId = undefined;
    let defaultDeptName = '';
    const availableOrg = props.orgOptions.find(org => !isOrgDisabled(org.id, -1));
    if (availableOrg) {
        defaultDeptId = availableOrg.id;
        defaultDeptName = availableOrg.name;
    }

    let defaultTimeRange = [];
    let defaultExecutionTime = '待设置';
    if (props.defaultTimeRange && props.defaultTimeRange.length === 2 && props.defaultTimeRange[0] && props.defaultTimeRange[1]) {
        try {
            const s = typeof props.defaultTimeRange[0] === 'string' ? props.defaultTimeRange[0].slice(0, 10) : new Date(props.defaultTimeRange[0]).toISOString().slice(0, 10);
            const e = typeof props.defaultTimeRange[1] === 'string' ? props.defaultTimeRange[1].slice(0, 10) : new Date(props.defaultTimeRange[1]).toISOString().slice(0, 10);
            defaultTimeRange = [s, e];
            defaultExecutionTime = `${s}～${e}`;
        } catch (e) { }
    }

    newList.push({
        deptId: defaultDeptId,
        dept: defaultDeptName,
        region: '',
        quantity: 0,
        executionTime: defaultExecutionTime,
        timeRange: defaultTimeRange,
        varieties: props.defaultVarieties || '',
        items: ''
    });
    taskList.value = newList;
    ElMessage.success('任务已添加至表格');
};

const handleDeleteTask = (index) => {
    const newList = [...taskList.value];
    newList.splice(index, 1);
    taskList.value = newList;
};

const handleRowQuantityChange = () => {
    // 强制触发父组件的 v-model 更新
    emit('update:modelValue', [...taskList.value]);
};

const handleHighRiskQuery = () => {
    highRiskVisible.value = true;
};

const handleHighRiskConfirm = (selectedItems) => {
    if (!selectedItems || selectedItems.length === 0) return;

    const newList = [...taskList.value];

    // 默认时间范围
    let defaultTimeRange = [];
    let defaultExecutionTime = '待设置';
    if (props.defaultTimeRange?.length === 2 && props.defaultTimeRange[0] && props.defaultTimeRange[1]) {
        try {
            const s = typeof props.defaultTimeRange[0] === 'string' ? props.defaultTimeRange[0].slice(0, 10) : new Date(props.defaultTimeRange[0]).toISOString().slice(0, 10);
            const e = typeof props.defaultTimeRange[1] === 'string' ? props.defaultTimeRange[1].slice(0, 10) : new Date(props.defaultTimeRange[1]).toISOString().slice(0, 10);
            defaultTimeRange = [s, e];
            defaultExecutionTime = `${s}～${e}`;
        } catch (e) { }
    }

    selectedItems.forEach(item => {
        // 为每个选中的高风险项添加一行
        newList.push({
            deptId: undefined,
            dept: '',
            region: '',
            quantity: 0,
            executionTime: defaultExecutionTime,
            timeRange: defaultTimeRange,
            varieties: item.foodType || item.foodSubcategory,
            items: item.unqualifiedItem || ''
        });
    });

    taskList.value = newList;
    ElMessage.success(`已添加 ${selectedItems.length} 条高风险检测要求`);
};

const headerCellStyle = {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    fontWeight: '600',
    height: '48px',
    borderBottom: '1px solid #E5E7EB',
    fontSize: '13px',
    letterSpacing: '0.05em'
};
</script>

<style lang="scss" scoped>
.step-section {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #f0f0f0;

    &:last-of-type {
        border-bottom: none;
    }
}

.step-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
}

/* 汇总信息 */
.summary-info {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    padding: 16px 24px;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #F3F4F6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    transition: box-shadow 0.3s ease;

    &:hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
    }

    .summary-text {
        font-size: 14px;
        color: #6B7280;
    }

    .summary-value {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .divider {
        color: #E5E7EB;
        height: 24px;
        width: 1px;
        background-color: #E5E7EB;
        margin: 0 8px;
    }

    .batch-config-btn {
        margin-left: auto;
        height: 38px;
        padding: 0 24px;
        border-radius: 8px;
        font-weight: 600;
        letter-spacing: 0.5px;
        background: #00B3ED;
        border: none;
        color: #fff;
        transition: all 0.2s;

        &:hover {
            opacity: 0.8;
            transform: translateY(-1px);
        }
    }
}

/* 任务表格 */
.task-table-wrapper {
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #F3F4F6;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-table) {
        border-radius: 12px;
        overflow: hidden;
        --el-table-border-color: #F3F4F6;

        &::before {
            display: none;
        }

        .el-table__row {
            transition: background-color 0.2s ease;

            &:hover>td.el-table__cell {
                background-color: #F9FAFB !important;
            }
        }

        td.el-table__cell {
            padding: 12px 0;
            border-bottom: 1px solid #F3F4F6;
        }
    }

    .index-badge {
        font-weight: 600;
        color: #9CA3AF;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    :deep(.el-input__wrapper),
    :deep(.el-date-editor.el-input__wrapper) {
        box-shadow: none !important;
        border: 1px solid transparent;
        background-color: transparent;
        transition: all 0.2s ease;
        border-radius: 6px;
        padding: 0 12px;

        input {
            color: #374151;
            font-weight: 500;

            &::placeholder {
                color: #D1D5DB;
                font-weight: 400;
            }
        }

        &:hover {
            background-color: #F3F4F6;
        }

        &.is-focus {
            background-color: #ffffff;
            box-shadow: 0 0 0 1px #E5E7EB, 0 0 0 3px rgba(55, 65, 81, 0.1) !important;
        }
    }

    :deep(.el-input-number.cell-number) {
        width: 100%;

        .el-input__wrapper {
            padding-right: 32px !important;
            background-color: transparent !important;
        }

        .el-input-number__increase,
        .el-input-number__decrease {
            background: transparent !important;
            border-left: none !important;
            border-bottom: none !important;
            border-top: none !important;
            width: 24px !important;
            color: #D1D5DB;
            opacity: 0;
            transition: all 0.2s ease;

            &:hover {
                color: #111827;
                background-color: #F3F4F6 !important;
            }
        }

        &:hover {

            .el-input-number__increase,
            .el-input-number__decrease {
                opacity: 1;
            }
        }
    }

    :deep(.el-input-number.is-controls-right .el-input-number__increase) {
        border-bottom: none !important;
    }

    :deep(.el-input.is-disabled .el-input__wrapper) {
        background-color: transparent !important;

        input {
            color: #9CA3AF;
        }
    }



    :deep(.el-range-separator) {
        color: #9CA3AF;
        padding: 0 4px;
    }

    .link-text {
        color: #EF4444;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
        background-color: transparent;

        &:hover {
            background-color: #FEF2F2;
        }
    }

    .add-row-full {
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 16px;
        color: #6B7280;
        background: #FAFAFA;
        border: 1px dashed #E5E7EB;
        border-radius: 8px;
        margin: 8px;
        transition: all 0.3s;
        font-weight: 500;

        .add-icon {
            margin-right: 8px;
            font-size: 16px;
        }

        &:hover {
            color: #111827;
            border-color: #9CA3AF;
            background: #F3F4F6;
        }
    }

    .cell-number,
    .cell-date {
        width: 100%;
    }
}

.error-text {
    color: #F56C6C !important;
}
</style>
