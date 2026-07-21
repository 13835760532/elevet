<template>
    <div class="page-container yy-detail-container">
        <!-- 顶部标题区 -->
        <PageHeader title="主体建档" desc="快速建立产品主体档案，完善资质及背景信息，提升品牌公信力。" />

        <div class="page-scrollable">
            <!-- 内容卡片 -->
            <div class="content-card">
                <div class="card-header">
                    <div class="header-main">
                        <span class="header-title">主体基本信息</span>
                        <el-button type="primary" plain class="btn-copy-prev" :loading="copyLoading"
                            @click="handleCopyPrevious">复制上一条</el-button>
                    </div>
                    <div class="dashed-line"></div>
                </div>

                <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="product-form">
                    <!-- 建档类型 -->
                    <el-form-item label="建档类型" prop="type" required>
                        <el-select v-model="formData.type" placeholder="请选择建档类型" class="full-width"
                            @change="handleTypeChange">
                            <el-option v-for="dict in filingTypeOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <!-- 主体名称 -->
                    <el-form-item label="主体名称" prop="name" required>
                        <el-input v-model="formData.name" placeholder="请填写主体名称" />
                    </el-form-item>

                    <!-- 主体类型 -->
                    <el-form-item label="主体类型" prop="category">
                        <el-select v-model="formData.category" placeholder="请选择主体类型" class="full-width">
                            <el-option v-for="dict in subjectCategoryOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <!-- 主营产品 -->
                    <el-form-item label="主营产品" prop="mainProducts">
                        <div style="display: flex; align-items: center; width: 100%;">
                            <el-input v-model="formData.mainProducts" placeholder="请填写主营产品" />
                            <el-tooltip placement="right" effect="light">
                                <template #content>
                                    <div style="line-height: 1.5;">
                                        主要用于记录企业/个人的主营产品，协助品牌宣传。<br />
                                        注：行政主管部门、检测机构等可填写无
                                    </div>
                                </template>
                                <el-icon class="tooltip-icon">
                                    <WarningFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </el-form-item>

                    <!-- 所属地区 -->
                    <el-form-item label="所属地区" prop="provinceCode">
                        <AreaCascader style="width: 500px;" v-model="areaPath" placeholder="请选择所属地区" @select="(val) => {
                            formData.provinceCode = val.province;
                            formData.cityCode = val.city;
                            formData.districtCode = val.district;
                        }" />
                    </el-form-item>

                    <!-- 详细地址 -->
                    <el-form-item label="详细地址" prop="address">
                        <el-input v-model="formData.address" placeholder="请填写详细地址" />
                    </el-form-item>

                    <!-- 联系人 -->
                    <el-form-item label="联系人" prop="contactName" required>
                        <el-input v-model="formData.contactName" placeholder="请填写联系人" />
                    </el-form-item>

                    <!-- 联系电话 -->
                    <el-form-item label="联系电话" prop="contactPhone" required>
                        <el-input v-model="formData.contactPhone" placeholder="请填写联系电话" />
                    </el-form-item>

                    <!-- 生产经营主体 -->
                    <el-form-item label="生产经营主体" prop="productionScale">
                        <div class="scale-row">
                            <el-input v-model="formData.productionScale" placeholder="请填写生产经营主体" />
                            <el-select v-model="formData.productionScaleUnit" placeholder="亩" style="width: 100px">
                                <el-option v-for="unit in productionScaleUnitOptions" :key="unit.value"
                                    :label="unit.label" :value="unit.value" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <template v-if="isNonPersonalFilingType">
                        <el-form-item label="营业执照" prop="businessLicenseUrl">
                            <div style="display: flex; align-items: center; width: 100%;">
                                <div class="ocr-upload-wrapper">
                                    <UploadImg v-model="formData.businessLicenseUrl" :limit="1"
                                        @change="(val) => !val && (formData.socialCreditCode = '')"
                                        :http-request="(options) => handleOcrUpload(options, 1)" />
                                    <div class="ocr-tip">上传营业执照，系统可自动识别营业执照编号，保障主体唯一性，支持企业宣传展示。</div>
                                </div>
                                <el-tooltip placement="right" effect="light">
                                    <template #content>
                                        <div style="line-height: 1.5;">
                                            营业执照备案仅用于支持企业开展“合格证开具”的诚信证明<br />
                                            存档，营业执照信息将加密存储，且仅本企业用户可见（不向<br />
                                            消费者公开）
                                        </div>
                                    </template>
                                    <el-icon class="tooltip-icon">
                                        <WarningFilled />
                                    </el-icon>
                                </el-tooltip>
                            </div>
                        </el-form-item>

                        <!-- 信用代码 -->
                        <el-form-item label="信用代码" prop="socialCreditCode">
                            <el-input v-model="formData.socialCreditCode" placeholder="请填写信用代码" />
                        </el-form-item>

                        <!-- 企业资质 -->
                        <el-form-item label="企业资质" prop="qualificationUrls">
                            <UploadImgs v-model="formData.qualificationUrls" :limit="5" />
                        </el-form-item>

                        <!-- 企业介绍 -->
                        <el-form-item label="企业介绍" prop="introduction">
                            <el-input v-model="formData.introduction" type="textarea" :rows="4" placeholder="请填写企业介绍" />
                        </el-form-item>
                    </template>

                    <el-form-item v-if="isPersonalFilingType" label="身份证" prop="idCardFrontUrl">
                        <div style="display: flex; gap: 20px;">
                            <div class="ocr-upload-wrapper">
                                <UploadImg v-model="formData.idCardFrontUrl" :limit="1"
                                    @change="(val) => !val && (formData.idCard = '')"
                                    :http-request="(options) => handleOcrUpload(options, 2)" />
                                <div class="ocr-tip">身份证正面</div>
                            </div>
                            <div class="ocr-upload-wrapper">
                                <UploadImg v-model="formData.idCardBackUrl" :limit="1"
                                    :http-request="(options) => handleOcrUpload(options, 3)" />
                                <div class="ocr-tip">身份证反面</div>
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 身份证代码 -->
                    <el-form-item v-if="isPersonalFilingType" label="身份证代码" prop="idCard">
                        <div style="display: flex; align-items: center; width: 100%;">
                            <el-input v-model="formData.idCard" placeholder="请填写身份证代码" />
                            <el-tooltip placement="right" effect="light">
                                <template #content>
                                    <div style="line-height: 1.5;">
                                        身份证备案仅用于支持个人开展“合格证开具”的诚信证明<br />
                                        存档，身份信息将加密存储，且仅本人可见（不向消费者公开）
                                    </div>
                                </template>
                                <el-icon class="tooltip-icon">
                                    <WarningFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </el-form-item>

                    <!-- 底部按钮 -->
                    <div class="form-footer">
                        <el-button type="primary" :loading="loading" class="btn-submit"
                            @click="handleSubmit">保存建档</el-button>
                        <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Picture, UploadFilled, WarningFilled } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';
