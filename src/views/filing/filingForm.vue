<template>
    <div class="filing-container">
        <div class="filing-card">
            <h1 class="filing-title">主体建档</h1>

            <el-form ref="filingFormRef" :model="form" :rules="rules" label-position="left" label-width="120px"
                class="custom-form">
                <!-- 建档类型 -->
                <el-form-item label="建档类型" prop="filingType" required>
                    <el-radio-group v-model="form.filingType" class="custom-radio-group">
                        <el-radio label="enterprise">企业档案</el-radio>
                        <el-radio label="individual">个人档案</el-radio>
                    </el-radio-group>
                </el-form-item>

                <!-- 主体名称 -->
                <el-form-item label="主体名称" prop="subjectName">
                    <el-input v-model="form.subjectName" placeholder="北京本来生活科技有限公司" class="custom-input" />
                </el-form-item>

                <!-- 主体类型 -->
                <el-form-item label="主体类型" prop="subjectType">
                    <el-select v-model="form.subjectType" placeholder="请选择主体类型" class="custom-select"
                        style="width: 100%">
                        <el-option label="生产" value="production" />
                        <el-option label="流通" value="circulation" />
                    </el-select>
                </el-form-item>

                <!-- 主营产品 -->
                <el-form-item label="主营产品" prop="mainProduct">
                    <el-input v-model="form.mainProduct" placeholder="黄瓜、西红柿、茄子、丝瓜（手工输入）" class="custom-input" />
                </el-form-item>

                <!-- 所属地区 -->
                <el-form-item label="所属地区" prop="region">
                    <el-cascader v-model="form.region" :options="regionOptions" placeholder="北京市-北京市-朝阳区（下拉选择输入）"
                        class="custom-cascader" style="width: 100%" />
                </el-form-item>

                <!-- 详细地址 -->
                <el-form-item label="详细地址" prop="address">
                    <el-input v-model="form.address" placeholder="建国路29号建外soho" class="custom-input" />
                </el-form-item>

                <!-- 联系人 -->
                <el-form-item label="联系人" prop="contact">
                    <el-input v-model="form.contact" placeholder="秦艳萍" class="custom-input" />
                </el-form-item>

                <!-- 联系电话 -->
                <el-form-item label="联系电话" prop="phone">
                    <el-input v-model="form.phone" placeholder="65776500" class="custom-input" />
                </el-form-item>

                <!-- 生产经营主体 -->
                <el-form-item label="生产经营主体" prop="scaleSize">
                    <div style="display: flex; gap: 10px; width: 100%">
                        <el-input-number v-model="form.scaleSize" :min="0" class="custom-input-number"
                            style="flex: 1" />
                        <el-select v-model="form.scaleUnit" class="custom-select" style="width: 100px">
                            <el-option v-for="unit in scaleUnitOptions" :key="unit.value" :label="unit.label"
                                :value="unit.value" />
                        </el-select>
                    </div>
                </el-form-item>

                <!-- 营业执照 -->
                <el-form-item label="营业执照" prop="businessLicense">
                    <image-upload v-model="form.businessLicense" :limit="1" />
                </el-form-item>

                <!-- 信用代码 -->
                <el-form-item label="信用代码" prop="creditCode">
                    <el-input v-model="form.creditCode" placeholder="1102011818788786816" class="custom-input" />
                </el-form-item>

                <!-- 身份证 -->
                <el-form-item label="身份证" prop="idCard">
                    <image-upload v-model="form.idCard" :limit="2" />
                    <div class="upload-tip">请上传正面和反面</div>
                </el-form-item>

                <!-- 企业资质 -->
                <el-form-item label="企业资质" prop="qualification">
                    <image-upload v-model="form.qualification" :limit="5" />
                </el-form-item>

                <!-- 企业介绍 -->
                <el-form-item label="企业介绍" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入主体背景详细介绍..."
                        class="custom-textarea" />
                </el-form-item>

                <!-- 操作按钮 -->
                <div class="form-actions">
                    <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
                    <el-button type="primary" class="submit-btn" :loading="submitting" @click="handleSubmit">
                        提交备案
                    </el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ImageUpload from '@/components/ImageUpload/index.vue';
import { DEFAULT_PRODUCTION_SCALE_UNIT, usePreferredAgriMeasurementUnitOptions } from '@/utils/agriUnit';

const router = useRouter();
const filingFormRef = ref(null);
const submitting = ref(false);

