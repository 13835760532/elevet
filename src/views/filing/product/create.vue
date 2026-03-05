<template>
    <div class="page-container yy-detail-container">
        <!-- 顶部标题区 -->
        <PageHeader title="产品档案" desc="填写农产品档案，上传产品宣传照片，并关联所属生产经营主体。" />

        <div class="page-scrollable">
        <!-- 内容卡片 -->
        <div class="content-card">
            <div class="card-header">
                <span class="header-title">产品基本信息</span>
                <div class="dashed-line"></div>
            </div>

            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px"
                class="product-archive-form">
                
                <!-- 产品名称 -->
                <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="formData.productName" placeholder="请选择或输入产品名称" />
                </el-form-item>

                <!-- 产品类别 -->
                <el-form-item label="产品类别" prop="productCategory">
                    <el-select v-model="formData.productCategory" placeholder="请选择产品类别" class="full-width">
                        <el-option label="蔬菜" value="vegetable" />
                        <el-option label="水果" value="fruit" />
                        <el-option label="肉类" value="meat" />
                        <el-option label="水产品" value="aquatic" />
                    </el-select>
                </el-form-item>

                <!-- 产品产地 -->
                <el-form-item label="产品产地" prop="origin">
                    <el-input v-model="formData.origin" placeholder="请填写详细产地（省/市/县/镇）" />
                </el-form-item>

                <!-- 批次规模 -->
                <el-form-item label="批次规模" prop="batchSize">
                    <div class="compound-input">
                        <el-input v-model="formData.batchSize" placeholder="数量" style="flex: 1;" />
                        <el-select class="prefix-select" v-model="formData.batchUnit" placeholder="单位" style="width: 100px;">
                            <el-option label="kg" value="kg" />
                            <el-option label="吨" value="ton" />
                            <el-option label="箱" value="box" />
                            <el-option label="亩" value="mu" />
                        </el-select>
                    </div>
                </el-form-item>

                <!-- 建档日期 -->
                <el-form-item label="建档日期" prop="archiveDate">
                    <el-date-picker v-model="formData.archiveDate" type="date" placeholder="选择建档日期"
                        class="full-width" />
                </el-form-item>

                <!-- 产品宣传照片 -->
                <el-form-item label="产品宣传照片" class="upload-item">
                    <div class="upload-container">
                        <el-upload 
                            class="photo-uploader" 
                            action="#" 
                            :auto-upload="false" 
                            :show-file-list="false"
                        >
                            <div class="upload-slot">
                                <el-icon class="upload-icon"><Plus /></el-icon>
                                <span class="upload-text">选取图片</span>
                            </div>
                        </el-upload>
                        <div class="preview-area">
                            <div class="preview-box empty">
                                <el-icon><Picture /></el-icon>
                                <span class="hint">暂无图片</span>
                            </div>
                        </div>
                        <div class="upload-info">
                            <p class="main-tip">建议尺寸 800x800 px</p>
                            <p class="sub-tip">支持 JPG/PNG 格式，大小不超过 5MB</p>
                        </div>
                    </div>
                </el-form-item>

                <!-- 分割线 -->
                <div class="dashed-line mt32 mb32"></div>

                <!-- 所属主体 -->
                <div class="card-header mt24">
                    <span class="header-title" style="font-size: 16px;">所属主体关联</span>
                </div>

                <el-form-item label="生产经营主体" prop="subjectId">
                    <div class="subject-selector-wrapper">
                        <el-select v-model="formData.subjectId" filterable remote
                            placeholder="搜索企业名称或信用代码查询主体" class="subject-select">
                            <template #prefix>
                                <el-icon><Search /></el-icon>
                            </template>
                            <el-option label="北京物美商业集团股份有限公司" value="1" />
                            <el-option label="小辉农场" value="2" />
                        </el-select>
                        <el-button type="primary" class="btn-new-subject">
                            <el-icon class="mr4"><Plus /></el-icon>新增主体
                        </el-button>
                    </div>
                </el-form-item>

                <!-- 主体卡片详情 -->
                <transition name="el-fade-in">
                    <div class="subject-card" v-if="formData.subjectId">
                        <div class="card-title">
                            <el-icon><OfficeBuilding /></el-icon>
                            主体详细信息
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">主体名称</span>
                                <span class="value semibold">北京物美商业集团股份有限公司</span>
                            </div>
                            <div class="info-item">
                                <span class="label">信用代码</span>
                                <span class="value">91110108700234256X</span>
                            </div>
                            <div class="info-item">
                                <span class="label">主体类型</span>
                                <span class="value"><el-tag size="small" effect="plain">流通环节</el-tag></span>
                            </div>
                            <div class="info-item">
                                <span class="label">备案等级</span>
                                <span class="value">企业档案</span>
                            </div>
                            <div class="info-item">
                                <span class="label">联系人</span>
                                <span class="value">秦艳萍</span>
                            </div>
                            <div class="info-item">
                                <span class="label">联系电话</span>
                                <span class="value">18513172770</span>
                            </div>
                            <div class="info-item span-2">
                                <span class="label">所属地区</span>
                                <span class="value">北京市 朝阳区 建国路29号建外SOHO</span>
                            </div>
                            <div class="info-item">
                                <span class="label">详细证件</span>
                                <div class="link-group">
                                    <span class="active-link">营业执照 <el-icon><View /></el-icon></span>
                                    <span class="active-link">身份证 <el-icon><View /></el-icon></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </transition>

                <!-- 底部操作按钮 -->
                <div class="form-footer">
                    <el-button type="primary" class="btn-submit" @click="handleSave">保存建档</el-button>
                    <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                </div>
            </el-form>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Picture, Search, OfficeBuilding, View, Download } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';

