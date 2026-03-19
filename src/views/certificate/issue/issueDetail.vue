<template>
    <div class="page-container">
        <pageHeader title="合格证详情" desc="显示合格证开具时信息" />
        <!-- 详情卡片容器 -->
        <div ref="printAreaRef" class="detail-content">
            <!-- 农产品合格证信息 -->
            <div ref="printRef" class="info-card" :class="{ 'no-print-section': !isSelected1 }">
                <div class="card-title-row no-print">
                    <h2 class="card-inner-title">农产品合格证信息</h2>
                    <el-checkbox v-model="isSelected1">打印此联</el-checkbox>
                </div>

                <div class="cert-display-box" v-loading="loading">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－{{ certificate?.certificateCode || '--' }}</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺内容</h2>
                            <h3 class="sub-title">{{certificate?.commitmentContent}}</h3>

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
                                    <Qrcode v-if="certificate?.qrCode" :text="certificate.qrCode" :width="80" />
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
                                    {{ certificate?.quantity ?? '--' }}{{ certificate?.unit || '' }}
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
                        <p class="footer-tip">*电子合格证由链安食检数智服务平台承载展示</p>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- 产品图片区域 -->
                <div class="images-section">
                    <div class="section-title">产品图片</div>
                    <div class="image-grid">
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
            <div class="info-card mt-20" v-if="upstreamCertificate" :class="{ 'no-print-section': !isSelected2 }">
                <div class="card-title-row no-print">
                    <h2 class="card-inner-title">已关联的上游合格证</h2>
                    <el-checkbox v-model="isSelected2">打印此联</el-checkbox>
                </div>

                <div class="cert-display-box" v-if="upstreamCertificate">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket orange-border">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－{{ upstreamCertificate?.certificateCode || '--' }}</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺内容</h2>
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
                                    <Qrcode v-if="upstreamCertificate?.qrCode" :text="upstreamCertificate.qrCode" :width="80" />
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
                                <div class="val">{{ upstreamCertificate?.quantity ?? '--' }}{{ upstreamCertificate?.unit || '' }}</div>
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
                <div v-else class="empty-tip">暂无关联的上游合格证</div>

                <div class="divider"></div>

                <!-- 产品图片区域 -->
                <div class="images-section">
                    <div class="section-title">产品图片</div>
                    <div class="image-grid">
                        <div v-if="upstreamCertificate?.productImageUrl" class="image-box">
                            <img :src="upstreamCertificate.productImageUrl" class="product-img" />
                        </div>
                        <div v-else class="image-placeholder">
                            <el-icon class="icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                    <div class="reports-link">
                        检测报告 <el-button link type="primary" @click="handlePreview()">预览</el-button>
                    </div>
                </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="footer-actions no-print">
                <el-button type="primary" class="print-btn" :loading="captureLoading" @click="handlePrint()">打印</el-button>
                <el-button class="close-btn" @click="() => $router.back()">返回</el-button>
            </div>
        </div>

        <el-dialog
            v-model="previewVisible"
            title="打印预览"
            width="840px"
            append-to-body
            class="print-preview-dialog"
        >
            <div class="preview-wrapper" v-loading="captureLoading">
                <img v-if="previewSrc" :src="previewSrc" class="preview-img" />
                <div v-else class="preview-placeholder">生成预览中…</div>
            </div>
            <template #footer>
                <el-button @click="previewVisible = false">关闭</el-button>
                <el-button type="primary" :disabled="!previewSrc" @click="handlePrint(previewSrc)">打印</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import * as CertificateApi from '@/api/agri/certificate';
import { Qrcode } from '@/components/Qrcode';
import html2canvas from 'html2canvas';
import printJS from 'print-js';

const isSelected1 = ref(true);
const isSelected2 = ref(true);

const route = useRoute();
const message = useMessage();
const loading = ref(false);
const certificate = ref<any | null>(null);
const commitmentBasis = ref<number[]>([]);

// 上游信息
const upstreamCertificate = ref<any | null>(null);
const upstreamCommitmentBasis = ref<number[]>([]);

