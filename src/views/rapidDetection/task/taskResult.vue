<template>
    <div class="page-container">

        <PageBack />
        <!-- 检测详情头部 -->
        <div class="header-card">
            <div class="card-header">
                <div class="blue-line"></div>
                <h2 class="card-title">检测详情</h2>
            </div>
            <p class="header-desc">对检测结果进行拍照上传判读后的结果</p>
        </div>

        <!-- 样品检测信息 -->
        <div class="content-card">
            <div class="section-header">
                <h3 class="section-title">样品检测信息</h3>
                <div class="stamp" :class="{ 'stamp-fail': !isQualified }">
                    {{ isQualified ? '合格' : '未合格' }}
                </div>
            </div>

            <div class="info-grid">
                <div class="info-row">
                    <span class="label">样品编号：</span>
                    <span class="value">{{ sampleInfo.sampleNo }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品来源：</span>
                    <span class="value">{{ sampleInfo.source }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品名称：</span>
                    <span class="value">{{ sampleInfo.sampleName }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品产地：</span>
                    <span class="value">{{ sampleInfo.origin }}</span>
                </div>
                <div class="info-row">
                    <span class="label">样品数量（重量）：</span>
                    <span class="value">{{ sampleInfo.quantity }}</span>
                </div>
                <div class="info-row">
                    <span class="label">抽检区域：</span>
                    <span class="value">{{ sampleInfo.checkArea }}</span>
                </div>
                <div class="info-row">
                    <span class="label">生产经营主体：</span>
                    <span class="value">{{ sampleInfo.producer }}</span>
                </div>
                <div class="info-row">
                    <span class="label">抽检区域：</span>
                    <span class="value">{{ sampleInfo.region }}</span>
                </div>
                <div class="info-row">
                    <span class="label">检测机构：</span>
                    <span class="value">{{ sampleInfo.testOrg }}</span>
                </div>
                <div class="info-row">
                    <span class="label">检测人员：</span>
                    <span class="value">{{ sampleInfo.tester }}</span>
                </div>
                <div class="info-row">
                    <span class="label">检测日期：</span>
                    <span class="value">{{ sampleInfo.testDate }}</span>
                </div>
                <div class="info-row photo-row">
                    <span class="label">检测照片：</span>
                    <div class="photo-preview">
                        <el-image :src="sampleInfo.photo" fit="cover" :preview-src-list="[sampleInfo.photo]" />
                    </div>
                </div>
            </div>

            <!-- 检测结果详情 -->
            <div class="section-header mt-40">
                <h3 class="section-title">检测结果详情</h3>
            </div>
            <div class="result-table-wrapper">
                <el-table :data="resultList" class="result-table" border>
                    <el-table-column label="通道" prop="channel" width="100" align="center" />
                    <el-table-column label="检测项目" prop="item" min-width="150" align="center" />
                    <el-table-column label="检测值（T/C值）" prop="tcValue" width="150" align="center" />
                    <el-table-column label="浓度值(单位:ppb)" prop="concentration" width="150" align="center" />
                    <el-table-column label="检测结果" prop="result" width="120" align="center">
                        <template #default="scope">
                            <span :class="scope.row.result === '阴性' ? 'result-negative' : 'result-positive'">
                                {{ scope.row.result }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 检测报告 -->
            <div class="section-header mt-40">
                <h3 class="section-title">检测报告</h3>
            </div>
            <div class="report-section">
                <div class="report-preview">
                    <el-image :src="reportImage" fit="contain" class="report-image" />
                </div>
                <div class="report-actions">
                    <span class="link-btn" @click="handlePreviewReport">报告预览</span>
                    <span class="link-btn" @click="handleDownloadReport">报告下载</span>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="footer-actions">
                <el-button @click="handleBack" class="btn-back">返回</el-button>
                <el-button @click="handleContinueTest" class="btn-continue">继续检测</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const isQualified = ref(false);

const sampleInfo = ref({
    sampleNo: 'YP20251230000001',
    source: '田间/市场/其他',
    sampleName: '桂鱼',
    origin: '广东省-佛山市',
    quantity: '10亩',
    checkArea: '北京-朝阳-高楼店',
    producer: '佛山市山水区合祥水产有限公司',
    region: '北京-朝阳',
    testOrg: '北京市平谷区农业综合检验检测中心',
    tester: '李娜',
    testDate: '2025-12-30',
    photo: 'https://via.placeholder.com/80x100'
});

const resultList = ref([
    {
        channel: '1',
        item: '氯虫腈',
        tcValue: '0.32',
        concentration: '<500.00',
        result: '阴性'
    },
    {
        channel: '2',
        item: '灭多威',
        tcValue: '5.13',
        concentration: '<500.00',
        result: '阳性'
    }
]);

const reportImage = ref('https://via.placeholder.com/200x280');



const handleBack = () => {
    router.back();
};

const handleContinueTest = () => {
    console.log('Continue Test');
};

const handlePreviewReport = () => {
    console.log('Preview Report');
};

const handleDownloadReport = () => {
    console.log('Download Report');
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
    color: #00B3ED;
    margin: 0;
    padding-left: 12px;
}

/* 内容卡片 */
.content-card {
    background: #fff;
    border-radius: 10px;
    padding: 32px 40px;
    flex: 1;
}

.section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;

    &.mt-40 {
        margin-top: 40px;
    }

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0;
    }
}

/* 印章样式 */
.stamp {
    width: 70px;
    height: 70px;
    border: 3px solid #52C41A;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #52C41A;
    transform: rotate(-15deg);

    &.stamp-fail {
        border-color: #F5222D;
        color: #F5222D;
    }
}

/* 信息网格 */
.info-grid {
    max-width: 600px;

    .info-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        font-size: 14px;

        .label {
            min-width: 130px;
            color: #666;
            text-align: right;
            padding-right: 8px;
        }

        .value {
            color: #333;
            flex: 1;
        }

        &.photo-row {
            align-items: flex-start;
            margin-top: 16px;

            .photo-preview {
                width: 60px;
                height: 80px;
                border: 1px solid #E5E7EB;
                border-radius: 4px;
                overflow: hidden;

                .el-image {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}

/* 结果表格 */
.result-table-wrapper {
    max-width: 700px;
}



.result-negative {
    color: #52C41A;
}

.result-positive {
    color: #F5222D;
}

/* 报告区域 */
.report-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
}

.report-preview {
    width: 200px;
    height: 280px;
    border: 1px solid #E5E7EB;
    border-radius: 4px;
    overflow: hidden;
    background: #F9FAFB;

    .report-image {
        width: 100%;
        height: 100%;
    }
}

.report-actions {
    display: flex;
    gap: 24px;

    .link-btn {
        font-size: 14px;
        color: #00B3ED;
        cursor: pointer;
        text-decoration: underline;

        &:hover {
            color: #0095c8;
        }
    }
}

/* 底部按钮 */
.footer-actions {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 1px dashed #D1D5DB;

    .btn-back,
    .btn-continue {
        width: 120px;
        height: 44px;
        border-radius: 8px;
        font-size: 14px;
    }

    .btn-back {
        background: #00B3ED;
        border-color: #00B3ED;
        color: #fff;
    }

    .btn-continue {
        background: #fff;
        border-color: #D1D5DB;
        color: #333;
    }
}
</style>
