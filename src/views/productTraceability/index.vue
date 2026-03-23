<template>
    <div class="trace-explorer" v-loading="loading">
        <!-- 头部：恢复之前的 Hero Explorer 风格（搜索框在下） -->
        <section class="hero-header">
            <div class="hero-bg"></div>
            <div class="hero-body">
                <div class="brand-badge">全程溯源 · 质量护航</div>
                <h1 class="hero-title">每一份生机，皆可追本溯源</h1>
                <p class="hero-subtitle">全程数字追溯，守护每一份健康承诺</p>
                
                <div class="search-portal">
                    <div class="search-inner">
                        <el-input 
                            v-model="searchCode" 
                            placeholder="请输入 20 位电子合格证编号开启追溯" 
                            class="portal-input"
                            @keyup.enter="handleSearch"
                        >
                            <template #prefix>
                                <el-icon class="search-icon"><Search /></el-icon>
                            </template>
                        </el-input>
                        <el-button type="primary" class="portal-btn" @click="handleSearch">
                            探索档案
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
                            <tr><td class="label">出证类型</td><td class="value">{{ getCertTypeLabel(traceData.certificate?.certificateType) }}</td></tr>
                            <tr><td class="label">样品名称</td><td class="value">{{ traceData.certificate?.productName }}</td></tr>
                            <tr><td class="label">重量/数量</td><td class="value">{{ traceData.certificate?.quantity }} ({{ traceData.certificate?.unit }})</td></tr>
                            <tr><td class="label">产品产地</td><td class="value">{{ traceData.certificate?.productionArea }}</td></tr>
                            <tr><td class="label">生产经营主体</td><td class="value">{{ traceData.certificate?.subjectName }}</td></tr>
                            <tr><td class="label">联系人</td><td class="value">{{ traceData.certificate?.contactName }}</td></tr>
                            <tr><td class="label">联系电话</td><td class="value">{{ traceData.certificate?.contactPhone }}</td></tr>
                            <tr><td class="label">开具日期</td><td class="value">{{ traceData.certificate?.issueDate }}</td></tr>
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
                                        <div>○ 不使用禁用农药兽药、停用兽药和非法添加物</div>
                                        <div>○ 常规农药兽药残留不超标</div>
                                        <div>○ 对承诺的真实性负责</div>
                                    </div>
                                    <p class="basis-header">承诺依据：</p>
                                    <div class="basis-items">
                                        <div>○ 委托检测 ○ 自我检测</div>
                                        <div>○ 内部质量控制 ○ 自我承诺</div>
                                    </div>
                                </div>
                                <div class="hg-fields-grid">
                                    <div class="f-row">品名：{{ traceData.certificate?.productName }}</div>
                                    <div class="f-row">日期：{{ traceData.certificate?.issueDate }}</div>
                                    <div class="f-row">数量：{{ traceData.certificate?.quantity }}{{ traceData.certificate?.unit }}</div>
                                    <div class="f-row">产地：{{ traceData.certificate?.productionArea }}</div>
                                </div>
                                <div class="hg-qr-box"><el-icon><VideoPlay /></el-icon></div>
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
                                    <el-button type="primary" size="small" class="theme-flat-btn">查看合格证图片</el-button>
                                    <el-button type="primary" size="small" class="theme-flat-btn">查看检测报告</el-button>
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
                    <div class="icon-box primary"><el-icon><Monitor /></el-icon></div>
                    <h4>全链路数字化</h4>
                    <p>生产、检测、流通全流程存档</p>
                </div>
                <div class="feature-card">
                    <div class="icon-box success"><el-icon><Check /></el-icon></div>
                    <h4>权威认证保障</h4>
                    <p>监管部门溯源码，数据真实</p>
                </div>
                <div class="feature-card">
                    <div class="icon-box warning"><el-icon><Connection /></el-icon></div>
                    <h4>多级向上追溯</h4>
                    <p>层层深挖，直击生产源头</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Search, VideoPlay, Monitor, Check, Connection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as CertificateApi from '@/api/agri/certificate/index';
