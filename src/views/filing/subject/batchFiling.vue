<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">主体备案</h1>
            </div>
            <div class="desc-box">
                请先下载导入模版，将辖区内需要备案主体按照模版整理，并将整理后文档上传至本平台，完成待检主体备案；
            </div>
        </div>

        <!-- 内容卡片 -->
        <div class="content-card">
            <div class="card-action-bar">
                <span class="action-title">批量上传企业备案：</span>
                <el-button class="btn-download" @click="handleDownloadTemplate">
                    下载导入模版
                </el-button>
            </div>

            <!-- 上传区域 -->
            <div class="upload-wrapper">
                <el-upload class="batch-upload" drag action="#" :auto-upload="false" multiple>
                    <div class="upload-content">
                        <div class="upload-icon-circle">
                            <el-icon class="el-icon--upload">
                                <UploadFilled />
                            </el-icon>
                        </div>
                        <div class="el-upload__text">
                            拖拽文件到此处或<span>点击选择</span>
                        </div>
                        <div class="upload-hint">
                            <p>** 支持 Excel (.xlsx, .xls) 或 CSV (.csv) 格式</p>
                            <p>**文件大小：单个文件不超过10MB，请确保文件格式正确、数据完整，系统将自动检验文件内容</p>
                        </div>
                    </div>
                </el-upload>
            </div>

            <!-- 预览表格 -->
            <div class="preview-section">
                <div class="preview-header">
                    <span class="preview-title">批量导入备案示例/预览：</span>
                    <div class="decorative-line"></div>
                </div>

                <el-table :data="tableData" border class="preview-table" header-row-class-name="table-header">
                    <el-table-column prop="index" label="序号" width="60" align="center" />
                    <el-table-column prop="recordType" label="备案类型" width="100" />
                    <el-table-column prop="subjectName" label="主体名称" min-width="120" />
                    <el-table-column prop="subjectType" label="主体类型" width="100" />
                    <el-table-column prop="mainProduct" label="主营产品" width="100" />
                    <el-table-column prop="province" label="省" width="60" />
                    <el-table-column prop="address" label="详细地址" min-width="120" />
                    <el-table-column prop="contact" label="联系人" width="100" />
                    <el-table-column prop="phone" label="联系电话" width="140" />
                    <el-table-column prop="creditCode" label="企业信用代码" width="180" />
                    <el-table-column prop="hasLicense" label="企业营业执照" width="120" align="center">
                        <template #default="scope">
                            <span>{{ scope.row.hasLicense ? '有' : '无' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="hasQualification" label="企业资质" width="100" align="center">
                        <template #default="scope">
                            <span>{{ scope.row.hasQualification ? '有' : '无' }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';

const tableData = ref([
    {
        index: 1,
        recordType: '企业备案',
        subjectName: '小辉农场',
        subjectType: '生产',
        mainProduct: '苹果',
        province: '北京',
        address: 'XXXX',
        contact: '秦艳萍',
        phone: '18513172770',
        creditCode: '1101982103300106',
        hasLicense: true,
        hasQualification: true
    },
    {
        index: 2,
        recordType: '企业备案',
        subjectName: '小辉农场',
        subjectType: '加工',
        mainProduct: '西红柿',
        province: '北京',
        address: 'XXXX',
        contact: '秦艳萍',
        phone: '18513172770',
        creditCode: '1101982103300106',
        hasLicense: true,
        hasQualification: false
    },
    {
        index: 3,
        recordType: '企业备案',
        subjectName: '小辉农场',
        subjectType: '流通',
        mainProduct: '草莓',
        province: '北京',
        address: 'XXXX',
        contact: '秦艳萍',
        phone: '18513172770',
        creditCode: '1101982103300106',
        hasLicense: true,
        hasQualification: false
    },
    {
        index: 4,
        recordType: '企业备案',
        subjectName: '小辉农场',
        subjectType: '零售',
        mainProduct: '黄瓜',
        province: '北京',
        address: 'XXXX',
        contact: '秦艳萍',
        phone: '18513172770',
        creditCode: '1101982103300106',
        hasLicense: true,
        hasQualification: false
    }
]);

const handleDownloadTemplate = () => {
    console.log('Downloading template...');
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    padding: 0;
    background: transparent;
}

/* 顶部标题区 */
.header-section {
    height: auco;
    padding: 16px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    margin-bottom: 20px;
}

.title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
}

.title-line {
    width: 4px;
    height: 18px;
    background: #00B3ED;
    border-radius: 2px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #333333;
    margin: 0;
}

.desc-box {
    font-size: 14px;
    color: #666666;
    padding-left: 12px;
    line-height: 1.6;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 30px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.card-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    .action-title {
        font-size: 18px;
        font-weight: 700;
        color: #333;
    }
}

.btn-download {
    border: 1px solid #3B82F6;
    color: #3B82F6;
    font-weight: 500;
    padding: 8px 24px;
    border-radius: 6px;

    &:hover {
        background: rgba(59, 130, 246, 0.05);
    }
}

/* 上传区域 */
.upload-wrapper {
    margin-bottom: 50px;

    :deep(.el-upload-dragger) {
        background: transparent;
        border: 2px dashed #D1D5DB;
        border-radius: 10px;
        height: 300px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: all 0.3s;

        &:hover {
            border-color: #3B82F6;
            background: rgba(59, 130, 246, 0.02);
        }
    }
}

.upload-content {
    text-align: center;
}

.upload-icon-circle {
    width: 80px;
    height: 80px;
    background: #F3F4F6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;

    .el-icon {
        font-size: 32px;
        color: #9CA3AF;
    }
}

.el-upload__text {
    font-size: 24px;
    font-weight: 700;
    color: #000;
    margin-bottom: 15px;

    span {
        color: #3B82F6;
        cursor: pointer;
    }
}

.upload-hint {
    color: #6B7280;
    font-size: 14px;
    line-height: 2;
    font-weight: 500;
}

/* 预览表格区域 */
.preview-header {
    margin-bottom: 20px;
    position: relative;

    .preview-title {
        font-size: 18px;
        font-weight: 700;
        color: #333;
    }

    .decorative-line {
        position: absolute;
        right: 0;
        top: 50%;
        width: 200px;
        height: 2px;
        background: #EAB308;
        /* 原型图中的黄色线条 */
    }
}

.preview-table {
    border-radius: 8px;
    overflow: hidden;

    :deep(.table-header) {
        background-color: #F9FAFB !important;

        th {
            background: #F9FAFB !important;
            color: #000;
            font-weight: 700;
            height: 50px;
        }
    }

    :deep(.el-table__row) {
        height: 50px;

        td {
            font-size: 13px;
        }
    }
}
</style>
