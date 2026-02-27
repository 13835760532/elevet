<template>
    <div class="page-container">
        <PageBack />

        <!-- 头部标题 -->
        <div class="header-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">创建检测方案</h2>
            </div>
            <p class="header-desc">配置新的农产品检测项目，包括项目名称、检测品种、时间要求及下发权限</p>
        </div>

        <!-- 表单内容 -->
        <div class="content-card">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="scheme-form">
                <h3 class="section-title">方案基本信息</h3>

                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="方案名称*" prop="schemeName">
                            <el-input v-model="formData.schemeName" placeholder="2026年1月北京市、天津市蔬菜快速检测工作方案（用户可修订）" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="方案编号*" prop="schemeNo">
                            <el-input v-model="formData.schemeNo" placeholder="2026年1月北京市、天津市蔬菜快速检测工作方案（用户可修订）" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="主管单位*" prop="dept">
                            <el-select v-model="formData.dept" placeholder="请选择主管单位" class="full-width" filterable>
                                <el-option label="北京市农业农村局（可设当前用户单位名称，可选择其他审计机构单位）" value="1" />
                                <el-option label="农业农村部农产品质量安全监管司" value="2" />
                                <el-option label="天津市农业农村委员会" value="3" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="方案类型*" prop="schemeType">
                            <el-select v-model="formData.schemeType" placeholder="请选择方案类型" class="full-width">
                                <el-option label="快速检测" value="rapid" />
                                <el-option label="定量检测" value="quantitative" />
                                <el-option label="专项检测" value="special" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="方案周期*" prop="purpose">
                            <div class="purpose-selects">
                                <el-select v-model="formData.purposeType" placeholder="选择执行周期类型">
                                    <el-option label="年度" value="year" />
                                    <el-option label="季度" value="quarter" />
                                    <el-option label="月度" value="month" />
                                </el-select>
                                <el-select v-model="formData.purposeYear" placeholder="2026">
                                    <el-option label="2026" value="2026" />
                                    <el-option label="2025" value="2025" />
                                    <el-option label="2024" value="2024" />
                                </el-select>
                                <el-select v-model="formData.purposeMonth" placeholder="1月">
                                    <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
                                </el-select>
                                <el-select v-model="formData.purposeWeek" placeholder="第一周">
                                    <el-option label="第一周" value="1" />
                                    <el-option label="第二周" value="2" />
                                    <el-option label="第三周" value="3" />
                                    <el-option label="第四周" value="4" />
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="检测地区*" prop="region">
                            <div class="region-input-group">
                                <el-input v-model="formData.region" placeholder="选择区域后，可输入多个区域，每输入后，需要：北京、天津、天津" />
                                <el-button type="primary" circle class="add-btn">
                                    <el-icon size="14">
                                        <Plus />
                                    </el-icon>
                                </el-button>
                            </div>
                            <p class="field-hint">例如：北京、上海、广州、南京等</p>
                        </el-form-item>

                    </el-col>
                </el-row>

                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="执行时间*">
                            <div class="date-range-group">
                                <el-date-picker v-model="formData.startDate" type="date" placeholder="开始日期"
                                    class="date-picker" />
                                <span class="date-separator">至</span>
                                <el-date-picker v-model="formData.endDate" type="date" placeholder="结束日期"
                                    class="date-picker" />
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="农产品分类*" prop="category">
                            <el-select v-model="formData.category" placeholder="选择产品分类" class="full-width">
                                <el-option label="蔬菜" value="vegetable" />
                                <el-option label="水果" value="fruit" />
                                <el-option label="水产品" value="seafood" />
                                <el-option label="粮食" value="grain" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="方案检测总量" prop="totalQuantity">
                            <el-input v-model="formData.totalQuantity" placeholder="1000" type="number"
                                class="quantity-input" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="方案要求">
                            <el-input v-model="formData.requirements" type="textarea" :rows="4"
                                placeholder="输入任务检测项目及要求，最多支持500字" maxlength="500" show-word-limit />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="方案附件：">
                            <el-upload class="upload-area" drag action="#" :auto-upload="false"
                                :on-change="handleFileChange" accept=".docx,.pdf,.jpg,.jpeg,.png">
                                <el-icon class="upload-icon">
                                    <UploadFilled />
                                </el-icon>
                                <div class="upload-text">上传文件</div>
                            </el-upload>
                            <p class="field-hint">支持格式：.docx .pdf .jpg...</p>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 底部按钮 -->
                <div class="footer-actions">
                    <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
                    <el-button @click="handlePreview" class="btn-preview">方案预览</el-button>
                    <el-button type="primary" @click="handleSubmit" class="btn-submit">方案发布</el-button>
                </div>
            </el-form>
        </div>

        <!-- 方案预览弹窗 -->
        <el-dialog v-model="previewVisible" title="方案预览" width="800px" class="preview-dialog"
            :close-on-click-modal="false">
            <div class="preview-content">
                <div class="preview-header">
                    <div class="header-item">
                        <span class="header-label">方案名称</span>
                        <span class="header-value name">{{ formData.schemeName || '未填写方案名称' }}</span>
                    </div>
                    <div class="header-item">
                        <span class="header-label">方案编号</span>
                        <span class="header-value code">{{ formData.schemeNo || '--' }}</span>
                    </div>
                </div>

                <div class="preview-section">
                    <div class="section-label">基本信息</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">主管单位：</span>
                            <span class="value">{{ getDeptLabel(formData.dept) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">方案类型：</span>
                            <span class="value">{{ getSchemeTypeLabel(formData.schemeType) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">方案周期：</span>
                            <span class="value">{{ getPurposeLabel() }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">执行时间：</span>
                            <span class="value">{{ getExecutionTime() }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测地区：</span>
                            <span class="value">{{ formData.region || '--' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">农产品分类：</span>
                            <span class="value">{{ getCategoryLabel(formData.category) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测总量：</span>
                            <span class="value">{{ formData.totalQuantity || '--' }} 份</span>
                        </div>
                    </div>
                </div>

                <div v-if="formData.requirements" class="preview-section">
                    <div class="section-label">方案要求</div>
                    <div class="requirements-text">{{ formData.requirements }}</div>
                </div>

                <div v-if="formData.attachments.length" class="preview-section">
                    <div class="section-label">附件列表</div>
                    <div class="attachments-list">
                        <div v-for="(file, index) in formData.attachments" :key="index" class="attachment-item">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span>{{ file.name }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="previewVisible = false">关闭</el-button>
                    <el-button type="primary" @click="handleSubmitFromPreview">确认发布</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, UploadFilled, Document } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const formRef = ref(null);
const previewVisible = ref(false);

const formData = reactive({
    schemeName: '',
    schemeNo: '',
    dept: '',
    schemeType: '',
    purposeType: '',
    purposeYear: '',
    purposeMonth: '',
    purposeWeek: '',
    startDate: '',
    endDate: '',
    region: '',
    category: '',
    totalQuantity: '',
    requirements: '',
    attachments: []
});

const formRules = {
    schemeName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
    schemeNo: [{ required: true, message: '请输入方案编号', trigger: 'blur' }],
    dept: [{ required: true, message: '请选择主管单位', trigger: 'change' }],
    schemeType: [{ required: true, message: '请选择方案类型', trigger: 'change' }],
    region: [{ required: true, message: '请输入检测地区', trigger: 'blur' }],
    category: [{ required: true, message: '请选择农产品分类', trigger: 'change' }]
};

const handleFileChange = (file) => {
    formData.attachments.push(file);
    ElMessage.success(`已添加文件: ${file.name}`);
};

const handleCancel = () => {
    router.back();
};

const handlePreview = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            previewVisible.value = true;
        } else {
            ElMessage.warning('请填写必填项');
        }
    });
};

const handleSubmit = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            ElMessage.success('方案发布成功');
            setTimeout(() => {
                router.push('/fastCheckPlan/scheme');
            }, 1500);
        } else {
            ElMessage.warning('请填写必填项');
        }
    });
};

const handleSubmitFromPreview = () => {
    previewVisible.value = false;
    handleSubmit();
};

// 获取标签显示文本
const getDeptLabel = (value) => {
    const map = {
        '1': '北京市农业农村局',
        '2': '农业农村部农产品质量安全监管司',
        '3': '天津市农业农村委员会'
    };
    return map[value] || '--';
};

const getSchemeTypeLabel = (value) => {
    const map = {
        'rapid': '快速检测',
        'quantitative': '定量检测',
        'special': '专项检测'
    };
    return map[value] || '--';
};

const getCategoryLabel = (value) => {
    const map = {
        'vegetable': '蔬菜',
        'fruit': '水果',
        'seafood': '水产品',
        'grain': '粮食'
    };
    return map[value] || '--';
};

const getPurposeLabel = () => {
    const typeMap = { 'year': '年度', 'quarter': '季度', 'month': '月度' };
    const parts = [];
    if (formData.purposeType) parts.push(typeMap[formData.purposeType] || '');
    if (formData.purposeYear) parts.push(formData.purposeYear + '年');
    if (formData.purposeMonth) parts.push(formData.purposeMonth + '月');
    if (formData.purposeWeek) parts.push('第' + formData.purposeWeek + '周');
    return parts.join(' ') || '--';
};

const getExecutionTime = () => {
    if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate).toLocaleDateString('zh-CN');
        const end = new Date(formData.endDate).toLocaleDateString('zh-CN');
        return `${start} 至 ${end}`;
    }
    return '--';
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 头部卡片 */
.header-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}


