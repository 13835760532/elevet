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
                    <el-icon class="void-icon"><WarningFilled /></el-icon>
                    <div class="void-info">
                        <span class="void-label">该合格证已作废，不可恢复</span>
                        <span v-if="certificate?.voidReason" class="void-reason">
                            作废原因：{{ certificate.voidReason }}
                        </span>
                    </div>
                </div>

                <div class="cert-display-box" v-loading="loading">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－{{ certificate?.certificateCode || '--' }}</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺事项</h2>
                            <div class="commitment-list">
                                <div v-for="(line, idx) in (certificate?.commitmentContent || '').split('\n')"
                                    :key="idx" class="commitment-item">
                                    {{ line }}
                                </div>
                            </div>

                            <div class="middle-flex">
                                <div class="basis-info">
                                    <h4 class="small-title">承诺依据：</h4>
                                    <el-checkbox-group v-model="commitmentBasis" disabled>
                                        <el-checkbox :label="1">质量安全控制符合要求</el-checkbox>
                                        <el-checkbox :label="2">自行检测合格</el-checkbox>
                                        <el-checkbox :label="3">委托检测合格</el-checkbox>
                                    </el-checkbox-group>
                                </div>
                                <div class="qr-code">
                                    <Qrcode v-if="certificate?.qrCode"
                                        :text="`https://yishizhijian.jikeyun.net/web/index.html#/pages/index?id=${certificate.id || ''}&code=${certificate.qrCode}`"
                                        :options="{ errorCorrectionLevel: 'L' }" :width="80" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 基本信息表格 (右侧) -->
                    <div class="info-table-side">
                        <div class="table-title">基本信息</div>
                        <div class="custom-table">
                            <div class="table-row">
                                <div class="label">产品名称</div>
                                <div class="val">{{ certificate?.productName || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">产品数量</div>
                                <div class="val">
                                    {{ certificate?.quantity ?? '--' }}{{ getAgriUnitLabel(certificate?.unit) }}
                                </div>
                            </div>
                            <div class="table-row">
                                <div class="label">产品产地</div>
                                <div class="val">{{ certificate?.productionArea || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">承诺主体</div>
                                <div class="val">{{ certificate?.subjectName || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">联系方式</div>
                                <div class="val">{{ certificate?.contactPhone || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">开具时间</div>
                                <div class="val">{{ certificate?.issueDate || '--' }}</div>
                            </div>
                        </div>
                        <p class="footer-tip">*电子合格证由壹拾智检数智服务平台承载展示</p>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- 产品图片区域 -->
                <div class="images-section">
                    <div class="section-title" v-if="certificate?.productImageUrl">产品图片</div>
                    <div class="image-grid" v-if="certificate?.productImageUrl">
                        <div v-if="certificate?.productImageUrl" class="image-box">
                            <img :src="certificate.productImageUrl" class="product-img" />
                        </div>
                        <div v-else class="image-placeholder">
                            <el-icon class="icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                    <div class="reports-link">
                        检测报告 <el-button link type="primary" @click="handlePreview">预览</el-button>
                    </div>
                </div>
            </div>

            <!-- 已关联的上游合格证 -->
            <div class="info-card mt-20" v-if="certificate?.upstreamCertificateSource"
                :class="{ 'no-print-section': !isSelected2 }">
                <div class="card-title-row no-print">
                    <h2 class="card-inner-title">已关联的上游合格证</h2>
                    <el-checkbox v-model="isSelected2" v-if="certificate?.upstreamCertificateSource === 1"
                        @change="handleSelect2">打印此联</el-checkbox>
                </div>

                <!-- 1. 本平台来源：展示票据详情 -->
                <div class="cert-display-box"
                    v-if="certificate?.upstreamCertificateSource === 1 && upstreamCertificate">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket orange-border">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－{{ upstreamCertificate?.certificateCode || '--' }}</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺事项</h2>
                            <h3 class="sub-title">{{ upstreamCertificate?.commitmentContent }}</h3>
                            <div class="middle-flex">
                                <div class="basis-info">
                                    <h4 class="small-title">承诺依据：</h4>
                                    <el-checkbox-group v-model="upstreamCommitmentBasis" disabled>
                                        <el-checkbox :label="1">质量安全控制符合要求</el-checkbox>
                                        <el-checkbox :label="2">自行检测合格</el-checkbox>
                                        <el-checkbox :label="3">委托检测合格</el-checkbox>
                                    </el-checkbox-group>
                                </div>
                                <div class="qr-code">
                                    <Qrcode v-if="upstreamCertificate?.qrCode"
                                        :text="`https://yishizhijian.jikeyun.net/web/index.html#/pages/index?id=${upstreamCertificate.id || ''}&code=${upstreamCertificate.qrCode}`"
                                        :options="{ errorCorrectionLevel: 'L' }" :width="80" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 基本信息表格 (右侧) -->
                    <div class="info-table-side">
                        <div class="table-title">基本信息</div>
                        <div class="custom-table">
                            <div class="table-row">
                                <div class="label">产品名称</div>
                                <div class="val">{{ upstreamCertificate?.productName || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">产品数量</div>
                                <div class="val">{{ upstreamCertificate?.quantity ?? '--' }}{{
                                    getAgriUnitLabel(upstreamCertificate?.unit) }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">产品产地</div>
                                <div class="val">{{ upstreamCertificate?.productionArea || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">承诺主体</div>
                                <div class="val">{{ upstreamCertificate?.subjectName || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">联系方式</div>
                                <div class="val">{{ upstreamCertificate?.contactPhone || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">开具时间</div>
                                <div class="val">{{ upstreamCertificate?.issueDate || '--' }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. 其他平台来源：展示原件照片 -->
                <div v-else-if="certificate?.upstreamCertificateSource === 2 && certificate?.upstreamCertificateImageUrl"
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
                        <el-image :src="certificate.upstreamCertificateImageUrl" fit="contain" class="upstream-full-img"
                            :preview-src-list="[certificate.upstreamCertificateImageUrl]" />
                    </div>
                </div>

                <div v-else-if="loading && certificate?.upstreamCertificateSource === 1" class="loading-placeholder">
                    正在加载本平台上游合格证详情...
                </div>

                <div v-else class="empty-tip">暂无关联的上游合格证数据</div>

                <div class="divider"></div>

                <!-- 产品图片区域 -->
                <div class="images-section">
                    <div class="section-title" v-if="upstreamCertificate?.productImageUrl">产品图片</div>
                    <div class="image-grid" v-if="upstreamCertificate?.productImageUrl">
                        <div v-if="upstreamCertificate?.productImageUrl" class="image-box">
                            <img :src="upstreamCertificate.productImageUrl" class="product-img" />
                        </div>
                        <div v-else class="image-placeholder">
                            <el-icon class="icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                    <div class="reports-link" v-if="certificate?.upstreamCertificateSource != 2">
                        检测报告 <el-button link type="primary" @click="handlePreview()">预览</el-button>
                    </div>
                </div>
            </div>

            <div class="info-card mt-20 no-print">
                <div class="card-title-row">
                    <h2 class="card-inner-title">关联样品检测结果{{ thirdPartyType === 'third' ? '第三方' : '平台' }}</h2>
                </div>

                <!-- 平台检测结果展示 -->
                <PlatformDetectionSelector v-if="thirdPartyType === 'platform'" v-model="linkedDetectionRecordIds"
                    v-model:linked-records="linkedPlatformRecords" :search-method="searchPlatformRecords"
                    :readonly="true" @update:active-record="handlePlatformActiveRecordChange" />

                <!-- 第三方检测报告图片展示 -->
                <div v-else class="third-party-content">
                    <div v-if="thirdPartyReportUrls.length > 0" class="image-preview-grid">
                        <div v-for="(url, idx) in thirdPartyReportUrls" :key="idx" class="preview-box">
                            <el-image :src="url" class="preview-img" :preview-src-list="thirdPartyReportUrls"
                                :initial-index="idx" :preview-teleported="true" fit="contain" />
                        </div>
                    </div>
                    <el-empty v-else description="暂无关联检测报告" :image-size="64" />
                </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="footer-actions no-print">
                <el-button type="primary" class="print-btn" :loading="captureLoading"
                    @click="handlePreview">打印预览</el-button>
                <el-button class="close-btn" @click="() => $router.back()">返回</el-button>
            </div>
        </div>

        <div ref="printAreaRef" class="print-template-source">
            <div v-if="isSelected1" class="certificate-document">
                <div class="cert-header">
                    <span class="cert-no-tag">合格证编号－{{ certificate?.certificateCode || '--' }}</span>
                </div>

                <div class="cert-body">
                    <h1 class="cert-title">承诺达标合格证</h1>
                    <h2 class="cert-subtitle">承诺事项：</h2>
                    <div class="cert-declaration-list">
                        <p v-for="(line, idx) in primaryCommitmentLines" :key="`p-${idx}`" class="declaration-line">• {{
                            line }}</p>
                    </div>

                    <div class="cert-middle-section">
                        <div class="cert-basis">
                            <h3 class="basis-title" style="margin-bottom: 12px;">承诺依据：</h3>
                            <div class="custom-basis-group">
                                <div class="basis-item" v-for="item in selectedCommitmentBasisOptions"
                                    :key="`pb-${item.value}`">
                                    <span class="basis-box checked">✔</span>
                                    <span class="basis-label">
                                        <span class="basis-index">{{ item.indexLabel }}</span>
                                        {{ item.label }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="qr-code-wrapper">
                            <Qrcode v-if="certificate?.certificateCode" :text="certificate?.certificateCode"
                                :options="{ errorCorrectionLevel: 'L' }" :width="132" />
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
                                <div class="value">{{ certificate?.quantity ?? '--' }} {{
                                    getAgriUnitLabel(certificate?.unit) }}</div>
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
                                <div class="value">{{ certificate?.issueDate || '--' }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="divider no-print"></div>
                    <div class="image-section no-print print-keep-space">
                        <h3 class="info-title">产品图片</h3>
                        <div class="image-preview-box">
                            <img v-if="certificate?.productImageUrl" :src="certificate?.productImageUrl"
                                class="cert-product-img" alt="产品图片" />
                            <el-icon v-else class="placeholder-icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 仅在本平台来源且勾选时显示打印联 -->
            <div v-if="isSelected2 && certificate?.upstreamCertificateSource === 1 && upstreamCertificate"
                class="certificate-document print-doc-gap">
                <div class="cert-header">
                    <span class="cert-no-tag">合格证编号－{{ upstreamCertificate?.certificateCode || '--' }}</span>
                </div>

                <div class="cert-body">
                    <h1 class="cert-title">承诺达标合格证</h1>
                    <h2 class="cert-subtitle">承诺事项：</h2>
                    <div class="cert-declaration-list">
                        <p v-for="(line, idx) in upstreamCommitmentLines" :key="`u-${idx}`" class="declaration-line">•
                            {{ line }}</p>
                    </div>

                    <div class="cert-middle-section">
                        <div class="cert-basis">
                            <h3 class="basis-title" style="margin-bottom: 12px;">承诺依据：</h3>
                            <div class="custom-basis-group">
                                <div class="basis-item" v-for="item in selectedUpstreamBasisOptions"
                                    :key="`ub-${item.value}`">
                                    <span class="basis-box checked">✔</span>
                                    <span class="basis-label">
                                        <span class="basis-index">{{ item.indexLabel }}</span>
                                        {{ item.label }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="qr-code-wrapper">
                            <Qrcode v-if="upstreamCertificate?.certificateCode"
                                :text="upstreamCertificate?.certificateCode" :options="{ errorCorrectionLevel: 'L' }"
                                :width="132" />
                        </div>
                    </div>

                    <div class="divider"></div>

                    <div class="info-section">
                        <h3 class="info-title">基本信息：</h3>
                        <div class="info-table">
                            <div class="info-row">
                                <div class="label">产品名称</div>
                                <div class="value">{{ upstreamCertificate?.productName || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">数量/重量</div>
                                <div class="value">{{ upstreamCertificate?.quantity ?? '--' }} {{
                                    getAgriUnitLabel(upstreamCertificate?.unit) }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">产品产地</div>
                                <div class="value">{{ upstreamCertificate?.productionArea || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">承诺主体</div>
                                <div class="value">{{ upstreamCertificate?.subjectName || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">联系方式</div>
                                <div class="value">{{ upstreamCertificate?.contactPhone || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">开具时间</div>
                                <div class="value">{{ upstreamCertificate?.issueDate || '--' }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="divider no-print"></div>
                    <div class="image-section no-print print-keep-space">
                        <h3 class="info-title">产品图片</h3>
                        <div class="image-preview-box">
                            <img v-if="upstreamCertificate?.productImageUrl" :src="upstreamCertificate?.productImageUrl"
                                class="cert-product-img" alt="产品图片" />
                            <el-icon v-else class="placeholder-icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>
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
import * as DetectionReportApi from '@/api/agri/detectionReport';
import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import { Qrcode } from '@/components/Qrcode';
import html2canvas from 'html2canvas';
import PlatformDetectionSelector from './components/PlatformDetectionSelector.vue';
import { BluetoothPrinter, getAgriUnitLabel } from '@/utils';

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
const PRINT_TARGET_WIDTH = 520;

const printImageOptions = {
    rotate90: false,
    cropWhitespace: false,
    fitToWidth: true,
    maxWidth: PRINT_TARGET_WIDTH,
    threshold: 220,
    contrast: 2.2,
    align: 'center',
    feedLines: 2,
    feedDots: 0,
    cut: false,
    widthUnit: 'bytes',
    command: 'gs-v-0'
} as const;

const isSelected1 = ref(true);
const isSelected2 = ref(false);

const route = useRoute();
const message = useMessage();

// 互斥选择逻辑
const handleSelect1 = (val) => {
    if (val) isSelected2.value = false;
};
const handleSelect2 = (val) => {
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

const selectedCommitmentBasisOptions = computed(() => {
    const selected = new Set(commitmentBasis.value.map(v => Number(v)));
    return basisOptions.filter(item => selected.has(Number(item.value)));
});

const selectedUpstreamBasisOptions = computed(() => {
    const selected = new Set(upstreamCommitmentBasis.value.map(v => Number(v)));
    return basisOptions.filter(item => selected.has(Number(item.value)));
});

const parseCommitmentLines = (content: any, fallbackBasis: Array<{ label: string }>) => {
    const stripCommitmentPrefix = (line: string) => {
        let cleaned = String(line || '').trim();
        const seqRegex = /^(\d+[.、]|[（(]\d+[）)])\s*/;
        while (seqRegex.test(cleaned)) {
            cleaned = cleaned.replace(seqRegex, '').trim();
        }
        return cleaned;
    };
    const normalizeForMatch = (line: string) => String(line || '').replace(/\s+/g, '').trim();

    const raw = String(content || '').trim();
    if (raw) {
        const normalized = raw
            .split(/[\r\n]+|[；;。]/)
            .map(item => stripCommitmentPrefix(item))
            .filter(Boolean);
        if (normalized.length > 1) return normalized;

        const compactRaw = normalizeForMatch(raw);
        const basisMatched = fallbackBasis
            .map(item => stripCommitmentPrefix(item.label))
            .filter(Boolean)
            .filter((label, index, arr) => arr.indexOf(label) === index)
            .filter(label => compactRaw.includes(normalizeForMatch(label)));
        if (basisMatched.length >= 2) return basisMatched;
        if (normalized.length === 1) return normalized;
    }
    return fallbackBasis.map(item => item.label);
};

const primaryCommitmentLines = computed(() =>
    parseCommitmentLines(certificate.value?.commitmentContent, selectedCommitmentBasisOptions.value)
);

const upstreamCommitmentLines = computed(() =>
    parseCommitmentLines(upstreamCertificate.value?.commitmentContent, selectedUpstreamBasisOptions.value)
);

// 平台检测关联信息（详情页展示/打印前检查）
const linkedDetectionRecordIds = ref<number[]>([]);
const linkedPlatformRecords = ref<any[]>([]);
const currentPlatformRecord = ref<any | null>(null);

// 第三方关联信息
const thirdPartyType = ref<'third' | 'platform'>('platform');
const thirdPartyReportUrls = ref<string[]>([]);

const printAreaRef = ref<HTMLElement | null>(null);
const previewVisible = ref(false);
const previewSrc = ref<string | null>(null);
const printEffectPreviewSrc = ref<string | null>(null);
const preparedPrintBytes = ref<Uint8Array | null>(null);
const captureLoading = ref(false);
const printEffectLoading = ref(false);
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

// 统一解析承诺依据
const parseBasisData = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(Number);
    if (typeof val === 'number') return [val];
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
    } catch (e) {
        return String(val).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }
};

const unwrapApiData = (payload: any) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return payload?.data || payload || null;
};

const mapReportOption = (item: any) => {
    const linkId = Number(item?.recordId || item?.id || 0);
    let rDate = '-';
    try {
        if (item.aiRecognitionResult) {
            const parsed = typeof item.aiRecognitionResult === 'string' ? JSON.parse(item.aiRecognitionResult) : item.aiRecognitionResult;
            rDate = parsed.timestamp || '-';
        }
    } catch (e) { }

    return {
        ...item,
        linkId,
        sampleCode: item?.sampleCode || item?.recordCode || item?.reportCode || '-',
        sampleName: item?.sampleName || item?.productName || '',
        reportDate: rDate
    };
};

const normalizeDetectionRecordIds = (value: any): number[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
    }
    if (typeof value === 'string') {
        return value.split(',').map((id) => Number(id.trim())).filter((id) => Number.isFinite(id) && id > 0);
    }
    const singleId = Number(value);
    return Number.isFinite(singleId) && singleId > 0 ? [singleId] : [];
};

const searchPlatformRecords = async (query: string) => {
    const keyword = String(query || '').trim().toLowerCase();
    if (!keyword) return [];
    try {
        const response = await DetectionReportApi.getDetectionReportListBySampleCode(keyword);
        const sourceList = unwrapApiData(response);
        return Array.isArray(sourceList) ? sourceList.map(mapReportOption).filter(item => item.linkId) : [];
    } catch (error) {
        console.error('查询平台检测报告失败', error);
        return [];
    }
};

const handlePlatformActiveRecordChange = (record: any) => {
    currentPlatformRecord.value = record || null;
};

const hydrateLinkedDetectionRecords = async (recordIds: number[]) => {
    if (!recordIds.length) {
        linkedDetectionRecordIds.value = [];
        linkedPlatformRecords.value = [];
        currentPlatformRecord.value = null;
        return;
    }
    try {
        const detailResponses = await Promise.all(
            recordIds.map(async (recordId) => {
                try {
                    const record = await DetectionRecordApi.getDetectionRecord(Number(recordId));
                    if (record) return record;
                } catch (error) {
                    console.warn('加载检测记录详情失败，尝试检测报告详情', recordId, error);
                }
                try {
                    const report = await DetectionReportApi.getDetectionReportByRecordId(Number(recordId));
                    return unwrapApiData(report);
                } catch (error) {
                    console.warn('加载检测报告详情失败', recordId, error);
                    return null;
                }
            })
        );
        const mappedList = detailResponses
            .filter(Boolean)
            .map((detail) => mapReportOption(detail));

        console.log(mappedList)

        if (mappedList.length) {
            linkedPlatformRecords.value = mappedList;
            linkedDetectionRecordIds.value = mappedList.map((item) => Number(item.linkId));
            currentPlatformRecord.value = mappedList[0];
        }
    } catch (error) {
        console.error('加载关联检测记录失败', error);
    }
};

const loadDetail = async (id: number) => {
    loading.value = true;
    try {
        const data = await CertificateApi.getCertificate(id);
        certificate.value = data;
        commitmentBasis.value = parseBasisData(data.commitmentBasis);

        // 解析检测结果类型
        thirdPartyReportUrls.value = data.thirdPartyReportUrl ? data.thirdPartyReportUrl.split(',').filter(Boolean) : [];
        const recordIds = normalizeDetectionRecordIds(data?.detectionRecordId);

        if (thirdPartyReportUrls.value.length > 0) {
            thirdPartyType.value = 'third';
        } else if (recordIds.length > 0) {
            thirdPartyType.value = 'platform';
            await hydrateLinkedDetectionRecords(recordIds);
        } else {
            thirdPartyType.value = 'third'; // 默认
        }
        // if (data.upstreamCertificate) {
        //    upstreamCertificate.value = data.upstreamCertificate;
        //    upstreamCommitmentBasis.value = parseBasisData(data.upstreamCertificate.commitmentBasis);
        // } 
        if (data.upstreamCertificateSource === 1 && data.upstreamCertificateCode) {
            await loadUpstreamDetail(data.upstreamCertificateCode);
        }
    } catch {
        message.error('获取合格证详情失败');
    } finally {
        loading.value = false;
    }
};

const loadUpstreamDetail = async (code: string) => {
    try {
        const cleanedCode = String(code || '').replace(/[－—\-]/g, '').trim();
        const data = await CertificateApi.queryUpstreamCertificate(cleanedCode);
        if (data) {
            upstreamCertificate.value = data;
            upstreamCommitmentBasis.value = parseBasisData(data.commitmentBasis);
        }
    } catch (e) {
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
    const area = printAreaRef.value;
    if (!area) return null;

    const hiddenNodes: Array<{
        el: HTMLElement;
        display: string;
        visibility: string;
        height: string;
        minHeight: string;
        overflow: string;
    }> = [];
    area.querySelectorAll<HTMLElement>('.no-print, .no-print-section').forEach(el => {
        hiddenNodes.push({
            el,
            display: el.style.display,
            visibility: el.style.visibility,
            height: el.style.height,
            minHeight: el.style.minHeight,
            overflow: el.style.overflow
        });
        if (el.classList.contains('print-keep-space')) {
            // 打印时保留空白，进一步减半
            const reservedHeight = Math.max(0, Math.round(el.offsetHeight / 8) - 20);
            el.style.visibility = 'hidden';
            el.style.height = `${reservedHeight}px`;
            el.style.minHeight = `${reservedHeight}px`;
            el.style.overflow = 'hidden';
        } else {
            el.style.display = 'none';
        }
    });
    const activeDocs: HTMLElement[] = [];
    area.querySelectorAll<HTMLElement>('.certificate-document').forEach((el) => {
        activeDocs.push(el);
        el.classList.add('printing-active');
    });

    try {
        const canvas = await html2canvas(area, {
            scale: 1.5,
            useCORS: true,
            backgroundColor: '#fff',
            scrollX: 0,
            scrollY: 0,
            width: PRINT_TARGET_WIDTH,
            windowWidth: PRINT_TARGET_WIDTH
        });
        return canvas.toDataURL('image/png');
    } finally {
        activeDocs.forEach((el) => {
            el.classList.remove('printing-active');
        });
        hiddenNodes.forEach(({ el, display, visibility, height, minHeight, overflow }) => {
            el.style.display = display;
            el.style.visibility = visibility;
            el.style.height = height;
            el.style.minHeight = minHeight;
            el.style.overflow = overflow;
        });
    }
};

const handlePreview = async () => {
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
            const payload = await bluetoothPrinter.buildPrintImagePayload(img, printImageOptions);
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

const handlePrint = async (prepared?: string | null) => {
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
            const payload = await bluetoothPrinter.buildPrintImagePayload(dataUrl, printImageOptions);
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

/* 打印专用离屏模板：使用 createIssue 同款排版 */
.print-template-source {
    position: fixed;
    left: -99999px;
    top: 0;
    width: 520px;
    background: #fff;
    z-index: -1;

    .print-doc-gap {
        margin-top: 20px;
    }
}

.certificate-document {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 24px;
    border-radius: 8px;
    width: 100%;
    margin: 0 auto;

    &.printing-active {
        width: 520px !important;
        padding: 6px 7px 10px 17px !important; // 底部留白减半
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        box-sizing: border-box !important;

        .cert-header {
            margin-top: 0 !important;
            margin-bottom: 12px !important;
            overflow: visible !important;

            .cert-no-tag {
                font-size: 31px !important; // 放大 1.3 倍
                font-weight: 800 !important;
                background: none !important;
                color: #000 !important;
                padding: 0 !important;
            }
        }

        .cert-title {
            font-size: 47px !important; // 放大 1.3 倍
            margin: 4px 0 !important;
        }

        .cert-subtitle {
            font-size: 20px !important; // 与承诺依据模板统一
        }

        .cert-declaration-list {
            text-align: left !important;
            margin: 8px 0 !important;

            .declaration-line {
                font-size: 21px !important; // 放大 1.3 倍
                margin: 4px 0 !important;
                line-height: 1.4 !important;
                font-weight: 600 !important;
                color: #000 !important;
            }
        }

        .info-section {
            margin-top: 12px !important;
            padding-top: 8px !important;
            border-top: 1px dashed #000 !important;

            .info-title {
                font-size: 23px !important; // 18 * 1.3
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
                    font-size: 23px !important; // 放大 1.3 倍
                    padding: 4px 0 !important;
                    background: none !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                .label {
                    width: 130px !important;
                }
            }
        }

        .divider {
            display: none !important;
        }

        .cert-middle-section {
            margin: 16px 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;

            .basis-title {
                font-size: 20px !important; // 与副标题配套
            }
        }

        .qr-code-wrapper {
            margin-top: 20px !important;
            width: 132px !important; // 二维码放大一点
            height: 132px !important;
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
                    font-size: 23px !important; // 放大 1.3 倍
                    color: #000 !important;

                    .basis-index {
                        display: none !important;
                    }
                }
            }
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

.cert-display-box {
    display: flex;
    gap: 40px;
    align-items: flex-start;
}

/* 合格证票据样式 */
.cert-ticket {
    flex: 1;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    padding: 16px;
    position: relative;

    &.orange-border {
        border-color: #FACC15;
    }

    .cert-header {
        margin-bottom: 16px;

        .cert-id-tag {
            background: #F0F7FF;
            color: #333;
            padding: 4px 10px;
            font-size: 12px;
            border-radius: 2px;
        }
    }

    .cert-body {
        text-align: center;

        .main-title {
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 8px 0;
            letter-spacing: 1px;
        }

        .commitment-list {
            margin-bottom: 20px;

            .commitment-item {
                font-size: 16px;
                font-weight: 700;
                color: #333;
                line-height: 1.5;
                margin-bottom: 2px;
                display: flex;
                align-items: flex-start;

                &::before {
                    content: '';
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    background-color: #333;
                    border-radius: 50%;
                    margin-right: 10px;
                    margin-top: 9px;
                    flex-shrink: 0;
                }
            }
        }

        .declaration {
            font-size: 12px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
            text-align: left;
        }
    }

    .middle-flex {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        text-align: left;
    }

    .basis-info {
        .small-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 10px;
        }


        :deep(.el-checkbox) {
            display: block;
            margin-bottom: 4px;
            display: flex;
            align-items: center;

            .el-checkbox__label {
                font-size: 12px;
                font-weight: 600;
                color: #333;
            }
        }
    }

    .qr-code {
        width: 80px;
        height: 80px;

        img {
            width: 100%;
            height: 100%;
        }
    }
}

/* 右侧信息表 */
.info-table-side {
    flex: 1;
    text-align: left;

    .table-title {
        font-size: 15px;
        font-weight: 700;
        color: #000;
        margin-bottom: 16px;
    }

    .custom-table {
        border: 1px solid #EDEDED;

        .table-row {
            display: flex;
            border-bottom: 1px solid #EDEDED;

            &:last-child {
                border-bottom: none;
            }

            .label {
                width: 120px;
                background: #F9FAFB;
                padding: 10px 16px;
                font-size: 13px;
                font-weight: 600;
                border-right: 1px solid #EDEDED;
                color: #333;
            }

            .val {
                flex: 1;
                padding: 10px 16px;
                font-size: 13px;
                color: #333;
            }
        }
    }

    .footer-tip {
        font-size: 11px;
        color: #999;
        margin-top: 12px;
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

/* 图片区域 */
.images-section {
    text-align: left;

    .section-title {
        font-size: 14px;
        font-weight: 700;
        color: #000;
        margin-bottom: 16px;
    }

    .image-placeholder {
        width: 250px;
        height: 160px;
        background: #F3F4F6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon {
            font-size: 40px;
            color: #D1D5DB;
        }
    }

    .reports-link {
        margin-top: 16px;
        font-size: 13px;
        color: #333;
        display: flex;
        align-items: center;

        .el-button {
            margin-left: 8px;
            font-weight: 600;
        }
    }
}

.mt-20 {
    margin-top: 20px;
}

.footer-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
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

.image-box {
    max-width: 100%;
    border-radius: 8px;
    overflow: hidden;
    display: inline-block;

    .product-img {
        display: block;
        max-width: 320px;
        max-height: 240px;
        width: auto;
        height: auto;
        border-radius: 8px;
    }
}

.empty-tip {
    text-align: center;
    padding: 40px;
    color: #999;
    font-size: 14px;
    background: #f9fafb;
    border-radius: 8px;
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
