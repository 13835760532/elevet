<template>
    <div class="verify-detail-page">
        <div class="page-content-card">
            <div v-if="!isEdit" class="source-tabs">
                <button
                    type="button"
                    class="source-tab"
                    :class="{ 'is-active': activeTab === 'internal' }"
                    @click="activeTab = 'internal'"
                >
                    待收合格证来源本平台开具
                </button>
                <button
                    type="button"
                    class="source-tab"
                    :class="{ 'is-active': activeTab === 'external' }"
                    @click="activeTab = 'external'"
                >
                    待收合格证来源其他平台开具
                </button>
            </div>

            <div class="main-body">
                <div class="upload-section">
                    <h2 class="upload-title">上传合格证照片</h2>
                    <div class="upload-row">
                        <div class="prototype-uploader-wrap upload-drag-box">
                            <el-upload
                                ref="uploadRef"
                                class="prototype-uploader"
                                drag
                                action="#"
                                :auto-upload="false"
                                :show-file-list="false"
                                accept=".jpg,.jpeg,.png,.webp,.rar,.zip"
                                multiple
                                @change="onFileChange"
                            >
                                <div class="uploader-content">
                                    <el-icon class="folder-icon">
                                        <FolderOpened />
                                    </el-icon>
                                    <div class="upload-text">
                                        <span class="upload-main-title">点击或将图片拖拽到这里上传</span>
                                        <p class="upload-tips">
                                            按住Ctrl可同时多选，支持上传rar/zip格式文件，单个文件不能超过500kb<br>
                                            严禁上传包含色情、暴力、反动等相关违法信息的文件。
                                        </p>
                                    </div>
                                </div>
                            </el-upload>
                        </div>
                        <el-button type="primary" class="upload-action-btn" @click="triggerUpload">
                            上传合格证照片
                        </el-button>
                    </div>
                </div>

                <div class="top-flow-divider">
                    <span class="flow-arrow" />
                </div>

                <div class="detail-flow-grid">
                    <div class="form-container sample-panel">
                        <h3 class="panel-title">样品信息预览</h3>
                        <el-form :model="formData" label-position="top" class="standard-form">
                            <el-form-item label="产品名称">
                                <el-input v-model="formData.productName" placeholder="白菜" />
                            </el-form-item>

                            <el-form-item label="产品产地">
                                <el-input v-model="formData.productionArea" placeholder="山东--济南" />
                            </el-form-item>

                            <el-row :gutter="16">
                                <el-col :span="14">
                                    <el-form-item label="重量/数量">
                                        <el-input v-model="formData.quantity" placeholder="10" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">
                                    <el-form-item label="单位">
                                        <el-select v-model="formData.unit" placeholder="选择计量单位">
                                            <el-option v-for="unit in measurementUnitOptions" :key="unit.value"
                                                :label="unit.label" :value="unit.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item label="建档日期">
                                <el-date-picker
                                    v-model="formData.issueDate"
                                    type="date"
                                    placeholder="2025-12-19"
                                    class="w-full"
                                    value-format="YYYY-MM-DD"
                                />
                            </el-form-item>

                            <el-form-item label="联系人">
                                <el-input v-model="formData.contactName" placeholder="输入联系人" />
                            </el-form-item>

                            <el-form-item label="联系人">
                                <el-input v-model="formData.contactPhone" placeholder="输入联系电话" />
                            </el-form-item>

                            <el-form-item label="生产经营企业（主体名称）">
                                <el-input v-model="formData.subjectName" placeholder="北京朝阳本来生活大悦城分店" />
                            </el-form-item>
                        </el-form>
                    </div>

                    <div class="side-flow-divider">
                        <span class="right-flow-arrow" />
                    </div>

                    <div class="preview-container cert-preview-panel">
                        <div class="preview-card-wrap">
                            <div class="preview-header">合格证预览</div>
                            <div class="cert-code-strip">合格证编号—{{ formData.certificateCode || 'HGZ9191991111' }}</div>
                            <div class="certificate-mock">
                                <div class="certificate-paper">
                                    <h4 class="cert-title">承诺达标合格证</h4>
                                    <div class="promise-grid">
                                        <div class="promise-copy">
                                            <p class="promise-heading">我承诺生产销售的食用农产品</p>
                                            <p class="promise-desc">
                                                未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。
                                            </p>
                                            <p class="basis-title">承诺依据:</p>
                                            <div class="basis-list">
                                                <el-checkbox label="质量安全控制符合要求" :model-value="basisList.includes(1)" disabled />
                                                <el-checkbox label="自行检测合格" :model-value="basisList.includes(2)" disabled />
                                                <el-checkbox label="委托检测合格" :model-value="basisList.includes(3)" disabled />
                                            </div>
                                        </div>
                                        <div class="qr-code-mock">
                                            <Qrcode
                                                tag="img"
                                                :text="qrCodeText"
                                                :options="{ errorCorrectionLevel: 'L', margin: 1 }"
                                                :width="108"
                                            />
                                        </div>
                                    </div>

                                    <div class="cert-divider"></div>

                                    <h5 class="cert-section-title">基本信息</h5>
                                    <div class="cert-info-table">
                                        <div class="info-row">
                                            <span>产品名称</span>
                                            <strong>{{ formData.productName || '' }}</strong>
                                        </div>
                                        <div class="info-row">
                                            <span>产品数量</span>
                                            <strong>{{ formData.quantity || '' }}{{ formData.quantity ? getAgriUnitLabel(formData.unit) : '' }}</strong>
                                        </div>
                                        <div class="info-row">
                                            <span>产品产地</span>
                                            <strong>{{ formData.productionArea || '' }}</strong>
                                        </div>
                                        <div class="info-row">
                                            <span>承诺主体</span>
                                            <strong>{{ formData.subjectName || '' }}</strong>
                                        </div>
                                        <div class="info-row">
                                            <span>联系方式</span>
                                            <strong>{{ formData.contactPhone || '' }}</strong>
                                        </div>
                                        <div class="info-row">
                                            <span>开具时间</span>
                                            <strong>{{ formData.issueDate || '' }}</strong>
                                        </div>
                                    </div>

                                    <p class="cert-note">*电子合格证由壹拾智检数智服务平台承载展示</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 底部固定操作栏 -->
            <div class="bottom-actions">
                <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                <el-button type="primary" class="btn-save" @click="handleSubmit">存证</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FolderOpened } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import { Qrcode } from '@/components/Qrcode';
