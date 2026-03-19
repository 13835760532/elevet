<template>
    <div class="page-container yy-detail-container">
        <!-- 顶部标题区 -->
        <PageHeader title="主体建档" desc="快速建立产品主体档案，完善资质及背景信息，提升品牌公信力。" />

        <div class="page-scrollable">
        <!-- 内容卡片 -->
        <div class="content-card">
            <div class="card-header">
                <span class="header-title">主体基本信息</span>
                <div class="dashed-line"></div>
            </div>

            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="product-form">
                <!-- 备案类型 -->
                <el-form-item label="备案类型" prop="type" required>
                    <el-select v-model="formData.type" placeholder="选择备案类型" class="full-width">
                        <el-option v-for="dict in filingTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                </el-form-item>

                <!-- 主体名称 -->
                <el-form-item label="主体名称" prop="name" required>
                    <el-input v-model="formData.name" placeholder="请输入主体名称，如：北京本来生活科技有限公司" />
                </el-form-item>

                <!-- 主体类型 -->
                <el-form-item label="主体类型" prop="category" required>
                    <el-select v-model="formData.category" placeholder="请选择主体类型" class="full-width">
                        <el-option v-for="dict in subjectCategoryOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                </el-form-item>

                <!-- 主营产品 -->
                <el-form-item label="主营产品" prop="mainProducts" required>
                    <el-input v-model="formData.mainProducts" placeholder="黄瓜、西红柿、茄子、丝瓜（手工输入）" />
                </el-form-item>

                <!-- 所属地区 -->
                <el-form-item label="所属地区" prop="provinceCode" required>
                    <el-input v-model="formData.provinceCode" placeholder="北京市-北京市-朝阳区（下拉选择转输入）" />
                </el-form-item>

                <!-- 详细地址 -->
                <el-form-item label="详细地址" prop="address" required>
                    <el-input v-model="formData.address" placeholder="建国路29号建外soho" />
                </el-form-item>

                <!-- 联系人 -->
                <el-form-item label="联系人" prop="contactName" required>
                    <el-input v-model="formData.contactName" placeholder="秦艳萍" />
                </el-form-item>

                <!-- 联系电话 -->
                <el-form-item label="联系电话" prop="contactPhone" required>
                    <el-input v-model="formData.contactPhone" placeholder="65776500" />
                </el-form-item>

                <!-- 生产规模 -->
                <el-form-item label="生产规模" prop="productionScale" required>
                    <div class="scale-row">
                        <el-input v-model="formData.productionScale" placeholder="10" />
                        <el-select v-model="formData.productionScaleUnit" placeholder="亩" style="width: 100px">
                            <el-option label="亩" value="亩" />
                            <el-option label="公顷" value="公顷" />
                        </el-select>
                    </div>
                </el-form-item>

                <!-- 营业执照 -->
                <el-form-item label="营业执照" prop="businessLicenseUrl">
                    <UploadImg v-model="formData.businessLicenseUrl" :limit="1" />
                </el-form-item>

                <!-- 信用代码 -->
                <el-form-item label="信用代码" prop="socialCreditCode">
                   <el-input v-model="formData.socialCreditCode" placeholder="输入信用代码" />
                </el-form-item>

                <!-- 身份证正反面 -->
                <el-form-item label="身份证" prop="idCardFrontUrl">
                    <div style="display: flex; gap: 20px;">
                        <UploadImg v-model="formData.idCardFrontUrl" :limit="1" />
                        <UploadImg v-model="formData.idCardBackUrl" :limit="1" />
                    </div>
                </el-form-item>

                <!-- 企业资质 -->
                <el-form-item label="企业资质" prop="qualificationUrls">
                    <UploadImgs v-model="formData.qualificationUrls" :limit="5" />
                </el-form-item>

                <!-- 企业介绍 -->
                <el-form-item label="企业介绍" prop="introduction">
                    <el-input v-model="formData.introduction" type="textarea" :rows="4" placeholder="请输入企业介绍..." />
                </el-form-item>

                <!-- 底部按钮 -->
                <div class="form-footer">
                    <el-button type="primary" :loading="loading" class="btn-submit" @click="handleSubmit">保存建档</el-button>
                    <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                </div>
            </el-form>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Picture, UploadFilled } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';
import { UploadImg, UploadImgs } from '@/components/UploadFile';
import * as SubjectApi from '@/api/agri/subject/index';
import { useMessage } from '@/hooks/web/useMessage';

