<template>
    <div class="page-container">
        <pageHeader title="合格证详情" desc="显示合格证开具时信息" />
        <!-- 详情卡片容器 -->
        <div class="detail-content">
            <!-- 农产品合格证信息 -->
            <div class="info-card" :class="{ 'no-print-section': !isSelected1 }">
                <div class="card-title-row no-print">
                    <h2 class="card-inner-title">农产品合格证信息</h2>
                    <el-checkbox v-model="isSelected1" @change="handleSelect1">打印此联</el-checkbox>
                </div>

                <!-- 作废状态横幅：作废后只读查看，不可恢复 -->
                <div v-if="certificate?.status === 2" class="void-banner no-print">
                    <el-icon class="void-icon">
                        <WarningFilled />
                    </el-icon>
                    <div class="void-info">
                        <span class="void-label">该合格证已作废，不可恢复</span>
                        <span v-if="certificate?.voidReason" class="void-reason">
                            作废原因：{{ certificate.voidReason }}
                        </span>
                    </div>
                </div>

                <div class="certificate-preview-section" v-loading="loading">
                    <CertificatePreview
                        class="detail-certificate-preview"
                        :certificate="certificate"
                        :basis-options="basisOptions"
                        :qr-text="getCertificateQrText(certificate)"
                    />
                    <div class="reports-link detail-report-link">
                        检测报告 <el-button link type="primary" @click="handlePreview">预览</el-button>
                    </div>
                </div>
            </div>

            <!-- 已关联的上游合格证 -->
            <div class="info-card mt-20" v-if="hasUpstreamCertificate"
                :class="{ 'no-print-section': !isSelected2 }">
                <div class="card-title-row no-print">
                    <h2 class="card-inner-title">已关联的上游合格证</h2>
                    <el-checkbox v-model="isSelected2" v-if="canPrintUpstream"
                        @change="handleSelect2">打印此联</el-checkbox>
                </div>

                <!-- 1. 本平台来源：展示票据详情 -->
                <div class="certificate-preview-section" v-if="canPrintUpstream">
                    <CertificatePreview
                        class="detail-certificate-preview"
                        :certificate="upstreamCertificate"
                        :basis-options="basisOptions"
                        :qr-text="getCertificateQrText(upstreamCertificate)"
                    />
                    <div class="reports-link detail-report-link">
                        检测报告 <el-button link type="primary" @click="handlePreview()">预览</el-button>
                    </div>
                </div>

                <!-- 2. 其他平台来源：展示原件照片 -->
                <div v-else-if="isOtherPlatformUpstream && upstreamCertificateImageUrl"
                    class="other-upstream-snapshot">
                    <div class="snapshot-header">
                        <div class="header-left">
                            <el-icon>
                                <Picture />
                            </el-icon>
                            <span>其他平台合格证照片</span>
                        </div>
                    </div>
                    <div class="snapshot-body">
                        <el-image :src="upstreamCertificateImageUrl" fit="contain" class="upstream-full-img"
                            :preview-src-list="[upstreamCertificateImageUrl]" />
                    </div>
                </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="footer-actions no-print">
                <el-button type="primary" class="print-btn" :loading="captureLoading"
                    @click="handlePreview">打印预览</el-button>
                <el-button class="close-btn" @click="() => $router.back()">返回</el-button>
            </div>
        </div>

        <div ref="printAreaRef" class="certificate-print-source">
            <CertificatePrintTemplate
                v-if="isSelected1"
                :certificate="certificate"
                :basis-options="selectedCommitmentBasisOptions"
                :commitment-lines="primaryCommitmentLines"
                :qr-text="certificate?.certificateCode || ''"
                :issue-date-text="formatPrintDate(certificate?.issueDate)"
                :print-time-text="printTimeText"
            />

            <!-- 仅在本平台来源且勾选时显示打印联 -->
            <CertificatePrintTemplate
                v-if="isSelected2 && canPrintUpstream"
                class="print-doc-gap"
                :certificate="upstreamCertificate"
                :basis-options="selectedUpstreamBasisOptions"
                :commitment-lines="upstreamCommitmentLines"
                :qr-text="upstreamCertificate?.certificateCode || ''"
                :issue-date-text="formatPrintDate(upstreamCertificate?.issueDate)"
                :print-time-text="printTimeText"
            />
        </div>


        <el-dialog v-model="previewVisible" title="打印预览" width="840px" append-to-body class="print-preview-dialog">
            <div class="preview-section-title">热敏打印效果预览</div>
            <div class="preview-wrapper print-effect-wrapper" v-loading="printEffectLoading">
                <img v-if="printEffectPreviewSrc" :src="printEffectPreviewSrc" class="preview-img print-effect-img" />
                <div v-else class="preview-placeholder">生成预览中…</div>
            </div>
            <template #footer>
                <el-button @click="previewVisible = false">关闭</el-button>
                <el-button plain class="bluetooth-btn" :loading="bluetoothConnecting" @click="connectBluetoothPrinter">
                    {{ bluetoothReady ? `已连接：${printerName}` : '连接蓝牙打印机' }}
                </el-button>
                <el-button type="primary" :loading="bluetoothPrinting"
                    :disabled="!preparedPrintBytes || !bluetoothReady" @click="handlePrint(previewSrc)">蓝牙打印</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Picture, WarningFilled } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import * as CertificateApi from '@/api/agri/certificate';
