<template>
    <div class="page-container">
        <pageHeader title="合格证查验" desc="显示合格证开具时信息" />

        <!-- 搜索区域 -->
        <div class="search-area">
            <el-tabs v-model="searchForm.source" class="source-tabs">
                <el-tab-pane label="农产品上游合格证为本平台开具" name="platform" />
                <el-tab-pane label="其他来源" name="other" />
            </el-tabs>

            <div class="search-row">
                <el-input v-model="searchForm.certNo" placeholder="112245677(输入上游合格证编号)" class="cert-input" />
                <el-button type="primary" class="search-btn" @click="handleSearch">查询</el-button>
            </div>


            <!-- 主内容区 -->
            <div class="main-content" v-if="searchForm.certNo && searchForm.source === 'platform'">
                <!-- 左侧：合格证详情 -->
                <div class="cert-detail-card">
                    <!-- 合格证头部 -->
                    <div class="cert-header">
                        <span class="cert-no">合格证编号-HGZ91919991111</span>
                    </div>

                    <!-- 合格证标题 -->
                    <div class="cert-title-section">
                        <h2 class="cert-title">承诺达标合格证</h2>
                        <h3 class="cert-subtitle">我承诺生产销售的食用农产品</h3>
                        <p class="cert-desc">
                            未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。
                        </p>
                    </div>

                    <!-- 承诺依据 -->
                    <div class="cert-promise">
                        <div class="promise-title">承诺依据：</div>
                        <el-checkbox v-model="promises.quality" disabled>质量安全控制符合要求</el-checkbox>
                        <el-checkbox v-model="promises.selfTest" disabled>自行检测合格</el-checkbox>
                        <el-checkbox v-model="promises.thirdTest" disabled>委托检测合格</el-checkbox>
                    </div>

                    <!-- 二维码占位 -->
                    <div class="qr-code">
                        <div class="qr-placeholder">
                            <el-icon :size="40" color="#ccc">
                                <Picture />
                            </el-icon>
                            <span class="qr-tip">二维码</span>
                        </div>
                    </div>

                    <!-- 基本信息 -->
                    <div class="basic-info">
                        <h4 class="info-title">基本信息</h4>
                        <div class="info-table">
                            <div class="info-row">
                                <span class="label">产品名称</span>
                                <span class="value">{{ certInfo.productName }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">产品数量</span>
                                <span class="value">{{ certInfo.quantity }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">产品产地</span>
                                <span class="value">{{ certInfo.origin }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">承诺主体</span>
                                <span class="value">{{ certInfo.entity }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">联系方式</span>
                                <span class="value">{{ certInfo.phone }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">开具时间</span>
                                <span class="value">{{ formatDate(certInfo.issueTime) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 电子合格证说明 -->
                    <p class="cert-note">*电子合格证由链安食检数智服务平台承载展示</p>

                    <!-- 产品图片 -->
                    <div class="product-images">
                        <h4 class="section-label">产品图片</h4>
                        <div class="image-placeholder">
                            <el-icon size="40" color="#ccc">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>

                    <!-- 产品检测报告 -->
                    <div class="detection-report">
                        <h4 class="section-label">产品检测报告</h4>
                        <div class="image-placeholder">
                            <el-icon size="40" color="#ccc">
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="page-footer">
                <el-button class="btn-verify-only" @click="handleVerifyOnly">仅查验</el-button>
                <el-button type="primary" class="btn-verify-save" @click="handleVerifyAndSave">查验并存证</el-button>
            </div>
        </div>

        <!-- 其他来源弹窗 -->
        <el-dialog v-model="otherSourceDialogVisible" title="" width="900px" :close-on-click-modal="false"
            class="other-source-dialog" @close="handleCloseOtherDialog">
            <div class="dialog-content">
                <!-- 左侧内容 -->
                <div class="dialog-left">
                    <div class="dialog-left-title">非本平合开具的合格证</div>
                    <!-- 来源选择 -->
                    <!-- <el-select v-model="searchForm.source" class="source-select" disabled>
                        <el-option label="农产品上游合格证为其他平台开具" value="other" />
                    </el-select> -->

                    <!-- 上传按钮 -->
                    <el-button type="primary" class="upload-cert-btn" @click="handleUploadCert">
                        上传合格证照片
                    </el-button>

                    <!-- 上游合格证预览 -->
                    <div class="cert-preview-section">
                        <h3 class="preview-title">上游合格证预览</h3>
                        <div class="preview-table">
                            <div class="preview-row">
                                <span class="label">合格证编号</span>
                                <span class="value">{{ otherCertInfo.certNo }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label">出证类型</span>
                                <span class="value">{{ otherCertInfo.certType }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label">产品档案编号</span>
                                <span class="value">{{ otherCertInfo.productFileNo }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label required">*产品名称</span>
                                <span class="value">{{ otherCertInfo.productName }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label required">*重量/数量</span>
                                <span class="value">{{ otherCertInfo.quantity }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label required">*产品产地</span>
                                <span class="value">{{ otherCertInfo.origin }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label required">*生产经营主体</span>
                                <span class="value">{{ otherCertInfo.entity }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label">联系人</span>
                                <span class="value">{{ otherCertInfo.contact }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label required">*联系电话</span>
                                <span class="value">{{ otherCertInfo.phone }}</span>
                            </div>
                            <div class="preview-row">
                                <span class="label required">*开具日期</span>
                                <span class="value">{{ formatDate(otherCertInfo.issueTime) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧内容 -->
                <div class="dialog-right">

                    <!-- 证书图片预览 -->
                    <div class="cert-image-preview">
                        <div class="cert-image-placeholder">
                            <div class="cert-header-img">
                                <span class="cert-region">平邑县</span>
                                <h4 class="cert-name">农产品承诺达标合格证</h4>
                            </div>
                            <div class="cert-body-img">
                                <p class="cert-promise-text">我承诺对生产销售的食用农产品：</p>
                                <div class="promise-items">
                                    <div class="promise-item">☐ 不使用禁用农药兽药、停用兽药和非法添加物</div>
                                    <div class="promise-item">☐ 常规农药兽药残留不超标</div>
                                    <div class="promise-item">☐ 对承诺的真实性负责</div>
                                </div>
                                <div class="cert-basis">
                                    <span>承诺依据：</span>
                                    <span>☐ 委托检测 ☐ 自我检测</span>
                                    <span>☐ 内部质量控制 ☐ 自我承诺</span>
                                </div>
                            </div>
                            <div class="cert-footer-img">
                                <div class="cert-qr">
                                    <el-icon :size="40" color="#999">
                                        <Picture />
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleCloseOtherDialog">取消</el-button>
                    <el-button type="primary" @click="handleConfirmOther">确认</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';
import { formatDate } from '@/utils/formatTime';

const router = useRouter();

// 搜索表单
const searchForm = reactive({
    source: 'platform',
    certNo: ''
});

// 其他来源弹窗
const otherSourceDialogVisible = ref(false);
const otherCertInfo = reactive({
    certNo: '--',
    certType: '--',
    productFileNo: '--',
    productName: '白菜',
    quantity: '10 (kg/亩/公顷/个)',
    origin: '山东-济南',
    entity: '北京朝阳本来生活大悦城分店',
    contact: '--',
    phone: '18513172770',
    issueTime: '2025-10-01 16:52:12'
});

// 监听来源变化，选择其他来源时弹出弹窗
watch(() => searchForm.source, (newVal) => {
    if (newVal === 'other') {
         otherSourceDialogVisible.value = true;
    }
});

// 上传合格证照片
const handleUploadCert = () => {
    ElMessage.info('上传合格证照片功能开发中');
};

// 关闭弹窗
const handleCloseOtherDialog = () => {
    otherSourceDialogVisible.value = false;
    searchForm.source = 'platform';
};

// 确认其他来源信息
const handleConfirmOther = () => {
    otherSourceDialogVisible.value = false;
    ElMessage.success('其他来源合格证信息已确认');
};

// 承诺依据
const promises = reactive({
    quality: true,
    selfTest: false,
    thirdTest: false
});

// 合格证信息
const certInfo = reactive({
    productName: '白菜',
    quantity: '100kg',
    origin: '山东省胶州市',
    entity: '胶州市XXX农业合作社',
    phone: '138****8888',
    issueTime: '2025-12-12 16:00'
});

const handleSearch = () => {
    if (!searchForm.certNo) {
        ElMessage.warning('请输入合格证编号');
        return;
    }
    ElMessage.success('查询成功');
};

const handleVerifyOnly = () => {
    ElMessage.info('仅查验操作');
};

const handleVerifyAndSave = () => {
    ElMessage.success('查验并存证成功');
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
}

.header-section {
    padding: var( --page-container-padding);
    margin-bottom: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 16px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.title-line {
    width: 4px;
    height: 20px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.page-subtitle {
    font-size: 14px;
    color: #666;
}

/* 搜索区域 */
.search-area {
    padding: 16px;
    margin-bottom: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 16px;
    min-height: 600px;
}

.source-tabs {
    margin-bottom: 24px;
    :deep(.el-tabs__header) {
        margin-bottom: 0;
        border-bottom: none;
    }
    :deep(.el-tabs__item) {
        font-size: 15px;
        font-weight: 500;
        color: #666;
        padding: 0 20px;
        height: 44px;
        line-height: 44px;
        
        &.is-active {
            color: #00B3ED;
            font-weight: 600;
        }
    }
    :deep(.el-tabs__active-bar) {
        background-color: #00B3ED;
        height: 3px;
        border-radius: 2px;
    }
}

.search-row {
    display: flex;
    gap: 12px;
    max-width: 514px;
}

.cert-input {
    flex: 1;
}

.search-btn {
    min-width: 100px;
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
}

/* 主内容区 */
.main-content {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-top: 24px;
}

/* 合格证详情卡片 */
.cert-detail-card {
    flex: 1;
    max-width: 500px;
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    position: relative;
}

.cert-header {
    margin-bottom: 16px;
}

.cert-no {
    font-size: 13px;
    color: #00B3ED;
    font-weight: 500;
}

.cert-title-section {
    text-align: center;
    margin-bottom: 16px;
}

.cert-title {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0 0 8px 0;
}

.cert-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
}

.cert-desc {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.6;
}

/* 承诺依据 */
.cert-promise {
    margin-bottom: 16px;

    .promise-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
    }

    :deep(.el-checkbox) {
        display: block;
        margin-bottom: 4px;
        margin-left: 0;
    }
}

/* 二维码 */
.qr-code {
    position: absolute;
    top: 100px;
    right: 24px;
    width: 80px;
    height: 80px;

    .qr-placeholder {
        width: 100%;
        height: 100%;
        background: #F3F4F6;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;

        .qr-tip {
            font-size: 10px;
            color: #999;
        }
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
}

/* 基本信息 */
.basic-info {
    margin-bottom: 16px;
}

.info-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
}

.info-table {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    overflow: hidden;
}

.info-row {
    display: flex;
    border-bottom: 1px solid #E5E7EB;

    &:last-child {
        border-bottom: none;
    }

    .label {
        width: 100px;
        padding: 10px 12px;
        background: #F9FAFB;
        font-size: 13px;
        color: #666;
        border-right: 1px solid #E5E7EB;
    }

    .value {
        flex: 1;
        padding: 10px 12px;
        font-size: 13px;
        color: #333;
    }
}

.cert-note {
    font-size: 12px;
    color: #999;
    margin: 16px 0;
    padding-top: 16px;
    border-top: 1px dashed #E5E7EB;
}

/* 产品图片和检测报告 */
.section-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0 0 12px 0;
}

.image-placeholder {
    width: 150px;
    height: 120px;
    background: #F3F4F6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-images {
    margin-bottom: 24px;
}

.detection-report {
    margin-bottom: 16px;
}

/* 右侧开具信息卡片 */
.issue-info-card {
    width: 180px;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px;
    position: relative;
}

.issue-badge {
    position: absolute;
    top: -10px;
    left: -10px;
    width: 24px;
    height: 24px;
    background: #FFD700;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #333;
}

.issue-content {
    text-align: left;
}

.issue-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 40px;
}

.issue-desc {
    font-size: 12px;
    color: #999;
}

/* 底部按钮 */
.page-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 88px;
    border-radius: 16px;
}

.btn-verify-only {
    border-color: #D1D5DB;
    color: #666;
    &:hover {
        background: transparent;
    }
}

.btn-verify-save {
    border: none;
    position: relative;
}

/* 深度样式覆盖 */
:deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #E5E7EB inset;

    &:hover {
        box-shadow: 0 0 0 1px #00B3ED inset;
    }

    &.is-focus {
        box-shadow: 0 0 0 1px #00B3ED inset;
    }
}

:deep(.el-select) {
    .el-input__wrapper {
        border-radius: 6px;
    }
}

/* 其他来源弹窗样式 */
.other-source-dialog {
    :deep(.el-dialog__header) {
        display: none;
    }

    :deep(.el-dialog__body) {
        padding: 16px;
    }
}

.dialog-content {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    
}

.dialog-left {
    width: 50%;
    .dialog-left-title {
        font-size: 16px;
        line-height: 18px;
        font-weight: 600;
        color: #333;
        text-align: left;
        margin: 0 0 16px 0;
        padding: 12px 0;
        border-bottom: 1px dashed #D1D5DB;
    }

    .source-select {
        width: 100%;
        margin-bottom: 16px;
    }

    .upload-cert-btn {
        width: 100%;
        height: 44px;
        background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
        border: none;
        border-radius: 6px;
        margin-bottom: 24px;
    }
}

.cert-preview-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #E5E7EB;
}

.preview-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #E5E7EB;
}

.preview-table {
    .preview-row {
        display: flex;
        padding: 10px 0;
        border-bottom: 1px solid #F3F4F6;

        &:last-child {
            border-bottom: none;
        }

        .label {
            width: 120px;
            font-size: 13px;
            color: #666;
            flex-shrink: 0;

            &.required {
                color: #333;
                font-weight: 500;
            }
        }

        .value {
            flex: 1;
            font-size: 13px;
            color: #333;
        }
    }
}

.dialog-right {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 12px;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
}

.source-badge-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    position: relative;

    .badge-number {
        position: absolute;
        top: -8px;
        left: -8px;
        width: 24px;
        height: 24px;
        background: #FFD700;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #333;
    }

    .badge-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 24px;
    }

    .badge-author {
        font-size: 12px;
        color: #999;
    }
}

.cert-image-preview {
    flex: 1;
}

.cert-image-placeholder {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    font-size: 11px;

    .cert-header-img {
        text-align: center;
        margin-bottom: 12px;

        .cert-region {
            color: #C41E3A;
            font-weight: 600;
        }

        .cert-name {
            font-size: 14px;
            color: #C41E3A;
            margin: 8px 0 0 0;
        }
    }

    .cert-body-img {
        .cert-promise-text {
            font-size: 12px;
            color: #333;
            margin: 0 0 8px 0;
        }

        .promise-items {
            margin-bottom: 12px;

            .promise-item {
                font-size: 11px;
                color: #666;
                margin-bottom: 4px;
            }
        }

        .cert-basis {
            font-size: 11px;
            color: #666;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
    }

    .cert-footer-img {
        margin-top: 16px;
        display: flex;
        justify-content: center;

        .cert-qr {
            width: 60px;
            height: 60px;
            background: #F3F4F6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: center;
    gap: 16px;

    .el-button {
        min-width: 100px;
        height: 40px;
        border-radius: 10px;
    }
}
</style>