import { UploadImg, UploadImgs } from '@/components/UploadFile';
import AreaCascader from '@/components/AreaCascader/index.vue';
import * as SubjectApi from '@/api/agri/subject/index';
import { useMessage } from '@/hooks/web/useMessage';
import { buildSubjectSubmitPayload, getLastSubmittedSubject, saveLastSubmittedSubject } from './lastSubmitCache';
import { DEFAULT_PRODUCTION_SCALE_UNIT, usePreferredAgriMeasurementUnitOptions } from '@/utils/agriUnit';

import { useDict } from '@/hooks/web/useDict';

const { options: filingTypeOptions } = useDict('agri_filing_type', 'int');
const { options: subjectCategoryOptions } = useDict('agri_subject_category', 'str');

const router = useRouter();
const route = useRoute();
const message = useMessage();
const formRef = ref(null);
const loading = ref(false);
const copyLoading = ref(false);
const areaPath = ref([]);

const id = route.query.id;

const formData = reactive({
    type: undefined,
    name: '',
    category: undefined,
    mainProducts: '',
    provinceCode: '',
    cityCode: '',
    districtCode: '',
    address: '',
    contactName: '',
    contactPhone: '',
    productionScale: '',
    productionScaleUnit: DEFAULT_PRODUCTION_SCALE_UNIT,
    businessLicenseUrl: '',
    socialCreditCode: '',
    idCard: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    qualificationUrls: '',
    introduction: ''
});

