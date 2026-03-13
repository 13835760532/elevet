<template>
    <div class="page-container yy-detail-container">
        <!-- 顶部标题区 -->
        <PageHeader title="主体备案" desc="请先下载导入模版，将辖区内需要备案主体按照模版整理，并将整理后文档上传至本平台，完成待检主体备案；" />

        <div class="page-scrollable">
        <!-- 内容卡片 -->
        <div class="content-card">
            <div class="card-action-bar">
                <div class="action-left">
                    <div class="section-dot"></div>
                    <span class="action-title">批量上传企业备案</span>
                </div>
                <el-button class="btn-download" @click="handleDownloadTemplate" plain>
                    <el-icon class="mr4"><Download /></el-icon>
                    下载导入模版
                </el-button>
            </div>

            <!-- 上传区域 -->
            <div class="upload-wrapper" v-loading="uploadLoading">
                <el-upload 
                    class="batch-upload" 
                    drag 
                    action="#" 
                    :http-request="handleUpload"
                    :show-file-list="false"
                    accept=".xlsx, .xls"
                >
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
                            <p class="format-tip">支持 Excel (.xlsx, .xls) 或 CSV (.csv) 格式</p>
                            <p class="size-tip">单个文件不超过 10MB，请确保数据完整，系统将自动校验内容</p>
                        </div>
                    </div>
                </el-upload>
                
                <div class="upload-options">
                    <el-checkbox v-model="updateSupport">是否支持更新（如果主体名称已存在，则更新其信息）</el-checkbox>
                </div>
            </div>

            <!-- 预览表格 -->
            <div class="preview-section">
                <div class="preview-header">
                    <div class="header-flex">
                        <div class="section-dot yellow"></div>
                        <span class="preview-title">批量导入备案示例/预览</span>
                    </div>
                </div>

                <div class="table-container">
                    <el-table :data="tableData" border class="preview-table" header-row-class-name="table-header">
                        <el-table-column prop="index" label="序号" width="60" align="center" />
                        <el-table-column prop="recordType" label="备案类型" width="100" />
                        <el-table-column prop="subjectName" label="主体名称" min-width="150" show-overflow-tooltip />
                        <el-table-column prop="subjectType" label="主体类型" width="100" align="center" />
                        <el-table-column prop="mainProduct" label="主营产品" width="100" align="center" />
                        <el-table-column prop="province" label="地区" width="80" align="center" />
                        <el-table-column prop="address" label="详细地址" min-width="150" show-overflow-tooltip />
                        <el-table-column prop="contact" label="联系人" width="100" align="center" />
                        <el-table-column prop="phone" label="联系电话" width="140" align="center" />
                        <el-table-column prop="creditCode" label="企业信用代码" width="180" align="center" />
                        <el-table-column prop="hasLicense" label="营业执照" width="100" align="center">
                            <template #default="scope">
                                <el-tag :type="scope.row.hasLicense ? 'success' : 'info'" size="small">
                                    {{ scope.row.hasLicense ? '有' : '无' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="hasQualification" label="企业资质" width="100" align="center">
                            <template #default="scope">
                                <el-tag :type="scope.row.hasQualification ? 'success' : 'info'" size="small">
                                    {{ scope.row.hasQualification ? '有' : '无' }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled, Download } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';
import * as SubjectApi from '@/api/agri/subject/index';
import { useMessage } from '@/hooks/web/useMessage';
import download from '@/utils/download';

const message = useMessage();
const uploadLoading = ref(false);
const updateSupport = ref(false);
const tableData = ref([
    {
        index: 1,
        recordType: '企业备案',
        subjectName: '小辉农场',
        subjectType: '生产',
        mainProduct: '苹果',
        province: '北京',
        address: '北京市朝阳区北辰路8号',
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
        address: '北京市朝阳区北辰路8号',
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
        address: '北京市朝阳区北辰路8号',
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
        address: '北京市朝阳区北辰路8号',
        contact: '秦艳萍',
        phone: '18513172770',
        creditCode: '1101982103300106',
        hasLicense: true,
        hasQualification: false
    }
]);

const handleDownloadTemplate = async () => {
    try {
       const res = await SubjectApi.getImportTemplate();
       download.excel(res, '主体导入模板.xls');
    } catch (error) {
        console.error('下载模版失败', error);
    }
};

const handleUpload = async (options: any) => {
    const { file } = options;
    uploadLoading.value = true;
    try {
        const res = await SubjectApi.importSubject({ 
            file, 
            updateSupport: updateSupport.value 
        });
        
        const { createNames, updateNames, failureNames } = res;
        const failureCount = Object.keys(failureNames).length;
        
        let msg = `导入成功！新增 ${createNames.length} 条，更新 ${updateNames.length} 条。`;
        if (failureCount > 0) {
            msg += ` 失败 ${failureCount} 条。`;
            // 可以进一步展示失败原因
            let failureMsg = '失败原因：';
            for (const name in failureNames) {
                failureMsg += `\n${name}: ${failureNames[name]}`;
            }
            message.alert(msg + '\n' + failureMsg);
        } else {
            message.success(msg);
        }
        
    } catch (error) {
        console.error('上传失败', error);
    } finally {
        uploadLoading.value = false;
    }
};
</script>

<style lang="scss" scoped>
$theme-color: #00B3ED;
$text-dark: #1E293B;
$text-light: #64748B;
$bg-light: #F8FAFC;

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

.mr4 { margin-right: 4px; }


/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    padding:var(--page-container-padding);
    margin-bottom: 24px;
}

.card-action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;

    .action-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .section-dot {
        width: 8px;
        height: 8px;
        background: $theme-color;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba($theme-color, 0.1);
    }

    .action-title {
        font-size: 18px;
        font-weight: 700;
        color: $text-dark;
    }
}

