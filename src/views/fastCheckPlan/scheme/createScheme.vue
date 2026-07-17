<template>
    <div class="page-container">
        <pageHeader :title="isEdit ? '编辑检测方案' : '创建检测方案'" desc="配置新的农产品检测项目，包括项目名称、检测品种、时间要求及下发权限" />

        <!-- 表单内容 -->
        <div class="content-card">
            <div class="card-header">
                <span class="header-title">方案基本信息</span>
                <div class="dashed-line"></div>
            </div>

            <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="scheme-form"
                v-loading="formLoading">

                <el-row :gutter="32">
                    <!-- 第一行：名称与编号 -->
                    <el-col :span="12">
                        <el-form-item label="方案名称" prop="planName">
                            <el-input v-model="formData.planName" placeholder="建议输入包含年份和地区的完整名称" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="方案编号" prop="planCode">
                            <el-input v-model="formData.planCode" placeholder="系统自动生成" :disabled="isEdit" />
                        </el-form-item>
                    </el-col>

                    <!-- 第二行：主管单位与类型 -->
                    <el-col :span="12">
                        <el-form-item label="主管单位" prop="issuerDeptId">
                            <el-tree-select v-model="formData.issuerDeptId" :data="deptTreeOptions"
                                :props="defaultProps" placeholder="请选择主管单位" class="full-width" filterable check-strictly
                                clearable @change="handleDeptChange" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="方案类型" prop="planType">
                            <el-select v-model="formData.planType" placeholder="请选择方案类型" class="full-width">
                                <el-option v-for="dict in planTypeOptions" :key="dict.value" :label="dict.label"
                                    :value="dict.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 第三行：周期与总量 -->
                    <el-col :span="12">
                        <el-form-item label="方案周期" prop="planPeriodType">
                            <div class="purpose-selects">
                                <el-select v-model="formData.planPeriodType" placeholder="周期类型">
                                    <el-option label="年度" :value="1" />
                                    <el-option label="月度" :value="2" />
                                    <el-option label="周度" :value="3" />
                                </el-select>
                                <el-select v-model="formData.planPeriodYear" placeholder="年份">
                                    <el-option :label="2026" :value="2026" />
                                    <el-option :label="2025" :value="2025" />
                                    <el-option :label="2024" :value="2024" />
                                </el-select>
                                <el-select v-model="formData.planPeriodMonth" placeholder="月份"
                                    v-if="formData.planPeriodType === 2">
                                    <el-option v-for="m in 12" :key="m" :label="`${m}月`" :value="m" />
                                </el-select>
                                <el-select v-model="formData.planPeriodWeek" placeholder="周"
                                    v-if="formData.planPeriodType === 3">
                                    <el-option v-for="m in 53" :key="m" :label="`${m}周`" :value="m" />
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="任务总样品量" prop="sampleCount">
                            <el-input v-model.number="formData.sampleCount" min="1" placeholder="请填写任务样品总量"
                                type="number" />
                        </el-form-item>
                    </el-col>

                    <!-- 第四行：地区与时间 -->
                    <el-col :span="12">
                        <el-form-item label="检测地区" prop="targetArea">
                            <el-input v-model="formData.targetArea" placeholder="请输入检测覆盖地区，如：北京、天津" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="执行时间" prop="planStartDate">
                            <div class="date-range-group">
                                <el-date-picker v-model="formData.planStartDate" type="date" placeholder="开始"
                                    value-format="YYYY-MM-DD" />
                                <span class="date-separator">至</span>
                                <el-date-picker v-model="formData.planEndDate" type="date" placeholder="结束"
                                    value-format="YYYY-MM-DD" />
                            </div>
                        </el-form-item>
                    </el-col>

                    <!-- 第五行：分类与项目 -->
                    <el-col :span="12">
                        <el-form-item label="农产品行业分类" prop="targetCategory">
                            <el-tree-select v-model="formData.targetCategory" :data="produceCategoryTree"
                                :props="{ label: 'name', value: 'code', children: 'children' }" node-key="code"
                                placeholder="请选择农产品类别" class="full-width" clearable filterable check-strictly />
                        </el-form-item>
                    </el-col>
                    <!-- <el-col :span="12">
                        <el-form-item label="检测项目" prop="detectionItems">
                            <el-input v-model="formData.detectionItems" placeholder="请输入检测项目，多个用逗号分隔" />
                        </el-form-item>
                    </el-col> -->

                    <!-- 备注与附件：全宽 -->
                    <el-col :span="24">
                        <el-form-item label="方案要求" prop="planRequirements">
                            <el-input v-model="formData.planRequirements" type="textarea" :rows="3"
                                placeholder="请输入具体执行要求或注意事项" />
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="方案附件">
                            <div class="upload-wrapper">
                                <el-upload class="line-upload" drag action="#" :auto-upload="false"
                                    :on-change="handleFileChange" :show-file-list="false">
                                    <div class="upload-inner">
                                        <el-icon>
                                            <UploadFilled />
                                        </el-icon>
                                        <span>点击或拖拽上传方案附件文件</span>
                                    </div>
                                </el-upload>
                                <div class="file-list" v-if="fileList.length">
                                    <div v-for="(file, index) in fileList" :key="file.uid" class="file-item">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <span class="name">{{ file.name }}</span>
                                        <el-icon class="close" @click="handleFileRemove(index)">
                                            <Close />
                                        </el-icon>
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 操作栏 -->
                <div class="footer-actions">
                    <el-button @click="handleCancel" class="btn-cancel">返回</el-button>
                    <el-button @click="handlePreview" class="btn-preview">预览效果</el-button>
                    <el-button type="primary" @click="handleSubmit" class="btn-submit" :loading="submitLoading">
                        {{ isEdit ? '确认修改' : '立即发布' }}
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
                        <!-- <div class="info-item">
                            <span class="dot d6"></span>
                            <span class="label">目标品种：</span>
                            <span class="value">{{ getCategoryLabelFromTree(formData.targetCategory) }}</span>
                        </div> -->
                        <div class="info-item">
                            <span class="dot d7"></span>
                            <span class="label">计划样品数量：</span>
                            <span class="value">{{ formData.sampleCount || '0' }} 份</span>
                        </div>
                        <!-- <div class="info-item">
                            <span class="dot d8"></span>
                            <span class="label">检测项目：</span>
                            <span class="value">{{ formData.detectionItems || '--' }}</span>
                        </div> -->
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
                    <el-button type="primary" @click="handleSubmitFromPreview" :loading="submitLoading">确认发布</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Plus, UploadFilled, Document, Close } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import * as DetectionPlanApi from '@/api/agri/detectionPlan'