const productionScaleUnitRef = computed({
    get: () => formData.productionScaleUnit,
    set: (value) => {
        formData.productionScaleUnit = value || DEFAULT_PRODUCTION_SCALE_UNIT;
    }
});
const productionScaleUnitOptions = usePreferredAgriMeasurementUnitOptions(
    productionScaleUnitRef,
    ['亩', 'mu'],
    DEFAULT_PRODUCTION_SCALE_UNIT,
    computed(() => !id)
);

const PERSONAL_FILING_TYPE = 2;
const isPersonalFilingType = computed(() => Number(formData.type) === PERSONAL_FILING_TYPE);
const isNonPersonalFilingType = computed(() => formData.type !== undefined && !isPersonalFilingType.value);

/**\n * clearPersonalCertificateFields：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const clearPersonalCertificateFields = () => {
    formData.idCard = '';
    formData.idCardFrontUrl = '';
    formData.idCardBackUrl = '';
};

/**\n * clearNonPersonalCertificateFields：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const clearNonPersonalCertificateFields = () => {
    formData.businessLicenseUrl = '';
    formData.socialCreditCode = '';
};

/**
 * 处理建档类型变化
 */
const handleTypeChange = (val) => {
    if (Number(val) === PERSONAL_FILING_TYPE) {
        // 切换为个人，清空企业/机构相关字段
        clearNonPersonalCertificateFields();
    } else {
        // 切换为非个人，清空个人相关字段
        clearPersonalCertificateFields();
    }
};

const formRules = {
    type: [{ required: true, message: '请选择建档类型', trigger: 'change' }],
    name: [{ required: true, message: '请输入主体名称', trigger: 'blur' }],
    contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
};

/**\n * loadDetail：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。\n */
const loadDetail = async () => {
    if (!id) return;
    try {
        const data = await SubjectApi.getSubject(id);
        if (data.qualificationUrls && typeof data.qualificationUrls === 'string') {
            data.qualificationUrls = data.qualificationUrls.split(',').filter(item => item !== '');
        }
        Object.assign(formData, data);
        areaPath.value = [data.provinceCode, data.cityCode, data.districtCode].filter(Boolean);
    } catch (error) {
        console.error('加载主体详情失败', error);
    }
};

onMounted(() => {
    loadDetail();
});

/**\n * handleSubmit：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            if (loading.value) return;
            loading.value = true;
            try {
                const normalizedPayload = buildSubjectSubmitPayload(formData);
                const submitData = {
                    ...normalizedPayload,
                    qualificationUrls: normalizedPayload.qualificationUrls.join(',')
                };

                let result;
                if (id) {
                    await SubjectApi.updateSubject({ ...submitData, id });
                    message.success('更新成功');
                } else {
                    result = await SubjectApi.createSubject(submitData);
                    message.success('创建成功');
                }

                saveLastSubmittedSubject(normalizedPayload);

                const redirect = route.query.redirect;
                if (redirect) {
                    // 如果存在跳转回流地址，则回跳，并尝试带上新创建的主体 ID
                    router.push({
                        path: redirect,
                        query: {
                            ...route.query,
                            newSubjectId: result || id,
                            redirect: undefined // 清除 redirect 标记
                        }
                    });
                } else {
                    router.back();
                }
            } catch (error) {
                console.error(error);
            } finally {
                loading.value = false;
            }
        }
    });
};

/**\n * handleCancel：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCancel = () => {
    router.back();
};

/**\n * handleCopyPrevious：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCopyPrevious = async () => {
    const cachedPayload = getLastSubmittedSubject();
    if (!cachedPayload) {
        message.warning('暂无可复制的上一条主体建档信息');
        return;
    }
    if (!cachedPayload.type || !cachedPayload.name || !cachedPayload.category) {
        message.warning('上一条主体建档信息不完整，无法复制');
        return;
    }
    if (copyLoading.value) return;
    copyLoading.value = true;
    try {
        Object.assign(formData, {
            type: cachedPayload.type,
            name: cachedPayload.name,
            category: cachedPayload.category,
            mainProducts: cachedPayload.mainProducts,
            provinceCode: cachedPayload.provinceCode,
            cityCode: cachedPayload.cityCode,
            districtCode: cachedPayload.districtCode,
            address: cachedPayload.address,
            contactName: cachedPayload.contactName,
            contactPhone: cachedPayload.contactPhone,
            productionScale: cachedPayload.productionScale,
            productionScaleUnit: cachedPayload.productionScaleUnit,
            businessLicenseUrl: cachedPayload.businessLicenseUrl,
            socialCreditCode: cachedPayload.socialCreditCode,
            idCard: cachedPayload.idCard,
            idCardFrontUrl: cachedPayload.idCardFrontUrl,
            idCardBackUrl: cachedPayload.idCardBackUrl,
            qualificationUrls: cachedPayload.qualificationUrls,
            introduction: cachedPayload.introduction
        });
        areaPath.value = [cachedPayload.provinceCode, cachedPayload.cityCode, cachedPayload.districtCode].filter(Boolean);
        message.success('已回显上一条建档信息');
    } catch (error) {
        console.error('回显上一条主体建档信息失败', error);
        message.error('回显上一条失败，请稍后重试');
    } finally {
        copyLoading.value = false;
    }
};

/**
 * OCR 识别上传
 */