import { useDict } from '@/hooks/web/useDict';

defineOptions({
    name: 'ProductTraceability'
});

const route = useRoute();
const searchCode = ref('');
const loading = ref(false);
const traceData = ref<any>(null);

const { getLabel: getCertTypeLabel } = useDict('agri_certificate_type', 'int');

const traceRecords = computed(() => {
    if (!traceData.value) return [];
    const records: any[] = [];
    
    if (traceData.value.certificate) {
        records.push({
            time: '2025-10-01 20:46',
            status: 'primary',
            typeLabel: '合格证',
            code: traceData.value.certificate.certificateCode,
            details: [
                { label: '出证类型', value: getCertTypeLabel(traceData.value.certificate.certificateType) },
                { label: '样品名称', value: traceData.value.certificate.productName },
                { label: '重量/数量', value: `${traceData.value.certificate.quantity} (${traceData.value.certificate.unit})` },
                { label: '产品产地', value: traceData.value.certificate.productionArea },
                { label: '开具主体', value: traceData.value.certificate.subjectName }
            ]
        });
    }

    if (traceData.value.detectionReport) {
        records.push({
            time: '2025-09-28 14:30', 
            status: 'success',
            typeLabel: '检测结果',
            code: `DET-A20250928`,
            details: [
                { label: '实验室', value: '所属工作站' },
                { label: '样品名称', value: traceData.value.certificate?.productName },
                { label: '结论判定', value: traceData.value.detectionReport.overallResult === 0 ? '阴性/合格' : '阳性/未通过' }
            ]
        });
    }

    if (traceData.value.upstreamCertificate) {
        records.push({
            time: '2025-09-20 09:15',
            status: 'primary',
            typeLabel: '上游溯源',
            code: traceData.value.upstreamCertificate.certificateCode,
            details: [
                { label: '供应主体', value: traceData.value.upstreamCertificate.subjectName },
                { label: '原产基地', value: '上游标准化示范区' }
            ]
        });
    }
    
    return records;
});

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
        padding: 6px 16px; border-radius: 50px;
        font-size: 13px; font-weight: 700; margin-bottom: 24px; letter-spacing: 2px;
    }
    
    .hero-title { font-size: 48px; font-weight: 800; color: $text-dark; margin-bottom: 16px; }
    .hero-subtitle { font-size: 18px; color: $text-sub; margin-bottom: 48px; }
}

