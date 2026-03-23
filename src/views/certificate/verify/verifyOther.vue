<template>
    <div class="verify-page-wrapper">
        <pageHeader title="外部合格证查验进场" desc="录入其他平台或纸质合格证信息，建立数字化溯源链条" />

        <div class="main-container">
            <div class="glass-form-card">
                <!-- 第一部分：来源识别 -->
                <div class="form-group-section">
                    <div class="section-indicator">
                        <span class="step-badge">01</span>
                        <h3 class="group-title">识别来源与证据</h3>
                    </div>
                    
                    <div class="source-selector-grid">
                        <div 
                            class="source-mode-item" 
                            :class="{ active: formData.source === 'other' }"
                            @click="formData.source = 'other'"
                        >
                            <el-icon class="mode-icon"><Link /></el-icon>
                            <div class="mode-meta">
                                <span class="m-title">其他平台电子版</span>
                                <span class="m-desc">输入证号或上传电子档</span>
                            </div>
                        </div>
                        <div 
                            class="source-mode-item" 
                            :class="{ active: formData.source === 'paper' }"
                            @click="formData.source = 'paper'"
                        >
                            <el-icon class="mode-icon"><Camera /></el-icon>
                            <div class="mode-meta">
                                <span class="m-title">纸质凭证拍照</span>
                                <span class="m-desc">自动 OCR 识别票面内容</span>
                            </div>
                        </div>
                    </div>

                    <div class="upload-integrated-area mt-20">
                         <UploadImg v-model="formData.certificateImageUrl" :limit="1" height="180px" />
                         <div class="upload-tip-text mt-10">
                             <strong>上传原合格证拍照件</strong>
                             <p>清晰的票面内容有助于后续查验追溯</p>
                         </div>
                    </div>
                </div>

                <el-divider />

                <!-- 第二部分：产品与主体 -->
                <div class="form-group-section">
                    <div class="section-indicator">
                        <span class="step-badge">02</span>
                        <h3 class="group-title">详尽存档信息</h3>
                    </div>

                    <el-form :model="formData" label-position="top" class="standard-grid-form">
                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="农产品名称" required>
                                    <el-input v-model="formData.productName" placeholder="录入产品完整名称" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="所属类别">
                                    <el-select v-model="formData.productCategory" placeholder="选择分类" class="w-full">
                                        <el-option v-for="dict in productCategoryOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="外部合格证编号">
                                    <el-input v-model="formData.certificateCode" placeholder="外部平台证号或纸质编号" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="产地详情">
                                    <el-input v-model="formData.productionArea" placeholder="生产基地或具体产地地址" />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="24">
                                <el-form-item label="承诺主体（供应商/生产者）" required>
                                    <div class="entity-search-box">
                                        <el-select
                                            v-model="formData.subjectId"
                                            placeholder="输入名称搜索主体..."
                                            filterable
                                            remote
                                            :remote-method="remoteSearchSubject"
                                            :loading="subjectLoading"
                                            class="w-full"
                                            @change="handleSubjectSelect"
                                        >
                                            <el-option 
                                                v-for="item in subjectOptions" 
                                                :key="item.id" 
                                                :label="item.name" 
                                                :value="item.id" 
                                            />
                                        </el-select>
                                        <el-button type="primary" link class="add-entity-btn" @click="ElMessage.info('新增主体功能开发中')">
                                            <el-icon><Plus /></el-icon> 新增主体
                                        </el-button>
                                    </div>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row :gutter="24">
                            <el-col :span="8">
                                <el-form-item label="数量/规模">
                                    <el-input-number v-model="formData.quantity" :precision="2" :step="0.1" :min="0" class="w-full" placeholder="0.00" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="单位">
                                    <el-select v-model="formData.unit">
                                        <el-option label="kg" value="kg" />
                                        <el-option label="吨" value="ton" />
                                        <el-option label="个" value="pcs" />
                                        <el-option label="箱" value="box" />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="10">
                                <el-form-item label="原合格证开具日期">
                                    <el-date-picker v-model="formData.issueDate" type="date" value-format="YYYY-MM-DD" class="w-full" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </div>

                <!-- 操作区 -->
                <div class="form-actions-bar">
                    <el-button class="btn-cancel" @click="handleCancel">取消并返回</el-button>
                    <el-button type="primary" class="btn-submit-premium" @click="handleSubmit">
                        <span>完成查验并入库档案</span>
                        <el-icon class="icon-right"><ArrowRight /></el-icon>
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
    Link, Camera, Upload, Plus, ArrowRight, Search
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import PageBack from '@/components/PageBack/index.vue';
import { UploadImg } from '@/components/UploadFile';
import { useDict } from '@/hooks/web/useDict';
import * as SubjectApi from '@/api/agri/subject/index';
import { verifyExternal } from '@/api/agri/certificateVerification/index';

const router = useRouter();

const { options: productCategoryOptions } = useDict('agri_product_category', 'str');

const formData = reactive({
    source: 'other',
    certificateImageUrl: '',
    certificateCode: '',
    productName: '',
    productCategory: '',
    productionArea: '',
    quantity: undefined,
    unit: 'kg',
    issueDate: new Date().toISOString().split('T')[0],
    subjectId: undefined,
    subjectName: ''
});