import { parseImage, createArchive, getVerification, updateCertificateVerification } from '@/api/agri/certificateVerification/index';
import {
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    getAgriUnitLabel,
    usePreferredAgriMeasurementUnitOptions
} from '@/utils/agriUnit';

const router = useRouter();
const route = useRoute();
const activeTab = ref('internal');
const isEdit = ref(!!route.query.id);
const uploadRef = ref(null);

const formData = reactive({
    productName: '',
    productionArea: '',
    quantity: '',
    unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
    issueDate: '',
    contactName: '',
    contactPhone: '',
    subjectName: '',
    certificateImageUrl: '',
    certificateCode: '',
    qrCode: '',
    productCategory: '',
    subjectId: null,
    certificateType: null,
    source: 1,
    commitmentBasis: ''
});

const unitRef = computed({
    get: () => formData.unit,
    set: (value) => {
        formData.unit = value || DEFAULT_AGRI_MEASUREMENT_UNIT;
    }
});
const measurementUnitOptions = usePreferredAgriMeasurementUnitOptions(
    unitRef,
    ['千克', 'kg'],
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    computed(() => !isEdit.value)
);

const qrCodeText = computed(() => String(formData.qrCode || formData.certificateCode || 'HGZ9191991111'));

const basisList = computed(() => {
    try {
        if (!formData.commitmentBasis) return [];
        if (typeof formData.commitmentBasis === 'string') {
            if (formData.commitmentBasis.startsWith('[')) {
                return JSON.parse(formData.commitmentBasis).map(Number);
            }
            return formData.commitmentBasis.split(',').map(Number);
        }
        if (Array.isArray(formData.commitmentBasis)) {
            return formData.commitmentBasis.map(Number);
        }
    } catch (e) {
        console.error('解析承诺依据失败', e);
    }
    return [];
});

