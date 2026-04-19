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
                <el-option label="北京市西城区" value="xicheng" />
                <el-option label="北京市东城区" value="dongcheng" />
                <el-option label="北京市丰台区" value="fengtai" />
                <el-option label="北京市石景山区" value="shijingshan" />
                <el-option label="北京市大兴区" value="daxing" />
                <el-option label="北京市通州区" value="tongzhou" />
                <el-option label="北京市顺义区" value="shunyi" />
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
        product: '豇豆',
        testItem: '灭蝇胺、倍硫磷',
        testCount: '156',
        positiveCount: '3',
        positiveRate: '1.92%'
    },
    {
        id: 2,
        product: '韭菜',
        testItem: '腐霉利、毒死蜱',
        testCount: '142',
        positiveCount: '2',
        positiveRate: '1.41%'
    },
    {
        id: 3,
        product: '莴苣',
        testItem: '甲霜灵',
        testCount: '98',
        positiveCount: '1',
        positiveRate: '1.02%'
    },
    {
        id: 4,
        product: '大葱',
        testItem: '克百威、三唑磷',
        testCount: '115',
        positiveCount: '1',
        positiveRate: '0.87%'
    },
    {
        id: 5,
        product: '芹菜',
        testItem: '毒死蜱、甲拌磷',
        testCount: '130',
        positiveCount: '1',
        positiveRate: '0.77%'
    },
    {
        id: 6,
        product: '辣椒',
        testItem: '杀螟硫磷',
        testCount: '85',
        positiveCount: '0',
        positiveRate: '0%'
    },
    {
        id: 7,
        product: '油菜',
        testItem: '氟虫腈',
        testCount: '76',
        positiveCount: '0',
        positiveRate: '0%'
    },
    {
        id: 8,
        product: '番茄',
        testItem: '毒死蜱',
        testCount: '64',
        positiveCount: '0',
        positiveRate: '0%'
    },
    {
        id: 9,
        product: '豆芽',
        testItem: '6-苄基腺嘌呤',
        testCount: '52',
        positiveCount: '0',
        positiveRate: '0%'
    },
    {
        id: 10,
        product: '草莓',
        testItem: '烯酰吗啉',
        testCount: '48',
        positiveCount: '0',
        positiveRate: '0%'
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

    .el-dialog__body {
        padding: 20px 24px;
        background-color: #f8fafc;
    }

    .el-dialog__footer {
        padding: 20px 24px 30px;
        border-top: 1px dashed #e2e8f0;
    }
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
    gap: 20px;

    .action-btn {
        background-color: #fff;
        border: 1px solid #e2e8f0;
        color: #334155;
        padding: 10px 28px;
        height: 40px;
        font-weight: 500;
        font-size: 14px;
        border-radius: 6px;
        transition: all 0.3s;

        &:hover {
            background-color: #f1f5f9;
            border-color: #cbd5e1;
            color: #0f172a;
        }

        &:first-child {
            background-color: #00B3ED;
            border-color: #00B3ED;
            color: #fff;

            &:hover {
                background-color: #0099cc;
                border-color: #0099cc;
                box-shadow: 0 4px 12px rgba(0, 179, 237, 0.2);
            }
        }
    }
}
.table-containers {
    background: #fff;
    padding: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);

    :deep(.el-table) {
        --el-table-border-color: #f1f5f9;
        font-size: 13px;
        
        thead {
            color: #475569;
        }
    }
}
</style>
