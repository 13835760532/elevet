<template>
    <div class="detail-container">
        <PageBack>
        </PageBack>
        <!-- 顶部标题 -->
        <div class="detail-header" style="margin-top: 12px;">
            <div class="title-bar">
             
                <h1 class="main-title">检测详情</h1>
            </div>
            <div class="header-desc">
                对检测结果进行拍照上传判读后的结果
            </div>
        </div>

        <div class="detail-card">
            <!-- 样品信息模块 -->
            <div class="section-block">
                <div class="section-title">
                 
                    <h2>样品信息</h2>
                </div>
                <div class="info-content relative">
                    <div class="info-list">
                        <div class="info-row">
                            <span class="label">样品编号</span>
                            <span class="value">{{ detailData.sampleNo }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">样品名称</span>
                            <span class="value">{{ detailData.sampleName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">样品产地</span>
                            <span class="value">{{ detailData.origin }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">样品数量(重量)</span>
                            <span class="value">{{ detailData.quantity }}</span>
                        </div>
                    </div>
                    <!-- 合格印章 -->
                    <div class="status-stamp" v-if="detailData.status === 'qualified'">
                        <div class="stamp-circle">
                            <span class="stamp-text">合格</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 主体信息模块 -->
            <div class="section-block">
                <div class="section-title">
                 
                    <h2>主体信息</h2>
                </div>
                <div class="info-content">
                    <div class="info-list">
                        <div class="info-row">
                            <span class="label">生产主体</span>
                            <span class="value">{{ detailData.subjectName }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">主体类型</span>
                            <span class="value">{{ detailData.subjectType }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">主营产品</span>
                            <span class="value">{{ detailData.mainProducts }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">所属地区</span>
                            <span class="value">{{ detailData.region }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">详细地址</span>
                            <span class="value">{{ detailData.address }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">联系人</span>
                            <span class="value">{{ detailData.contact }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">联系电话</span>
                            <span class="value">{{ detailData.phone }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">生产规模</span>
                            <span class="value">{{ detailData.scale }}</span>
                        </div>
                        <div class="info-row al-top">
                            <span class="label">营业执照</span>
                            <div class="img-preview">
                                <el-image :src="detailData.licenseUrl" :preview-src-list="[detailData.licenseUrl]"
                                    class="custom-img" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Mock 数据表现 1:1 设计稿内容
const detailData = reactive({
    sampleNo: '23132156',
    sampleName: '鲑鱼',
    origin: '广东省佛山市',
    quantity: '10亩',
    status: 'qualified', // qualified | unqualified
    subjectName: '山东威海出发',
    subjectType: '流通',
    mainProducts: '黄瓜、西红柿、茄子、丝瓜',
    region: '北京-朝阳',
    address: '建国路29号',
    contact: '李娜',
    phone: '17612345678',
    scale: '10亩',
    licenseUrl: 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=400',
});

</script>

<style lang="scss" scoped>
.detail-container {
    height: 100%;
    overflow-y: auto;
    border-radius: 10px;
}

/* 顶部标题区 - 同步 taskManagement */
.detail-header {
    height: auco;
    padding: 16px;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 10px;
}

.title-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
}

.blue-line {
    width: 4px;
    height: 16px;
    background: #00B3ED;
    border-radius: 2px;
}

.main-title {
    font-size: 18px;
    line-height: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.header-desc {
    font-size: 16px;
    color: #333333;
    line-height: 21px;
    padding-left: 16px;
}

/* 详情卡片 - 同步 taskManagement 的 content-card */
.detail-card {
    width: 100%;
    margin: 0 auto;
    padding: 16px;
    background: #fff;
    border-radius: 10px;
}

/* 模块通用样式 */
.section-block {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding-bottom: 24px;
    margin-bottom: 24px;

    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;

    .blue-line {
        width: 3px;
        height: 14px;
        background-color: #00B3ED;
        border-radius: 2px;
    }

    h2 {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}

.info-content {
    padding-left: 11px;

    &.relative {
        position: relative;
    }
}

/* 信息列表布局 */
.info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-row {
    display: flex;
    align-items: center;
    font-size: 15px;

    &.al-top {
        align-items: flex-start;
    }

    .label {
        width: 120px;
        color: #666;
        flex-shrink: 0;
    }

    .value {
        color: #333;
    }
}

/* 合格印章效果 */
.status-stamp {
    position: absolute;
    top: 0;
    left: 200px;
    transform: rotate(-10deg);

    .stamp-circle {
        width: 70px;
        height: 70px;
        border: 2px solid #52C41A;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #52C41A;
        font-weight: bold;
        font-size: 18px;
        position: relative;
        opacity: 0.8;

        &::after {
            content: "";
            position: absolute;
            width: 88%;
            height: 88%;
            border: 1px solid #52C41A;
            border-radius: 50%;
        }
    }
}

/* 图片展示 */
.custom-img {
    width: 160px;
    height: 100px;
    border-radius: 8px;
    border: 1px solid #eee;
}

/* 响应式适配 */
@media (max-width: 768px) {
    .detail-card {
        padding: 20px;
    }

    .status-stamp {
        position: static;
        transform: none;
        margin-top: 20px;
    }

    .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        .label {
            width: 100%;
        }
    }
}
</style>
