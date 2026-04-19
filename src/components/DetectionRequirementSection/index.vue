<template>
    <div class="step-section">
        <h4 class="step-title">{{ title }}</h4>
        <div class="summary-info">
            <span class="summary-text">已选任务分配量：</span>
            <span class="summary-value">{{ selectedQuantity }}</span>
            <span class="divider">|</span>
            <span class="summary-text">方案检测总量：</span>
            <span class="summary-value">{{ sampleCount }}</span>
            <el-button type="primary" @click="handleHighRiskQuery" class="batch-config-btn">
                高风险查询
            </el-button>
        </div>

        <div class="task-table-wrapper">
            <el-table :data="displayTaskList" :header-cell-style="headerCellStyle" border>
                <el-table-column label="序号" width="60" align="center">
                    <template #default="scope">
                        <div v-if="scope.row.isAdd" class="add-row-btn" @click="handleAddTaskRow">
                            <el-icon :size="20" color="#00B3ED">
                                <CirclePlusFilled />
                            </el-icon>
                        </div>
                        <span v-else>{{ scope.$index + 1 }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="承担单位" prop="dept" width="150" show-overflow-tooltip>
                    <template #default="scope">
                        <span v-if="!scope.row.isAdd">{{ scope.row.dept }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="检测地区" prop="region" width="100" align="center">
                    <template #default="scope">
                        <span v-if="!scope.row.isAdd">{{ scope.row.region }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="检测数量" prop="quantity" width="100" align="center">
                    <template #default="scope">
                        <span v-if="!scope.row.isAdd">{{ scope.row.quantity }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="执行时间" prop="executionTime" width="200" align="center">
                    <template #default="scope">
                        <span v-if="!scope.row.isAdd" class="link-text">{{ scope.row.executionTime }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="检测品种" prop="varieties" align="center">
                    <template #default="scope">
                        <span v-if="!scope.row.isAdd" class="link-text">{{ scope.row.varieties }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="检测项目" prop="items" align="center">
                    <template #default="scope">
                        <span v-if="!scope.row.isAdd" class="link-text">{{ scope.row.items }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130" align="center" fixed="right">
                    <template #default="scope">
                        <template v-if="!scope.row.isAdd">
                            <span class="link-text" @click="handleConfigTask(scope.row, scope.$index)">编辑</span>
                            <span class="link-text ml10" style="color: #F56C6C;"
                                @click="handleDeleteTask(scope.$index)">删除</span>
                        </template>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 检测要求弹窗 -->
        <!-- 新增/编辑任务弹窗 -->
        <TaskAddDialog v-model="showTaskAddDialog" :title="dialogTitle" :initial-data="currentTaskData"
            @confirm="handleTaskAddConfirm" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CirclePlusFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import HighRiskDialog from '@/components/HighRiskDialog/index.vue';
import TaskAddDialog from '@/components/TaskAddDialog/index.vue';

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
    }
});

const emit = defineEmits(['update:modelValue']);

const taskList = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

const showTaskAddDialog = ref(false);
const showHighRiskDialog = ref(false);
const dialogTitle = ref('新增任务');
const currentTaskData = ref(null);
const currentTaskIndex = ref(-1);

const displayTaskList = computed(() => {
    return [...taskList.value, { isAdd: true }];
});

const selectedQuantity = computed(() => {
    return taskList.value.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
});

const handleAddTaskRow = () => {
    currentTaskData.value = null;
    currentTaskIndex.value = -1;
    dialogTitle.value = '新增任务';
    showTaskAddDialog.value = true;
};

const handleTaskAddConfirm = (data) => {
    const newList = [...taskList.value];
    if (currentTaskIndex.value > -1) {
        newList[currentTaskIndex.value] = data;
        ElMessage.success('任务修改成功');
    } else {
        newList.push(data);
        ElMessage.success('任务已添加至表格');
    }
    taskList.value = newList;
    showTaskAddDialog.value = false;
};

const handleDeleteTask = (index) => {
    const newList = [...taskList.value];
    newList.splice(index, 1);
    taskList.value = newList;
};

const handleHighRiskQuery = () => {
    showHighRiskDialog.value = true;
};

const handleHighRiskConfirm = (selectedItems) => {
    if (!selectedItems || selectedItems.length === 0) return;
    ElMessage.success(`已选中 ${selectedItems.length} 项高风险检测要求`);

    const newList = [...taskList.value];
    if (newList.length === 0) {
        newList.push({
            dept: '待设置',
            region: '北京市',
            quantity: '0',
            executionTime: '待设置',
            varieties: selectedItems.map(i => i.product).join('、'),
            items: selectedItems.map(i => i.testItem).join('、')
        });
    } else {
        const firstTask = newList[0];
        firstTask.varieties = selectedItems.map(i => i.product).slice(0, 3).join('、') + (selectedItems.length > 3 ? '...' : '');
        firstTask.items = selectedItems.map(i => i.testItem).slice(0, 3).join('、') + (selectedItems.length > 3 ? '...' : '');
    }
    taskList.value = newList;
};

const handleConfigTask = (row, index) => {
    currentTaskData.value = { ...row };
    currentTaskIndex.value = index;
    dialogTitle.value = '编辑任务';
    showTaskAddDialog.value = true;
};

const headerCellStyle = {
    backgroundColor: '#FFFFFF',
    color: '#333',
    fontWeight: '500',
    height: '50px',
    borderBottom: '1px solid #f0f0f0'
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
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #F0F9FF;
    border-radius: 8px;

    .summary-text {
        font-size: 14px;
        color: #666;
    }

    .summary-value {
        font-size: 14px;
        font-weight: 600;
        color: #00B3ED;
    }

    .divider {
        color: #D1D5DB;
    }

    .batch-config-btn {
        margin-left: auto;
        height: 36px;
        padding: 0 20px;
    }
}

/* 任务表格 */
.task-table-wrapper {
    .link-text {
        color: #00B3ED;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }

    .ml10 {
        margin-left: 10px;
    }

    .add-row-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.1);
        }
    }
}
</style>