.btn-download {
    border-color: $theme-color;
    color: $theme-color;
    height: 40px;
    padding: 0 24px;
    border-radius: 8px;
    font-weight: 500;

    &:hover {
        background: rgba($theme-color, 0.05);
        color: $theme-color !important;
        border-color: $theme-color !important;
    }
}

/* 上传区域 */
.upload-wrapper {
    margin-bottom: 24px;
}

.upload-options {
    margin-top: 16px;
    display: flex;
    justify-content: center;
}

.upload-wrapper {
    margin-bottom: 48px;

    :deep(.el-upload-dragger) {
        background: $bg-light;
        border: 2px dashed #E2E8F0;
        border-radius: 12px;
        height: 280px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: all 0.3s ease;

        &:hover {
            border-color: $theme-color;
            background: rgba($theme-color, 0.02);
            
            .upload-icon-circle {
                transform: scale(1.1);
                background: rgba($theme-color, 0.1);
                .el-icon { color: $theme-color; }
            }
        }
    }
}

.upload-icon-circle {
    width: 80px;
    height: 80px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0,0,0,0.03);

    .el-icon {
        font-size: 36px;
        color: #94A3B8;
        transition: all 0.3s ease;
    }
}

.el-upload__text {
    font-size: 20px;
    font-weight: 600;
    color: $text-dark;
    margin-bottom: 12px;

    span {
        color: $theme-color;
        cursor: pointer;
        &:hover { text-decoration: underline; }
    }
}

.upload-hint {
    color: $text-light;
    font-size: 14px;
    line-height: 1.8;

    p { margin: 4px 0; }
    .format-tip { font-weight: 500; color: #475569; }
}

/* 预览表格区域 */
.preview-section {
    margin-top: 40px;
}

.preview-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;

    .header-flex {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    .section-dot.yellow {
        background: #F59E0B;
        box-shadow: 0 0 0 4px rgba(#F59E0B, 0.1);
    }

    .preview-title {
        font-size: 18px;
        font-weight: 700;
        color: $text-dark;
    }

    .decorative-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, #E2E8F0, transparent);
    }
}

.table-container {
}

.preview-table {
    :deep(.table-header) {
        th {
            background-color: #F8FAFC !important;
            color: #475569;
            font-weight: 600;
            height: 52px;
            font-size: 14px;
        }
    }

    :deep(.el-table__row) {
        td {
            padding: 12px 0;
            font-size: 14px;
            color: #334155;
        }
    }

    :deep(.el-tag) {
        border-radius: 4px;
        font-weight: 500;
    }
}
</style>
