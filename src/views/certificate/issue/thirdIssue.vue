<template>
    <div class="page-container">
        <div class="content-card">
            <!-- 合格证主体展示 -->
            <div class="certificate-document">
                <div class="cert-header">
                    <span class="cert-no-tag">合格证编号－{{ certStore.certificate.certNo }}</span>
                </div>

                <div class="cert-body">
                    <h1 class="cert-title">承诺达标合格证</h1>
                    <h2 class="cert-subtitle">我承诺生产销售的食用农产品</h2>
                    <p class="cert-declaration">
                        未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。
                    </p>

                    <div class="cert-middle-section">
                        <div class="cert-basis">
                            <h3 class="basis-title">承诺依据：</h3>
                            <el-checkbox-group v-model="basis" disabled>
                                <el-checkbox label="quality">质量安全控制符合要求</el-checkbox>
                                <el-checkbox label="self">自行检测合格</el-checkbox>
                                <el-checkbox label="entrust">委托检测合格</el-checkbox>
                            </el-checkbox-group>
                        </div>

                        <div class="qr-code-wrapper">
                            <img :src="certStore.certificate.qrCodeUrl" alt="Certificate QR Code" />
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="info-section">
                        <h3 class="info-title">基本信息</h3>
                        <div class="info-table">
                            <div class="info-row">
                                <div class="label">产品名称</div>
                                <div class="value">{{ certStore.productInfo.productName }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">产品数量</div>
                                <div class="value">{{ certStore.issueInfo.quantity }} {{ getAgriUnitLabel(certStore.issueInfo.unit) }}
                                </div>
                            </div>
                            <div class="info-row">
                                <div class="label">产品产地</div>
                                <div class="value">{{ certStore.productInfo.origin }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">承诺主体</div>
                                <div class="value">{{ certStore.productInfo.entity }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">联系方式</div>
                                <div class="value">-</div>
                            </div>
                            <div class="info-row">
                                <div class="label">开具时间</div>
                                <div class="value">{{ certStore.certificate.issueDate }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="footer-tip">
                        *电子合格证由链安食检数智服务平台承载展示
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

            <!-- 操作按钮（可选：打印/下载） -->
            <div class="action-footer">
                <el-button type="primary" class="print-btn" @click="handlePrint">打印合格证</el-button>
                <el-button class="back-btn" @click="handleBack">返回列表</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { useCertificateStore } from '@/store/modules/certificate';
import { getAgriUnitLabel } from '@/utils/agriUnit';

const router = useRouter();
const certStore = useCertificateStore();

// 承诺依据
const basis = computed(() => certStore.issueInfo.basis);

// 初始化时设置步骤
onMounted(() => {
    certStore.setStep(3);
});

const handlePrint = () => {
    window.print();
};

const handleBack = () => {
    // 重置并返回列表
    certStore.resetAll();
    router.push('/certificate/issue');
};
</script>

<style lang="scss" scoped>
.page-container {
    padding: 40px 24px;
    height: 100%;
    overflow-y: auto;
}

.content-card {
    max-width: 800px;
    margin: 0 auto;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.certificate-document {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 40px;
    border-radius: 4px;
}

.cert-header {
    margin-bottom: 24px;

    .cert-no-tag {
        background: #F0F7FF;
        color: #333;
        padding: 6px 12px;
        font-size: 14px;
        border-radius: 2px;
    }
}

.cert-body {
    text-align: center;
}

.cert-title {
    font-size: 28px;
    font-weight: 800;
    color: #000;
    margin: 0 0 12px 0;
    letter-spacing: 2px;
}

.cert-subtitle {
    font-size: 20px;
    font-weight: 700;
    color: #000;
    margin: 0 0 8px 0;
}

.cert-declaration {
    font-size: 14px;
    color: #333;
    line-height: 1.6;
    margin: 0 auto 24px auto;
    max-width: 500px;
}

.cert-middle-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;
    margin-bottom: 32px;
}

.cert-basis {
    .basis-title {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 12px;
    }

    :deep(.el-checkbox) {
        display: block;
        margin-bottom: 8px;
        height: auto;

        .el-checkbox__label {
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }
    }
}

.qr-code-wrapper {
    width: 100px;
    height: 100px;

    img {
        width: 100%;
        height: 100%;
    }
}

.divider {
    border-top: 1px dashed #D1D5DB;
    margin: 24px 0;
}

.info-section,
.image-section {
    text-align: left;

    .info-title {
        font-size: 18px;
        font-weight: 700;
        color: #000;
        margin-bottom: 16px;
    }
}

.info-table {
    border: 1px solid #EDEDED;

    .info-row {
        display: flex;
        border-bottom: 1px solid #EDEDED;

        &:last-child {
            border-bottom: none;
        }

        .label {
            width: 140px;
            background: #F9FAFB;
            padding: 12px 16px;
            font-size: 14px;
            color: #333;
            font-weight: 600;
            border-right: 1px solid #EDEDED;
        }

        .value {
            flex: 1;
            padding: 12px 16px;
            font-size: 14px;
        }
    }
}

.footer-tip {
    text-align: left;
    font-size: 12px;
    color: #999;
    margin-top: 16px;
}

.image-placeholder {
    width: 100%;
    height: 240px;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    .placeholder-icon {
        font-size: 60px;
        color: #D1D5DB;
    }
}

.action-footer {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    gap: 16px;

    .print-btn {
        width: 160px;
        height: 48px;
        background: #00B3ED;
        border-color: #00B3ED;
        font-weight: 600;
    }

    .back-btn {
        width: 160px;
        height: 48px;
    }
}

@media print {
    .page-container {
        padding: 0;
        overflow: visible;
    }

    .content-card {
        box-shadow: none;
        background: #fff;
        padding: 0;
        max-width: none;
    }

    .action-footer {
        display: none;
    }

    .certificate-document {
        border: none;
        padding: 0;
    }

    /* 打印字体统一放大 1.3 倍 */
    .cert-header .cert-no-tag {
        font-size: 18px;
    }

    .cert-title {
        font-size: 36px;
    }

    .cert-subtitle {
        font-size: 20px;
    }

    .cert-declaration {
        font-size: 18px;
    }

    .cert-basis .basis-title {
        font-size: 20px;
    }

    .cert-basis :deep(.el-checkbox__label) {
        font-size: 18px;
    }

    .info-section .info-title,
    .image-section .info-title {
        font-size: 23px;
    }

    .info-table .info-row .label,
    .info-table .info-row .value {
        font-size: 18px;
    }

    .footer-tip {
        font-size: 16px;
    }

    .qr-code-wrapper {
        width: 132px;
        height: 132px;
    }
}
</style>
