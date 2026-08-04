<template>
    <div class="certificate-print-document">
        <div class="cert-header">
            <span class="cert-no-tag">合格证编号－{{ certificate?.certificateCode || '--' }}</span>
        </div>

        <div class="cert-body">
            <h1 class="cert-title">承诺达标合格证</h1>
            <h2 class="cert-subtitle">承诺事项：</h2>
            <div class="cert-declaration-list">
                <p v-for="(line, idx) in normalizedCommitmentLines" :key="idx" class="declaration-line">
                    • {{ line }}
                </p>
            </div>

            <div class="cert-middle-section">
                <div class="cert-basis">
                    <h3 class="basis-title">承诺依据：</h3>
                    <div class="custom-basis-group">
                        <div v-for="item in basisOptions" :key="item.value" class="basis-item">
                            <span class="basis-box checked">✔</span>
                            <span class="basis-label">
                                {{ item.label }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="qr-code-wrapper">
                    <Qrcode v-if="resolvedQrText" :text="resolvedQrText" :options="{ errorCorrectionLevel: 'L' }"
                        :width="qrWidth" />
                </div>
            </div>

            <div class="divider"></div>

            <div class="info-section">
                <h3 class="info-title">基本信息：</h3>
                <div class="info-table">
                    <div class="info-row">
                        <div class="label">产品名称</div>
                        <div class="value">{{ certificate?.productName || '--' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">数量/重量</div>
                        <div class="value">{{ quantityText }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">产品产地</div>
                        <div class="value">{{ certificate?.productionArea || '--' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">承诺主体</div>
                        <div class="value">{{ certificate?.subjectName || '--' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">联系方式</div>
                        <div class="value">{{ certificate?.contactPhone || '--' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="label">开具时间</div>
                        <div class="value">{{ issueDateText }}</div>
                    </div>
                    <div v-if="printTimeText" class="info-row">
                        <div class="label">打印时间</div>
                        <div class="value">{{ printTimeText }}</div>
                    </div>
                </div>
            </div>

            <div class="divider no-print"></div>
            <div class="image-section no-print print-keep-space">
                <h3 class="info-title">产品图片</h3>
                <div class="image-preview-box" v-if="certificate?.productImageUrl">
                    <img :src="certificate.productImageUrl" class="cert-product-img" alt="产品图片" />
                </div>
                <div v-else class="no-image-text"
                    style="color: #909399; font-size: 14px; text-align: left; padding: 4px 12px;">-</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Picture } from '@element-plus/icons-vue';
import { Qrcode } from '@/components/Qrcode';
import { getAgriUnitLabel } from '@/utils/agriUnit';
import { formatDate } from '@/utils/formatTime';

interface BasisOption {
    indexLabel?: string;
    label: string;
    value: string | number;
}

interface CertificatePrintData {
    id?: string | number;
    certificateCode?: string;
    qrCode?: string;
    productName?: string;
    quantity?: string | number;
    unit?: string | number;
    productionArea?: string;
    subjectName?: string;
    contactPhone?: string;
    createTime?: string | number;
    issueDate?: string;
    productImageUrl?: string;
}

const props = withDefaults(defineProps<{
    certificate?: CertificatePrintData | null;
    basisOptions?: BasisOption[];
    commitmentLines?: string[];
    qrText?: string;
    issueDateText?: string;
    printTimeText?: string;
    qrWidth?: number;
}>(), {
    certificate: null,
    basisOptions: () => [],
    commitmentLines: () => [],
    qrText: '',
    issueDateText: '',
    printTimeText: '',
    qrWidth: 162
});

const normalizedCommitmentLines = computed(() => {
    const lines = props.commitmentLines.map(item => String(item || '').trim()).filter(Boolean);
    return lines.length ? lines : props.basisOptions.map(item => item.label).filter(Boolean);
});

const resolvedQrText = computed(() => props.qrText || props.certificate?.qrCode || props.certificate?.certificateCode || '');

/** 打印联未显式传值时统一使用合格证创建时间，并保留到秒。 */
const issueDateText = computed(() => {
    if (props.issueDateText) return props.issueDateText;
    const value = props.certificate?.createTime;
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
});

const quantityText = computed(() => {
    const quantity = props.certificate?.quantity ?? '--';
    const unit = getAgriUnitLabel(props.certificate?.unit);
    return `${quantity} ${unit}`.trim();
});
</script>

<style lang="scss">
.certificate-print-source {
    position: fixed;
    left: -99999px;
    top: 0;
    width: 520px;
    background: #fff;
    z-index: -1;
}

.certificate-print-document {
    width: 100%;
    margin: 0 auto;
    padding: 24px;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 8px;

    &.print-doc-gap {
        margin-top: 20px;
    }

    &.printing-active {
        width: 520px !important;
        padding: 6px 7px 10px 17px !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        box-sizing: border-box !important;

        &.print-doc-gap {
            margin-top: 20px !important;
        }

        .cert-header {
            margin-top: 0 !important;
            margin-bottom: 12px !important;
            overflow: visible !important;

            .cert-no-tag {
                font-size: 21px !important;
                font-weight: 600 !important;
                line-height: 1.4 !important;
                background: none !important;
                color: #000 !important;
                padding: 0 !important;
            }
        }

        .cert-title {
            font-size: 47px !important;
            margin: 4px 0 !important;
            text-align: center !important;
        }

        .cert-subtitle {
            font-size: 20px !important;
        }

        .cert-declaration-list {
            text-align: left !important;
            margin: 8px 0 !important;

            .declaration-line {
                font-size: 21px !important;
                margin: 4px 0 !important;
                line-height: 1.4 !important;
                font-weight: 600 !important;
                color: #000 !important;
            }
        }

        .info-section {
            margin-top: 0 !important;
            padding-top: 14px !important;
            border-top: 1px dashed #000 !important;

            .info-title {
                font-size: 23px !important;
                margin-bottom: 6px !important;
                padding: 0 !important;
            }
        }

        .info-table {
            border: none !important;

            .info-row {
                border: none !important;
                display: flex !important;

                .label,
                .value {
                    font-size: 23px !important;
                    padding: 4px 0 !important;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #000 !important;
                }

                .label {
                    width: 130px !important;
                }
            }
        }

        .image-section {
            margin-top: 12px !important;
            padding-top: 8px !important;
            border-top: 1px dashed #000 !important;

            .info-title {
                margin-bottom: 6px !important;
            }

            .image-preview-box {
                width: 100% !important;
                background: none !important;
                padding: 0 !important;
                border: none !important;
                display: flex !important;
                justify-content: center !important;

                .cert-product-img {
                    max-width: 380px !important;
                    max-height: 280px !important;
                    width: auto !important;
                    height: auto !important;
                    border-radius: 4px !important;
                    object-fit: contain !important;
                }

                .placeholder-icon {
                    display: none !important;
                }
            }
        }

        .divider {
            display: none !important;
        }

        .cert-middle-section {
            margin: 16px 0 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 18px !important;

            .basis-title {
                font-size: 20px !important;
            }
        }

        .qr-code-wrapper {
            flex: 0 0 190px !important;
            width: 190px !important;
            min-width: 190px !important;
            height: 162px !important;
            margin-top: 14px !important;
            display: flex !important;
            justify-content: flex-end !important;

            canvas,
            img,
            svg {
                width: 162px !important;
                height: 162px !important;
            }
        }

        .custom-basis-group {
            .basis-item {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 8px !important;

                .basis-box {
                    width: 32px !important;
                    height: 32px !important;
                    border: 3px solid #333 !important;
                    margin-right: 16px !important;
                    font-size: 26px !important;
                    line-height: 26px !important;
                    text-align: center !important;
                }

                .basis-label {
                    font-size: 23px !important;
                    color: #000 !important;

                    .basis-index {
                        display: none !important;
                    }
                }
            }
        }
    }

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
        text-align: center;
    }

    .cert-subtitle {
        font-size: 20px;
        font-weight: 700;
    }

    .cert-declaration-list {
        text-align: left;
    }

    .cert-middle-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        text-align: left;
        margin: 32px 0;
    }

    .basis-title {
        margin-bottom: 12px;
    }

    .qr-code-wrapper {
        width: 162px;
        height: 162px;

        img,
        canvas,
        svg {
            width: 100%;
            height: 100%;
        }
    }

    .custom-basis-group {
        .basis-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            .basis-box {
                width: 18px;
                height: 18px;
                border: 1px solid #DCDFE6;
                margin-right: 8px;
                display: inline-block;
                border-radius: 2px;
                text-align: center;
                line-height: 16px;
                font-size: 14px;
                background: #F5F7FA;

                &.checked {
                    background: #fff;
                    border-color: #00B3ED;
                    color: #00B3ED;
                }
            }

            .basis-label {
                font-size: 14px;
                color: #606266;

                .basis-index {
                    margin-right: 4px;
                    color: inherit;
                }
            }
        }
    }

    .info-section,
    .image-section {
        margin-top: 24px;

        .info-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #333;
            text-align: left;
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

    .image-preview-box {
        width: 100%;
        min-height: 180px;
        background: #F3F4F6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        .cert-product-img {
            max-width: 100%;
            max-height: 220px;
            object-fit: contain;
        }

        .placeholder-icon {
            font-size: 48px;
            color: #D1D5DB;
        }
    }
}
</style>
