<template>
    <div class="verify-detail-page">
        <!-- 1. 统一头部 -->
        <pageHeader title="查验详情" desc="查看及核对查验存证记录" />

        <!-- 2. 内容容器 -->
        <div class="page-content-card">
            <!-- 详情头部状态信息 (可选) -->
            <div class="detail-header-info">
                <span class="cert-status-tag" :class="formData.source === 1 ? 'local' : 'other'">
                    {{ formData.source === 1 ? '本平台合格证查验' : '三方平台合格证查验' }}
                </span>
                <span class="verify-time">查验时间：{{ formData.verificationTime }}</span>
            </div>

            <div class="main-body">
                <!-- 3. 双栏布局 (表单 + 预览) -->
                <div class="detail-grid">
                    <!-- 左侧表单 (只读) -->
                    <div class="form-container">
                        <h3 class="group-title">核对产品信息</h3>
                        <el-form :model="formData" label-position="top" class="standard-form">
                            <el-form-item label="产品名称">
                                <el-input v-model="formData.productName" disabled />
                            </el-form-item>
                            <el-form-item label="产地信息">
                                <el-input v-model="formData.productionArea" disabled />
                            </el-form-item>
                            <el-form-item label="产品数量">
                                <div class="qty-unit-group">
                                    <el-input v-model="formData.quantity" disabled />
                                    <el-select v-model="formData.unit" disabled style="width: 100px;">
                                        <el-option v-for="unit in measurementUnitOptions" :key="unit.value"
                                            :label="unit.label" :value="unit.value" />
                                    </el-select>
                                </div>
                            </el-form-item>
                            <el-form-item label="开具日期">
                                <el-input v-model="formData.issueDate" disabled />
                            </el-form-item>

                            <h3 class="group-title" style="margin-top: 32px;">主体信息</h3>
                            <el-form-item label="生产经营主体">
                                <el-input v-model="formData.subjectName" disabled />
                            </el-form-item>
                            <el-form-item label="联系人">
                                <el-input v-model="formData.contactName" disabled />
                            </el-form-item>
                            <el-form-item label="联系电话">
                                <el-input v-model="formData.contactPhone" disabled />
                            </el-form-item>
                        </el-form>
                    </div>

                    <!-- 右侧预览 (根据 source 自动切换) -->
                    <div class="preview-container">
                        <div class="preview-card-wrap">
                            <div class="preview-header">
                                {{ formData.source === 1 ? '本平台合格证快照' : '合格证原始照片' }}
                            </div>
                            
                            <!-- A. 本平台合格证公共预览 -->
                            <CertificatePreview
                                v-if="formData.source === 1"
                                class="verify-certificate-preview"
                                :certificate="formData"
                                :basis-options="basisOptions"
                                :qr-text="certificateQrText"
                            />

                            <!-- B. 三方原始照片预览 -->
                            <div v-else class="external-preview-content">
                                <div class="image-preview-side">
                                    <el-image 
                                        v-if="formData.certificateImageUrl"
                                        :src="formData.certificateImageUrl" 
                                        fit="contain" 
                                        class="original-img"
                                        :preview-src-list="[formData.certificateImageUrl]"
                                    />
                                    <div v-else class="img-empty">
                                        <el-icon><Picture /></el-icon>
                                        <span>暂无图片附件</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部操作栏 -->
            <div class="bottom-actions">
                <el-button class="btn-cancel" @click="handleBack">关闭返回</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import { CertificatePreview } from '@/components/CertificatePreview';
import { getVerification } from '@/api/agri/certificateVerification/index';
import { getCertificate } from '@/api/agri/certificate';
import { dateFormatter } from '@/utils/formatTime';
import {
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    usePreferredAgriMeasurementUnitOptions
} from '@/utils/agriUnit';

const router = useRouter();
const route = useRoute();

const formData = reactive({
    source: 1,
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
    commitmentBasis: '',
    productImageUrl: '',
    verificationTime: ''
});

const unitRef = computed({
    get: () => formData.unit,
    set: (value) => {
        formData.unit = value || DEFAULT_AGRI_MEASUREMENT_UNIT;
    }
});
const measurementUnitOptions = usePreferredAgriMeasurementUnitOptions(unitRef, ['千克', 'kg'], DEFAULT_AGRI_MEASUREMENT_UNIT, false);

const basisOptions = [
    { label: '质量安全控制符合要求', value: 1 },
    { label: '自行检测合格', value: 2 },
    { label: '委托检测合格', value: 3 }
];

const certificateQrText = computed(() => formData.qrCode || formData.certificateCode || '');

