<template>
    <div class="verify-detail-page">
        <!-- 1. 统一查验头部 -->
        <pageHeader title="合格证收证"  desc="上传合格证照片进行收证"/>

        <!-- 2. 统一内容大卡片 -->
        <div class="page-content-card">
            <!-- Tab 切换区 (仅非编辑模式显示) -->
            <div v-if="!isEdit" class="content-tabs-wrapper">
                <el-tabs v-model="activeTab" class="custom-nav-tabs">
                    <el-tab-pane label="农产品上游合格证为本平台开具" name="internal" />
                    <el-tab-pane label="其他来源" name="external" />
                </el-tabs>
            </div>

            <div class="main-body">
                <!-- 3. 顶部上传区 -->
                <div class="upload-section">
                    <p class="upload-label">上传合格证照片</p>
                    <div class="upload-drag-box">
                        <el-upload
                            class="ocr-uploader"
                            drag
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            @change="onFileChange"
                        >
                            <el-icon class="el-icon--upload"><FolderOpened /></el-icon>
                            <div class="el-upload__text">
                                点击或将图片拖拽到这里上传
                                <p class="support-text">按住Ctrl可同时多选。支持上传rar/zip格式文件。单个文件不能超过500kb</p>
                                <p class="support-text">严禁上传包含色情、暴力、反动等相关违法信息的文件。</p>
                            </div>
                        </el-upload>
                        <el-button type="primary" class="upload-btn">上传合格证照片</el-button>
                    </div>
                </div>

                <div class="divider-dashed"></div>

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
                                            <el-option label="kg" value="kg" />
                                            <el-option label="吨" value="ton" />
                                            <el-option label="箱" value="box" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item label="建档日期">
                                <el-date-picker 
                                    v-model="formData.issueDate" 
                                    type="date" 
                                    placeholder="2025-12-19" 
                                    class="w-full"
                                    value-format="YYYY-MM-DD"
                                />
                            </el-form-item>

                            <el-form-item label="联系人">
                                <el-input v-model="formData.contactName" placeholder="输入联系人" />
                            </el-form-item>

                            <el-form-item label="联系电话">
                                <el-input v-model="formData.contactPhone" placeholder="输入联系电话" />
                            </el-form-item>

                            <el-form-item label="生产经营企业（主体名称）">
                                <el-input v-model="formData.subjectName" placeholder="北京朝阳本来生活大悦城分店" />
                            </el-form-item>
                        </el-form>
                    </div>

                    <!-- 右侧预览 -->
                    <div class="preview-container">
                        <template v-if="activeTab === 'internal'">
                            <div class="preview-card-wrap">
                                <div class="preview-header">合格证预览</div>
                                <div class="certificate-mock">
                                    <div class="cert-code">合格证编号—{{formData.certificateCode || 'HGZ9191991111'}}</div>
                                    <h4 class="cert-title">承诺达标合格证</h4>
                                    <div class="cert-body">
                                        <p class="promise">我承诺生产销售的食用农产品</p>
                                        <p class="promise-detail">未使用禁用农兽药、兽药及其他化合物；使用的常规农药、兽药残留不超标。</p>
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
                                            <div class="tr"><div class="td-label">产品名称</div><div class="td-value">{{formData.productName || '--'}}</div></div>
                                            <div class="tr"><div class="td-label">产品数量</div><div class="td-value">{{formData.quantity}}{{formData.unit}}</div></div>
                                            <div class="tr"><div class="td-label">产品产地</div><div class="td-value">{{formData.productionArea || '--'}}</div></div>
                                            <div class="tr"><div class="td-label">承诺主体</div><div class="td-value">{{formData.subjectName || '--'}}</div></div>
                                            <div class="tr"><div class="td-label">联系方式</div><div class="td-value">{{formData.contactPhone || '--'}}</div></div>
                                            <div class="tr"><div class="td-label">开具时间</div><div class="td-value">{{formData.issueDate || '--'}}</div></div>
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
                                        <div class="s-item"><span class="s-label">合格证编号</span><span class="s-val">{{formData.certificateCode || '--'}}</span></div>
                                        <div class="s-item"><span class="s-label">出证类型</span><span class="s-val">--</span></div>
                                        <div class="s-item"><span class="s-label">产品档案编号</span><span class="s-val">--</span></div>
                                        <div class="s-item required"><span class="s-label">产品名称</span><span class="s-val">{{formData.productName}}</span></div>
                                        <div class="s-item required"><span class="s-label">重量/数量</span><span class="s-val">{{formData.quantity}} {{formData.unit}}</span></div>
                                        <div class="s-item required"><span class="s-label">产品产地</span><span class="s-val">{{formData.productionArea}}</span></div>
                                        <div class="s-item required"><span class="s-label">生产经营主体</span><span class="s-val">{{formData.subjectName}}</span></div>
                                    </div>
                                    <div class="image-preview-side">
                                        <el-image 
                                            v-if="formData.certificateImageUrl" 
                                            :src="formData.certificateImageUrl" 
                                            fit="contain" 
                                            class="original-img"
                                        />
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
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { FolderOpened } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import { parseImage, createArchive, getVerification, updateCertificateVerification } from '@/api/agri/certificateVerification/index';

const router = useRouter();
const route = useRoute();
const activeTab = ref('internal');
const isEdit = ref(!!route.query.id);

const formData = reactive({
    productName: '',
    productionArea: '',
    quantity: '',
    unit: 'kg',
    issueDate: '',
    contactName: '',
    contactPhone: '',
    subjectName: '',
    certificateImageUrl: '',
    certificateCode: '',
    source: 1
});

