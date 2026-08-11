<template>
    <div class="page-container">
        <pageHeader v-if="currentStep == 2" title="合格证开具" desc="填写农产品合格证的详细信息，包括产品批次、检测结果、生产者信息等" />
        <pageHeader v-else-if="currentStep == 3" title="合格证开具" desc="填写农产品合格证的详细信息，包括产品批次、检测结果、生产者信息等" />
        <pageHeader v-else title="合格证开具（生产者/收购者）" desc="填写农产品档案，关联上游合格证，关联检测信息开具合格证" />
        <div class="content-card">
            <!-- 步骤导航 (参考 guide-steps) -->
            <div class="guide-steps">
                <!-- Step 1 -->
                <div class="step-container">
                    <div class="step-wrapper" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
                        <div class="step-icon">
                            <span v-if="currentStep <= 1">1</span>
                            <el-icon v-else>
                                <Check />
                            </el-icon>
                        </div>
                        <div class="step-content">
                            <div class="step-title">选择产品</div>
                            <div class="step-desc">{{ currentStep > 1 ? '已完成' : '进行中' }}</div>
                        </div>
                    </div>
                    <div class="step-arrow">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-svg">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>

                <!-- Step 2 -->
                <div class="step-container">
                    <div class="step-wrapper"
                        :class="{ 'waiting': currentStep < 2, active: currentStep === 2, completed: currentStep > 2 }">
                        <div class="step-icon">
                            <span v-if="currentStep <= 2">2</span>
                            <el-icon v-else>
                                <Check />
                            </el-icon>
                        </div>
                        <div class="step-content">
                            <div class="step-title">合格证配置</div>
                            <div class="step-desc">{{ currentStep > 2 ? '已完成' : (currentStep === 2 ? '进行中' : '等待中') }}
                            </div>
                        </div>
                    </div>
                    <div class="step-arrow">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-svg">
                            <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                </div>

                <!-- Step 3 -->
                <div class="step-container">
                    <div class="step-wrapper" :class="{ 'waiting': currentStep < 3, active: currentStep === 3 }">
                        <div class="step-icon">
                            <span>3</span>
                        </div>
                        <div class="step-content">
                            <div class="step-title">预览生成</div>
                            <div class="step-desc">{{ currentStep === 3 ? '进行中' : '等待中' }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 第一步：创建产品档案 -->
            <div v-if="currentStep === 1" class="step-content">
                <el-form :model="formData" label-position="top" class="creation-form">
                    <!-- 产品档案信息 -->
                    <div class="form-section">
                        <h3 class="section-title">合格证产品信息</h3>

                        <div class="archive-relation-row">
                            <div class="relation-label">是否关联农产品档案</div>
                            <el-radio-group v-model="formData.linkProfile" class="relation-radio">
                                <el-radio label="no">否</el-radio>
                                <el-radio label="yes">是</el-radio>
                            </el-radio-group>
                            <div class="relation-search" v-if="formData.linkProfile === 'yes'">
                                <el-select v-model="formData.searchProfile" filterable remote reserve-keyword
                                    placeholder="查询产品名称 or 编号，完成产品档案管理" class="search-input full-width"
                                    style="width: 100%" :remote-method="searchProduct" :loading="productLoading"
                                    @change="handleProductSelect">
                                    <template #prefix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                    <el-option v-for="item in productOptions" :key="item.id"
                                        :label="`${item.productName} (${item.productCode})`" :value="item.id" />
                                </el-select>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <!-- 两列布局 -->
                        <div class="product-fields-grid">
                            <!-- 第一行：产品编号 + 产品名称 -->
                            <div class="form-row two-cols">
                                <el-form-item label="产品编号" required class="form-col">
                                    <el-input v-model="formData.productNo"
                                        :placeholder="formData.linkProfile === 'yes' ? '关联后自动带出' : '输入产品编号'"
                                        :disabled="formData.linkProfile === 'yes'" />
                                </el-form-item>
                                <el-form-item label="产品名称" required class="form-col">
                                    <el-autocomplete v-model="formData.productName" placeholder="输入产品名称"
                                        :disabled="formData.linkProfile === 'yes'" :fetch-suggestions="queryProduce"
                                        @select="handleProduceSelect" @blur="handleProduceBlur" value-key="name"
                                        class="full-width" />
                                </el-form-item>
                            </div>

                            <!-- 第二行：产品类别 + 产品产地 -->
                            <div class="form-row two-cols">
                                <el-form-item label="产品类别" required class="form-col">
                                    <el-select v-model="formData.category" placeholder="选择产品类别" class="full-width"
                                        :disabled="formData.linkProfile === 'yes'" filterable allow-create clearable>
                                        <el-option v-for="dict in productCategoryOptions" :key="dict.value"
                                            :label="dict.label" :value="dict.value" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="产品产地" required class="form-col">
                                    <AreaCascader style="width: 220px!important;" v-model="originAreaVal"
                                        @select="handleOriginSelect" placeholder="请选择产品产地"
                                        :disabled="formData.linkProfile === 'yes'" />
                                </el-form-item>
                            </div>

                            <!-- 第三行：批次规模 + 建档日期 -->
                            <div class="form-row two-cols">
                                <el-form-item label="批次规模" required class="form-col">
                                    <div class="batch-input">
                                        <el-input v-model="formData.batchSize" placeholder="输入产品数量" style="flex: 1;"
                                            :disabled="formData.linkProfile === 'yes'" />
                                        <el-select v-model="formData.unit" placeholder="单位" style="width: 100px;"
                                            :disabled="formData.linkProfile === 'yes'">
                                            <el-option v-for="unit in measurementUnitOptions" :key="unit.value"
                                                :label="unit.label" :value="unit.value" />
                                        </el-select>
                                    </div>
                                </el-form-item>
                                <el-form-item label="建档日期" required class="form-col">
                                    <el-date-picker v-model="formData.createDate" type="date" placeholder="选择建档日期时间"
                                        class="full-width" :disabled="formData.linkProfile === 'yes'"
                                        value-format="YYYY-MM-DD" />
                                </el-form-item>
                            </div>

                            <div class="form-row two-cols">
                                <el-form-item label="产品图片" class="form-col">
                                    <div class="image-upload-wrapper">
                                        <UploadImg v-model="formData.productImageUrl" :limit="1" height="150px"
                                            width="150px" :disabled="formData.linkProfile === 'yes'" />
                                    </div>
                                </el-form-item>
                            </div>
                        </div>
                    </div>

                    <div class="divider compact"></div>

                    <!-- 生产经营企业 -->
                    <div class="form-section">
                        <h3 class="section-title"><span class="required-mark">*</span>关联主体信息</h3>
                        <p class="section-tip" v-if="!selectedSubjectDetail">*从生产档案中选择，或直接搜索到企业，支持多项建档</p>

                        <div class="entity-selector">
                            <el-select v-model="formData.subjectId" placeholder="搜索企业名称或信用代码查询主体" class="full-width"
                                filterable remote :remote-method="searchEntity" @change="handleEntityChange">
                                <template #prefix>
                                    <el-icon>
                                        <Search />
                                    </el-icon>
                                </template>
                                <el-option v-for="item in entityOptions" :key="item.id" :label="item.name"
                                    :value="item.id" />
                            </el-select>
                            <div v-if="selectedSubjectDetail" class="subject-detail-card">
                                <div class="card-title">
                                    <div class="title-left">
                                        <el-icon class="title-icon">
                                            <OfficeBuilding />
                                        </el-icon>
                                        <span>主体详细信息</span>
                                    </div>
                                    <div class="info-actions">
                                        <el-button class="theme-default-btn" @click="handleClearEntity">关闭</el-button>
                                        <el-button type="primary" class="theme-primary-btn"
                                            @click="showSubjectDrawer = true">主体建档</el-button>
                                    </div>
                                </div>
                                <div class="detail-grid">
                                    <div class="grid-item">
                                        <div class="field-label">主体名称</div>
                                        <div class="field-value">{{ selectedSubjectDetail.name || '--' }}</div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">信用代码</div>
                                        <div class="field-value">{{ selectedSubjectDetail.socialCreditCode || selectedSubjectDetail.idCard || '--' }}
                                        </div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">主体类型</div>
                                        <div class="field-value">
                                            <span class="category-tag" v-if="selectedSubjectDetail.category">{{
                                                getSubjectCategoryLabel(selectedSubjectDetail.category) }}</span>
                                            <span v-else>--</span>
                                        </div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">建档类型</div>
                                        <div class="field-value">{{ getFilingTypeLabel(selectedSubjectDetail.type) ||
                                            '--' }}</div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">联系人</div>
                                        <div class="field-value">{{ selectedSubjectDetail.contactName || '--' }}</div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">联系电话</div>
                                        <div class="field-value">{{ selectedSubjectDetail.contactPhone || '--' }}</div>
                                    </div>
                                    <div class="grid-item full-row">
                                        <div class="field-label">所属地区及详细地址</div>
                                        <div class="field-value">
                                            {{ selectedSubjectDetail.provinceCode || '' }}{{
                                                selectedSubjectDetail.cityCode || '' }}{{
                                                selectedSubjectDetail.districtCode || '' }} {{
                                                selectedSubjectDetail.address || '' }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="entity-info-card-empty">
                                <span class="empty-tip">*如果未找到相关生产主体，请先创建主体档案：</span>
                                <el-button type="primary" class="theme-primary-btn mini-btn"
                                    @click="showSubjectDrawer = true">主体建档</el-button>
                            </div>
                        </div>
                    </div>

                    <!-- 主体建档侧滑 -->
                    <SubjectFormDrawer v-model="showSubjectDrawer" @success="handleSubjectCreateSuccess" />

                    <div class="divider compact"></div>

                    <!-- 关联上游合格证 -->
                    <div class="form-section" :class="{ 'no-margin': formData.linkUpstream === 'no' }">
                        <div class="section-header-row">
                            <h3 class="section-title no-margin" style="margin-bottom: 0;">关联上游合格证</h3>
                            <el-radio-group v-model="formData.linkUpstream">
                                <el-radio label="yes">是</el-radio>
                                <el-radio label="no">否</el-radio>
                            </el-radio-group>
                        </div>
                        <template v-if="formData.linkUpstream === 'yes'">

                            <el-form-item class="mt16">
                                <el-select v-model="formData.upstreamCertificateSource" placeholder="农产品上游合格证为本平台开具"
                                    class="full-width">
                                    <el-option label="农产品上游合格证为本平台开具" :value="1" />
                                    <el-option label="农产品上游合格证为其他平台开具" :value="2" />
                                </el-select>
                            </el-form-item>

                            <div v-if="formData.upstreamCertificateSource === 1" class="search-row">
                                <el-input v-model="formData.upstreamCertNo" placeholder="HGZ0000000001(输入上游合格证编号)"
                                    style="flex: 1">
                                    <template #suffix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                </el-input>
                                <el-button type="primary" class="theme-primary-btn mini-btn" :loading="upstreamLoading"
                                    @click="handleSearchUpstream">
                                    查询
                                </el-button>
                            </div>

                            <!-- 关联本平台开具合格证 预览 -->
                            <div v-if="formData.upstreamCertificateSource === 1 && formData.upstreamId"
                                class="upstream-platform-preview mt16">
                                <div class="linked-cert-card">
                                    <div class="linked-cert-code">合格证编号－{{ upstreamCertificateCode }}</div>
                                    <div class="linked-cert-body">
                                        <div class="linked-cert-title">承诺达标合格</div>
                                        <div class="linked-cert-subtitle">我承诺生产销售的食用农产品</div>
                                        <div class="linked-cert-desc">{{ upstreamCommitmentIntro }}</div>
                                        <div class="linked-cert-main">
                                            <div class="linked-cert-left">
                                                <div class="linked-cert-basis-title">承诺依据</div>
                                                <div class="linked-cert-basis-list">
                                                    <div class="linked-cert-basis-item"
                                                        v-for="item in upstreamBasisOptions" :key="item.value">
                                                        <span class="basis-check" :class="{ checked: item.checked }">{{
                                                            item.checked ? '✓' : '' }}</span>
                                                        <span>{{ item.label }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="linked-cert-qr">
                                                <Qrcode v-if="upstreamQrText" :text="upstreamQrText"
                                                    :options="{ errorCorrectionLevel: 'L' }" :width="100" />
                                            </div>
                                        </div>
                                        <div class="linked-cert-divider"></div>
                                        <div class="linked-cert-info">
                                            <div class="linked-info-title">基本信息</div>
                                            <div class="linked-info-table">
                                                <div class="linked-info-row">
                                                    <div class="linked-info-label">产品名称</div>
                                                    <div class="linked-info-value">{{
                                                        upstreamCertificateDetail.productName
                                                        || upstreamCertificateDetail.productDraft?.productName || '--'
                                                    }}
                                                    </div>
                                                </div>
                                                <div class="linked-info-row">
                                                    <div class="linked-info-label">产品数量</div>
                                                    <div class="linked-info-value">{{ upstreamCertificateDetail.quantity
                                                        ??
                                                        upstreamCertificateDetail.batchNo ?? '--' }} {{
                                                            getAgriUnitLabel(upstreamCertificateDetail.unit) }}</div>
                                                </div>
                                                <div class="linked-info-row">
                                                    <div class="linked-info-label">产品产地</div>
                                                    <div class="linked-info-value">{{
                                                        upstreamCertificateDetail.productionArea ||
                                                        upstreamCertificateDetail.productDraft?.productionArea || '--'
                                                    }}
                                                    </div>
                                                </div>
                                                <div class="linked-info-row">
                                                    <div class="linked-info-label">承诺主体</div>
                                                    <div class="linked-info-value">{{
                                                        upstreamCertificateDetail.subjectName || '--' }}</div>
                                                </div>
                                                <div class="linked-info-row">
                                                    <div class="linked-info-label">联系方式</div>
                                                    <div class="linked-info-value">{{
                                                        upstreamCertificateDetail.contactPhone || '--' }}</div>
                                                </div>
                                                <div class="linked-info-row">
                                                    <div class="linked-info-label">开具时间</div>
                                                    <div class="linked-info-value">{{
                                                        upstreamCertificateDetail.issueDate
                                                        || '--' }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="linked-cert-footer">*电子合格证由链安食检数智服务平台承载展示</div>
                                    </div>
                                </div>
                            </div>

                            <div v-else-if="formData.upstreamCertificateSource === 2" class="other-platform-area">
                                <div class="upload-trigger-wrap">
                                    <el-upload class="upstream-uploader" action="#" :auto-upload="false"
                                        :show-file-list="false" @change="onUpstreamFileChange">
                                        <el-button type="primary" class="upload-btn">上传合格证照片</el-button>
                                    </el-upload>
                                </div>

                                <div class="upstream-preview-card">
                                    <div class="preview-title">上游合格证预览</div>
                                    <div class="preview-body">
                                        <!-- 仅保留并放大图片展示 -->
                                        <div class="image-box-side only-img">
                                            <el-image v-if="formData.upstreamCertificateImageUrl"
                                                :src="formData.upstreamCertificateImageUrl" fit="contain"
                                                class="preview-img"
                                                :preview-src-list="[formData.upstreamCertificateImageUrl]" />
                                            <div v-else class="img-empty">
                                                <el-icon :size="48">
                                                    <Picture />
                                                </el-icon>
                                                <span>未上传上游合格证照片</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- 基本信息预览 -->
                    <div class="divider compact" v-if="false"></div>
                    <div class="basic-info-preview" v-if="false">
                        <h3 class="preview-title" style="margin-bottom: 4px;">待开具合格证-产品信息预览</h3>
                        <div class="info-grid">
                            <div class="info-row"><span class="label">产品名称</span><span class="value">{{
                                formData.productName || '--'
                                    }}</span></div>
                            <div class="info-row"><span class="label">数量/重量</span><span class="value">{{
                                formData.batchSize || '--' }} {{ getAgriUnitLabel(formData.unit) }}</span></div>
                            <div class="info-row">
                                <span class="label">产品类别</span>
                                <span class="value">
                                    {{ getDictLabel(DICT_TYPE.AGRI_PRODUCT_CATEGORY, formData.category) || '--' }}
                                </span>
                            </div>
                            <div class="info-row"><span class="label">产品产地</span><span class="value">{{ formData.origin
                                || '--' }}</span>
                            </div>
                            <div class="info-row"><span class="label">承诺主体</span><span class="value">{{ formData.entity
                                || '--' }}</span>
                            </div>
                            <div class="info-row"><span class="label">联系方式</span><span class="value">{{
                                formData.contactPhone || '--'
                                    }}</span></div>
                            <div class="info-row"><span class="label">开具时间</span><span class="value">{{
                                formatDate(formData.createDate) || '--'
                                    }}</span></div>
                        </div>
                        <p class="info-tip">*电子合格证由链安食检数智服务平台承载展示</p>
                    </div>


                    <!-- 底部按钮 -->
                    <div class="form-footer">
                        <el-button class="theme-default-btn" @click="handleCancel">取消</el-button>
                        <el-button type="primary" :loading="submitLoading" class="theme-primary-btn"
                            @click="goNextToStep2">下一步</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 第二步：开具内容 -->
            <div v-if="currentStep === 2" class="step-content">
                <el-form :model="formData" :rules="rules" ref="formRef2" label-position="top" class="step-form">
                    <el-form-item label="合格证出证类型" prop="issueType" class="nowrap-item">
                        <el-select v-model="formData.issueType" placeholder="请选择出证类型" class="custom-select-large">
                            <el-option v-for="dict in certificateTypeOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="数量 (重量)">
                        <div class="quantity-input">
                            <div class="stepper">
                                <button type="button" :class="['step-btn', { yellow: formData.quantity > 0 }]"
                                    @click="handleSub">-</button>
                                <input type="number" class="step-val" v-model.number="formData.quantity" min="0" />
                                <button type="button" class="step-btn yellow" @click="handleAdd">+</button>
                            </div>
                            <el-select v-model="formData.unit" class="unit-select">
                                <el-option v-for="unit in measurementUnitOptions" :key="unit.value" :label="unit.label"
                                    :value="unit.value" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <el-form-item label="承诺依据" prop="basis">
                        <el-checkbox-group v-model="formData.basis">
                            <el-checkbox :label="1">质量安全控制符合要求</el-checkbox>
                            <el-checkbox :label="2">自行检测合格</el-checkbox>
                            <el-checkbox :label="3">委托检测合格</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <div class="divider"></div>

                    <div class="association-grid">
                        <!-- 左侧：第三方结果 -->
                        <div class="assoc-col">
                            <h3 class="col-title">关联样品检测结果
                                <!-- {{ formData.thirdPartyType === 'third' ? '第三方' : '本平台' }} -->
                            </h3>
                            <div class="col-content-box">
                                <el-select v-model="formData.thirdPartyType" placeholder="第三方检测结果" class="full-width">
                                    <el-option label="第三方检测结果" value="third" />
                                    <el-option label="本平台检测结果" value="platform" />
                                </el-select>
                                <template v-if="formData.thirdPartyType === 'third'">
                                    <div class="upload-wrapper-box" @click="handleTriggerUpload">
                                        <div class="upload-trigger-inner">
                                            <UploadImgs ref="uploadImgsRef" v-model="formData.thirdPartyReportUrls"
                                                :limit="3" draggable class="hidden-upload" width="100%" height="100%" />
                                            <div class="trigger-content"
                                                v-if="!formData.thirdPartyReportUrls || formData.thirdPartyReportUrls.length === 0">
                                                <el-icon class="upload-big-icon">
                                                    <Plus />
                                                </el-icon>
                                                <div class="upload-tip-text">点击或拖拽上传检测报告（最多3张）</div>
                                                <div class="upload-sub-tip">支持 JPG、PNG、PDF 格式，每张不超过 5MB</div>
                                            </div>
                                            <div class="trigger-content active" v-else>
                                                <el-icon class="upload-big-icon primary">
                                                    <CircleCheck />
                                                </el-icon>
                                                <div class="upload-tip-text">继续上传或更改图片 ({{
                                                    formData.thirdPartyReportUrls.length }}/3)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="results-preview-list"
                                        v-if="formData.thirdPartyReportUrls && formData.thirdPartyReportUrls.length > 0">
                                        <h4 class="preview-title">上传结果预览：</h4>
                                        <div class="image-preview-grid">
                                            <div v-for="(url, idx) in formData.thirdPartyReportUrls" :key="idx"
                                                class="preview-box" :title="isPdf(url) ? '点击预览 PDF' : ''">
                                                <div v-if="isPdf(url)" class="pdf-file-preview"
                                                    @click="handlePreviewPdf(url)">
                                                    <el-icon>
                                                        <Document />
                                                    </el-icon>
                                                    <span class="file-label">PDF 报告</span>
                                                </div>
                                                <el-image v-else :src="url" class="preview-img"
                                                    :preview-src-list="formData.thirdPartyReportUrls"
                                                    :initial-index="idx" fit="contain" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="results-preview-list no-data" v-else>
                                        <h4 class="preview-title">上传结果预览：</h4>
                                        <div class="image-preview-grid">
                                            <div v-for="n in 3" :key="n" class="preview-box empty">
                                                <div class="preview-placeholder">
                                                    <el-icon>
                                                        <Picture />
                                                    </el-icon>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>

                                <template v-else>
                                    <PlatformDetectionSelector v-model="formData.platformRecordIds"
                                        v-model:linked-records="linkedPlatformRecords"
                                        :search-method="searchPlatformRecords"
                                        @update:active-record="handlePlatformActiveRecordChange" />
                                </template>


                            </div>
                        </div>
                    </div>

                    <div class="page-footer">
                        <el-button class="theme-default-btn" @click="goToStep(1)">上一步</el-button>
                        <el-button type="primary" :loading="submitLoading" class="theme-primary-btn"
                            @click="handleGenerate">生成合格证</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 第三步：查看合格证 -->
            <div v-if="currentStep === 3" class="step-content">
                <div ref="printAreaRef" class="step-three-print-source">
                    <CertificatePrintTemplate :certificate="generatedCertificatePreview"
                        :basis-options="selectedGeneratedBasisOptions" :commitment-lines="generatedCommitmentLines"
                        :qr-text="generatedCertificateQrText" />
                </div>

                <div class="action-footer">
                    <el-button class="theme-default-btn" @click="goToStep(2)">上一步</el-button>
                    <el-button type="primary" class="theme-primary-btn" :loading="captureLoading"
                        @click="handlePreview">
                        打印
                    </el-button>
                    <el-button type="info" class="theme-default-btn" @click="handleDownload">下载</el-button>

                </div>
            </div>
        </div>

        <el-dialog v-model="previewVisible" title="打印预览" width="840px" append-to-body class="print-preview-dialog">
            <div class="preview-section-title">热敏打印效果预览</div>
            <div class="preview-wrapper print-effect-wrapper" v-loading="printEffectLoading">
                <img v-if="printEffectPreviewSrc" :src="printEffectPreviewSrc" class="preview-img print-effect-img" />
                <div v-else class="preview-placeholder">生成打印效果中…</div>
            </div>
            <template #footer>
                <el-button class="theme-default-btn" @click="previewVisible = false">关闭</el-button>
                <el-button plain class="theme-default-btn bluetooth-btn" :loading="bluetoothConnecting"
                    @click="connectBluetoothPrinter">
                    {{ bluetoothReady ? `已连接：${printerName}` : '连接蓝牙打印机' }}
                </el-button>
                <el-button type="primary" class="theme-primary-btn" :loading="bluetoothPrinting"
                    :disabled="!preparedPrintBytes || !bluetoothReady" @click="handlePrint(previewSrc)">
                    蓝牙打印
                </el-button>
            </template>
        </el-dialog>

        <!-- PDF 预览弹窗 -->
        <el-dialog v-model="pdfVisible" title="PDF 报告预览" width="80%" destroy-on-close class="pdf-view-dialog">
            <iframe :src="pdfUrl" width="100%" height="700px" frameborder="0"></iframe>
        </el-dialog>
    </div>
</template>

<script setup>
import { reactive, computed, onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { Search, Picture, Check, ArrowRight, Plus, CircleCheck, Document, OfficeBuilding } from '@element-plus/icons-vue';
import { useCertificateStore } from '@/store/modules/certificate';
import PageBack from '@/components/PageBack/index.vue';
import * as CertificateApi from '@/api/agri/certificate';
import * as ProductApi from '@/api/agri/product';
import * as SubjectApi from '@/api/agri/subject';
import * as DetectionReportApi from '@/api/agri/detectionReport';
import * as ProduceApi from '@/api/agri/produce/index';

/**\n * isPdf：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const isPdf = (url) => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
};

// PDF 预览相关
const pdfVisible = ref(false);
const pdfUrl = ref('');

/**\n * handlePreviewPdf：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handlePreviewPdf = (url) => {
    if (!url) return;
    pdfUrl.value = url;
    pdfVisible.value = true;
};

import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import { useMessage } from '@/hooks/web/useMessage';
import { useDict } from '@/hooks/web/useDict';
import { DICT_TYPE, getIntDictOptions, getDictOptions, getDictLabel } from '@/utils/dict';
import { formatDate } from '@/utils/formatTime';
import { Qrcode } from '@/components/Qrcode';
import { CertificatePrintTemplate } from '@/components/CertificatePrintTemplate';
import SubjectFormDrawer from '@/views/filing/subject/components/SubjectFormDrawer.vue';
import PlatformDetectionSelector from './components/PlatformDetectionSelector.vue';
import AreaCascader from '@/components/AreaCascader/index.vue';
import { BluetoothPrinter } from '@/utils';
import { parseImage } from '@/api/agri/certificateVerification/index';
import { uploadFile } from '@/api/common/index';
import { ElLoading } from 'element-plus';
import {
    captureCertificatePrintArea,
    certificatePrintImageOptions,
    getSelectedCertificateBasisOptions
} from '@/utils/certificatePrint';
import {
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    getAgriUnitLabel,
    usePreferredAgriMeasurementUnitOptions
} from '@/utils/agriUnit';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');
const { getLabel: getSubjectCategoryLabel } = useDict('agri_subject_category', 'str');
const certStore = useCertificateStore();
const PRINTER_NAME_PREFIX = 'YSH';
const PRINTER_SERVICE_UUIDS = [
    '000018f0-0000-1000-8000-00805f9b34fb',
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455'
];
const PRINTER_CHARACTERISTIC_UUIDS = [
    '00002af1-0000-1000-8000-00805f9b34fb',
    '0000ffe1-0000-1000-8000-00805f9b34fb',
    '49535343-8841-43f4-a8d4-ecbe34729bb3'
];

const id = route.query.id;
const isUpdate = !!id;
const currentStep = computed(() => certStore.currentStep);
const finalCertificateDetail = ref(null);

const isSubmitted = ref(false);
const submissionFailed = ref(false);

// 点返回清空数据
onBeforeRouteLeave(async (to) => {
    // 如果在第二步切换页面且未提交成功且未发生过提交错误，则自动保存草稿
    if (currentStep.value === 2 && !isSubmitted.value && !submissionFailed.value) {
        try {
            await handleSaveDraft(true); // 静默保存
        } catch (e) {
            console.error('自动保存草稿失败', e);
        }
    }

    if (to.path === '/certificate/issue') {
        certStore.resetAll();
        finalCertificateDetail.value = null;
    }
});

// 字典数据
const certificateTypeOptions = getIntDictOptions(DICT_TYPE.AGRI_CERTIFICATE_TYPE);
const productCategoryOptions = getDictOptions(DICT_TYPE.AGRI_PRODUCT_CATEGORY);

/**
 * 按输入名称查询农产品档案，为自动补全组件提供候选项。
 * 查询失败时向组件回传空数组，避免网络异常阻断表单录入。
 */
const queryProduce = async (queryString, cb) => {
    if (!queryString) {
        cb([]);
        return;
    }
    try {
        const res = await ProduceApi.getProducePage({ name: queryString, pageNo: 1, pageSize: 50 });
        cb(res.list || []);
    } catch (e) {
        cb([]);
    }
};

/**
 * 将档案中的完整分类路径映射为当前表单使用的一级分类字典值。
 * 无法匹配字典时保留接口原值，兼容历史分类数据。
 */
const matchCategoryFromFullCategory = (item) => {
    if (item.fullCategory) return item.fullCategory;
    const fullCategory = item.category;
    if (!fullCategory) return null;
    const firstLevel = fullCategory.split('/')[0];
    const matchedOption = productCategoryOptions.find(opt =>
        firstLevel.includes(opt.label) || opt.label.includes(firstLevel.replace('类', ''))
    );
    return matchedOption ? matchedOption.value : fullCategory;
};

/**\n * handleProduceSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleProduceSelect = (item) => {
    formData.productName = item.name;
    const category = matchCategoryFromFullCategory(item);
    if (category) {
        formData.category = category;
    }
};

/**
 * 用户手工输入产品名称后补查分类。
 * 表单已有分类时不覆盖，且仅在接口返回名称完全一致的产品时回填。
 */
const handleProduceBlur = async () => {
    if (!formData.productName || formData.category) return; // 已有类别则不覆盖
    try {
        const res = await ProduceApi.getProducePage({ name: formData.productName, pageNo: 1, pageSize: 1 });
        if (res.list && res.list.length > 0) {
            const item = res.list[0];
            if (item.name === formData.productName) {
                const category = matchCategoryFromFullCategory(item);
                if (category) {
                    formData.category = category;
                }
            }
        }
    } catch (e) { }
};

const formRef2 = ref(null);

const rules = {
    issueType: [{ required: true, message: '请选择合格证出证类型', trigger: 'change' }],
    basis: [{ type: 'array', required: true, message: '请至少选择一项承诺依据', trigger: 'change' }]
};

const formData = reactive({
    id: undefined,
    // Step 1
    linkProfile: 'yes',
    searchProfile: '',
    productNo: '',
    productName: '',
    category: '',
    origin: '',
    batchSize: '',
    unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
    createDate: formatDate(new Date()),
    entity: '',
    registeredCity: '',
    legalPerson: '',
    productImageUrl: '',
    productId: undefined,
    subjectId: undefined, // 新增：保存主体ID
    linkUpstream: 'no',
    upstreamCertificateSource: 1, // 1-本平台 2-其他平台
    upstreamCertNo: '',
    p1: false,
    p2: false,
    p3: false,
    upstreamId: undefined,
    // Step 2
    issueType: undefined,
    quantity: 0,
    basis: [1],
    thirdPartyType: 'platform',
    thirdPartyReportUrls: [], // 存储多张三方报告URL
    thirdPartyReportUrl: '', // 最终提交给后端的逗号分隔字符串
    platformRecordIds: [],
    platformRecordId: undefined,
    platformType: 'platform',
    searchKey: '',
    qrCode: '',
    contactPhone: '',
    commitmentContent: '', // 新增记录字段内容
    upstreamCertificateImageUrl: '', // 上游合格证照片
});

const originAreaVal = ref(undefined);
/**\n * handleOriginSelect：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleOriginSelect = (area) => {
    formData.origin = [area.province, area.city, area.district].filter(Boolean).join('-');
};

watch(() => formData.origin, (val) => {
    if (!val) {
        originAreaVal.value = undefined;
    } else if (typeof val === 'string' && /[\u4e00-\u9fa5]/.test(val)) {
        originAreaVal.value = val;
    }
}, { immediate: true });

const unitRef = computed({
    get: () => formData.unit,
    set: (value) => {
        formData.unit = value || DEFAULT_AGRI_MEASUREMENT_UNIT;
    }
});
const measurementUnitOptions = usePreferredAgriMeasurementUnitOptions(
    unitRef,
    ['千克', 'kg'],
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    computed(() => !id && !formData.productId)
);

// 监听关联档案状态，切换至“否”时清空产品信息
watch(() => formData.linkProfile, (val) => {
    if (val === 'no') {
        formData.searchProfile = '';
        formData.productNo = '';
        formData.productName = '';
        formData.category = '';
        formData.origin = '';
        formData.batchSize = '';
        formData.productId = undefined;
        formData.productImageUrl = '';
    }
});

// 动态承诺依据文本标签
const basisLabels = computed(() => {
    const type = Number(formData.issueType);
    if (type === 1) { // 生产者
        return {
            1: '未使用禁用农药兽药、停用兽药和非法添加物',
            2: '使用常规农药兽药残留不超标',
            3: '对承诺的真实性负责'
        };
    } else { // 收购者/批发市场
        return {
            1: '已按规定收取并保存该批次产品的承诺达标合格证或者其他质量安全合格证明；',
            2: '未违规使用保鲜剂、防腐剂、添加剂等。',
            3: '对承诺的真实性负责'
        };
    }
});

// 动态承诺内容计算属性：不再受勾选影响，直接展示对应类型下的所有 3 条承诺
const computedCommitment = computed(() => {
    const labels = basisLabels.value;
    // 直接返回对象中的所有文字描述（1, 2, 3）
    return [labels[1], labels[2], labels[3]].filter(Boolean);
});
const displayCertNo = computed(() => certStore.certificate.certNo || formData.productNo || '');

const generatedCertificateQrText = computed(() => {
    if (finalCertificateDetail.value) {
        return finalCertificateDetail.value.qrCode || '';
    }
    return displayCertNo.value
        ? `https://yishizhijian.jikeyun.net/web/index.html#/pages/index?id=${formData.id || ''}&code=${displayCertNo.value}`
        : '';
});

const generatedCertificatePreview = computed(() => {
    if (finalCertificateDetail.value) {
        const detail = finalCertificateDetail.value;
        return {
            certificateCode: detail.certificateCode || detail.certificateNo || '',
            qrCode: detail.qrCode || '',
            productName: detail.productName || '',
            quantity: detail.quantity || 0,
            unit: detail.unit || '',
            productionArea: detail.productionArea || '',
            subjectName: detail.subjectName || '',
            contactPhone: detail.contactPhone || '',
            createTime: detail.createTime || '',
            commitmentBasis: detail.commitmentBasis ? (typeof detail.commitmentBasis === 'string' ? JSON.parse(detail.commitmentBasis) : detail.commitmentBasis) : [],
            productImageUrl: detail.productImageUrl || ''
        };
    }
    return {
        certificateCode: displayCertNo.value,
        qrCode: generatedCertificateQrText.value,
        productName: formData.productName,
        quantity: formData.quantity ?? formData.batchSize,
        unit: formData.unit,
        productionArea: formData.origin,
        subjectName: formData.entity,
        contactPhone: formData.contactPhone,
        createTime: certStore.certificate.createTime || '',
        commitmentBasis: formData.basis,
        productImageUrl: formData.productImageUrl
    };
});

const selectedGeneratedBasisOptions = computed(() => {
    const basisValue = finalCertificateDetail.value
        ? (finalCertificateDetail.value.commitmentBasis ? (typeof finalCertificateDetail.value.commitmentBasis === 'string' ? JSON.parse(finalCertificateDetail.value.commitmentBasis) : finalCertificateDetail.value.commitmentBasis) : [])
        : formData.basis;
    return getSelectedCertificateBasisOptions(basisOptions, basisValue);
});

const generatedCommitmentLines = computed(() => {
    if (finalCertificateDetail.value && finalCertificateDetail.value.commitmentContent) {
        return finalCertificateDetail.value.commitmentContent.split('\n');
    }
    return computedCommitment.value;
});

const STEP1_FIELD_KEYS = [
    'linkProfile',
    'searchProfile',
    'productNo',
    'productName',
    'category',
    'origin',
    'batchSize',
    'unit',
    'createDate',
    'entity',
    'registeredCity',
    'legalPerson',
    'productImageUrl',
    'productId',
    'subjectId',
    'linkUpstream',
    'upstreamCertificateSource',
    'upstreamCertNo',
    'p1',
    'p2',
    'p3',
    'upstreamId',
    'contactPhone',
    'upstreamCertificateImageUrl'
];

/**\n * pickStep1Data：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const pickStep1Data = () => {
    const result = {};
    STEP1_FIELD_KEYS.forEach((key) => {
        result[key] = formData[key];
    });
    return result;
};

const submitLoading = ref(false);
const showSubjectDrawer = ref(false);
const linkedPlatformRecords = ref([]);
const currentPlatformRecord = ref(null);

/**\n * mapReportOption：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const mapReportOption = (item) => {
    const linkId = Number(item?.recordId || item?.id || 0);
    return {
        ...item,
        linkId,
        optionLabel: `${item?.sampleCode || item?.recordCode || item?.reportCode || '-'}${item?.sampleName || item?.productName ? `（${item?.sampleName || item?.productName}）` : ''}`,
        sampleName: item?.sampleName || item?.productName || ''
    };
};

/**\n * unwrapApiData：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const unwrapApiData = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return payload?.data || payload || null;
};

/**\n * normalizeDetectionRecordIds：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const normalizeDetectionRecordIds = (value) => {
    if (Array.isArray(value)) {
        return value.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
    }
    const singleId = Number(value);
    return Number.isFinite(singleId) && singleId > 0 ? [singleId] : [];
};

/**
 * 查询可关联的本平台检测记录。
 * 业务上仅允许合格证关联阴性结果，并统一不同接口包装和记录主键字段。
 */
const searchPlatformRecords = async (query) => {
    const keyword = String(query || '').trim();
    if (!keyword) return [];
    try {
        const response = await DetectionRecordApi.getDetectionRecordPage({
            keyword: keyword,
            // sampleCode: keyword,
            // sampleName: keyword,
            overallResult: 0, // 0-阴性，1-阳性，此处固定过滤掉阳性
            pageNo: 1,
            pageSize: 50
        });

        const data = unwrapApiData(response);
        // 如果返回的是分页结果对象，提取 list 数组
        const sourceList = data?.list || (Array.isArray(data) ? data : []);

        return sourceList.map(mapReportOption).filter(item => item.linkId);
    } catch (error) {
        console.error('查询平台检测记录失败', error);
        return [];
    }
};

/**\n * handlePlatformActiveRecordChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handlePlatformActiveRecordChange = (record) => {
    currentPlatformRecord.value = record || null;
};

const upstreamLoading = ref(false);
const upstreamCertificateDetail = ref({});

/**
 * 将数组或 JSON 字符串形式的承诺依据统一转换为数字数组。
 * 历史脏数据解析失败时返回空数组，不影响证书主体信息展示。
 */
const parseBasisList = (value) => {
    if (Array.isArray(value)) return value.map(item => Number(item));
    if (!value) return [];
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed.map(item => Number(item)) : [];
    } catch (error) {
        console.error('解析承诺依据失败', error);
        return [];
    }
};

const upstreamCertificateCode = computed(() =>
    upstreamCertificateDetail.value.certificateCode ||
    upstreamCertificateDetail.value.qrCode ||
    formData.upstreamCertNo ||
    '--'
);

const upstreamQrText = computed(() => {
    const id = upstreamCertificateDetail.value.id || '';
    const code = upstreamCertificateDetail.value.qrCode || upstreamCertificateDetail.value.certificateCode || formData.upstreamCertNo;
    return code ? `https://yishizhijian.jikeyun.net/web/index.html#/pages/index?id=${id}&code=${code}` : '';
});

const upstreamBasisOptions = computed(() => {
    const selected = new Set(parseBasisList(upstreamCertificateDetail.value.commitmentBasis));
    const fallbackSelected = selected.size ? selected : new Set([1, 2, 3]);
    return [
        { value: 1, label: '质量安全控制符合要求' },
        { value: 2, label: '自行检测合格' },
        { value: 3, label: '委托检测合格' }
    ].map(item => ({
        ...item,
        checked: fallbackSelected.has(item.value)
    }));
});

const upstreamCommitmentIntro = computed(() => {
    const type = Number(upstreamCertificateDetail.value.certificateType);
    if (type === 1) {
        return '未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。';
    }
    return '已按规定收取并保存该批次产品的承诺达标合格证或者其他质量安全合格证明。';
});

/**
 * 按编号查询本平台上游合格证并建立关联。
 * 查询前移除不同形态的连接符；查询结果只回填关联及预览信息，不覆盖当前产品档案。
 */
const handleSearchUpstream = async () => {
    if (!formData.upstreamCertNo) {
        message.warning('请输入上游合格证编号');
        return;
    }
    upstreamLoading.value = true;
    try {
        // 正则去除可能存在的横杠（包括全角 － 和长横杠 —）
        const cleanedCode = String(formData.upstreamCertNo || '').replace(/[－—\-]/g, '').trim();
        const data = await CertificateApi.queryUpstreamCertificate(cleanedCode);
        if (data) {
            message.success('查询成功');
            // 仅记录关联关系，不覆盖当前填写的产品档案信息
            upstreamCertificateDetail.value = data;
            formData.upstreamId = data.id;
            formData.qrCode = upstreamQrText.value || formData.qrCode;

            // 回填承诺依据，用于 Step 1 的上游预览展示
            if (data.commitmentBasis) {
                const basis = parseBasisList(data.commitmentBasis);
                formData.p1 = basis.includes(1);
                formData.p2 = basis.includes(2);
                formData.p3 = basis.includes(3);
            }
        } else {
            message.warning('未找到对应的合格证信息');
            formData.upstreamId = undefined;
            upstreamCertificateDetail.value = {};
        }
    } catch (error) {
        console.error('查询上游合格证失败', error);
        formData.upstreamId = undefined;
        upstreamCertificateDetail.value = {};
    } finally {
        upstreamLoading.value = false;
    }
};

/**
 * 处理上游合格证文件。
 * 本平台来源预留图片识别能力，其他平台来源只上传原图并清空平台证书编号。
 */
const onUpstreamFileChange = async (fileObj) => {
    const loading = ElLoading.service({
        target: '.other-platform-area',
        text: '正在智能识别上游合格证...',
        background: 'rgba(255, 255, 255, 0.7)'
    });

    try {
        if (formData.upstreamCertificateSource === 1) {
            // 本平台识别（虽然本平台通常通过编号搜索，但保留该逻辑以备二维码识别）
            const data = await parseImage({
                file: fileObj.raw,
                sourceHint: 1
            });
            formData.upstreamCertificateImageUrl = data.certificateImageUrl || '';
            // message.success('识别成功');
        } else {
            // “其他平台”不做 OCR 识别，仅上传图片
            const res = await uploadFile(fileObj.raw);
            formData.upstreamCertificateImageUrl = unwrapApiData(res) || '';
            formData.upstreamCertNo = ''; // 其他平台不传编号
            message.success('图片上传成功');
        }
    } catch (e) {
        console.error('上游合格证处理失败', e);
        message.error('处理失败，请手动确认');
    } finally {
        loading.close();
    }
};

const selectedSubjectDetail = ref(null);

watch(
    () => formData.subjectId,
    async (newVal) => {
        if (newVal) {
            try {
                const res = await SubjectApi.getSubject(newVal);
                selectedSubjectDetail.value = res;
                if (res) {
                    // formData.contactPhone = res.contactPhone || '';
                    formData.entity = res.name || '';
                }
            } catch (error) {
                console.error('获取主体详情失败', error);
                selectedSubjectDetail.value = null;
            }
        } else {
            selectedSubjectDetail.value = null;
        }
    },
    { immediate: true }
);

/**\n * handleClearEntity：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleClearEntity = () => {
    formData.subjectId = undefined;
    formData.entity = '';
    formData.legalPerson = '';
    formData.registeredCity = '';
    selectedSubjectDetail.value = null;
};

/**\n * handleEntityChange：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleEntityChange = (val) => {
    const selected = entityOptions.value.find(item => item.id === val);
    if (selected) {
        formData.entity = selected.name;
        formData.subjectId = selected.id;
        formData.legalPerson = selected.legalPerson || '';
        // 暂时回显城市代码，实际项目中可能需要通过 Code 转换
        formData.registeredCity = selected.cityCode || '--';
    }
};


/**
 * 加载待编辑合格证，并将证书、产品草稿、主体和检测记录等字段回填到分步表单。
 * 关联检测记录支持单个 ID 和 ID 数组两种历史数据格式。
 */
const loadDetails = async () => {
    if (!id) return;
    try {
        const data = await CertificateApi.getCertificate(id);
        const loadedDetectionRecordIds = normalizeDetectionRecordIds(data.detectionRecordId);

        // 解析承诺依据
        let basisArr = [];
        if (data.commitmentBasis) {
            try {
                basisArr = typeof data.commitmentBasis === 'string' ? JSON.parse(data.commitmentBasis) : data.commitmentBasis;
            } catch (e) {
                console.error('解析承诺依据失败', e);
            }
        }

        Object.assign(formData, {
            productNo: data.certificateCode || data.productDraft?.productCode || data.productCode || '',
            productName: data.productName || data.productDraft?.productName || '',
            category: data.productCategory || data.productDraft?.category || 'vegetable',
            origin: data.productionArea || data.productDraft?.productionArea || '',
            batchSize: data.batchNo || data.quantity || '',
            unit: data.unit || data.productDraft?.productUnit || DEFAULT_AGRI_MEASUREMENT_UNIT,
            createDate: data.issueDate || data.createTime || '',
            entity: data.subjectName || '',
            subjectId: data.subjectId,
            registeredCity: data.productCityCode || '青岛市',
            legalPerson: data.contactName || '', // 用联系人暂替法人回显
            contactPhone: data.contactPhone || '',
            productImageUrl: data.productImageUrl || '',
            productId: data.productId,
            issueType: data.certificateType,
            quantity: data.quantity,
            thirdPartyReportUrls: data.thirdPartyReportUrl ? data.thirdPartyReportUrl.split(',') : [],
            thirdPartyReportUrl: data.thirdPartyReportUrl || '',
            platformRecordIds: loadedDetectionRecordIds,
            platformRecordId: loadedDetectionRecordIds[0],
            thirdPartyType: data.thirdPartyReportUrl ? 'third' : (loadedDetectionRecordIds.length ? 'platform' : 'third'),
            qrCode: data.qrCode,
            // 承诺依据同步
            basis: basisArr,
            p1: basisArr.includes(1) || basisArr.includes("1"),
            p2: basisArr.includes(2) || basisArr.includes("2"),
            p3: basisArr.includes(3) || basisArr.includes("3"),
            upstreamCertificateImageUrl: data.upstreamCertificateImageUrl || ''
        });

        // 如果有关联产品，则触发产品详情加载以完善产品编号等信息
        if (data.productId) {
            handleProductSelect(data.productId, { keepCurrentUnit: true });
        }

        // 为确保 select 显示名称，如果有 ID 则构造一个 option
        if (data.subjectId && data.subjectName) {
            entityOptions.value = [{ id: data.subjectId, name: data.subjectName }];
        }
        // 更新 store 以同步其它步骤
        certStore.updateProductInfo(pickStep1Data());
        certStore.updateIssueInfo(formData);

        if (loadedDetectionRecordIds.length) {
            try {
                const detailResponses = await Promise.all(
                    loadedDetectionRecordIds.map(async (recordId) => {
                        // 优先检测记录详情（与 detectionRecordId 语义一致），报告接口作为兜底
                        try {
                            const record = await DetectionRecordApi.getDetectionRecord(Number(recordId));
                            if (record) return record;
                        } catch (error) {
                            console.warn('加载检测记录详情失败，尝试检测报告详情', recordId, error);
                        }
                        try {
                            const report = await DetectionReportApi.getDetectionReportByRecordId(Number(recordId));
                            return unwrapApiData(report);
                        } catch (error) {
                            console.warn('加载检测报告详情失败', recordId, error);
                            return null;
                        }
                    })
                );
                const mappedList = detailResponses
                    .filter(Boolean)
                    .map((detail) => mapReportOption(detail));

                if (mappedList.length) {
                    linkedPlatformRecords.value = mappedList;
                    formData.platformRecordIds = mappedList.map((item) => item.linkId);
                    currentPlatformRecord.value = mappedList[0];
                } else {
                    formData.platformRecordIds = loadedDetectionRecordIds;
                }
            } catch (error) {
                console.error('加载关联检测记录失败', error);
            }
        }
    } catch (error) {
        console.error('加载详情失败', error);
    }
};

const entityOptions = ref([]);
/**\n * searchEntity：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const searchEntity = async (query) => {
    if (query !== '') {
        try {
            const data = await SubjectApi.getSubjectPage({ name: query, pageNo: 1, pageSize: 50 });
            entityOptions.value = data.list;
        } catch (error) {
            console.error('搜索主体失败', error);
        }
    } else {
        entityOptions.value = [];
    }
};

const productLoading = ref(false);
const productOptions = ref([]);

/**
 * 根据输入内容搜索产品档案：纯中文按产品名称查询，其他内容按产品编号查询。
 */
const searchProduct = async (query) => {
    if (query !== '') {
        productLoading.value = true;
        try {
            // 判断是否全部为中文
            const isAllChinese = /^[\u4e00-\u9fa5]+$/.test(query);
            const params = { pageNo: 1, pageSize: 50 };
            if (isAllChinese) {
                params.productName = query;
            } else {
                params.productCode = query;
            }
            const data = await ProductApi.getProductPage(params);
            productOptions.value = data.list;
        } finally {
            productLoading.value = false;
        }
    } else {
        productOptions.value = [];
    }
};

/**
 * 选择产品档案后回填产品及所属主体信息。
 * @param options.keepCurrentUnit 是否保留当前已选择的计量单位，用于编辑回填时避免被档案默认值覆盖
 */
const handleProductSelect = async (id, options = {}) => {
    if (!id) return;
    try {
        const data = await ProductApi.getProduct(id);
        formData.productNo = data.productCode || '';
        formData.productName = data.productName || '';
        formData.category = data.category || '';
        formData.origin = data.productionArea || '';
        formData.productImageUrl = data.productImageUrl || '';
        formData.productId = data.id;
        formData.batchSize = data.productSpec || '';
        if (!options.keepCurrentUnit) {
            formData.unit = data.productUnit || DEFAULT_AGRI_MEASUREMENT_UNIT;
        }
        // 转换时间戳为完整日期时间字符串
        if (data.createTime) {
            formData.createDate = formatDate(new Date(data.createTime));
        }

        // 自动带入主体信息
        if (data.subjectInfo) {
            const subject = data.subjectInfo;
            formData.subjectId = subject.id;
            formData.entity = subject.name;
            formData.legalPerson = subject.legalPerson || '';
            // 暂时回显城市代码，实际项目中可能需要通过 Code 转换
            formData.registeredCity = subject.cityCode || '青岛市';
            // 更新主体下拉列表选项，确保 select 显示
            entityOptions.value = [subject];
            formData.contactPhone = subject.contactPhone
        } else if (data.subjectId && data.subjectName) {
            formData.subjectId = data.subjectId;
            formData.entity = data.subjectName;
            entityOptions.value = [{ id: data.subjectId, name: data.subjectName }];
        }
    } catch (error) {
        console.error('获取产品档案失败', error);
    }
};

onMounted(async () => {
    console.log(certificateTypeOptions)
    certStore.setStep(1);
    if (id) {
        loadDetails();
    } else {
        const newSubjectId = route.query.newSubjectId;
        // 仅在“主体建档回跳”场景恢复第一步数据，普通新建不回填历史残留
        if (newSubjectId) {
            Object.assign(formData, certStore.productInfo);
            try {
                const subject = await SubjectApi.getSubject(newSubjectId);
                formData.subjectId = subject.id;
                formData.entity = subject.name;
                entityOptions.value = [subject];
            } catch (err) {
                console.error('获取新主体信息失败', err);
            }
        } else {
            certStore.resetAll();
        }
    }
});

/**\n * handleSubjectCreateSuccess：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSubjectCreateSuccess = async (newId) => {
    try {
        const subject = await SubjectApi.getSubject(newId);
        formData.subjectId = subject.id;
        formData.entity = subject.name;
        formData.legalPerson = subject.legalPerson || '';
        formData.registeredCity = subject.cityCode || '青岛市';
        formData.contactPhone = subject.contactPhone || '';
        entityOptions.value = [subject];
    } catch (err) {
        console.error('获取新主体信息失败', err);
    }
};

/**\n * handleAdd：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleAdd = () => formData.quantity++;
/**\n * handleSub：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSub = () => { if (formData.quantity > 0) formData.quantity-- };

/**\n * goToStep：控制当前页面的步骤流转或路由跳转，并保留调用方传入的必要上下文。\n */
const goToStep = (step) => {
    certStore.setStep(step);
};

/**\n * isEmptyValue：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const isEmptyValue = (value) => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    return String(value).trim() === '';
};

/**
 * 校验第一步产品、批次和承诺主体的最小建档集。
 * 采用顺序校验并只提示首个缺失字段，避免同时弹出多条提示；第二步及接口层仍保留各自的
 * 校验职责，防止通过浏览器调试跳步时生成字段不完整的合格证。
 */
const validateStep1Required = () => {
    const requiredFields = [
        { key: 'productNo', label: '产品编号' },
        { key: 'productName', label: '产品名称' },
        { key: 'category', label: '产品类别' },
        { key: 'origin', label: '产品产地' },
        { key: 'batchSize', label: '批次规模' },
        { key: 'createDate', label: '建档日期' },
        { key: 'subjectId', label: '生产经营企业（主体）' }
    ];

    for (const item of requiredFields) {
        if (isEmptyValue(formData[item.key])) {
            message.warning(`请先填写必填项：${item.label}`);
            return false;
        }
    }
    return true;
};

/**\n * goNextToStep2：控制当前页面的步骤流转或路由跳转，并保留调用方传入的必要上下文。\n */
const goNextToStep2 = () => {
    if (!validateStep1Required()) {
        return;
    }
    certStore.updateProductInfo(pickStep1Data());
    goToStep(2);
};

// 提交数据
const uploadImgsRef = ref(null);
/**\n * handleTriggerUpload：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleTriggerUpload = () => {
    if (!uploadImgsRef.value) return;
    // 获取根元素的 DOM，向上查找 .el-upload__input
    const el = uploadImgsRef.value?.$el;
    const input = el?.querySelector('.el-upload__input');
    if (input) {
        input.click();
    }
};

watch(() => formData.thirdPartyType, (type) => {
    if (type !== 'platform') {
        formData.platformRecordId = undefined;
        formData.platformRecordIds = [];
        linkedPlatformRecords.value = [];
        currentPlatformRecord.value = null;
    }
});


// 统一同步承诺依据到 basis 数组（供其他逻辑使用）
watch([() => formData.p1, () => formData.p2, () => formData.p3], () => {
    const basis = [];
    if (formData.p1) basis.push(1);
    if (formData.p2) basis.push(2);
    if (formData.p3) basis.push(3);
    formData.basis = basis;
}, { immediate: true });

/**
 * 保存当前证书草稿。
 * 草稿同时保存主体草稿、产品草稿、承诺依据、检测记录和上游证书关联，确保重新进入时可恢复两个步骤。
 * @param isSilent 是否静默保存；路由离开时使用静默模式，避免额外成功提示
 * @returns 保存成功返回 true；失败时继续抛出异常供路由离开逻辑记录，调用方不得假设草稿已落库
 */
const handleSaveDraft = async (isSilent = false) => {
    const draftData = {
        id: id ? Number(id) : undefined,
        productId: formData.productId,
        subjectId: formData.subjectId,
        autoCreateSubject: formData.linkProfile === 'no',
        autoCreateProduct: formData.linkProfile === 'no',
        certificateType: formData.issueType,
        productionDate: formData.createDate ? new Date(formData.createDate).toISOString().split('T')[0] : '',
        batchNo: formData.batchSize, // 同 handleGenerate 逻辑，批次规模存 batchNo
        quantity: formData.quantity,
        unit: formData.unit,
        commitmentContent: formData.commitmentContent,
        commitmentBasis: JSON.stringify(formData.basis || []),
        detectionRecordId: normalizeDetectionRecordIds(formData.platformRecordIds),
        subjectDraft: {
            name: formData.entity,
            contactPhone: formData.contactPhone,
            legalPerson: formData.legalPerson,
            address: formData.origin
        },
        productDraft: {
            productCode: formData.productNo, // 产品编号存此处
            productName: formData.productName,
            category: formData.category,
            productionArea: formData.origin,
            productUnit: formData.unit,
            productImageUrl: formData.productImageUrl
        },
        upstreamCertificateImageUrl: formData.upstreamCertificateImageUrl
    };

    try {
        await CertificateApi.saveDraft(draftData);
        if (!isSilent) {
            message.success('已保存至草稿');
        }
        return true;
    } catch (e) {
        if (!isSilent) {
            message.error('保存草稿失败');
        }
        throw e;
    }
};

/**
 * 校验第二步并生成合格证。
 * 未关联产品档案时先创建产品，产品创建失败会中断流程，避免证书引用无效产品；随后组装承诺依据、
 * 上游证书、第三方报告和平台检测记录等关联字段。创建成功后必须二次查询详情，原因是证书编号、二维码、
 * createTime 等由服务端生成，第三步预览和热敏打印不能使用前端草稿值替代。
 * 创建接口失败会标记 submissionFailed，路由离开钩子据此不会把失败数据误保存为可用草稿。
 */
const handleGenerate = async () => {
    submissionFailed.value = false;
    if (submitLoading.value) return;

    if (formRef2.value) {
        try {
            await formRef2.value.validate();
        } catch (err) {
            message.warning('请补全必填信息');
            return;
        }
    }

    submitLoading.value = true;
    try {
        // 确保以当前编辑区域的 basis 数组为准进行提交，并过滤掉 null 或无效值
        const mappedBasis = formData.basis.map(v => Number(v));
        const linkedPlatformRecordIds = normalizeDetectionRecordIds(formData.platformRecordIds);

        // if (formData.thirdPartyType === 'platform' && linkedPlatformRecordIds.length === 0) {
        //     message.warning('请先在本平台检测结果中关联至少一个样品');
        //     return;
        // }

        let currentProductId = formData.productId;

        if (formData.linkProfile === 'no') {
            const productData = {
                productCode: formData.productNo,
                productName: formData.productName,
                category: formData.category,
                productionArea: formData.origin,
                subjectId: formData.subjectId || 1, // 使用正确的主体ID，回退1
                productImageUrl: formData.productImageUrl || '',
            };
            try {
                currentProductId = await ProductApi.createProduct(productData);
                formData.productId = currentProductId;
            } catch (err) {
                console.error('创建产品失败', err);
                message.error('创建产品档案失败，无法继续生成合格证');
                return;
            }
        }

        const submitData = {
            certificateType: formData.issueType,
            productId: currentProductId,
            quantity: Number(formData.quantity) || 0,
            unit: formData.unit || DEFAULT_AGRI_MEASUREMENT_UNIT,
            commitmentContent: Array.isArray(computedCommitment.value) ? computedCommitment.value.join('\n') : (computedCommitment.value || ''), // 提交动态生成的内容，使用换行符连接
            commitmentBasis: JSON.stringify(mappedBasis),
            productionDate: formData.createDate ? new Date(formData.createDate).toISOString().split('T')[0] : '',
            batchNo: formData.batchSize || undefined,
            productImageUrl: formData.productImageUrl || undefined,
            upstreamCertificateSource: formData.linkUpstream === 'yes' ? formData.upstreamCertificateSource : undefined,
            upstreamCertificateId: (formData.linkUpstream === 'yes' && formData.upstreamCertificateSource === 1) ? formData.upstreamId : undefined,
            upstreamCertificateCode: (formData.linkUpstream === 'yes' && formData.upstreamCertificateSource === 1) ? formData.upstreamCertNo : undefined,
            upstreamCertificateImageUrl: (formData.linkUpstream === 'yes' && formData.upstreamCertificateSource === 2) ? formData.upstreamCertificateImageUrl : undefined,
            thirdPartyReportUrl: formData.thirdPartyType === 'third' ? (Array.isArray(formData.thirdPartyReportUrls) ? formData.thirdPartyReportUrls.filter(Boolean).join(',') : formData.thirdPartyReportUrls) : undefined,
            detectionRecordId: formData.thirdPartyType === 'platform' ? linkedPlatformRecordIds : undefined
        };


        const newId = await CertificateApi.createCertificate(submitData);
        formData.id = newId;
        message.success('创建成功');

        // 根据创建得到的 id 二次查询合格证详情，用于第三步详情回显
        try {
            const detail = await CertificateApi.getCertificate(newId);
            finalCertificateDetail.value = detail;
        } catch (err) {
            console.error('二次查询合格证详情失败:', err);
            finalCertificateDetail.value = null;
        }

        certStore.updateIssueInfo(formData);
        certStore.generateCertificate();
        isSubmitted.value = true;
        goToStep(3);
    } catch (error) {
        submissionFailed.value = true;
        console.error('保存失败', error);
    } finally {
        submitLoading.value = false;
    }
};

/**\n * handleCancel：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCancel = () => {
    certStore.resetAll();
    router.push('/certificate/issue');
};

/**\n * handleDownload：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDownload = async () => {
    const area = printAreaRef.value;
    if (!area) {
        message.warning('预览区域未加载');
        return;
    }
    try {
        const dataUrl = await captureAreaToImg();
        if (!dataUrl) {
            message.warning('预览区域未加载');
            return;
        }
        const link = document.createElement('a');
        link.download = `合格证_${displayCertNo.value || Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        message.success('已启动下载');
    } catch (e) {
        console.error('下载失败', e);
        message.error('下载导出失败，请重试');
    }
};

/**\n * handleBack：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleBack = () => {
    certStore.resetAll();
    router.push('/certificate/issue');
};

const printAreaRef = ref(null);
const previewVisible = ref(false);
const previewSrc = ref(null);
const printEffectPreviewSrc = ref(null);
const preparedPrintBytes = ref(null);
const captureLoading = ref(false);
const printEffectLoading = ref(false);
const bluetoothConnecting = ref(false);
const bluetoothPrinting = ref(false);
const bluetoothReady = ref(false);
const printerName = ref('未连接设备');
const autoReconnectTimer = ref(null);
const keepAliveTimer = ref(null);

const basisOptions = [
    { indexLabel: '(1)', label: '质量安全控制符合要求', value: 1 },
    { indexLabel: '(2)', label: '自行检测合格', value: 2 },
    { indexLabel: '(3)', label: '委托检测合格', value: 3 }
];

/**\n * formatPrintDate：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatPrintDate = (value) => {
    if (!value) return '--';
    const result = formatDate(new Date(value), 'YYYY-MM-DD');
    return result === 'Invalid Date' ? String(value).slice(0, 10) || '--' : result;
};

const bluetoothPrinter = new BluetoothPrinter({
    namePrefix: PRINTER_NAME_PREFIX,
    serviceUUIDs: PRINTER_SERVICE_UUIDS,
    characteristicUUIDs: PRINTER_CHARACTERISTIC_UUIDS,
    packetSize: 180,
    writeDelayMs: 8,
    preferWriteWithResponse: false,
    onStatusChange: (ready, name) => {
        bluetoothReady.value = ready;
        printerName.value = ready ? name : '未连接设备';
    }
});

/**\n * connectBluetoothPrinter：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const connectBluetoothPrinter = async () => {
    bluetoothConnecting.value = true;
    try {
        const name = await bluetoothPrinter.connect();
        message.success(`已连接蓝牙打印机：${name}`);
    } catch (error) {
        if (error?.name !== 'NotFoundError') {
            message.error(`蓝牙连接失败：${error?.message || '请重试'}`);
        }
    } finally {
        bluetoothConnecting.value = false;
    }
};

/** 定时探测已连接打印机，避免长时间停留在预览页后蓝牙连接失效。 */
const startBluetoothKeepAlive = () => {
    if (keepAliveTimer.value) return;
    keepAliveTimer.value = window.setInterval(async () => {
        if (!bluetoothReady.value) return;
        try {
            await bluetoothPrinter.ping();
        } catch (error) {
            console.warn('bluetooth keepAlive failed', error);
        }
    }, 12000);
};

/**\n * pauseBluetoothKeepAlive：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const pauseBluetoothKeepAlive = () => {
    if (!keepAliveTimer.value) return;
    clearInterval(keepAliveTimer.value);
    keepAliveTimer.value = null;
};

/** 周期性尝试重连浏览器曾授权的打印机；连接中或已就绪时跳过本轮。 */
const startAutoReconnect = () => {
    if (autoReconnectTimer.value) return;
    autoReconnectTimer.value = window.setInterval(async () => {
        if (bluetoothReady.value || bluetoothConnecting.value) return;
        try {
            const name = await bluetoothPrinter.reconnectLastDevice();
            if (name) {
                message.success(`蓝牙已自动重连：${name}`);
            }
        } catch (error) {
            // 忽略失败，定时器下一轮继续重连
        }
    }, 6000);
};

/**\n * stopBluetoothTimers：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const stopBluetoothTimers = () => {
    pauseBluetoothKeepAlive();
    if (autoReconnectTimer.value) {
        clearInterval(autoReconnectTimer.value);
        autoReconnectTimer.value = null;
    }
};

onMounted(async () => {
    startBluetoothKeepAlive();
    startAutoReconnect();
    try {
        await bluetoothPrinter.reconnectLastDevice();
    } catch (error) {
        // 初次进入可能尚未授权设备，忽略
    }
});

onUnmounted(() => {
    stopBluetoothTimers();
});

/**\n * captureAreaToImg：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const captureAreaToImg = async () => {
    await nextTick();
    return captureCertificatePrintArea(printAreaRef.value);
};

/**
 * 截取证书打印区域并预生成打印机位图数据。
 * 预览阶段缓存打印字节，正式打印时可直接发送，减少重复图像转换等待。
 */
const handlePreview = async () => {
    captureLoading.value = true;
    printEffectLoading.value = true;
    previewVisible.value = true;
    previewSrc.value = null;
    printEffectPreviewSrc.value = null;
    preparedPrintBytes.value = null;

    // 让弹窗及 loading UI 先呈现出来再进行阻断式渲染
    await nextTick();
    // 延迟少许给浏览器足够时间渲染弹窗动画
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        const img = await captureAreaToImg();
        previewSrc.value = img;
        if (img) {
            const payload = await bluetoothPrinter.buildPrintImagePayload(img, certificatePrintImageOptions);
            printEffectPreviewSrc.value = payload.previewDataUrl;
            preparedPrintBytes.value = payload.bytes;
        }
    } catch (e) {
        console.error('preview failed', e);
        message.error('预览生成失败');
    } finally {
        captureLoading.value = false;
        printEffectLoading.value = false;
    }
};

/**
 * 向已连接的蓝牙打印机发送证书位图。
 * 打印期间暂停保活写入，防止心跳指令与大批量打印数据竞争特征通道。
 */
const handlePrint = async (prepared) => {
    const dataUrl = typeof prepared === 'string' ? prepared : await captureAreaToImg();
    if (!dataUrl) {
        message.error('生成打印内容失败');
        return;
    }
    if (!bluetoothReady.value) {
        message.warning('请先连接便携式蓝牙打印机');
        return;
    }
    bluetoothPrinting.value = true;
    pauseBluetoothKeepAlive();
    try {
        if (!preparedPrintBytes.value) {
            const payload = await bluetoothPrinter.buildPrintImagePayload(dataUrl, certificatePrintImageOptions);
            preparedPrintBytes.value = payload.bytes;
            if (!printEffectPreviewSrc.value) {
                printEffectPreviewSrc.value = payload.previewDataUrl;
            }
        }
        await bluetoothPrinter.print(preparedPrintBytes.value);
        message.success('蓝牙打印指令已发送');
    } catch (e) {
        console.error('print failed', e);
        message.error(`蓝牙打印失败：${e?.message || '请稍后重试'}`);
    } finally {
        bluetoothPrinting.value = false;
        if (bluetoothReady.value) {
            startBluetoothKeepAlive();
        }
    }
};
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;
}

.header-section {
    padding: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding-right: 0;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.title-line {
    width: 4px;
    height: 16px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.desc-box {
    font-size: 14px;
    color: #666;
}

.content-card {
    width: 100%;
    margin: 0 auto;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: var(--page-container-padding);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
    overflow-y: scroll;
}

/* 指南步骤样式（替换原有的 SaaS 导航） */
.guide-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    margin-bottom: 24px;
    padding: 8px 24px 24px;
    border-bottom: 1px dashed #E5E7EB;
    overflow-x: auto;

    &::-webkit-scrollbar {
        width: 0;
    }

    .step-container {
        display: flex;
        align-items: center;
        gap: 40px;
    }

    .step-wrapper {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        flex-shrink: 0;
        transition: all 0.3s;

        &.waiting {
            .step-icon {
                border-color: #E2E8F0;
                color: #94A3B8;
            }

            .step-title {
                color: #475569;
            }

            .step-desc {
                color: #94A3B8;
            }
        }

        &.active {
            .step-icon {
                border-color: #00B3ED;
                // background: #00B3ED;
                color: #00B3ED;
            }

            .step-title {
                color: #00B3ED;
                font-weight: 600;
            }

            .step-desc {
                color: #00B3ED;
            }
        }

        &.completed {
            .step-icon {
                border-color: #00B3ED;
                background: #00B3ED;
                color: #fff;
                opacity: 0.6;
            }

            .step-title {
                color: #1E293B;
            }

            .step-desc {
                color: #00B3ED;
            }
        }
    }

    .step-icon {
        width: 38px;
        height: 38px;
        border: 2px solid #71D1F5;
        background: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #71D1F5;
        font-weight: 600;
        margin-top: 2px;
        transition: all 0.3s;
    }

    .step-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .step-title {
        font-size: 14px;
        line-height: 18px;
        color: #00B3ED;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.3s;
        margin-top: 4px;
    }

    .step-desc {
        font-size: 12px;
        color: #999;
        line-height: 16px;
        white-space: nowrap;
        transition: all 0.3s;
    }

    .step-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        margin-top: 12px;
        align-self: flex-start;

        .arrow-svg {
            width: 24px;
            height: 24px;
            color: #ccc;
        }
    }
}

/* 表单结构 */
.form-section {
    margin-bottom: 16px;

    .subject-detail-card {
        margin-top: 16px;
        background: #F8FAFD;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 24px;

        .card-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;

            .title-left {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .title-icon {
                color: #00B3ED;
                font-size: 20px;
            }

            .info-actions {
                display: flex;
                gap: 12px;
            }
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px 20px;

            .grid-item {
                &.full-row {
                    grid-column: span 3;
                }

                .field-label {
                    font-size: 13px;
                    color: #64748B;
                    margin-bottom: 8px;
                }

                .field-value {
                    font-size: 16px;
                    color: #1e293b;
                    font-weight: 500;
                }

                .category-tag {
                    display: inline-block;
                    padding: 2px 10px;
                    background: #fff;
                    border: 1px solid #00B3ED;
                    color: #00B3ED;
                    border-radius: 4px;
                    font-size: 12px;
                    line-height: 1.4;
                }
            }
        }
    }

    .entity-info-card-empty {
        margin-top: 12px;
        padding: 16px;
        background: #F9FAFB;
        border: 1px dashed #D1D5DB;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .empty-tip {
            font-size: 13px;
            color: #64748B;
        }
    }

    .preview-title,
    .section-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin-top: 0;
        margin-bottom: 16px;
    }

    .section-tip {
        font-size: 12px;
        color: #999;
        margin-bottom: 16px;
    }

    &.no-margin {
        margin-bottom: 0;
    }
}