import { CertificatePreview } from '@/components/CertificatePreview';
import { CertificatePrintTemplate } from '@/components/CertificatePrintTemplate';
import { BluetoothPrinter } from '@/utils';
import { formatDate } from '@/utils/formatTime';
import {
    captureCertificatePrintArea,
    certificatePrintImageOptions,
    getSelectedCertificateBasisOptions,
    parseCertificateBasis,
    resolveCertificateCommitmentLines
} from '@/utils/certificatePrint';

const PRINTER_NAME_PREFIX = 'YSH';
const PRINTER_SERVICE_UUIDS = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455'
];
const PRINTER_CHARACTERISTIC_UUIDS = [
    '00002af1-0000-1000-8000-00805f9b34fb',
    '0000ffe1-0000-1000-8000-00805f9b34fb',
    '49535343-8841-43f4-a8d4-ecbe34729bb3'
];
const isSelected1 = ref(true);
const isSelected2 = ref(false);

const route = useRoute();
const message = useMessage();

// 互斥选择逻辑
const handleSelect1 = (val) => {
    if (val) isSelected2.value = false;
};
const handleSelect2 = (val) => {
    if (val && !canPrintUpstream.value) {
        isSelected2.value = false;
        return;
    }
    if (val) isSelected1.value = false;
};

const loading = ref(false);
const certificate = ref<any | null>(null);
const commitmentBasis = ref<number[]>([]);

// 上游信息
const upstreamCertificate = ref<any | null>(null);
const upstreamCommitmentBasis = ref<number[]>([]);

const basisOptions = [
    { indexLabel: '(1)', label: '质量安全控制符合要求', value: 1 },
    { indexLabel: '(2)', label: '自行检测合格', value: 2 },
    { indexLabel: '(3)', label: '委托检测合格', value: 3 }
];

const selectedCommitmentBasisOptions = computed(() =>
    getSelectedCertificateBasisOptions(basisOptions, commitmentBasis.value)
);

const selectedUpstreamBasisOptions = computed(() =>
    getSelectedCertificateBasisOptions(basisOptions, upstreamCommitmentBasis.value)
);

/** 根据证书详情生成移动端查验地址；无二维码时退回展示证书编号。 */
const getCertificateQrText = (data: any) => {
    if (!data?.qrCode) return data?.certificateCode || '';
    return `https://yishizhijian.jikeyun.net/web/index.html#/pages/index?id=${data.id || ''}&code=${data.qrCode}`;
};

const isPlatformUpstream = computed(() => certificate.value?.upstreamCertificateSource === 1);

const isOtherPlatformUpstream = computed(() => certificate.value?.upstreamCertificateSource === 2);

const upstreamCertificateImageUrl = computed(() => String(certificate.value?.upstreamCertificateImageUrl || '').trim());

const canPrintUpstream = computed(() => !!upstreamCertificate.value);

const hasUpstreamCertificate = computed(() =>
    canPrintUpstream.value ||
    (isOtherPlatformUpstream.value && !!upstreamCertificateImageUrl.value)
);

const primaryCommitmentLines = computed(() =>
    resolveCertificateCommitmentLines(certificate.value?.commitmentContent, selectedCommitmentBasisOptions.value)
);

