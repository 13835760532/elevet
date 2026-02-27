<template>
    <div class="page-container">
        <PageBack style="margin-bottom: 12px;" />

        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">合格证开具（生产者/收购者）</h1>
            </div>
            <div class="desc-box">
                填写产品档案，关联上游合格证，关联检测信息开具合格证
            </div>
        </div>

        <div class="content-card">
            <!-- 步骤导航 -->
            <div class="steps-wrapper">
                <div class="step-item" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
                    <span class="step-number">1</span>
                    <span class="step-text">创建产品档案</span>
                </div>
                <div class="step-line" :class="{ active: currentStep > 1 }"></div>
                <div class="step-item" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
                    <span class="step-number">2</span>
                    <span class="step-text">开具合格证</span>
                </div>
                <div class="step-line" :class="{ active: currentStep > 2 }"></div>
                <div class="step-item" :class="{ active: currentStep === 3 }">
                    <span class="step-number">3</span>
                    <span class="step-text">查看合格证</span>
                </div>
            </div>

            <!-- 第一步：创建产品档案 -->
            <div v-if="currentStep === 1" class="step-content">
                <el-form :model="formData" label-position="top" class="creation-form">
                    <!-- 产品档案信息 -->
                    <div class="form-section">
                        <h3 class="section-title">产品档案信息</h3>

                        <div class="form-row">
                            <el-form-item label="是否关联农产品档案" class="form-col full">
                                <el-radio-group v-model="formData.linkProfile">
                                    <el-radio label="no">否</el-radio>
                                    <el-radio label="yes">是</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>

                        <div v-if="formData.linkProfile === 'yes'" class="form-row">
                            <el-form-item class="form-col full">
                                <el-input v-model="formData.searchProfile" placeholder="查询产品名称 or 编号，完成产品档案管理"
                                    class="search-input">
                                    <template #suffix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </div>

                        <div class="divider"></div>

                        <!-- 两列布局：产品编号 + 产品名称 -->
                        <div class="form-row two-cols">
                            <el-form-item label="*产品编号" class="form-col">
                                <el-input v-model="formData.productNo" placeholder="DP20251238000001" />
                            </el-form-item>
                            <el-form-item label="产品名称" class="form-col">
                                <el-input v-model="formData.productName" placeholder="输入产品名称" />
                            </el-form-item>
                        </div>

                        <!-- 两列布局：产品类别 + 产品产地 -->
                        <div class="form-row two-cols">
                            <el-form-item label="产品类别" class="form-col">
                                <el-select v-model="formData.category" placeholder="选择产品类别" class="full-width">
                                    <el-option label="蔬菜" value="vegetable" />
                                    <el-option label="水果" value="fruit" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="产品产地" class="form-col">
                                <el-input v-model="formData.origin" placeholder="输入产品的生产地" />
                            </el-form-item>
                        </div>

                        <!-- 两列布局：批次规模 + 建档日期 -->
                        <div class="form-row two-cols">
                            <el-form-item label="批次规模" class="form-col">
                                <div class="batch-input">
                                    <el-input v-model="formData.batchSize" placeholder="输入产品数量" style="flex: 1;" />
                                    <el-select v-model="formData.unit" placeholder="单位" style="width: 100px;">
                                        <el-option label="吨" value="t" />
                                        <el-option label="千克" value="kg" />
                                    </el-select>
                                </div>
                            </el-form-item>
                            <el-form-item label="建档日期" class="form-col">
                                <el-date-picker v-model="formData.createDate" type="date" placeholder="2025-12-19"
                                    class="full-width" />
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 生产经营企业 -->
                    <div class="form-section">
                        <h3 class="section-title">生产经营企业（主体名称）</h3>
                        <p class="section-tip">*从生产档案中选择，或直接搜索到企业，支持多项建档</p>

                        <div class="entity-selector">
                            <el-select v-model="formData.entity" placeholder="北京颐发隆鑫集团股份有限公司（190318616766073685X）"
                                class="full-width" filterable>
                                <template #prefix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-select>
                            <div class="entity-info-card">
                                <div class="info-line">主体名称: {{ formData.entity || '-' }}</div>
                                <div class="info-line">注册城市: -</div>
                                <div class="info-line">法人: -</div>
                                <div class="info-actions">
                                    <el-button class="btn-close">关闭</el-button>
                                    <el-button type="primary" class="btn-select">主体建档</el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="divider"></div>

                    <!-- 关联上游合格证 -->
                    <div class="form-section">
                        <div class="section-header-row">
                            <h3 class="section-title no-margin">关联上游合格证</h3>
                            <el-radio-group v-model="formData.linkUpstream">
                                <el-radio label="yes">是</el-radio>
                                <el-radio label="no">否</el-radio>
                            </el-radio-group>
                        </div>

                        <el-form-item class="mt16">
                            <el-select v-model="formData.upstreamType" placeholder="农产品上游合格证为本平台开具" class="full-width">
                                <el-option label="本平台开具" value="platform" />
                            </el-select>
                        </el-form-item>

                        <div class="search-row">
                            <el-input v-model="formData.upstreamCertNo" placeholder="10245567(输入上游合格证编号)"
                                style="flex: 1">
                                <template #suffix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                            </el-input>
                            <el-button type="primary" class="btn-cyan">查询</el-button>
                        </div>
                    </div>

                    <!-- 合格证预览区 -->
                    <div class="certificate-preview-mini">
                        <div class="cert-no">合格证编号：HGZ993199XXXX</div>
                        <div class="cert-inner-card">
                            <h2 class="cert-main-title">承诺达标合格</h2>
                            <div class="cert-sub-title">我承诺生产销售的食用农产品</div>
                            <p class="cert-desc">未使用禁用的农药、兽药及其他化合物，使用的常规农药、兽药残留不超标。</p>
                            <div class="cert-promises">
                                <div class="cert-title">承诺依据</div>
                                <el-checkbox v-model="formData.p1" disabled>质量安全控制符合要求</el-checkbox>
                                <el-checkbox v-model="formData.p2" disabled>自行检测合格</el-checkbox>
                                <el-checkbox v-model="formData.p3" disabled>委托检测合格</el-checkbox>
                            </div>
                            <div class="qr-placeholder">
                                <el-icon size="60">
                                    <Picture />
                                </el-icon>
                            </div>
                        </div>
                    </div>

                    <!-- 基本信息预览 -->
                    <div class="basic-info-preview">
                        <h3 class="section-title">基本信息</h3>
                        <div class="info-grid">
                            <div class="info-row"><span class="label">产品名称</span><span class="value">{{
                                formData.productName || '--'
                                    }}</span></div>
                            <div class="info-row"><span class="label">产品数量</span><span class="value">{{
                                formData.batchSize || '--' }} {{
                                        formData.unit }}</span></div>
                            <div class="info-row"><span class="label">产品产地</span><span class="value">{{ formData.origin
                                || '--' }}</span>
                            </div>
                            <div class="info-row"><span class="label">承诺主体</span><span class="value">{{ formData.entity
                                || '--' }}</span>
                            </div>
                            <div class="info-row"><span class="label">联系方式</span><span class="value">--</span></div>
                            <div class="info-row"><span class="label">开具时间</span><span class="value">{{
                                formData.createDate || '--'
                                    }}</span></div>
                        </div>
                        <p class="info-tip">*电子合格证须现查询快检阅读电子智慧平台多数据</p>
                    </div>

                    <!-- 产品图片 -->
                    <div class="form-section">
                        <h3 class="section-title">产品图片</h3>
                        <div class="image-upload-area">
                            <el-icon size="40">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>

                    <!-- 底部按钮 -->
                    <div class="form-footer">
                        <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                        <el-button type="primary" class="btn-submit" @click="goNextToStep2">生成合格证</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 第二步：开具内容 -->
            <div v-if="currentStep === 2" class="step-content">
                <el-form :model="formData" label-position="top" class="step-form">
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

                    <div class="association-grid">
                        <div class="assoc-col">
                            <h3 class="col-title">关联样品检测结果 (第三方)</h3>
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

                        <div class="assoc-col">
                            <h3 class="col-title">关联样品检测结果 (平台)</h3>
                            <div class="col-content-box">
                                <el-select v-model="formData.platformType" placeholder="本平台检测结果" class="full-width">
                                    <el-option label="本平台检测结果" value="platform" />
                                </el-select>
                                <div class="search-row">
                                    <el-input v-model="formData.searchKey" placeholder="查询样品检测结果" />
                                    <el-button type="primary" class="link-btn">关联</el-button>
                                </div>
                                <div class="results-preview">
                                    <h4 class="preview-title">检测结果预览</h4>
                                    <div class="kv-grid">
                                        <div class="kv-row"><span class="label">样品名称：</span><span class="val">{{
                                            formData.productName || '暂无' }}</span></div>
                                        <div class="kv-row"><span class="label">检测人员：</span><span class="val">李娜</span>
                                        </div>
                                    </div>
                                    <table class="nested-table">
                                        <thead>
                                            <tr>
                                                <th>通道</th>
                                                <th>检测项目</th>
                                                <th>结果</th>
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

                    <div class="page-footer">
                        <el-button class="back-btn" @click="goToStep(1)">上一步</el-button>
                        <el-button type="primary" class="submit-btn" @click="handleGenerate">生成合格证</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 第三步：查看合格证 -->
            <div v-if="currentStep === 3" class="step-content">
                <div class="certificate-document">
                    <div class="cert-header">
                        <span class="cert-no-tag">合格证编号－{{ certStore.certificate.certNo }}</span>
                    </div>

                    <div class="cert-body">
                        <h1 class="cert-title">承诺达标合格证</h1>
                        <h2 class="cert-subtitle">我承诺生产销售的食用农产品</h2>
                        <p class="cert-declaration">未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。</p>

                        <div class="cert-middle-section">
                            <div class="cert-basis">
                                <h3 class="basis-title">承诺依据：</h3>
                                <el-checkbox-group v-model="formData.basis" disabled>
                                    <el-checkbox label="quality">质量安全控制符合要求</el-checkbox>
                                    <el-checkbox label="self">自行检测合格</el-checkbox>
                                    <el-checkbox label="entrust">委托检测合格</el-checkbox>
                                </el-checkbox-group>
                            </div>
                            <div class="qr-code-wrapper">
                                <img :src="certStore.certificate.qrCodeUrl" alt="QR" />
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="info-section">
                            <h3 class="info-title">基本信息</h3>
                            <div class="info-table">
                                <div class="info-row">
                                    <div class="label">产品名称</div>
                                    <div class="value">{{ formData.productName }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">产品数量</div>
                                    <div class="value">{{ formData.quantity }} {{ formData.unit }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">产品产地</div>
                                    <div class="value">{{ formData.origin }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">承诺主体</div>
                                    <div class="value">{{ formData.entity }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">开具时间</div>
                                    <div class="value">{{ certStore.certificate.issueDate }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="image-section">
                            <h3 class="info-title">产品图片</h3>
                            <div class="image-placeholder">
                                <el-icon class="placeholder-icon">
                                    <Picture />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-footer">
                    <el-button type="primary" class="print-btn" @click="handlePrint">打印合格证</el-button>
                    <el-button class="back-btn" @click="handleBack">返回列表</el-button>
                    <el-button class="back-btn" @click="goToStep(2)">修改信息</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Picture } from '@element-plus/icons-vue';
import { useCertificateStore } from '@/store/modules/certificate';
import PageBack from '@/components/PageBack/index.vue';

const router = useRouter();
const certStore = useCertificateStore();

const currentStep = computed(() => certStore.currentStep);

const formData = reactive({
    // Step 1
    linkProfile: 'yes',
    searchProfile: '',
    productNo: 'DP20251231000001',
    productName: '',
    category: '',
    origin: '',
    batchSize: '',
    unit: 'kg',
    createDate: '2025-12-19',
    entity: '',
    linkUpstream: 'yes',
    upstreamType: 'platform',
    upstreamCertNo: '',
    p1: true,
    p2: false,
    p3: false,
    // Step 2
    issueType: 'buy',
    quantity: 0,
    basis: ['quality'],
    thirdPartyType: 'third',
    platformType: 'platform',
    searchKey: ''
});

onMounted(() => {
    // 每次进入页面重置到第一步
    certStore.setStep(1);
    // 从 store 恢复数据 (如果有)
    // Object.assign(formData, certStore.productInfo, certStore.issueInfo);
});

const handleAdd = () => formData.quantity++;
const handleSub = () => { if (formData.quantity > 0) formData.quantity-- };

const goToStep = (step) => {
    certStore.setStep(step);
};

const goNextToStep2 = () => {
    // 同步到 store
    certStore.updateProductInfo(formData);
    goToStep(2);
};

const handleGenerate = () => {
    certStore.updateIssueInfo(formData);
    certStore.generateCertificate();
    goToStep(3);
};

const handleCancel = () => {
    certStore.resetAll();
    router.push('/certificate/issue');
};

const handleBack = () => {
    certStore.resetAll();
    router.push('/certificate/issue');
};

const handlePrint = () => { window.print(); };
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
}

.header-section {
    padding: 16px;
    margin-bottom: 20px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.title-line {
    width: 4px;
    height: 16px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.desc-box {
    font-size: 14px;
    color: #666;
    padding-left: 12px;
}

.content-card {
    width: 100%;
    margin: 0 auto;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

/* 步骤条 */
.steps-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 40px;
    padding: 20px 0;
}

.step-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 24px;
    font-size: 14px;
    color: #666;
    background: transparent;
    transition: all 0.3s;

    .step-number {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #E5E7EB;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 13px;
    }

    .step-text {
        font-weight: 500;
    }

    &.active {
        background: #00B3ED;
        color: #fff;

        .step-number {
            background: #fff;
            color: #00B3ED;
        }
    }

    &.completed {
        .step-number {
            background: #52C41A;
            color: #fff;
        }
    }
}

.step-line {
    width: 60px;
    height: 2px;
    background: #E5E7EB;
    margin: 0 8px;

    &.active {
        background: #00B3ED;
    }
}

/* 表单结构 */
.form-section {
    margin-bottom: 32px;

    .section-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin-bottom: 16px;
    }

    .section-tip {
        font-size: 12px;
        color: #999;
        margin-bottom: 16px;
    }

    &.no-margin {
        margin-bottom: 0;
    }
}

.form-row {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;

    &.two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
    }
}

.form-col {
    flex: 1;

    &.full {
        flex: 1;
        width: 100%;
    }

    &.half {
        width: 50%;
        max-width: 400px;
    }
}

.batch-input {
    display: flex;
    gap: 12px;
    align-items: center;
}

.full-width {
    width: 100%;
}

.mt16 {
    margin-top: 16px;
}

.divider {
    height: 1px;
    border-bottom: 1px dashed #D1D5DB;
    margin: 24px 0;
}

.search-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 16px;
}

.section-header-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* 合格证预览 */
.certificate-preview-mini {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    margin: 24px 0;

    .cert-no {
        font-size: 13px;
        color: #00B3ED;
        font-weight: 600;
        margin-bottom: 16px;
    }

    .cert-inner-card {
        text-align: center;
        padding: 20px;
        position: relative;
    }

    .cert-main-title {
        font-size: 22px;
        font-weight: 800;
        color: #333;
        margin-bottom: 8px;
    }

    .cert-sub-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
    }

    .cert-desc {
        font-size: 12px;
        color: #666;
        margin-bottom: 16px;
    }

    .cert-promises {
        text-align: left;
        background: #F9FAFB;
        padding: 16px;
        border-radius: 8px;

        .cert-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
        }

        .el-checkbox {
            display: block;
            margin-bottom: 8px;
        }
    }

    .qr-placeholder {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 100px;
        height: 100px;
        background: #F3F4F6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ccc;
    }
}

