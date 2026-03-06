<template>
    <div class="page-container">
        <pageHeader title="合格证详情" desc="显示合格证开具时信息" />
        <!-- 详情卡片容器 -->
        <div class="detail-content">
            <!-- 农产品合格证信息 -->
            <div class="info-card">
                <div class="card-title-row">
                    <h2 class="card-inner-title">农产品合格证信息</h2>
                    <el-checkbox v-model="isSelected1" />
                </div>

                <div class="cert-display-box" v-loading="loading">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－{{ certificate?.certificateCode || '--' }}</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺达标合格证</h2>
                            <h3 class="sub-title">我承诺生产销售的食用农产品</h3>
                            <p class="declaration">未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。</p>

                            <div class="middle-flex">
                                <div class="basis-info">
                                    <h4 class="small-title">承诺依据：</h4>
                                    <el-checkbox label="质量安全控制符合要求" :checked="commitmentBasis.includes(1)" disabled />
                                    <el-checkbox label="自行检测合格" :checked="commitmentBasis.includes(2)" disabled />
                                    <el-checkbox label="委托检测合格" :checked="commitmentBasis.includes(3)" disabled />
                                </div>
                                <div class="qr-code">
                                    <img :src="certificate?.qrCode"
                                        alt="QR" />
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
                                <div class="val">{{ product?.productionArea || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">承诺主体</div>
                                <div class="val">{{ subject?.name || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">联系方式</div>
                                <div class="val">{{ subject?.contactPhone || '--' }}</div>
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
                        <div v-if="product?.productImageUrl" class="image-box">
                            <img :src="product.productImageUrl" class="product-img" />
                        </div>
                        <div v-else class="image-placeholder">
                            <el-icon class="icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                    <div class="reports-link">
                        检测报告 <el-button link type="primary">预览</el-button>
                    </div>
                </div>
            </div>

            <!-- 已关联的上游合格证 -->
            <div class="info-card mt-20">
                <div class="card-title-row">
                    <h2 class="card-inner-title">已关联的上游合格证</h2>
                    <el-checkbox v-model="isSelected2" />
                </div>

                <div class="cert-display-box" v-if="upstreamCertificate">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket orange-border">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－{{ upstreamCertificate?.certificateCode || '--' }}</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺达标合格证</h2>
                            <h3 class="sub-title">我承诺生产销售的食用农产品</h3>
                            <p class="declaration">未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。</p>
                            <div class="middle-flex">
                                <div class="basis-info">
                                    <h4 class="small-title">承诺依据：</h4>
                                    <!-- 这里通常也是依据该合格证本身的承诺依据 -->
                                    <el-checkbox label="质量安全控制符合要求" :checked="upstreamCommitmentBasis.includes(1)" disabled />
                                    <el-checkbox label="自行检测合格" :checked="upstreamCommitmentBasis.includes(2)" disabled />
                                    <el-checkbox label="委托检测合格" :checked="upstreamCommitmentBasis.includes(3)" disabled />
                                </div>
                                <div class="qr-code">
                                    <img :src="upstreamCertificate?.qrCode"
                                        alt="QR" />
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
                                <div class="val">{{ upstreamProduct?.productionArea || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">承诺主体</div>
                                <div class="val">{{ upstreamSubject?.name || '--' }}</div>
                            </div>
                            <div class="table-row">
                                <div class="label">联系方式</div>
                                <div class="val">{{ upstreamSubject?.contactPhone || '--' }}</div>
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
                        <div v-if="upstreamProduct?.productImageUrl" class="image-box">
                            <img :src="upstreamProduct.productImageUrl" class="product-img" />
                        </div>
                        <div v-else class="image-placeholder">
                            <el-icon class="icon">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                    <div class="reports-link">
                        检测报告 <el-button link type="primary">预览</el-button>
                    </div>
                </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="footer-actions">
                <el-button type="primary" class="print-btn" @click="handlePrint">打印</el-button>
                <el-button class="close-btn" @click="() => $router.back()">返回</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import * as CertificateApi from '@/api/agri/certificate';
import * as SubjectApi from '@/api/agri/subject';
import * as ProductApi from '@/api/agri/product';

const isSelected1 = ref(true);
const isSelected2 = ref(true);

const route = useRoute();
const message = useMessage();
const loading = ref(false);
const certificate = ref<any | null>(null);
const subject = ref<any | null>(null);
const product = ref<any | null>(null);
const commitmentBasis = ref<number[]>([]);

// 上游信息
const upstreamCertificate = ref<any | null>(null);
const upstreamSubject = ref<any | null>(null);
const upstreamProduct = ref<any | null>(null);
const upstreamCommitmentBasis = ref<number[]>([]);

const loadDetail = async (id: number) => {
    loading.value = true;
    try {
        const data = await CertificateApi.getCertificate(id);
        certificate.value = data;
        
        // 解析承诺依据
        if (data.commitmentBasis) {
            try {
                commitmentBasis.value = JSON.parse(data.commitmentBasis);
            } catch (e) {
                console.error('解析承诺依据失败', e);
            }
        }

        // 获取主体和产品详情
        if (data.subjectId) {
            SubjectApi.getSubject(data.subjectId).then(res => subject.value = res);
        }
        if (data.productId) {
            ProductApi.getProduct(data.productId).then(res => product.value = res);
        }

        // 如果存在上游合格证编号，获取上游信息
        if (data.upstreamCertificateCode) {
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
            if (data.commitmentBasis) {
                try {
                    upstreamCommitmentBasis.value = JSON.parse(data.commitmentBasis);
                } catch (e) {}
            }
            if (data.subjectId) {
                SubjectApi.getSubject(data.subjectId).then(res => upstreamSubject.value = res);
            }
            if (data.productId) {
                ProductApi.getProduct(data.productId).then(res => upstreamProduct.value = res);
            }
        }
    } catch (e) {
        console.error('获取上游合格证详情失败', e);
    }
};

onMounted(async () => {
    const id = route.query.id as unknown as number;
    if (id) {
        loadDetail(id);
    }
});

const handlePrint = () => {
    window.print();
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
    margin: 40px 0 60px 0;

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
}

.image-box {
    width: 250px;
    height: 160px;
    border-radius: 8px;
    overflow: hidden;

    .product-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
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
</style>
