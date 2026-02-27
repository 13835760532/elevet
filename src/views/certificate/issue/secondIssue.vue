<template>
    <div class="page-container">
        <!-- 步骤导航 -->
        <div class="steps-wrapper">
            <div class="step-item" :class="{ active: currentStep === 1 }">1. 创建产品档案</div>
            <div class="step-item" :class="{ active: currentStep === 2 }">2. 开具合格证</div>
            <div class="step-item" :class="{ active: currentStep === 3 }">3. 查看合格证</div>
        </div>

        <div class="content-card">
            <el-form :model="formData" label-position="top" class="step-form">
                <!-- 基础配置区 -->
                <div class="top-configs">
                    <el-form-item label="合格证出证类型" class="nowrap-item">
                        <el-select v-model="formData.issueType" placeholder="请选择" class="custom-select-large">
                            <el-option label="收购出证" value="buy" />
                            <el-option label="生产出证" value="produce" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="数量 (重量)">
                        <div class="quantity-input">
                            <div class="stepper">
                                <button type="button" class="step-btn" @click="handleSub">-</button>
                                <div class="step-val">{{ formData.quantity }}</div>
                                <button type="button" class="step-btn yellow" @click="handleAdd">+</button>
                            </div>
                            <el-select v-model="formData.unit" class="unit-select">
                                <el-option label="单位" value="unit" />
                                <el-option label="千克" value="kg" />
                                <el-option label="吨" value="t" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <el-form-item label="承诺依据">
                        <el-checkbox-group v-model="formData.basis">
                            <el-checkbox label="quality">质量安全控制符合要求</el-checkbox>
                            <el-checkbox label="self">自行检测合格</el-checkbox>
                            <el-checkbox label="entrust">委托检测合格</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </div>

                <!-- 检测结果关联区 -->
                <div class="association-grid">
                    <!-- 左侧：第三方结果 -->
                    <div class="assoc-col">
                        <h3 class="col-title">关联样品检测结果</h3>
                        <div class="col-content-box">
                            <el-select v-model="formData.thirdPartyType" placeholder="第三方检测结果" class="full-width">
                                <el-option label="第三方检测结果" value="third" />
                            </el-select>

                            <el-button type="primary" class="upload-btn full-width">上传检测报告/检测结果</el-button>

                            <div class="image-preview-placeholder">
                                <el-icon class="placeholder-icon">
                                    <Picture />
                                </el-icon>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧：平台结果 -->
                    <div class="assoc-col">
                        <h3 class="col-title">关联样品检测结果</h3>
                        <div class="col-content-box">
                            <el-select v-model="formData.platformType" placeholder="本平台检测结果" class="full-width">
                                <el-option label="本平台检测结果" value="platform" />
                            </el-select>

                            <div class="search-row">
                                <el-input v-model="formData.searchKey" placeholder="查询样品检测结果完成关联" class="flex-input" />
                                <el-button type="primary" class="link-btn">关联</el-button>
                            </div>

                            <div class="results-preview">
                                <h4 class="preview-title">样品检测结果预览</h4>

                                <div class="kv-grid">
                                    <div class="kv-row"><span class="label">样品编号：</span><span
                                            class="val">YP20251230000001</span></div>
                                    <div class="kv-row"><span class="label">样品名称：</span><span class="val">桂鱼</span>
                                    </div>
                                    <div class="kv-row"><span class="label">样品产地：</span><span class="val">广东省-佛山市</span>
                                    </div>
                                    <div class="kv-row"><span class="label">样品数量 (重量)：</span><span
                                            class="val">10亩</span></div>
                                    <div class="kv-row"><span class="label">抽检区域：</span><span
                                            class="val">北京-朝阳-高碑店</span></div>
                                    <div class="kv-row"><span class="label">主体名称：</span><span
                                            class="val">佛山市山水区合洋水产有限公司</span></div>
                                    <div class="kv-row"><span class="label">检测机构：</span><span
                                            class="val">北京市平谷区农业综合检验检测中心</span></div>
                                    <div class="kv-row"><span class="label">检测人员：</span><span class="val">李娜</span>
                                    </div>
                                    <div class="kv-row"><span class="label">检测日期：</span><span
                                            class="val">2025-12-30</span></div>
                                </div>

                                <table class="nested-table">
                                    <thead>
                                        <tr>
                                            <th>通道</th>
                                            <th>检测项目</th>
                                            <th>检测结果</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>氟虫腈</td>
                                            <td>阴性</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>灭多威</td>
                                            <td>阳性</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部提交方案 -->
                <div class="page-footer">
                    <el-button class="back-btn" @click="handleBack">上一步</el-button>
                    <el-button type="primary" class="submit-btn" @click="handleGenerate">生成合格证</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { useCertificateStore } from '@/store/modules/certificate';

const router = useRouter();
const certStore = useCertificateStore();

// 当前步骤
const currentStep = computed(() => certStore.currentStep);