.required-mark {
    color: #F56C6C;
    margin-right: 2px;
}

.form-row {
    display: flex;
    gap: 24px;
    margin-bottom: 20px;

    &.two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
    }
}

/* 产品图片上传区域微调 */
.image-upload-wrapper {
    background: #fdfdfd;
    border-radius: 8px;
    overflow: hidden;
    display: inline-block;
}

.form-col {
    flex: 1;

    &.full {
        flex: 1;
        width: 100%;
    }

    &.half {
        width: 50%;
        max-width: 400px;
    }
}

.batch-input {
    display: flex;
    gap: 12px;
    align-items: center;
}

.full-width {
    width: 100%;
}

.mt16 {
    margin-top: 16px;
}

.divider {
    height: 1px;
    border-bottom: 1px dashed #D1D5DB;
    margin: 32px 0;

    &.compact {
        margin: 32px 0;
    }
}

.search-input {
    width: 100% !important;
}

.archive-relation-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    .relation-label {
        font-size: 14px;
        color: #606266;
        font-weight: 700;
        flex-shrink: 0;
    }

    .relation-radio {
        margin-right: 8px;
        flex-shrink: 0;
        margin-bottom: 0 !important;
        display: inline-flex;
        align-items: center;
    }

    .relation-search {
        flex: 1;
    }
}

