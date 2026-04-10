<template>
    <div class="page-container yy-detail-container">
        <!-- 顶部标题区 -->
        <PageHeader title="产品档案" desc="填写农产品档案，上传产品宣传照片，并关联所属生产经营主体。" />

        <div class="page-scrollable">
        <!-- 内容卡片 -->
        <div class="content-card">
            <div class="card-header">
                <div class="header-main">
                    <span class="header-title">产品基本信息</span>
                    <el-button type="primary" plain class="btn-copy-prev" :loading="copyLoading"
                        @click="handleCopyPrevious">复制上一条</el-button>
                </div>
                <div class="dashed-line"></div>
            </div>

            <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px"
                class="product-archive-form">
                
                <!-- 产品名称 -->
                <el-form-item label="产品名称" prop="productName">
                    <el-input v-model="formData.productName" placeholder="请填写或选择产品名称" />
                </el-form-item>

                <!-- 建档时间 -->
                <el-form-item label="建档时间" prop="archiveDate">
                    <el-date-picker v-model="formData.archiveDate" type="date" placeholder="请选择建档时间" value-format="YYYY-MM-DD" class="full-width" />
                </el-form-item>

                <!-- 产品类别 -->
                <el-form-item label="产品类别" prop="category">
                    <el-select v-model="formData.category" placeholder="请选择产品类别" class="full-width">
                        <el-option v-for="dict in productCategoryOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                </el-form-item>

                <!-- 产品产地 -->
                <el-form-item label="产品产地" prop="productionArea">
                    <AreaCascader 
                        v-model="areaPath" 
                        placeholder="请选择所属地区" 
                        @select="(val) => {
                            formData.provinceCode = val.province;
                            formData.cityCode = val.city;
                            formData.districtCode = val.district;
                            formData.productionArea = `${val.province}${val.city}${val.district}`;
                        }"
                    />
                </el-form-item>

                <!-- 产品规格 -->
                <el-form-item label="产品规格" prop="productSpec">
                    <div class="compound-input">
                        <el-input v-model="formData.productSpec" placeholder="请填写数量" style="flex: 1;" />
                        <el-select class="prefix-select" v-model="formData.productUnit" placeholder="请选择单位" style="width: 100px;">
                            <el-option label="kg" value="kg" />
                            <el-option label="吨" value="吨" />
                            <el-option label="箱" value="箱" />
                            <el-option label="亩" value="亩" />
                        </el-select>
                    </div>
                </el-form-item>

                <!-- 产品宣传照片 -->
                <el-form-item label="产品宣传照片" prop="productImageUrl" class="upload-item">
                    <UploadImg v-model="formData.productImageUrl" :limit="1" />
                </el-form-item>

                <!-- 分割线 -->
                <div class="dashed-line mt32 mb32"></div>

                <!-- 所属主体 -->
                <div class="card-header mt24">
                    <span class="header-title" style="font-size: 16px;">所属主体（生产经营企业）</span>
                </div>

                <el-form-item label="生产经营主体" prop="subjectId">
                    <div class="subject-selector-wrapper">
                        <el-select v-model="formData.subjectId" filterable remote
                            placeholder="请搜索或选择所属主体" class="subject-select"
                            :remote-method="searchSubject" @change="handleSubjectChange">
                            <template #prefix>
                                <el-icon><Search /></el-icon>
                            </template>
                            <el-option v-for="item in subjectOptions" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                        <el-button type="primary" class="btn-new-subject" @click="showSubjectDrawer = true">
                            <el-icon class="mr4"><Plus /></el-icon>新增主体
                        </el-button>
                    </div>
                </el-form-item>

                <!-- 红色 Tips -->
                <div class="subject-form-tips">*从主体，如果未找到，请先创建主体建档</div>

                <!-- 主体卡片详情 -->
                <transition name="el-fade-in">
                    <div class="subject-card" v-if="currentSubject">
                        <div class="card-title">
                            <el-icon><OfficeBuilding /></el-icon>
                            主体详细信息
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">主体名称</span>
                                <span class="value semibold">{{ currentSubject.name || '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">信用代码</span>
                                <span class="value">{{ currentSubject.socialCreditCode || currentSubject.idCard || '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">主体类型</span>
                                <span class="value"><el-tag size="small" effect="plain" v-if="currentSubject.category">{{ getCategoryLabel(currentSubject.category) }}</el-tag><span v-else>--</span></span>
                            </div>
                            <div class="info-item">
                                <span class="label">备案类型</span>
                                <span class="value">{{ currentSubject.type ? getFilingTypeLabel(currentSubject.type) : '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">联系人</span>
                                <span class="value">{{ currentSubject.contactName || '--' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">联系电话</span>
                                <span class="value">{{ currentSubject.contactPhone || '--' }}</span>
                            </div>
                            <div class="info-item span-2">
                                <span class="label">所属地区及详细地址</span>
                                <span class="value">{{ currentSubject.provinceCode ? `${currentSubject.provinceCode}${currentSubject.cityCode || ''}${currentSubject.districtCode || ''}` : '' }} {{ currentSubject.address || '--' }}</span>
                            </div>
                        </div>
                    </div>
                </transition>

                <!-- 底部操作按钮 -->
                <div class="form-footer">
                    <el-button type="primary" :loading="submitLoading" class="btn-submit" @click="handleSave">保存建档</el-button>
                    <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                </div>
            </el-form>
        </div>
        </div>

        <!-- 主体建档侧滑 -->
        <SubjectFormDrawer v-model="showSubjectDrawer" @success="handleSubjectCreateSuccess" />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Plus, Picture, Search, OfficeBuilding, View, Download } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';
import { UploadImg } from '@/components/UploadFile';
import AreaCascader from '@/components/AreaCascader/index.vue';
import * as ProductApi from '@/api/agri/product/index';
import * as SubjectApi from '@/api/agri/subject/index';
import { useMessage } from '@/hooks/web/useMessage';
import { useDict } from '@/hooks/web/useDict';
import { formatDate } from '@/utils/formatTime';
import SubjectFormDrawer from '@/views/filing/subject/components/SubjectFormDrawer.vue';
import { buildProductCreatePayload, getLastSubmittedProduct, saveLastSubmittedProduct } from './lastSubmitCache';

const { getLabel: getCategoryLabel } = useDict('agri_subject_category', 'str');
const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');
const { options: productCategoryOptions } = useDict('agri_product_category', 'str');

const showSubjectDrawer = ref(false);

const router = useRouter();
const route = useRoute();
const message = useMessage();
const formRef = ref(null);
const submitLoading = ref(false);
const copyLoading = ref(false);
const areaPath = ref([]);

const formData = reactive({
    productCode: '',
    productName: '',
    category: undefined,
    productionArea: '',
    provinceCode: '',
    cityCode: '',
    districtCode: '',
    productSpec: '',
    productUnit: 'kg',
    productImageUrl: '',
    archiveDate: formatDate(new Date(), 'YYYY-MM-DD'),
    subjectId: undefined
});

const formRules = {
    productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择产品类别', trigger: 'change' }],
    subjectId: [{ required: true, message: '请选择所属主体', trigger: 'change' }]
};

const subjectOptions = ref([]);
const currentSubject = ref(null);

const searchSubject = async (query) => {
    if (query !== '') {
        try {
            const data = await SubjectApi.getSubjectPage({ name: query, pageNo: 1, pageSize: 50 });
            subjectOptions.value = data.list;
        } catch (error) {
            console.error('搜索主体失败', error);
        }
    } else {
        subjectOptions.value = [];
    }
};

const handleSubjectChange = async (val) => {
    currentSubject.value = subjectOptions.value.find(item => item.id === val) || null;
};

const handleSubjectCreateSuccess = async (newId) => {
    try {
        const data = await SubjectApi.getSubject(newId);
        subjectOptions.value = [data];
        formData.subjectId = newId;
        currentSubject.value = data;
    } catch (error) {
        console.error('获取新主体失败', error);
    }
};

const loadingDetail = ref(false);

const loadDetail = async () => {
    const detailId = route.query.id;
    if (!detailId) {
        Object.assign(formData, {
            productCode: '',
            productName: '',
            category: undefined,
            productionArea: '',
            provinceCode: '',
            cityCode: '',
            districtCode: '',
            productSpec: '',
            productUnit: 'kg',
            productImageUrl: '',
            archiveDate: formatDate(new Date(), 'YYYY-MM-DD'),
            subjectId: undefined
        });
        currentSubject.value = null;
        return;
    };
    
    if (loadingDetail.value) return;
    loadingDetail.value = true;
    
    try {
        const data = await ProductApi.getProduct(detailId);
        Object.assign(formData, data);
        
        // 产品产地回显优化：
        if (data.provinceCode || data.cityCode || data.districtCode) {
            // 优先使用代码路径
            areaPath.value = [data.provinceCode, data.cityCode, data.districtCode].filter(Boolean);
        } else if (data.productionArea) {
            // 兼容模式：如果没有代码，则直接传入地区名称字符串（AreaCascader 会处理解析）
            areaPath.value = data.productionArea;
        }

        if (data.subjectId) {
            // 先尝试从现有选项中找，找不到再请求接口
            let subjectData = subjectOptions.value.find(item => item.id === data.subjectId);
            if (!subjectData) {
                subjectData = await SubjectApi.getSubject(data.subjectId);
                subjectOptions.value = [subjectData];
            }
            currentSubject.value = subjectData;
        }
    } catch (error) {
        console.error('加载详情失败', error);
    } finally {
        loadingDetail.value = false;
    }
};

onMounted(() => {
    loadDetail();
});

// 代码已移至顶部
watch(() => route.query.id, () => {
    loadDetail();
});

const handleSave = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            if (submitLoading.value) return;
            submitLoading.value = true;
            try {
                const submitData = buildProductCreatePayload(formData);

                const id = route.query.id;
                if (id) {
                    await ProductApi.updateProduct({ ...submitData, id: Number(id) });
                    message.success('更新成功');
                } else {
                    await ProductApi.createProduct(submitData);
                    message.success('创建成功');
                }
                saveLastSubmittedProduct(submitData);
                router.back();
            } catch (error) {
                console.error(error);
            } finally {
                submitLoading.value = false;
            }
        }
    });
};

const handleCopyPrevious = async () => {
    const cachedPayload = getLastSubmittedProduct();
    if (!cachedPayload) {
        message.warning('暂无可复制的上一条产品建档信息');
        return;
    }
    if (!cachedPayload.productName || !cachedPayload.category || !cachedPayload.subjectId) {
        message.warning('上一条产品建档信息不完整，无法复制');
        return;
    }
    if (copyLoading.value) return;
    copyLoading.value = true;
    try {
        Object.assign(formData, {
            productName: cachedPayload.productName || '',
            category: cachedPayload.category || undefined,
            productionArea: cachedPayload.productionArea || '',
            provinceCode: cachedPayload.provinceCode || '',
            cityCode: cachedPayload.cityCode || '',
            districtCode: cachedPayload.districtCode || '',
            productSpec: cachedPayload.productSpec || '',
            productUnit: cachedPayload.productUnit || 'kg',
            productImageUrl: cachedPayload.productImageUrl || '',
            archiveDate: cachedPayload.archiveDate || formatDate(new Date(), 'YYYY-MM-DD'),
            subjectId: cachedPayload.subjectId || undefined
        });

        if (cachedPayload.provinceCode || cachedPayload.cityCode || cachedPayload.districtCode) {
            areaPath.value = [cachedPayload.provinceCode, cachedPayload.cityCode, cachedPayload.districtCode].filter(Boolean);
        } else {
            areaPath.value = cachedPayload.productionArea || '';
        }

        if (cachedPayload.subjectId) {
            let subjectData = subjectOptions.value.find(item => item.id === cachedPayload.subjectId);
            if (!subjectData) {
                subjectData = await SubjectApi.getSubject(cachedPayload.subjectId);
                subjectOptions.value = subjectData ? [subjectData] : [];
            }
            currentSubject.value = subjectData || null;
        } else {
            currentSubject.value = null;
        }

        message.success('已回显上一条建档信息');
    } catch (error) {
        console.error('回显上一条建档信息失败', error);
        message.error('回显上一条失败，请稍后重试');
    } finally {
        copyLoading.value = false;
    }
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

.subject-form-tips {
    color: #F87171;
    font-size: 13px;
    margin-left: 130px;
    margin-top: -12px;
    margin-bottom: 24px;
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

.btn-copy-prev {
    min-width: 100px;
    height: 32px;
}

.card-header {
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

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
</style>