const getUploadInput = () => {
    const uploadEl = uploadRef.value?.$el || uploadRef.value;
    return uploadEl?.querySelector?.('input[type="file"]');
};

const resetUploadSelection = () => {
    uploadRef.value?.clearFiles?.();
    const inputEl = getUploadInput();
    if (inputEl) inputEl.value = '';
};

const triggerUpload = () => {
    resetUploadSelection();
    const inputEl = getUploadInput();
    inputEl?.click();
};

const onFileChange = async (uploadFile) => {
    const loading = ElLoading.service({
        target: '.upload-drag-box',
        text: '正在智能识别合格证...',
        background: 'rgba(255, 255, 255, 0.7)'
    });

    try {
        const sourceHint = activeTab.value === 'internal' ? 1 : 2;
        const data = await parseImage({
            file: uploadFile.raw,
            sourceHint
        });
        if (data && !data.matched) {
            ElMessage.warning(data.message || '未能识别到匹配的信息，请手动补全');
        } else {
            ElMessage.success(data.message || '识别成功');
        }

        formData.certificateImageUrl = data.certificateImageUrl;
        formData.source = data.source;
        activeTab.value = data.source === 1 ? 'internal' : 'external';

        if (data.source === 1 && data.certificate) {
            const cert = data.certificate;
            formData.productName = cert.productName;
            formData.productCategory = cert.productCategory;
            formData.productionArea = cert.productionArea;
            formData.quantity = cert.quantity;
            formData.unit = cert.unit || DEFAULT_AGRI_MEASUREMENT_UNIT;
            formData.issueDate = cert.issueDate;
            formData.contactName = cert.contactName;
            formData.contactPhone = cert.contactPhone;
            formData.subjectName = cert.subjectName;
            formData.subjectId = cert.subjectId;
            formData.certificateCode = cert.certificateCode;
            formData.qrCode = cert.qrCode || data.qrCode || cert.certificateCode || '';
            formData.certificateType = cert.certificateType;
            formData.commitmentBasis = cert.commitmentBasis || '';
        } else if (data.source === 2 && data.ocrData) {
            const ocr = data.ocrData;
            formData.productName = ocr.productName || '';
            formData.productCategory = ocr.productCategory || '';
            formData.productionArea = ocr.productionArea || '';
            formData.quantity = ocr.quantity || '';
            formData.unit = ocr.unit || DEFAULT_AGRI_MEASUREMENT_UNIT;
            formData.issueDate = ocr.issueDate || '';
            formData.contactName = ocr.contactName || '';
            formData.contactPhone = ocr.contactPhone || '';
            formData.subjectName = ocr.subjectName || '';
            formData.certificateCode = ocr.certificateCode || '';
            formData.qrCode = ocr.qrCode || data.qrCode || ocr.certificateCode || '';
            formData.certificateType = ocr.certificateType;
            formData.commitmentBasis = ocr.commitmentBasis || '';
        }

    } catch (e) {
        console.error('识别失败', e);
        // 如果后端传回了 msg，则显示该错误，否则显示通用提示
        ElMessage.error(e.msg || e.message || '识别服务异常，请手动填写');
    } finally {
        loading.close();
        resetUploadSelection();
    }
};

const handleCancel = () => {
    router.back();
};

onMounted(async () => {
    if (isEdit.value) {
        try {
            const data = await getVerification(Number(route.query.id));
            console.log(data)
            if (data) {
                Object.assign(formData, data);
                formData.source = data.certificateSource;
                activeTab.value = data.certificateSource === 1 ? 'internal' : 'external';
            }
        } catch (e) {
            console.error('加载详情失败', e);
        }
    }
});