/**\n * normalizeVerificationData：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const normalizeVerificationData = (data) => {
    const cert = data?.certificate || {};
    const source = data?.certificateSource || data?.source || 1;
    return {
        ...cert,
        ...data,
        source,
        certificateCode: data?.certificateCode || cert.certificateCode || data?.externalCertificateCode || '',
        qrCode: data?.qrCode || cert.qrCode || '',
        commitmentBasis: data?.commitmentBasis || cert.commitmentBasis || '',
        productImageUrl: data?.productImageUrl || cert.productImageUrl || '',
        certificateImageUrl: data?.certificateImageUrl || cert.certificateImageUrl || ''
    };
};

onMounted(async () => {
    const id = route.query.id;
    if (!id) return;

    const loading = ElLoading.service({ text: '正在加载详情...' });
    try {
        const data = await getVerification(Number(id));
        if (data) {
            const normalizedData = normalizeVerificationData(data);
            Object.assign(formData, normalizedData);
            
            // 针对三方平台，如果 certificateCode 为空，取 externalCertificateCode
            if (normalizedData.source === 2 && !normalizedData.certificateCode) {
                formData.certificateCode = data.externalCertificateCode || '';
            }

            // 格式化查验时间
            if (data.verificationTime) {
                formData.verificationTime = dateFormatter(null, null, data.verificationTime);
            }

            // 如果是本平台合格证，还需要调接口获取 commitmentBasis
            if (normalizedData.source === 1) {
                const certId = data.certificateId || data.certificate?.id;
                if (certId) {
                    try {
                        const certDetail = await getCertificate(Number(certId));
                        if (certDetail && certDetail.commitmentBasis) {
                            formData.commitmentBasis = certDetail.commitmentBasis;
                        }
                    } catch (err) {
                        console.error('获取合格证详情失败', err);
                    }
                }
            }
        }
    } catch (e) {
        console.error('加载详情失败', e);
    } finally {
        loading.close();
    }
});

/**\n * handleBack：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleBack = () => {
    router.back();
};
</script>

<script>
export default {
    name: 'CertificateVerifyDetail'
}
</script>

<style lang="scss" scoped>
.verify-detail-page {
    background-color: #f5f7fa;
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;

    .page-content-card {
        flex: 1;
        overflow-y: scroll;
        background: #fff;
        padding: 16px;
        margin-top: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        &::-webkit-scrollbar {
            display: none;
            width: 1px;
        }
    }

    .detail-header-info {
        padding: 16px 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #f1f5f9;
        margin-bottom: 24px;

        .cert-status-tag {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            &.local { background: rgba(0, 179, 237, 0.1); color: #00B3ED; }
            &.other { background: rgba(100, 116, 139, 0.1); color: #64748b; }
        }

        .verify-time { font-size: 13px; color: #94a3b8; }
    }

    .main-body { padding: 0 16px; }

    .detail-grid {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 60px;
        
        .form-container {
            .group-title { font-size: 16px; font-weight: 600; margin-bottom: 24px; color: #1e293b; }
            .standard-form {
                :deep(.el-form-item) { margin-bottom: 20px; }
                :deep(.el-form-item__label) { padding-bottom: 4px; font-weight: 500; font-size: 14px; color: #64748b; }
                :deep(.el-input.is-disabled .el-input__wrapper) { 
                    background-color: #f8fafc; 
                    box-shadow: none; 
                    border: 1px solid #e2e8f0;
                }
                :deep(.el-input__inner) { color: #1e293b !important; }
            }
        }
    }

    .preview-container {
        .preview-card-wrap {
            border: 1px solid #f1f5f9;
            border-radius: 8px;
            overflow: hidden;
            background: #fdfdfd;

            .preview-header {
                background: #f1f5f9;
                padding: 12px;
                text-align: center;
                font-weight: 600;
                font-size: 15px;
            }
        }
    }

    .verify-certificate-preview {
        width: 470px;
        max-width: calc(100% - 48px);
        margin: 0 auto;
    }

    /* 三方预览样式 */
    .external-preview-content {
        min-height: 550px;
        .image-preview-side {
            display: flex; flex-direction: column; align-items: center; padding: 20px;
            .original-img { max-width: 400px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .img-empty { display: flex; flex-direction: column; align-items: center; color: #cbd5e1; gap: 12px; padding: 100px 0; }
        }
    }

    .bottom-actions {
        margin-top: 40px; padding: 24px 0; border-top: 1px solid #f1f5f9;
        display: flex; justify-content: center;
        .btn-cancel { width: 140px; height: 42px; border-radius: 21px; }
    }

    .qty-unit-group { display: flex; gap: 8px; }
}
</style>
