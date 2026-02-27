<template>
    <div class="page-container">
        <PageBack>
        </PageBack>
        <!-- 头部标题 -->
        <div class="header-card">
            <div class="card-header">
             
                <h2 class="card-title">抽样检测</h2>
            </div>
            <p class="header-desc">请根据您的实际情况选择相应的备案类型，我们为企业和个人提供专业的备案服务，确保您的备案流程顺利进行。</p>
        </div>

        <!-- 步骤条 -->
        <div class="content-card">
            <div class="steps-wrapper">
                <div class="step-item" :class="{ active: currentStep === 1, done: currentStep > 1 }"
                    @click="goToStep(1)">
                    <span class="step-num">1.</span> 样品信息录入
                </div>
                <div class="step-item" :class="{ active: currentStep === 2, done: currentStep > 2 }"
                    @click="goToStep(2)">
                    <span class="step-num">2.</span> 快检入判读
                </div>
                <div class="step-item" :class="{ active: currentStep === 3, done: currentStep > 3 }"
                    @click="goToStep(3)">
                    <span class="step-num">3.</span> 检测结果
                </div>
                <div class="step-item" :class="{ active: currentStep === 4 }" @click="goToStep(4)">
                    <span class="step-num">4.</span> 检测报告
                </div>
            </div>

            <!-- 步骤1: 样品信息 -->
            <div v-show="currentStep === 1" class="step-content">
                <h3 class="section-title">样品信息</h3>

                <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top"
                    class="sample-info-form">
                    <!-- 是否关联农产品档案 -->
                    <el-form-item label="是否关联农产品档案">
                        <div class="inline-radio-input">
                            <el-radio-group v-model="formData.linkProduct">
                                <el-radio :value="false">否</el-radio>
                                <el-radio :value="true">是</el-radio>
                            </el-radio-group>
                            <div v-if="formData.linkProduct" class="scan-input-group">
                                <el-input v-model="formData.scanCode" placeholder="05696789 /白菜 20251219" readonly />
                                <el-button type="primary" class="scan-btn" @click="handleScan">
                                    <el-icon>
                                        <Goods />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 样品编号 -->
                    <el-form-item label="*样品编号" prop="sampleNo">
                        <el-input v-model="formData.sampleNo" placeholder="YP20251230000001 [用户自定义]" />
                    </el-form-item>

                    <!-- 样品名称 -->
                    <el-form-item label="*样品名称" prop="sampleName">
                        <el-input v-model="formData.sampleName" placeholder="白菜" />
                    </el-form-item>

                    <!-- 样品类别 -->
                    <el-form-item label="*样品类别" prop="sampleCategory">
                        <el-cascader v-model="formData.sampleCategory" :options="categoryOptions" placeholder="蔬菜"
                            class="full-width" clearable />
                    </el-form-item>

                    <!-- 样品产地 -->
                    <el-form-item label="*样品产地" prop="origin">
                        <el-cascader v-model="formData.origin" :options="regionOptions" placeholder="山东省"
                            class="full-width" clearable />
                    </el-form-item>

                    <!-- 数量（重量） -->
                    <el-form-item label="*数量（重量）" prop="quantity">
                        <div class="compound-input">
                            <el-input v-model="formData.quantity" placeholder="输入产品数量" style="flex: 1" />
                            <el-select v-model="formData.quantityUnit" placeholder="选择计量单位" style="width: 140px">
                                <el-option label="kg" value="kg" />
                                <el-option label="吨" value="ton" />
                                <el-option label="箱" value="box" />
                                <el-option label="个" value="pcs" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <!-- 样品来源环节 -->
                    <el-form-item label="样品来源环节">
                        <el-select v-model="formData.sourceLink" placeholder="田间、市场、商市" class="full-width">
                            <el-option label="田间" value="field" />
                            <el-option label="市场" value="market" />
                            <el-option label="商超" value="supermarket" />
                            <el-option label="其他" value="other" />
                        </el-select>
                    </el-form-item>

                    <!-- 生产经营企业（主体名称） -->
                    <el-form-item label="生产经营企业（主体名称）">
                        <p class="field-tip">*从生产档案中选择，如果未建档找企业，支持主体建档</p>
                        <el-select v-model="formData.subjectId" filterable remote placeholder="请选择生产经营企业"
                            class="full-width" @focus="showSubjectDropdown = true">
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                            <el-option v-for="item in subjectOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                        <div class="subject-actions" v-if="showSubjectDropdown">
                            <el-button @click="showSubjectDropdown = false">取消</el-button>
                            <el-button type="primary" @click="handleCreateSubject">主体建档</el-button>
                        </div>
                    </el-form-item>

                    <!-- 检测结果面向政府公开 -->
                    <el-form-item label="检测结果面向政府公开">
                        <el-radio-group v-model="formData.isPublic">
                            <el-radio :value="true">是</el-radio>
                            <el-radio :value="false">否</el-radio>
                        </el-radio-group>
                        <div class="public-notice">
                            <div class="notice-icon">!</div>
                            <div class="notice-content">
                                <p>当前政府对此类检测结果是否面向公开，（当前任务结构和所有上级是否可看到此类型），不公开，不计入任务统计数据量。</p>
                                <p>任务来源是政府机构、检测机构、默认公开，否该初默认为：</p>
                                <p class="notice-value">单位名</p>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 步骤2: 快检入判读 -->
            <div v-show="currentStep === 2" class="step-content">
                <h3 class="section-title">快检入判读</h3>
                <div class="placeholder-content">
                    <p>快检入判读内容区域</p>
                    <p>上传检测卡照片，系统自动判读结果</p>
                </div>
            </div>

            <!-- 步骤3: 检测结果 -->
            <div v-show="currentStep === 3" class="step-content">
                <h3 class="section-title">检测结果</h3>
                <div class="placeholder-content">
                    <p>检测结果内容区域</p>
                    <p>显示检测项目、检测值、判定结果等信息</p>
                </div>
            </div>

            <!-- 步骤4: 检测报告 -->
            <div v-show="currentStep === 4" class="step-content">
                <h3 class="section-title">检测报告</h3>
                <div class="placeholder-content">
                    <p>检测报告内容区域</p>
                    <p>生成并预览检测报告</p>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="footer-actions">
                <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
                <el-button v-if="currentStep > 1" @click="handlePrev">上一步</el-button>
                <el-button v-if="currentStep < 4" type="primary" @click="handleNext" class="btn-next">下一步</el-button>
                <el-button v-if="currentStep === 4" type="primary" @click="handleSubmit" class="btn-next">提交
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Goods } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const formRef = ref(null);
const currentStep = ref(1);
const showSubjectDropdown = ref(false);

