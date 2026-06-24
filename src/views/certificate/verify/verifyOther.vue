<template>
    <div class="verify-detail-page">
        <div class="page-content-card">
            <div v-if="!isEdit" class="source-tabs">
                <button
                    type="button"
                    class="source-tab"
                    :class="{ 'is-active': activeTab === 'internal' }"
                    @click="activeTab = 'internal'"
                >
                    待收合格证来源本平台开具
                </button>
                <button
                    type="button"
                    class="source-tab"
                    :class="{ 'is-active': activeTab === 'external' }"
                    @click="activeTab = 'external'"
                >
                    待收合格证来源其他平台开具
                </button>
            </div>

            <div class="main-body">
                <div class="upload-section">
                    <h2 class="upload-title">上传合格证照片</h2>
                    <div class="upload-row">
                        <div class="prototype-uploader-wrap upload-drag-box">
                            <el-upload
                                ref="uploadRef"
                                class="prototype-uploader"
                                drag
                                action="#"
                                :auto-upload="false"
                                :show-file-list="false"
                                accept=".jpg,.jpeg,.png,.webp,.rar,.zip"
                                multiple
                                @change="onFileChange"
                            >
                                <div class="uploader-content">
                                    <el-icon class="folder-icon">
                                        <FolderOpened />
                                    </el-icon>
                                    <div class="upload-text">
                                        <span class="upload-main-title">点击或将图片拖拽到这里上传</span>
                                        <p class="upload-tips">
                                            按住Ctrl可同时多选，支持上传rar/zip格式文件，单个文件不能超过500kb<br>
                                            严禁上传包含色情、暴力、反动等相关违法信息的文件。
                                        </p>
                                    </div>
                                </div>
                            </el-upload>
                        </div>
                        <el-button type="primary" class="upload-action-btn" @click="triggerUpload">
                            上传合格证照片
                        </el-button>
                    </div>
                </div>

                <div class="flow-divider">
                    <span class="flow-arrow" />
                </div>

                <!-- 4. 双栏布局 (表单 + 预览) -->
                <div class="detail-grid">
                    <!-- 左侧表单 -->
                    <div class="form-container">
                        <h3 class="group-title">产品信息</h3>
                        <el-form :model="formData" label-position="top" class="standard-form">
                            <el-form-item label="产品名称">
                                <el-input v-model="formData.productName" placeholder="白菜" />
                            </el-form-item>

                            <el-form-item label="产品产地">
                                <el-input v-model="formData.productionArea" placeholder="山东-济南" />
                            </el-form-item>

                            <el-row :gutter="16">
                                <el-col :span="14">
                                    <el-form-item label="重量/数量">
                                        <el-input v-model="formData.quantity" placeholder="10" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="10">
                                    <el-form-item label="单位">
                                        <el-select v-model="formData.unit" placeholder="选择计量单位">
                                            <el-option v-for="unit in measurementUnitOptions" :key="unit.value"
                                                :label="unit.label" :value="unit.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item label="建档日期">
                                <el-date-picker v-model="formData.issueDate" type="date" placeholder="2025-12-19"
                                    class="w-full" value-format="YYYY-MM-DD" />
                            </el-form-item>

                            <el-form-item label="联系人">
                                <el-input v-model="formData.contactName" placeholder="输入联系人" />
                            </el-form-item>

                            <el-form-item label="联系电话">
                                <el-input v-model="formData.contactPhone" placeholder="输入联系电话" />
                            </el-form-item>

                            <el-form-item label="生产经营企业（主体名称）">
                                <el-input v-model="formData.subjectName" placeholder="输入生产经营企业（主体名称）" />
                            </el-form-item>
                        </el-form>
                    </div>

                    <!-- 右侧预览 -->
                    <div class="preview-container">
                        <template v-if="activeTab === 'internal'">
                            <div class="preview-card-wrap">
                                <div class="preview-header">合格证预览</div>
                                <div class="certificate-mock">
                                    <div class="cert-code">合格证编号—{{ formData.certificateCode || 'HGZ9191991111' }}</div>
                                    <h4 class="cert-title">承诺达标合格证</h4>
                                    <div class="cert-body">
                                        <p class="promise" style="font-weight: 700; margin-bottom: 6px;">承诺事项：</p>
                                        <div class="cert-declaration-list" style="margin-bottom: 12px;">
                                            <p class="declaration-line" style="font-size: 13px; line-height: 1.6; margin: 4px 0; color: #333;">• 未使用禁用农药兽药、停用兽药和非法添加物</p>
                                            <p class="declaration-line" style="font-size: 13px; line-height: 1.6; margin: 4px 0; color: #333;">• 使用常规农药兽药残留不超标</p>
                                            <p class="declaration-line" style="font-size: 13px; line-height: 1.6; margin: 4px 0; color: #333;">• 对承诺的真实性负责</p>
                                        </div>
                                        <div class="cert-main">
                                            <div class="cert-left">
                                                <p class="label-item">承诺依据：</p>
                                                <div class="check-list">
                                                    <el-checkbox label="质量安全控制符合要求" checked disabled />
                                                    <el-checkbox label="自行检测合格" disabled />
                                                    <el-checkbox label="委托检测合格" disabled />
                                                </div>
                                            </div>
                                            <div class="cert-right">
                                                <div class="qr-placeholder">
                                                    <Icon icon="ep:grid" class="qr-icon" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="info-table">
                                            <div class="tr">
                                                <div class="td-label">产品名称</div>
                                                <div class="td-value">{{ formData.productName || '--' }}</div>
                                            </div>
                                            <div class="tr">
                                                <div class="td-label">产品数量</div>
                                                <div class="td-value">{{ formData.quantity }}{{
                                                    getAgriUnitLabel(formData.unit) }}</div>
                                            </div>
                                            <div class="tr">
                                                <div class="td-label">产品产地</div>
                                                <div class="td-value">{{ formData.productionArea || '--' }}</div>
                                            </div>
                                            <div class="tr">
                                                <div class="td-label">承诺主体</div>
                                                <div class="td-value">{{ formData.subjectName || '--' }}</div>
                                            </div>
                                            <div class="tr">
                                                <div class="td-label">联系方式</div>
                                                <div class="td-value">{{ formData.contactPhone || '--' }}</div>
                                            </div>
                                            <div class="tr">
                                                <div class="td-label">开具时间</div>
                                                <div class="td-value">{{ formData.issueDate || '--' }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else>
                            <div class="preview-card-wrap">
                                <div class="preview-header">上游合格证预览</div>
                                <div class="external-preview-content">
                                    <div class="info-list-side">
                                        <div class="s-item"><span class="s-label">合格证编号</span><span class="s-val">{{
                                                formData.certificateCode || '--' }}</span></div>
                                        <div class="s-item"><span class="s-label">出证类型</span><span
                                                class="s-val">--</span></div>
                                        <div class="s-item"><span class="s-label">产品档案编号</span><span
                                                class="s-val">--</span></div>
                                        <div class="s-item required"><span class="s-label">产品名称</span><span
                                                class="s-val">{{ formData.productName }}</span></div>
                                        <div class="s-item required"><span class="s-label">重量/数量</span><span
                                                class="s-val">{{ formData.quantity }} {{ getAgriUnitLabel(formData.unit)
                                                }}</span></div>
                                        <div class="s-item required"><span class="s-label">产品产地</span><span
                                                class="s-val">{{ formData.productionArea }}</span></div>
                                        <div class="s-item required"><span class="s-label">生产经营主体</span><span
                                                class="s-val">{{ formData.subjectName }}</span></div>
                                    </div>
                                    <div class="image-preview-side">
                                        <el-image v-if="formData.certificateImageUrl"
                                            :src="formData.certificateImageUrl" fit="contain" class="original-img" />
                                        <div v-else class="img-empty">
                                            <Icon icon="ep:picture" />
                                            <span>原始照片预览</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <!-- 底部固定操作栏 -->
            <div class="bottom-actions">
                <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
                <el-button type="primary" class="btn-save" @click="handleSubmit">存证</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FolderOpened } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import { parseImage, createArchive, getVerification, updateCertificateVerification } from '@/api/agri/certificateVerification/index';
