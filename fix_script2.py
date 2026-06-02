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
</template>
"""

# Find <script setup> index
script_idx = content.find('<script setup>')
if script_idx != -1:
    new_content = template + "\n" + content[script_idx:]
    with open('src/views/filing/product/productDetail.vue', 'w') as f:
        f.write(new_content)
        print("Fixed completely")
else:
    print("Could not find script setup")