import * as DeptApi from '@/api/system/dept'
import * as ProduceCategoryApi from '@/api/agri/produceCategory'
import { handleTree } from '@/utils/tree'
import { useFileUpload } from '@/hooks/web/useFileUpload'
import { useDict, DICT_TYPE } from '@/hooks/web/useDict'
import { useUserStore } from '@/store/modules/user'

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const formRef = ref(null);
const previewVisible = ref(false);
const formLoading = ref(false); // 表单加载状态
const submitLoading = ref(false); // 提交按钮加载状态
const issuerDeptName = ref(''); // 缓存当前选中的部门名称，用于回显

// 使用字典 hook 获取方案类型和分类
const { options: planTypeOptions, getLabel: getPlanTypeLabel } = useDict(DICT_TYPE.AGRI_PLAN_TYPE, 'int')
const { options: productCategoryOptions, getLabel: getProductCategoryLabel } = useDict(DICT_TYPE.AGRI_PRODUCT_CATEGORY, 'str')

const produceCategoryTree = ref([])

/** 在行业分类树中递归查找名称，找不到时依次回退字典标签和原值。 */
const getCategoryLabelFromTree = (val) => {
    if (!val) return '--'
    const findLabel = (nodes) => {
        for (const node of nodes) {
            if (String(node.code) === String(val) || String(node.name) === String(val) || String(node.id) === String(val)) {
                return node.name
            }
            if (node.children?.length) {
                const found = findLabel(node.children)
                if (found) return found
            }
        }
        return null
    }
    const foundName = findLabel(produceCategoryTree.value)
    return foundName || getProductCategoryLabel(val) || val
}

/** 加载农产品行业分类树 */
const loadProduceCategoryTree = async () => {
    try {
        const res = await ProduceCategoryApi.getProduceCategoryPage({
            pageNo: 1,
            pageSize: 1000,
            type: 1 // 1-分类
        })
        const list = res?.list || []
        produceCategoryTree.value = res?.list || []
    } catch (error) {
        console.error('加载农产品分类失败:', error)
    }
}

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

/** 部门树 - 原型设计配套数据 */
const deptTreeOptions = ref([]);
const deptList = ref([]);
const defaultProps = {
    children: 'children',
    label: 'name',
    value: 'id'
};

/** 加载部门列表 */
const loadDeptList = async () => {
    try {
        const data = await DeptApi.getSimpleDeptList();
        deptList.value = data;
        deptTreeOptions.value = handleTree(data);
    } catch (error) {
        console.error('加载部门列表失败:', error);
    }
};

// 自动生成方案编号逻辑
const generatePlanCode = () => {
    if (isEdit.value) return;
    const category = (formData.targetCategory || 'GENERAL').toUpperCase();
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const random = Math.floor(100000 + Math.random() * 900000);
    formData.planCode = `FA-${category}-${yearMonth}-${random}`;
};

