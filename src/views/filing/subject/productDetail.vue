<template>
    <div class="page-container yy-detail-container">
        <PageHeader title="主体建档" desc="查看产品主体的详细档案信息。" />

        <div class="page-scrollable">

        <!-- 详情卡片容器 -->
        <div class="content-card">
            <div class="card-header">
                <span class="header-title">主体基本信息</span>
                <div class="dashed-line"></div>
            </div>

            <!-- 详情数据列表 -->
            <div class="detail-list">
                <!-- 备案类型 -->
                <div class="detail-row">
                    <div class="label">*备案类型：</div>
                    <div class="value">企业档案/个人档案</div>
                </div>

                <!-- 主体名称 -->
                <div class="detail-row">
                    <div class="label">*主体名称：</div>
                    <div class="value">北京本来生活科技有限公司</div>
                </div>

                <!-- 主体类型 -->
                <div class="detail-row">
                    <div class="label">*主体类型：</div>
                    <div class="value">流通</div>
                </div>

                <!-- 主营产品 -->
                <div class="detail-row">
                    <div class="label">*主营产品：</div>
                    <div class="value">黄瓜、西红柿、茄子、丝瓜</div>
                </div>

                <!-- 所属地区 -->
                <div class="detail-row">
                    <div class="label">*所属地区：</div>
                    <div class="value">北京市-北京市-朝阳区</div>
                </div>

                <!-- 详细地址 -->
                <div class="detail-row">
                    <div class="label">*详细地址：</div>
                    <div class="value">建国路29号建外soho</div>
                </div>

                <!-- 联系人 -->
                <div class="detail-row">
                    <div class="label">*联系人：</div>
                    <div class="value">秦艳萍</div>
                </div>

                <!-- 联系电话 -->
                <div class="detail-row">
                    <div class="label">*联系电话：</div>
                    <div class="value">18513172770</div>
                </div>

                <!-- 生产规模 -->
                <div class="detail-row">
                    <div class="label">*生产规模：</div>
                    <div class="value">10 亩</div>
                </div>

                <!-- 营业执照 -->
                <div class="detail-row">
                    <div class="label">*营业执照：</div>
                    <div class="value">
                        <div class="img-preview-group">
                            <div class="preview-box">
                                <el-icon v-if="!mockData.license">
                                    <Picture />
                                </el-icon>
                                <img v-else src="https://img.alicdn.com/tfs/TB1_u_7D7D1gK0jSZFsXXb3vVXa-520-280.jpg"
                                    class="preview-img" />
                            </div>
                            <el-button type="primary" link class="action-link">上传</el-button>
                        </div>
                    </div>
                </div>

                <!-- 信用代码 -->
                <div class="detail-row">
                    <div class="label">*信用代码：</div>
                    <div class="value">1102011818788786816</div>
                </div>

                <!-- 身份证 -->
                <div class="detail-row">
                    <div class="label">身份证：</div>
                    <div class="value">
                        <div class="img-preview-group">
                            <div class="id-card-boxes">
                                <div class="preview-box"><el-icon>
                                        <Postcard />
                                    </el-icon></div>
                                <div class="preview-box"><el-icon>
                                        <Postcard />
                                    </el-icon></div>
                            </div>
                            <el-button type="primary" link class="action-link">上传正反面</el-button>
                        </div>
                    </div>
                </div>

                <!-- 企业资质 -->
                <div class="detail-row">
                    <div class="label">企业资质：</div>
                    <div class="value">
                        <div class="img-preview-group">
                            <div class="preview-box">
                                <el-icon>
                                    <Picture />
                                </el-icon>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 企业介绍 -->
                <div class="detail-row no-border">
                    <div class="label">企业介绍：</div>
                    <div class="value">产品介绍产品介绍</div>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Picture, Postcard } from '@element-plus/icons-vue';
import PageHeader from '@/components/PageHeader/index.vue';

const router = useRouter();

const mockData = reactive({
    license: true
});

const handleBack = () => {
    router.back();
};
</script>

<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: 14px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.card-header {
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .header-title {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 15px;
    }
}

.dashed-line {
    width: 100%;
    height: 1px;
    background-image: linear-gradient(to right, #ccc 50%, rgba(255, 255, 255, 0) 0%);
    background-position: bottom;
    background-size: 10px 1px;
    background-repeat: repeat-x;
}

.detail-list {
    /* 对应原型图中的蓝色边框效果 */
    border-radius: 4px;
    overflow: hidden;
}

.detail-row {
    display: flex;
    border-bottom: 1px solid #E5E7EB;
    min-height: 50px;

    &.no-border {
        border-bottom: none;
    }

    .label {
        width: 140px;
        padding: 15px 20px;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        text-align: right;
        // background: rgba(243, 244, 246, 0.5); /* 模拟左侧背景，如果原型图有的话 */
    }

    .value {
        flex: 1;
        padding: 15px 20px;
        font-size: 14px;
        color: #333;
        display: flex;
        align-items: center;
    }
}

.img-preview-group {
    display: flex;
    align-items: center;
    gap: 20px;
}

.preview-box {
    width: 80px;
    height: 50px;
    background: #F3F4F6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #D1D5DB;
    overflow: hidden;

    .el-icon {
        font-size: 24px;
        color: #9CA3AF;
    }

    .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.id-card-boxes {
    display: flex;
    gap: 10px;
}

.action-link {
    font-weight: 500;
    font-size: 14px;
}


</style>