// 统一解析承诺依据
const parseBasisData = (val: any) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(Number);
    if (typeof val === 'number') return [val];
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
    } catch (e) {
        // 处理 "1,2,3" 这种非 JSON 逗号分隔格式
        return String(val).split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }
};
const loadDetail = async (id: number) => {
    loading.value = true;
    try {
        const data = await CertificateApi.getCertificate(id);
        certificate.value = data;
        
        // 解析承诺依据
        commitmentBasis.value = parseBasisData(data.commitmentBasis);

        // 处理上游信息
        if (data.upstreamCertificate) {
            upstreamCertificate.value = data.upstreamCertificate;
            upstreamCommitmentBasis.value = parseBasisData(data.upstreamCertificate.commitmentBasis);
        } else if (data.upstreamCertificateCode) {
            // 如果只有 Code 则额外查询一次（适配不同后端返回策略）
            loadUpstreamDetail(data.upstreamCertificateCode);
        }
    } catch {
        message.error('获取合格证详情失败');
    } finally {
        loading.value = false;
    }
};

const loadUpstreamDetail = async (code: string) => {
    try {
        const data = await CertificateApi.getCertificateByCode(code);
        if (data) {
            upstreamCertificate.value = data;
            upstreamCommitmentBasis.value = parseBasisData(data.commitmentBasis);
        }
    } catch (e) {
        console.error('获取上游合格证详情失败', e);
    }
};

onMounted(async () => {
    const id = route.params.id as unknown as number;
    if (id) {
        loadDetail(id);
    }
});

const printRef = ref<HTMLElement | null>(null);
const printAreaRef = ref<HTMLElement | null>(null);
const previewVisible = ref(false);
const previewSrc = ref<string | null>(null);
const captureLoading = ref(false);

const captureAreaToImg = async () => {
    const area = printAreaRef.value;
    if (!area) return null;

    const hiddenNodes: Array<{ el: HTMLElement; display: string }> = [];
    area.querySelectorAll<HTMLElement>('.no-print, .no-print-section').forEach(el => {
        hiddenNodes.push({ el, display: el.style.display });
        el.style.display = 'none';
    });

    try {
        const canvas = await html2canvas(area, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#fff',
            scrollX: 0,
            scrollY: 0,
            windowWidth: document.documentElement.clientWidth
        });
        return canvas.toDataURL('image/png');
    } finally {
        hiddenNodes.forEach(({ el, display }) => {
            el.style.display = display;
        });
    }
};

const handlePrint = async (prepared?: string | null) => {
    if (typeof prepared !== 'string') {
        captureLoading.value = true;
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
        const dataUrl = prepared || (await captureAreaToImg());
        if (!dataUrl) {
            message.error('生成打印内容失败');
            return;
        }
        printJS({
            printable: dataUrl,
            type: 'image',
            imageStyle: 'width:100%;',
            documentTitle: certificate.value?.certificateCode || '合格证'
        });
    } catch (e) {
        console.error('print failed', e);
        message.error('打印失败，请稍后重试');
    } finally {
        if (typeof prepared !== 'string') {
            captureLoading.value = false;
        }
    }
};

const handlePreview = async () => {
    captureLoading.value = true;
    previewVisible.value = true;
    previewSrc.value = null;

    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const img = await captureAreaToImg();
        previewSrc.value = img;
    } catch (e) {
        console.error('preview failed', e);
        message.error('预览生成失败');
    } finally {
        captureLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
}

.header-section {
    padding: 16px;
    margin-bottom: 14px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
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
    background: #fff;
    padding: 0 12px 24px 12px;
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

        .sub-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
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
    gap: 16px;
    margin: 38px 0 60px 0; // 上移 2px

    .print-btn {
        width: 120px;
        height: 44px;
        background: #00B3ED;
        border-color: #00B3ED;
        font-weight: 700;
    }

    .close-btn {
        width: 120px;
        height: 44px;
    }

    .preview-btn {
        width: 120px;
        height: 44px;
    }
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

.preview-img {
    max-width: 100%;
    height: auto;
    display: block;
    border-radius: 6px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);
}

.preview-placeholder {
    color: #666;
    font-size: 14px;
}

</style>
