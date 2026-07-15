<script setup>
import { computed, ref, reactive, watch } from 'vue';
import { useMessage } from '@/hooks/web/useMessage';
import { useDict } from '@/hooks/web/useDict';
import { UploadImg, UploadImgs } from '@/components/UploadFile';
import AreaCascader from '@/components/AreaCascader/index.vue';
import * as SubjectApi from '@/api/agri/subject/index';
import { DEFAULT_PRODUCTION_SCALE_UNIT, usePreferredAgriMeasurementUnitOptions } from '@/utils/agriUnit';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    id: {
        type: [Number, String],
        default: null
    }
});

const emit = defineEmits(['update:modelValue', 'success']);

const message = useMessage();
const formRef = ref(null);
const loading = ref(false);
const areaPath = ref([]);

const { options: filingTypeOptions } = useDict('agri_filing_type', 'int');
const { options: subjectCategoryOptions } = useDict('agri_subject_category', 'str');

const formData = reactive({
    type: undefined,
    name: '',
    category: undefined,
    mainProducts: '',
    provinceCode: '',
    cityCode: '',
    districtCode: '',
    address: '',
    contactName: '',
    contactPhone: '',
    productionScale: '',
    productionScaleUnit: DEFAULT_PRODUCTION_SCALE_UNIT,
    businessLicenseUrl: '',
    socialCreditCode: '',
    idCardFrontUrl: '',
    idCardBackUrl: '',
    qualificationUrls: '',
    introduction: ''
});

const productionScaleUnitRef = computed({
    get: () => formData.productionScaleUnit,
    set: (value) => {
        formData.productionScaleUnit = value || DEFAULT_PRODUCTION_SCALE_UNIT;
    }
});
const productionScaleUnitOptions = usePreferredAgriMeasurementUnitOptions(
    productionScaleUnitRef,
    ['亩', 'mu'],
    DEFAULT_PRODUCTION_SCALE_UNIT,
    computed(() => !props.id)
);

const formRules = {
    type: [{ required: true, message: '请选择建档类型', trigger: 'change' }],
    name: [{ required: true, message: '请输入主体名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择主体类别', trigger: 'change' }],
    mainProducts: [{ required: true, message: '请输入主营产品', trigger: 'blur' }],
    provinceCode: [{ required: true, message: '请选择所属地区', trigger: 'change' }],
    address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
    contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
    productionScale: [{ required: true, message: '请输入生产经营主体', trigger: 'blur' }]
};

const resetForm = () => {
    Object.assign(formData, {
        type: undefined,
        name: '',
        category: undefined,
        mainProducts: '',
        provinceCode: '',
        address: '',
        contactName: '',
        contactPhone: '',
        productionScale: '',
        productionScaleUnit: DEFAULT_PRODUCTION_SCALE_UNIT,
        businessLicenseUrl: '',
        socialCreditCode: '',
        idCardFrontUrl: '',
        idCardBackUrl: '',
        qualificationUrls: '',
        introduction: ''
    });
    areaPath.value = [];
    if (formRef.value) formRef.value.resetFields();
};

const loadDetail = async () => {
    if (!props.id) {
        resetForm();
        return;
    };
    loading.value = true;
    try {
        const data = await SubjectApi.getSubject(props.id);
        if (data.qualificationUrls && typeof data.qualificationUrls === 'string') {
            data.qualificationUrls = data.qualificationUrls.split(',').filter(item => item !== '');
        }
        Object.assign(formData, data);
    } catch (error) {
        console.error('加载主体详情失败', error);
    } finally {
        loading.value = false;
    }
};

watch(() => props.modelValue, (val) => {
    if (val) {
        loadDetail();
    }
});

const handleClose = () => {
    emit('update:modelValue', false);
};

const handleSubmit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                const submitData = { ...formData };
                if (Array.isArray(submitData.qualificationUrls)) {
                    submitData.qualificationUrls = submitData.qualificationUrls.join(',');
                }

                let result;
                if (props.id) {
                    await SubjectApi.updateSubject({ ...submitData, id: props.id });
                    message.success('更新成功');
                    result = props.id;
                } else {
                    result = await SubjectApi.createSubject(submitData);
                    message.success('创建成功');
                }
                emit('success', result);
                handleClose();
            } catch (error) {
                console.error(error);
            } finally {
                loading.value = false;
            }
        }
    });
};
</script>