.search-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 16px;
}

.section-header-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

/* 基本信息预览 */
.basic-info-preview {
    margin: 32px 0 12px 0;

    .preview-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
        margin-top: 0;
        margin-bottom: 16px;
        margin-top: 3px;
    }

    .info-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0;
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
            padding: 12px 16px;
            background: #F9FAFB;
            font-size: 14px;
            color: #666;
            border-right: 1px solid #E5E7EB;
        }

        .value {
            flex: 1;
            padding: 12px 16px;
            font-size: 14px;
            color: #333;
        }
    }

    .info-tip {
        font-size: 12px;
        color: #999;
        margin-top: 12px;
    }
}

/* 产品图片上传 */
.image-upload-area {
    width: 150px;
    height: 150px;
    background: #F9FAFB;
    border: 2px dashed #D1D5DB;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }
}

/* 实体选择器 */
.entity-selector {
    .entity-info-card {
        margin-top: 12px;
        padding: 16px;
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        border-radius: 8px;

        .info-line {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
        }

        .info-actions {
            display: flex;
            gap: 12px;
            margin-top: 12px;
        }
    }
}

/* 步骤二样式 */
.top-configs {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    margin-bottom: 32px;
}

.quantity-input {
    display: flex;
    align-items: center;
    gap: 16px;

    .unit-select {
        width: 140px;

        :deep(.el-input__wrapper) {
            height: 48px;
            font-size: 15px;
        }
    }
}

