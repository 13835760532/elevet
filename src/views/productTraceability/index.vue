<template>
    <div class="trace-explorer" v-loading="loading">
        <!-- 头部：恢复之前的 Hero Explorer 风格（搜索框在下） -->
        <section class="hero-header">
            <div class="hero-bg"></div>
            <div class="hero-body">
                <div class="brand-badge">全程溯源 · 质量护航</div>
                <h1 class="hero-title">每一份生机，皆可追本溯源</h1>
                <p class="hero-subtitle">全程数字追溯，守护每一份质量承诺</p>

                <div class="search-portal">
                    <div class="search-inner">
                        <el-input v-model="searchCode" placeholder="请输入合格证编号开启追溯" class="portal-input"
                            @keyup.enter="handleSearch">
                            <template #prefix>
                                <el-icon class="search-icon">
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                        <el-button type="primary" class="portal-btn" @click="handleSearch">
                            探索
                        </el-button>
                    </div>
                </div>
            </div>
        </section>

        <!-- 结果区：按照原型展示，且保留优化后的时间轴 -->
        <div v-if="traceData" class="trace-results">
            <!-- 1. 基本信息 -->
            <section class="section-container">
                <div class="section-title-wrapper">
                    <h2 class="section-title">基本信息</h2>
                    <div class="title-accent"></div>
                </div>

                <div class="cert-code-row">
                    合格证编号：<span>{{ traceData.certificate?.certificateCode }}</span>
                </div>

                <div class="basic-info-layout">
                    <!-- 左侧：详情表格 -->
                    <div class="info-table-box">
                        <table class="proto-table">
                            <tr>
                                <td class="label">出证类型</td>
                                <td class="value">{{ getCertTypeLabel(traceData.certificate?.certificateType) }}</td>
                            </tr>
                            <tr>
                                <td class="label">样品名称</td>
                                <td class="value">{{ traceData.certificate?.productName }}</td>
                            </tr>
                            <tr>
                                <td class="label">重量/数量</td>
                                <td class="value">{{ traceData.certificate?.quantity }} ({{
                                    getAgriUnitLabel(traceData.certificate?.unit) }})</td>
                            </tr>
                            <tr>
                                <td class="label">产品产地</td>
                                <td class="value">{{ traceData.certificate?.productionArea }}</td>
                            </tr>
                            <tr>
                                <td class="label">生产经营主体</td>
                                <td class="value">{{ traceData.certificate?.subjectName }}</td>
                            </tr>
                            <tr>
                                <td class="label">联系人</td>
                                <td class="value">{{ traceData.certificate?.contactName }}</td>
                            </tr>
                            <tr>
                                <td class="label">联系电话</td>
                                <td class="value">{{ traceData.certificate?.contactPhone }}</td>
                            </tr>
                            <tr>
                                <td class="label">开具日期</td>
                                <td class="value">{{ traceData.certificate?.issueDate }}</td>
                            </tr>
                        </table>
                    </div>

                    <!-- 右侧：承诺小样 -->
                    <div class="hg-card-preview">
                        <div class="hg-border-box">
                            <div class="hg-side-title">承诺达标合格证</div>
                            <div class="hg-main-box">
                                <div class="hg-promise-text">
                                    <p class="promise-header">我承诺对生产销售的食用农产品：</p>
                                    <div class="promise-items">
                                        <div v-for="(line, idx) in previewCommitmentLines" :key="idx">
                                            （{{ idx + 1 }}）{{ line }}
                                        </div>
                                    </div>
                                    <p class="basis-header">承诺依据：</p>
                                    <div class="basis-items">
                                        <span v-for="opt in basisOptions" :key="opt.value" style="margin-right: 8px;">
                                            {{ isBasisSelected(opt.value) ? '●' : '○' }} {{ opt.label }}
                                        </span>
                                    </div>
                                </div>
                                <div class="hg-fields-grid">
                                    <div class="f-row">品名：{{ traceData.certificate?.productName }}</div>
                                    <div class="f-row">日期：{{ traceData.certificate?.issueDate }}</div>
                                    <div class="f-row">数量：{{ traceData.certificate?.quantity }}{{
                                        getAgriUnitLabel(traceData.certificate?.unit) }}</div>
                                    <div class="f-row">产地：{{ traceData.certificate?.productionArea }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 2. 产品溯源：使用优化后的时间轴样式 -->
            <section class="section-container">
                <div class="section-title-wrapper">
                    <h2 class="section-title">产品溯源</h2>
                </div>

                <div class="opt-timeline">
                    <div v-for="(node, index) in traceRecords" :key="index" class="tl-node">
                        <!-- 时戳部分：分行排列 -->
                        <div class="tl-time">
                            <div class="date">{{ node.time.split(' ')[0] }}</div>
                            <div class="hour">{{ node.time.split(' ')[1] }}</div>
                        </div>

                        <!-- 轨道部分：双环点 -->
                        <div class="tl-rail">
                            <div class="tl-dot" :class="node.status">
                                <div class="dot-inner"></div>
                            </div>
                            <div v-if="index !== traceRecords.length - 1" class="tl-line"></div>
                        </div>

                        <!-- 卡片部分：严格遵循原型结构 -->
                        <div class="tl-main-card">
                            <div class="node-header">
                                <div class="node-id">{{ node.typeLabel }}编号：{{ node.code }}</div>
                                <div class="node-actions">
                                    <el-button v-if="node.type === 'certificate'" type="primary" size="small"
                                        class="theme-flat-btn"
                                        @click="handleViewCert(node.originData)">查看合格证图片</el-button>
                                    <el-button v-if="node.type === 'certificate'" type="primary" size="small"
                                        class="theme-flat-btn"
                                        @click="handleOpenPrintPreview(node.originData)">打印合格证</el-button>
                                    <el-button v-if="node.type === 'report'" type="primary" size="small"
                                        class="theme-flat-btn"
                                        @click="handleViewReport(node.originData)">查看检测报告</el-button>
                                </div>
                            </div>

                            <div class="node-table-wrapper">
                                <table class="proto-table mini">
                                    <tr v-for="(detail, dIdx) in node.details" :key="dIdx">
                                        <td class="label">{{ detail.label }}</td>
                                        <td class="value">{{ detail.value }}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="tl-end">
                        <div class="end-dot"></div>
                        已到达追溯链起始点
                    </div>
                </div>
            </section>
        </div>

        <!-- 初始空白态：功能展示区 -->
        <div v-else-if="!loading" class="hero-footer-features">
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="icon-box primary"><el-icon>
                            <Monitor />
                        </el-icon></div>
                    <h4>全链路数字化</h4>
                    <p>生产、流通、流通全流程赋能</p>
                </div>
                <div class="feature-card">
                    <div class="icon-box success"><el-icon>
                            <Check />
                        </el-icon></div>
                    <h4>权威认证保障</h4>
                    <p>监管部门溯源码，数据真实</p>
                </div>
                <div class="feature-card">
                    <div class="icon-box warning"><el-icon>
                            <Connection />
                        </el-icon></div>
                    <h4>多级向上追溯</h4>
                    <p>层层深挖，直击生产源头</p>
                </div>
            </div>
        </div>
        <!-- 合格证预览弹窗 -->
        <el-dialog v-model="showCertVisible" title="合格证预览" width="800px" append-to-body destroy-on-close
            class="cert-preview-dialog">
            <div class="cert-preview-container" v-if="activeCertData">
                <div class="cert-ticket">
                    <div class="cert-header">
                        <span class="cert-id-tag">合格证编号－{{ activeCertData.certificateCode }}</span>
                    </div>
                    <div class="cert-body">
                        <h2 class="main-title">承诺事项</h2>
                        <h3 class="sub-title">{{ activeCertData.commitmentContent ||
                            '（1）已按规定收取并保存该批次产品的承诺达标合格证或者其他质量安全合格证明；（2）未违规使用保鲜剂、防腐剂、添加剂等。（3）对承诺的真实性负责' }}</h3>
                        <div class="middle-flex">
                            <div class="basis-info">
                                <h4 class="small-title">承诺依据：</h4>
                                <div class="basis-text-list">
                                    <div>● 质量安全控制符合要求</div>
                                    <div>● 自行检测合格</div>
                                </div>
                            </div>
                            <div class="qr-code">
                                <Qrcode v-if="activeCertData.qrCode" :text="activeCertData.qrCode"
                                    :options="{ errorCorrectionLevel: 'L' }" :width="80" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cert-info-table">
                    <div class="table-title">基本信息</div>
                    <div class="mini-table">
                        <div class="m-row">
                            <div class="m-label">产品名称</div>
                            <div class="m-val">{{ activeCertData.productName }}</div>
                        </div>
                        <div class="m-row">
                            <div class="m-label">重量/数量</div>
                            <div class="m-val">{{ activeCertData.quantity }}{{ getAgriUnitLabel(activeCertData.unit) }}
                            </div>
                        </div>
                        <div class="m-row">
                            <div class="m-label">产品产地</div>
                            <div class="m-val">{{ activeCertData.productionArea }}</div>
                        </div>
                        <div class="m-row">
                            <div class="m-label">承诺主体</div>
                            <div class="m-val">{{ activeCertData.subjectName }}</div>
                        </div>
                        <div class="m-row">
                            <div class="m-label">联系方式</div>
                            <div class="m-val">{{ activeCertData.contactPhone }}</div>
                        </div>
                        <div class="m-row">
                            <div class="m-label">开具日期</div>
                            <div class="m-val">{{ activeCertData.issueDate }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 检测报告预览弹窗 -->
        <el-dialog v-model="showReportVisible" title="检测报告预览" width="900px" append-to-body destroy-on-close>
            <div class="report-preview-wrap" v-if="activeReportData">
                <RapidDetectionReport :data="activeReportData" :results="activeReportData.results || []"
                    :editable="false" />
            </div>
        </el-dialog>

        <el-dialog v-model="printPreviewVisible" title="打印预览" width="840px" append-to-body class="cert-print-dialog">
            <div class="preview-section-title">热敏打印效果预览</div>
            <div class="preview-wrapper print-effect-wrapper" v-loading="printEffectLoading">
                <img v-if="printEffectPreviewSrc" :src="printEffectPreviewSrc" class="preview-img print-effect-img" />
                <div v-else class="preview-placeholder">生成预览中…</div>
            </div>
            <template #footer>
                <el-button @click="printPreviewVisible = false">关闭</el-button>
                <el-button plain class="bluetooth-btn" :loading="bluetoothConnecting" @click="connectBluetoothPrinter">
                    {{ bluetoothReady ? `已连接：${printerName}` : '连接蓝牙打印机' }}
                </el-button>
                <el-button type="primary" :loading="bluetoothPrinting"
                    :disabled="!preparedPrintBytes || !bluetoothReady" @click="handlePrint(previewSrc)">
                    蓝牙打印
                </el-button>
            </template>
        </el-dialog>

        <div ref="printAreaRef" class="print-template-source">
            <div v-if="activePrintCertData" class="certificate-document">
                <div class="cert-header">
                    <span class="cert-no-tag">合格证编号－{{ activePrintCertData.certificateCode || '--' }}</span>
                </div>

                <div class="cert-body">
                    <h1 class="cert-title">承诺达标合格证</h1>
                    <h2 class="cert-subtitle">承诺事项：</h2>
                    <div class="cert-declaration-list">
                        <p v-for="(line, idx) in printCommitmentLines" :key="`trace-print-${idx}`"
                            class="declaration-line">
                            • {{ line }}
                        </p>
                    </div>

                    <div class="cert-middle-section">
                        <div class="cert-basis">
                            <h3 class="basis-title" style="margin-bottom: 12px;">承诺依据：</h3>
                            <div class="custom-basis-group">
                                <div class="basis-item" v-for="item in selectedPrintBasisOptions"
                                    :key="`trace-print-basis-${item.value}`">
                                    <span class="basis-box checked">✔</span>
                                    <span class="basis-label">{{ item.label }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="qr-code-wrapper">
                            <Qrcode v-if="printQrText" :options="{ errorCorrectionLevel: 'L' }" :text="printQrText"
                                :width="132" />
                        </div>
                    </div>

                    <div class="info-section">
                        <h3 class="info-title">基本信息：</h3>
                        <div class="info-table">
                            <div class="info-row">
                                <div class="label">产品名称</div>
                                <div class="value">{{ activePrintCertData.productName || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">数量/重量</div>
                                <div class="value">{{ activePrintCertData.quantity ?? '--' }} {{
                                    getAgriUnitLabel(activePrintCertData.unit) }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">产品产地</div>
                                <div class="value">{{ activePrintCertData.productionArea || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">承诺主体</div>
                                <div class="value">{{ activePrintCertData.subjectName || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">联系方式</div>
                                <div class="value">{{ activePrintCertData.contactPhone || '--' }}</div>
                            </div>
                            <div class="info-row">
                                <div class="label">开具时间</div>
                                <div class="value">{{ activePrintCertData.issueDate || '--' }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="divider no-print"></div>
                    <div class="image-section no-print print-keep-space">
                        <h3 class="info-title">产品图片</h3>
                        <div class="image-preview-box">
                            <img v-if="activePrintCertData.productImageUrl" :src="activePrintCertData.productImageUrl"
                                class="cert-product-img" alt="产品图片" />
                            <el-icon v-else class="placeholder-icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Search, VideoPlay, Monitor, Check, Connection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as CertificateApi from '@/api/agri/certificate/index';
import { useDict } from '@/hooks/web/useDict';
import RapidDetectionReport from '../rapidDetection/components/RapidDetectionReport.vue';
import { Qrcode } from '@/components/Qrcode';
import html2canvas from 'html2canvas';
import { BluetoothPrinter } from '@/utils';
import { getAgriUnitLabel } from '@/utils/agriUnit';

defineOptions({
    name: 'ProductTraceability'
});

const route = useRoute();
const searchCode = ref('');
const loading = ref(false);
const traceData = ref<any>(null);

// 弹窗控制
const showCertVisible = ref(false);
const showReportVisible = ref(false);
const activeCertData = ref<any>(null);
const activeReportData = ref<any>(null);
const activePrintCertData = ref<any>(null);

const printAreaRef = ref<HTMLElement | null>(null);
const printPreviewVisible = ref(false);
const previewSrc = ref<string | null>(null);
const printEffectPreviewSrc = ref<string | null>(null);
const preparedPrintBytes = ref<Uint8Array | null>(null);
const printEffectLoading = ref(false);
const bluetoothConnecting = ref(false);
const bluetoothPrinting = ref(false);
const bluetoothReady = ref(false);
const printerName = ref('未连接设备');
const printBasis = ref<number[]>([]);

const { getLabel: getCertTypeLabel } = useDict('agri_certificate_type', 'int');

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

const basisOptions = [
    { label: '质量安全控制符合要求', value: 1 },
    { label: '自行检测合格', value: 2 },
    { label: '委托检测合格', value: 3 }
];

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

const selectedPrintBasisOptions = computed(() => {
    const selected = new Set(printBasis.value.map(v => Number(v)));
    return basisOptions.filter(item => selected.has(item.value));
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

const printCommitmentLines = computed(() =>
    parseCommitmentLines(
        activePrintCertData.value?.commitmentContent,
        selectedPrintBasisOptions.value.length ? selectedPrintBasisOptions.value : basisOptions
    )
);

const printQrText = computed(() =>
    activePrintCertData.value?.qrCode || activePrintCertData.value?.certificateCode || ''
);

// 为预览小样计算承诺行
const previewCommitmentLines = computed(() => {
    const content = traceData.value?.certificate?.commitmentContent;
    const fallback = [
        '已按规定收取并保存该批次产品的承诺达标合格证或者其他质量安全合格证明；',
        '未违规使用保鲜剂、防腐剂、添加剂等。',
        '对承诺的真实性负责'
    ].map(l => ({ label: l }));
    return parseCommitmentLines(content, fallback);
});

// 判断预览小样的依据是否选中
const isBasisSelected = (val: number) => {
    const basisStr = traceData.value?.certificate?.commitmentBasis;
    if (!basisStr) return false;
    const selected = parseBasisData(basisStr);
    return selected.includes(val);
};

const parseBasisData = (val: any) => {
    if (Array.isArray(val)) return val.map((item) => Number(item)).filter((item) => Number.isFinite(item));
    if (typeof val === 'number') return [val];
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item));
            }
        } catch (error) {
            return val
                .split(',')
                .map((item) => Number(item.trim()))
                .filter((item) => Number.isFinite(item));
        }
    }
    return [];
};

const traceRecords = computed(() => {
    if (!traceData.value) return [];
    const records: any[] = [];

    if (traceData.value.certificate) {
        records.push({
            time: traceData.value.certificate.issueDate || '2025-10-01 20:46',
            status: 'primary',
            type: 'certificate',
            typeLabel: '合格证',
            code: traceData.value.certificate.certificateCode,
            originData: traceData.value.certificate,
            details: [
                { label: '出证类型', value: getCertTypeLabel(traceData.value.certificate.certificateType) },
                { label: '样品名称', value: traceData.value.certificate.productName },
                { label: '重量/数量', value: `${traceData.value.certificate.quantity} (${getAgriUnitLabel(traceData.value.certificate.unit)})` },
                { label: '产品产地', value: traceData.value.certificate.productionArea },
                { label: '开具主体', value: traceData.value.certificate.subjectName }
            ]
        });
    }

    if (traceData.value.detectionReport) {
        records.push({
            time: traceData.value.detectionReport.detectionDate || '2025-09-28 14:30',
            status: 'success',
            type: 'report',
            typeLabel: '检测结果',
            code: traceData.value.detectionReport.recordCode || `DET-${traceData.value.detectionReport.id}`,
            originData: traceData.value.detectionReport,
            details: [
                { label: '检测机构', value: traceData.value.detectionReport.detectionOrgName || '所属工作站' },
                { label: '检测项目', value: traceData.value.detectionReport.detectStandard || '--' },
                { label: '结论判定', value: traceData.value.detectionReport.overallStatus === '阴性' ? '阴性/合格' : '阳性/未通过' }
            ]
        });
    }

    if (traceData.value.upstreamCertificate) {
        records.push({
            time: traceData.value.upstreamCertificate.issueDate || '2025-09-20 09:15',
            status: 'primary',
            type: 'certificate',
            typeLabel: '上游溯源',
            code: traceData.value.upstreamCertificate.certificateCode,
            originData: traceData.value.upstreamCertificate,
            details: [
                { label: '供应主体', value: traceData.value.upstreamCertificate.subjectName },
                { label: '产品产地', value: traceData.value.upstreamCertificate.productionArea || '--' }
            ]
        });
    }

    return records;
});

const handleViewCert = (data: any) => {
    activeCertData.value = data;
    showCertVisible.value = true;
};

const handleViewReport = (data: any) => {
    activeReportData.value = data;
    showReportVisible.value = true;
};

const connectBluetoothPrinter = async () => {
    if (!bluetoothPrinter.isSupported()) {
        ElMessage.error(bluetoothPrinter.getUnsupportedReason());
        return;
    }
    bluetoothConnecting.value = true;
    try {
        const name = await bluetoothPrinter.connect();
        ElMessage.success(`已连接打印机：${name}`);
    } catch (error: any) {
        ElMessage.error(error?.message || '蓝牙连接失败，请重试');
    } finally {
        bluetoothConnecting.value = false;
    }
};

const captureAreaToImg = async () => {
    const area = printAreaRef.value;
    if (!area || !activePrintCertData.value) return null;

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

const handleOpenPrintPreview = async (data: any) => {
    if (!data) {
        ElMessage.warning('暂无可打印的合格证信息');
        return;
    }
    activePrintCertData.value = data;
    printBasis.value = parseBasisData(data.commitmentBasis);
    previewSrc.value = null;
    printEffectPreviewSrc.value = null;
    preparedPrintBytes.value = null;
    printEffectLoading.value = true;
    printPreviewVisible.value = true;

    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 80));

    try {
        const img = await captureAreaToImg();
        previewSrc.value = img;
        if (img) {
            const payload = await bluetoothPrinter.buildPrintImagePayload(img, printImageOptions);
            printEffectPreviewSrc.value = payload.previewDataUrl;
            preparedPrintBytes.value = payload.bytes;
        }
    } catch (error) {
        console.error('生成打印预览失败', error);
        ElMessage.error('打印预览生成失败');
    } finally {
        printEffectLoading.value = false;
    }
};

const handlePrint = async (prepared?: string | null) => {
    const dataUrl = typeof prepared === 'string' ? prepared : await captureAreaToImg();
    if (!dataUrl) {
        ElMessage.error('生成打印内容失败');
        return;
    }
    if (!bluetoothReady.value) {
        ElMessage.warning('请先连接便携式蓝牙打印机');
        return;
    }
    bluetoothPrinting.value = true;
    try {
        if (!preparedPrintBytes.value) {
            const payload = await bluetoothPrinter.buildPrintImagePayload(dataUrl, printImageOptions);
            preparedPrintBytes.value = payload.bytes;
            if (!printEffectPreviewSrc.value) {
                printEffectPreviewSrc.value = payload.previewDataUrl;
            }
        }
        await bluetoothPrinter.print(preparedPrintBytes.value);
        ElMessage.success('蓝牙打印指令已发送');
    } catch (error: any) {
        console.error('蓝牙打印失败', error);
        ElMessage.error(`蓝牙打印失败：${error?.message || '请稍后重试'}`);
    } finally {
        bluetoothPrinting.value = false;
    }
};

const handleSearch = async () => {
    const code = searchCode.value?.trim();
    if (!code) { ElMessage.warning('请输入编号'); return; }
    loading.value = true;
    try {
        const res = await CertificateApi.traceCertificate(code);
        if (res) {
            traceData.value = res;
        } else {
            ElMessage.info('未查到相关数字档案');
            traceData.value = null;
        }
    } catch (e) { ElMessage.error('请求超时'); } finally { loading.value = false; }
};

onMounted(() => {
    const queryCode = route.query.code as string;
    if (queryCode) { searchCode.value = queryCode; handleSearch(); }
    bluetoothPrinter.reconnectLastDevice().catch(() => { });
});
</script>

<style scoped lang="scss">
$theme-color: #00B3ED;
$text-dark: #1e293b;
$text-sub: #64748b;
$bg-color: #f8fafc;
$green-hg: #558B2F;

.trace-explorer {
    min-height: 100vh;
    background-color: $bg-color;
}

/* 恢复 Hero Explorer 头部样式 */
.hero-header {
    background-color: #fff;
    padding: 80px 20px 100px;
    text-align: center;
    position: relative;
    border-bottom: 1px solid #e2e8f0;

    .brand-badge {
        display: inline-block;
        background: rgba(0, 179, 237, 0.1);
        color: $theme-color;
        padding: 6px 16px;
        border-radius: 50px;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 24px;
        letter-spacing: 2px;
    }

    .hero-title {
        font-size: 48px;
        font-weight: 800;
        color: $text-dark;
        margin-bottom: 16px;
    }

    .hero-subtitle {
        font-size: 18px;
        color: $text-sub;
        margin-bottom: 48px;
    }
}

.search-portal {
    max-width: 680px;
    margin: 0 auto;

    .search-inner {
        display: flex;
        background: #fff;
        padding: 6px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        border: 1px solid #e2e8f0;

        :deep(.portal-input) {
            flex: 1;

            .el-input__wrapper {
                box-shadow: none !important;
                padding-left: 20px;
            }

            .el-input__inner {
                height: 52px;
                font-size: 17px;
            }

            .search-icon {
                font-size: 20px;
                color: $theme-color;
            }
        }

        .portal-btn {
            height: 52px;
            padding: 0 36px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            background: $theme-color;
            border: none;
        }
    }
}

/* 结果区布局：原型 + 优化轴 */
.trace-results {
    max-width: 1100px;
    margin: 20px auto 16px;
    padding: 0 20px;
    position: relative;
    z-index: 10;
}

.section-container {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
}

.section-title-wrapper {
    position: relative;
    padding-bottom: 12px;
    margin-bottom: 24px;

    .section-title {
        font-size: 22px;
        font-weight: 700;
        color: $text-dark;
        margin: 0;
    }

    .title-accent {
        position: absolute;
        top: -10px;
        left: 0;
        width: 40px;
        height: 4px;
        background: $theme-color;
        border-radius: 2px;
    }
}

.cert-code-row {
    font-size: 16px;
    color: $text-sub;
    margin-bottom: 24px;

    span {
        color: $text-dark;
        font-weight: 700;
        font-family: monospace;
        margin-left: 8px;
    }
}

.basic-info-layout {
    display: flex;
    gap: 40px;
    border-top: 1px solid #f1f5f9;
    padding-top: 30px;
}

.proto-table {
    width: 100%;
    border-collapse: collapse;

    tr {
        border-bottom: 1px solid #f8fafc;

        &:last-child {
            border-bottom: none;
        }
    }

    td {
        padding: 12px 10px;
        font-size: 14px;

        &.label {
            width: 150px;
            color: $text-sub;
            text-align: right;
            padding-right: 30px;
        }

        &.value {
            color: $text-dark;
            font-weight: 600;
        }
    }

    &.mini {
        border: 1px solid #fbfcfe;

        td.label {
            width: 110px;
            padding-right: 20px;
        }
    }
}

/* 合格证图样 */
.hg-card-preview {
    width: 440px;
}

.hg-border-box {
    border: 1.5px solid $green-hg;
    border-radius: 4px;
    display: flex;
    background: #fff;
    min-height: 240px;
}

.hg-side-title {
    width: 44px;
    background: #f1f8e9;
    border-right: 1.5px solid $green-hg;
    writing-mode: vertical-rl;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $green-hg;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: 6px;
}

.hg-main-box {
    flex: 1;
    padding: 12px;
    position: relative;
}

.hg-promise-text {
    font-size: 10px;
    color: #444;

    .promise-header {
        font-weight: 700;
        margin-bottom: 4px;
    }

    .promise-items {
        line-height: 1.6;
        margin-bottom: 12px;
    }
}

.hg-fields-grid {
    font-size: 10px;

    .f-row {
        margin-bottom: 4px;
        color: #666;
    }
}

.hg-qr-box {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: #e5e7eb;
}

/* 优化后的时间轴样式：恢复 Prototype 位置同时保留视觉优化 */
.opt-timeline {
    padding-left: 150px;
    margin-top: 40px;
}

.tl-node {
    display: flex;
    gap: 40px;
    margin-bottom: 40px;
    position: relative;
}

.tl-time {
    width: 130px;
    position: absolute;
    left: -170px;
    text-align: right;
    top: 6px;

    .date {
        font-size: 15px;
        font-weight: 800;
        color: $text-dark;
        margin-bottom: 4px;
    }

    .hour {
        font-size: 12px;
        color: $text-sub;
    }
}

.tl-rail {
    width: 24px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .tl-dot {
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 0 0 4px #fff, 0 2px 8px rgba(0, 0, 0, 0.1);

        .dot-inner {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }

        &.primary {
            border: 2px solid $theme-color;

            .dot-inner {
                background: $theme-color;
            }
        }

        &.success {
            border: 2px solid #8bc34a;

            .dot-inner {
                background: #8bc34a;
            }
        }
    }

    .tl-line {
        position: absolute;
        top: 24px;
        bottom: -40px;
        width: 1.5px;
        background: #e2e8f0;
    }
}

.tl-main-card {
    flex: 1;
    border: 1px solid #eef2f6;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;

    &:hover {
        border-color: $theme-color;
        box-shadow: 0 4px 12px rgba(0, 179, 237, 0.08);
    }
}

.node-header {
    background: #f8fafc;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f5f9;

    .node-id {
        font-size: 16px;
        font-weight: 700;
        color: $text-dark;
    }
}

.node-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.theme-flat-btn {
    background: $theme-color !important;
    border: none !important;
    font-weight: 600;
}

.node-table-wrapper {
    padding: 20px;
}

.tl-end {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 7px;
    color: #cbd5e1;
    font-size: 12px;

    .end-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #e2e8f0;
    }
}

/* 初始功能展示区 */
.hero-footer-features {
    max-width: 1100px;
    margin: 40px auto 60px;
    padding: 0 20px;

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
    }

    .feature-card {
        background: #fff;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        border: 1px solid #e2e8f0;

        .icon-box {
            width: 60px;
            height: 60px;
            border-radius: 16px;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;

            &.primary {
                background: #e0f2fe;
                color: $theme-color;
            }

            &.success {
                background: #ecfdf5;
                color: #10b981;
            }

            &.warning {
                background: #fff7ed;
                color: #f59e0b;
            }
        }

        h4 {
            font-size: 18px;
            font-weight: 700;
            color: $text-dark;
            margin-bottom: 8px;
        }

        p {
            font-size: 14px;
            color: $text-sub;
        }
    }
}

/* 合格证预览弹窗样式 */
.cert-preview-container {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    padding: 10px;

    .cert-ticket {
        flex: 1.2;
        border: 1.5px solid #558B2F;
        border-radius: 4px;
        padding: 20px;

        .cert-header {
            margin-bottom: 20px;

            .cert-id-tag {
                background: #f1f8e9;
                color: #558B2F;
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 2px;
            }
        }

        .main-title {
            font-size: 24px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 15px;
        }

        .sub-title {
            font-size: 14px;
            font-weight: 600;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .middle-flex {
            display: flex;
            justify-content: space-between;
        }

        .small-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .basis-text-list {
            font-size: 12px;
            color: #666;

            div {
                margin-bottom: 4px;
            }
        }
    }

    .cert-info-table {
        flex: 1;

        .table-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
        }

        .mini-table {
            border: 1px solid #eee;

            .m-row {
                display: flex;
                border-bottom: 1px solid #eee;

                &:last-child {
                    border-bottom: none;
                }

                .m-label {
                    width: 100px;
                    background: #fafafa;
                    padding: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    border-right: 1px solid #eee;
                }

                .m-val {
                    flex: 1;
                    padding: 12px;
                    font-size: 13px;
                }
            }
        }
    }
}

.report-preview-wrap {
    height: 70vh;
    overflow-y: auto;
    background: #f5f5f5;
    padding: 20px;
}

.bluetooth-btn {
    border-color: #00B3ED !important;
    color: #00B3ED !important;
    background: #F0F9FF !important;
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

.print-template-source {
    position: fixed;
    left: -99999px;
    top: 0;
    width: 520px;
    background: #fff;
    z-index: -1;
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
                    color: #000 !important;
                }

                .label {
                    width: 130px !important;
                }
            }
        }

        .image-section {
            margin-top: 12px !important;

            .info-title {
                margin-bottom: 8px !important;
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

.divider {
    height: 1px;
    border-top: 1px dashed #D1D5DB;
    margin: 32px 0;
}

.print-footer-space {
    height: 80px;
}
</style>
