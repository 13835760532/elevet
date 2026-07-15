<template>
    <div class="certificate-preview-card">
        <div class="certificate-code-strip">
            合格证编号—{{ certificate?.certificateCode || '--' }}
        </div>
        <div class="certificate-paper">
            <h3 class="certificate-title">承诺达标合格证</h3>
            <div class="certificate-promise">
                <div class="promise-copy">
                    <p class="promise-heading">我承诺生产销售的食用农产品</p>
                    <p class="promise-desc">
                        未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。
                    </p>
                    <p class="basis-heading">承诺依据:</p>
                    <div class="certificate-basis-list">
                        <label
                            v-for="opt in basisOptions"
                            :key="opt.value"
                            class="basis-check-item"
                            :class="{ checked: isBasisSelected(opt.value) }"
                        >
                            <span class="basis-box" />
                            <span>{{ opt.label }}</span>
                        </label>
                    </div>
                </div>
                <div class="certificate-qr">
                    <Qrcode
                        v-if="qrText"
                        tag="img"
                        :text="qrText"
                        :options="{ errorCorrectionLevel: 'L', margin: 1 }"
                        :width="112"
                    />
                </div>
            </div>

            <div class="certificate-divider"></div>

            <h4 class="certificate-section-title">基本信息</h4>
            <div class="certificate-info-table">
                <div class="info-line">
                    <span>产品名称</span>
                    <strong>{{ certificate?.productName || '--' }}</strong>
                </div>
                <div class="info-line">
                    <span>产品数量</span>
                    <strong>{{ quantityText }}</strong>
                </div>
                <div class="info-line">
                    <span>产品产地</span>
                    <strong>{{ certificate?.productionArea || '--' }}</strong>
                </div>
                <div class="info-line">
                    <span>承诺主体</span>
                    <strong>{{ certificate?.subjectName || '--' }}</strong>
                </div>
                <div class="info-line">
                    <span>联系方式</span>
                    <strong>{{ certificate?.contactPhone || '--' }}</strong>
                </div>
                <div class="info-line">
                    <span>开具时间</span>
                    <strong>{{ certificate?.issueDate || '--' }}</strong>
                </div>
            </div>

            <p class="certificate-note">{{ note }}</p>

            <div class="certificate-divider image-divider"></div>

            <h4 class="certificate-section-title image-title">产品图片</h4>
            <div class="certificate-product-image" v-if="productImage">
                <img
                    :src="productImage"
                    alt="产品图片"
                />
            </div>
            <div v-else class="no-image-text" style="color: #909399; font-size: 14px; text-align: left; padding: 4px 12px;">无</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Picture } from '@element-plus/icons-vue';
import { Qrcode } from '@/components/Qrcode';
import { getAgriUnitLabel } from '@/utils/agriUnit';

defineOptions({
    name: 'CertificatePreview'
});

interface BasisOption {
    label: string;
    value: number;
}

interface CertificatePreviewData {
    certificateCode?: string;
    qrCode?: string;
    productName?: string;
    quantity?: string | number;
    unit?: string | number;
    productionArea?: string;
    subjectName?: string;
    contactPhone?: string;
    issueDate?: string;
    commitmentBasis?: string | number | Array<string | number>;
    productImageUrl?: string;
    certificateImageUrl?: string;
    imageUrl?: string;
}

const props = withDefaults(defineProps<{
    certificate?: CertificatePreviewData | null;
    basisOptions?: BasisOption[];
    note?: string;
    qrText?: string;
}>(), {
    certificate: null,
    basisOptions: () => [],
    note: '*电子合格证由链安食检数智服务平台承载展示',
    qrText: ''
});

const parseBasisData = (val: CertificatePreviewData['commitmentBasis']) => {
    if (Array.isArray(val)) return val.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    if (typeof val === 'number') return [val];
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item));
            }
        } catch {
            return val
                .split(',')
                .map((item) => Number(item.trim()))
                .filter((item) => Number.isFinite(item));
        }
    }
    return [];
};

