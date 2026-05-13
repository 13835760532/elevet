<template>
    <div class="page-container yy-detail-container" v-loading="loading">
        <PageHeader title="产品档案" desc="查看农产品的详细档案信息。" />

        <div class="page-scrollable">
            <!-- 详情卡片容器 -->
            <div class="content-card">
                <div class="card-header">
                    <span class="header-title">产品基本信息</span>
                    <div class="dashed-line"></div>
                </div>

                <!-- 详情数据列表 - 产品信息 -->
                <div class="detail-list mb-30">

                    <div class="detail-row">
                        <div class="label">*产品编码：</div>
                        <div class="value">{{ productInfo.productCode || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*产品名称：</div>
                        <div class="value">{{ productInfo.productName || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*产品类别：</div>
                        <div class="value">{{ productInfo.category ? getProductCategoryLabel(productInfo.category) ==
                            '--' ? productInfo.category : getProductCategoryLabel(productInfo.category) : '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*产品产地：</div>
                        <div class="value">{{ productInfo.productionArea || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">建档时间：</div>
                        <div class="value">{{ formatDate(productInfo.archiveDate, 'YYYY-MM-DD HH:mm:ss') || '--' }}
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*宣传照片：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <div class="preview-box">
                                    <el-icon v-if="!productInfo.productImageUrl">
                                        <Picture />
                                    </el-icon>
                                    <template v-else>
                                        <el-image :src="productInfo.productImageUrl"
                                            :preview-src-list="[productInfo.productImageUrl]" class="preview-img"
                                            fit="cover" :preview-teleported="true" />
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*批次规模：</div>
                        <div class="value">{{ productInfo.productSpec ? productInfo.productSpec + ' ' +
                            getAgriUnitLabel(productInfo.productUnit) :
                            '--' }}</div>
                    </div>
                </div>

                <div class="card-header">
                    <span class="header-title">所属主体信息</span>
                    <div class="dashed-line"></div>
                </div>

                <!-- 详情数据列表 - 主体信息 -->
                <div class="detail-list">
                    <div class="detail-row">
                        <div class="label">*主体名称：</div>
                        <div class="value">{{ subjectInfo.name || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*主体类型：</div>
                        <div class="value">{{ subjectInfo.category ? getCategoryLabel(subjectInfo.category) : '--' }}
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*备案类型：</div>
                        <div class="value">{{ subjectInfo.type ? getFilingTypeLabel(subjectInfo.type) : '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*主营产品：</div>
                        <div class="value">{{ subjectInfo.mainProducts || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*所属地区：</div>
                        <div class="value">{{ [subjectInfo.provinceCode, subjectInfo.cityCode,
                        subjectInfo.districtCode].filter(Boolean).join('') || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*详细地址：</div>
                        <div class="value">{{ subjectInfo.address || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*联系人：</div>
                        <div class="value">{{ subjectInfo.contactName || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*联系电话：</div>
                        <div class="value">{{ subjectInfo.contactPhone || '--' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="label">*生产规模：</div>
                        <div class="value">{{ subjectInfo.productionScale ? subjectInfo.productionScale + ' ' +
                            getAgriUnitLabel(subjectInfo.productionScaleUnit) : '--' }}</div>
                    </div>
                    <div class="detail-row" v-if="subjectInfo.type === 1">
                        <div class="label">*信用代码：</div>
                        <div class="value">{{ subjectInfo.socialCreditCode || '--' }}</div>
                    </div>
                    <div class="detail-row" v-if="subjectInfo.type === 2">
                        <div class="label">*身份证号：</div>
                        <div class="value">{{ subjectInfo.idCard || '--' }}</div>
                    </div>
                    <div class="detail-row" v-if="subjectInfo.type === 1">
                        <div class="label">*营业执照：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <div class="preview-box">
                                    <el-icon v-if="!subjectInfo.businessLicenseUrl">
                                        <Picture />
                                    </el-icon>
                                    <template v-else>
                                        <el-image :src="subjectInfo.businessLicenseUrl"
                                            :preview-src-list="[subjectInfo.businessLicenseUrl]" class="preview-img"
                                            fit="cover" :preview-teleported="true" />
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="detail-row" v-if="subjectInfo.type === 2">
                        <div class="label">身份证：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <div class="id-card-boxes">
                                    <div class="preview-box">
                                        <el-icon v-if="!subjectInfo.idCardFrontUrl">
                                            <Postcard />
                                        </el-icon>
                                        <template v-else>
                                            <el-image :src="subjectInfo.idCardFrontUrl"
                                                :preview-src-list="[subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean)"
                                                class="preview-img" fit="cover" :preview-teleported="true" />
                                        </template>
                                    </div>
                                    <div class="preview-box">
                                        <el-icon v-if="!subjectInfo.idCardBackUrl">
                                            <Postcard />
                                        </el-icon>
                                        <template v-else>
                                            <el-image :src="subjectInfo.idCardBackUrl"
                                                :preview-src-list="[subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean)"
                                                :initial-index="subjectInfo.idCardFrontUrl ? 1 : 0" class="preview-img"
                                                fit="cover" :preview-teleported="true" />
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="detail-row" v-if="subjectInfo.type === 1">
                        <div class="label">企业资质：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <template
                                    v-if="subjectInfo.qualificationUrls && parseUrls(subjectInfo.qualificationUrls).length">
                                    <div class="preview-box"
                                        v-for="(url, index) in parseUrls(subjectInfo.qualificationUrls)" :key="index">
                                        <el-image :src="url"
                                            :preview-src-list="parseUrls(subjectInfo.qualificationUrls)"
                                            :initial-index="index" class="preview-img" fit="cover"
                                            :preview-teleported="true" />
                                    </div>
                                </template>
                                <div class="preview-box" v-else>
                                    <el-icon>
                                        <Picture />
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="detail-row no-border" v-if="subjectInfo.type === 1">
                        <div class="label">企业介绍：</div>
                        <div class="value" v-if="subjectInfo.introduction" v-html="subjectInfo.introduction"></div>
                        <div class="value" v-else>--</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Picture, Postcard } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';
import * as ProductApi from '@/api/agri/product/index';
import * as SubjectApi from '@/api/agri/subject/index';
import { formatDate } from '@/utils/formatTime';
import { useDict } from '@/hooks/web/useDict';
import { getAgriUnitLabel } from '@/utils/agriUnit';

const { getLabel: getCategoryLabel } = useDict('agri_subject_category', 'str');
const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');
const { getLabel: getProductCategoryLabel } = useDict('agri_product_category', 'str');

const route = useRoute();

const productInfo = ref({});
const subjectInfo = ref({});
const loading = ref(false);

const parseUrls = (urlsStr) => {
    if (!urlsStr) return [];
    try {
        const parsed = JSON.parse(urlsStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return urlsStr.split(',').filter(item => !!item);
    }
};

const loadDetail = async () => {
    const id = route.query.id;
    if (!id) return;
    loading.value = true;
    try {
        const prodData = await ProductApi.getProduct(id);
        productInfo.value = prodData || {};

        if (prodData && prodData.subjectId) {
            const subData = await SubjectApi.getSubject(prodData.subjectId);
            subjectInfo.value = subData || {};
            return;
        }

        const mySubData = await SubjectApi.getMySubject();
        subjectInfo.value = mySubData || {};
    } catch (error) {
        console.error('获取归档详情失败', error);
    } finally {
        loading.value = false;
    }
};

watch(() => route.query.id, (newId) => {
    if (newId) {
        loadDetail();
    }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: 14px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.card-header {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .header-title {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 15px;
    }
}

.dashed-line {
    width: 100%;
    height: 1px;
    background-image: linear-gradient(to right, #ccc 50%, rgba(255, 255, 255, 0) 0%);
    background-position: bottom;
    background-size: 10px 1px;
    background-repeat: repeat-x;
}

.detail-list {
    /* 对应原型图中的蓝色边框效果 */
    border-radius: 4px;
    overflow: hidden;

    &.mb-30 {
        margin-bottom: 30px;
    }
}

.detail-row {
    display: flex;
    border-bottom: 1px solid #E5E7EB;
    min-height: 50px;

    &.no-border {
        border-bottom: none;
    }

    .label {
        width: 140px;
        padding: 15px 20px;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        text-align: right;
        // background: rgba(243, 244, 246, 0.5); /* 模拟左侧背景，如果原型图有的话 */
    }

    .value {
        flex: 1;
        padding: 15px 20px;
        font-size: 14px;
        color: #333;
        display: flex;
        align-items: center;
    }
}

.img-preview-group {
    display: flex;
    align-items: center;
    gap: 20px;
}

.preview-box {
    width: 80px;
    height: 50px;
    background: #F8FAFC;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #E2E8F0;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        border-color: #00B3ED;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;

        .preview-img {
            transform: scale(1.2);
        }

        .el-icon {
            color: #00B3ED;
        }
    }

    .el-icon {
        font-size: 24px;
        color: #94A3B8;
        transition: color 0.3s;
    }

    .preview-img {
        width: 100%;
        height: 100%;
        display: block;
        transition: transform 0.3s ease-in-out;
    }
}

.id-card-boxes {
    display: flex;
    gap: 10px;
}

.action-link {
    font-weight: 500;
    font-size: 14px;
}
</style>
