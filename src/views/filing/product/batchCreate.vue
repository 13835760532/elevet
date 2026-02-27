<template>
    <div class="page-container">
        <PageBack style="margin-bottom: 12px;"></PageBack>
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">产品档案</h1>
            </div>
            <div class="desc-box">
                支持批量上传多个受检背景信息进行建档
            </div>
        </div>

        <!-- 内容卡片 -->
        <div class="content-card">
            <div class="section-title">批量上传产品档案：</div>

            <!-- 拖拽上传区域 -->
            <div class="upload-wrapper">
                <el-upload class="batch-uploader" drag action="#" :auto-upload="false" multiple>
                    <div class="upload-inner">
                        <div class="icon-orb">
                            <el-icon class="el-icon--upload">
                                <UploadFilled />
                            </el-icon>
                        </div>
                        <div class="upload-text">
                            拖拽文件到此处或<span>点击选择</span>
                        </div>
                        <div class="upload-hint">
                            <p>支持 Excel (.xlsx, .xls) 或 CSV (.csv) 格式</p>
                            <p>**文件大小：单个文件不超过10MB，请确保文件格式正确、数据完整，系统将自动检验文件内容</p>
                        </div>
                    </div>
                </el-upload>
            </div>

            <!-- 示例展示区域 -->
            <div class="example-section">
                <div class="example-header">
                    <span class="header-label">示例：</span>
                    <el-button class="btn-download" @click="handleDownloadTemplate">
                        下载导入模版
                    </el-button>
                </div>

                <div class="table-wrapper">
                    <el-table :data="exampleData" border class="example-table">
                        <el-table-column prop="index" label="序号" width="60" fixed="left" align="center" />
                        <el-table-column prop="productName" label="产品名称" width="100" />
                        <el-table-column prop="category" label="产品类别" width="100" />
                        <el-table-column prop="origin" label="产品产地" width="100" />
                        <el-table-column prop="batchScale" label="批次规模" width="100" />
                        <el-table-column prop="promoPhoto" label="产品宣传图片" width="120" />
                        <div class="subject-group">
                            <el-table-column prop="subjectType" label="被检主体类型" width="100" />
                            <el-table-column prop="subjectName" label="主体名称" width="150" />
                            <el-table-column prop="idCode" label="信用代码/身份证号" width="140" />
                            <el-table-column prop="enterpriseType" label="生产企业" width="100" />
                            <el-table-column prop="mainProduct" label="主营产品" width="100" />
                            <el-table-column prop="prodScale" label="生产规模" width="100" />
                            <el-table-column prop="contact" label="联系人" width="100" />
                            <el-table-column prop="phone" label="联系电话" width="140" />
                            <el-table-column prop="region" label="所属地区" min-width="160" />
                        </div>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';

const exampleData = ref([
    {
        index: 1,
        productName: '晓辉农场',
        category: '蔬菜',
        origin: '北京-海淀',
        batchScale: '10亩',
        promoPhoto: '西红柿.jpg',
        subjectType: '企业备案',
        subjectName: '北京三快信息技术有限公司',
        idCode: '1102011818788786816',
        enterpriseType: '生产环节',
        mainProduct: '白菜',
        prodScale: '10',
        contact: '秦艳萍',
        phone: '18513172770',
        region: '北京-朝阳建国路soho'
    },
    {
        index: 2,
        productName: '李娜',
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

const handleDownloadTemplate = () => {
    console.log('触发模版下载...');
};
</script>

<style lang="scss" scoped>
.page-container {
    height: 100%;
    overflow-y: auto;
    padding: 0;
    background: transparent;
}

/* 页眉背景与毛玻璃 */
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
    margin-bottom: 12px;
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
    color: #999;
    padding-left: 12px;
}

/* 核心内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 30px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);

    .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #333;
        margin-bottom: 30px;
    }
}

/* 上传容器适配 */
.upload-wrapper {
    margin-bottom: 50px;

    :deep(.el-upload-dragger) {
        height: 320px;
        background: transparent;
        border: 2px dashed #D1D5DB;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        transition: all 0.3s ease;

        &:hover {
            border-color: #3B82F6;
            background: rgba(59, 130, 246, 0.02);
        }
    }
}

.upload-inner {
    text-align: center;
}

.icon-orb {
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

.upload-text {
    font-size: 24px;
    font-weight: 700;
    color: #000;
    margin-bottom: 16px;

    span {
        color: #3B82F6;
        cursor: pointer;
    }
}

.upload-hint {
    font-size: 14px;
    color: #6B7280;
    line-height: 2;
    font-weight: 500;
}

/* 表格区域 */
.example-section {
    .example-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .header-label {
            font-size: 18px;
            font-weight: 700;
            color: #333;
        }
    }
}

.btn-download {
    border: 1px solid #3B82F6;
    color: #3B82F6;
    font-weight: 500;
    padding: 8px 20px;
    border-radius: 6px;
    background: transparent;

    &:hover {
        background: rgba(59, 130, 246, 0.05);
    }
}

.table-wrapper {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
</style>