.stepper {
    display: flex;
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    overflow: hidden;

    .step-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: #F3F4F6;
        cursor: pointer;
        font-size: 20px;
        transition: all 0.2s;

        &:hover {
            background: #E5E7EB;
        }
    }

    .step-btn.yellow {
        background: #00B3ED;
        color: #fff;

        &:hover {
            background: #00B3ED;
            color: #fff;
        }
    }

    .step-val {
        width: 120px;
        text-align: center;
        height: 40px;
        background: #fff;
        font-size: 18px;
        font-weight: normal;
        color: #333;
        border: none;
        outline: none;
        box-sizing: border-box;
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
}

.association-grid {
    display: flex;
    gap: 24px;
    margin-bottom: 32px;
}

.assoc-col {
    flex: 1;

    .col-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
    }

    .col-content-box {
        background: #f4f8fb;
        padding: 20px;
        border-radius: 8px;
        min-height: 400px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
}

.results-preview {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

    .preview-title {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 16px;
        border-left: 4px solid #00B3ED;
        padding-left: 10px;
        color: #333;
    }
}

.upload-wrapper-box {
    background: #fff;
    border: 2px dashed #E2E8F0;
    border-radius: 12px;
    padding: 0;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        border-color: #00B3ED;
        background: #F0F9FF;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 179, 237, 0.08);
    }

    .upload-trigger-inner {
        width: 100%;
        height: 100%;
        padding: 40px;
        cursor: pointer;
        position: relative;
    }

    .hidden-upload {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        z-index: 10;
        cursor: pointer;
        pointer-events: auto;

        :deep(.el-upload) {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none !important;
        }

        :deep(.el-upload-dragger) {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        :deep(.el-upload-list) {
            display: none !important;
        }
    }

    .trigger-content {
        pointer-events: none;

        .upload-big-icon {
            font-size: 48px;
            color: #94A3B8;
            margin-bottom: 12px;
            transition: all 0.3s;

            &.primary {
                color: #00B3ED;
            }
        }

        .upload-tip-text {
            font-size: 15px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 6px;
        }

        .upload-sub-tip {
            font-size: 12px;
            color: #94A3B8;
        }
    }

    &:hover .upload-big-icon {
        color: #00B3ED;
        transform: scale(1.1);
    }
}