.header-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
    padding-left: 12px;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
    flex: 1;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 24px 0;
}

/* 表单样式 */
.scheme-form {
    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #333;
        font-size: 14px;
        padding-bottom: 8px;
    }
}

.full-width {
    width: 100%;
}

/* 方案用途选择器组 */
.purpose-selects {
    display: flex;
    gap: 12px;

    .el-select {
        width: 100px;
        flex: 1;
    }
}

/* 日期范围组 */
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
        font-size: 14px;
    }
}

/* 地区输入组 */
.region-input-group {
    display: flex;
    align-items: center;
    gap: 6px;

    .el-input {
        flex: 1;
    }

    .add-btn {
        width: 24px !important;
        height: 24px !important;
        min-width: auto !important;
        padding: 0 !important;
        background: #00B3ED;
        border-color: #00B3ED;
    }
}

.field-hint {
    font-size: 12px;
    color: #999;
    margin: 8px 0 0 6px;
}

/* 数量输入框 */
.quantity-input {
    max-width: 400px;
}

/* 上传区域 */
.upload-area {
    width: 100%;

    :deep(.el-upload-dragger) {
        border: 2px dashed #D1D5DB;
        border-radius: 12px;
        background: #F9FAFB;
        padding: 40px 20px;
        transition: all 0.3s;

        &:hover {
            border-color: #00B3ED;
            background: rgba(0, 179, 237, 0.05);
        }
    }

    :deep(.el-upload) {
        width: 100%;
    }
}

