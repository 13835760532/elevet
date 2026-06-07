<template>
    <div class="page-container">
        <div class="header-fixed-container">
            <PageHeader v-if="currentStep == 2" title="拍照判读" desc="对检测结果进行拍照上传判读" :showBack="true"></PageHeader>
            <PageHeader v-else-if="currentStep == 3" title="检测结果" desc="对检测结果进行拍照上传判读后的结果" :showBack="true">
            </PageHeader>
            <PageHeader v-else-if="currentStep == 4" title="检测报告" desc="对检测结果进行拍照上传判读后的结果" :showBack="true">
            </PageHeader>
            <PageHeader v-else title="抽样检测" desc="请根据您的实际情况选择相应的建档类型，我们为企业和个人提供专业的备案服务，确保您的备案流程顺利进行。" :showBack="true">
            </PageHeader>
        </div>

        <!-- 步骤条 -->
        <div class="content-card">
            <div class="steps-wrapper">
                <div class="step-item" :class="{ active: currentStep === 1, done: currentStep > 1 }"
                    @click="goToStep(1)">
                    <span class="step-num">1.</span> 样品信息录入
                </div>
                <div class="step-item" :class="{ active: currentStep === 2, done: currentStep > 2 }"
                    @click="goToStep(2)">
                    <span class="step-num">2.</span> 拍照AI判读
                </div>
                <div class="step-item" :class="{ active: currentStep === 3, done: currentStep > 3 }"
                    @click="goToStep(3)">
                    <span class="step-num">3.</span> 检测结果
                </div>
                <div class="step-item" :class="{ active: currentStep === 4 }" @click="goToStep(4)">
                    <span class="step-num">4.</span> 检测报告
                </div>
            </div>

            <!-- 步骤1: 样品信息 -->
            <div v-show="currentStep === 1" class="step-content">
                <h3 class="section-title">样品信息</h3>

                <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top"
                    class="sample-info-form">
                    <!-- 是否关联农产品档案 -->
                    <el-form-item label="是否关联农产品档案">
                        <div class="inline-radio-input">
                            <el-radio-group v-model="formState.linkProduct">
                                <el-radio :value="false">否</el-radio>
                                <el-radio :value="true">是</el-radio>
                            </el-radio-group>
                            <div v-if="formState.linkProduct" class="scan-input-group">
                                <el-select v-model="formData.sample.productId" filterable remote reserve-keyword
                                    placeholder="输入关键词匹配产品" :remote-method="remoteSearchProduct"
                                    :loading="productLoading" @change="handleProductChange" style="flex: 1">
                                    <el-option v-for="item in productOptions" :key="item.id" :label="item.productName"
                                        :value="item.id" />
                                </el-select>
                                <el-button type="primary" class="scan-btn">
                                    <el-icon>
                                        <Goods />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 样品编号 -->
                    <el-form-item label="样品编码" prop="recordCode">
                        <el-input :disabled="true" placeholder="系统自动生成" />
                    </el-form-item>

                    <!-- 样品名称 -->
                    <el-form-item label="样品名称" prop="sample.sampleName">
                        <el-input v-model="formData.sample.sampleName" placeholder="如：白菜"
                            :disabled="formState.linkProduct" />
                    </el-form-item>

                    <!-- 产品分类 (仅未关联档案时显示) -->
                    <el-form-item v-if="!formState.linkProduct" label="产品分类" prop="sampleCategory">
                        <el-select v-model="formState.productCategory" placeholder="请选择产品分类" class="full-width">
                            <el-option v-for="dict in productCategoryOptions" :key="dict.value" :label="dict.label"
                                :value="dict.value" />
                        </el-select>
                    </el-form-item>

                    <!-- 样品产地 -->
                    <el-form-item label="样品产地" prop="sample.productionArea">
                        <AreaCascader v-model="formState.origin" @select="handleAreaSelect" placeholder="选择产地"
                            :disabled="formState.linkProduct" />
                    </el-form-item>

                    <!-- 数量（重量） -->
                    <el-form-item label="数量（重量）" prop="sample.sampleQuantity">
                        <div class="compound-input">
                            <el-input-number v-model="formData.sample.sampleQuantity" :min="0" style="flex: 1"
                                controls-position="right" :disabled="formState.linkProduct" />
                            <el-select v-model="formState.quantityUnit" placeholder="单位" style="width: 140px"
                                :disabled="formState.linkProduct">
                                <el-option v-for="unit in measurementUnitOptions" :key="unit.value" :label="unit.label"
                                    :value="unit.value" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <el-form-item label="样品来源环节" prop="sample.sampleSource">
                        <el-select v-model="formData.sample.sampleSource" placeholder="选择采样来源" class="full-width"
                            multiple>
                            <el-option label="田间" value="田间" />
                            <el-option label="市场" value="市场" />
                            <el-option label="商超" value="商超" />
                            <el-option label="基地" value="基地" />
                            <el-option label="其他" value="其他" />
                        </el-select>
                    </el-form-item>

                    <!-- 生产经营主体 -->
                    <el-form-item label="生产经营主体" prop="subjectName">
                        <div class="subject-search-wrapper">
                            <div class="search-input-group">
                                <el-select v-model="formData.subjectName" filterable remote
                                    placeholder="搜索企业名称或信用代码查询主体" :remote-method="remoteSearchSubject"
                                    :loading="subjectLoading" class="subject-select" :disabled="formState.linkProduct">
                                    <template #prefix>
                                        <el-icon>
                                            <Search />
                                        </el-icon>
                                    </template>
                                    <el-option v-for="item in subjectOptions" :key="item.id" :label="item.name"
                                        :value="item.name" @click="handleSubjectSelect(item)" />
                                </el-select>
                                <el-button type="primary" class="add-subject-btn" @click="handleCreateSubject"
                                    :disabled="formState.linkProduct">
                                    <el-icon>
                                        <Plus />
                                    </el-icon> 新增主体
                                </el-button>
                            </div>
                            <p v-if="!formData.subjectName" class="subject-tip">*如果未找到，请先创建主体建档</p>

                            <!-- 主体详细信息回显 -->
                            <div v-if="formState.selectedSubject" class="subject-detail-card">
                                <div class="card-title">
                                    <el-icon class="title-icon">
                                        <OfficeBuilding />
                                    </el-icon>
                                    主体详细信息
                                </div>
                                <div class="detail-grid">
                                    <div class="grid-item">
                                        <div class="field-label">主体名称</div>
                                        <div class="field-value">{{ formState.selectedSubject.name || '--' }}</div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">信用代码</div>
                                        <div class="field-value">{{ formState.selectedSubject.socialCreditCode || '--'
                                        }}</div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">主体类型</div>
                                        <div class="field-value">
                                            <span class="category-tag">{{
                                                getSubjectCategoryLabel(formState.selectedSubject.category) }}</span>
                                        </div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">建档类型</div>
                                        <div class="field-value">{{ getFilingTypeLabel(formState.selectedSubject.type)
                                        }}</div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">联系人</div>
                                        <div class="field-value">{{ formState.selectedSubject.contactName || '--' }}
                                        </div>
                                    </div>
                                    <div class="grid-item">
                                        <div class="field-label">联系电话</div>
                                        <div class="field-value">{{ formState.selectedSubject.contactPhone || '--' }}
                                        </div>
                                    </div>
                                    <div class="grid-item full-row">
                                        <div class="field-label">所属地区及详细地址</div>
                                        <div class="field-value">
                                            {{ formState.selectedSubject.provinceCode || '' }}{{
                                                formState.selectedSubject.cityCode || '' }}{{
                                                formState.selectedSubject.districtCode || '' }} {{
                                                formState.selectedSubject.address || '' }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-form-item>

                    <!-- 检测结果面向政府公开 -->
                    <el-form-item label="本条检测结果是否面向政府公开">
                        <el-radio-group v-model="formData.publicFlag">
                            <el-radio :value="true">是</el-radio>
                            <el-radio :value="false">否</el-radio>
                        </el-radio-group>
                        <div class="public-notice">
                            <div class="notice-icon">!</div>
                            <div class="notice-content">
                                <p>当前政府对此类检测结果是否面向公开，不公开则不计入任务统计数据量。</p>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 步骤2: 拍照AI判读 -->
            <div v-show="currentStep === 2" class="step-content">
                <h3 class="section-title">拍照AI判读</h3>

                <el-form :model="formData" label-width="120px" class="ai-info-form">
                    <el-form-item label="检测单位">
                        <div class="with-desc">
                            <el-input v-model="formData.detectionOrgName" placeholder="获取用户机构名称" />
                            <span class="field-desc-red">获取当前用户机构名称，支持手动更改名称。</span>
                        </div>
                    </el-form-item>

                    <el-form-item label="检测人员">
                        <div class="with-desc">
                            <el-input v-model="formData.detector" placeholder="获取用户信息" />
                            <span class="field-desc-red">自动获取当前用户姓名，支持手动修改。</span>
                        </div>
                    </el-form-item>

                    <el-form-item label="检测区划">
                        <div class="with-desc">
                            <el-input v-model="formData.detectionArea" placeholder="读取所属区划" />
                            <span class="field-desc-red">读取当前用户所属区划，支持用户修改。</span>
                        </div>
                    </el-form-item>

                    <el-form-item label="检测地点">
                        <div class="with-desc">
                            <el-input v-model="formData.detectionLocation" placeholder="请输入详情地点" />
                            <span class="field-desc-red">触发系统自动获取地点信息，支持手动修改。</span>
                        </div>
                    </el-form-item>

                    <el-form-item label="检测时间">
                        <div class="with-desc">
                            <el-date-picker v-model="formData.detectionDate" type="datetime" placeholder="选择日期时间"
                                format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" readonly
                                style="width: 260px!important" />
                            <span class="field-desc-red">读取系统时间</span>
                        </div>
                    </el-form-item>

                    <el-form-item label="检测标准">
                        <el-select v-model="formData.detectStandard" placeholder="请选择或输入检测标准" filterable allow-create
                            default-first-option style="width: 100%">
                            <el-option label="GB2763-2021" value="GB2763-2021" />
                            <el-option label="GB21650-2019" value="GB21650-2019" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="检测方法">
                        <el-select v-model="formData.detectionMethod" placeholder="请选择检测方法" style="width: 100%">
                            <el-option label="胶体金检测法" value="胶体金检测法" />
                            <el-option label="酶抑制法" value="酶抑制法" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="检测照片上传">
                        <div class="upload-container">
                            <!-- 使用 el-upload 以获得原始 File 对象以便调用 AI 接口 -->
                            <el-upload class="ai-uploader" action="#" :auto-upload="false" :on-change="handleFileChange"
                                :show-file-list="false" drag>
                                <div v-if="!formState.tempFileUrl" class="upload-inner">
                                    <el-icon class="el-icon--upload">
                                        <UploadFilled />
                                    </el-icon>
                                    <div class="el-upload__text">
                                        拖拽图片至此或 <em>点击上传</em>
                                    </div>
                                    <div class="el-upload__tip">单个文件最大支持 10MB</div>
                                </div>
                                <img v-else :src="formState.tempFileUrl" class="preview-img" />
                            </el-upload>
                            <div v-if="formState.tempFileUrl" class="ai-action" style="margin-top: 16px;">
                                <el-button type="success" :loading="aiLoading" @click="handleAiDetect">
                                    {{ aiLoading ? '正在分析中...' : '开始 AI 识别与结果回显' }}
                                </el-button>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>

                <div v-if="formData.overallResult !== undefined || formData.aiRecognitionResultText"
                    class="ai-result-panel">
                    <!-- <p><strong>AI 识别建议：</strong> {{ formData.aiRecognitionResultText || '正在处理结果' }}</p> -->
                    <div v-if="formState.aiDetailResults && formState.aiDetailResults.length" class="result-list">
                        <el-tag v-for="(res, idx) in formState.aiDetailResults" :key="idx"
                            :type="res.status.includes('阳') ? 'danger' : 'success'"
                            style="margin-right: 8px; margin-bottom: 8px;">
                            {{ res.codeName }}: {{ res.status }} ({{ res.result }})
                        </el-tag>
                    </div>
                </div>
            </div>

            <!-- 步骤3: 检测结果 -->
            <div v-show="currentStep === 3" class="step-content">
                <div class="result-summary-container">
                    <div class="summary-header">
                        <h3 class="section-title">样品检测信息</h3>
                        <div v-if="overallStatusLabel" class="result-stamp" :class="overallStatusLabel">
                            {{ overallStatusLabel }}
                        </div>
                    </div>

                    <!-- 基础信息列表 -->
                    <div class="info-list">
                        <div class="info-item">
                            <span class="label">样品编号：</span>
                            <span class="value">{{ formData.sample.sampleCode }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">样品名称：</span>
                            <span class="value">{{ formData.sample.sampleName }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">样品产地：</span>
                            <span class="value">{{ formData.sample.productionArea }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">抽检区域：</span>
                            <span class="value">{{ formData.detectionArea }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">生产主体：</span>
                            <span class="value">{{ formState.selectedSubject?.name || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">样品来源：</span>
                            <span class="value">{{ Array.isArray(formData.sample.sampleSource) ?
                                formData.sample.sampleSource.join(', ') : (formData.sample.sampleSource || '--')
                            }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">样品状态：</span>
                            <span class="value" :class="overallStatusValue === '阳性' ? 'text-red' : 'text-green'">
                                {{ overallStatusValue }}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测机构：</span>
                            <span class="value">{{ formData.detectionOrgName }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测人员：</span>
                            <span class="value">{{ formData.detector }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测日期：</span>
                            <span class="value">{{ formatDate(formData.detectionDate, 'YYYY-MM-DD HH:mm:ss') }}</span>
                        </div>
                    </div>

                    <!-- 检测结果详情 -->
                    <h3 class="section-title sub-title">检测结果详情</h3>
                    <el-table :data="formState.aiDetailResults" border class="result-table">
                        <el-table-column property="cardChannel" label="通道" width="100" />
                        <el-table-column property="codeName" label="检测项目" />
                        <el-table-column property="result" label="检测值（T/C值）">
                            <template #default="scope">
                                {{ Number(scope.row.result).toFixed(3) || 0 }}
                            </template>
                        </el-table-column>
                        <el-table-column property="concentration" label="浓度值（单位 ppb）">
                            <template #default="scope">
                                {{ scope.row.concentration || '--' }}
                            </template>
                        </el-table-column>
                        <el-table-column property="status" label="检测结果">
                            <template #default="scope">
                                <span :class="scope.row.status.includes('阳') ? 'text-red' : 'text-green'">{{
                                    scope.row.status }}</span>
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- 检测图片 -->
                    <h3 class="section-title sub-title">检测图片：</h3>
                    <div class="result-image-box">
                        <img v-if="formState.tempFileUrl" :src="formState.tempFileUrl" class="result-img" />
                        <el-empty v-else description="暂无预览图" />
                    </div>

                    <!-- 备注 -->
                    <div class="remarks-section">
                        <div class="section-label">备 注：</div>
                        <el-input v-model="formData.remarks" type="textarea" :rows="4" maxlength="50" show-word-limit
                            placeholder="请输入备注（最多50个字符）" />
                        <p class="remarks-tip">备注仅对当前结果生效，最多50个字符</p>
                    </div>

                    <div class="save-action">
                        <el-button type="primary" size="large" @click="handleSave" :loading="submitting">保存</el-button>
                    </div>
                </div>
            </div>

            <!-- 步骤4: 检测报告 -->
            <div v-show="currentStep === 4" class="step-content">
                <RapidDetectionReport ref="reportRef" :data="formData" :results="formState.aiDetailResults" />
            </div>

            <!-- 底部按钮 -->
            <div class="footer-actions">
                <template v-if="currentStep < 4">
                    <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
                    <el-button v-if="currentStep > 1 && !(isRecheck && currentStep === 2)"
                        @click="handlePrev">上一步</el-button>
                    <el-button type="primary" @click="handleNext" class="btn-next">下一步</el-button>
                </template>
                <template v-else>
                    <el-button type="primary" @click="handlePrint" class="btn-next">报告下载</el-button>
                    <el-button @click="handleResetForm" class="btn-cancel">继续检测</el-button>
                </template>
            </div>
        </div>

        <!-- 主体建档抽屉 -->
        <SubjectFormDrawer v-model="subjectDrawerVisible" @success="handleSubjectSuccess" />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, Goods, Plus, OfficeBuilding, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import { useDict } from '@/hooks/web/useDict';
import * as DetectionRecordApi from '@/api/agri/detectionRecord';
import * as SubjectApi from '@/api/agri/subject/index';
import * as ProductApi from '@/api/agri/product';
import * as DetectionReportApi from '@/api/agri/detectionReport';
import * as DetectionTaskApi from '@/api/agri/detectionTask';
import { AiDetectionApi } from '@/api/agri/aiDetection';
import * as DeptApi from '@/api/system/dept';
import { useUserStore } from '@/store/modules/user';
import { formatDate } from '@/utils/formatTime';
import AreaCascader from '@/components/AreaCascader/index.vue';
import ImageUpload from '@/components/ImageUpload/index.vue';
import SubjectFormDrawer from '@/views/filing/subject/components/SubjectFormDrawer.vue';
import RapidDetectionReport from './components/RapidDetectionReport.vue';
import { DEFAULT_AGRI_MEASUREMENT_UNIT, usePreferredAgriMeasurementUnitOptions } from '@/utils/agriUnit';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const formRef = ref(null);
const currentStep = ref(1);
const submitting = ref(false);
const subjectDrawerVisible = ref(false);
const isRecheck = ref(false);
const reportRef = ref(null);
const lastSavedRemarks = ref(null);

const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');
const { getLabel: getSubjectCategoryLabel } = useDict('agri_subject_category', 'str');
const { options: productCategoryOptions } = useDict('agri_product_category', 'str');

const productLoading = ref(false);
const productOptions = ref([]);
const taskLoading = ref(false);
const taskOptions = ref([]);
const subjectLoading = ref(false);
const subjectOptions = ref([]);

// UI 独有的中间状态
const formState = reactive({
    linkProduct: false,
    selectedProduct: null,
    selectedSubject: null,
    productCategory: undefined,
    quantityUnit: DEFAULT_AGRI_MEASUREMENT_UNIT,
    origin: [],
    tempFileUrl: '',
    rawFile: null,
    aiDetailResults: []
});

const quantityUnitRef = computed({
    get: () => formState.quantityUnit,
    set: (value) => {
        formState.quantityUnit = value || DEFAULT_AGRI_MEASUREMENT_UNIT;
    }
});
const measurementUnitOptions = usePreferredAgriMeasurementUnitOptions(
    quantityUnitRef,
    ['千克', 'kg'],
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    computed(() => !formState.linkProduct)
);

const aiLoading = ref(false);

const overallStatusValue = computed(() => {
    if (!formState.aiDetailResults || formState.aiDetailResults.length === 0) return '待检测';
    // 检查是否有异常
    const hasAbnormal = formState.aiDetailResults.some(item => item.status && item.status.includes('异常'));
    if (hasAbnormal) return '异常';

    const isUnqualified = formState.aiDetailResults.some(item =>
        item.status && (item.status.includes('阳') || item.status.includes('不合格'))
    );
    return isUnqualified ? '阳性' : '阴性';
});

const overallStatusLabel = computed(() => {
    if (overallStatusValue.value === '异常' || overallStatusValue.value === '待检测') return '';
    return overallStatusValue.value === '阳性' ? '不合格' : '合格';
});

const reportInfo = ref(null);

// 监听关联开关，选择“否”时清空关联数据
watch(() => formState.linkProduct, (newVal) => {
    if (!newVal) {
        formData.sample.productId = undefined;
        formData.sample.sampleName = '';
        formData.sample.productionArea = '';
        formState.origin = [];
        formData.sample.sampleQuantity = 0;
        formState.quantityUnit = DEFAULT_AGRI_MEASUREMENT_UNIT;
        formData.subjectName = '';
        formState.selectedSubject = null;
        formState.selectedProduct = null;
    }
});
const inspectionRecordId = ref(undefined);
const formData = reactive({
    id: undefined,
    inspectionRecordId: undefined,
    recordCode: 'YP' + new Date().getTime(),
    sample: {
        id: undefined,
        sampleCode: 'YP' + new Date().getTime(),
        sampleName: '',
        productId: undefined,
        batchNo: '',
        productionDate: '',
        sampleSource: [],
        sampleImageUrl: '',
        sampleQuantity: 0,
        samplingDate: new Date().toISOString().split('T')[0],
        sampler: userStore.user.nickname || '管理员',
        productionArea: '',
        status: 1
    },
    taskId: route.query.taskId || undefined,
    detectionType: 1,
    detectionDate: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
    subjectName: '',
    detectionOrgName: userStore.user.deptName || '',
    detector: userStore.user.nickname || '管理员',
    detectionArea: '',
    detectionLocation: '',
    detectionMethod: '胶体金检测法',
    detectStandard: 'GB/T 5009.199-2003',
    testPaperImageUrl: '',
    aiRecognitionResult: '',
    aiRecognitionResultText: '',
    remarks: '',
    status: 1,
    publicFlag: true,
    issuerDeptId: undefined
});

// 获取部门名称用于回显
const issuerDeptName = ref('');

// 初始化获取部门信息
const initDeptInfo = async () => {
    const userDeptId = userStore.user?.deptId
    if (userDeptId) {
        formData.issuerDeptId = userDeptId
        try {
            const res = await DeptApi.getDept(userDeptId)
            issuerDeptName.value = res.name
            // 填充检测单位
            if (!formData.detectionOrgName) {
                formData.detectionOrgName = res.name
            }
            // 填充检测区划 (根据部门代码)
            if (!formData.detectionArea) {
                const areaParts = [res.provinceCode, res.cityCode, res.districtCode].filter(Boolean)
                formData.detectionArea = areaParts.join('-')
            }
        } catch (error) {
            console.error('获取部门信息失败', error)
        }
    }
}

const formRules = {
    recordCode: [{ required: true, message: '请输入样品编码', trigger: 'blur' }],
    'sample.sampleName': [{ required: true, message: '请输入样品名称', trigger: 'blur' }],
    'sample.productionArea': [{ required: true, message: '请选择样品产地', trigger: 'change' }],
    'sample.sampleQuantity': [{ required: true, message: '请输入数量', trigger: 'blur' }],
    'sample.sampleSource': [{ required: true, message: '请选择采样来源', trigger: 'change' }],
    subjectName: [{ required: true, message: '请选择或创建生产经营主体', trigger: 'change' }]
};

/**
 * 远程搜索产品
 */
const remoteSearchProduct = async (query) => {
    if (query) {
        productLoading.value = true;
        try {
            let queryData = query.includes('PROD') ? query : ""
            const data = await ProductApi.getProductPage({
                productName: queryData ? '' : query,
                productCode: queryData,
                pageSize: 20
            });
            productOptions.value = data.list;
        } finally { productLoading.value = false; }
    }
};

const remoteSearchSubject = async (query) => {
    if (query) {
        subjectLoading.value = true;
        try {
            const res = await SubjectApi.getSubjectPage({ name: query, pageSize: 20 });
            subjectOptions.value = res.list;
        } catch (e) {
            console.error(e);
        } finally { subjectLoading.value = false; }
    }
};

const handleSubjectSelect = (item) => {
    formState.selectedSubject = item;
    formData.subjectName = item.name;
    // 回显产地/地区信息
    if (item.provinceCode) {
        formData.detectionArea = `${item.provinceCode}${item.cityCode ? '-' + item.cityCode : ''}${item.districtCode ? '-' + item.districtCode : ''}`;

        // 核心修复：仅当用户尚未手动选择产地时，才自动同步主体的地址作为产地
        if (!formData.sample.productionArea || formData.sample.productionArea === '--') {
            formData.sample.productionArea = formData.detectionArea;
            // 更新级联组件的状态，实现 UI 同步
            formState.origin = [item.provinceCode, item.cityCode, item.districtCode].filter(Boolean);
        }
    }
};

/**
 * 远程搜索任务
 */
const remoteSearchTask = async (query) => {
    if (query) {
        taskLoading.value = true;
        try {
            const data = await DetectionTaskApi.getDetectionTaskPage({ taskName: query, pageSize: 20 });
            taskOptions.value = data.list;
        } finally { taskLoading.value = false; }
    }
};

const handleProductChange = async (val) => {
    const p = productOptions.value.find(item => item.id === val);
    if (p) {
        formData.sample.sampleName = p.productName;
        formData.sample.productionArea = p.productionArea;
        formData.detectStandard = p.standard || '';

        // 回显数量（重量）
        if (p.productSpec) {
            formData.sample.sampleQuantity = Number(p.productSpec);
        }
        // 回显单位
        if (p.productUnit) {
            formState.quantityUnit = p.productUnit;
        }
        // // 回显来源环节
        // if (p.category) {
        //     formData.sample.sampleSource = p.category;
        // }
        // 产地级联回显：优先使用结构化字段
        if (p.provinceCode || p.cityCode || p.districtCode) {
            formState.origin = [p.provinceCode, p.cityCode, p.districtCode].filter(Boolean);
            formData.sample.productionArea = formState.origin.join('-');
        } else if (p.productionArea) {
            // 兜底策略：如果只有拼接字符串，尝试按 '-' 分隔（如果数据格式支持）
            formState.origin = p.productionArea.includes('-') ? p.productionArea.split('-') : [p.productionArea];
        }

        // 核心：回显生产经营主体
        if (p.subjectId) {
            try {
                const subject = await SubjectApi.getSubject(p.subjectId);
                handleSubjectSelect(subject);
            } catch (e) {
                console.error('回显主体失败', e);
            }
        }
    }
};

const handleAreaSelect = (area) => {
    formData.sample.productionArea = `${area.province}-${area.city}-${area.district}`;
    formData.detectionArea = formData.sample.productionArea;
    console.log(formData.sample.productionArea)
};

/**
 * 获取提交给接口的数据（处理多选的样品来源为字符串）
 */
const getSubmitData = () => {
    const submitData = JSON.parse(JSON.stringify(formData));
    if (Array.isArray(submitData.sample.sampleSource)) {
        submitData.sample.sampleSource = submitData.sample.sampleSource.join(',');
    }
    // 写入整体判定结论 (0-阴性/合格, 1-阳性/不合格, 2-结果异常)
    submitData.overallResult = overallStatusValue.value === '异常' ? 2 : (overallStatusValue.value === '阳性' ? 1 : 0);
    return submitData;
};

const goToStep = (step) => {
    if (step < currentStep.value) currentStep.value = step;
};

const handleCancel = () => { router.back(); };

const handlePrev = () => { if (currentStep.value > 1) currentStep.value--; };

const handlePrint = () => {
    if (reportRef.value) {
        reportRef.value.handleDownload();
    }
};

const handleResetForm = () => { window.location.reload(); };

const handleNext = async () => {
    if (currentStep.value === 1) {
        // 第一步校验：基础信息
        formRef.value.validate(async (valid) => {
            if (valid) {
                // 额外校验产品关联
                if (formState.linkProduct && !formData.sample.productId) {
                    ElMessage.warning('请选择关联的产品档案');
                    return;
                }
                // 没有产品关联，实现产品静默创建 (复检不需要创建产品)
                if (!formState.linkProduct && !formData.sample.productId && !isRecheck.value && !formData.id) {
                    try {

                        const productData = {
                            productName: formData.sample.sampleName,
                            productCode: 'PRD' + new Date().getTime(),
                            subjectId: formState.selectedSubject?.id,
                            category: formState.productCategory || '其他',
                            productionArea: formData.sample.productionArea,
                            productSpec: String(formData.sample.sampleQuantity || ''),
                            productUnit: formState.quantityUnit,
                            status: 1
                        };
                        const newProductId = await ProductApi.createProduct(productData);
                        formData.sample.productId = newProductId;
                        // ElMessage.success('产品档案已自动同步创建');
                    } catch (e) {
                        console.error('产品创建失败', e);
                        ElMessage.warning('产品档案同步失败，将继续检测任务');
                        return false;
                    }
                }
                submitting.value = true;
                try {
                    const submitData = getSubmitData();
                    if (formData.id) {
                        await DetectionRecordApi.updateDetectionRecord(submitData);
                        ElMessage.success('数据已成功保存');
                    } else {
                        const res = await DetectionRecordApi.createDetectionRecord(submitData);
                        formData.id = res;
                        inspectionRecordId.value = res;
                        formData.inspectionRecordId = res;
                    }

                    // 自动初始化 Step 2 的环境信息
                    if (!formData.detectionOrgName) formData.detectionOrgName = userStore.user.deptName;
                    if (!formData.detector) formData.detector = userStore.user.nickname;
                    if (!formData.detectionArea) formData.detectionArea = formData.sample.productionArea;
                    if (!formData.detectionDate) formData.detectionDate = new Date().toISOString();

                    currentStep.value++;
                } catch (e) {
                    console.error('预存失败', e);
                    ElMessage.error('样本信息预存失败，请检查网络');
                } finally {
                    submitting.value = false;
                }
            } else {
                ElMessage.warning('请填写必填项');
            }
        });
    } else if (currentStep.value === 2) {
        // 第二步校验：试纸照片
        if (formData.aiRecognitionResult === undefined || !formData.aiRecognitionResult) {
            ElMessage.warning('请先上传试纸照片并完成 AI 识别');
            return;
        }

        submitting.value = true;
        try {
            if (isRecheck.value) {
                // 如果是复检，调用 /recheck 接口
                const submitData = getSubmitData();
                await DetectionRecordApi.recheckDetectionRecord(submitData);
            } else {
                await DetectionRecordApi.updateDetectionRecord(getSubmitData());
            }
            ElMessage.success('数据已成功保存');
            currentStep.value++;
        } catch (e) {
            console.error('更新失败', e);
            ElMessage.error('更新失败，请稍后重试');
        } finally {
            submitting.value = false;
        }
    } else if (currentStep.value === 3) {
        // 第三步：先保存备注信息，再生成并预览报告
        submitting.value = true;
        try {
            // 提交最新的备注数据 (仅当内容发生变化时)
            if (formData.id && formData.remarks !== lastSavedRemarks.value) {
                await DetectionRecordApi.updateDetectionRecordRemarks({
                    id: formData.id,
                    remarks: formData.remarks
                });
                lastSavedRemarks.value = formData.remarks;
            }

            // 一键生成检测报告
            const reportId = await DetectionReportApi.generateReport({ recordId: formData.id });
            if (reportId) {
                // 回显生成的报告内容
                const reportDetail = await DetectionReportApi.getDetectionReport(reportId);
                reportInfo.value = reportDetail;
                // 更新显示中的报告编号
                if (reportDetail.reportCode) {
                    formData.recordCode = reportDetail.reportCode;
                }
            }
            currentStep.value++;
        } catch (e) {
            console.error('更新或报告生成失败', e);
            ElMessage.error('当前结果保存或报告生成异常，请检查网络');
        } finally {
            submitting.value = false;
        }
    } else {
        currentStep.value++;
    }
};

const handleFileChange = (file) => {
    formState.rawFile = file.raw;
    formState.tempFileUrl = URL.createObjectURL(file.raw);
    // 这里也可以选择自动触发一次 AI 识别
};

const handleAiDetect = async () => {
    if (!formState.rawFile) return;

    aiLoading.value = true;
    try {
        const res = await AiDetectionApi.detectImage(formData.sample.sampleName || '未知样品', formState.rawFile);
        // aiRecognitionResult 入
        // 处理结果回显
        if (res && res.results && res.results.length > 0) {
            formState.aiDetailResults = res.results;
            const first = res.results[0];

            // 1. 将完整的 res 存为 JSON 字符串，作为核心入参写入 aiRecognitionResult
            formData.aiRecognitionResult = JSON.stringify(res);

            // 2. 将易读的结论描述存入新加字段，用于页面回显展示
            formData.aiRecognitionResultText = `分析完成。共检测到 ${res.results.length} 项，主项 [${first.codeName}] 结论为: ${first.status}`;

            // 如果某项通过 OCR 识别结果，可以额外回显 (不改变现有结果)
            if (first.codeName && !formData.detectStandard) {
                // 这里视具体业务对应，比如码名可能是标准名的一部分
            }
        }
        ElMessage.success('AI 检测识别完成');
    } catch (e) {
        console.error('AI 检测失败', e);
        ElMessage.error('AI 检测失败，请重试');
    } finally {
        aiLoading.value = false;
    }
};

const handleSave = async () => {
    submitting.value = true;
    try {
        if (formData.id) {
            await DetectionRecordApi.updateDetectionRecordRemarks({
                id: formData.id,
                remarks: formData.remarks
            });
            lastSavedRemarks.value = formData.remarks;
            ElMessage.success('备注已成功更新');
        } else {
            ElMessage.error('记录尚未生成主键，请先进行 AI 识别');
        }
    } catch (error) {
        console.error('保存失败', error);
        ElMessage.error('保存失败，请稍后重试');
    } finally {
        submitting.value = false;
    }
};

const handleSubmit = async () => {
    submitting.value = true;
    try {
        const submitData = getSubmitData();

        // 由于第一步已经走了一次 create，后续流程均应走 update
        if (formData.id) {
            if (route.query.action == 'recheck') {
                // 如果是复检，调用 /recheck 接口
                const submitData = getSubmitData();
                await DetectionRecordApi.recheckDetectionRecord(submitData);
            } else {
                await DetectionRecordApi.updateDetectionRecord(submitData);
            }
        } else {
            await DetectionRecordApi.createDetectionRecord(submitData);
        }
        ElMessage.success('检测记录已成功存档');
        router.push('/rapidDetection/self');
    } catch (error) {
        console.error('提交失败', error);
        ElMessage.error('提交存档失败，请重试');
    } finally {
        submitting.value = false;
    }
};

const handleCreateSubject = () => {
    subjectDrawerVisible.value = true;
};

const handleSubjectSuccess = (id) => {
    ElMessage.success('主体建档成功');
    // 如果后续需要根据新主体创建任务或直接关联，可以在此扩展逻辑
    remoteSearchTask(''); // 尝试刷新任务列表
};

onMounted(async () => {
    // 预加载
    const [pData, sData] = await Promise.all([
        ProductApi.getProductPage({ pageSize: 10 }),
        SubjectApi.getSubjectPage({ pageSize: 10 })
    ]);
    productOptions.value = pData.list;
    subjectOptions.value = sData.list;

    initDeptInfo();

    const action = route.query.action;
    const id = route.query.id;
    if ((action === 'recheck' || action === 'detect') && id) {
        if (action === 'recheck') isRecheck.value = true;
        currentStep.value = 2; // 继续检测或复检直接进入第二步
        try {
            const record = await DetectionRecordApi.getDetectionRecord(Number(id));
            if (record) {
                // 基础骨架回填
                formData.id = record.id;
                formData.recordCode = record.recordCode;
                formData.inspectionRecordId = record.inspectionRecordId;

                // 样品信息回填 (Step 1的内容)
                formData.sample = {
                    ...formData.sample,
                    id: record.sampleId,
                    sampleCode: record.sampleCode || record.recordCode || formData.sample.sampleCode,
                    sampleName: record.sampleName || record.productName || '',
                    sampleSource: (record.sampleSource || record.samplingLocation) ? (record.sampleSource || record.samplingLocation).split(',') : [],
                    productionArea: record.productionArea || record.detectionArea || '',
                    sampleQuantity: record.sampleQuantity,
                    productId: record.productId
                };

                // 主体信息回填
                formData.subjectName = record.subjectName;
                formState.selectedSubject = { name: record.subjectName };
                // 尝试补全详细的主体信息
                if (record.subjectId || record.subjectName) {
                    try {
                        const sList = await SubjectApi.getSubjectPage({ name: record.subjectName, pageSize: 1 });
                        if (sList.list && sList.list.length > 0) {
                            formState.selectedSubject = sList.list[0];
                        }
                    } catch (e) {
                        console.warn('获取主体详情失败，仅使用基本名称', e);
                    }
                }

                // 环境检测信息初始化 (Step 2)
                formData.detectionOrgName = userStore.user.deptName || record.detectionOrgName;
                formData.detector = userStore.user.nickname || record.detector;
                formData.detectionDate = action === 'recheck' ? formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') : (record.detectionDate || formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'));

                if (record.detectionArea) formData.detectionArea = record.detectionArea;
                if (record.detectionLocation) formData.detectionLocation = record.detectionLocation;
                if (record.detectStandard) formData.detectStandard = record.detectStandard;
                formData.remarks = record.remarks || '';
                lastSavedRemarks.value = formData.remarks;
            }
        } catch (e) {
            console.error('获取原检测数据失败', e);
            ElMessage.error('无法读取原检测记录，请返回重试');
        }
    }
});
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 86px) !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.header-fixed-container {
    flex-shrink: 0;
}

/* 头部卡片风格保持 */
.header-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .blue-line {
        width: 4px;
        height: 16px;
        background: #00B3ED;
        border-radius: 2px;
    }

    .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}

.header-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
    padding-left: 12px;
}

.content-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.steps-wrapper {
    display: flex;
    gap: 0;
    margin-bottom: 40px;

    .step-item {
        padding: 12px 32px;
        background: #E5E7EB;
        color: #666;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;

        &:first-child {
            border-radius: 4px 0 0 4px;
        }

        &:last-child {
            border-radius: 0 4px 4px 0;
        }

        &.active {
            background: #00B3ED;
            color: #fff;
        }

        &.done {
            background: #b3e5f5;
            color: #00B3ED;
        }

        .step-num {
            font-weight: 600;
        }
    }
}

.step-content {
    max-width: 800px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #00B3ED;
    margin: 0 0 24px 0;
}

.sample-info-form {
    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        display: inline-flex;
        align-items: center;
        font-weight: 600;
        color: #333;
        font-size: 14px;
        padding-bottom: 8px;
        white-space: nowrap;

        // 自定义星号样式
        &::before {
            content: '*' !important;
            color: #f56c6c !important;
            margin-right: 4px !important;
            font-size: 14px !important;
        }
    }

    :deep(.el-select__wrapper) {
        border-radius: 6px;
        height: 44px;
    }

    :deep(.el-form-item__content) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
}

.full-width {
    width: 100% !important;
}

.inline-radio-input {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.scan-input-group {
    display: flex;
    gap: 8px;
    flex: 1;
    min-width: 450px;

    .scan-btn {
        height: 44px;
        width: 44px;
        padding: 0;
        background: #00B3ED;
        border-color: #00B3ED;
    }
}

.compound-input {
    display: flex;
    gap: 12px;
    align-items: center;

    :deep(.el-input-number) {
        height: 44px !important;
        width: 100%;
        flex: 1;

        &.is-controls-right {
            .el-input-number__increase {
                height: 22px !important; // 44/2
                top: 0 !important;
                border-bottom: 1px solid #DCDFE6;
                border-left: 1px solid #DCDFE6;
                border-radius: 0 6px 0 0;
                background: #F9FAFB;
            }

            .el-input-number__decrease {
                height: 22px !important; // 44/2
                bottom: 0 !important;
                border-left: 1px solid #DCDFE6;
                border-radius: 0 0 6px 0;
                background: #F9FAFB;
            }
        }

        .el-input__wrapper {
            height: 44px !important;
            padding-right: 48px !important;
            box-sizing: border-box;
            background: #fff;
            border-radius: 6px;
        }
    }

    :deep(.el-select__wrapper) {
        height: 44px !important;
    }
}

.field-tip {
    font-size: 12px;
    color: #999;
    margin: 0 0 4px 0;
}

.public-notice {
    display: flex;
    gap: 12px;
    background: #FFF8DC;
    border: 1px solid #FFD700;
    border-radius: 8px;
    padding: 16px;
    margin-top: 12px;
    width: 100%;

    .notice-icon {
        width: 24px;
        height: 24px;
        background: #FFD700;
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        flex-shrink: 0;
    }

    .notice-content {
        p {
            margin: 0;
            font-size: 13px;
            color: #666;
            line-height: 1.6;
        }

        .notice-value {
            margin-top: 4px;
            font-weight: 600;
            color: #333;
        }
    }
}

.subject-search-wrapper {
    width: 100%;

    .search-input-group {
        display: flex;
        gap: 12px;
        align-items: center;

        .subject-select {
            flex: 1;

            :deep(.el-select__wrapper) {
                height: 48px;
                border-radius: 8px;
            }
        }

        .add-subject-btn {
            height: 48px;
            padding: 0 24px;
            font-size: 16px;
            border-radius: 8px;
            background: #00B3ED;
            border-color: #00B3ED;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.3s;

            &:hover {
                opacity: 0.9;
                background: #00A3D9;
            }

            &:active {
                transform: scale(0.98);
            }
        }
    }

    .subject-tip {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: #f56c6c;
    }

    .subject-detail-card {
        margin-top: 16px;
        background: #F8FAFD;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 24px;

        .card-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;

            .title-icon {
                color: #00B3ED;
                font-size: 20px;
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
}

.ai-info-form {
    max-width: 800px;
    margin: 0 auto;

    .with-desc {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;

        .field-desc-red {
            font-size: 13px;
            color: #f56c6c;
            margin-top: 2px;
        }
    }

    .upload-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
        padding: 30px;
        background: #fdfdfd;
        border: 1px dashed #dcdfe6;
        border-radius: 12px;
        width: 100%;

        .ai-uploader {
            width: 100%;

            :deep(.el-upload) {
                width: 100%;
            }

            :deep(.el-upload-dragger) {
                width: 100%;
                max-width: 200px;
                min-height: 100px;
                height: auto;
                display: flex;
                margin: 0 auto;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border-radius: 12px;
                background: #f8fafc;
                padding: 0;
                overflow: hidden;
            }
        }

        .preview-img {
            width: 100%;
            height: 100%;
            max-height: 480px;
            object-fit: contain;
            display: block;
            border-radius: 8px;
        }

        .upload-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #64748b;

            .el-icon--upload {
                font-size: 48px;
                color: #00B3ED;
                margin-bottom: 12px;
            }

            .el-upload__text em {
                color: #00B3ED;
                font-style: normal;
                font-weight: 600;
            }
        }
    }
}

.ai-result-panel {
    margin-top: 30px;
    padding: 24px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
    color: #166534;
}

.result-summary-container {
    padding: 0 20px 40px;

    .summary-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
    }

    .result-stamp {
        width: 100px;
        height: 100px;
        border: 3px double #f56c6c;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 800;
        color: #f56c6c;
        transform: rotate(-15deg);
        position: absolute;
        right: 0;
        top: -10px;
        opacity: 0.8;
        background: rgba(245, 108, 108, 0.05);

        &.合格 {
            border-color: #67c23a;
            color: #67c23a;
            background: rgba(103, 194, 58, 0.05);
        }
    }

    .info-list {
        display: grid;
        grid-template-columns: 1fr;
        border-top: 1px solid #E5E7EB;
        margin-bottom: 30px;

        .info-item {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #F3F4F6;
            font-size: 15px;

            .label {
                width: 120px;
                color: #6B7280;
                flex-shrink: 0;
            }

            .value {
                color: #111827;
                font-weight: 500;

                &.text-red {
                    color: #ef4444;
                }

                &.text-green {
                    color: #10b981;
                }
            }
        }
    }

    .sub-title {
        margin-top: 40px;
        margin-bottom: 20px;
    }

    .result-table {
        margin-bottom: 30px;
        border-radius: 8px;
        overflow: hidden;

        :deep(th) {
            background-color: #F9FAFB !important;
            color: #374151;
            font-weight: 600;
        }

        .text-red {
            color: #ef4444;
            font-weight: 600;
        }

        .text-green {
            color: #10b981;
            font-weight: 600;
        }
    }

    .result-image-box {
        margin-bottom: 40px;
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        display: flex;

        .result-img {
            max-width: 300px;
            max-height: 400px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
    }

    .remarks-section {
        margin-top: 40px;

        .section-label {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 16px;
            color: #1f2937;
        }

        .remarks-tip {
            margin-top: 8px;
            font-size: 13px;
            color: #9CA3AF;
        }
    }

    .save-action {
        margin-top: 40px;
        display: flex;
        justify-content: flex-end;

        .el-button {
            width: 120px;
            height: 48px;
            font-size: 16px;
            border-radius: 8px;
        }
    }
}

.report-paper {
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 15mm;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    position: relative;
    color: #333;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    border-radius: 4px;

    .report-header {
        text-align: center;
        margin-bottom: 60px;

        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #000;
            margin: 0;
            letter-spacing: 2px;
        }

        .sub-title {
            font-size: 32px;
            font-weight: 700;
            color: #000;
            margin-top: 5px;
            font-family: "Arial", sans-serif;
        }
    }

    .cover-info {
        margin-bottom: 40px;
        padding-left: 60px;

        .top-fields {
            margin-bottom: 30px;

            p {
                margin: 10px 0;
                font-size: 16px;
                color: #333;
            }
        }

        .org-container {
            text-align: center;

            .org-line {
                font-size: 18px;
                font-weight: 500;
                padding: 0 10px 8px;
                border-bottom: 1.5px solid #333;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                min-width: 320px;
                justify-content: center;

                .edit-icon {
                    font-size: 18px;
                    color: #666;
                }
            }
        }
    }

    .report-main-table {
        position: relative;
        padding-top: 20px;

        .result-stamp {
            width: 100px;
            height: 100px;
            border: 3px double #f56c6c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 800;
            color: #f56c6c;
            transform: rotate(-20deg);
            position: absolute;
            right: 40px;
            top: -10px;
            background: rgba(255, 255, 255, 0.9);
            z-index: 10;
            letter-spacing: 2px;

            &.合格 {
                border-color: #67c23a;
                color: #67c23a;
            }
        }

        .field-list-grid {
            border-top: 1.5px solid #eee;

            .f-row {
                display: flex;
                border-bottom: 1.5px solid #eee;
                font-size: 15px;
                min-height: 44px;
                align-items: center;

                .f-label {
                    width: 140px;
                    padding: 10px 15px;
                    color: #333;
                    font-weight: 500;
                }

                .f-value {
                    flex: 1;
                    padding: 10px 15px;
                    color: #333;
                }

                .text-red {
                    color: #f56c6c;
                    font-weight: bold;
                }

                .text-green {
                    color: #67c23a;
                    font-weight: bold;
                }
            }
        }

        .table-caption {
            display: flex;
            width: 120px;
            margin: 30px 0 15px 0;
            font-size: 18px;
            font-weight: 700;
            color: #000;
        }

        .native-report-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #eee;

            th,
            td {
                border: 1.5px solid #eee;
                padding: 12px 8px;
                text-align: center;
                font-size: 14px;
                color: #333;
            }

            th {
                background: #fff;
                font-weight: 700;
                color: #000;
            }

            .text-red {
                color: #f56c6c;
                font-weight: bold;
            }

            .text-green {
                color: #67c23a;
                font-weight: bold;
            }
        }
    }
}

.footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px dashed #D1D5DB;

    .el-button {
        min-width: 100px;
        height: 44px;
        border-radius: 8px;
    }

    .btn-next {
        background: #00B3ED;
        border-color: #00B3ED;
    }
}
</style>