import {
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    getAgriUnitLabel,
    usePreferredAgriMeasurementUnitOptions
} from '@/utils/agriUnit';

const router = useRouter();
const route = useRoute();
const activeTab = ref('internal');
const isEdit = ref(!!route.query.id);
const uploadRef = ref(null);

const formData = reactive({
    productName: '',
    productionArea: '',
    quantity: '',
    unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
    issueDate: '',
    contactName: '',
    contactPhone: '',
    subjectName: '',
    certificateImageUrl: '',
    certificateCode: '',
    productCategory: '',
    subjectId: null,
    certificateType: null,
    source: 1
});

const unitRef = computed({
    get: () => formData.unit,
    set: (value) => {
        formData.unit = value || DEFAULT_AGRI_MEASUREMENT_UNIT;
    }
});
const measurementUnitOptions = usePreferredAgriMeasurementUnitOptions(
    unitRef,
    ['千克', 'kg'],
    DEFAULT_AGRI_MEASUREMENT_UNIT,
    computed(() => !isEdit.value)
);

const triggerUpload = () => {
    const uploadEl = uploadRef.value?.$el || uploadRef.value;
    const inputEl = uploadEl?.querySelector?.('input[type="file"]');
    inputEl?.click();
};

const onFileChange = async (uploadFile) => {
    const loading = ElLoading.service({
        target: '.upload-drag-box',
        text: '正在智能识别合格证...',
        background: 'rgba(255, 255, 255, 0.7)'
    });

    try {
        const sourceHint = activeTab.value === 'internal' ? 1 : 2;
        const data = await parseImage({
            file: uploadFile.raw,
            sourceHint
        });
        if (data && !data.matched) {
            ElMessage.warning(data.message || '未能识别到匹配的信息，请手动补全');
        } else {
            ElMessage.success(data.message || '识别成功');
        }

        formData.certificateImageUrl = data.certificateImageUrl;
        formData.source = data.source;
        activeTab.value = data.source === 1 ? 'internal' : 'external';

        if (data.source === 1 && data.certificate) {
            const cert = data.certificate;
            formData.productName = cert.productName;
            formData.productCategory = cert.productCategory;
            formData.productionArea = cert.productionArea;
            formData.quantity = cert.quantity;
            formData.unit = cert.unit || DEFAULT_AGRI_MEASUREMENT_UNIT;
            formData.issueDate = cert.issueDate;
            formData.contactName = cert.contactName;
            formData.contactPhone = cert.contactPhone;
            formData.subjectName = cert.subjectName;
            formData.subjectId = cert.subjectId;
            formData.certificateCode = cert.certificateCode;
            formData.certificateType = cert.certificateType;
        } else if (data.source === 2 && data.ocrData) {
            const ocr = data.ocrData;
            formData.productName = ocr.productName || '';
            formData.productCategory = ocr.productCategory || '';
            formData.productionArea = ocr.productionArea || '';
            formData.quantity = ocr.quantity || '';
            formData.unit = ocr.unit || DEFAULT_AGRI_MEASUREMENT_UNIT;
            formData.issueDate = ocr.issueDate || '';
            formData.contactName = ocr.contactName || '';
            formData.contactPhone = ocr.contactPhone || '';
            formData.subjectName = ocr.subjectName || '';
            formData.certificateCode = ocr.certificateCode || '';
            formData.certificateType = ocr.certificateType;
        }

    } catch (e) {
        console.error('识别失败', e);
        // 如果后端传回了 msg，则显示该错误，否则显示通用提示
        ElMessage.error(e.msg || e.message || '识别服务异常，请手动填写');
    } finally {
        loading.close();
    }
};