const upstreamCommitmentLines = computed(() =>
    resolveCertificateCommitmentLines(upstreamCertificate.value?.commitmentContent, selectedUpstreamBasisOptions.value)
);

const printAreaRef = ref<HTMLElement | null>(null);
const previewVisible = ref(false);
const previewSrc = ref<string | null>(null);
const printEffectPreviewSrc = ref<string | null>(null);
const preparedPrintBytes = ref<Uint8Array | null>(null);
const captureLoading = ref(false);
const printEffectLoading = ref(false);
const printTimeText = ref(formatDate(new Date()));
const bluetoothConnecting = ref(false);
const bluetoothPrinting = ref(false);
const bluetoothReady = ref(false);
const printerName = ref('未连接设备');
const autoReconnectTimer = ref<number | null>(null);
const keepAliveTimer = ref<number | null>(null);

const bluetoothPrinter = new BluetoothPrinter({
    namePrefix: PRINTER_NAME_PREFIX,
    serviceUUIDs: PRINTER_SERVICE_UUIDS,
    characteristicUUIDs: PRINTER_CHARACTERISTIC_UUIDS,
    packetSize: 180,
    writeDelayMs: 8,
    preferWriteWithResponse: false,
    onStatusChange: (ready, name) => {
        bluetoothReady.value = ready;
        printerName.value = ready ? name : '未连接设备';
    }
});

const refreshPrintTime = () => {
    printTimeText.value = formatDate(new Date());
};

const formatPrintDate = (value: unknown) => {
    if (!value) return '--';
    const result = formatDate(new Date(value as string | number | Date), 'YYYY-MM-DD');
    return result === 'Invalid Date' ? String(value).slice(0, 10) || '--' : result;
};

const setUpstreamCertificate = (data: any | null) => {
    upstreamCertificate.value = data || null;
    upstreamCommitmentBasis.value = data ? parseCertificateBasis(data.commitmentBasis) : [];
};

/**
 * 加载主证书及其上游证书信息。
 * 接口未内嵌本平台上游详情时，再按上游编号补查；无可打印上游联时强制选择主证联。
 */
const loadDetail = async (id: number) => {
    loading.value = true;
    try {
        upstreamCertificate.value = null;
        upstreamCommitmentBasis.value = [];
        isSelected2.value = false;
        const data = await CertificateApi.getCertificate(id);
        certificate.value = data;
        commitmentBasis.value = parseCertificateBasis(data.commitmentBasis);

        if (data.upstreamCertificate) {
            setUpstreamCertificate(data.upstreamCertificate);
        } else if (isPlatformUpstream.value && data.upstreamCertificateCode) {
            await loadUpstreamDetail(data.upstreamCertificateCode);
        }
        if (!canPrintUpstream.value) {
            isSelected1.value = true;
            isSelected2.value = false;
        }
    } catch {
        message.error('获取合格证详情失败');
    } finally {
        loading.value = false;
    }
};

/** 清洗上游编号中的连接符后查询本平台证书，失败时清空旧的上游详情。 */
const loadUpstreamDetail = async (code: string) => {
    try {
        const cleanedCode = String(code || '').replace(/[－—\-]/g, '').trim();
        const data = await CertificateApi.queryUpstreamCertificate(cleanedCode);
        setUpstreamCertificate(data);
    } catch (e) {
        setUpstreamCertificate(null);
        console.error('获取上游合格证详情失败', e);
    }
};

const connectBluetoothPrinter = async () => {
    bluetoothConnecting.value = true;
    try {
        const name = await bluetoothPrinter.connect();
        message.success(`已连接蓝牙打印机：${name}`);
    } catch (error: any) {
        if (error?.name !== 'NotFoundError') {
            message.error(`蓝牙连接失败：${error?.message || '请重试'}`);
        }
    } finally {
        bluetoothConnecting.value = false;
    }
};

/** 定时探测已连接打印机，维持详情页长时间打开时的蓝牙会话。 */
const startBluetoothKeepAlive = () => {
    if (keepAliveTimer.value) return;
    keepAliveTimer.value = window.setInterval(async () => {
        if (!bluetoothReady.value) return;
        try {
            await bluetoothPrinter.ping();
        } catch (error) {
            console.warn('bluetooth keepAlive failed', error);
        }
    }, 12000);
};

