<template>
    <div class="page-container">
        <!-- 顶部标题区 -->
        <div class="header-section">
            <div class="title-wrapper">
                <div class="title-line"></div>
                <h1 class="page-title">产品档案</h1>
            </div>
        </div>

        <!-- 详情卡片容器 -->
        <div class="content-card">
            <!-- 产品信息区块 -->
            <div class="detail-section">
                <div class="section-header">产品信息</div>
                <div class="detail-list">
                    <div class="detail-row">
                        <span class="label">*建档时间：</span>
                        <span class="value">20261230 12:56:32</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品编码：</span>
                        <span class="value">SC-202512-0925-XX-000001 (XX为随机码)</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品名称：</span>
                        <span class="value">黄瓜</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品类别：</span>
                        <span class="value">蔬菜</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*产品产地：</span>
                        <span class="value">北京-朝阳-建外soho</span>
                    </div>
                    <div class="detail-row image-row">
                        <span class="label">*产品宣传照片：</span>
                        <div class="value">
                            <div class="preview-img-box">
                                <img src="https://img.alicdn.com/tfs/TB1_u_7D7D1gK0jSZFsXXb3vVXa-520-280.jpg"
                                    alt="产品图片" />
                            </div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <span class="label">*批次规模：</span>
                        <span class="value">10亩</span>
                    </div>
                </div>
            </div>

            <!-- 所属主体区块 -->
            <div class="detail-section mt-30">
                <div class="section-header">所属主体</div>
                <div class="detail-list">
                    <div class="detail-row">
                        <span class="label">*主体名称：</span>
                        <span class="value">北京本来生活科技有限公司</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*主体类型：</span>
                        <span class="value">流通</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*主营产品：</span>
                        <span class="value">黄瓜、西红柿、茄子、丝瓜</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*所属地区：</span>
                        <span class="value">北京市-北京市-朝阳区</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*详细地址：</span>
                        <span class="value">建国路29号建外soho</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*联系人：</span>
                        <span class="value">秦艳萍</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*联系电话：</span>
                        <span class="value">18513172770</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*生产规模：</span>
                        <span class="value">10 亩</span>
                    </div>
                    <div class="detail-row complex">
                        <span class="label">*信用代码<br />（身份证代码）：</span>
                        <span class="value">1102011818788786816</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">*营业执照：</span>
                        <span class="value active-link">预览</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">身份证：</span>
                        <span class="value active-link">预览</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">企业资质：</span>
                        <span class="value active-link">预览</span>
                    </div>
                    <div class="detail-row no-border">
                        <span class="label">企业介绍：</span>
                        <span class="value active-link">预览</span>
                    </div>
                </div>
            </div>

            <!-- 底部操作按钮 -->
            <div class="footer-actions">
                <el-button class="btn-back" @click="handleBack">返回</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const handleBack = () => {
    router.back();
};
</script>

<style lang="scss" scoped>
.page-container {
    min-height: 100%;
    padding: 16px;
}

/* 顶部标题区 */
.header-section {
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

/* 内容卡片 */
.content-card {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 40px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.section-header {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    padding-bottom: 12px;
}

.detail-list {
    // border: 1px solid #E5E7EB;
    // border-radius: 4px;
    overflow: hidden;
}

.detail-row {
    display: flex;
    border-bottom: 1px solid #E5E7EB;
    min-height: 48px;
    align-items: flex-start;

    &.no-border {
        border-bottom: none;
    }

    .label {
        width: 150px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        text-align: right;
    }

    .value {
        flex: 1;
        padding: 12px 20px;
        font-size: 14px;
        color: #333;
        line-height: 1.5;

        &.active-link {
            color: #3B82F6;
            cursor: pointer;
            font-weight: 500;
        }
    }

    &.image-row {
        .value {
            padding-top: 8px;
            padding-bottom: 8px;
        }
    }

    &.complex {
        .label {
            line-height: 1.3;
        }
    }
}

.preview-img-box {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #D1D5DB;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.mt-30 {
    margin-top: 30px;
}

.footer-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 40px;
}

.btn-back {
    width: 160px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #D1D5DB;
    background: #fff;
    color: #333;

    &:hover {
        background: #F9FAFB;
        border-color: #9CA3AF;
    }
}
</style>