const handleCancel = () => {
    router.back();
};

onMounted(async () => {
    if (isEdit.value) {
        try {
            const data = await getVerification(Number(route.query.id));
            console.log(data)
            if (data) {
                Object.assign(formData, data);
                formData.source = data.certificateSource;
                activeTab.value = data.certificateSource === 1 ? 'internal' : 'external';
            }
        } catch (e) {
            console.error('加载详情失败', e);
        }
    }
});

const handleSubmit = async () => {
    if (!formData.certificateImageUrl) {
        ElMessage.warning('请先上传并识别合格证照片');
        return;
    }

    // 使用全量合并，保留详情接口返回的所有原始字段，并覆盖修改后的值
    const submitData = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        source: formData.source,
        certificateSource: formData.source, // 兼容某些接口可能使用的字段名
        certificateType: formData.certificateType || 1,
        remark: formData.remark || (isEdit.value ? '后台修改存证' : '后台录入存证')
    };

    // 按 source 映射对应编号字段
    if (formData.source === 1) {
        submitData.certificateCode = formData.certificateCode;
    } else {
        submitData.externalCertificateCode = formData.certificateCode;
    }

    if (isEdit.value) {
        submitData.id = Number(route.query.id);
    }

    const loading = ElLoading.service({ text: isEdit.value ? '正在更新记录...' : '正在提交存证记录...' });
    try {
        if (isEdit.value) {
            await updateCertificateVerification(submitData);
            ElMessage.success('存证记录已更新');
        } else {
            await createArchive(submitData);
            ElMessage.success('存证记录已成功保存');
        }
        router.push('/certificate/verify');
    } catch (e) {
        console.error('提交失败', e);
    } finally {
        loading.close();
    }
};
</script>

