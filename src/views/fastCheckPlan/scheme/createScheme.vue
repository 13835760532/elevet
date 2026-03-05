<template>
    <div class="page-container">
        <pageHeader :title="isEdit ? '编辑检测方案' : '创建检测方案'" desc="配置新的农产品检测项目，包括项目名称、检测品种、时间要求及下发权限" />

        <!-- 表单内容 -->
        <div class="content-card">
            <div class="card-header">
                <span class="header-title">方案基本信息</span>
                <div class="dashed-line"></div>
            </div>

            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px" class="scheme-form"
                v-loading="formLoading">

                <el-form-item label="方案名称" prop="planName">
                    <el-input v-model="formData.planName" placeholder="请输入方案名称" />
                </el-form-item>

                <el-form-item label="方案编号" prop="planCode">
                    <el-input v-model="formData.planCode" placeholder="系统自动生成" :disabled="true" />
                </el-form-item>

                <el-form-item label="下发部门" prop="issuerDeptId">
                    <el-select v-model="formData.issuerDeptId" placeholder="请选择下发部门" class="full-width" filterable>
                        <el-option label="北京市农业农村局" :value="1" />
                        <el-option label="农业农村部农产品质量安全监管司" :value="2" />
                        <el-option label="天津市农业农村委员会" :value="3" />
                    </el-select>
                </el-form-item>

                <el-form-item label="方案类型" prop="planType">
                    <el-select v-model="formData.planType" placeholder="请选择方案类型" class="full-width">
                        <el-option v-for="dict in planTypeOptions" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="方案周期" prop="planPeriodType">
                    <div class="purpose-selects">
                        <el-select v-model="formData.planPeriodType" placeholder="选择周期类型">
                            <el-option label="年度" :value="1" />
                            <el-option label="月度" :value="2" />
                            <el-option label="周度" :value="3" />
                        </el-select>
                        <el-select v-model="formData.planPeriodYear" placeholder="年份">
                            <el-option label="2026" :value="2026" />
                            <el-option label="2025" :value="2025" />
                            <el-option label="2024" :value="2024" />
                        </el-select>
                        <el-select v-model="formData.planPeriodMonth" placeholder="月份"
                            v-if="formData.planPeriodType === 2 || formData.planPeriodType === 3">
                            <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
                        </el-select>
                        <el-select v-model="formData.planPeriodWeek" placeholder="周次" v-if="formData.planPeriodType === 3">
                            <el-option v-for="w in 53" :key="w" :label="`第${w}周`" :value="w" />
                        </el-select>
                    </div>
                </el-form-item>

                <el-form-item label="目标区域" prop="targetArea">
                    <div class="region-input-group">
                        <el-input v-model="formData.targetArea" placeholder="输入目标区域，如：北京、天津" />
                        <el-button type="primary" circle class="add-btn">
                            <el-icon size="14">
                                <Plus />
                            </el-icon>
                        </el-button>
                    </div>
                    <p class="field-hint">例如：北京、上海、广州、南京等</p>
                </el-form-item>

                <el-form-item label="执行时间" prop="planStartDate">
                    <div class="date-range-group">
                        <el-date-picker v-model="formData.planStartDate" type="date" placeholder="开始日期"
                            class="date-picker" value-format="YYYY-MM-DD" />
                        <span class="date-separator">至</span>
                        <el-date-picker v-model="formData.planEndDate" type="date" placeholder="结束日期" class="date-picker"
                            value-format="YYYY-MM-DD" />
                    </div>
                </el-form-item>

                <el-form-item label="目标品种" prop="targetCategory">
                    <el-input v-model="formData.targetCategory" placeholder="输入目标品种，如：蔬菜、水果" />
                </el-form-item>

                <el-form-item label="计划样品数量" prop="sampleCount">
                    <el-input v-model.number="formData.sampleCount" placeholder="请输入计划样品数量" type="number" />
                </el-form-item>

                <el-form-item label="检测项目" prop="detectionItems">
                    <el-input v-model="formData.detectionItems" placeholder="请输入检测项目（逗号分隔）" />
                </el-form-item>

                <el-form-item label="方案要求" prop="planRequirements">
                    <el-input v-model="formData.planRequirements" type="textarea" :rows="4"
                        placeholder="输入任务检测项目及要求，最多支持500字" maxlength="500" show-word-limit />
                </el-form-item>

                <el-form-item label="方案附件">
                    <el-upload class="upload-area" drag action="#" :auto-upload="false" :on-change="handleFileChange"
                        :show-file-list="false" accept=".docx,.pdf,.jpg,.jpeg,.png">
                        <el-icon class="upload-icon">
                            <UploadFilled />
                        </el-icon>
                        <div class="upload-text">点击或拖拽上传文件</div>
                        <div class="upload-tip" v-if="uploading">上传中...</div>
                    </el-upload>
                    <p class="field-hint">支持格式：.docx .pdf .jpg .jpeg .png，单文件最大 10MB，最多 5 个</p>
                    <!-- 已上传文件列表 -->
                    <div class="uploaded-file-list" v-if="fileList.length > 0">
                        <div v-for="(file, index) in fileList" :key="file.uid" class="uploaded-file-item"
                            :class="{ 'is-success': file.status === 'success', 'is-fail': file.status === 'fail', 'is-uploading': file.status === 'uploading' }">
                            <el-icon class="file-icon">
                                <Document />
                            </el-icon>
                            <span class="file-name">{{ file.name }}</span>
                            <span class="file-status" v-if="file.status === 'uploading'">上传中...</span>
                            <span class="file-status success" v-else-if="file.status === 'success'">已上传</span>
                            <span class="file-status fail" v-else-if="file.status === 'fail'">上传失败</span>
                            <el-icon class="file-remove" @click="handleFileRemove(index)">
                                <Close />
                            </el-icon>
                        </div>
                    </div>
                </el-form-item>

                <!-- 底部按钮 -->
                <div class="footer-actions">
                    <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
                    <el-button @click="handlePreview" class="btn-preview">方案预览</el-button>
                    <el-button type="primary" @click="handleSubmit" class="btn-submit" :loading="submitLoading">
                        {{ isEdit ? '保存修改' : '方案发布' }}
                    </el-button>
                </div>
            </el-form>
        </div>

        <!-- 方案预览弹窗 -->
        <el-dialog v-model="previewVisible" title="方案预览" width="800px" class="preview-dialog"
            :close-on-click-modal="false">
            <div class="preview-content">
                <div class="preview-header">
                    <div class="header-card-item scheme-name">
                        <div class="header-card-label"><span class="v-line"></span>方案名称</div>
                        <div class="header-card-value">{{ formData.planName || '未填写方案名称' }}</div>
                    </div>
                    <div class="header-card-item scheme-code">
                        <div class="header-card-label"><span class="v-line"></span>方案编号</div>
                        <div class="header-card-value">{{ formData.planCode || '系统自动生成' }}</div>
                    </div>
                </div>

                <div class="preview-section-box">
                    <div class="preview-section-title">
                        <span class="v-line"></span>基本信息
                        <div class="title-line"></div>
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="dot d1"></span>
                            <span class="label">下发部门：</span>
                            <span class="value">{{ getDeptLabel(formData.issuerDeptId) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d2"></span>
                            <span class="label">方案类型：</span>
                            <span class="value">{{ getPlanTypeLabel(formData.planType) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d3"></span>
                            <span class="label">方案周期：</span>
                            <span class="value">{{ getPeriodLabel() }}</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d4"></span>
                            <span class="label">执行时间：</span>
                            <span class="value">{{ getExecutionTime() }}</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d5"></span>
                            <span class="label">目标区域：</span>
                            <span class="value">{{ formData.targetArea || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d6"></span>
                            <span class="label">目标品种：</span>
                            <span class="value">{{ formData.targetCategory || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d7"></span>
                            <span class="label">计划样品数量：</span>
                            <span class="value">{{ formData.sampleCount || '0' }} 份</span>
                        </div>
                        <div class="info-item">
                            <span class="dot d8"></span>
                            <span class="label">检测项目：</span>
                            <span class="value">{{ formData.detectionItems || '--' }}</span>
                        </div>
                    </div>
                </div>

                <div v-if="formData.planRequirements" class="preview-section-box">
                    <div class="preview-section-title">
                        <span class="v-line"></span>方案要求
                        <div class="title-line"></div>
                    </div>
                    <div class="requirements-box">
                        {{ formData.planRequirements }}
                    </div>
                </div>

                <div v-if="fileList.length" class="preview-section-box">
                    <div class="preview-section-title">
                        <span class="v-line"></span>附件列表
                        <div class="title-line"></div>
                    </div>
                    <div class="attachments-preview">
                        <div v-for="(file, index) in fileList" :key="index" class="attachment-preview-item">
                            <el-icon><Document /></el-icon>
                            <span>{{ file.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="previewVisible = false">关闭</el-button>
                    <el-button type="primary" @click="handleSubmitFromPreview" :loading="submitLoading">确认发布</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Plus, UploadFilled, Document, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as DetectionPlanApi from '@/api/agri/detectionPlan'
import { useFileUpload } from '@/hooks/web/useFileUpload'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'

const router = useRouter();
const route = useRoute();
const formRef = ref(null);
const previewVisible = ref(false);
const formLoading = ref(false); // 表单加载状态
const submitLoading = ref(false); // 提交按钮加载状态

// 使用字典 hook 获取方案类型
const { options: planTypeOptions, getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE)

// 使用文件上传 hook
const {
  fileList,
  uploading,
  handleChange: handleFileChange,
  handleRemove: handleFileRemove,
  getAttachmentsJson,
  setAttachments
} = useFileUpload({
  directory: 'detection-plan',
  maxSize: 10,
  accept: ['.docx', '.pdf', '.jpg', '.jpeg', '.png'],
  maxCount: 5
})

// 判断是否为编辑模式
const isEdit = computed(() => !!route.query.id)

// 表单数据 - 对齐 DetectionPlanSaveReqVO 字段
const formData = reactive({
    id: undefined,
    planCode: '',
    planName: '',
    planType: undefined,
    planPeriodType: undefined,
    planPeriodYear: undefined,
    planPeriodMonth: undefined,
    planPeriodWeek: undefined,
    planStartDate: '',
    planEndDate: '',
    sampleCount: undefined,
    detectionItems: '',
    targetCategory: '',
    targetArea: '',
    planRequirements: '',
    planAttachments: '',
    issuerDeptId: undefined,
    status: undefined
});

// 表单校验规则
const formRules = {
    planName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
    issuerDeptId: [{ required: true, message: '请选择下发部门', trigger: 'change' }],
    planType: [{ required: true, message: '请选择方案类型', trigger: 'change' }],
    planPeriodType: [{ required: true, message: '请选择方案周期类型', trigger: 'change' }],
    targetArea: [{ required: true, message: '请输入目标区域', trigger: 'blur' }],
    targetCategory: [{ required: true, message: '请输入目标品种', trigger: 'blur' }],
    planStartDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }]
};



// 取消操作
const handleCancel = () => {
    router.back();
};

// 方案预览
const handlePreview = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            previewVisible.value = true;
        } else {
            ElMessage.warning('请填写必填项');
        }
    });
};

/** 组装提交数据 */
const buildSubmitData = () => {
    const data = { ...formData }
    // 通过 hook 获取已上传附件的 URL JSON
    const attachmentsJson = getAttachmentsJson()
    if (attachmentsJson) {
        data.planAttachments = attachmentsJson
    }
    // 移除空值字段，避免传 undefined
    Object.keys(data).forEach(key => {
        if (data[key] === undefined || data[key] === '') {
            delete data[key]
        }
    })
    return data
}

/** 提交方案 */
const handleSubmit = async () => {
    // 表单校验
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) {
        ElMessage.warning('请填写必填项');
        return
    }

    submitLoading.value = true
    try {
        const data = buildSubmitData()
        if (isEdit.value) {
            // 编辑模式 - 调用更新接口
            await DetectionPlanApi.updateDetectionPlan(data)
            ElMessage.success('方案修改成功')
        } else {
            // 新增模式 - 调用创建接口
            await DetectionPlanApi.createDetectionPlan(data)
            ElMessage.success('方案发布成功')
        }
        // 跳转回列表页
        router.push('/fastCheckPlan/scheme')
    } catch (error) {
        console.error('提交检测方案失败：', error)
    } finally {
        submitLoading.value = false
    }
};

// 从预览弹窗提交
const handleSubmitFromPreview = () => {
    previewVisible.value = false;
    handleSubmit();
};

/** 编辑模式：加载方案详情 */
const loadPlanDetail = async (id) => {
    formLoading.value = true
    try {
        const data = await DetectionPlanApi.getDetectionPlan(id)
        // 将返回数据填充到表单
        Object.keys(formData).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData[key] = data[key]
            }
        })
        // 通过 hook 回填附件
        if (data.planAttachments) {
            setAttachments(data.planAttachments)
        }
    } catch (error) {
        console.error('获取检测方案详情失败：', error)
        ElMessage.error('获取方案详情失败')
    } finally {
        formLoading.value = false
    }
}