const formData = reactive({
    linkProduct: false,
    scanCode: '',
    sampleNo: 'YP20251230000001',
    sampleName: '',
    sampleCategory: [],
    origin: [],
    quantity: '',
    quantityUnit: '',
    sourceLink: '',
    subjectId: '',
    isPublic: true
});

const formRules = {
    sampleNo: [{ required: true, message: '请输入样品编号', trigger: 'blur' }],
    sampleName: [{ required: true, message: '请输入样品名称', trigger: 'blur' }],
    sampleCategory: [{ required: true, message: '请选择样品类别', trigger: 'change' }],
    origin: [{ required: true, message: '请选择样品产地', trigger: 'change' }],
    quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
};

const categoryOptions = [
    {
        value: 'vegetable',
        label: '蔬菜',
        children: [
            { value: 'leafy', label: '叶菜类' },
            { value: 'root', label: '根茎类' },
            { value: 'fruit_veg', label: '果菜类' }
        ]
    },
    {
        value: 'fruit',
        label: '水果',
        children: [
            { value: 'citrus', label: '柑橘类' },
            { value: 'berry', label: '浆果类' }
        ]
    },
    {
        value: 'seafood',
        label: '水产品',
        children: [
            { value: 'fish', label: '鱼类' },
            { value: 'shrimp', label: '虾蟹类' }
        ]
    }
];

const regionOptions = [
    {
        value: 'shandong',
        label: '山东省',
        children: [
            { value: 'jinan', label: '济南市' },
            { value: 'qingdao', label: '青岛市' }
        ]
    },
    {
        value: 'beijing',
        label: '北京市',
        children: [
            { value: 'chaoyang', label: '朝阳区' },
            { value: 'haidian', label: '海淀区' }
        ]
    }
];