const pauseBluetoothKeepAlive = () => {
    if (!keepAliveTimer.value) return;
    clearInterval(keepAliveTimer.value);
    keepAliveTimer.value = null;
};

/** 定时重连最近授权设备，连接中或设备已就绪时不重复发起连接。 */
const startAutoReconnect = () => {
    if (autoReconnectTimer.value) return;
    autoReconnectTimer.value = window.setInterval(async () => {
        if (bluetoothReady.value || bluetoothConnecting.value) return;
        try {
            const name = await bluetoothPrinter.reconnectLastDevice();
            if (name) {
                message.success(`蓝牙已自动重连：${name}`);
            }
        } catch (error) {
            // 忽略失败，定时器下一轮继续重连
        }
    }, 6000);
};

const stopBluetoothTimers = () => {
    pauseBluetoothKeepAlive();
    if (autoReconnectTimer.value) {
        clearInterval(autoReconnectTimer.value);
        autoReconnectTimer.value = null;
    }
};

onMounted(async () => {
    const id = Number(route.params.id);
    if (Number.isFinite(id) && id > 0) {
        await loadDetail(id);
    }
    startBluetoothKeepAlive();
    startAutoReconnect();
    try {
        await bluetoothPrinter.reconnectLastDevice();
    } catch (error) {
        // 初次进入可能尚未授权设备，忽略
    }
});

onUnmounted(() => {
    stopBluetoothTimers();
});

const captureAreaToImg = async () => {
    refreshPrintTime();
    await nextTick();
    return captureCertificatePrintArea(printAreaRef.value);
};

/**
 * 根据用户选择的主证联/上游联生成预览，并提前构建蓝牙打印字节。
 * 上游详情不可打印时自动退回主证联，防止生成空白打印内容。
 */
const handlePreview = async () => {
    if (isSelected2.value && !canPrintUpstream.value) {
        isSelected2.value = false;
        isSelected1.value = true;
    }
    if (!isSelected1.value && !isSelected2.value) {
        message.warning('请至少选择一联用于打印');
        return;
    }
    captureLoading.value = true;
    printEffectLoading.value = true;
    previewVisible.value = true;
    previewSrc.value = null;
    printEffectPreviewSrc.value = null;
    preparedPrintBytes.value = null;

    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const img = await captureAreaToImg();
        previewSrc.value = img;
        if (img) {
            const payload = await bluetoothPrinter.buildPrintImagePayload(img, certificatePrintImageOptions);
            printEffectPreviewSrc.value = payload.previewDataUrl;
            preparedPrintBytes.value = payload.bytes;
        }
    } catch (e) {
        console.error('preview failed', e);
        message.error('预览生成失败');
    } finally {
        captureLoading.value = false;
        printEffectLoading.value = false;
    }
};

/**
 * 发送当前证书联的打印数据；打印过程中暂停保活，结束后按连接状态恢复。
 */