/* 基本信息预览 */
.basic-info-preview {
    margin: 24px 0;

    .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        overflow: hidden;
    }

    .info-row {
        display: flex;
        border-bottom: 1px solid #E5E7EB;

        &:last-child {
            border-bottom: none;
        }

        .label {
            width: 100px;
            padding: 12px 16px;
            background: #F9FAFB;
            font-size: 14px;
            color: #666;
            border-right: 1px solid #E5E7EB;
        }

        .value {
            flex: 1;
            padding: 12px 16px;
            font-size: 14px;
            color: #333;
        }
    }

    .info-tip {
        font-size: 12px;
        color: #999;
        margin-top: 12px;
    }
}

/* 产品图片上传 */
.image-upload-area {
    width: 150px;
    height: 150px;
    background: #F9FAFB;
    border: 2px dashed #D1D5DB;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }
}

/* 实体选择器 */
.entity-selector {
    .entity-info-card {
        margin-top: 12px;
        padding: 16px;
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        border-radius: 8px;

        .info-line {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
        }

        .info-actions {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }
    }
}

/* 步骤二样式 */
.top-configs {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-bottom: 32px;
}

.quantity-input {
    display: flex;
    align-items: center;
    gap: 12px;
}

.stepper {
    display: flex;
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    overflow: hidden;

    .step-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: #F3F4F6;
        cursor: pointer;
        font-size: 18px;
    }

    .step-btn.yellow {
        background: #FFD700;
    }

    .step-val {
        width: 60px;
        text-align: center;
        line-height: 40px;
        background: #fff;
    }
}