const qrText = computed(() => props.qrText || props.certificate?.qrCode || props.certificate?.certificateCode || '');

const productImage = computed(() =>
    props.certificate?.productImageUrl ||
    props.certificate?.certificateImageUrl ||
    props.certificate?.imageUrl ||
    ''
);

const quantityText = computed(() => {
    const quantity = props.certificate?.quantity;
    if (quantity === undefined || quantity === null || quantity === '') return '--';
    return `${quantity}${getAgriUnitLabel(props.certificate?.unit)}`;
});

const isBasisSelected = (val: number) => {
    const selected = parseBasisData(props.certificate?.commitmentBasis);
    return selected.includes(val);
};
</script>

<style scoped lang="scss">
.certificate-preview-card {
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid #e0e5ea;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.certificate-code-strip {
    height: 34px;
    padding: 0 16px;
    overflow: hidden;
    background: #e6f3ff;
    color: #1e293b;
    font-size: 14px;
    font-weight: 800;
    line-height: 34px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.certificate-paper {
    padding: 0 20px 22px;
    color: #151515;
}

.certificate-title {
    margin: 0 0 8px;
    color: #111;
    font-size: 18px;
    font-weight: 900;
    line-height: 30px;
    text-align: center;
}

.certificate-promise {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 112px;
    align-items: start;
    gap: 18px;
}

.promise-copy {
    min-width: 0;
}

.promise-heading {
    margin: 0 0 6px;
    color: #111;
    font-size: 15px;
    font-weight: 900;
    line-height: 20px;
}

.promise-desc {
    margin: 0 0 8px;
    color: #111;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.6;
}

.basis-heading,
.certificate-section-title {
    margin: 0 0 8px;
    color: #111;
    font-size: 15px;
    font-weight: 900;
    line-height: 20px;
}

.certificate-basis-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.basis-check-item {
    display: flex;
    align-items: center;
    gap: 9px;
    color: #4b5563;
    font-size: 13px;
    font-weight: 700;
    line-height: 18px;

    .basis-box {
        width: 15px;
        height: 15px;
        position: relative;
        flex: 0 0 15px;
        border: 1px solid #d9dee5;
        border-radius: 2px;
        background: #fff;
    }

    &.checked {
        color: #1f2937;

        .basis-box {
            border-color: #3d9bff;
            background: #3d9bff;

            &::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 5px;
                width: 4px;
                height: 8px;
                border: solid #fff;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
        }
    }
}

.certificate-qr {
    width: 112px;
    height: 112px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    background: #fff;

    :deep(.v-qrcode),
    :deep(img),
    :deep(canvas) {
        display: block;
        width: 112px !important;
        height: 112px !important;
    }
}

.certificate-divider {
    height: 1px;
    margin: 14px 0 12px;
    background-image: linear-gradient(to right, #d7d7d7 0 52%, transparent 52% 100%);
    background-repeat: repeat-x;
    background-size: 8px 1px;
}

.certificate-info-table {
    border: 1px solid #f0f0f0;

    .info-line {
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        min-height: 34px;
        align-items: center;
        background: #f2f2f2;

        &:nth-child(even) {
            background: #fff;
        }
    }

    span,
    strong {
        min-width: 0;
        padding: 0 14px;
        overflow: hidden;
        color: #111;
        font-size: 13px;
        font-weight: 700;
        line-height: 18px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.certificate-note {
    margin: 16px 0 0;
    color: #666;
    font-size: 12px;
    font-weight: 700;
    line-height: 18px;
}

.image-divider {
    margin-top: 14px;
}

.image-title {
    margin-left: 10px;
}

.certificate-product-image {
    width: 280px;
    height: 138px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0;
    background: #e6e6e6;
    color: #9aa7b2;

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .placeholder-icon {
        font-size: 18px;
    }
}
</style>