.upload-icon {
    font-size: 48px;
    color: #00B3ED;
    margin-bottom: 12px;
}

.upload-text {
    font-size: 14px;
    color: #666;
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px dashed #D1D5DB;

    .el-button {
        min-width: 120px;
        height: 44px;
        border-radius: 8px;
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
    }
}

/* 预览弹窗样式 */
.preview-dialog {
    :deep(.el-dialog) {
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    :deep(.el-dialog__header) {
        background: linear-gradient(135deg, #00B3ED 0%, #0085B3 100%);
        padding: 20px 24px;
        margin: 0;

        .el-dialog__title {
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            letter-spacing: 1px;
        }

        .el-dialog__headerbtn {
            top: 20px;
            right: 20px;

            .el-dialog__close {
                color: #fff;
                font-size: 18px;
            }
        }
    }

    :deep(.el-dialog__body) {
        padding: 0;
        background: linear-gradient(180deg, #f0f7ff 0%, #f7f8fa 100%);
    }

    :deep(.el-dialog__footer) {
        padding: 16px 24px;
        background: #fff;
        border-top: 1px solid #eee;
    }
}

.preview-content {
    padding: 16px;
}

.preview-header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 16px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, rgba(0, 179, 237, 0.08) 0%, rgba(0, 133, 179, 0.04) 100%);
    border-radius: 16px;
    border: 1px solid rgba(0, 179, 237, 0.15);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(0, 179, 237, 0.1) 0%, transparent 70%);
        border-radius: 50%;
    }

    .header-item {
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        z-index: 1;
    }

    .header-label {
        font-size: 13px;
        color: #666;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
            content: '';
            width: 4px;
            height: 14px;
            background: #00B3ED;
            border-radius: 2px;
        }
    }

    .header-value {
        font-size: 16px;
        color: #333;
        font-weight: 600;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 10px;
        border: 1px solid rgba(0, 179, 237, 0.2);

        &.name {
            color: #0085B3;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 247, 255, 0.6) 100%);
        }

        &.code {
            color: #52C41A;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 255, 230, 0.6) 100%);
            font-family: 'Monaco', 'Consolas', monospace;
            letter-spacing: 1px;
        }
    }
}