.association-grid {
    display: flex;
    gap: 24px;
    margin-bottom: 32px;
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
        padding: 20px;
        border-radius: 8px;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
}

.results-preview {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 16px;
    border-radius: 8px;

    .preview-title {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 12px;
        border-left: 3px solid #00B3ED;
        padding-left: 8px;
    }
}

/* 步骤三：合格证大页面样式 */
.certificate-document {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 40px;
    border-radius: 8px;

    .cert-header {
        margin-bottom: 24px;

        .cert-no-tag {
            background: #F0F7FF;
            color: #333;
            padding: 6px 12px;
            border-radius: 2px;
        }
    }

    .cert-title {
        font-size: 28px;
        font-weight: 800;
        margin: 20px 0;
    }

    .cert-subtitle {
        font-size: 20px;
        font-weight: 700;
    }

    .cert-declaration {
        font-size: 14px;
        color: #666;
        max-width: 600px;
        margin: 12px auto;
    }
}

.cert-middle-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;
    margin: 32px 0;
}

.qr-code-wrapper {
    width: 120px;
    height: 120px;

    img {
        width: 100%;
    }
}

.info-table {
    border: 1px solid #EDEDED;
    text-align: left;

    .info-row {
        display: flex;
        border-bottom: 1px solid #EDEDED;

        &:last-child {
            border-bottom: none;
        }

        .label {
            width: 140px;
            background: #F9FAFB;
            padding: 12px;
            font-weight: 600;
            border-right: 1px solid #EDEDED;
        }

        .value {
            flex: 1;
            padding: 12px;
        }
    }
}

