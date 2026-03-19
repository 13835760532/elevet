<template>
    <div class="page-container">

        <pageHeader title="合格证开具（生产者/收购者）" desc="填写产品档案，关联上游合格证，关联检测信息开具合格证" />

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
                        <h3 class="section-title">产品档案信息</h3>

                        <div class="form-row">
                            <el-form-item label="是否关联农产品档案" class="form-col full">
                                <el-radio-group v-model="formData.linkProfile">
                                    <el-radio label="no">否</el-radio>
                                    <el-radio label="yes">是</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>

                        <div v-if="formData.linkProfile === 'yes'" class="form-row">
                            <el-form-item class="form-col full">
                                <el-select v-model="formData.searchProfile" filterable remote reserve-keyword
                                    placeholder="查询产品名称 or 编号，完成产品档案管理" class="search-input" style="width: 100%"
                                    :remote-method="searchProduct" :loading="productLoading"
                                    @change="handleProductSelect">
                                    <template #prefix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                    <el-option v-for="item in productOptions" :key="item.id"
                                        :label="`${item.productName} (${item.productCode})`" :value="item.id" />
                                </el-select>
                            </el-form-item>
                        </div>

                        <div class="divider"></div>

                        <!-- 两列布局：产品编号 + 产品名称 -->
                        <div class="form-row two-cols">
                            <el-form-item label="*产品编号" class="form-col">
                                <el-input v-model="formData.productNo" placeholder="DP20251238000001"
                                    :disabled="formData.linkProfile === 'yes'" />
                            </el-form-item>
                            <el-form-item label="产品名称" class="form-col">
                                <el-input v-model="formData.productName" placeholder="输入产品名称"
                                    :disabled="formData.linkProfile === 'yes'" />
                            </el-form-item>
                        </div>

                        <!-- 两列布局：产品类别 + 产品产地 -->
                        <div class="form-row two-cols">
                            <el-form-item label="产品类别" class="form-col">
                                <el-select v-model="formData.category" placeholder="选择产品类别" class="full-width"
                                    :disabled="formData.linkProfile === 'yes'">
                                    <el-option label="蔬菜" value="vegetable" />
                                    <el-option label="水果" value="fruit" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="产品产地" class="form-col">
                                <el-input v-model="formData.origin" placeholder="输入产品的生产地"
                                    :disabled="formData.linkProfile === 'yes'" />
                            </el-form-item>
                        </div>

                        <!-- 两列布局：批次规模 + 建档日期 -->
                        <div class="form-row two-cols">
                            <el-form-item label="批次规模" class="form-col">
                                <div class="batch-input">
                                    <el-input v-model="formData.batchSize" placeholder="输入产品数量" style="flex: 1;"
                                        :disabled="formData.linkProfile === 'yes'" />
                                    <el-select v-model="formData.unit" placeholder="单位" style="width: 100px;"
                                        :disabled="formData.linkProfile === 'yes'">
                                        <el-option label="吨" value="t" />
                                        <el-option label="千克" value="kg" />
                                    </el-select>
                                </div>
                            </el-form-item>
                            <el-form-item label="建档日期" class="form-col">
                                <el-date-picker v-model="formData.createDate" type="date" placeholder="2025-12-19"
                                    class="full-width" :disabled="formData.linkProfile === 'yes'" />
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 生产经营企业 -->
                    <div class="form-section">
                        <h3 class="section-title">生产经营企业（主体名称）</h3>
                        <p class="section-tip">*从生产档案中选择，或直接搜索到企业，支持多项建档</p>

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
                            <div class="entity-info-card">
                                <div class="info-line">主体名称: {{ formData.entity || '-' }}</div>
                                <div class="info-line">注册城市: {{ formData.registeredCity || '-' }}</div>
                                <div class="info-line">法人: {{ formData.legalPerson || '-' }}</div>
                                <div class="info-actions">
                                    <el-button class="btn-close">关闭</el-button>
                                    <el-button type="primary" class="btn-select"
                                        @click="showSubjectDrawer = true">主体建档</el-button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 主体建档侧滑 -->
                    <SubjectFormDrawer v-model="showSubjectDrawer" @success="handleSubjectCreateSuccess" />

                    <div class="divider"></div>

                    <!-- 关联上游合格证 -->
                    <div class="form-section">
                        <div class="section-header-row">
                            <h3 class="section-title no-margin">关联上游合格证</h3>
                            <el-radio-group v-model="formData.linkUpstream" style="margin-top: -14px;">
                                <el-radio label="yes">是</el-radio>
                                <el-radio label="no">否</el-radio>
                            </el-radio-group>
                        </div>
                        <template v-if="formData.linkUpstream === 'yes'">

                            <el-form-item class="mt16">
                                <el-select v-model="formData.upstreamType" placeholder="农产品上游合格证为本平台开具"
                                    class="full-width">
                                    <el-option label="本平台开具" value="platform" />
                                </el-select>
                            </el-form-item>

                            <div class="search-row">
                                <el-input v-model="formData.upstreamCertNo" placeholder="10245567(输入上游合格证编号)"
                                    style="flex: 1">
                                    <template #suffix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                </el-input>
                                <el-button type="primary" class="btn-cyan" :loading="upstreamLoading"
                                    @click="handleSearchUpstream">查询</el-button>
                            </div>
                        </template>
                    </div>

                    <!-- 合格证预览区 -->
                    <div class="certificate-preview-mini"
                        v-if="formData.linkUpstream == 'yes' && formData.upstreamType == 'platform' && formData.upstreamId">
                        <div class="cert-no">上游合格证编号：{{ formData.upstreamCertNo }}</div>
                        <div class="cert-inner-card">
                            <h2 class="cert-main-title">承诺达标合格</h2>
                            <div class="cert-sub-title">我承诺生产销售的食用农产品</div>
                            <p class="cert-desc">未使用禁用的农药、兽药及其他化合物，使用的常规农药、兽药残留不超标。</p>
                            <div class="cert-promises">
                                <div class="cert-title">承诺依据</div>
                                <el-checkbox v-model="formData.p1" disabled>质量安全控制符合要求</el-checkbox>
                                <el-checkbox v-model="formData.p2" disabled>自行检测合格</el-checkbox>
                                <el-checkbox v-model="formData.p3" disabled>委托检测合格</el-checkbox>
                            </div>
                            <div class="qr-placeholder">
                                <el-icon size="60">
                                    <Picture />
                                </el-icon>
                            </div>
                        </div>
                    </div>

                    <!-- 基本信息预览 -->
                    <div class="basic-info-preview">
                        <h3 class="section-title">基本信息</h3>
                        <div class="info-grid">
                            <div class="info-row"><span class="label">产品名称</span><span class="value">{{
                                formData.productName || '--'
                                    }}</span></div>
                            <div class="info-row"><span class="label">产品数量</span><span class="value">{{
                                formData.batchSize || '--' }} {{
                                        formData.unit }}</span></div>
                            <div class="info-row"><span class="label">产品产地</span><span class="value">{{ formData.origin
                                || '--' }}</span>
                            </div>
                            <div class="info-row"><span class="label">承诺主体</span><span class="value">{{ formData.entity
                                || '--' }}</span>
                            </div>
                            <div class="info-row"><span class="label">联系方式</span><span class="value">--</span></div>
                            <div class="info-row"><span class="label">开具时间</span><span class="value">{{
                                formData.createDate || '--'
                                    }}</span></div>
                        </div>
                        <p class="info-tip">*电子合格证须现查询快检阅读电子智慧平台多数据</p>
                    </div>

                    <!-- 产品图片 -->
                    <div class="form-section">
                        <h3 class="section-title">产品图片</h3>
                        <div class="image-upload-wrapper">
                            <UploadImg v-model="formData.productImageUrl" :limit="1" height="160px" />
                        </div>
                    </div>

                    <!-- 底部按钮 -->
                    <div class="form-footer">
                        <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                        <el-button type="primary" :loading="submitLoading" class="btn-submit" @click="goNextToStep2">生成合格证</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 第二步：开具内容 -->
            <div v-if="currentStep === 2" class="step-content">
                <el-form :model="formData" label-position="top" class="step-form">
                    <el-form-item label="合格证出证类型" class="nowrap-item">
                        <el-select v-model="formData.issueType" placeholder="请选择" class="custom-select-large">
                            <el-option v-for="dict in certificateTypeOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="数量 (重量)">
                        <div class="quantity-input">
                            <div class="stepper">
                                <button type="button" class="step-btn" @click="handleSub">-</button>
                                <div class="step-val">{{ formData.quantity }}</div>
                                <button type="button" class="step-btn yellow" @click="handleAdd">+</button>
                            </div>
                            <el-select v-model="formData.unit" class="unit-select">
                                <el-option label="单位" value="unit" />
                                <el-option label="千克" value="kg" />
                                <el-option label="吨" value="t" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <el-form-item label="承诺依据">
                        <el-checkbox-group v-model="formData.basis">
                            <el-checkbox label="quality">质量安全控制符合要求</el-checkbox>
                            <el-checkbox label="self">自行检测合格</el-checkbox>
                            <el-checkbox label="entrust">委托检测合格</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <div class="association-grid">
                        <!-- 左侧：第三方结果 -->
                        <div class="assoc-col">
                            <h3 class="col-title">关联样品检测结果 {{ formData.thirdPartyType === 'third' ? '第三方' : '平台' }}</h3>
                            <div class="col-content-box">
                                <el-select v-model="formData.thirdPartyType" placeholder="第三方检测结果" class="full-width">
                                    <el-option label="第三方检测结果" value="third" />
                                    <el-option label="本平台检测结果" value="platform" />
                                </el-select>
                                <template v-if="formData.thirdPartyType === 'third'">

                                    <UploadImg v-model="formData.thirdPartyReportUrl" :limit="1" height="200px" />
                                    <div class="upload-tip">上传检测报告/检测结果</div>
                                </template>

                                <template v-else>
                                    <div class="search-row" style="margin-top: 0;">
                                        <el-select v-model="formData.platformRecordId" filterable remote
                                            :remote-method="searchPlatformRecords" placeholder="查询样品检测结果完成关联"
                                            class="flex-input" :loading="searchLoading">
                                            <el-option v-for="item in recordOptions" :key="item.id"
                                                :label="item.recordCode" :value="item.id">
                                                <span>{{ item.recordCode }} ({{ item.subjectName }})</span>
                                            </el-option>
                                        </el-select>
                                        <el-button type="primary" class="link-btn" @click="handleLinkRecord"
                                            :loading="linkLoading">关联</el-button>
                                    </div>

                                    <div class="results-preview" v-if="currentRecord">
                                        <h4 class="preview-title">检测结果预览</h4>

                                        <div class="kv-grid">
                                            <div class="kv-row"><span class="label">样品编号：</span><span class="val">{{
                                                    currentRecord.recordCode }}</span></div>
                                            <div class="kv-row"><span class="label">样品名称：</span><span class="val">{{
                                                    currentRecord.subjectName }}</span></div>
                                            <div class="kv-row"><span class="label">检测人员：</span><span class="val">{{
                                                    currentRecord.detector }}</span></div>
                                            <div class="kv-row"><span class="label">检测日期：</span><span class="val">{{
                                                    currentRecord.detectionDate }}</span></div>
                                        </div>

                                        <table class="nested-table">
                                            <thead>
                                                <tr>
                                                    <th>通道</th>
                                                    <th>检测项目</th>
                                                    <th>检测结果</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(item, index) in detectionItems" :key="index">
                                                    <td>{{ index + 1 }}</td>
                                                    <td>{{ item.detectionItem }}</td>
                                                    <td>
                                                        <el-tag :type="item.result === 1 ? 'success' : 'danger'"
                                                            size="small">
                                                            {{ item.result === 1 ? '阴性' : '阳性' }}
                                                        </el-tag>
                                                    </td>
                                                </tr>
                                                <tr v-if="detectionItems.length === 0">
                                                    <td colspan="3" class="text-center">无检测细项</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div v-else class="preview-empty">
                                        <el-empty description="请先搜索并选择检测记录进行关联" :image-size="80" />
                                    </div>
                                </template>


                            </div>
                        </div>
                    </div>

                    <div class="page-footer">
                        <el-button class="back-btn" @click="goToStep(1)">上一步</el-button>
                        <el-button type="primary" :loading="submitLoading" class="submit-btn" @click="handleGenerate">生成合格证</el-button>
                    </div>
                </el-form>
            </div>

            <!-- 第三步：查看合格证 -->
            <div v-if="currentStep === 3" class="step-content">
                <div ref="printAreaRef" class="certificate-document">
                    <div class="cert-header">
                        <span class="cert-no-tag">合格证编号－{{ certStore.certificate.certNo }}</span>
                    </div>

                    <div class="cert-body">
                        <h1 class="cert-title">承诺达标合格证</h1>
                        <h2 class="cert-subtitle">我承诺生产销售的食用农产品</h2>
                        <p class="cert-declaration">未使用禁用农药、兽药及其他化合物；使用的常规农药、兽药残留不超标。</p>

                        <div class="cert-middle-section">
                            <div class="cert-basis">
                                <h3 class="basis-title">承诺依据：</h3>
                                <el-checkbox-group v-model="formData.basis" disabled>
                                    <el-checkbox label="quality">质量安全控制符合要求</el-checkbox>
                                    <el-checkbox label="self">自行检测合格</el-checkbox>
                                    <el-checkbox label="entrust">委托检测合格</el-checkbox>
                                </el-checkbox-group>
                            </div>
                            <div class="qr-code-wrapper">
                                <Qrcode v-if="certStore.certificate.certNo" :text="certStore.certificate.certNo" :width="120" />
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="info-section">
                            <h3 class="info-title">基本信息</h3>
                            <div class="info-table">
                                <div class="info-row">
                                    <div class="label">产品名称</div>
                                    <div class="value">{{ formData.productName }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">产品数量</div>
                                    <div class="value">{{ formData.quantity }} {{ formData.unit }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">产品产地</div>
                                    <div class="value">{{ formData.origin }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">承诺主体</div>
                                    <div class="value">{{ formData.entity }}</div>
                                </div>
                                <div class="info-row">
                                    <div class="label">开具时间</div>
                                    <div class="value">{{ certStore.certificate.issueDate }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="divider"></div>

                        <div class="image-section">
                            <h3 class="info-title">产品图片</h3>
                            <div class="image-preview-box">
                                <img v-if="formData.productImageUrl" :src="formData.productImageUrl" class="cert-product-img" alt="产品图片" />
                                <el-icon v-else class="placeholder-icon">
                                    <Picture />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="action-footer">
                    <el-button type="primary" class="print-btn" :loading="captureLoading" @click="handlePreview()">打印合格证 / 预览</el-button>
                    <el-button class="back-btn" @click="handleBack">返回列表</el-button>
                    <el-button class="back-btn" @click="goToStep(2)">修改信息</el-button>
                </div>
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

<script setup>
import { reactive, computed, onMounted, ref, nextTick } from 'vue';
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router';
import { Search, Picture, Check, ArrowRight } from '@element-plus/icons-vue';
import { useCertificateStore } from '@/store/modules/certificate';
import PageBack from '@/components/PageBack/index.vue';
import * as CertificateApi from '@/api/agri/certificate';
import * as ProductApi from '@/api/agri/product';
import * as SubjectApi from '@/api/agri/subject';
import { useMessage } from '@/hooks/web/useMessage';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import html2canvas from 'html2canvas';
import printJS from 'print-js';
import { Qrcode } from '@/components/Qrcode';
import SubjectFormDrawer from '@/views/filing/subject/components/SubjectFormDrawer.vue';

const router = useRouter();
const route = useRoute();
const message = useMessage();
const certStore = useCertificateStore();

const id = route.query.id;
const isUpdate = !!id;
const currentStep = computed(() => certStore.currentStep);

// 点返回清空数据
onBeforeRouteLeave((to) => {
    if (to.path === '/certificate/issue') {
        certStore.resetAll();
    }
});

// 字典数据
const certificateTypeOptions = getIntDictOptions(DICT_TYPE.AGRI_CERTIFICATE_TYPE);

const formData = reactive({
    // Step 1
    linkProfile: 'yes',
    searchProfile: '',
    productNo: '',
    productName: '',
    category: '',
    origin: '',
    batchSize: '',
    unit: 'kg',
    createDate: '',
    entity: '',
    registeredCity: '',
    legalPerson: '',
    productImageUrl: '',
    productId: undefined,
    subjectId: undefined, // 新增：保存主体ID
    linkUpstream: 'no',
    upstreamType: 'platform',
    upstreamCertNo: '',
    p1: false,
    p2: false,
    p3: false,
    upstreamId: undefined,
    // Step 2
    issueType: undefined,
    quantity: 0,
    basis: ['quality'],
    thirdPartyType: 'third',
    thirdPartyReportUrl: '',
    platformRecordId: undefined,
    platformType: 'platform',
    searchKey: '',
    qrCode: ''
});

const submitLoading = ref(false);
const showSubjectDrawer = ref(false);

const upstreamLoading = ref(false);
const handleSearchUpstream = async () => {
    if (!formData.upstreamCertNo) {
        message.warning('请输入上游合格证编号');
        return;
    }
    upstreamLoading.value = true;
    try {
        const data = await CertificateApi.queryUpstreamCertificate(formData.upstreamCertNo);
        if (data) {
            message.success('查询成功');
            // 回填信息
            formData.upstreamId = data.id;
            formData.productName = data.productName || formData.productName;
            formData.origin = data.productionArea || formData.origin;
            formData.entity = data.subjectName || formData.entity;
            formData.subjectId = data.subjectId || formData.subjectId;
            formData.productId = data.productId || formData.productId;
            formData.batchSize = data.batchNo || formData.batchSize;
            formData.unit = data.unit || formData.unit;

            // 解析承诺依据
            if (data.commitmentBasis) {
                try {
                    const basis = JSON.parse(data.commitmentBasis);
                    formData.p1 = basis.includes(1);
                    formData.p2 = basis.includes(2);
                    formData.p3 = basis.includes(3);
                } catch (e) {
                    console.error('解析承诺依据失败', e);
                }
            }

            // 如果有主体信息，更新选项
            if (data.subjectId && data.subjectName) {
                entityOptions.value = [{ id: data.subjectId, name: data.subjectName }];
            }
        } else {
            message.warning('未找到对应的合格证信息');
            formData.upstreamId = undefined;
        }
    } catch (error) {
        console.error('查询上游合格证失败', error);
        formData.upstreamId = undefined;
    } finally {
        upstreamLoading.value = false;
    }
};

const handleEntityChange = (val) => {
    const selected = entityOptions.value.find(item => item.id === val);
    if (selected) {
        formData.entity = selected.name;
        formData.subjectId = selected.id;
        formData.legalPerson = selected.legalPerson || '';
        // 暂时回显城市代码，实际项目中可能需要通过 Code 转换
        formData.registeredCity = selected.cityCode || '青岛市'; 
    }
};

const loadDetails = async () => {
    if (!id) return;
    try {
        const data = await CertificateApi.getCertificate(id);
        Object.assign(formData, {
            productNo: data.certificateCode,
            productName: data.productName,
            category: 'vegetable', // 示例映射
            origin: data.origin || '',
            batchSize: data.quantity,
            unit: data.unit || 'kg',
            createDate: data.issueDate,
            entity: data.entityName || '',
            subjectId: data.subjectId, // 设置 ID
            registeredCity: data.cityCode || '青岛市',
            legalPerson: data.legalPerson || '',
            productImageUrl: data.productImageUrl || '',
            productId: data.productId,
            issueType: data.certificateType,
            quantity: data.quantity,
            thirdPartyReportUrl: data.thirdPartyReportUrl || '',
            platformRecordId: data.detectionRecordId,
            thirdPartyType: data.thirdPartyReportUrl ? 'third' : (data.detectionRecordId ? 'platform' : 'third'),
            qrCode: data.qrCode
        });
        // 为确保 select 显示名称，如果有 ID 则构造一个 option
        if (data.subjectId && data.entityName) {
            entityOptions.value = [{ id: data.subjectId, name: data.entityName }];
        }
        // 更新 store 以同步其它步骤
        certStore.updateProductInfo(formData);
        certStore.updateIssueInfo(formData);
    } catch (error) {
        console.error('加载详情失败', error);
    }
};

const entityOptions = ref([]);
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

const searchProduct = async (query) => {
    if (query !== '') {
        productLoading.value = true;
        try {
            const data = await ProductApi.getProductPage({ productCode: query, pageNo: 1, pageSize: 50 });
            productOptions.value = data.list;
        } finally {
            productLoading.value = false;
        }
    } else {
        productOptions.value = [];
    }
};

const handleProductSelect = async (id) => {
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
        formData.unit = data.productUnit || 'kg';
        // 转换时间戳为日期字符串
        if (data.createTime) {
            const date = new Date(data.createTime);
            formData.createDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
    certStore.setStep(1);
    if (id) {
        loadDetails();
    } else {
        // 如果是从主体建档回跳，尝试从 store 恢复现场
        Object.assign(formData, certStore.productInfo);

        // 处理回跳后的新主体自动选中
        const newSubjectId = route.query.newSubjectId;
        if (newSubjectId) {
            try {
                const subject = await SubjectApi.getSubject(newSubjectId);
                formData.subjectId = subject.id;
                formData.entity = subject.name;
                entityOptions.value = [subject];
            } catch (err) {
                console.error('获取新主体信息失败', err);
            }
        }
    }
});

const handleSubjectCreateSuccess = async (newId) => {
    try {
        const subject = await SubjectApi.getSubject(newId);
        formData.subjectId = subject.id;
        formData.entity = subject.name;
        formData.legalPerson = subject.legalPerson || '';
        formData.registeredCity = subject.cityCode || '青岛市';
        entityOptions.value = [subject];
    } catch (err) {
        console.error('获取新主体信息失败', err);
    }
};

const handleAdd = () => formData.quantity++;
const handleSub = () => { if (formData.quantity > 0) formData.quantity-- };

const goToStep = (step) => {
    certStore.setStep(step);
};

const goNextToStep2 = () => {
    certStore.updateProductInfo(formData);
    goToStep(2);
};

// 提交数据
const handleGenerate = async () => {
    if (submitLoading.value) return;
    submitLoading.value = true;
    try {
        const basisMapping = {
            quality: 1,
            self: 2,
            entrust: 3
        };
        const mappedBasis = formData.basis.map(key => basisMapping[key]).filter(Boolean);

        let currentProductId = formData.productId || 15707; // 回退使用默认值

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
            id: isUpdate ? id : undefined,
            certificateType: formData.issueType,
            productId: currentProductId,
            quantity: Number(formData.quantity) || 0,
            unit: formData.unit || 'kg',
            commitmentContent: '我承诺生产销售的食用农产品未使用禁用的农药、兽药及其他化合物，使用的常规农药、兽药残留不超标。',
            commitmentBasis: JSON.stringify(mappedBasis),
            productionDate: formData.createDate ? new Date(formData.createDate).toISOString().split('T')[0] : '',
            batchNo: formData.batchSize || undefined,
            productImageUrl: formData.productImageUrl || undefined,
            upstreamCertificateId: formData.linkUpstream === 'yes' ? formData.upstreamId : undefined,
            upstreamCertificateCode: formData.linkUpstream === 'yes' ? formData.upstreamCertNo : undefined,
            thirdPartyReportUrl: formData.thirdPartyType === 'third' ? formData.thirdPartyReportUrl : undefined,
            detectionRecordId: formData.thirdPartyType === 'platform' ? formData.platformRecordId : undefined
        };

        if (isUpdate) {
            await CertificateApi.updateCertificate(submitData);
            message.success('更新成功');
        } else {
            await CertificateApi.createCertificate(submitData);
            message.success('创建成功');
        }

        certStore.updateIssueInfo(formData);
        certStore.generateCertificate();
        goToStep(3);
    } catch (error) {
        console.error('保存失败', error);
    } finally {
        submitLoading.value = false;
    }
};

const handleCancel = () => {
    certStore.resetAll();
    router.push('/certificate/issue');
};

const handleBack = () => {
    certStore.resetAll();
    router.push('/certificate/issue');
};

const printAreaRef = ref(null);
const previewVisible = ref(false);
const previewSrc = ref(null);
const captureLoading = ref(false);

const captureAreaToImg = async () => {
    const area = printAreaRef.value;
    if (!area) return null;

    // 获取可能存在的 no-print 元素并暂时隐藏
    const hiddenNodes = [];
    area.querySelectorAll('.no-print').forEach(el => {
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

const handlePreview = async () => {
    captureLoading.value = true;
    previewVisible.value = true;
    previewSrc.value = null;
    
    // 让弹窗及 loading UI 先呈现出来再进行阻断式渲染
    await nextTick();
    // 延迟少许给浏览器足够时间渲染弹窗动画
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

const handlePrint = async (prepared) => {
    const dataUrl = typeof prepared === 'string' ? prepared : await captureAreaToImg();
    if (!dataUrl) {
        message.error('生成打印内容失败');
        return;
    }
    try {
        printJS({
            printable: dataUrl,
            type: 'image',
            imageStyle: 'width:100%;',
            documentTitle: certStore.certificate?.certNo || '合格证'
        });
    } catch (e) {
        console.error('print failed', e);
        message.error('打印失败，请稍后重试');
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
    margin-bottom: 20px;
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
    margin-bottom: 32px;

    .section-title {
        font-size: 16px;
        font-weight: 700;
        color: #333;
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
    margin: 24px 0;
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

/* 合格证预览 */
.certificate-preview-mini {
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    margin: 24px 0;

    .cert-no {
        font-size: 13px;
        color: #00B3ED;
        font-weight: 600;
        margin-bottom: 16px;
    }

    .cert-inner-card {
        text-align: center;
        padding: 20px;
        position: relative;
    }

    .cert-main-title {
        font-size: 22px;
        font-weight: 800;
        color: #333;
        margin-bottom: 8px;
    }

    .cert-sub-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
    }

    .cert-desc {
        font-size: 12px;
        color: #666;
        margin-bottom: 16px;
    }

    .cert-promises {
        text-align: left;
        background: #F9FAFB;
        padding: 16px;
        border-radius: 8px;

        .cert-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 12px;
        }

        .el-checkbox {
            display: block;
            margin-bottom: 8px;
        }
    }

    .qr-placeholder {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 100px;
        height: 100px;
        background: #F3F4F6;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ccc;
    }
}

/* 基本信息预览 */
.basic-info-preview {
    margin: 24px 0;

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

        &:hover {
            background: #00B3ED;
        }
    }

    .step-val {
        width: 120px;
        text-align: center;
        line-height: 40px;
        background: #fff;
        font-size: 18px;
        font-weight: 600;
        color: #333;
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
        background: #FDF5E6;
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
    padding: 16px;
    border-radius: 8px;

    .preview-title {
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 12px;
        border-left: 3px solid #00B3ED;
        padding-left: 8px;
    }
}

/* 步骤三：合格证大页面样式 */
.certificate-document {
    background: #fff;
    border: 1px solid #E5E7EB;
    padding: 40px;
    border-radius: 8px;

    .cert-header {
        margin-bottom: 24px;

        .cert-no-tag {
            background: #F0F7FF;
            color: #333;
            padding: 6px 12px;
            border-radius: 2px;
        }
    }

    .cert-title {
        font-size: 28px;
        font-weight: 800;
        margin: 20px 0;
    }

    .cert-subtitle {
        font-size: 20px;
        font-weight: 700;
    }

    .cert-declaration {
        font-size: 14px;
        color: #666;
        max-width: 600px;
        margin: 12px auto;
    }
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
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
}

.btn-submit,
.submit-btn,
.print-btn {
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    min-width: 160px;
    height: 44px;
    font-weight: 600;
    border-radius: var(--el-border-radius-base);
    transition: all 0.3s;

    &:hover {
        background: linear-gradient(135deg, #0099D6 0%, #0085B3 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 179, 237, 0.3);
    }
}

.btn-cancel,
.back-btn {
    min-width: 120px;
    height: 44px;
    border-radius: var(--el-border-radius-base);
    border-color: #D1D5DB;
    color: #666;

    &:hover {
        background: transparent;
    }
}

.btn-cyan {
    border: none;
    color: #fff;
    border-radius: 6px;
    transition: all 0.3s;
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
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
    color: #fff;
    border-radius: 8px;

    &:hover {
        background: linear-gradient(135deg, #0099D6 0%, #0085B3 100%);
    }
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
</style>
