import re

with open('src/views/filing/product/productDetail.vue', 'r') as f:
    content = f.read()

template = """<template>
    <div class="page-container yy-detail-container" v-loading="loading">
        <PageHeader title="产品档案" desc="查看农产品的详细档案信息。" />

        <div class="page-scrollable">
            <div class="content-card premium-card">
                <!-- 产品基本信息 -->
                <div class="premium-section">
                    <div class="section-header">
                        <div class="header-accent"></div>
                        <span class="header-title">产品基本信息</span>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">*产品编码</span>
                            <span class="value">{{ productInfo.productCode || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*产品名称</span>
                            <span class="value">{{ productInfo.productName || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*产品类别</span>
                            <span class="value">{{ productInfo.category ? getProductCategoryLabel(productInfo.category) == '--' ? productInfo.category : getProductCategoryLabel(productInfo.category) : '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*产品产地</span>
                            <span class="value">{{ productInfo.productionArea || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">建档时间</span>
                            <span class="value">{{ formatDate(productInfo.archiveDate, 'YYYY-MM-DD HH:mm:ss') || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*批次规模</span>
                            <span class="value">{{ productInfo.productSpec ? productInfo.productSpec + ' ' + getAgriUnitLabel(productInfo.productUnit) : '--' }}</span>
                        </div>
                        <div class="detail-item full-width">
                            <span class="label">*宣传照片</span>
                            <div class="value">
                                <div class="img-preview-group">
                                    <div class="preview-box">
                                        <el-icon v-if="!productInfo.productImageUrl"><Picture /></el-icon>
                                        <el-image v-else :src="productInfo.productImageUrl" :preview-src-list="[productInfo.productImageUrl]" class="preview-img" fit="cover" :preview-teleported="true" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 所属主体信息 -->
                <div class="premium-section mt-40">
                    <div class="section-header">
                        <div class="header-accent"></div>
                        <span class="header-title">所属主体信息</span>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">*主体名称</span>
                            <span class="value">{{ subjectInfo.name || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*主体类型</span>
                            <span class="value"><el-tag size="small" effect="light" v-if="subjectInfo.category">{{ getCategoryLabel(subjectInfo.category) }}</el-tag><span v-else>--</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*建档类型</span>
                            <span class="value"><el-tag size="small" type="success" effect="light" v-if="subjectInfo.type">{{ getFilingTypeLabel(subjectInfo.type) }}</el-tag><span v-else>--</span></span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*主营产品</span>
                            <span class="value">{{ subjectInfo.mainProducts || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*所属地区</span>
                            <span class="value">{{ [subjectInfo.provinceCode, subjectInfo.cityCode, subjectInfo.districtCode].filter(Boolean).join('') || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*详细地址</span>
                            <span class="value">{{ subjectInfo.address || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*联系人</span>
                            <span class="value">{{ subjectInfo.contactName || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*联系电话</span>
                            <span class="value">{{ subjectInfo.contactPhone || '--' }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">*生产规模</span>
                            <span class="value">{{ subjectInfo.productionScale ? subjectInfo.productionScale + ' ' + getAgriUnitLabel(subjectInfo.productionScaleUnit) : '--' }}</span>
                        </div>
                        <div class="detail-item" v-if="subjectInfo.type === 1">
                            <span class="label">*信用代码</span>
                            <span class="value">{{ subjectInfo.socialCreditCode || '--' }}</span>
                        </div>
                        <div class="detail-item" v-if="subjectInfo.type === 2">
                            <span class="label">*身份证号</span>
                            <span class="value">{{ subjectInfo.idCard || '--' }}</span>
                        </div>
                        <div class="detail-item full-width" v-if="subjectInfo.type === 1">
                            <span class="label">*营业执照</span>
                            <div class="value">
                                <div class="img-preview-group">
                                    <div class="preview-box">
                                        <el-icon v-if="!subjectInfo.businessLicenseUrl"><Picture /></el-icon>
                                        <el-image v-else :src="subjectInfo.businessLicenseUrl" :preview-src-list="[subjectInfo.businessLicenseUrl]" class="preview-img" fit="cover" :preview-teleported="true" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="detail-item full-width" v-if="subjectInfo.type === 2">
                            <span class="label">身份证</span>
                            <div class="value">
                                <div class="img-preview-group">
                                    <div class="id-card-boxes">
                                        <div class="preview-box">
                                            <el-icon v-if="!subjectInfo.idCardFrontUrl"><Postcard /></el-icon>
                                            <el-image v-else :src="subjectInfo.idCardFrontUrl" :preview-src-list="[subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean)" class="preview-img" fit="cover" :preview-teleported="true" />
                                        </div>
                                        <div class="preview-box">
                                            <el-icon v-if="!subjectInfo.idCardBackUrl"><Postcard /></el-icon>
                                            <el-image v-else :src="subjectInfo.idCardBackUrl" :preview-src-list="[subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean)" :initial-index="subjectInfo.idCardFrontUrl ? 1 : 0" class="preview-img" fit="cover" :preview-teleported="true" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="detail-item full-width" v-if="subjectInfo.type === 1">
                            <span class="label">企业资质</span>
                            <div class="value">
                                <div class="img-preview-group">
                                    <template v-if="subjectInfo.qualificationUrls && parseUrls(subjectInfo.qualificationUrls).length">
                                        <div class="preview-box" v-for="(url, index) in parseUrls(subjectInfo.qualificationUrls)" :key="index">
                                            <el-image :src="url" :preview-src-list="parseUrls(subjectInfo.qualificationUrls)" :initial-index="index" class="preview-img" fit="cover" :preview-teleported="true" />
                                        </div>
                                    </template>
                                    <div class="preview-box" v-else>
                                        <el-icon><Picture /></el-icon>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="detail-item full-width" v-if="subjectInfo.type === 1">
                            <span class="label">企业介绍</span>
                            <div class="value description-text" v-if="subjectInfo.introduction" v-html="subjectInfo.introduction"></div>
                            <div class="value description-text" v-else>--</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>"""