import { useDict } from '@/hooks/web/useDict';

const { options: filingTypeOptions } = useDict('agri_filing_type', 'int');
const { options: subjectCategoryOptions } = useDict('agri_subject_category', 'str');

const router = useRouter();
const route = useRoute();
const message = useMessage();
const formRef = ref(null);
const loading = ref(false);

const id = route.query.id;

const formData = reactive({
    type: undefined,
    name: '',
    category: undefined,
    mainProducts: '',
    provinceCode: '',
    address: '',
    contactName: '',
    contactPhone: '',
    productionScale: '',
    productionScaleUnit: '亩',
    businessLicenseUrl: '',
    socialCreditCode: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    qualificationUrls: '',
    introduction: ''
});

const formRules = {
    type: [{ required: true, message: '请选择备案类型', trigger: 'change' }],
    name: [{ required: true, message: '请输入主体名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择主体类别', trigger: 'change' }],
    mainProducts: [{ required: true, message: '请输入主营产品', trigger: 'blur' }],
    provinceCode: [{ required: true, message: '请选择所属地区', trigger: 'change' }],
    address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
    contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    productionScale: [{ required: true, message: '请输入生产规模', trigger: 'blur' }]
};

const loadDetail = async () => {
    if (!id) return;
    try {
        const data = await SubjectApi.getSubject(id);
        if (data.qualificationUrls && typeof data.qualificationUrls === 'string') {
            data.qualificationUrls = data.qualificationUrls.split(',').filter(item => item !== '');
        }
        Object.assign(formData, data);
    } catch (error) {
        console.error('加载主体详情失败', error);
    }
};

onMounted(() => {
    loadDetail();
});

const handleSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            if (loading.value) return;
            loading.value = true;
            try {
                const submitData = { ...formData };
                if (Array.isArray(submitData.qualificationUrls)) {
                    submitData.qualificationUrls = submitData.qualificationUrls.join(',');
                }

                let result;
                if (id) {
                    await SubjectApi.updateSubject({ ...submitData, id });
                    message.success('更新成功');
                } else {
                    result = await SubjectApi.createSubject(submitData);
                    message.success('创建成功');
                }
                
                const redirect = route.query.redirect;
                if (redirect) {
                    // 如果存在跳转回流地址，则回跳，并尝试带上新创建的主体 ID
                    router.push({
                        path: redirect,
                        query: { 
                            ...route.query,
                            newSubjectId: result || id,
                            redirect: undefined // 清除 redirect 标记
                         }
                    });
                } else {
                    router.back();
                }
            } catch (error) {
                console.error(error);
            } finally {
                loading.value = false;
            }
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
    display: flex;
    flex-direction: column;
    padding: 0;
    background: transparent;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: var(--page-container-padding);
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.card-header {
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;

    .header-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 12px;
        text-align: left;
    }
    .dashed-line {
        width: 100%;
        height: 1px;
        background-image: linear-gradient(to right, #ccc 50%, rgba(255, 255, 255, 0) 0%);
        background-position: bottom;
        background-size: 10px 1px;
        background-repeat: repeat-x;
    }
}



.product-form {
    max-width: 600px;
    margin-left: 0;

    :deep(.el-form-item) {
        margin-bottom: 24px;
        display: flex;
        align-items: center;
    }

    :deep(.el-form-item__label) {
        font-weight: 600;
        color: #333;

        &::before {
            margin-right: 4px;
        }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        border-radius: 6px;
        box-shadow: 0 0 0 1px #D1D5DB inset;
        height: 40px;

        &.is-focus {
            box-shadow: 0 0 0 1px #00B3ED inset !important;
        }
    }
}

.full-width {
    width: 100%;
}

.scale-row {
    display: flex;
    gap: 12px;
    width: 100%;
}

.upload-container {
    display: flex;
    align-items: center;
    gap: 20px;
}

.preview-box {
    width: 80px;
    height: 50px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #E5E7EB;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;

    &.placeholder {
        font-size: 24px;
    }
}

.id-card-boxes {
    display: flex;
    gap: 8px;
}

.preview-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.text-value {
    color: #333;
    font-size: 14px;
    line-height: 40px;
}

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

    &:hover {
        opacity: 0.8;
    }
}

.btn-cancel {
    width: 120px;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    border: 1px solid #D1D5DB;
}
.upload-demo{
    margin-left: 80px;
}
</style>
