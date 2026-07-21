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

                    <!-- 右侧：公共合格证预览 -->
                    <CertificatePreview class="trace-certificate-preview" :certificate="traceData.certificate"
                        :basis-options="basisOptions" />
                </div>
            </section>

            <!-- 2. 产品溯源：使用优化后的时间轴样式 -->
            <section class="section-container">
                <div class="section-title-wrapper">
                    <h2 class="section-title">产品溯源</h2>
                </div>

                <div class="opt-timeline">
                    <div v-for="(node, index) in traceRecords" :key="index" class="tl-node" :class="{
                        'is-last': index === traceRecords.length - 1,
                        'is-single': traceRecords.length === 1
                    }">
                        <div class="tl-time">
                            {{ formatTimelineTime(node.time) }}
                        </div>

                        <div class="tl-rail">
                            <div class="tl-dot" :class="node.status">
                            </div>
                        </div>

                        <div class="tl-main-card">
                            <div class="node-header">
                                <div class="node-id">{{ node.typeLabel }}编号：<span>{{ node.code || '--' }}</span></div>
                                <div class="node-actions">
                                    <el-button v-if="node.type === 'certificate'" type="primary" class="theme-flat-btn"
                                        @click="handleViewCert(node.originData)">查看合格证图片</el-button>
                                    <el-button type="primary" class="theme-flat-btn"
                                        @click="handleViewReport(node.originData)">查看检测报告</el-button>
                                </div>
                            </div>

                            <div class="node-table-wrapper">
                                <table class="proto-table mini trace-node-table">
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
        <el-dialog v-model="showCertVisible" title="合格证预览" width="720px" append-to-body destroy-on-close
            class="cert-preview-dialog">
            <CertificatePreview v-if="activeCertData" class="dialog-certificate-preview" :certificate="activeCertData"
                :basis-options="basisOptions" />
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

        <div ref="printAreaRef" class="certificate-print-source">
            <CertificatePrintTemplate v-if="activePrintCertData" :certificate="activePrintCertData"
                :basis-options="selectedPrintBasisOptions" :commitment-lines="printCommitmentLines"
                :qr-text="printQrText" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Search, Monitor, Check, Connection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as CertificateApi from '@/api/agri/certificate/index';
import { useDict } from '@/hooks/web/useDict';
import RapidDetectionReport from '../rapidDetection/components/RapidDetectionReport.vue';
import { CertificatePreview } from '@/components/CertificatePreview';
import { BluetoothPrinter } from '@/utils';
import { getAgriUnitLabel } from '@/utils/agriUnit';
import { CertificatePrintTemplate } from '@/components/CertificatePrintTemplate';
import {
    captureCertificatePrintArea,
    certificatePrintImageOptions,
    getSelectedCertificateBasisOptions,
    parseCertificateBasis,
    resolveCertificateCommitmentLines
} from '@/utils/certificatePrint';

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

const selectedPrintBasisOptions = computed(() =>
    getSelectedCertificateBasisOptions(basisOptions, printBasis.value)
);

const printCommitmentLines = computed(() =>
    resolveCertificateCommitmentLines(
        activePrintCertData.value?.commitmentContent,
        selectedPrintBasisOptions.value.length ? selectedPrintBasisOptions.value : basisOptions
    )
);

const printQrText = computed(() =>
    activePrintCertData.value?.qrCode || activePrintCertData.value?.certificateCode || ''
);

/**\n * formatTimelineTime：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatTimelineTime = (value: any) => {
    const [date = '--', hour = ''] = String(value || '').split(' ');
    return `${date}${hour ? `  ${hour}` : ''}`;
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
                { label: '开具服务主体', value: traceData.value.certificate.subjectName }
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

/**\n * handleViewCert：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleViewCert = (data: any) => {
    activeCertData.value = data;
    showCertVisible.value = true;
};

/**\n * handleViewReport：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleViewReport = (data: any) => {
    if (!data) {
        ElMessage.warning('暂无检测报告');
        return;
    }
    activeReportData.value = data;
    showReportVisible.value = true;
};

/**\n * handleViewTraceReport：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleViewTraceReport = () => {
    handleViewReport(traceData.value?.detectionReport);
};

/**\n * connectBluetoothPrinter：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
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

/**\n * captureAreaToImg：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const captureAreaToImg = async () => {
    if (!activePrintCertData.value) return null;
    return captureCertificatePrintArea(printAreaRef.value);
};

/**\n * handleOpenPrintPreview：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleOpenPrintPreview = async (data: any) => {
    if (!data) {
        ElMessage.warning('暂无可打印的合格证信息');
        return;
    }
    activePrintCertData.value = data;
    printBasis.value = parseCertificateBasis(data.commitmentBasis);
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
            const payload = await bluetoothPrinter.buildPrintImagePayload(img, certificatePrintImageOptions);
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

/**\n * handlePrint：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
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
            const payload = await bluetoothPrinter.buildPrintImagePayload(dataUrl, certificatePrintImageOptions);
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

/**\n * handleSearch：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
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

/* 公共合格证预览在当前页面中的布局宽度 */
.trace-certificate-preview {
    flex: 0 0 470px;
}