const handleSubmit = async () => {
    if (!formData.certificateImageUrl) {
        ElMessage.warning('请先上传并识别合格证照片');
        return;
    }

    // 使用全量合并，保留详情接口返回的所有原始字段，并覆盖修改后的值
    const submitData = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        source: formData.source,
        certificateSource: formData.source, // 兼容某些接口可能使用的字段名
        certificateType: formData.certificateType || 1,
        remark: formData.remark || (isEdit.value ? '后台修改存证' : '后台录入存证')
    };

    // 按 source 映射对应编号字段
    if (formData.source === 1) {
        submitData.certificateCode = formData.certificateCode;
    } else {
        submitData.externalCertificateCode = formData.certificateCode;
    }

    if (isEdit.value) {
        submitData.id = Number(route.query.id);
    }

    const loading = ElLoading.service({ text: isEdit.value ? '正在更新记录...' : '正在提交存证记录...' });
    try {
        if (isEdit.value) {
            await updateCertificateVerification(submitData);
            ElMessage.success('存证记录已更新');
        } else {
            await createArchive(submitData);
            ElMessage.success('存证记录已成功保存');
        }
        router.push('/certificate/verify');
    } catch (e) {
        console.error('提交失败', e);
    } finally {
        loading.close();
    }
};
</script>