const onFileChange = async (uploadFile) => {
    const loading = ElLoading.service({
        target: '.upload-drag-box',
        text: '正在智能识别合格证...',
        background: 'rgba(255, 255, 255, 0.7)'
    });
    
    try {
        const sourceHint = activeTab.value === 'internal' ? 1 : 2;
        const res = await parseImage({
            file: uploadFile.raw,
            sourceHint
        });
        
        const data = res.data;
        if (!data.matched) {
            ElMessage.warning('未能识别到匹配的信息，请手动补全');
        } else {
            ElMessage.success('识别成功');
        }

        formData.certificateImageUrl = data.certificateImageUrl;
        formData.source = data.source;
        activeTab.value = data.source === 1 ? 'internal' : 'external';

        if (data.source === 1 && data.certificate) {
            const cert = data.certificate;
            formData.productName = cert.productName;
            formData.productionArea = cert.productionArea;
            formData.quantity = cert.quantity;
            formData.unit = cert.unit || 'kg';
            formData.issueDate = cert.issueDate;
            formData.contactName = cert.contactName;
            formData.contactPhone = cert.contactPhone;
            formData.subjectName = cert.subjectName;
            formData.certificateCode = cert.certificateCode;
        } else if (data.source === 2 && data.ocrData) {
            const ocr = data.ocrData;
            formData.productName = ocr.productName || '';
            formData.productionArea = ocr.productionArea || '';
            formData.quantity = ocr.quantity || '';
            formData.unit = ocr.unit || 'kg';
            formData.issueDate = ocr.issueDate || '';
            formData.contactName = ocr.contactName || '';
            formData.contactPhone = ocr.contactPhone || '';
            formData.subjectName = ocr.subjectName || '';
            formData.certificateCode = ocr.certificateCode || '';
        }

    } catch (e) {
        console.error('识别失败', e);
        ElMessage.error('识别服务异常，请手动填写');
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
            if (data) {
                Object.assign(formData, data);
                activeTab.value = data.source === 1 ? 'internal' : 'external';
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
    
    const submitData = {
        certificateSource: formData.source, 
        verificationType: 2, 
        certificateImageUrl: formData.certificateImageUrl,
        certificateCode: formData.certificateCode,
        productName: formData.productName,
        productionArea: formData.productionArea,
        quantity: Number(formData.quantity) || 0,
        unit: formData.unit,
        issueDate: formData.issueDate,
        subjectName: formData.subjectName,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        certificateType: 1,
        remark: isEdit.value ? '后台修改存证' : '后台录入存证'
    };

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
    background-color: #f5f7fa;
    height: calc(100vh - 86px);
    display: flex;
    flex-direction: column;

    .page-content-card {
        flex: 1;
        overflow-y: auto;
        background: #fff;
        padding: 16px;
        margin-top: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);

        &::-webkit-scrollbar {
            display: none;
            width: 0;
        }
    }

    .content-tabs-wrapper {
        padding: 0 16px 16px;
        .custom-nav-tabs {
            :deep(.el-tabs__header) { margin-bottom: 0; border-bottom: none; }
            :deep(.el-tabs__item) {
                font-size: 15px;
                color: #64748b;
                height: 50px;
                &.is-active { font-weight: 600; color: var(--el-color-primary); }
            }
        }
    }

    .main-body {
        padding: 0 16px;
    }

    .upload-section {
        .upload-label { font-size: 14px; color: #1e293b; margin-bottom: 12px; }
        .upload-drag-box {
            display: flex; gap: 20px; align-items: flex-end;
            .ocr-uploader {
                flex: 1;
                :deep(.el-upload-dragger) { border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 30px; }
            }
            .upload-btn { height: 40px; padding: 0 24px; }
        }
    }

    .divider-dashed {
        height: 1px;
        background-image: linear-gradient(to right, #e2e8f0 40%, rgba(255, 255, 255, 0) 0%);
        background-position: bottom; background-size: 8px 1px; background-repeat: repeat-x;
        margin: 32px 0;
    }

    .detail-grid {
        display: grid; grid-template-columns: 360px 1fr; gap: 60px;
        .form-container {
            .group-title { font-size: 16px; font-weight: 600; margin-bottom: 24px; color: #1e293b; }
            .standard-form { :deep(.el-form-item) { margin-bottom: 20px; } }
        }
    }

    .preview-container {
        .preview-card-wrap {
            border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden;
            .preview-header { background: #f1f5f9; padding: 12px; text-align: center; font-weight: 600; }
        }
    }

    .certificate-mock {
        padding: 24px;
        .cert-code { font-size: 13px; color: #64748b; margin-bottom: 16px; }
        .cert-title { font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 12px; }
        .cert-body {
            .promise { font-weight: 600; font-size: 15px; }
            .cert-main { display: flex; justify-content: space-between; margin: 20px 0; }
            .info-table { .tr { display: flex; border-bottom: 1px solid #f8fafc; .td-label { width: 90px; background: #f8fafc; padding: 10px; } .td-value { flex: 1; padding: 10px; } } }
        }
    }

    .external-preview-content {
        display: flex; padding: 20px; gap: 20px;
        .info-list-side {
            flex: 1;
            .s-item {
                display: flex; margin-bottom: 12px; font-size: 13px;
                .s-label { width: 100px; color: #64748b; }
                &.required .s-label::before { content: '*'; color: #ef4444; margin-right: 4px; }
            }
        }
        .image-preview-side {
            width: 240px; height: 320px; border: 1px dashed #e2e8f0; display: flex; align-items: center; justify-content: center;
            .original-img { width: 100%; height: 100%; }
            .img-empty { color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        }
    }

    .bottom-actions {
        margin-top: 32px; padding: 20px 0; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px;
        .btn-save { padding: 0 40px; }
    }
}
</style>
