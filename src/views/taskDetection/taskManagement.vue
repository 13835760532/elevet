<template>
    <div class="page-container">
        <PageBack></PageBack>
        <!-- 顶部标题区 -->
        <div class="header-section" style="margin-top: 12px;">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">创建检测方案</h1>
            </div>
            <div class="desc-box">
                配置新的农产品检测项目，包括项目名称、检测品种、时间要求及下发权限
            </div>
        </div>
        <div class="content-card">
            <!-- Tab 导航 -->
            <div class="tab-nav">
                <div class="tab-item active">录入检测方案</div>
                <div class="tab-item">方案拆分</div>
            </div>

            <!-- 表单区域 -->
            <div class="form-section">
                <h3 class="section-title">方案基本信息</h3>

                <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="scheme-form">
                    <!-- 方案名称 -->
                    <el-form-item label="方案名称" prop="schemeName">
                        <el-input v-model="formData.schemeName" placeholder="2026年1月北京市、天津市蔬菜快速检测工作方案（用户可修订）" />
                    </el-form-item>

                    <!-- 主管单位 -->
                    <el-form-item label="主管单位" prop="deptName">
                        <el-input v-model="formData.deptName" placeholder="北京市农业农村局（预设当前用户机构名称，可选择机构库中其他机构）" />
                    </el-form-item>

                    <!-- 方案类型 -->
                    <el-form-item label="方案类型" prop="schemeType">
                        <el-input v-model="formData.schemeType" placeholder="北京市农业农村局（预设当前用户机构名称，可选择机构库中其他机构）" />
                    </el-form-item>

                    <!-- 方案周期 -->
                    <el-form-item label="方案周期" prop="period">
                        <div class="period-row">
                            <el-select v-model="formData.periodType" placeholder="选择执行周期">
                                <el-option label="按月执行" value="month" />
                                <el-option label="按季执行" value="quarter" />
                            </el-select>
                            <el-select v-model="formData.year" placeholder="2026">
                                <el-option label="2026" value="2026" />
                                <el-option label="2025" value="2025" />
                            </el-select>
                            <el-select v-model="formData.month" placeholder="1月">
                                <el-option label="1月" value="1" />
                                <el-option label="2月" value="2" />
                                <el-option label="3月" value="3" />
                            </el-select>
                            <el-select v-model="formData.week" placeholder="第一周">
                                <el-option label="第一周" value="1" />
                                <el-option label="第二周" value="2" />
                            </el-select>
                        </div>
                    </el-form-item>

                    <!-- 检测地区 -->
                    <el-form-item label="检测地区" prop="region">
                        <el-input v-model="formData.region" placeholder="选择区划区，可输入多个区域，顿号隔开，例如北京、天津" />
                    </el-form-item>

                    <!-- 执行时间 -->
                    <el-form-item label="执行时间">
                        <div class="date-row">
                            <el-date-picker v-model="formData.startDate" type="date" placeholder="开始时间"
                                style="flex: 1" />
                            <el-date-picker v-model="formData.endDate" type="date" placeholder="结束时间" style="flex: 1" />
                        </div>
                    </el-form-item>

                    <!-- 检测产品分类 -->
                    <el-form-item label="检测产品分类" prop="productCategory">
                        <el-select v-model="formData.productCategory" placeholder="选择产品分类" style="width: 100%">
                            <el-option label="蔬菜" value="vegetable" />
                            <el-option label="水果" value="fruit" />
                        </el-select>
                    </el-form-item>

                    <!-- 方案检测总量 -->
                    <el-form-item label="方案检测总量">
                        <el-input v-model="formData.totalAmount" placeholder="请输入" />
                    </el-form-item>

                    <!-- 检测方案要求 -->
                    <el-form-item label="检测方案要求" prop="requirements">
                        <el-input v-model="formData.requirements" type="textarea" :rows="5"
                            placeholder="输入任务检测建议要求，最多支持500字" />
                    </el-form-item>

                    <!-- 方案附件 -->
                    <el-form-item label="方案附件" class="upload-item">
                        <el-upload class="upload-area" action="#" :auto-upload="false">
                            <el-button class="upload-btn">
                                <el-icon>
                                    <Upload />
                                </el-icon>
                                <span>上传附件</span>
                            </el-button>
                        </el-upload>
                        <div class="upload-tip">支持格式：docx、pdf、jpg</div>
                    </el-form-item>

                    <!-- 底部按钮 -->
                    <div class="form-footer">
                        <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                        <el-button type="primary" class="btn-submit" @click="handleSubmit">下一步</el-button>
                    </div>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Upload } from '@element-plus/icons-vue';