<style lang="scss" scoped>
.verify-detail-page {
    --verify-primary: #00B3ED;
    --verify-primary-dark: #009fd2;
    --verify-text: #17212b;
    --verify-muted: #7e8b96;
    --verify-border: #dce5ec;
    --verify-panel: #ffffff;
    --verify-soft: #f4f8fb;
    --verify-head: #f1f4f7;
    --verify-flow: rgba(124, 148, 160, 0.55);
    --verify-left-column: 520px;
    --verify-flow-column: 64px;

    min-height: calc(100vh - 86px);
    background: var(--verify-soft);
    color: var(--verify-text);
    font-family: inherit;

    .page-content-card {
        min-height: calc(100vh - 118px);
        margin: 16px 22px;
        padding-bottom: 30px;
        overflow-x: hidden;
        overflow-y: auto;
        background:
            linear-gradient(180deg, rgba(0, 179, 237, 0.035) 0, rgba(255, 255, 255, 0) 230px),
            #fff;
        border-top: 3px solid var(--verify-primary);
        border-radius: 4px;
        box-shadow: 0 10px 26px rgba(23, 63, 80, 0.05);

        &::-webkit-scrollbar {
            display: none;
            width: 0;
        }
    }

    .source-tabs {
        display: flex;
        align-items: flex-start;
        gap: 52px;
        max-width: 1368px;
        margin: 0 auto;
        padding: 24px 42px 0;
    }

    .source-tab {
        position: relative;
        height: 34px;
        padding: 0 0 12px;
        border: 0;
        background: transparent;
        color: #1d2a34;
        font-size: 15px;
        font-weight: 700;
        line-height: 22px;
        letter-spacing: 0;
        cursor: pointer;
        transition: color 0.18s ease;

        &:hover,
        &.is-active {
            color: #071d26;
        }

        &.is-active::after {
            content: '';
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            height: 3px;
            border-radius: 3px;
            background: var(--verify-primary);
        }
    }

    .main-body {
        max-width: 1368px;
        margin: 0 auto;
    }

    .upload-section {
        padding: 24px 42px 0;

        .upload-title {
            margin: 0 0 14px;
            color: #152734;
            font-size: 16px;
            font-weight: 700;
            line-height: 22px;
            letter-spacing: 0;
        }

        .upload-row {
            display: grid;
            grid-template-columns: minmax(420px, 620px) 136px;
            align-items: center;
            gap: 48px;
        }

        .prototype-uploader-wrap {
            width: 100%;
            min-width: 0;

            :deep(.el-upload) {
                width: 100%;
            }

            :deep(.el-upload-dragger) {
                width: 100%;
                height: 156px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                border: 1px dashed rgba(0, 179, 237, 0.38);
                border-radius: 5px;
                background: rgba(255, 255, 255, 0.92);
                box-shadow: none;
                transition: border-color 0.18s ease, background-color 0.18s ease;

                &:hover {
                    border-color: var(--verify-primary);
                    background: #fbfdff;
                }
            }

            .uploader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .folder-icon {
                margin-bottom: 14px;
                color: #168ff1;
                font-size: 42px;
                line-height: 1;
            }

            .upload-text {
                text-align: center;
            }

            .upload-main-title {
                display: block;
                color: #1a2b36;
                font-size: 14px;
                font-weight: 700;
                line-height: 20px;
            }

            .upload-tips {
                margin: 9px 0 0;
                color: #8b98a2;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.55;
            }
        }

        .upload-action-btn {
            width: 136px;
            height: 42px;
            padding: 0;
            border: 0;
            border-radius: 5px;
            background: var(--verify-primary);
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 0;
            box-shadow: 0 8px 18px rgba(0, 179, 237, 0.18);

            &:hover,
            &:focus {
                background: var(--verify-primary-dark);
                color: #fff;
            }
        }
    }

    .top-flow-divider {
        position: relative;
        height: 64px;
        margin: 12px 42px 0;
        overflow: visible;

        &::before {
            content: '';
            position: absolute;
            top: 31px;
            right: 0;
            left: 0;
            height: 1px;
            background-image: linear-gradient(to right, var(--verify-flow) 0 52%, transparent 52% 100%);
            background-repeat: repeat-x;
            background-size: 12px 1px;
            animation: verifyDashFlowX 1.15s linear infinite;
        }

        .flow-arrow {
            position: absolute;
            top: 4px;
            left: calc(var(--verify-left-column) + (var(--verify-flow-column) / 2));
            z-index: 1;
            width: 48px;
            height: 56px;
            background: url("data:image/svg+xml,%3Csvg width='48' height='56' viewBox='0 0 48 56' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 3H31V32H45L24 53L3 32H17V3Z' fill='white' stroke='%23A8B6C0' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
            transform: translateX(-50%);
            animation: verifyDownArrowFlow 1.8s ease-in-out infinite;
        }
    }

    .detail-flow-grid {
        display: grid;
        grid-template-columns: minmax(390px, var(--verify-left-column)) var(--verify-flow-column) minmax(560px, 1fr);
        align-items: stretch;
        gap: 0;
        padding: 0 42px;
    }

    .sample-panel,
    .cert-preview-panel {
        min-width: 0;
        background: var(--verify-panel);
        border: 1px solid var(--verify-border);
        border-radius: 4px;
        box-shadow: 0 12px 24px rgba(20, 60, 78, 0.045);
    }

    .panel-title,
    .preview-header {
        height: 40px;
        margin: 0;
        padding: 0 20px;
        background: var(--verify-head);
        border-bottom: 1px solid #e1e8ee;
        color: #142633;
        font-size: 16px;
        font-weight: 800;
        line-height: 40px;
        letter-spacing: 0;
    }

    .preview-header {
        text-align: center;
    }

    .sample-panel {
        .standard-form {
            padding: 24px 38px 34px;

            :deep(.el-form-item) {
                margin-bottom: 22px;
            }

            :deep(.el-form-item__label) {
                margin-bottom: 8px;
                padding: 0;
                color: #182935;
                font-size: 14px;
                font-weight: 700;
                line-height: 20px;
            }

            :deep(.el-input),
            :deep(.el-select),
            :deep(.el-date-editor.el-input) {
                width: 100%;
            }

            :deep(.el-input__wrapper),
            :deep(.el-select__wrapper) {
                min-height: 44px;
                border-radius: 4px;
                background: #fff;
                box-shadow: 0 0 0 1px var(--verify-border) inset;
                transition: box-shadow 0.18s ease, background-color 0.18s ease;

                &:hover {
                    box-shadow: 0 0 0 1px rgba(0, 179, 237, 0.52) inset;
                }

                &.is-focus,
                &.is-focused {
                    box-shadow: 0 0 0 1px var(--verify-primary) inset;
                }
            }

            :deep(.el-input__inner),
            :deep(.el-select__placeholder),
            :deep(.el-select__selected-item) {
                color: #1f2d38;
                font-size: 13px;
                font-weight: 500;
            }

            :deep(.el-input__inner::placeholder) {
                color: #9aa6af;
            }
        }
    }

    .side-flow-divider {
        position: relative;
        min-height: 100%;
        overflow: visible;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 1px;
            background-image: linear-gradient(to bottom, var(--verify-flow) 0 52%, transparent 52% 100%);
            background-repeat: repeat-y;
            background-size: 1px 12px;
            transform: translateX(-50%);
            animation: verifyDashFlowY 1.15s linear infinite;
        }

        .right-flow-arrow {
            position: absolute;
            top: 48%;
            left: 50%;
            z-index: 2;
            display: block;
            width: 60px;
            height: 40px;
            background: url("data:image/svg+xml,%3Csvg width='60' height='40' viewBox='0 0 60 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 13H36V2L58 20L36 38V27H2V13Z' fill='white' stroke='%23A8B6C0' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
            transform: translate(-50%, -50%);
            animation: verifyRightArrowFlow 1.8s ease-in-out infinite;
        }
    }

    .preview-container {
        min-width: 0;

        .preview-card-wrap {
            min-height: 100%;
            overflow: visible;
            background: #fff;
            border: 0;
            border-radius: 4px;
        }
    }

    .cert-code-strip {
        height: 34px;
        padding: 0 22px;
        background: #e5f5fe;
        color: #1d2e38;
        font-size: 13px;
        font-weight: 500;
        line-height: 34px;
    }

    .certificate-mock {
        padding: 28px 32px 34px;
        color: #111;
    }

    .certificate-paper {
        min-width: 0;
        max-width: 690px;
        margin: 0 auto;
        padding: 28px 36px 24px;
        border: 1px solid #e3e9ee;
        background: #fff;
    }

    .cert-title {
        margin: 0 0 22px;
        color: #111;
        font-size: 18px;
        font-weight: 800;
        line-height: 24px;
        text-align: center;
    }

    .promise-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 108px;
        align-items: start;
        gap: 24px;
    }

    .promise-heading {
        margin: 0 0 8px;
        color: #111;
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
    }

    .promise-desc {
        margin: 0 0 12px;
        color: #111;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.65;
    }

    .basis-title,
    .cert-section-title {
        margin: 0 0 10px;
        color: #111;
        font-size: 14px;
        font-weight: 800;
        line-height: 20px;
    }

    .basis-list {
        display: flex;
        flex-direction: column;
        gap: 6px;

        :deep(.el-checkbox) {
            height: 18px;
            margin-right: 0;
        }

        :deep(.el-checkbox__inner) {
            border-radius: 4px !important;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner),
        :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner) {
            background-color: #00B3ED !important;
            border-color: #00B3ED !important;
        }

        :deep(.el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after) {
            border-color: #fff !important;
        }

        :deep(.el-checkbox__input.is-disabled .el-checkbox__inner) {
            border-color: #d7dfe6;
            background-color: #fff;
        }

        :deep(.el-checkbox__input.is-disabled + span.el-checkbox__label) {
            color: #111;
        }

        :deep(.el-checkbox__label) {
            padding-left: 8px;
            color: #111;
            font-size: 13px;
            font-weight: 500;
            line-height: 18px;
        }
    }

    .qr-code-mock {
        width: 108px;
        height: 108px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;

        :deep(.v-qrcode),
        :deep(img),
        :deep(canvas) {
            display: block;
            width: 108px !important;
            height: 108px !important;
        }
    }

    .cert-divider {
        height: 1px;
        margin: 20px 0 16px;
        background-image: linear-gradient(to right, #cfd8df 0 52%, transparent 52% 100%);
        background-repeat: repeat-x;
        background-size: 10px 1px;
    }

    .cert-info-table {
        overflow: hidden;
        border: 1px solid #e3e7ea;

        .info-row {
            display: grid;
            grid-template-columns: 112px minmax(0, 1fr);
            min-height: 34px;
            align-items: center;
            background: #f7f8f9;
        }

        .info-row:nth-child(odd) {
            background: #edf0f2;
        }

        span,
        strong {
            min-width: 0;
            padding: 0 16px;
            overflow: hidden;
            color: #111;
            font-size: 13px;
            font-weight: 500;
            line-height: 18px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .cert-note {
        margin: 14px 0 0;
        color: #4d5962;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
    }

    .bottom-actions {
        display: flex;
        justify-content: center;
        gap: 16px;
        max-width: 1368px;
        margin: 30px auto 0;
        padding: 0 42px;

        .btn-cancel,
        .btn-save {
            width: 140px;
            height: 44px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
        }

        .btn-cancel {
            border-color: #cfd8df;
            background: #fff;
            color: #7c8790;
        }

        .btn-save {
            border-color: var(--verify-primary);
            background: var(--verify-primary);
            color: #fff;

            &:hover,
            &:focus {
                border-color: var(--verify-primary-dark);
                background: var(--verify-primary-dark);
            }
        }
    }
}

@keyframes verifyDashFlowX {
    from {
        background-position-x: 0;
    }

    to {
        background-position-x: 12px;
    }
}

@keyframes verifyDashFlowY {
    from {
        background-position-y: 0;
    }

    to {
        background-position-y: 12px;
    }
}

@keyframes verifyDownArrowFlow {
    0%,
    100% {
        transform: translate(-50%, -3px);
        opacity: 0.58;
    }

    50% {
        transform: translate(-50%, 5px);
        opacity: 1;
    }
}

@keyframes verifyRightArrowFlow {
    0%,
    100% {
        transform: translate(calc(-50% - 4px), -50%);
        opacity: 0.58;
    }

    50% {
        transform: translate(calc(-50% + 6px), -50%);
        opacity: 1;
    }
}

@media (max-width: 1280px) {
    .verify-detail-page {
        --verify-left-column: 470px;
        --verify-flow-column: 56px;

        .source-tabs,
        .upload-section,
        .detail-flow-grid,
        .bottom-actions {
            padding-right: 32px;
            padding-left: 32px;
        }

        .top-flow-divider {
            margin-right: 32px;
            margin-left: 32px;
        }

        .detail-flow-grid {
            grid-template-columns: minmax(360px, var(--verify-left-column)) var(--verify-flow-column) minmax(500px, 1fr);
        }

        .certificate-paper {
            padding-right: 28px;
            padding-left: 28px;
        }
    }
}

@media (max-width: 1080px) {
    .verify-detail-page {
        .upload-row {
            grid-template-columns: 1fr;
            align-items: start;
            gap: 16px;
        }

        .detail-flow-grid {
            grid-template-columns: 1fr;
        }

        .top-flow-divider {
            .flow-arrow {
                left: 50%;
            }
        }

        .side-flow-divider {
            height: 62px;
            min-height: 62px;

            &::before {
                top: 31px;
                right: 0;
                bottom: auto;
                left: 0;
                width: 100%;
                height: 1px;
                background-image: linear-gradient(to right, var(--verify-flow) 0 52%, transparent 52% 100%);
                background-size: 12px 1px;
                transform: none;
                animation: verifyDashFlowX 1.15s linear infinite;
            }

            .right-flow-arrow {
                top: 50%;
                left: 50%;
                width: 48px;
                height: 56px;
                background-image: url("data:image/svg+xml,%3Csvg width='48' height='56' viewBox='0 0 48 56' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M17 3H31V32H45L24 53L3 32H17V3Z' fill='white' stroke='%23A8B6C0' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E");
                transform: translate(-50%, -50%);
                animation: none;
            }
        }
    }
}
</style>