// 标签显示辅助方法
const getDeptLabel = (value) => {
    const map = {
        1: '北京市农业农村局',
        2: '农业农村部农产品质量安全监管司',
        3: '天津市农业农村委员会'
    };
    return map[value] || '--';
};



const getPeriodLabel = () => {
    const typeMap = { 1: '年度', 2: '月度', 3: '周度' };
    const parts = [];
    if (formData.planPeriodType) parts.push(typeMap[formData.planPeriodType] || '');
    if (formData.planPeriodYear) parts.push(formData.planPeriodYear + '年');
    if (formData.planPeriodMonth) parts.push(formData.planPeriodMonth + '月');
    if (formData.planPeriodWeek) parts.push('第' + formData.planPeriodWeek + '周');
    return parts.join(' ') || '--';
};

const getExecutionTime = () => {
    if (formData.planStartDate && formData.planEndDate) {
        return `${formData.planStartDate} 至 ${formData.planEndDate}`;
    }
    return '--';
};

// 页面初始化
onMounted(() => {
    const id = route.query.id
    if (id) {
        // 编辑模式：加载方案详情
        loadPlanDetail(Number(id))
    }
})
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 12px;
    padding: var(--page-container-padding);
    margin-bottom: 24px;
}

.card-header {
    margin-bottom: 32px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
    }
}