.search-portal {
    max-width: 680px;
    margin: 0 auto;
    .search-inner {
        display: flex; background: #fff; padding: 6px; border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;
        
        :deep(.portal-input) {
            flex: 1;
            .el-input__wrapper { box-shadow: none !important; padding-left: 20px; }
            .el-input__inner { height: 52px; font-size: 17px; }
            .search-icon { font-size: 20px; color: $theme-color; }
        }
        
        .portal-btn {
            height: 52px; padding: 0 36px; border-radius: 12px;
            font-weight: 700; font-size: 16px; background: $theme-color; border: none;
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
    background: #fff; border-radius: 16px; padding: 32px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    margin-bottom: 16px;
}

.section-title-wrapper {
    position: relative; padding-bottom: 12px; margin-bottom: 24px;
    .section-title { font-size: 22px; font-weight: 700; color: $text-dark; margin: 0; }
    .title-accent { position: absolute; top: -10px; left: 0; width: 40px; height: 4px; background: $theme-color; border-radius: 2px; }
}

.cert-code-row {
    font-size: 16px; color: $text-sub; margin-bottom: 24px;
    span { color: $text-dark; font-weight: 700; font-family: monospace; margin-left: 8px; }
}

.basic-info-layout { display: flex; gap: 40px; border-top: 1px solid #f1f5f9; padding-top: 30px; }

.proto-table {
    width: 100%; border-collapse: collapse;
    tr { border-bottom: 1px solid #f8fafc; &:last-child { border-bottom: none; } }
    td {
        padding: 12px 10px; font-size: 14px;
        &.label { width: 150px; color: $text-sub; text-align: right; padding-right: 30px; }
        &.value { color: $text-dark; font-weight: 600; }
    }
    &.mini { border: 1px solid #fbfcfe; td.label { width: 110px; padding-right: 20px; } }
}

/* 合格证图样 */
.hg-card-preview { width: 440px; }
.hg-border-box { border: 1.5px solid $green-hg; border-radius: 4px; display: flex; background: #fff; min-height: 240px; }
.hg-side-title {
    width: 44px; background: #f1f8e9; border-right: 1.5px solid $green-hg;
    writing-mode: vertical-rl; display: flex; align-items: center; justify-content: center;
    color: $green-hg; font-weight: 800; font-size: 18px; letter-spacing: 6px;
}
.hg-main-box { flex: 1; padding: 12px; position: relative; }
.hg-promise-text {
    font-size: 10px; color: #444; .promise-header { font-weight: 700; margin-bottom: 4px; }
    .promise-items { line-height: 1.6; margin-bottom: 12px; }
}
.hg-fields-grid { font-size: 10px; .f-row { margin-bottom: 4px; color: #666; } }
.hg-qr-box { position: absolute; top: 10px; right: 10px; font-size: 24px; color: #e5e7eb; }

/* 优化后的时间轴样式：恢复 Prototype 位置同时保留视觉优化 */
.opt-timeline { padding-left: 150px; margin-top: 40px; }

.tl-node { display: flex; gap: 40px; margin-bottom: 40px; position: relative; }

.tl-time {
    width: 130px; position: absolute; left: -170px; text-align: right; top: 6px;
    .date { font-size: 15px; font-weight: 800; color: $text-dark; margin-bottom: 4px; }
    .hour { font-size: 12px; color: $text-sub; }
}

.tl-rail {
    width: 24px; position: relative; display: flex; flex-direction: column; align-items: center;
    .tl-dot {
        width: 20px; height: 20px; background: #fff; border-radius: 50%;
        display: flex; align-items: center; justify-content: center; z-index: 10;
        box-shadow: 0 0 0 4px #fff, 0 2px 8px rgba(0,0,0,0.1);
        .dot-inner { width: 10px; height: 10px; border-radius: 50%; }
        &.primary { border: 2px solid $theme-color; .dot-inner { background: $theme-color; } }
        &.success { border: 2px solid #8bc34a; .dot-inner { background: #8bc34a; } }
    }
    .tl-line { position: absolute; top: 24px; bottom: -40px; width: 1.5px; background: #e2e8f0; }
}

.tl-main-card {
    flex: 1; border: 1px solid #eef2f6; border-radius: 12px; overflow: hidden;
    transition: all 0.2s; &:hover { border-color: $theme-color; box-shadow: 0 4px 12px rgba(0, 179, 237, 0.08); }
}

.node-header {
    background: #f8fafc; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #f1f5f9; .node-id { font-size: 16px; font-weight: 700; color: $text-dark; }
}

.theme-flat-btn { background: $theme-color !important; border: none !important; font-weight: 600; }

.node-table-wrapper { padding: 20px; }

.tl-end { display: flex; align-items: center; gap: 12px; margin-left: 7px; color: #cbd5e1; font-size: 12px; .end-dot { width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; } }

/* 初始功能展示区 */
.hero-footer-features {
    max-width: 1100px; margin: 40px auto 60px; padding: 0 20px;
    .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
    .feature-card {
        background: #fff; border-radius: 20px; padding: 40px; text-align: center; border: 1px solid #e2e8f0;
        .icon-box {
            width: 60px; height: 60px; border-radius: 16px; margin: 0 auto 24px;
            display: flex; align-items: center; justify-content: center; font-size: 30px;
            &.primary { background: #e0f2fe; color: $theme-color; }
            &.success { background: #ecfdf5; color: #10b981; }
            &.warning { background: #fff7ed; color: #f59e0b; }
        }
        h4 { font-size: 18px; font-weight: 700; color: $text-dark; margin-bottom: 8px; }
        p { font-size: 14px; color: $text-sub; }
    }
}
</style>