// 表单数据
const form = reactive({
    filingType: 'enterprise',
    subjectName: '',
    subjectType: 'production',
    mainProduct: '',
    region: [],
    address: '',
    contact: '',
    phone: '',
    scaleSize: 10,
    scaleUnit: DEFAULT_PRODUCTION_SCALE_UNIT,
    businessLicense: '',
    creditCode: '',
    idCard: '',
    qualification: '',
    description: ''
});

const scaleUnitRef = computed({
    get: () => form.scaleUnit,
    set: (value) => {
        form.scaleUnit = value || DEFAULT_PRODUCTION_SCALE_UNIT;
    }
});
const scaleUnitOptions = usePreferredAgriMeasurementUnitOptions(scaleUnitRef, ['亩', 'mu'], DEFAULT_PRODUCTION_SCALE_UNIT);

// 表单校验规则
const rules = {
    subjectName: [{ required: true, message: '请输入主体名称', trigger: 'blur' }],
    subjectType: [{ required: true, message: '请选择主体类型', trigger: 'change' }],
    region: [{ required: true, message: '请选择所属地区', trigger: 'change' }],
    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
};

// 地区选项 (示例)
const regionOptions = [
    {
        value: 'beijing',
        label: '北京市',
        children: [
            {
                value: 'beijing-city',
                label: '北京市',
                children: [
                    { value: 'chaoyang', label: '朝阳区' },
                    { value: 'haidian', label: '海淀区' }
                ]
            }
        ]
    }
];

/**
 * 提交处理
 */
const handleSubmit = () => {
    filingFormRef.value.validate(valid => {
        if (valid) {
            submitting.value = true;
            // 模拟提交
            setTimeout(() => {
                submitting.value = false;
                ElMessage.success('提交成功，请等待审核');
                router.push('/filing/filingSuccess');
            }, 1500);
        }
    });
};

/**
 * 取消处理
 */
const handleCancel = () => {
    router.back();
};
</script>

<style lang="scss" scoped>
.filing-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    min-height: calc(100vh - 84px);
    padding: 40px 20px;
    background: linear-gradient(180deg, #D9EFFF 0%, #FFFFFF 100%);
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.filing-card {
    width: 100%;
    max-width: 900px;
    background: #fff;
    border-radius: 24px;
    padding: 60px 80px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.filing-title {
    font-size: 40px;
    line-height: 48px;
    color: #00B3ED;
    margin: 0 0 50px 0;
    font-weight: 500;
    letter-spacing: 2px;
    text-align: left;
}

.custom-form {
    :deep(.el-form-item) {
        margin-bottom: 25px;

        .el-form-item__label {
            font-size: 16px;
            color: #333;
            font-weight: 600;

            &::before {
                color: #ff4d4f;
            }
        }
    }

    :deep(.custom-input),
    :deep(.custom-select),
    :deep(.custom-cascader),
    :deep(.custom-input-number) {

        .el-input__wrapper,
        .el-select-v2__wrapper {
            border-radius: 12px;
            height: 50px;
            background-color: #f7f9fb;
            box-shadow: none !important;
            border: 1px solid transparent;
            transition: all 0.3s;

            &:hover,
            &.is-focus {
                border-color: #00B3ED;
                background-color: #fff;
            }
        }
    }

    :deep(.custom-textarea) {
        .el-textarea__inner {
            border-radius: 12px;
            padding: 12px 16px;
            background-color: #f7f9fb;
            box-shadow: none !important;
            border: 1px solid transparent;
            transition: all 0.3s;

            &:hover,
            &:focus {
                border-color: #00B3ED;
                background-color: #fff;
            }
        }
    }
}

.upload-tip {
    font-size: 13px;
    color: #999;
    margin-top: 8px;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 60px;

    .submit-btn {
        width: 240px;
        height: 54px;
        background: #1a56ff;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 500;
        border: none;
        transition: all 0.3s;
        color: #fff;

        &:hover {
            background: #0040ff;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(26, 86, 255, 0.3);
        }
    }

    .cancel-btn {
        width: 240px;
        height: 54px;
        background: #e4e7ed;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 500;
        border: none;
        color: #666;
        transition: all 0.3s;

        &:hover {
            background: #dcdfe6;
            color: #333;
        }
    }
}

/* 响应式适配 */
@media (max-width: 768px) {
    .filing-card {
        padding: 30px 20px;
    }

    .filing-title {
        font-size: 28px;
        margin-bottom: 30px;
    }

    .form-actions {
        flex-direction: column;
        gap: 15px;

        .submit-btn,
        .cancel-btn {
            width: 100%;
        }
    }
}
</style>