const router = useRouter();
const formRef = ref(null);

const formData = reactive({
    productName: '',
    productCategory: 'vegetable',
    origin: '',
    batchSize: '',
    batchUnit: 'kg',
    archiveDate: '2025-12-19',
    subjectId: '1',
    photos: []
});

const formRules = {
    productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    productCategory: [{ required: true, message: '请选择产品类别', trigger: 'change' }],
    subjectId: [{ required: true, message: '请选择所属主体', trigger: 'change' }]
};

const handleSave = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            console.log('Saving product archive:', formData);
        }
    });
};

const handleCancel = () => {
    router.back();
};
</script>

<style lang="scss" scoped>
$theme-color: #00B3ED;
$text-dark: #1E293B;
$text-light: #64748B;
$bg-light: #F8FAFC;
$border-color: #E2E8F0;

.page-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
}

.mr4 { margin-right: 4px; }
.mt24 { margin-top: 24px; }

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 12px;
    padding: var(--page-container-padding);
    margin-bottom: 12px;
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

.product-archive-form {
    max-width: 650px;
    margin-left: 0;

    :deep(.el-form-item) {
        margin-bottom: 24px;
        display: flex;
        align-items: center;

        .el-form-item__content {
            flex: 1;
            display: flex;
        }
    }

    :deep(.el-select),
    :deep(.el-date-editor) {
        width: 100% !important;
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
            box-shadow: 0 0 0 1px $theme-color inset !important;
        }
    }
}

.full-width {
    width: 100%;
}

.compound-input {
    display: flex;
    gap: 8px;
    width: 100%;

    :deep(.el-input) {
        flex: 1;
    }
    .prefix-select {
        width: 100px !important;
        flex-shrink: 0;

        :deep(.el-select__wrapper) {
            width: 100px;
        }
    }
}

/* 照片上传优化 */
.upload-container {
    width: 520px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    background: $bg-light;
    padding: 24px;
    border-radius: 4px;
    border: 1px solid $border-color;
}

.photo-uploader {
    :deep(.el-upload) {
        .upload-slot {
            width: 100px;
            height: 100px;
            border: 2px dashed #CBD5E1;
            border-radius: 12px;
            background: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            cursor: pointer;

            &:hover {
                border-color: $theme-color;
                background: rgba($theme-color, 0.02);
                .upload-icon { color: $theme-color; }
            }

            .upload-icon {
                font-size: 24px;
                color: #94A3B8;
                margin-bottom: 4px;
            }

            .upload-text {
                font-size: 12px;
                color: #64748B;
            }
        }
    }
}

.preview-area {
    .preview-box {
        width: 100px;
        height: 100px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px solid #E2E8F0;
        
        &.empty {
            background: #F1F5F9;
            color: #94A3B8;
            .el-icon { font-size: 32px; margin-bottom: 4px; }
            .hint { font-size: 12px; }
        }
    }
}

.upload-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100px;

    .main-tip {
        font-size: 14px;
        font-weight: 600;
        color: #334155;
        margin-bottom: 6px;
    }

    .sub-tip {
        font-size: 12px;
        color: #94A3B8;
    }
}

.form-divider {
    height: 1px;
    background: #F1F5F9;
    margin: 32px 0;
}

/* 主体选择器包装器 */
.subject-selector-wrapper {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;

    .subject-select {
        flex: 1;
    }

    .btn-new-subject {
        height: 44px;
        border-radius: 8px;
        font-weight: 600;
        background-color: $theme-color;
        border-color: $theme-color;
        color: #fff;

        &:hover {
            opacity: 0.8;
            color: #fff;
        }
    }
}

/* 主体详情卡片 */
.subject-card {
    background: #fff;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
    padding: 24px;
    margin-top: 16px;
    background-image: radial-gradient(at 100% 0%, rgba($theme-color, 0.03) 0%, transparent 50%);

    .card-title {
        font-size: 14px;
        font-weight: 700;
        color: $text-dark;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        .el-icon { color: $theme-color; }
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 32px;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 6px;

        &.span-2 { grid-column: span 2; }

        .label {
            font-size: 12px;
            color: $text-light;
        }

        .value {
            font-size: 14px;
            color: #334155;
            &.semibold { font-weight: 600; color: $text-dark; }
        }
    }

    .link-group {
        display: flex;
        gap: 16px;
    }

    .active-link {
        color: $theme-color;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
        &:hover { text-decoration: underline; }
    }
}

/* 底部功能按钮 */
.form-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
}

.btn-submit {
    width: 120px;
    height: 44px;
    background: #00B3ED;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    border: none;

    &:hover {
        background: #1e52e0;
    }
}

.btn-cancel {
    width: 120px;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    border: 1px solid #D1D5DB;
}
</style>
