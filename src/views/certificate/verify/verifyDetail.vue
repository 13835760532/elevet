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
                                        <el-option v-for="unit in AGRI_UNITS" :key="unit.value" :label="unit.label" :value="unit.value" />
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
                            
                            <!-- A. 本平台样式预览 -->
                            <div v-if="formData.source === 1" class="certificate-mock">
                                <div class="cert-code">合格证编号：{{ formData.certificateCode }}</div>
                                <h2 class="cert-title">承诺达标合格证</h2>
                                <div class="cert-body">
                                    <p class="promise">我承诺对生产销售的食用农产品：</p>
                                    <p class="promise-detail">不使用禁限用农药兽药及非法添加物，常规农药兽药残留不超标，对承诺的真实性负责。</p>
                                    
                                    <div class="cert-main">
                                        <div class="left-checks">
                                            <p class="label-item">承诺依据：</p>
                                            <div class="check-list">
                                                <el-checkbox :model-value="true" disabled>质量安全控制符合要求</el-checkbox>
                                                <el-checkbox :model-value="false" disabled>自行检测合格</el-checkbox>
                                                <el-checkbox :model-value="false" disabled>委托检测合格</el-checkbox>
                                            </div>
                                        </div>
                                        <div class="right-qr">
                                            <div class="qr-placeholder">
                                                <Qrcode :text="formData.certificateCode" :width="70" />
                                            </div>
                                        </div>
                                    </div>

                                    <div class="info-table">
                                        <div class="tr">
                                            <div class="td-label">产品名称</div>
                                            <div class="td-value">{{ formData.productName }}</div>
                                        </div>
                                        <div class="tr">
                                            <div class="td-label">重量/数量</div>
                                            <div class="td-value">{{ formData.quantity }}{{ getAgriUnitLabel(formData.unit) }}</div>
                                        </div>
                                        <div class="tr">
                                            <div class="td-label">产地</div>
                                            <div class="td-value">{{ formData.productionArea }}</div>
                                        </div>
                                        <div class="tr">
                                            <div class="td-label">经营主体</div>
                                            <div class="td-value">{{ formData.subjectName }}</div>
                                        </div>
                                        <div class="tr">
                                            <div class="td-label">开具日期</div>
                                            <div class="td-value">{{ formData.issueDate }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
import { reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import { Qrcode } from '@/components/Qrcode';
import { getVerification } from '@/api/agri/certificateVerification/index';
import { dateFormatter } from '@/utils/formatTime';
import { AGRI_UNITS } from '@/utils/constants';
import { getAgriUnitLabel } from '@/utils';

const router = useRouter();
const route = useRoute();

const formData = reactive({
    source: 1,
    productName: '',
    productionArea: '',
    quantity: '',
    unit: 'kg',
    issueDate: '',
    contactName: '',
    contactPhone: '',
    subjectName: '',
    certificateImageUrl: '',
    certificateCode: '',
    verificationTime: ''
});

onMounted(async () => {
    const id = route.query.id;
    if (!id) return;

    const loading = ElLoading.service({ text: '正在加载详情...' });
    try {
        const data = await getVerification(Number(id));
        if (data) {
            // 兼容性映射：后端可能会返回 certificateSource
            const source = data.certificateSource || data.source || 1;
            Object.assign(formData, data, { source });
            
            // 针对三方平台，如果 certificateCode 为空，取 externalCertificateCode
            if (source === 2 && !data.certificateCode) {
                formData.certificateCode = data.externalCertificateCode || '';
            }

            // 格式化查验时间
            if (data.verificationTime) {
                formData.verificationTime = dateFormatter(null, null, data.verificationTime);
            }
        }
    } catch (e) {
        console.error('加载详情失败', e);
    } finally {
        loading.close();
    }
});

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

    /* 合格证快照预览 */
    .certificate-mock {
        padding: 24px;
        max-width: 500px;
        margin: 0 auto;
        
        .cert-code { font-size: 12px; color: #94a3b8; margin-bottom: 16px; }
        .cert-title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 24px; color: #1e293b; }
        
        .cert-body {
            .promise { font-weight: 600; font-size: 14px; margin-bottom: 8px; }
            .promise-detail { font-size: 12px; line-height: 1.6; color: #64748b; margin-bottom: 20px; }
            
            .cert-main {
                display: flex; justify-content: space-between; align-items: flex-end;
                margin-bottom: 24px;
                .label-item { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
                .check-list {
                    display: flex; flex-direction: column; gap: 6px;
                    :deep(.el-checkbox__label) { font-size: 12px; }
                }
            }

            .info-table {
                border: 1px solid #f1f5f9;
                .tr {
                    display: flex; border-bottom: 1px solid #f1f5f9;
                    &:last-child { border-bottom: none; }
                    .td-label { width: 90px; background: #f8fafc; padding: 12px; font-size: 12px; color: #64748b; border-right: 1px solid #f1f5f9; }
                    .td-value { flex: 1; padding: 12px; font-size: 13px; font-weight: 500; color: #1e293b; }
                }
            }
        }
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