@media (max-width: 1080px) {
    .basic-info-layout {
        flex-direction: column;
    }

    .trace-certificate-preview {
        width: 100%;
        max-width: 520px;
        flex-basis: auto;
    }
}

/* 产品溯源时间轴：贴近原型的开放式纵向流 */
.opt-timeline {
    position: relative;
    margin-top: 22px;
    padding: 14px 0 0;
}

.tl-node {
    position: relative;
    display: grid;
    grid-template-columns: 210px 44px minmax(0, 1fr);
    column-gap: 0;
    align-items: start;
    min-height: 228px;
    padding-bottom: 34px;
}

.tl-time {
    padding-top: 9px;
    text-align: right;
    color: #0f172a;
    font-size: 17px;
    font-weight: 500;
    line-height: 30px;
    white-space: nowrap;
}

.tl-rail {
    position: relative;
    display: flex;
    justify-content: center;
    align-self: stretch;
    min-height: 100%;

    &::before {
        content: '';
        position: absolute;
        top: 34px;
        bottom: -10px;
        left: 50%;
        width: 2px;
        transform: translateX(-50%);
        background-image: repeating-linear-gradient(to bottom,
                #d8dee9 0,
                #d8dee9 8px,
                transparent 8px,
                transparent 16px);
    }

    .tl-dot {
        position: relative;
        z-index: 2;
        width: 20px;
        height: 20px;
        margin-top: 13px;
        border-radius: 50%;
        background: $theme-color;
        box-shadow: inset 0 0 0 3px #fff, 0 0 0 5px #fff, 0 0 0 7px rgba(0, 179, 237, 0.22);

        &.primary {
            background: $theme-color;
        }

        &.success {
            background: #6fc14f;
            box-shadow: inset 0 0 0 3px #fff, 0 0 0 5px #fff, 0 0 0 7px rgba(111, 193, 79, 0.22);
        }
    }
}

.tl-node.is-last .tl-rail::before,
.tl-node.is-single .tl-rail::before {
    bottom: -66px;
}

.tl-main-card {
    min-width: 0;
    padding: 0 0 28px 22px;
    background: transparent;
    border-bottom: 1px dashed #d8dee9;
}

.node-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 28px;
    min-height: 76px;
    padding: 0 0 18px;

    .node-id {
        min-width: 0;
        padding-top: 6px;
        color: #111827;
        font-size: 20px;
        font-weight: 800;
        line-height: 32px;
        letter-spacing: 0;

        span {
            margin-left: 8px;
            font-weight: 500;
        }
    }
}

.node-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 14px;
    flex-wrap: wrap;
    flex: 0 0 auto;
}

.theme-flat-btn {
    min-width: 128px;
    height: 48px;
    padding: 0 18px;
    border-radius: 2px !important;
    background: $theme-color !important;
    border: none !important;
    color: #fff !important;
    font-size: 14px;
    font-weight: 800;
    box-shadow: none !important;

    &:hover,
    &:focus {
        background: #009fd4 !important;
    }
}

.node-table-wrapper {
    max-width: 700px;
    padding: 0;
}

.trace-node-table {
    border: none !important;

    tr {
        border-bottom: 1px solid #cfcfcf;
    }

    td {
        height: 38px;
        padding: 0 10px;
        color: #111;
        font-size: 13px;
        line-height: 38px;

        &.label {
            width: 145px !important;
            padding-right: 6px !important;
            color: #111;
            font-weight: 700;
            text-align: right;
        }

        &.value {
            color: #111;
            font-weight: 600;
        }
    }
}

.tl-end {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: 227px;
    color: #94a3b8;
    font-size: 13px;

    .end-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #e2e8f0;
    }
}

@media (max-width: 1080px) {
    .tl-node {
        grid-template-columns: 120px 36px minmax(0, 1fr);
        min-height: 0;
        padding-bottom: 34px;
    }

    .tl-time {
        font-size: 15px;
        line-height: 26px;
    }

    .tl-rail {
        &::before {
            top: 32px;
        }

        .tl-dot {
            width: 16px;
            height: 16px;
            box-shadow: inset 0 0 0 3px #fff, 0 0 0 4px #fff, 0 0 0 6px rgba(0, 179, 237, 0.2);
        }
    }

    .tl-main-card {
        padding-left: 12px;
    }

    .node-header {
        flex-direction: column;
        gap: 14px;
        min-height: 0;
    }

    .node-header .node-id {
        font-size: 18px;
        line-height: 28px;
    }

    .node-actions {
        justify-content: flex-start;
        gap: 10px;
    }

    .theme-flat-btn {
        min-width: 118px;
        height: 44px;
        padding: 0 14px;
        font-size: 13px;
    }

    .trace-node-table td {
        height: 38px;
        font-size: 13px;
        line-height: 38px;

        &.label {
            width: 100px !important;
        }
    }

    .tl-end {
        margin-left: 134px;
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
.dialog-certificate-preview {
    width: 100%;
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
</style>
