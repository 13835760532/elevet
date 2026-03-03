<template>
    <div class="page-container">
        <!-- 1. 标题区 -->
        <div class="guide-card" style="margin-bottom: 12px;">
            <div class="card-header">
                <h2 class="card-title">农产品溯源</h2>
            </div>
            <div class="header-desc" style="color: #666; font-size: 14px;">
                输入合格证编号，追溯产品全生命周期的合格证与检测信息
            </div>
        </div>

        <!-- 2. 搜索区 -->
        <div class="query-card">
            <div class="query-form-wrapper">
                <el-form :inline="true" class="custom-query-form custom-query-form-row">
                    <el-form-item label="" style="margin-bottom: 0!important;">
                        <el-input :prefix-icon="Search" v-model="searchCode" placeholder="请输入 20 位合格证编号查询"
                            class="custom-input" style="width: 480px" clearable @keyup.enter="handleSearch" />
                    </el-form-item>
                    <div class="query-btns" style="margin-bottom: 0!important;">
                        <el-button type="primary" class="search-btn" @click="handleSearch">
                            扫码/查询
                        </el-button>
                    </div>
                </el-form>
            </div>
        </div>

        <!-- 3. 数据展示区 (仅在有结果时显示) -->
        <div v-if="hasSearched" class="content-body">
            <!-- 基本信息卡片 -->
            <div class="info-card section-card">
                <div class="section-header">基本信息</div>
                <div class="info-content">
                    <el-descriptions :column="3" border direction="vertical" class="custom-desc">
                        <el-descriptions-item label="农药名称">有机番茄</el-descriptions-item>
                        <el-descriptions-item label="出证类型">生产企业</el-descriptions-item>
                        <el-descriptions-item label="重量/数量">10 kg</el-descriptions-item>
                        <el-descriptions-item label="生产经营主体">济南优选现代农业发展有限公司</el-descriptions-item>
                        <el-descriptions-item label="联系人">秦艳萍</el-descriptions-item>
                        <el-descriptions-item label="联系电话">185****2770</el-descriptions-item>
                        <el-descriptions-item label="开具日期">2025-12-12</el-descriptions-item>
                        <el-descriptions-item label="产品产地" :span="2">山东省济南市章丘区生产基地 A-04 区</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>

            <!-- 溯源轨迹 -->
            <div class="timeline-card section-card">
                <div class="section-header">溯源轨迹</div>
                <div class="timeline-box">
                    <el-timeline>
                        <el-timeline-item
                            v-for="(activity, index) in activities"
                            :key="index"
                            :type="activity.type"
                            :color="activity.color"
                            :size="activity.size"
                            :timestamp="activity.timestamp"
                        >
                            <div class="timeline-item-content">
                                <h4 class="item-title">{{ activity.content }}</h4>
                                <p class="item-desc">{{ activity.desc }}</p>
                                
                                <!-- 检测结果辅助展示 -->
                                <div v-if="activity.results" class="results-table">
                                    <el-table :data="activity.results" size="small" border>
                                        <el-table-column prop="name" label="检测项目" />
                                        <el-table-column prop="value" label="检测值" width="100" />
                                        <el-table-column prop="status" label="结论" width="80" align="center">
                                            <template #default="scope">
                                                <span :class="scope.row.status === '合格' ? 'text-success' : 'text-danger'">
                                                    {{ scope.row.status }}
                                                </span>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </div>
                                <div v-if="activity.showLink" class="item-links">
                                    <el-button link type="primary">查看合格证图片</el-button>
                                </div>
                            </div>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </div>
        </div>

        <!-- 4. 空状态 (可选) -->
        <div v-if="!hasSearched" class="empty-state">
            <div class="empty-content">
                <el-icon class="empty-icon"><Memo /></el-icon>
                <p>请输入编号开始查询溯源信息</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search, Memo } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

defineOptions({
    name: 'ProductTraceability'
});

const searchCode = ref('');
const hasSearched = ref(false);

const handleSearch = () => {
    if (!searchCode.value.trim()) {
        ElMessage.warning('请输入编号');
        return;
    }
    hasSearched.value = true;
};

const activities = [
    {
        content: '终端入库检测',
        timestamp: '2025-12-15 14:20',
        type: 'primary',
        color: '#00B3ED',
        size: 'large',
        desc: '北京朝悦店：入场快检，指标覆盖有机磷及氨基甲酸酯类。',
        results: [
            { name: '氟虫腈', value: '0.01', status: '合格' },
            { name: '灭多威', status: '合格' }
        ]
    },
    {
        content: '冷链物流运输',
        timestamp: '2025-12-13 02:00',
        desc: '济南 -> 北京：全程冷链监控中，平均库温 4.2℃。'
    },
    {
        content: '生产端开证',
        timestamp: '2025-12-12 10:00',
        desc: '济南基地：产品采摘完成，签发电子合格证（HGZ-2025-001）。',
        showLink: true
    }
];
</script>

<style scoped lang="scss">
$primary-color: #00B3ED;
$bg-color: #f5f7fa;
$border-color: #e4e7ed;

.page-container {
    height: 100%;
    overflow-y: auto;
}

.content-body {
    margin-top: 12px;
}

/* 内容卡片 */
.section-card {
    background: #fff;
    border-radius: 10px;
    padding: 24px;
    margin-bottom: 12px;

    .section-header {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 24px;
        position: relative;
        padding-left: 14px;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 4px;
            width: 4px;
            height: 18px;
            background: $primary-color;
            border-radius: 2px;
        }
    }
}

/* 溯源轨迹样式 */
.timeline-box {
    padding: 10px 0;
}

.timeline-item-content {
    .item-title {
        font-size: 15px;
        font-weight: 600;
        color: #333;
        margin: 0 0 8px 0;
    }
    .item-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        line-height: 1.6;
    }
}

.results-table {
    margin: 12px 0;
    max-width: 500px;
}

.item-links {
    margin-top: 10px;
}

/* 文字辅助色 */
.text-success { color: #52c41a; font-weight: bold; }
.text-danger { color: #f5222d; font-weight: bold; }

/* 空状态 */
.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    background: #fff;
    border-radius: 8px;

    .empty-content {
        text-align: center;
        color: #999;
        .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
    }
}

/* 深度选择器适配 Description */
:deep(.custom-desc) {
    .el-descriptions__label {
        background: #fafafa !important;
        font-weight: bold;
        color: #666;
    }
}
</style>