const subjectOptions = [
    { value: '1', label: '北京物美商业集团股份有限公司 (110201181878786816)' },
    { value: '2', label: '盒马生鲜' },
    { value: '3', label: '物美超市' },
    { value: '4', label: '沃尔玛' }
];

const goToStep = (step) => {
    if (step < currentStep.value) {
        currentStep.value = step;
    }
};

const handleScan = () => {
    ElMessage.info('扫码功能开发中');
};

const handleCreateSubject = () => {
    router.push('/filing/subjectCreate');
};

const handleCancel = () => {
    router.back();
};

const handlePrev = () => {
    if (currentStep.value > 1) {
        currentStep.value--;
    }
};

const handleNext = () => {
    if (currentStep.value === 1) {
        formRef.value.validate((valid) => {
            if (valid) {
                currentStep.value++;
            } else {
                ElMessage.warning('请填写必填项');
            }
        });
    } else {
        currentStep.value++;
    }
};

const handleSubmit = () => {
    ElMessage.success('检测信息提交成功');
    router.back();
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 头部卡片 */
.header-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .blue-line {
        width: 4px;
        height: 16px;
        background: #00B3ED;
        border-radius: 2px;
    }

    .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}

.header-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
    padding-left: 12px;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
    flex: 1;
}

/* 步骤条 */
.steps-wrapper {
    display: flex;
    gap: 0;
    margin-bottom: 40px;

    .step-item {
        padding: 12px 32px;
        background: #E5E7EB;
        color: #666;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &:first-child {
            border-radius: 4px 0 0 4px;
        }

        &:last-child {
            border-radius: 0 4px 4px 0;
        }

        &.active {
            background: #00B3ED;
            color: #fff;
        }

        &.done {
            background: #b3e5f5;
            color: #00B3ED;
        }

        .step-num {
            font-weight: 600;
        }
    }
}

/* 步骤内容 */
.step-content {
    max-width: 600px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #00B3ED;
    margin: 0 0 24px 0;
}

/* 表单样式 */
.sample-info-form {
    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #333;
        font-size: 14px;
        padding-bottom: 8px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        border-radius: 6px;
        box-shadow: 0 0 0 1px #D1D5DB inset;
        height: 44px;
        background: #fff;

        &.is-focus {
            box-shadow: 0 0 0 1px #00B3ED inset !important;
        }
    }

    :deep(.el-cascader) {
        width: 100%;
    }
}

.full-width {
    width: 100%;
}

.inline-radio-input {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.scan-input-group {
    display: flex;
    gap: 8px;
    flex: 1;
    min-width: 250px;

    .scan-btn {
        height: 44px;
        width: 44px;
        padding: 0;
        background: #00B3ED;
        border-color: #00B3ED;
    }
}

.compound-input {
    display: flex;
    gap: 12px;
}

.field-tip {
    font-size: 12px;
    color: #999;
    margin: 0 0 8px 0;
}

.subject-actions {
    display: flex;
    gap: 12px;
    margin-top: 12px;

    .el-button {
        border-radius: 8px;
    }
}

/* 公开提示框 */
.public-notice {
    display: flex;
    gap: 12px;
    background: #FFF8DC;
    border: 1px solid #FFD700;
    border-radius: 8px;
    padding: 16px;
    margin-top: 12px;

    .notice-icon {
        width: 24px;
        height: 24px;
        background: #FFD700;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        flex-shrink: 0;
    }

    .notice-content {
        flex: 1;

        p {
            margin: 0 0 8px 0;
            font-size: 13px;
            color: #666;
            line-height: 1.5;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .notice-value {
            color: #333;
            font-weight: 500;
        }
    }
}

/* 占位内容 */
.placeholder-content {
    text-align: center;
    padding: 60px 20px;
    background: #F9FAFB;
    border-radius: 8px;
    color: #999;

    p {
        margin: 8px 0;
    }
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px dashed #D1D5DB;

    .el-button {
        min-width: 100px;
        height: 44px;
        border-radius: 8px;
        font-size: 14px;
    }

    .btn-cancel {
        background: #fff;
        border-color: #D1D5DB;
        color: #333;
    }

    .btn-next {
        background: #00B3ED;
        border-color: #00B3ED;
    }
}
</style>
