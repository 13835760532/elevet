<template>
    <div class="table-container">
        <div class="header-fixed-container">
            <PageHeader title="检测详情" desc="样品检测报告，展示样品信息和检测结果" />
        </div>

        <!-- 卡片内容区域 -->
        <div class="content-card">
            <!-- 样品检测信息 -->
            <div class="section-header">
                <h3 class="section-title">样品检测信息</h3>
                <div v-if="recordData && recordData.overallResult !== null && recordData.overallResult !== undefined"
                    class="stamp-img-container">
                    <img v-if="stampImageSrc" :src="stampImageSrc" class="status-stamp-img" />
                </div>
            </div>

            <div class="info-grid">
                <div class="info-row">
                    <span class="label">样品名称</span>
                    <span class="value">{{ sampleInfo.sampleName }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品编号</span>
                    <span class="value">{{ sampleInfo.sampleNo }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品产地</span>
                    <span class="value">{{ sampleInfo.sampleArea }}</span>
                </div>
                <div class="info-row">
                    <span class="label">数量（重量）</span>
                    <span class="value">{{ sampleInfo.specification || '--' }}</span>
                </div>
                <div class="info-row">
                    <span class="label">被检主体</span>
                    <span class="value">{{ sampleInfo.producer }}</span>
                </div>
                <div class="info-row">
                    <span class="label">抽检区域</span>
                    <span class="value">{{ sampleInfo.checkArea }}</span>
                </div>
                <div class="info-row">
                    <span class="label">检测机构</span>
                    <span class="value">{{ sampleInfo.testOrg }}</span>
                </div>
                <div class="info-row">
                    <span class="label">检测人员</span>
                    <span class="value">{{ sampleInfo.tester }}</span>
                </div>
                <div class="info-row">
                    <span class="label">检测日期</span>
                    <span class="value">{{ sampleInfo.testDate }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品来源</span>
                    <span class="value">{{ sampleInfo.source }}</span>
                </div>
                <div class="info-row photo-row">
                    <span class="label">检测照片</span>
                    <div class="photo-preview-group">
                        <el-image :src="sampleInfo.photo" fit="cover" :preview-src-list="[sampleInfo.photo]"
                            preview-teleported />
                        <span class="photo-tip">点击查看大图</span>
                    </div>
                </div>
            </div>

            <!-- 检测结果详情 -->
            <div class="section-header mt-40">
                <h3 class="section-title">检测结果详情</h3>
            </div>
            <div class="result-table-wrapper">
                <el-table :data="resultList" class="result-table"
                    :header-cell-style="{ background: '#F8FAFC', color: '#475569', fontWeight: '600' }">
                    <el-table-column label="通道" prop="channel" width="80" align="center" />
                    <el-table-column label="检测项目" prop="item" min-width="200" align="center" show-overflow-tooltip />
                    <el-table-column label="检测值（T/C值）" prop="tcValue" width="180" align="center">
                        <template #default="scope">
                            <span>
                                {{
                                    scope.row.tcValue !== null && scope.row.tcValue !== undefined && scope.row.tcValue !==
                                        ''
                                        ? (isNaN(Number(scope.row.tcValue)) ? scope.row.tcValue :
                                            Number(scope.row.tcValue).toFixed(2))
                                        : '--'
                                }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="检测时间" prop="detectionDate" width="160" align="center">
                        <template #default="scope">
                            {{ scope.row.detectionDate ? formatDate(scope.row.detectionDate, 'YYYY-MM-DD HH:mm:ss') :
                                '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column label="检测结果" prop="result" width="140" align="center">
                        <template #default="scope">
                            <el-tag
                                :type="(scope.row.result === '阴性' || scope.row.result === '未检出' || scope.row.result === '合格') ? 'success' : 'danger'"
                                effect="dark" size="small" class="result-tag">
                                {{ scope.row.result }}
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 检测报告 -->
            <div class="section-header mt-40">
                <h3 class="section-title">检测报告</h3>
                <div v-if="recordData" class="report-code">报告编号：{{ recordData.recordCode }}</div>
            </div>
            <div class="report-section">
                <div class="report-preview" @click="handlePreviewReport">
                    <RapidDetectionReport class="hidden-report-for-preview" :data="formattedData"
                        :results="formattedResults" :editable="false" />
                </div>
                <div v-if="recordData" class="report-actions">
                    <el-button type="primary" class="action-btn" @click="handlePreviewReport">报告预览</el-button>
                    <el-button type="primary" class="action-btn" @click="handleDownloadReport">报告下载</el-button>
                </div>
            </div>

            <!-- 下载专用隐藏实例（完全无缩放，确保导出正常） -->
            <div style="position: absolute; left: -9999px; top: 0; width: 210mm; height: auto; pointer-events: none;">
                <RapidDetectionReport ref="reportComponentRef" :data="formattedData" :results="formattedResults"
                    :editable="false" />
            </div>

            <!-- 报告预览弹窗 -->
            <el-dialog v-model="reportDialogVisible" title="检测报告预览" width="1000px" class="report-dialog" align-center>
                <div class="report-dialog-content">
                    <RapidDetectionReport :data="formattedData" :results="formattedResults" :editable="false" />
                </div>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="reportDialogVisible = false">关闭预览</el-button>
                        <el-button type="primary" @click="handleDownloadReport">立即导出</el-button>
                    </div>
                </template>
            </el-dialog>

            <!-- 底部按钮 -->
            <div class="footer-actions">
                <el-button @click="handleBack" class="btn-back">返回</el-button>
                <el-button type="primary" @click="handleContinueTest" class="btn-continue">继续检测</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ZoomIn } from '@element-plus/icons-vue';
import { getDetectionRecord } from '@/api/agri/detectionRecord';
import { formatDate } from '@/utils/formatTime';
import { getAgriUnitLabel } from '@/utils';
import RapidDetectionReport from '../components/RapidDetectionReport.vue';

import imgYinXing from '@/assets/imgs/status/阴性.png';
import imgYangXing from '@/assets/imgs/status/阳性.png';
import imgRuoYang from '@/assets/imgs/status/弱阳.png';
import imgChuCuo from '@/assets/imgs/status/出错.png';

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const recordData = ref(null);
const isQualified = computed(() => recordData.value?.overallResult === 0);

const stampImageSrc = computed(() => {
    if (!recordData.value) return '';
    const val = recordData.value.overallResult;
    // overallResult logic might need an update if there's a new 弱阳 enum, but if we just base it on results:
    const hasAbnormal = resultList.value.some(item => item.result?.includes('异常') || item.result?.includes('出错') || item.status === '异常' || item.status === '出错');
    if (hasAbnormal) return imgChuCuo;
    const hasYang = resultList.value.some(item => item.result?.includes('阳') && !item.result?.includes('弱阳') || item.status === '阳性');
    if (hasYang) return imgYangXing;
    const hasRuoYang = resultList.value.some(item => item.result?.includes('弱阳') || item.status === '弱阳');
    if (hasRuoYang) return imgRuoYang;
    return imgYinXing; // default to 阴性 if qualified
});
const reportData = ref(null);
const sampleInfo = ref({
    sampleNo: '--',
    source: '--',
    sampleName: '--',
    origin: '--',
    quantity: '--',
    checkArea: '--',
    producer: '--',
    region: '--',
    testOrg: '系统默认检测中心',
    tester: '--',
    testDate: '--',
    photo: '',
    specification: ''
});

const resultList = ref([]);
const reportImage = ref('');
const reportDialogVisible = ref(false);
const reportComponentRef = ref(null);

/** 将检测记录转换为报告组件约定的数据结构，并补齐报告展示所需默认值。 */
const formattedData = computed(() => {
    if (!recordData.value) return {};
    const res = recordData.value;
    return {
        recordCode: res.recordCode,
        sample: {
            sampleCode: res.sampleCode,
            sampleName: res.productName,
            sampleSource: res.sourceType === 'PLAN_TASK' ? '方案任务' : '自主录入',
            productionArea: res.detectionArea,
        },
        detectionDate: res.detectionDate,
        detectionOrgName: res.detectionOrgName || '系统检测机构',
        detector: res.detector || '--',
        detectionMethod: res.detectionMethod || '胶体金免疫层析法',
        detectStandard: res.detectStandard || '--',
        subjectName: res.subjectName,
        detectionArea: res.detectionArea,
        detectionDate: sampleInfo.value.testDate
    };
});

/** 将 AI 返回的多种结果文字归一为阴性、阳性、弱阳或出错状态。 */
const formattedResults = computed(() => {
    return resultList.value.map(item => {
        // 标准化结果文字
        let statusText = item.result;
        if (statusText?.includes('弱阳')) {
            statusText = '弱阳';
        } else if (statusText?.includes('阳') || statusText?.includes('不合格')) {
            statusText = '阳性';
        } else if (statusText?.includes('阴') || statusText?.includes('合格')) {
            statusText = '阴性';
        } else if (statusText?.includes('异常') || statusText?.includes('出错')) {
            statusText = '出错';
        }

        return {
            cardChannel: item.channel,
            codeName: item.item,
            result: item.tcValue,
            concentration: item.concentration,
            status: statusText
        };
    });
});

/**
 * 加载检测详情并解析 AI 识别快照。
 * AI 快照中的项目、识别时间和试纸图片优先于记录基础字段，用于还原检测当时的报告内容。
 */
const initData = async () => {
    const id = route.query.id;
    if (!id) return;

    loading.value = true;
    try {
        const [res] = await Promise.all([
            getDetectionRecord(id),
            // getDetectionReportByRecordId(id).catch(() => null)
        ]);

        recordData.value = res;
        //reportData.value = reportRes;

        // 映射样品信息
        sampleInfo.value = {
            sampleNo: res.sampleCode || res.recordCode || '--',
            source: res.sourceType === 'PLAN_TASK' ? '方案任务' : (res.sourceType === 'SELF_TASK' ? '历史自主' : '自主录入'),
            sampleName: res.productName || '--',
            origin: res.detectionArea || '--',
            sampleArea: res.sampleArea || '--',
            quantity: '--',
            checkArea: res.detectionArea || '--',
            producer: res.subjectName || '--',
            region: res.detectionArea || '--',
            testOrg: res.detectionOrgName || res.sourceType === 'PLAN_TASK' ? '检测服务中心' : '自主录入',
            tester: res.detector || '--',
            testDate: res.createTime ? formatDate(res.createTime, 'YYYY-MM-DD') : '--',
            photo: res.testPaperImageUrl || '',
            specification: (res.specification || '') + getAgriUnitLabel(res.unit)
        };

        // 解析 AI 结果 JSON
        if (res.aiRecognitionResult) {
            try {
                const aiRes = JSON.parse(res.aiRecognitionResult);
                console.log(aiRes)
                if (aiRes.results && Array.isArray(aiRes.results)) {
                    resultList.value = aiRes.results.map(item => ({
                        channel: item.cardChannel || '--',
                        item: item.codeName || '--',
                        tcValue: item.result || '--',
                        concentration: item.concentration || '--',
                        result: String(item.status) === '0' ? '合格' : (String(item.status) === '1' ? '不合格' : (String(item.status) === '2' ? '结果异常' : (item.status || '--'))),
                        detectionDate: item.detectionDate // 注入检测时间
                    }));
                }
                sampleInfo.value.testDate = aiRes.timestamp
                sampleInfo.value.photo = aiRes.testPaperImageUrl || '';
            } catch (e) {
                console.error('解析AI结果失败', e);
            }
        }

        reportImage.value = res.testPaperImageUrl;
    } catch (e) {
        console.error('获取详情失败', e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    initData();
});

const handleBack = () => {
    router.back();
};

const handleContinueTest = () => {
    router.push('/rapidDetection/taskDetectionCreate');
};

const handlePreviewReport = () => {
    reportDialogVisible.value = true;
};

const handleDownloadReport = () => {
    if (reportComponentRef.value) {
        reportComponentRef.value.handleDownload();
    }
};
</script>

<style lang="scss" scoped>
.table-container {
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    gap: 20px;
}

.header-fixed-container {
    flex-shrink: 0;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    position: relative;

    &.mt-40 {
        margin-top: 40px;
    }

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #00B3ED;
        margin: 0;
        position: relative;
        padding-left: 12px;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #00B3ED;
            border-radius: 2px;
        }
    }
}

/* 印章样式 */
.stamp-img-container {
    position: absolute;
    top: -10px;
    right: 40px;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;

    .status-stamp-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}

/* 信息网格 */
.info-grid {
    max-width: 800px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 40px;

    .info-row {
        display: flex;
        align-items: flex-start;
        font-size: 14px;

        .label {
            color: #666;
            font-weight: 500;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            box-sizing: border-box;

            &::after {
                content: '：';
                margin-left: auto;
                padding-right: 12px;
            }
        }

        .value {
            color: #333;
            flex: 1;
            align-self: center;
        }

        &.photo-row {
            grid-column: span 2;
            align-items: flex-start;

            .photo-preview {
                width: 80px;
                height: 50px;
                border: 1px solid #E5E7EB;
                border-radius: 4px;
                overflow: hidden;
                background: #F3F4F6;

                .el-image {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}

/* 结果表格 */
.result-tag {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: none;
    min-width: 60px;
}

:deep(.result-table) {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #F1F5F9;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    .el-table__header {
        th {
            background-color: #F8FAFC !important;
            padding: 14px 0;
        }
    }

    .el-table__row {
        height: 60px;
        transition: all 0.2s;

        &:hover>td {
            background-color: #F8FAFC !important;
        }
    }

    td.el-table__cell {
        border-bottom: 1px solid #F1F5F9;
        font-size: 14px;
        color: #334155;
    }
}

.photo-preview-group {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-image {
        width: 100px;
        height: 60px;
        border: 2px solid #F1F5F9;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
            border-color: #00B3ED;
            opacity: 0.9;
        }
    }

    .photo-tip {
        font-size: 12px;
        color: #94A3B8;
        background: #F8FAFC;
        padding: 4px 8px;
        border-radius: 4px;
    }
}

/* 报告区域 */
.report-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
}

.report-preview {
    width: 270px;
    height: auto;
    min-height: 382px;
    max-height: 500px;
    /* 限制预览图的最大高度 */
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    overflow-y: auto;
    overflow-x: hidden;
    background: #fff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    position: relative;
    cursor: pointer;
    transition: all 0.3s;
    background: #f8fafc;
    padding: 0;
    /* 移除外层内边距以贴合边缘 */

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .hidden-report-for-preview {
        zoom: 0.34;
        width: 210mm;
        height: auto;
        pointer-events: none;
        box-shadow: none;
        margin: 0;
        padding-top: 5mm !important;
        /* 大幅压缩顶部空白 */
    }
}

.report-actions {
    display: flex;
    gap: 16px;
    margin-top: 15px;

    .action-btn {
        min-width: 100px;
        height: 36px;
        border-radius: 6px;
        font-weight: 500;
        font-size: 14px;
    }
}

.report-dialog-content {
    background: #fff;
    padding: 0 30px;
    display: flex;
    justify-content: center;
    max-height: 75vh;
    overflow-y: auto;

    .el-dialog__body {
        padding-bottom: 40px;
    }

    .report-paper {
        box-shadow: none !important;
        margin-bottom: 30px;
    }
}

.report-tip {
    width: 100%;
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 60px;
    padding-top: 30px;
    border-top: 1px dashed #D1D5DB;

    .el-button {
        min-width: 140px;
        height: 44px;
    }

    .btn-back {
        border-color: #D1D5DB;
        color: #333;
    }
}
</style>
<style>
.report-dialog .el-dialog__body {
    padding-bottom: 24px;
}
</style>
