<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">合格证详情</h1>
            </div>
            <div class="desc-box">
                显示合格证开具时信息
            </div>
        </div>

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
                                    <el-checkbox label="质量安全控制符合要求" checked disabled />
                                    <el-checkbox label="自行检测合格" disabled />
                                    <el-checkbox label="委托检测合格" disabled />
                                </div>
                                <div class="qr-code">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HGZ9191991111"
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
                                <div class="val">--</div>
                            </div>
                            <div class="table-row">
                                <div class="label">承诺主体</div>
                                <div class="val">--</div>
                            </div>
                            <div class="table-row">
                                <div class="label">联系方式</div>
                                <div class="val">--</div>
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
                        <div class="image-placeholder">
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

                <div class="cert-display-box">
                    <!-- 合格证票据样式 (左侧) -->
                    <div class="cert-ticket orange-border">
                        <div class="cert-header">
                            <span class="cert-id-tag">合格证编号－HGZ91919911111</span>
                        </div>
                        <div class="cert-body">
                            <h2 class="main-title">承诺达标合格证</h2>
                            <h3 class="sub-title">我承诺生产销售的食用农产品</h3>
                            <p class="declaration">未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。</p>

                            <div class="middle-flex">
                                <div class="basis-info">
                                    <h4 class="small-title">承诺依据：</h4>
                                    <el-checkbox label="质量安全控制符合要求" checked disabled />
                                    <el-checkbox label="自行检测合格" disabled />
                                    <el-checkbox label="委托检测合格" disabled />
                                </div>
                                <div class="qr-code">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HGZ9191991111"
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
                                <div class="val">白菜 (上游)</div>
                            </div>
                            <div class="table-row">
                                <div class="label">产品数量</div>
                                <div class="val">1000kg</div>
                            </div>
                            <div class="table-row">
                                <div class="label">产品产地</div>
                                <div class="val">山东省潍坊市</div>
                            </div>
                            <div class="table-row">
                                <div class="label">承诺主体</div>
                                <div class="val">某上游基地</div>
                            </div>
                            <div class="table-row">
                                <div class="label">联系方式</div>
                                <div class="val">138XXXXXXXX</div>
                            </div>
                            <div class="table-row">
                                <div class="label">开具时间</div>
                                <div class="val">2025-12-10 10:00</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="divider"></div>

                <!-- 产品图片区域 -->
                <div class="images-section">
                    <div class="section-title">产品图片</div>
                    <div class="image-grid">
                        <div class="image-placeholder">
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
                <el-button type="primary" class="print-btn" @click="handlePrint">打印</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Picture } from '@element-plus/icons-vue';
import { useMessage } from '@/hooks/web/useMessage';
import * as CertificateApi from '@/api/agri/certificate';

const isSelected1 = ref(true);
const isSelected2 = ref(true);

const route = useRoute();
const message = useMessage();
const loading = ref(false);
const certificate = ref<any | null>(null);

onMounted(async () => {
    const id = Number(route.params.id);
    if (!id) {
        return;
    }
    loading.value = true;
    try {
        const data = await CertificateApi.getCertificate(id);
        certificate.value = data;
    } catch {
        message.error('获取合格证详情失败');
    } finally {
        loading.value = false;
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
    padding: 16px;
}

.header-section {
    padding: 16px;
    margin-bottom: 20px;
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
    max-width: 1200px;
    margin: 0 auto;
}

.info-card {
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 32px;
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
}
</style>