const router = useRouter();
const formRef = ref(null);

const formData = reactive({
    schemeName: '',
    deptName: '',
    schemeType: '',
    periodType: '',
    year: '',
    month: '',
    week: '',
    region: '',
    startDate: '',
    endDate: '',
    productCategory: '',
    totalAmount: '',
    requirements: '',
    attachments: []
});

const formRules = {
    schemeName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
    deptName: [{ required: true, message: '请输入主管单位', trigger: 'blur' }],
    schemeType: [{ required: true, message: '请输入方案类型', trigger: 'blur' }],
    region: [{ required: true, message: '请输入检测地区', trigger: 'blur' }],
    productCategory: [{ required: true, message: '请选择产品分类', trigger: 'change' }],
    requirements: [{ required: true, message: '请输入方案要求', trigger: 'blur' }]
};

/**\n * handleCancel：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleCancel = () => {
    router.back();
};

/**\n * handleSubmit：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleSubmit = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            console.log('提交表单:', formData);
            // 这里添加提交逻辑
        }
    });
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
}

.content-card {
    width: 100%;
    margin: 0 auto;
    padding: 16px;
    background: #fff;
    border-radius: 10px;
}

/* 顶部标题区 */
.header-section {
    height: auco;
    padding: 16px;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 10px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
}

.title-line {
    width: 4px;
    height: 16px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    line-height: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.desc-box {
    font-size: 16px;
    color: #333333;
    line-height: 21px;
    padding-left: 16px;
}

/* Tab 导航 */
.tab-nav {
    display: flex;
    gap: 40px;
    margin-bottom: 32px;
}

.tab-item {
    padding-bottom: 6px;
    font-weight: 400;
    font-size: 18px;
    color: #333333;
    cursor: pointer;
    position: relative;

    &.active {
        color: #00B3ED;
        font-weight: 500;

        &::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: #00B3ED;
        }
    }
}

/* 表单区域 */
.form-section {
    .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0 0 24px 0;
    }
}

.scheme-form {
    :deep(.el-form-item) {
        margin-bottom: 20px;
    }

    :deep(.el-form-item__label) {
        font-size: 14px;
        color: #333;
        padding-bottom: 8px;

        &::before {
            color: #EF4444;
        }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
        background: #FFFFFF;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        box-shadow: none !important;
        padding: 0 12px;
        height: 40px;
        line-height: 40px;

        &:hover {
            border-color: #00B3ED;
        }

        &.is-focus {
            border-color: #00B3ED;
            box-shadow: 0 0 0 3px rgba(0, 179, 237, 0.1) !important;
        }
    }

    :deep(.el-textarea__inner) {
        background: #FFFFFF;
        // border: 1px solid #D1D5DB;
        border-radius: 6px;
        padding: 10px 12px;

        &:hover {
            border-color: #00B3ED;
        }

        &:focus {
            border-color: #00B3ED;
            box-shadow: 0 0 0 3px rgba(0, 179, 237, 0.1);
        }
    }

    :deep(.el-select) {
        width: 160px;
    }
}

/* 方案周期行 */
.period-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

/* 日期行 */
.date-row {
    display: flex;
    gap: 12px;
}

.upload-item {
    // :deep(.el-form-item__content) {
    //     width: 100%;
    //     display: flex;
    //     flex-direction: column;
    //     align-items: flex-start;
    //     row-gap: 14px;
    // }

}

/* 上传区域 */
.upload-area {
    width: auto;

    :deep(.el-upload) {
        width: 100%;
    }
}

.upload-btn {
    width: 100%;
    height: 40px;
    background: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 0 12px;
    font-weight: 400;

    &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
    }

    .el-icon {
        font-size: 16px;
    }
}

.upload-tip {
    font-size: 14px;
    line-height: 16px;
    color: #999999;
    margin-top: 10px;
    margin-left: 10px;
}

/* 底部按钮 */
.form-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #E5E7EB;
}

.btn-cancel {
    min-width: 120px;
    height: 40px;
    background: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    color: #374151;

    &:hover {
        background: #F9FAFB;
        border-color: #9CA3AF;
    }
}

.btn-submit {
    min-width: 120px;
    height: 40px;
    background: #00B3ED;
    border-color: #00B3ED;
    border-radius: 6px;

    &:hover {
        background: #0099D1;
        border-color: #0099D1;
    }
}

/* 响应式 */
@media (max-width: 768px) {
    .content-card {
        padding: 16px 20px;
    }

    .period-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .date-row {
        flex-direction: column;
    }
}
</style>