.results-preview-list {
    margin-top: 24px;

    .preview-title {
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 16px;
        color: #333;
    }

    .image-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, 300px);
        gap: 20px;
    }

    .preview-box {
        width: 300px;
        height: 420px;
        background: #fff;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

        &.empty {
            background: #F8FAFC;
            border-style: dashed;
        }

        .preview-img {
            width: 100%;
            height: 100%;
            cursor: zoom-in;

            :deep(img) {
                object-fit: contain !important;
                background: #fff;
            }
        }

        .preview-placeholder {
            font-size: 40px;
            color: #CBD5E1;
        }

        .pdf-file-preview {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #F8FAFC;
            cursor: pointer;
            transition: all 0.3s;

            .el-icon {
                font-size: 48px;
                color: #94A3B8;
                margin-bottom: 8px;
            }

            .file-label {
                font-size: 14px;
                color: #64748B;
                font-weight: 600;
            }

            &:hover {
                background: #F0F9FF;

                .el-icon {
                    color: #00B3ED;
                }

                .file-label {
                    color: #00B3ED;
                }
            }
        }
    }
}


.step-three-print-source {
    width: 470px;
    max-width: 100%;
    margin: 0 auto;
    background: #fff;
}

.cert-middle-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    text-align: left;
    margin: 32px 0;
}

