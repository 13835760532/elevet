<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">合格证查验</h1>
            </div>
            <p class="page-subtitle">显示合格证开具时信息</p>
        </div>

        <!-- 内容区 -->
        <div class="content-card">
            <!-- 来源选择 -->
            <el-select v-model="formData.source" placeholder="请选择来源" class="source-select">
                <el-option label="农产品上游合格证为其他平台开具" value="other" />
                <el-option label="农产品上游合格证为本平台开具" value="platform" />
            </el-select>

            <!-- 上传区域 -->
            <div class="upload-row">
                <el-input v-model="formData.uploadFile" placeholder="上传上游合格证照片" readonly class="upload-input" />
                <el-button type="primary" class="upload-btn" @click="handleUpload">上传合格证</el-button>
            </div>

            <!-- 产品信息表单 -->
            <div class="form-section">
                <h3 class="section-title">产品信息</h3>

                <el-form :model="formData" label-position="top" class="product-form">
                    <el-form-item label="产品名称">
                        <el-input v-model="formData.productName" placeholder="输入产品名称" />
                    </el-form-item>

                    <el-form-item label="产品类别">
                        <el-select v-model="formData.category" placeholder="选择产品类别" class="full-width">
                            <el-option label="蔬菜" value="vegetable" />
                            <el-option label="水果" value="fruit" />
                            <el-option label="畜禽" value="livestock" />
                            <el-option label="水产品" value="aquatic" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="产品产地">
                        <el-input v-model="formData.origin" placeholder="输入产品的生产地" />
                    </el-form-item>

                    <el-form-item label="批次规模">
                        <div class="batch-row">
                            <el-input v-model="formData.batchSize" placeholder="输入产品数量" class="batch-input" />
                            <el-select v-model="formData.unit" placeholder="选择计量单位" class="unit-select">
                                <el-option label="吨" value="t" />
                                <el-option label="千克" value="kg" />
                                <el-option label="斤" value="jin" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <el-form-item label="建档日期">
                        <el-date-picker v-model="formData.createDate" type="date" placeholder="选择日期"
                            class="full-width" />
                    </el-form-item>

                    <el-form-item label="生产经营企业（主体名称）">
                        <p class="field-tip">*从生产档案中选择，如果未查找到企业，支持主体建档</p>
                        <el-select v-model="formData.entity" placeholder="选择企业" filterable class="full-width">
                            <el-option label="北京物美商业集团股份有限公司（110201181788786816）" value="1" />
                            <el-option label="北京福农生态科技有限公司（110201181788786817）" value="2" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 底部按钮 -->
            <div class="form-footer">
                <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                <el-button type="primary" class="btn-submit" @click="handleSubmit">查验并存证</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 表单数据
const formData = reactive({
    source: 'other',
    uploadFile: '',
    productName: '',
    category: '',
    origin: '',
    batchSize: '',
    unit: 'kg',
    createDate: '2025-12-19',
    entity: ''
});

const handleUpload = () => {
    ElMessage.info('上传合格证照片功能开发中');
};

const handleCancel = () => {
    router.push('/certificate/verify');
};

const handleSubmit = () => {
    if (!formData.productName) {
        ElMessage.warning('请输入产品名称');
        return;
    }
    ElMessage.success('查验并存证成功');
    router.push('/certificate/verify');
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
}

.header-section {
    padding: 20px 24px;
    margin-bottom: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 16px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}

.title-line {
    width: 4px;
    height: 20px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.page-subtitle {
    font-size: 14px;
    color: #666;
    margin: 8px 0 0 14px;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 32px;
    max-width: 500px;
}

/* 来源选择 */
.source-select {
    width: 100%;
    margin-bottom: 20px;
}

/* 上传区域 */
.upload-row {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
}

.upload-input {
    flex: 1;
}

.upload-btn {
    min-width: 120px;
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
}

/* 表单区域 */
.form-section {
    margin-bottom: 32px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
}

.product-form {
    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        font-weight: 600;
        color: #333;
        padding-bottom: 8px;
    }
}

.full-width {
    width: 100%;
}

.batch-row {
    display: flex;
    gap: 12px;
}

.batch-input {
    flex: 1;
}

.unit-select {
    width: 140px;
}

.field-tip {
    font-size: 12px;
    color: #999;
    margin: 0 0 8px 0;
}

/* 底部按钮 */
.form-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
}

.btn-cancel {
    min-width: 100px;
    height: 44px;
    border-radius: 22px;
    border-color: #D1D5DB;
    color: #666;
}

.btn-submit {
    min-width: 140px;
    height: 44px;
    border-radius: 22px;
    background: linear-gradient(135deg, #00B3ED 0%, #0099D6 100%);
    border: none;
}

/* 深度样式覆盖 */
:deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #E5E7EB inset;

    &:hover {
        box-shadow: 0 0 0 1px #00B3ED inset;
    }

    &.is-focus {
        box-shadow: 0 0 0 1px #00B3ED inset;
    }
}

:deep(.el-select) {
    .el-input__wrapper {
        border-radius: 6px;
    }
}
</style>