// 主体搜索相关
const subjectLoading = ref(false);
const subjectOptions = ref([]);

const remoteSearchSubject = async (query) => {
    if (query) {
        subjectLoading.value = true;
        try {
            const res = await SubjectApi.getSubjectPage({ name: query, pageSize: 20 });
            subjectOptions.value = res.list;
        } finally {
            subjectLoading.value = false;
        }
    }
};

const handleSubjectSelect = (val) => {
    const item = subjectOptions.value.find(s => s.id === val);
    if (item) {
        formData.subjectName = item.name;
        // 如果主体有地址信息，可以尝试回显产地
        if (item.provinceCode) {
             formData.productionArea = `${item.provinceCode}-${item.cityCode || ''}-${item.districtCode || ''}`;
        }
    }
};

const handleCancel = () => router.push('/certificate/verify');

const handleSubmit = async () => {
    if (!formData.certificateImageUrl) {
        ElMessage.warning('请先上传合格证凭证图片');
        return;
    }
    if (!formData.productName) {
        ElMessage.warning('请输入产品名称');
        return;
    }
    if (!formData.subjectName) {
        ElMessage.warning('请输入或搜索生产经营主体');
        return;
    }

    try {
        await verifyExternal({
            ...formData,
            verificationType: 2 // 已存证
        });
        ElMessage.success('外部合格证已成功入库备案');
        router.push('/certificate/verify');
    } catch (e) {
        console.error('存证失败', e);
    }
};
</script>

<style lang="scss" scoped>
$theme-color: #00B3ED;
$bg-faded: #F8FAFC;
$text-dark: #1E293B;
$text-light: #64748B;

.verify-page-wrapper {
    min-height: 100vh;
}

/* Header Minimal */
.page-header-minimal {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 30px;
    padding-left: 10px;

    .header-main-info {
        .main-title {
            font-size: 24px;
            font-weight: 800;
            color: $text-dark;
            margin: 0 0 6px 0;
            letter-spacing: -0.5px;
        }
        .sub-title {
            font-size: 14px;
            color: $text-light;
            margin: 0;
        }
    }
}

.main-container {
    max-width: 860px;
    margin: 14px auto;
}

/* Glass Form Card */
.glass-form-card {
    background: #fff;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.form-group-section {
    margin-bottom: 30px;
}

.section-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;

    .step-badge {
        width: 32px;
        height: 32px;
        background: rgba($theme-color, 0.1);
        color: $theme-color;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
    }

    .group-title {
        font-size: 18px;
        font-weight: 700;
        color: $text-dark;
        margin: 0;
    }
}

/* Source Selector */
.source-selector-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
}

.source-mode-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border: 2px solid #F1F5F9;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

    .mode-icon {
        font-size: 24px;
        color: $text-light;
        transition: color 0.2s;
    }

    .mode-meta {
        display: flex;
        flex-direction: column;
        .m-title { font-weight: 700; color: $text-dark; font-size: 15px; }
        .m-desc { font-size: 12px; color: $text-light; margin-top: 2px; }
    }

    &:hover {
        background: #F8FAFC;
        border-color: #E2E8F0;
    }

    &.active {
        background: rgba($theme-color, 0.04);
        border-color: $theme-color;
        .mode-icon { color: $theme-color; }
        .m-title { color: $theme-color; }
    }
}

/* Uploader */
.clean-uploader {
    :deep(.el-upload-dragger) {
        border: 2px dashed #E2E8F0;
        background: #F8FAFC;
        border-radius: 12px;
        padding: 30px;
        &:hover { border-color: $theme-color; }
    }

    .uploader-content {
        display: flex;
        align-items: center;
        gap: 20px;
        text-align: left;

        .icon-circle {
            width: 54px;
            height: 54px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            color: $theme-color;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .text-content {
            strong { display: block; font-size: 15px; color: $text-dark; margin-bottom: 4px; }
            p { font-size: 13px; color: $text-light; margin: 0; }
        }
    }
}

/* Form Layout */
.standard-grid-form {
    :deep(.el-form-item__label) {
        font-weight: 700;
        color: #475569;
        font-size: 13px;
        padding-bottom: 4px;
    }

    :deep(.el-input__wrapper) {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 0 0 1px #E2E8F0 inset;
        height: 40px;
        
        &.is-focus {
            box-shadow: 0 0 0 1px $theme-color inset !important;
        }
    }
}

.entity-search-box {
    display: flex;
    gap: 12px;
    align-items: center;
}

.add-entity-btn {
    white-space: nowrap;
    font-weight: 600;
}

/* Actions */
.form-actions-bar {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-cancel {
    border-radius: var(--el-border-radius-base);
    color: $text-light;
    border: 1px solid #E2E8F0;
}

.btn-submit-premium {
    border-radius: var(--el-border-radius-base);
    background: $theme-color;
    border: none;
    font-size: 15px;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(0, 179, 237, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 179, 237, 0.3);
        opacity: 0.8;
    }

    .icon-right {
        font-size: 18px;
    }
}

/* Utils */
.w-full { width: 100%; }
.mt-20 { margin-top: 20px; }
</style>