const handleOcrUpload = async (options, imageType) => {
    try {
        const data = await SubjectApi.ocrUpload({
            file: options.file,
            imageType: imageType
        });

        // 更新图片预览
        if (imageType === 1) {
            formData.businessLicenseUrl = data.imageUrl;
            if (data.socialCreditCode) {
                formData.socialCreditCode = data.socialCreditCode;
                message.success('已自动识别信用代码');
            }
        } else if (imageType === 2) {
            formData.idCardFrontUrl = data.imageUrl;
            if (data.idCard) {
                formData.idCard = data.idCard;
                message.success('已自动识别身份证号');
            }
        } else if (imageType === 3) {
            formData.idCardBackUrl = data.imageUrl;
            // message.success('上传成功');
        }

        // 返回符合 UploadImg 组件期望的数据结构，确保 v-model 能正常更新
        return { data: data.imageUrl };
    } catch (error) {
        console.error('OCR 识别失败', error);
        message.error('证件识别失败，请检查图片是否清晰');
        throw error;
    }
};

</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0;
    background: transparent;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: var(--page-container-padding);
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.btn-copy-prev {
    min-width: 100px;
    height: 32px;
}

.card-header {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .header-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        display: block;
        text-align: left;
    }

    .dashed-line {
        width: 100%;
        height: 1px;
        background-image: linear-gradient(to right, #ccc 50%, rgba(255, 255, 255, 0) 0%);
        background-position: bottom;
        background-size: 10px 1px;
        background-repeat: repeat-x;
    }
}



.product-form {
    max-width: 600px;
    margin-left: 0;

    :deep(.el-form-item) {
        margin-bottom: 24px;
        display: flex;
        align-items: center;
    }

    :deep(.el-form-item__label) {
        font-weight: 600;
        color: #333;

        &::before {
            margin-right: 4px;
        }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        border-radius: 6px;
        box-shadow: 0 0 0 1px #D1D5DB inset;
        height: 40px;

        &.is-focus {
            box-shadow: 0 0 0 1px #00B3ED inset !important;
        }
    }
}

.full-width {
    width: 100%;
}

.scale-row {
    display: flex;
    gap: 12px;
    width: 100%;
}

.upload-container {
    display: flex;
    align-items: center;
    gap: 20px;
}

.preview-box {
    width: 80px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #E5E7EB;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;

    &.placeholder {
        font-size: 24px;
    }
}

.id-card-boxes {
    display: flex;
    gap: 8px;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text-value {
    color: #333;
    font-size: 14px;
    line-height: 40px;
}

.form-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
}

.btn-submit {
    width: 120px;
    height: 44px;
    background: #00B3ED;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;

    &:hover {
        opacity: 0.8;
    }
}

.btn-cancel {
    width: 120px;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    border: 1px solid #D1D5DB;
}

.upload-demo {
    margin-left: 80px;
}

.ocr-upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .ocr-tip {
        font-size: 12px;
        color: #999;
    }
}

.tooltip-icon {
    margin-left: 10px;
    color: #999;
    cursor: pointer;
    font-size: 18px;
    outline: none;
    flex-shrink: 0;

    &:hover {
        color: #666;
    }
}
</style>