.preview-section {
    margin-bottom: 20px;
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid #eef2f6;

    &:last-child {
        margin-bottom: 0;
    }

    .section-label {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
        padding-left: 12px;
        border-left: 4px solid #00B3ED;
        display: flex;
        align-items: center;
        gap: 8px;

        &::after {
            content: '';
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, rgba(0, 179, 237, 0.3) 0%, transparent 100%);
            margin-left: 16px;
        }
    }
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .info-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%);
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
            background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
            transform: translateX(4px);
        }

        .label {
            color: #666;
            min-width: 90px;
            font-weight: 500;

            &::before {
                content: '•';
                color: #00B3ED;
                margin-right: 6px;
            }
        }

        .value {
            color: #333;
            font-weight: 600;
        }

        &:nth-child(1) .label::before {
            color: #00B3ED;
        }

        &:nth-child(2) .label::before {
            color: #52C41A;
        }

        &:nth-child(3) .label::before {
            color: #F5A623;
        }

        &:nth-child(4) .label::before {
            color: #722ED1;
        }

        &:nth-child(5) .label::before {
            color: #EB2F96;
        }

        &:nth-child(6) .label::before {
            color: #13C2C2;
        }

        &:nth-child(7) .label::before {
            color: #FA541C;
        }
    }
}

.requirements-text {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
    background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
    padding: 16px 20px;
    border-radius: 8px;
    border-left: 4px solid #F5A623;
}

.attachments-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .attachment-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 18px;
        background: linear-gradient(135deg, #e6f7ff 0%, #f0f5ff 100%);
        border: 1px solid rgba(0, 179, 237, 0.3);
        border-radius: 8px;
        font-size: 14px;
        color: #0085B3;
        transition: all 0.3s;

        &:hover {
            background: linear-gradient(135deg, #bae7ff 0%, #d6e4ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 179, 237, 0.2);
        }

        .el-icon {
            font-size: 18px;
            color: #00B3ED;
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    .el-button {
        min-width: 110px;
        height: 42px;
        border-radius: 8px;
        font-weight: 500;
        transition: all 0.3s;

        &:first-child {
            &:hover {
                color: #00B3ED;
                border-color: #00B3ED;
            }
        }

        &[type="primary"] {
            background: linear-gradient(90deg, #00B3ED 0%, #0085B3 100%);
            border: none;
            box-shadow: 0 4px 12px rgba(0, 179, 237, 0.3);

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 179, 237, 0.4);
            }
        }
    }
}
</style>