<template>
    <el-drawer :model-value="modelValue" @update:model-value="handleClose" :title="id ? '修改主体档案' : '新增主体建档'"
        size="600px" destroy-on-close append-to-body>
        <div class="drawer-content" v-loading="loading">
            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" label-position="top"
                class="subject-drawer-form">
                <el-form-item label="建档类型" prop="type" required>
                    <el-select v-model="formData.type" placeholder="选择建档类型" class="full-width">
                        <el-option v-for="dict in filingTypeOptions" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="主体名称" prop="name" required>
                    <el-input v-model="formData.name" placeholder="请输入主体名称" />
                </el-form-item>

                <el-form-item label="主体类型" prop="category" required>
                    <el-select v-model="formData.category" placeholder="请选择主体类型" class="full-width">
                        <el-option v-for="dict in subjectCategoryOptions" :key="dict.value" :label="dict.label"
                            :value="dict.value" />
                    </el-select>
                </el-form-item>

                <el-form-item label="主营产品" prop="mainProducts" required>
                    <el-input v-model="formData.mainProducts" placeholder="主营产品（手工输入）" />
                </el-form-item>

                <div class="form-row">
                    <el-form-item label="所属地区" prop="provinceCode" required style="flex: 1;">
                        <AreaCascader v-model="areaPath" placeholder="请选择所属地区" @select="(val) => {
                            formData.provinceCode = val.province;
                            formData.cityCode = val.city;
                            formData.districtCode = val.district;
                        }" />
                    </el-form-item>
                    <el-form-item label="生产经营主体" prop="productionScale" required style="flex: 1;">
                        <div class="scale-row">
                            <el-input v-model="formData.productionScale" placeholder="数量" />
                            <el-select v-model="formData.productionScaleUnit" placeholder="单位" style="min-width: 80px">
                                <el-option v-for="unit in productionScaleUnitOptions" :key="unit.value"
                                    :label="unit.label" :value="unit.value" />
                            </el-select>
                        </div>
                    </el-form-item>
                </div>

                <el-form-item label="详细地址" prop="address" required>
                    <el-input v-model="formData.address" placeholder="详细地址" />
                </el-form-item>

                <div class="form-row">
                    <el-form-item label="联系人" prop="contactName" required style="flex: 1;">
                        <el-input v-model="formData.contactName" placeholder="联系人" />
                    </el-form-item>
                    <el-form-item label="联系电话" prop="contactPhone" required style="flex: 1;">
                        <el-input v-model="formData.contactPhone" placeholder="联系电话" />
                    </el-form-item>
                </div>

                <el-form-item label="信用代码" prop="socialCreditCode">
                    <el-input v-model="formData.socialCreditCode" placeholder="输入识别码或信用代码" />
                </el-form-item>

                <el-form-item label="营业执照" prop="businessLicenseUrl">
                    <UploadImg v-model="formData.businessLicenseUrl" :limit="1" />
                </el-form-item>

                <el-form-item label="身份证照（正/反面）" prop="idCardFrontUrl">
                    <div style="display: flex; gap: 16px;">
                        <UploadImg v-model="formData.idCardFrontUrl" :limit="1" height="100px" width="160px" />
                        <UploadImg v-model="formData.idCardBackUrl" :limit="1" height="100px" width="160px" />
                    </div>
                </el-form-item>

                <el-form-item label="企业资质" prop="qualificationUrls">
                    <UploadImgs v-model="formData.qualificationUrls" :limit="5" />
                </el-form-item>

                <el-form-item label="企业介绍" prop="introduction">
                    <el-input v-model="formData.introduction" type="textarea" :rows="4" placeholder="请输入企业介绍..." />
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <div style="flex: auto">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" :loading="loading" @click="handleSubmit">提交保存</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<style lang="scss" scoped>
.drawer-content {
    padding: 0 20px;
    margin-top: -20px;
}

.subject-drawer-form {
    :deep(.el-form-item__label) {
        font-weight: 600;
        margin-bottom: 8px !important;
    }
}

.full-width {
    width: 100%;
}

.form-row {
    display: flex;
    gap: 20px;
}

.scale-row {
    display: flex;
    gap: 8px;
    width: 100%;
}
</style>