<style lang="scss" scoped>
.verify-detail-page {
    min-height: calc(100vh - 86px);
    background:
        linear-gradient(180deg, rgba(0, 179, 237, 0.025) 0, rgba(255, 255, 255, 0) 148px),
        #fff;
    display: flex;
    flex-direction: column;
    color: #151515;

    .page-content-card {
        flex: 1;
        overflow-y: auto;
        background: #fff;
        padding: 0 0 36px;
        border-top: 3px solid #00B3ED;

        &::-webkit-scrollbar {
            display: none;
            width: 0;
        }
    }

    .source-tabs {
        display: flex;
        align-items: flex-start;
        gap: clamp(44px, 5vw, 84px);
        padding: 28px 48px 0 56px;
    }

    .source-tab {
        position: relative;
        border: 0;
        background: transparent;
        padding: 0 0 16px;
        color: #101010;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0;
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover,
        &.is-active {
            color: #06313f;
        }

        &.is-active::after {
            content: '';
            position: absolute;
            left: 2px;
            right: 2px;
            bottom: 0;
            height: 4px;
            border-radius: 999px;
            background: linear-gradient(90deg, #00B3ED 0%, rgba(0, 179, 237, 0.28) 100%);
        }
    }

    .upload-section {
        padding: 34px 48px 0 56px;

        .upload-title {
            position: relative;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin: 0 0 18px;
            color: #101820;
            font-size: 21px;
            font-weight: 700;
            line-height: 1.25;
            letter-spacing: 0;

            &::before {
                content: '';
                width: 4px;
                height: 20px;
                border-radius: 999px;
                background: #00B3ED;
            }
        }

        .upload-row {
            display: flex;
            align-items: center;
            gap: clamp(24px, 4vw, 56px);
        }

        .prototype-uploader-wrap {
            flex: 0 1 760px;
            max-width: 760px;
            min-width: 0;
            width: 100%;

            :deep(.el-upload) {
                width: 100%;

                .el-upload-dragger {
                    width: 100%;
                    height: 198px;
                    border: 1px dashed rgba(0, 179, 237, 0.42);
                    background:
                        linear-gradient(180deg, rgba(0, 179, 237, 0.035) 0%, rgba(255, 255, 255, 0.98) 100%),
                        #fff;
                    border-radius: 6px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow:
                        inset 0 0 0 1px rgba(255, 255, 255, 0.8),
                        0 8px 20px rgba(5, 72, 98, 0.035);
                    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

                    &:hover {
                        border-color: #00B3ED;
                        background-color: #fbfeff;
                        box-shadow:
                            inset 0 0 0 1px rgba(255, 255, 255, 0.9),
                            0 10px 24px rgba(0, 179, 237, 0.08);
                    }
                }
            }

            .uploader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                .folder-icon {
                    width: 58px;
                    height: 48px;
                    margin-bottom: 18px;
                    color: #00B3ED;
                    font-size: 46px;
                    line-height: 1;
                }

                .upload-text {
                    text-align: center;

                    .upload-main-title {
                        display: block;
                        color: #17242b;
                        font-size: 18px;
                        font-weight: 700;
                        line-height: 1.35;
                    }

                    .upload-tips {
                        margin: 14px 0 0;
                        color: #87939a;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 1.55;
                    }
                }
            }
        }

        .upload-action-btn {
            width: 146px;
            height: 44px;
            flex: 0 0 146px;
            border: 0;
            border-radius: 5px;
            background: #00B3ED;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0;
            box-shadow: 0 8px 18px rgba(0, 179, 237, 0.18);
            transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

            &:hover,
            &:focus {
                background: #00a3d8;
                color: #fff;
                box-shadow: 0 10px 20px rgba(0, 179, 237, 0.24);
                transform: translateY(-1px);
            }
        }
    }

    .flow-divider {
        position: relative;
        height: 86px;
        margin: 14px 0 0;
        overflow: hidden;

        &::before {
            content: '';
            position: absolute;
            top: 36px;
            left: 56px;
            right: 0;
            height: 2px;
            background-image: linear-gradient(to right, rgba(0, 179, 237, 0.32) 0 52%, transparent 52% 100%);
            background-position: 0 0;
            background-repeat: repeat-x;
            background-size: 14px 2px;
            animation: dashFlow 1.2s linear infinite;
        }

        .flow-arrow {
            position: absolute;
            top: 8px;
            left: 51.5%;
            width: 72px;
            height: 72px;
            transform: translateX(-50%);
            animation: arrowFlow 2s ease-in-out infinite;

            &::before,
            &::after {
                content: '';
                position: absolute;
                left: 50%;
                width: 0;
                height: 0;
                transform: translateX(-50%);
            }

            &::before {
                top: 0;
                border-right: 34px solid transparent;
                border-left: 34px solid transparent;
                border-top: 70px solid rgba(0, 179, 237, 0.32);
            }

            &::after {
                top: 2px;
                border-right: 31px solid transparent;
                border-left: 31px solid transparent;
                border-top: 64px solid #fff;
            }
        }
    }

    .detail-grid {
        display: grid;
        grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
        gap: 48px;
        padding: 0 48px 0 56px;

        .form-container {
            .group-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 24px;
                color: #1e293b;
            }

            .standard-form {
                :deep(.el-form-item) {
                    margin-bottom: 20px;
                }
            }
        }
    }

    .preview-container {
        .preview-card-wrap {
            border: 1px solid #f1f5f9;
            border-radius: 8px;
            overflow: hidden;

            .preview-header {
                background: #f1f5f9;
                padding: 12px;
                text-align: center;
                font-weight: 600;
            }
        }
    }

    .certificate-mock {
        padding: 24px;

        .cert-code {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 16px;
        }

        .cert-title {
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 12px;
        }

        .cert-body {
            .promise {
                font-weight: 600;
                font-size: 15px;
            }

            .cert-main {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
            }

            .info-table {
                .tr {
                    display: flex;
                    border-bottom: 1px solid #f8fafc;

                    .td-label {
                        width: 90px;
                        background: #f8fafc;
                        padding: 10px;
                    }

                    .td-value {
                        flex: 1;
                        padding: 10px;
                    }
                }
            }
        }
    }

    .external-preview-content {
        display: flex;
        padding: 20px;
        gap: 20px;

        .info-list-side {
            flex: 1;

            .s-item {
                display: flex;
                margin-bottom: 12px;
                font-size: 13px;

                .s-label {
                    width: 100px;
                    color: #64748b;
                }

                &.required .s-label::before {
                    content: '*';
                    color: #ef4444;
                    margin-right: 4px;
                }
            }
        }

        .image-preview-side {
            width: 240px;
            height: 320px;
            border: 1px dashed #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;

            .original-img {
                width: 100%;
                height: 100%;
            }

            .img-empty {
                color: #94a3b8;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
        }
    }

    .bottom-actions {
        margin: 28px 48px 0 56px;
        padding: 20px 0 0;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        .btn-save {
            padding: 0 40px;
        }
    }
}

@keyframes dashFlow {
    from {
        background-position-x: 0;
    }

    to {
        background-position-x: 14px;
    }
}

@keyframes arrowFlow {
    0% {
        transform: translate(-50%, -5px);
        opacity: 0.55;
    }

    45% {
        transform: translate(-50%, 6px);
        opacity: 1;
    }

    100% {
        transform: translate(-50%, 13px);
        opacity: 0.5;
    }
}

@media (max-width: 1180px) {
    .verify-detail-page {
        .source-tabs {
            gap: 48px;
            padding-right: 32px;
            padding-left: 40px;
        }

        .source-tab {
            font-size: 18px;
        }

        .upload-section {
            padding-right: 40px;
            padding-left: 40px;

            .upload-row {
                align-items: stretch;
                flex-direction: column;
            }

            .upload-action-btn {
                width: 146px;
                flex-basis: 44px;
            }
        }

        .flow-divider::before {
            left: 40px;
        }

        .detail-grid {
            grid-template-columns: 1fr;
            padding: 0 40px;
        }

        .bottom-actions {
            margin-right: 40px;
            margin-left: 40px;
        }
    }
}
</style>