.qr-code-wrapper {
    width: 120px;
    height: 120px;

    img {
        width: 100%;
    }
}

.info-table {
    border: 1px solid #EDEDED;
    text-align: left;

    .info-row {
        display: flex;
        border-bottom: 1px solid #EDEDED;

        &:last-child {
            border-bottom: none;
        }

        .label {
            width: 140px;
            background: #F9FAFB;
            padding: 12px;
            font-weight: 600;
            border-right: 1px solid #EDEDED;
        }

        .value {
            flex: 1;
            padding: 12px;
        }
    }
}

.image-placeholder {
    width: 100%;
    height: 200px;
    background: #F3F4F6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    .placeholder-icon {
        font-size: 48px;
        color: #D1D5DB;
    }
}

/* 通用底部按钮 */
.form-footer,
.page-footer,
.action-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
}

/* 统一主题按钮样式集 */
.theme-primary-btn {
    background-color: #00B3ED !important;
    border: none !important;
    color: #fff !important;
    font-weight: 500 !important;
    border-radius: 6px !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    height: 40px !important;
    padding: 0 24px !important;

    &:hover {
        background-color: #00A3D9 !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 179, 237, 0.2);
    }

    &:active {
        transform: translateY(0);
    }

    &.mini-btn {
        padding: 0 16px !important;
        font-size: 13px !important;
    }

    &.is-disabled {
        background-color: #A0D9F6 !important;
        cursor: not-allowed !important;
        transform: none !important;
        box-shadow: none !important;
    }
}

