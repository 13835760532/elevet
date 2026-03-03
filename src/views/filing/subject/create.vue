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
                <el-form-item label="备案类型" prop="recordType" required>
                    <el-select v-model="formData.recordType" placeholder="企业档案/个人档案" class="full-width">
                        <el-option label="企业档案" value="enterprise" />
                        <el-option label="个人档案" value="personal" />
                    </el-select>
                </el-form-item>

                <!-- 主体名称 -->
                <el-form-item label="主体名称" prop="name" required>
                    <el-input v-model="formData.name" placeholder="请输入主体名称，如：北京本来生活科技有限公司" />
                </el-form-item>

                <!-- 主体类型 -->
                <el-form-item label="主体类型" prop="type" required>
                    <el-select v-model="formData.type" placeholder="请选择主体类型，如：生产" class="full-width">
                        <el-option label="生产" value="production" />
                        <el-option label="流通" value="circulation" />
                    </el-select>
                </el-form-item>

                <!-- 主营产品 -->
                <el-form-item label="主营产品" prop="mainProducts" required>
                    <el-input v-model="formData.mainProducts" placeholder="黄瓜、西红柿、茄子、丝瓜（手工输入）" />
                </el-form-item>

                <!-- 所属地区 -->
                <el-form-item label="所属地区" prop="region" required>
                    <el-input v-model="formData.region" placeholder="北京市-北京市-朝阳区（下拉选择转输入）" />
                </el-form-item>

                <!-- 详细地址 -->
                <el-form-item label="详细地址" prop="address" required>
                    <el-input v-model="formData.address" placeholder="建国路29号建外soho" />
                </el-form-item>

                <!-- 联系人 -->
                <el-form-item label="联系人" prop="contact" required>
                    <el-input v-model="formData.contact" placeholder="秦艳萍" />
                </el-form-item>

                <!-- 联系电话 -->
                <el-form-item label="联系电话" prop="phone" required>
                    <el-input v-model="formData.phone" placeholder="65776500" />
                </el-form-item>

                <!-- 生产规模 -->
                <el-form-item label="生产规模" prop="scale" required>
                    <div class="scale-row">
                        <el-input v-model="formData.scale" placeholder="10" />
                        <el-select v-model="formData.scaleUnit" placeholder="亩" style="width: 100px">
                            <el-option label="亩" value="mu" />
                            <el-option label="公顷" value="hectare" />
                        </el-select>
                    </div>
                </el-form-item>

                <!-- 营业执照 -->
                <el-form-item label="营业执照" prop="license">
                    <div class="upload-container">
                        <div class="preview-box" v-if="formData.license">
                            <img :src="formData.license" class="preview-img" />
                        </div>
                        <div class="preview-box placeholder" v-else>
                            <el-icon>
                                <Picture />
                            </el-icon>
                        </div>
                        <el-upload class="upload-demo" action="#" :auto-upload="false" :show-file-list="false">
                            <el-button type="primary" link>上传</el-button>
                        </el-upload>
                    </div>
                </el-form-item>

                <!-- 信用代码 -->
                <el-form-item label="信用代码" prop="creditCode">
                    <div class="text-value">1102011818788786816</div>
                </el-form-item>

                <!-- 身份证 -->
                <el-form-item label="身份证" prop="idCard">
                    <div class="upload-container">
                        <div class="id-card-boxes">
                            <div class="preview-box placeholder"><el-icon>
                                    <UploadFilled />
                                </el-icon></div>
                            <div class="preview-box placeholder"><el-icon>
                                    <UploadFilled />
                                </el-icon></div>
                        </div>
                        <el-upload class="upload-demo" action="#" :auto-upload="false" :show-file-list="false">
                            <el-button type="primary" link>上传正反面</el-button>
                        </el-upload>
                    </div>
                </el-form-item>

                <!-- 企业资质 -->
                <el-form-item label="企业资质" prop="qualifications">
                    <div class="upload-container">
                        <div class="preview-box placeholder"><el-icon>
                                <Picture />
                            </el-icon></div>
                        <el-upload class="upload-demo" action="#" :auto-upload="false" :show-file-list="false">
                            <el-button type="primary" link>上传</el-button>
                        </el-upload>
                    </div>
                </el-form-item>

                <!-- 企业介绍 -->
                <el-form-item label="企业介绍" prop="intro">
                    <el-input v-model="formData.intro" type="textarea" :rows="4" placeholder="请输入企业介绍..." />
                </el-form-item>

                <!-- 底部按钮 -->
                <div class="form-footer">
                    <el-button type="primary" class="btn-submit" @click="handleSubmit">保存建档</el-button>
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
import { Picture, UploadFilled } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';

const router = useRouter();
const formRef = ref(null);

const formData = reactive({
    recordType: 'enterprise',
    name: '',
    type: 'production',
    mainProducts: '',
    region: '',
    address: '',
    contact: '',
    phone: '',
    scale: '10',
    scaleUnit: 'mu',
    license: '',
    creditCode: '1102011818788786816',
    idCard: [],
    qualifications: [],
    intro: ''
});

const formRules = {
    name: [{ required: true, message: '请输入主体名称', trigger: 'blur' }],
    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
};

const handleSubmit = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            console.log('Submit Success:', formData);
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
.upload-demo{
    margin-left: 80px;
}
</style>