.dashed-line {
    width: 100%;
    height: 1px;
    background-image: linear-gradient(to right, #e2e8f0 50%, rgba(255, 255, 255, 0) 0%);
    background-position: bottom;
    background-size: 10px 1px;
    background-repeat: repeat-x;
}

.mb32 { margin-bottom: 32px; }
.mt32 { margin-top: 32px; }

.scheme-form {
    max-width: 700px;
    margin-left: 0;

    :deep(.el-form-item) {
        margin-bottom: 24px;
        display: flex;
        align-items: center;

        .el-form-item__content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
    }

    :deep(.el-form-item__label) {
        font-weight: 600;
        color: #344155;
        padding-right: 20px;
        padding-bottom: 0;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        height: 40px;
        box-shadow: 0 0 0 1px #CBD5E1 inset;

        &.is-focus {
            box-shadow: 0 0 0 1px #00B3ED inset !important;
        }
    }

    :deep(.el-select),
    :deep(.el-date-editor) {
        width: 100% !important;
    }
}

.full-width {
    width: 100%;
}

.purpose-selects {
    display: flex;
    gap: 8px;
    width: 100%;

    :deep(.el-select) {
        flex: 1;
    }
}

.region-input-group {
    display: flex;
    gap: 12px;
    width: 100%;

    .el-input {
        flex: 1;
    }

    .add-btn {
        width: 40px !important;
        height: 40px !important;
        min-width: auto !important;
        background: #00B3ED;
        border-color: #00B3ED;
        padding: 0 !important;
    }
}

.date-range-group {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .date-picker {
        flex: 1;
    }

    .date-separator {
        color: #666;
        flex-shrink: 0;
    }
}

.upload-area {
    width: 100%;

    :deep(.el-upload-dragger) {
        padding: 30px 20px;
        border-radius: 4px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;

        &:hover {
            border-color: #00B3ED;
            background: #f0faff;
        }
    }

    .upload-icon {
        font-size: 32px;
        color: #94a3b8;
        margin-bottom: 8px;
    }

    .upload-text {
        font-size: 14px;
        color: #64748b;
    }
}

.field-hint {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 6px;
    margin-bottom: 0;
}

.uploaded-file-list {
    margin-top: 16px;
    width: 100%;
}

.uploaded-file-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 4px;
    margin-bottom: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s;

    &:hover {
        border-color: #00B3ED;
        background: #f0faff;
    }

    .file-icon {
        font-size: 16px;
        color: #94a3b8;
        margin-right: 10px;
    }

    .file-name {
        flex: 1;
        font-size: 14px;
        color: #334155;
    }

    .file-status {
        font-size: 12px;
        color: #94a3b8;
        margin-right: 12px;

        &.success {
            color: #52C41A;
        }

        &.fail {
            color: #F5222D;
        }
    }

    .file-remove {
        cursor: pointer;
        color: #94a3b8;
        font-size: 14px;

        &:hover {
            color: #F5222D;
        }
    }
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px dashed #e2e8f0;

    .el-button {
        min-width: 120px;
        height: 44px;
        border-radius: 4px;
        font-size: 14px;
    }

    .btn-cancel {
        background: #fff;
        border-color: #D1D5DB;
        color: #333;
    }

    .btn-preview {
        background: #fff;
        border-color: #00B3ED;
        color: #00B3ED;

        &:hover {
            background: rgba(0, 179, 237, 0.1);
        }
    }

    .btn-submit {
        background: #00B3ED;
        border-color: #00B3ED;
        color: #fff;
    }
}