.theme-default-btn {
    background-color: #fff !important;
    border: 1px solid #D1D5DB !important;
    color: #4B5563 !important;
    font-weight: 500 !important;
    border-radius: 6px !important;
    transition: all 0.2s !important;
    height: 40px !important;
    padding: 0 24px !important;

    &:hover {
        background-color: #F9FAFB !important;
        border-color: #00B3ED !important;
        color: #00B3ED !important;
    }
}

/* 连接蓝牙专用按钮 (带状态色) */
.bluetooth-btn {
    border: 1px solid #00B3ED !important;
    color: #00B3ED !important;
    background: #F0F9FF !important;
    border-radius: 6px !important;
    height: 40px !important;

    &.is-plain:hover {
        background: #E0F2FE !important;
    }
}

/* 复选框组样式 */
:deep(.el-checkbox) {
    margin-right: 20px;

    .el-checkbox__label {
        font-weight: 500;
        color: #333;
    }
}

/* 表单项样式优化 */
:deep(.el-form-item) {
    .el-form-item__label {
        font-weight: 600;
        color: #333;
    }
}

:deep(.el-input__wrapper) {
    border-radius: 8px;
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
        border-radius: 8px;
    }
}

/* 上传按钮样式 */
.upload-btn {
    border: none;
    color: #fff;
    border-radius: 8px;
}