style = """<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

/* 顶级高级卡片风格 */
.premium-card {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mt-40 {
    margin-top: 40px;
}

/* 标题区域 */
.section-header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    
    .header-accent {
        width: 4px;
        height: 18px;
        background: linear-gradient(180deg, #00B3ED 0%, #0081ED 100%);
        border-radius: 4px;
        margin-right: 12px;
    }

    .header-title {
        font-size: 20px;
        font-weight: 700;
        color: #1E293B;
        letter-spacing: 0.5px;
    }
}

/* 网格布局 */
.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

/* 单个详情块，微动效 */
.detail-item {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: #F8FAFC;
    border-radius: 12px;
    border: 1px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        background: #FFFFFF;
        border-color: #E2E8F0;
        box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
    }

    &.full-width {
        grid-column: 1 / -1;
    }

    .label {
        font-size: 13px;
        color: #64748B;
        margin-bottom: 8px;
        font-weight: 500;
    }

    .value {
        font-size: 15px;
        color: #0F172A;
        font-weight: 500;
        line-height: 1.5;
        word-break: break-all;
    }
}

/* 图片预览组 */
.img-preview-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 4px;
}

.preview-box {
    width: 100px;
    height: 100px;
    background: #F1F5F9;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed #CBD5E1;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
        border-color: #00B3ED;
        border-style: solid;
        box-shadow: 0 8px 24px rgba(0, 179, 237, 0.15);
        transform: scale(1.05);
        z-index: 10;

        .el-icon {
            color: #00B3ED;
            transform: scale(1.1);
        }
    }

    .el-icon {
        font-size: 28px;
        color: #94A3B8;
        transition: all 0.3s ease;
    }

    .preview-img {
        width: 100%;
        height: 100%;
        display: block;
        transition: transform 0.5s ease;
    }
}

.id-card-boxes {
    display: flex;
    gap: 16px;
}

.description-text {
    line-height: 1.8 !important;
    color: #334155 !important;
    background: #FFF;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    margin-top: 4px;
}
</style>"""

content = re.sub(r'<template>.*?</template>', template, content, flags=re.DOTALL)
content = re.sub(r'<style lang="scss" scoped>.*?</style>', style, content, flags=re.DOTALL)

with open('src/views/filing/product/productDetail.vue', 'w') as f:
    f.write(content)