// 监听行业分类变化，自动生成编号
watch(() => formData.targetCategory, (val) => {
    if (val && !isEdit.value && !formData.planCode) {
        generatePlanCode();
    }
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

/**
 * 组装方案保存参数。
 * 附件由上传组件统一序列化，并移除空字段，避免更新时用空值覆盖服务端默认数据。
 */
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

/** 校验并新增或更新检测方案，成功后返回方案列表。 */
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

/**
 * 编辑模式加载方案详情、附件及下发部门名称。
 * 仅回填接口明确返回的字段，避免 undefined 覆盖表单默认值。
 */
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
        // 异步获取部门名称用于回显
        if (data.issuerDeptId) {
            console.log('data.issuerDeptId', data.issuerDeptId)
            DeptApi.getDept(data.issuerDeptId).then(res => {
                issuerDeptName.value = res.name
            })
        }
    } catch (error) {
        console.error('获取检测方案详情失败：', error)
        ElMessage.error('获取方案详情失败')
    } finally {
        formLoading.value = false
    }
}

const findDeptName = (id, list) => {
    for (const node of list) {
        if (node.id === id) return node.name;
        if (node.children?.length) {
            const name = findDeptName(id, node.children);
            if (name) return name;
        }
    }
    return null;
}

// 标签显示辅助方法
const getDeptLabel = (value) => {
    if (!value) return '--';
    const found = findDeptName(value, deptTreeOptions.value);
    if (found) {
        issuerDeptName.value = found
        return found
    }
    return issuerDeptName.value || '--';
};

/** 手动选择部门时同步更新名称缓存 */
const handleDeptChange = (val) => {
    if (!val) {
        issuerDeptName.value = ''
        return
    }
    const found = findDeptName(val, deptTreeOptions.value)
    if (found) {
        issuerDeptName.value = found
    }
}



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

/** 初始化分类和部门数据；新建时默认使用当前账号部门，编辑时加载原方案。 */
onMounted(() => {
    loadDeptList()
    loadProduceCategoryTree()
    const id = route.query.id
    if (id) {
        // 编辑模式：加载方案详情
        loadPlanDetail(Number(id))
    } else {
        // 新建模式：回显当前登录人所属部门
        const userDeptId = userStore.getUser.deptId
        if (userDeptId) {
            formData.issuerDeptId = userDeptId
            // 异步获取部门名称用于预览回显
            DeptApi.getDept(userDeptId).then(res => {
                issuerDeptName.value = res.name
            }).catch(() => { })
        }
    }
})
</script>

<style lang="scss" scoped>
.page-container {
    height: calc(100vh - 86px);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: transparent;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 8px;
    padding: 30px 40px;
    flex: 1;
    overflow-y: auto;
}

.card-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;

    .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }
}

/* 栅格布局调整 */
.scheme-form {
    max-width: 1000px;
    margin: 0;

    :deep(.el-form-item) {
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .el-form-item__content {
            width: 100%;
        }
    }

    :deep(.el-form-item__label) {
        font-weight: 500;
        color: #475569;
        font-size: 14px;
        padding-bottom: 6px;

        &::before {
            margin-right: 4px;
        }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper),
    :deep(.el-textarea__inner) {
        box-shadow: none !important;
        border: 1px solid #dcdfe6 !important;
        border-radius: 4px;
        height: 40px;
        background-color: #fff !important;
        transition: border-color 0.2s;

        &:hover {
            border-color: #cbd5e1 !important;
        }

        &.is-focus,
        &:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.05) !important;
        }
    }

    :deep(.el-textarea__inner) {
        height: auto;
        padding: 8px 12px;
    }
}

.purpose-selects {
    display: flex;
    gap: 8px;
    width: 100%;

    .el-select:first-child {
        width: 110px !important;
        flex: none;
    }

    .el-select:nth-child(2) {
        width: 110px !important;
        flex: none;
    }

    .el-select:nth-child(3) {
        flex: 1;
    }
}

.date-range-group {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;

    .el-date-editor {
        flex: 1;
    }

    .date-separator {
        color: #94a3b8;
        font-size: 12px;
    }
}

.upload-wrapper {
    width: 100%;

    .line-upload {
        :deep(.el-upload-dragger) {
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border: 1px dashed #cbd5e1;
            border-radius: 8px;
            padding: 0;

            &:hover {
                border-color: #2563eb;
                background: #eff6ff;
            }
        }

        .upload-inner {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            font-size: 14px;

            .el-icon {
                font-size: 18px;
            }
        }
    }
}

.file-list {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 8px;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f1f5f9;
    border-radius: 6px;
    gap: 10px;
    border: 1px solid #e2e8f0;

    .name {
        flex: 1;
        font-size: 13px;
        color: #475569;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .close {
        cursor: pointer;
        color: #94a3b8;
        font-size: 14px;

        &:hover {
            color: #ef4444;
        }
    }
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f1f5f9;

    .el-button {
        min-width: 100px;
        height: 38px;
        border-radius: 6px;
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
        .dot.d1 {
            background: #00B3ED;
        }

        .dot.d2 {
            background: #52C41A;
        }

        .dot.d3 {
            background: #F5A623;
        }

        .dot.d4 {
            background: #722ED1;
        }

        .dot.d5 {
            background: #EB2F96;
        }

        .dot.d6 {
            background: #13C2C2;
        }

        .dot.d7 {
            background: #FA541C;
        }

        .dot.d8 {
            background: #2F54EB;
        }
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