/* 图片预览占位符 */
.image-preview-placeholder {
    flex: 1;
    background: #fff;
    border: 2px dashed #D1D5DB;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    .placeholder-icon {
        font-size: 48px;
        color: #D1D5DB;
    }
}

/* 关联按钮 */
.link-btn {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 6px;
}

/* 嵌套表格样式 */
.nested-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;

    th,
    td {
        padding: 10px 12px;
        text-align: left;
        border: 1px solid #E5E7EB;
        font-size: 13px;
    }

    th {
        background: #F9FAFB;
        font-weight: 600;
    }
}

.kv-grid {
    .kv-row {
        display: flex;
        margin-bottom: 8px;
        font-size: 13px;

        .label {
            color: #666;
            width: 80px;
        }

        .val {
            color: #333;
            font-weight: 500;
        }
    }
}

/* 第三步按钮样式 */
.btn-close {
    border-color: #D1D5DB;
    color: #666;
    border-radius: 6px;

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }
}

.btn-select {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 6px;
}

.image-upload-wrapper {
    margin-top: 12px;
}

.image-preview-box {
    width: 120px;
    height: 120px;
    background: #F9FAFB;
    border: 1px dashed #D1D5DB;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    margin-top: 8px;

    .cert-product-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .placeholder-icon {
        color: #9CA3AF;
        font-size: 32px;
    }
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

.preview-section-title {
    margin: 12px 0 8px;
    font-size: 13px;
    color: #666;
}

.print-effect-wrapper {
    min-height: 140px;
    margin-top: 4px;
    background: #fff;
    border: 1px dashed #D1D5DB;
}

.print-effect-img {
    image-rendering: pixelated;
}

.other-platform-area {
    margin-top: 16px;

    .upload-trigger-wrap {
        margin-bottom: 16px;
    }

    .upstream-preview-card {
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        overflow: hidden;
        background: #fff;

        .preview-title {
            background: #F8FAFC;
            padding: 12px 16px;
            font-weight: 600;
            color: #334155;
            border-bottom: 1px solid #E2E8F0;
            font-size: 14px;
        }

        .preview-body {
            display: flex;
            padding: 16px;
            gap: 20px;
        }

        .info-table-side {
            flex: 1;
            display: flex;
            flex-direction: column;

            .info-row {
                display: flex;
                border-bottom: 1px solid #F1F5F9;
                font-size: 13px;
                line-height: 1.5;

                &:last-child {
                    border-bottom: none;
                }

                .info-label {
                    width: 100px;
                    padding: 8px 12px;
                    background: #F8FAFC;
                    color: #64748B;
                    flex-shrink: 0;
                }

                .info-val {
                    flex: 1;
                    padding: 8px 12px;
                    color: #1E293B;
                    word-break: break-all;
                }

                &.required {
                    .info-label::before {
                        content: '*';
                        color: #EF4444;
                        margin-right: 4px;
                    }
                }
            }
        }

        .image-box-side {
            width: 200px;
            height: 280px;
            background: #F8FAFC;
            border: 1px dashed #E2E8F0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;

            &.only-img {
                width: 100%;
                height: 400px;
                border-style: solid;
                border-color: #F1F5F9;
            }

            .preview-img {
                width: 100%;
                height: 100%;
                cursor: pointer;
            }

            .img-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                color: #94A3B8;
                font-size: 12px;
            }
        }
    }

}

.upstream-platform-preview {
    width: 407px;
    max-width: 100%;
    margin-top: 16px;
}

.linked-cert-card {
    overflow: hidden;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    box-shadow: none;
}

.linked-cert-code {
    height: 32px;
    display: flex;
    align-items: center;
    padding: 0 13px;
    background: #EAF6FF;
    color: #111827;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 8px;
}

.linked-cert-body {
    padding: 0 17px 12px;
    color: #111827;
}

.linked-cert-title {
    margin-top: 0;
    text-align: center;
    font-size: 15px;
    font-weight: 800;
    line-height: 22px;
}

.linked-cert-subtitle {
    margin-top: 0;
    font-size: 13px;
    font-weight: 800;
    line-height: 20px;
}

.linked-cert-desc {
    margin-top: 0;
    font-size: 12px;
    line-height: 19px;
}

.linked-cert-main {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 4px;
}

.linked-cert-left {
    flex: 1;
    min-width: 0;
}

.linked-cert-basis-title {
    margin-bottom: 3px;
    font-size: 13px;
    font-weight: 800;
    line-height: 19px;
}

.linked-cert-basis-list {
    width: 184px;
    max-width: 100%;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
}

.linked-cert-basis-item {
    display: flex;
    align-items: center;
    min-height: 18px;
    gap: 4px;
    font-size: 12px;
    line-height: 18px;
}

.basis-check {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #3478FF;
    color: #1677FF;
    font-size: 10px;
    font-weight: 800;
    line-height: 1;

    &.checked {
        border-color: #1677FF;
        background: #EAF3FF;
    }
}

.linked-cert-qr {
    width: 104px;
    min-height: 88px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    margin-left: auto;
    margin-right: 0;
}

.linked-cert-divider {
    margin: 9px 0 10px;
    border-top: 1px dashed #D7DCE3;
}

.linked-info-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 800;
    line-height: 19px;
}

.linked-info-table {
    border: 1px solid #E5E7EB;
}

.linked-info-row {
    display: grid;
    grid-template-columns: 116px minmax(0, 1fr);
    min-height: 29px;

    &:nth-child(odd) {
        background: #F2F2F2;
    }
}

.linked-info-label,
.linked-info-value {
    display: flex;
    align-items: center;
    padding: 6px 24px;
    font-size: 12px;
    line-height: 17px;
}

.linked-info-label {
    color: #111827;
    font-weight: 700;
    white-space: nowrap;
}

.linked-info-value {
    min-width: 0;
    color: #374151;
    word-break: break-all;
}

.linked-cert-footer {
    margin-top: 14px;
    color: #6B7280;
    font-size: 12px;
    line-height: 18px;
}
</style>