const formData = reactive({
    issueType: 'buy',
    quantity: 0,
    unit: 'unit',
    basis: ['quality'],
    thirdPartyType: 'third',
    platformType: 'platform',
    searchKey: ''
});

// 初始化时设置步骤
onMounted(() => {
    certStore.setStep(2);
});

const handleAdd = () => formData.quantity++;
const handleSub = () => { if (formData.quantity > 0) formData.quantity-- };

// 返回上一步
const handleBack = () => {
    certStore.setStep(1);
    router.push('/certificate/issue/create');
};

// 生成合格证
const handleGenerate = () => {
    // 保存开具信息到 store
    certStore.updateIssueInfo({
        issueType: formData.issueType,
        quantity: formData.quantity,
        unit: formData.unit,
        basis: formData.basis,
        thirdPartyType: formData.thirdPartyType,
        platformType: formData.platformType
    });

    // 生成合格证
    certStore.generateCertificate();

    // 跳转到第三步
    certStore.setStep(3);
    router.push('/certificate/issue/third');
};
</script>

<style lang="scss" scoped>
.page-container {
    padding: 16px;
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
}

/* 步骤导航 */
.steps-wrapper {
    max-width: 1000px;
    margin: 0 auto 20px auto;
    display: flex;
    background: #F3F4F6;
    border-radius: 4px;
    overflow: hidden;
}

.step-item {
    flex: 1;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #666;
    position: relative;

    &.active {
        background: #00B3ED;
        color: #fff;
        font-weight: 500;
    }

    &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        background: #D1D5DB;
    }
}

.content-card {
    max-width: 1000px;
    margin: 0 auto;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.top-configs {
    margin-bottom: 40px;

    :deep(.el-form-item__label) {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        padding-bottom: 12px;
    }
}

.custom-select-large {
    width: 280px;
}

.quantity-input {
    display: flex;
    align-items: center;
    gap: 12px;

    .stepper {
        display: flex;
        align-items: center;
        background: #fff;
        border: 1px solid #D1D5DB;
        border-radius: 4px;
        overflow: hidden;

        .step-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: #F3F4F6;
            cursor: pointer;
            font-size: 20px;
            color: #333;
            transition: all 0.2s;

            &:hover {
                background: #E5E7EB;
            }

            &.yellow {
                background: #FFD700;

                &:hover {
                    background: #FACC15;
                }
            }
        }

        .step-val {
            width: 60px;
            text-align: center;
            font-size: 16px;
            color: #333;
        }
    }

    .unit-select {
        width: 100px;
    }
}

/* 检测关联区域 */
.association-grid {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
}

.assoc-col {
    flex: 1;

    .col-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
    }

    .col-content-box {
        background: #FDF5E6;
        /* 米色背景 */
        padding: 20px;
        border-radius: 4px;
        min-height: 500px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
}

.full-width {
    width: 100% !important;
}

.upload-btn {
    background: #00B3ED;
    border-color: #00B3ED;
    height: 40px;
    font-weight: 600;
}

.image-preview-placeholder {
    flex: 1;
    background: #E5E7EB;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    .placeholder-icon {
        font-size: 48px;
        color: #9CA3AF;
    }
}

.search-row {
    display: flex;
    gap: 12px;

    .link-btn {
        background: #00B3ED;
        border-color: #00B3ED;
        width: 100px;
    }
}

/* 结果预览区 */
.results-preview {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 16px;
    border-radius: 4px;

    .preview-title {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 16px;
        padding-left: 8px;
        border-left: 3px solid #00B3ED;
    }
}

.kv-grid {
    display: flex;
    flex-direction: column;
    border: 1px solid #F3F4F6;
    margin-bottom: 16px;

    .kv-row {
        display: flex;
        border-bottom: 1px solid #F3F4F6;

        &:last-child {
            border-bottom: none;
        }

        .label {
            width: 130px;
            background: #F9FAFB;
            padding: 8px;
            font-size: 12px;
            color: #666;
            text-align: right;
            border-right: 1px solid #F3F4F6;
        }

        .val {
            flex: 1;
            padding: 8px;
            font-size: 12px;
            color: #333;
        }
    }
}

.nested-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;

    th {
        background: #F9FAFB;
        padding: 8px;
        text-align: left;
        border: 1px solid #F3F4F6;
        color: #666;
    }

    td {
        padding: 8px;
        border: 1px solid #F3F4F6;
        color: #333;
    }
}

/* 底部按钮 */
.page-footer {
    display: flex;
    justify-content: center;
    padding-top: 20px;
    gap: 16px;

    .back-btn {
        width: 140px;
        height: 48px;
    }

    .submit-btn {
        width: 320px;
        height: 48px;
        background: #00B3ED;
        border-color: #00B3ED;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
    }
}

:deep(.el-checkbox) {
    margin-right: 24px;

    .el-checkbox__label {
        font-weight: 500;
        color: #333;
    }
}
</style>
