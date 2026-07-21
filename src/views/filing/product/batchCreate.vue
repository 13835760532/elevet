<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <PageHeader title="产品档案" desc="支持批量上传多个受检背景信息进行建档。" />

        <div class="content-card">
            <div class="card-action-bar">
                <div class="action-left">
                    <div class="section-dot"></div>
                    <span class="action-title">批量上传产品信息</span>
                </div>
                <el-button class="btn-download" @click="handleDownloadTemplate" plain>
                    <el-icon class="mr2">
                        <Download />
                    </el-icon>
                    下载导入模版
                </el-button>
            </div>

            <!-- 上传区域 -->
            <div class="upload-wrapper" v-loading="uploadLoading">
                <el-upload class="batch-upload" drag action="#" :http-request="handleUpload" :show-file-list="false"
                    accept=".xlsx, .xls">
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
            </div>

            <!-- 预览表格 -->
            <div class="preview-section">
                <div class="preview-header">
                    <div class="header-flex">
                        <div class="section-dot yellow"></div>
                        <span class="preview-title">批量导入档案示例/预览</span>
                    </div>
                </div>

                <div class="table-container">
                    <el-table ref="tableRef" :data="exampleData" border class="preview-table"
                        header-row-class-name="table-header">
                        <el-table-column prop="index" label="序号" width="60" fixed="left" align="center" />
                        <el-table-column prop="productName" label="产品名称" width="120" />
                        <el-table-column prop="category" label="产品类别" width="100" align="center" />
                        <el-table-column prop="origin" label="产品产地" width="120" />
                        <el-table-column prop="batchScale" label="批次规模" width="100" align="center" />
                        <el-table-column prop="promoPhoto" label="产品宣传图片" width="120" align="center" />
                        <el-table-column prop="subjectType" label="被检主体类型" width="110" align="center" />
                        <el-table-column prop="subjectName" label="主体名称" min-width="150" show-overflow-tooltip />
                        <el-table-column prop="idCode" label="信用代码/身份证号" width="180" align="center" />
                        <el-table-column prop="enterpriseType" label="生产企业" width="100" align="center" />
                        <el-table-column prop="mainProduct" label="主营产品" width="100" align="center" />
                        <el-table-column prop="prodScale" label="生产经营主体" width="100" align="center" />
                        <el-table-column prop="contact" label="联系人" width="100" align="center" />
                        <el-table-column prop="phone" label="联系电话" width="140" align="center" />
                        <el-table-column prop="region" label="所属地区" min-width="160" show-overflow-tooltip />
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadFilled, Download } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';
import * as ProductApi from '@/api/agri/product/index';
import download from '@/utils/download';
import { useMessage } from '@/hooks/web/useMessage';

const message = useMessage();
const uploadLoading = ref(false);
const updateSupport = ref(false);

const exampleData = ref([
    {
        index: 1,
        productName: '白菜',
        category: '蔬菜',
        origin: '北京-海淀',
        batchScale: '10亩',
        promoPhoto: '西红柿.jpg',
        subjectType: '企业备案',
        subjectName: '北京三快信息技术有限公司',
        idCode: '1102011818788786816',
        enterpriseType: '生产企业',
        mainProduct: '白菜',
        prodScale: '10',
        contact: '秦艳萍',
        phone: '18513172770',
        region: '北京-朝阳建国路soho'
    },
    {
        index: 2,
        productName: '草莓',
        category: '水果',
        origin: '河北-廊坊',
        batchScale: '10亩',
        promoPhoto: '西红柿.jpg',
        subjectType: '个人备案',
        subjectName: '秦艳萍',
        idCode: '210303***** ***0925',
        enterpriseType: '收购环节',
        mainProduct: '西红柿',
        prodScale: '10',
        contact: '李娜',
        phone: '18513172770',
        region: '北京-朝阳建国路soho'
    }
]);

/**\n * handleDownloadTemplate：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/template/批量上传产品导入模板.xlsx';
    link.download = '批量上传产品导入模板.xlsx';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**\n * handleUpload：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleUpload = async (options) => {
    const { file } = options;
    uploadLoading.value = true;
    try {
        const res = await ProductApi.importProduct({
            file,
            updateSupport: updateSupport.value
        });

        const { createNames, updateNames, failureNames } = res;
        const failureCount = Object.keys(failureNames).length;

        let msg = `导入成功！新增 ${createNames.length} 条，更新 ${updateNames.length} 条。`;
        if (failureCount > 0) {
            msg += ` 失败 ${failureCount} 条。`;
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
    height: 100% !important;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden !important;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    padding: var(--page-container-padding);
    margin-bottom: 0;
    flex: 1;
    overflow-y: auto;
    /* 在此区域滚动 */
    min-height: 0;

    &::-webkit-scrollbar {
        width: 0px;
    }
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

                .el-icon {
                    color: $theme-color;
                }
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
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

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
        text-decoration: none !important;

        &:hover {
            text-decoration: none !important;
        }
    }
}

.upload-hint {
    color: $text-light;
    font-size: 14px;
    line-height: 1.8;

    p {
        margin: 4px 0;
    }

    .format-tip {
        font-weight: 500;
        color: #475569;
    }
}

/* 预览表格区域 */
.preview-section {
    margin-top: 40px;
    min-height: 0;
}

.preview-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;

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
}

.table-container {
    min-height: 0;
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
}
</style>
