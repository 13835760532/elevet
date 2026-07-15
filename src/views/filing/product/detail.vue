<template>
    <div class="page-container" v-loading="loading">
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">产品档案</h1>
            </div>
        </div>

        <!-- 详情卡片容器 -->
        <div class="content-card">
            <!-- 产品信息区块 -->
            <div class="detail-section">
                <div class="section-header">产品信息</div>
                <div class="detail-list">
                    <div class="detail-row">
                        <span class="label">*建档时间：</span>
                        <span class="value">{{ formatDate(productInfo.archiveDate, 'YYYY-MM-DD HH:mm:ss') || '--' }}
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品编码：</span>
                        <span class="value">{{ productInfo.productCode || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品名称：</span>
                        <span class="value">{{ productInfo.productName || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品类别：</span>
                        <span class="value">{{ getProductCategoryLabel(productInfo.category) == '--' ?
                            productInfo.category : getProductCategoryLabel(productInfo.category) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品产地：</span>
                        <span class="value">{{ productInfo.productionArea || '--' }}</span>
                    </div>
                    <div class="detail-row image-row">
                        <span class="label">*产品宣传照片：</span>
                        <div class="value">
                            <div class="preview-img-box" v-if="productInfo.productImageUrl">
                                <el-image :src="productInfo.productImageUrl"
                                    :preview-src-list="[productInfo.productImageUrl]" fit="cover" />
                            </div>
                            <span v-else>--</span>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="label">*批次规模：</span>
                        <span class="value">{{ productInfo.productSpec ? productInfo.productSpec +
                            getAgriUnitLabel(productInfo.productUnit) : '--' }}</span>
                    </div>
                </div>
            </div>

            <!-- 所属主体区块 -->
            <div class="detail-section mt-30">
                <div class="section-header">所属主体</div>
                <div class="detail-list">
                    <div class="detail-row">
                        <span class="label">*主体名称：</span>
                        <span class="value">{{ subjectInfo.name || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*主体类型：</span>
                        <span class="value">{{ subjectInfo.category ? getCategoryLabel(subjectInfo.category) : '--'
                        }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*建档类型：</span>
                        <span class="value">{{ subjectInfo.type ? getFilingTypeLabel(subjectInfo.type) : '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*主营产品：</span>
                        <span class="value">{{ subjectInfo.mainProducts || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*所属地区：</span>
                        <span class="value">{{ [subjectInfo.provinceCode, subjectInfo.cityCode,
                        subjectInfo.districtCode].filter(Boolean).join('') || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*详细地址：</span>
                        <span class="value">{{ subjectInfo.address || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*联系人：</span>
                        <span class="value">{{ subjectInfo.contactName || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*联系电话：</span>
                        <span class="value">{{ subjectInfo.contactPhone || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*生产经营主体：</span>
                        <span class="value">{{ subjectInfo.productionScale ? subjectInfo.productionScale + ' ' +
                            getAgriUnitLabel(subjectInfo.productionScaleUnit) : '--' }}</span>
                    </div>
                    <div class="detail-row complex">
                        <span class="label">*信用代码<br />（身份证代码）：</span>
                        <span class="value">{{ subjectInfo.socialCreditCode || subjectInfo.idCard || '--' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*营业执照：</span>
                        <span class="value active-link" v-if="subjectInfo.businessLicenseUrl"
                            @click="handlePreview(subjectInfo.businessLicenseUrl)">预览</span>
                        <span class="value" v-else>--</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">身份证：</span>
                        <span class="value active-link" v-if="subjectInfo.idCardFrontUrl || subjectInfo.idCardBackUrl"
                            @click="handlePreview([subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean))">预览</span>
                        <span class="value" v-else>--</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">企业资质：</span>
                        <span class="value active-link"
                            v-if="subjectInfo.qualificationUrls && parseUrls(subjectInfo.qualificationUrls).length"
                            @click="handlePreview(parseUrls(subjectInfo.qualificationUrls))">预览</span>
                        <span class="value" v-else>--</span>
                    </div>
                    <div class="detail-row no-border">
                        <span class="label">企业介绍：</span>
                        <span class="value" v-if="subjectInfo.introduction" v-html="subjectInfo.introduction"></span>
                        <span class="value" v-else>--</span>
                    </div>
                </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="footer-actions">
                <el-button class="btn-back" @click="handleBack">返回</el-button>
            </div>
        </div>

        <!-- 图片预览组件 -->
        <el-image-viewer v-if="imgPreviewViewerVisible" :url-list="previewUrlList"
            @close="imgPreviewViewerVisible = false" :teleported="true" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import * as ProductApi from '@/api/agri/product/index';
import * as SubjectApi from '@/api/agri/subject/index';
import { formatDate } from '@/utils/formatTime';

import { useDict } from '@/hooks/web/useDict';
import { getAgriUnitLabel } from '@/utils/agriUnit';

const { getLabel: getCategoryLabel } = useDict('agri_subject_category', 'str');
const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');

const router = useRouter();
const route = useRoute();

const productInfo = ref({});
const subjectInfo = ref({});
const loading = ref(false);
const imgPreviewViewerVisible = ref(false);
const previewUrlList = ref([]);

const parseUrls = (urlsStr) => {
    if (!urlsStr) return [];
    try {
        const parsed = JSON.parse(urlsStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return urlsStr.split(',').filter(item => !!item);
    }
};

const handlePreview = (urls) => {
    if (!urls) return;
    const urlArray = Array.isArray(urls) ? urls : [urls];
    if (urlArray.length === 0) return;

    previewUrlList.value = urlArray;
    imgPreviewViewerVisible.value = true;
};

const loadDetail = async () => {
    const id = route.query.id;
    loading.value = true;
    try {
        if (id) {
            const prodData = await ProductApi.getProduct(id);
            productInfo.value = prodData || {};

            if (prodData && prodData.subjectId) {
                const subData = await SubjectApi.getSubject(prodData.subjectId);
                subjectInfo.value = subData || {};
                return;
            }
        }

        // 如果没有产品ID，或者没有关联subjectId，则使用我的主体作为回退/展示
        const mySubData = await SubjectApi.getMySubject();
        subjectInfo.value = mySubData || {};

    } catch (error) {
        console.error('获取档案详情失败', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadDetail();
});

const handleBack = () => {
    router.back();
};
</script>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    padding: 16px;
}

/* 顶部标题区 */
.header-section {
    padding: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    margin-bottom: 20px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.title-line {
    width: 4px;
    height: 18px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin: 0;
}

/* 内容卡片 */
.content-card {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 40px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.section-header {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    padding-bottom: 12px;
}

.detail-list {
    overflow: hidden;
}

.detail-row {
    display: flex;
    border-bottom: 1px solid #E5E7EB;
    min-height: 48px;
    align-items: flex-start;

    &.no-border {
        border-bottom: none;
    }

    .label {
        width: 150px;
        padding: 12px 20px;
        font-size: 14px;
        color: #333;
        text-align: right;
    }

    .value {
        flex: 1;
        padding: 12px 20px;
        font-size: 14px;
        color: #333;
        line-height: 1.5;

        &.active-link {
            color: #3B82F6;
            cursor: pointer;
            font-weight: 500;

            &:hover {
                text-decoration: underline;
            }
        }
    }

    &.image-row {
        .value {
            padding-top: 8px;
            padding-bottom: 8px;
        }
    }

    &.complex {
        .label {
            line-height: 1.3;
        }
    }
}

.preview-img-box {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #D1D5DB;

    :deep(.el-image) {
        width: 100%;
        height: 100%;

        img {
            object-fit: cover;
        }
    }
}

.mt-30 {
    margin-top: 30px;
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
}

.btn-back {
    width: 160px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #D1D5DB;
    background: #fff;
    color: #333;

    &:hover {
        background: #F9FAFB;
        border-color: #9CA3AF;
    }
}
</style>
