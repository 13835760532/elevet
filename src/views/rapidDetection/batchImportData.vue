<template>
    <div class="page-container">
        <PageBack>
            <h2 class="card-title">批量导入抽检信息(支持导入第三方检测结果数据)</h2>
        </PageBack>
        <!-- 导入预览 -->
        <div class="content-card">
            <div class="preview-header">
                <h3 class="section-title">导入预览：</h3>
                <span type="primary" link @click="handleDownloadTemplate" class="download-link">
                    下载导入模板
                </span>
            </div>

            <div class="preview-table-wrapper">
                <el-table :data="previewList" class="preview-table" border>
                    <el-table-column label="序号" type="index" width="60" align="center" />
                    <el-table-column label="样品编号" prop="sampleNo" width="130" align="center" />
                    <el-table-column label="样品名称" prop="sampleName" width="80" align="center" />
                    <el-table-column label="样品来源" prop="source" width="100" align="center" />
                    <el-table-column label="产品分类" prop="category" width="80" align="center" />
                    <el-table-column label="产品产地" prop="origin" width="80" align="center" />
                    <el-table-column label="被检主体" prop="subject" min-width="100" show-overflow-tooltip />
                    <el-table-column label="抽样检测地区" prop="region" width="100" align="center" />
                    <el-table-column label="检测机构" prop="testOrg" min-width="130" show-overflow-tooltip />
                    <el-table-column label="检测时间" prop="testTime" width="100" align="center" />
                    <el-table-column label="检测结果" prop="testResult" width="80" align="center">
                        <template #default="scope">
                            <span :class="scope.row.testResult === '阴性' ? 'result-negative' : 'result-positive'">
                                {{ scope.row.testResult }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 批量导入三方检测结果 -->
            <div class="upload-section">
                <h3 class="section-title">批量导入三方检测结果</h3>
                <el-upload class="upload-dragger" drag action="#" :auto-upload="false" :on-change="handleFileChange"
                    accept=".xlsx,.xls,.csv" :show-file-list="false">
                    <div class="upload-content">
                        <el-icon class="upload-icon">
                            <UploadFilled />
                        </el-icon>
                        <p class="upload-text">拖拽文件到此处或点击选择</p>
                        <p class="upload-hint">支持 Excel (.xlsx, .xls) 或 CSV (.csv) 格式</p>
                    </div>
                </el-upload>
            </div>

            <!-- 文件上传要求 -->
            <div class="requirements-box">
                <div class="requirements-header">
                    <el-icon class="info-icon">
                        <InfoFilled />
                    </el-icon>
                    <span class="requirements-title">文件上传要求</span>
                </div>
                <div class="requirements-content">
                    <p class="req-item">
                        <el-icon>
                            <Document />
                        </el-icon>
                        <span><strong>支持格式：</strong>Excel (.xlsx, .xls) 或 CSV (.csv)</span>
                    </p>
                    <p class="req-item">
                        <el-icon>
                            <FolderOpened />
                        </el-icon>
                        <span><strong>文件大小：</strong>单个文件不超过 10MB</span>
                    </p>
                    <p class="req-tip">
                        <el-icon>
                            <Warning />
                        </el-icon>
                        <span>提示：请确保文件格式正确，数据完整。系统将自动验证文件内容。</span>
                    </p>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="footer-actions">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleImport" :disabled="!hasFile" class="btn-import">确认导入
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UploadFilled, InfoFilled, Document, FolderOpened, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const hasFile = ref(false);
const uploadedFile = ref(null);

const previewList = ref([
    {
        sampleNo: 'RW20242132131',
        sampleName: '青椒',
        source: '田间/市场/其他',
        category: '蔬菜',
        origin: '山东济南',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '盒马鲜生',
        testTime: '2025-12-12',
        testResult: '阳性'
    },
    {
        sampleNo: 'RW20242132131',
        sampleName: '草莓',
        source: '田间/市场/其他',
        category: '水果',
        origin: '山东济南',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '北京市平谷区农业综合检验检测中心',
        testTime: '2025-12-12',
        testResult: '阴性'
    },
    {
        sampleNo: 'RW20242132131',
        sampleName: '桂鱼',
        source: '田间/市场/其他',
        category: '水产品',
        origin: '辽宁大连',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        testOrg: '北京果村蔬菜专业合作社',
        testTime: '2025-12-12',
        testResult: '阴性'
    }
]);



const handleDownloadTemplate = () => {
    ElMessage.info('模板下载功能开发中');
};

const handleFileChange = (file) => {
    uploadedFile.value = file;
    hasFile.value = true;
    ElMessage.success(`已选择文件: ${file.name}`);
};

const handleCancel = () => {
    router.back();
};

const handleImport = () => {
    if (!hasFile.value) {
        ElMessage.warning('请先选择要导入的文件');
        return;
    }
    ElMessage.success('数据导入成功');
    router.back();
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 头部卡片 */
.header-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .blue-line {
        width: 4px;
        height: 16px;
        background: #00B3ED;
        border-radius: 2px;
    }

    .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}

.header-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
    padding-left: 12px;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: var(--page-container-padding);
    flex: 1;
}

/* 预览区域 */
.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }

    .download-link {
        font-size: 14px;
        color: #00B3ED;
        padding: 0;
        cursor: pointer;

        &:hover {
            color: #0095c8;
        }
    }
}

.preview-table-wrapper {
    margin-bottom: 40px;
}



.result-negative {
    color: #52C41A;
}

.result-positive {
    color: #F5222D;
}

/* 上传区域 */
.upload-section {
    margin-bottom: 24px;

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px 0;
    }
}

.upload-dragger {
    width: 100%;

    :deep(.el-upload-dragger) {
        border: 2px dashed #00B3ED;
        border-radius: 12px;
        background: rgba(0, 179, 237, 0.02);
        padding: 40px 20px;
        transition: all 0.3s;

        &:hover {
            border-color: #0095c8;
            background: rgba(0, 179, 237, 0.05);
        }
    }

    :deep(.el-upload) {
        width: 100%;
    }
}

.upload-content {
    text-align: center;

    .upload-icon {
        font-size: 48px;
        color: #00B3ED;
        margin-bottom: 16px;
    }

    .upload-text {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin: 0 0 8px 0;
    }

    .upload-hint {
        font-size: 14px;
        color: #999;
        margin: 0;
    }
}

/* 要求说明 */
.requirements-box {
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 40px;
}

.requirements-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .info-icon {
        font-size: 20px;
        color: #00B3ED;
    }

    .requirements-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
    }
}

.requirements-content {
    padding-left: 28px;

    .req-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #333;
        margin: 0 0 10px 0;

        .el-icon {
            color: #00B3ED;
        }
    }

    .req-tip {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 13px;
        color: #F59E0B;
        margin: 12px 0 0 0;

        .el-icon {
            color: #F59E0B;
            margin-top: 2px;
        }
    }
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-top: 20px;
    border-top: 1px dashed #D1D5DB;

    .el-button {
        min-width: 100px;
        height: 44px;
        border-radius: 8px;
        font-size: 14px;
    }

    .btn-import {
        background: #00B3ED;
        border-color: #00B3ED;
    }
}
</style>