.image-placeholder {
    width: 100%;
    height: 200px;
    background: #F3F4F6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .placeholder-icon {
        font-size: 48px;
        color: #D1D5DB;
    }
}

/* 通用底部按钮 */
.form-footer,
.page-footer,
.action-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
}

.btn-submit,
.submit-btn,
.print-btn {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    min-width: 160px;
    height: 44px;
    font-weight: 600;
    border-radius: 22px;
    transition: all 0.3s;

    &:hover {
        background: linear-gradient(135deg, #0099D6 0%, #0085B3 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 179, 237, 0.3);
    }
}

.btn-cancel,
.back-btn {
    min-width: 120px;
    height: 44px;
    border-radius: 22px;
    border-color: #D1D5DB;
    color: #666;

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }
}

.btn-cyan {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
        background: linear-gradient(135deg, #0099D6 0%, #0085B3 100%);
    }
}

/* 复选框组样式 */
:deep(.el-checkbox) {
    margin-right: 20px;

    .el-checkbox__label {
        font-weight: 500;
        color: #333;
    }
}

/* 表单项样式优化 */
:deep(.el-form-item) {
    .el-form-item__label {
        font-weight: 600;
        color: #333;
    }
}

:deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #E5E7EB inset;

    &:hover {
        box-shadow: 0 0 0 1px #00B3ED inset;
    }

    &.is-focus {
        box-shadow: 0 0 0 1px #00B3ED inset;
    }
}

:deep(.el-select) {
    .el-input__wrapper {
        border-radius: 8px;
    }
}

/* 上传按钮样式 */
.upload-btn {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 8px;

    &:hover {
        background: linear-gradient(135deg, #0099D6 0%, #0085B3 100%);
    }
}

/* 图片预览占位符 */
.image-preview-placeholder {
    flex: 1;
    background: #fff;
    border: 2px dashed #D1D5DB;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    .placeholder-icon {
        font-size: 48px;
        color: #D1D5DB;
    }
}

/* 关联按钮 */
.link-btn {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 6px;
}

/* 嵌套表格样式 */
.nested-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;

    th,
    td {
        padding: 10px 12px;
        text-align: left;
        border: 1px solid #E5E7EB;
        font-size: 13px;
    }

    th {
        background: #F9FAFB;
        font-weight: 600;
    }
}

.kv-grid {
    .kv-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 13px;

        .label {
            color: #666;
            width: 80px;
        }

        .val {
            color: #333;
            font-weight: 500;
        }
    }
}

/* 第三步按钮样式 */
.btn-close {
    border-color: #D1D5DB;
    color: #666;
    border-radius: 6px;

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }
}

.btn-select {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 6px;
}
</style>