.preview-content {
    padding: 0;
    margin-top: 12px;
    margin-bottom: 12px;
    background-color: #fcfdfe;
}

/* 首部卡片样式 */
.preview-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 24px;
}

.header-card-item {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid #eef2f6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    }

    .header-card-label {
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        font-weight: 500;

        .v-line {
            width: 3px;
            height: 12px;
            background: #00B3ED;
            margin-right: 8px;
            border-radius: 2px;
        }
    }

    .header-card-value {
        font-size: 16px;
        font-weight: 600;
        padding: 12px 16px;
        border-radius: 8px;
    }

    &.scheme-name {
        border-color: rgba(0, 179, 237, 0.1);
        .header-card-value {
            background: #f0faff;
            color: #0085B3;
            border: 1px solid rgba(0, 179, 237, 0.2);
        }
    }

    &.scheme-code {
        border-color: rgba(82, 196, 26, 0.1);
        .header-card-value {
            background: #f6ffed;
            color: #52C41A;
            border: 1px solid rgba(82, 196, 26, 0.2);
            font-family: 'Monaco', 'Consolas', monospace;
        }
    }
}

/* 区块通用样式 */
.preview-section-box {
    background: #fff;
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #eef2f6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

    &:last-child {
        margin-bottom: 0;
    }

    .preview-section-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        position: relative;

        .v-line {
            width: 4px;
            height: 16px;
            background: #00B3ED;
            margin-right: 10px;
            border-radius: 2px;
        }

        .title-line {
            flex: 1;
            height: 1px;
            background: #f0f0f0;
            margin-left: 16px;
        }
    }
}