const handlePrint = async (prepared?: string | null) => {
    if (isSelected2.value && !canPrintUpstream.value) {
        isSelected2.value = false;
        isSelected1.value = true;
    }
    if (!isSelected1.value && !isSelected2.value) {
        message.warning('请至少选择一联用于打印');
        return;
    }
    const dataUrl = typeof prepared === 'string' ? prepared : await captureAreaToImg();
    if (!dataUrl) {
        message.error('生成打印内容失败');
        return;
    }
    if (!bluetoothReady.value) {
        message.warning('请先连接便携式蓝牙打印机');
        return;
    }
    bluetoothPrinting.value = true;
    pauseBluetoothKeepAlive();
    try {
        if (!preparedPrintBytes.value) {
            const payload = await bluetoothPrinter.buildPrintImagePayload(dataUrl, certificatePrintImageOptions);
            preparedPrintBytes.value = payload.bytes;
            if (!printEffectPreviewSrc.value) {
                printEffectPreviewSrc.value = payload.previewDataUrl;
            }
        }
        await bluetoothPrinter.print(preparedPrintBytes.value);
        message.success('蓝牙打印指令已发送');
    } catch (e: any) {
        console.error('print failed', e);
        message.error(`蓝牙打印失败：${e?.message || '请稍后重试'}`);
    } finally {
        bluetoothPrinting.value = false;
        if (bluetoothReady.value) {
            startBluetoothKeepAlive();
        }
    }
};
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.header-section {
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.third-party-content {
    padding: 20px;
    background: #F8FAFC;
    border-radius: 6px;
    border: 1px dashed #E2E8F0;

    .image-preview-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;

        .preview-box {
            width: 180px;
            height: 240px;
            border: 2px solid #E2E8F0;
            border-radius: 6px;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease-in-out;
            position: relative;
            cursor: pointer;

            &:hover {
                border-color: #00B3ED;
                box-shadow: 0 10px 15px -3px rgba(0, 179, 237, 0.15);

                &::after {
                    opacity: 1;
                }
            }

            // 悬浮时的遮罩提示
            &::after {
                content: '点击查看大图';
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.45);
                color: #fff;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.25s;
                pointer-events: none;
                z-index: 2;
                backdrop-filter: blur(2px);
            }

            .preview-img {
                width: 100%;
                height: 100%;
                z-index: 1;

                :deep(img) {
                    object-position: top;
                }
            }
        }
    }
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.title-line {
    width: 4px;
    height: 18px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.desc-box {
    font-size: 14px;
    color: #999;
    padding-left: 12px;
}

.detail-content {
    width: 100%;
    margin: 0 auto;
    border-radius: 12px;
    flex: 1;
    overflow-y: auto;
}

.info-card {
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);

    .card-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .card-inner-title {
        font-size: 16px;
        font-weight: 700;
        color: #000;
        margin: 0;
    }
}

.certificate-preview-section {
    width: 470px;
    max-width: 100%;
}

.detail-certificate-preview {
    width: 100%;
}

.detail-report-link {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    color: #333;
    font-size: 13px;

    .el-button {
        font-weight: 600;
    }
}

/* 其他平台上游合格证快照样式 */
.other-upstream-snapshot {
    margin-top: 16px;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background: #F9FAFB;
    overflow: hidden;

    .snapshot-header {
        padding: 10px 16px;
        background: #F3F4F6;
        border-bottom: 1px solid #E5E7EB;

        .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;

            .el-icon {
                font-size: 16px;
                color: #6B7280;
            }
        }
    }

    .snapshot-body {
        padding: 16px;
        display: flex;
        justify-content: center;
        background: #fff;

        .upstream-full-img {
            max-width: 100%;
            max-height: 400px;
            cursor: zoom-in;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
    }
}

.divider {
    height: 1px;
    border-top: 1px dashed #D1D5DB;
    margin: 32px 0;
}

.mt-20 {
    margin-top: 20px;
}

.footer-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    margin: 38px 0 20px 0; // 上移 2px

    .print-btn {
        min-width: 120px;
        height: 44px;
        background: #00B3ED;
        border-color: #00B3ED;
        font-weight: 700;
    }

    .close-btn {
        min-width: 120px;
        height: 44px;
    }

    .preview-btn {
        width: 120px;
        height: 44px;
    }
}

.bluetooth-btn {
    border-color: #00B3ED !important;
    color: #00B3ED !important;
    background: #F0F9FF !important;
}

.print-preview-dialog {
    :deep(.el-dialog__body) {
        padding: 8px 16px 16px;
    }
}

.preview-section-title {
    font-size: 14px;
    font-weight: 600;
    color: #666;
    margin-bottom: 10px;
}

.preview-wrapper {
    width: 100%;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: auto;
}

.print-effect-wrapper {
    border: 1px dashed #D1D5DB;
}

.preview-img {
    max-width: 100%;
    height: auto;
    display: block;
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
}

.print-effect-img {
    image-rendering: pixelated;
}

.preview-placeholder {
    color: #666;
    font-size: 14px;
}

/* 作废状态横幅 */
.void-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fff1f0 0%, #fff5f5 100%);
    border: 1px solid #ffa39e;
    border-left: 4px solid #ff4d4f;
    border-radius: 8px;

    .void-icon {
        font-size: 22px;
        color: #ff4d4f;
        flex-shrink: 0;
        margin-top: 1px;
    }

    .void-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .void-label {
        font-size: 15px;
        font-weight: 700;
        color: #cf1322;
        letter-spacing: 0.01em;
    }

    .void-reason {
        font-size: 13px;
        color: #820014;
        line-height: 1.6;
    }
}
</style>
