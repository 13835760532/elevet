<template>
    <el-dialog v-model="visible" title="高风险农产品top10排序" width="800px" :close-on-click-modal="false"
        class="high-risk-dialog" append-to-body>

        <!-- 查询栏 -->
        <div class="filter-header">
            <el-select v-model="queryParams.timeType" placeholder="请选择" class="filter-select" style="width: 120px;">
                <el-option label="累计" value="cumulative" />
                <el-option label="本月" value="month" />
                <el-option label="本年" value="year" />
            </el-select>

            <el-select v-model="queryParams.region" placeholder="请选择" class="filter-select"
                style="width: 150px; margin-left: 12px;">
                <el-option label="北京市海淀区" value="haidian" />
                <el-option label="北京市朝阳区" value="chaoyang" />
                <el-option label="北京市大兴区" value="daxing" />
            </el-select>

            <el-button type="primary" class="query-btn" @click="handleQuery"
                style="margin-left: 16px; padding: 0 30px;">
                查询
            </el-button>
        </div>

        <!-- 表格部分 -->
        <div class="table-containers" style="border-radius: 4px;">
            <el-table :data="tableData" border @selection-change="handleSelectionChange"
                :header-cell-style="{ textAlign: 'center', backgroundColor: '#FFFFFF', color: '#333', fontWeight: 'bold' }"
                :cell-style="{ textAlign: 'center' }">

                <el-table-column type="selection" width="55" />
                <el-table-column label="序号" type="index" width="60" />
                <el-table-column label="农产品" prop="product" />
                <el-table-column label="检测项" prop="testItem" />
                <el-table-column label="检测数量" prop="testCount" />
                <el-table-column label="阳性数量" prop="positiveCount" />
                <el-table-column label="阳性率" prop="positiveRate" />

            </el-table>
        </div>

        <!-- 底部按钮 -->
        <template #footer>
            <div class="dialog-footer">
                <el-button class="action-btn" @click="handleSetAsTarget">设为检测品种及检测项</el-button>
                <el-button class="action-btn" @click="handleClose">了解并关闭</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});

// 查询参数
const queryParams = reactive({
    timeType: 'cumulative',
    region: 'haidian'
});

// 选中的数据
const selectedItems = ref([]);

// 模拟表格数据
const tableData = ref([
    {
        id: 1,
        product: '莴苣',
        testItem: '甲霜灵',
        testCount: '**',
        positiveCount: '**',
        positiveRate: '1%'
    },
    {
        id: 2,
        product: '大葱',
        testItem: '克百威',
        testCount: '**',
        positiveCount: '**',
        positiveRate: '0.72%'
    },
    {
        id: 3,
        product: '芹菜',
        testItem: '毒死蜱',
        testCount: '**',
        positiveCount: '**',
        positiveRate: '0.69%'
    }
]);

const handleQuery = () => {
    // 处理查询逻辑
    console.log('Query with:', queryParams);
};

const handleSelectionChange = (selection) => {
    selectedItems.value = selection;
};

const handleClose = () => {
    visible.value = false;
};

const handleSetAsTarget = () => {
    emit('confirm', selectedItems.value);
    visible.value = false;
};
</script>


<style lang="scss">
.high-risk-dialog {
    border-radius: 10px !important;
    overflow: hidden;

    .el-dialog__header {
        margin-right: 0;

        .el-dialog__title {
            font-size: 18px;
            font-weight: 500;
            color: #333;
        }

        .el-dialog__headerbtn {
            display: none; // 隐藏右上角的关闭按钮(如果需要符合图里没有叉的样子)
        }
    }

    .el-dialog__body {}
}
</style>
<style lang="scss" scoped>
.filter-header {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 30px;
    padding-bottom: 10px;

    .action-btn {
        background-color: #b8b8b8;
        border-color: #b8b8b8;
        color: #333;
        padding: 12px 24px;
        height: auto;
        border-radius: 2px;
        border: none;
        font-weight: 500;
        font-size: 14px;

        &:hover {
            background-color: #a3a3a3;
            color: #222;
        }
    }
}
</style>