/* 信息网格 */
.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    .info-item {
        display: flex;
        align-items: center;
        background: #f8fafc;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;

        &:hover {
            background: #f0f7ff;
            transform: translateX(4px);
        }

        .dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .label {
            color: #666;
            margin-right: 8px;
            min-width: 90px;
        }

        .value {
            color: #333;
            font-weight: 500;
            word-break: break-all;
        }

        /* 装饰点颜色 */
        .dot.d1 { background: #00B3ED; }
        .dot.d2 { background: #52C41A; }
        .dot.d3 { background: #F5A623; }
        .dot.d4 { background: #722ED1; }
        .dot.d5 { background: #EB2F96; }
        .dot.d6 { background: #13C2C2; }
        .dot.d7 { background: #FA541C; }
        .dot.d8 { background: #2F54EB; }
    }
}

/* 方案要求区块 */
.requirements-box {
    background: #fffbe6;
    border-left: 4px solid #F5A623;
    padding: 16px 20px;
    border-radius: 4px 8px 8px 4px;
    font-size: 14px;
    line-height: 1.6;
    color: #555;
    min-height: 80px;
}

/* 附件预览 */
.attachments-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .attachment-preview-item {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f0f7ff;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        color: #0085B3;
        border: 1px solid rgba(0, 179, 237, 0.2);

        .el-icon {
            font-size: 16px;
            color: #00B3ED;
        }
    }
}



.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
        height: 36px;
        padding: 0 24px;
        border-radius: 6px;
    }
}
</style>

<style lang="scss">
/* 全局样式块（用于覆盖 Teleport 到 body 下的弹窗样式） */
.preview-dialog.el-dialog {
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

    .el-dialog__header {
        margin: 0;
        padding: 12px !important; // 恢复适当的边距
        border-bottom: none;

        .el-dialog__title {
            color: #fff !important;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
        }

        .el-dialog__headerbtn {
            top: 20px;
            right: 20px;

            .el-dialog__close {
                color: #fff !important;
                font-size: 18px;
            }

            &:hover .el-dialog__close {
                color: #fff !important;
                opacity: 0.8;
            }
        }
    }

    .el-dialog__body {
        padding: 0;
        background: linear-gradient(180deg, #f0f7ff 0%, #f7f8fa 100%);
    }

    .el-dialog__footer {
        padding: 12px;
        background: #fff;
        border-top: 1px solid #eee;
    }
}
</style>
