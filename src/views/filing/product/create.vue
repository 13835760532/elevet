<template>
    <div class="page-container">
        <PageBack style="margin-bottom: 12px;"></PageBack>
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">产品档案</h1>
            </div>
            <div class="desc-box">
                填写农产品档案，上传合格证及检测信息并耦合合格证
            </div>
        </div>

        <!-- 内容卡片 -->
        <div class="content-card">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top"
                class="product-archive-form">
                <!-- 产品名称 -->
                <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="formData.productName" placeholder="输入产品名称" />
                </el-form-item>

                <!-- 产品类别 -->
                <el-form-item label="产品类别" prop="productCategory">
                    <el-select v-model="formData.productCategory" placeholder="请选择产品类别" class="full-width">
                        <el-option label="蔬菜" value="vegetable" />
                        <el-option label="水果" value="fruit" />
                        <el-option label="肉类" value="meat" />
                    </el-select>
                </el-form-item>

                <!-- 产品产地 -->
                <el-form-item label="产品产地" prop="origin">
                    <el-input v-model="formData.origin" placeholder="北京市/北京市/朝阳区/东小口镇（选择省/市/县/乡镇或街）" />
                </el-form-item>

                <!-- 批次规模 -->
                <el-form-item label="批次规模" prop="batchSize">
                    <div class="compound-input">
                        <el-input v-model="formData.batchSize" placeholder="输入产品数量" />
                        <el-select v-model="formData.batchUnit" placeholder="选择计量单位" style="width: 140px">
                            <el-option label="kg" value="kg" />
                            <el-option label="吨" value="ton" />
                            <el-option label="箱" value="box" />
                        </el-select>
                    </div>
                </el-form-item>

                <!-- 产品宣传照片 -->
                <el-form-item label="产品宣传照片">
                    <div class="upload-grid">
                        <el-upload class="photo-uploader" action="#" :auto-upload="false" :show-file-list="false">
                            <div class="upload-box">
                                <el-icon>
                                    <Plus />
                                </el-icon>
                                <span>上传照片</span>
                            </div>
                        </el-upload>
                        <div class="preview-placeholder">
                            <el-icon>
                                <Picture />
                            </el-icon>
                        </div>
                    </div>
                    <p class="upload-tip">只支持 .jpg 格式</p>
                </el-form-item>

                <!-- 建档日期 -->
                <el-form-item label="建档日期" prop="archiveDate">
                    <el-date-picker v-model="formData.archiveDate" type="date" placeholder="2025-12-19"
                        class="full-width" />
                </el-form-item>

                <!-- 所属主体 -->
                <el-form-item label="所属主体（生产经营企业）" prop="subjectId">
                    <div class="subject-selector-row">
                        <el-select v-model="formData.subjectId" filterable remote
                            placeholder="北京物美商业集团股份有限公司【代码：***425678】" class="flex-1">
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                            <el-option label="北京物美商业集团股份有限公司" value="1" />
                        </el-select>
                        <el-button type="primary" class="btn-new-subject">新增主体</el-button>
                    </div>
                    <p class="selector-tip">*从主体、经营库找到，请先创建主体建档</p>
                </el-form-item>

                <!-- 主体详情展示框 -->
                <div class="subject-detail-box" v-if="formData.subjectId">
                    <div class="detail-row">
                        <span class="label">*主体名称：</span>
                        <span class="value">北京物美商业集团股份有限公司 (1102011818788786816)</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*备案类型：</span>
                        <span class="value">企业档案/个人档案</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*主体类型：</span>
                        <span class="value">流通</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*主营产品：</span>
                        <span class="value">黄瓜、西红柿、茄子、丝瓜</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*所属地区：</span>
                        <span class="value">北京市-北京市-朝阳区</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*详细地址：</span>
                        <span class="value">建国路29号建外soho</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*联系人：</span>
                        <span class="value">秦艳萍</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*联系电话：</span>
                        <span class="value">18513172770</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*生产规模：</span>
                        <span class="value">10 亩</span>
                    </div>
                    <div class="detail-row complex">
                        <span class="label">*企业信用代码<br />（身份证编码）：</span>
                        <span class="value">1102011818788786816</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*营业执照：</span>
                        <span class="value active-link">预览</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*身份证：</span>
                        <span class="value active-link">预览</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">企业资质：</span>
                        <span class="value">-</span>
                    </div>
                    <div class="detail-row no-border">
                        <span class="label">企业介绍：</span>
                        <span class="value">-</span>
                    </div>
                </div>

                <!-- 底部按钮 -->
                <div class="form-footer">
                    <el-button type="primary" class="btn-save" @click="handleSave">保存</el-button>
                    <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Picture, Search } from '@element-plus/icons-vue';

const router = useRouter();
const formRef = ref(null);

const formData = reactive({
    productName: '',
    productCategory: 'vegetable',
    origin: '',
    batchSize: '',
    batchUnit: '',
    archiveDate: '2025-12-19',
    subjectId: '1', // 默认选中一个显示详情
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
.page-container {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    background: transparent;
}

/* 顶部标题区 */
.header-section {
    padding: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    margin-bottom: 20px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.title-line {
    width: 4px;
    height: 18px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin: 0;
}

.desc-box {
    font-size: 14px;
    color: #666666;
    padding-left: 12px;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    ;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 40px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.product-archive-form {
    max-width: 650px;
    margin: 0 auto;

    :deep(.el-form-item) {
        margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
        font-weight: 600;
        color: #333;
        font-size: 14px;
        padding-bottom: 8px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        border-radius: 6px;
        box-shadow: 0 0 0 1px #D1D5DB inset;
        height: 48px;
        background: #fff;

        &.is-focus {
            box-shadow: 0 0 0 1px #00B3ED inset !important;
        }
    }
}

.full-width {
    width: 100%;
}

.compound-input {
    display: flex;
    gap: 12px;
}

/* 照片上传 */
.upload-grid {
    display: flex;
    gap: 16px;
}

.upload-box {
    width: 80px;
    height: 80px;
    border: 1px dashed #D1D5DB;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #F9FAFB;
    cursor: pointer;
    color: #999;

    .el-icon {
        font-size: 20px;
        margin-bottom: 4px;
    }

    span {
        font-size: 12px;
    }

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }
}

.preview-placeholder {
    width: 80px;
    height: 80px;
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #D1D5DB;
    font-size: 32px;
}

.upload-tip {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
}

/* 主体选择器 */
.subject-selector-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
}

.flex-1 {
    flex: 1;
}

.btn-new-subject {
    height: 40px;
    background: #00B3ED;
    border-color: #00B3ED;
}

.selector-tip {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}

/* 主体详情展示框 */
.subject-detail-box {
    margin-top: 20px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
}

.detail-row {
    display: flex;
    border-bottom: 1px solid #F3F4F6;
    min-height: 44px;
    align-items: flex-start;

    &.no-border {
        border-bottom: none;
    }

    .label {
        width: 150px;
        padding: 12px 16px;
        font-size: 13px;
        font-weight: 600;
        color: #333;
        text-align: right;
    }

    .value {
        flex: 1;
        padding: 12px 16px;
        font-size: 13px;
        color: #333;
        line-height: 1.5;

        &.active-link {
            color: #3B82F6;
            cursor: pointer;
            font-weight: 500;
        }
    }

    &.complex {
        .label {
            line-height: 1.3;
        }
    }
}

/* 底部按钮 */
.form-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 50px;
}

.btn-save {
    width: 140px;
    height: 44px;
    background: #00B3ED;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
}

.btn-cancel {
    width: 140px;
    height: 44px;
    border-radius: 8px;
    font-size: 14px;
}
</style>
