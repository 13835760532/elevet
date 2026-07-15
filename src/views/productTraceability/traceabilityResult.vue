<template>
    <div class="app-container result-container">
        <div class="main-card">
            <!-- Header -->

            <!-- Search Section -->
            <div class="search-section">
                <div class="input-wrapper">
                    <el-input v-model="searchCode" placeholder="根据合格证编号查询产品生命周期的合格证追溯信息" @keyup.enter="handleSearch">
                        <template #suffix>
                            <el-icon class="search-icon" @click="handleSearch">
                                <Search />
                            </el-icon>
                        </template>
                    </el-input>
                    <button class="search-btn" @click="handleSearch">查 询</button>
                </div>
            </div>

            <!-- Basic Info Section -->
            <div class="section-container">
                <h3 class="section-title">基本信息</h3>
                <div class="cert-number">合格证编号：HGZ-20251212-001-ABC123</div>

                <div class="info-content-flex">
                    <!-- Left Info Table -->
                    <div class="info-table-box primary-border">
                        <el-descriptions :column="1" border size="default" class="custom-descriptions">
                            <el-descriptions-item label="出证类型">生产企业</el-descriptions-item>
                            <el-descriptions-item label="样品名称">有机番茄</el-descriptions-item>
                            <el-descriptions-item label="重量/数量">10 (kg/亩/公顷/个)</el-descriptions-item>
                            <el-descriptions-item label="产品产地">山东·济南</el-descriptions-item>
                            <el-descriptions-item label="生产经营主体">北京朝阳未来生活大悦城分店</el-descriptions-item>
                            <el-descriptions-item label="联系人">秦艳萍</el-descriptions-item>
                            <el-descriptions-item label="联系电话">18513172770</el-descriptions-item>
                            <el-descriptions-item label="开具日期">2025-10-01</el-descriptions-item>
                        </el-descriptions>
                    </div>

                    <!-- Right Certificate Image Mockup -->
                    <div class="cert-image-mockup">
                        <div class="cert-inner">
                            <div class="cert-sidebar">承诺达标合格证</div>
                            <div class="cert-body">
                                <div class="cert-body-title">我承诺对生产销售的食用农产品：</div>
                                <ul class="cert-promises">
                                    <li><i class="circle"></i> 不使用禁用农药兽药、停用兽药和非法添加物</li>
                                    <li><i class="circle"></i> 常规农药兽药残留不超标</li>
                                    <li><i class="circle"></i> 对承诺的真实性负责</li>
                                </ul>
                                <div class="cert-basis">
                                    <span>承诺依据：</span>
                                    <div class="basis-options">
                                        <span><i class="circle"></i> 委托检测</span>
                                        <span><i class="circle"></i> 自我检测</span>
                                        <span><i class="circle"></i> 内部质量控制</span>
                                        <span><i class="circle filled"></i> 自我承诺</span>
                                    </div>
                                </div>
                                <div class="qr-code-placeholder">
                                    <!-- QR code placeholder -->
                                    <div class="qr-box"></div>
                                </div>
                                <table class="cert-mock-table">
                                    <tr>
                                        <td>产品名称：</td>
                                        <td>开具日期：&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>数量（重量）：</td>
                                        <td>生产者盖章或签名：</td>
                                    </tr>
                                    <tr>
                                        <td>产地：</td>
                                        <td>联系方式：</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Traceability Timeline Section -->
            <div class="section-container">
                <h3 class="section-title">产品溯源</h3>

                <div class="custom-timeline">
                    <!-- Timeline Item 1 -->
                    <div class="timeline-item">
                        <div class="time-col">2019-04-11 20:46</div>
                        <div class="node-col">
                            <div class="dot blue"></div>
                            <div class="line"></div>
                        </div>
                        <div class="content-col">
                            <div class="item-header">
                                <div class="item-title">合格证编号：HGZ-20251212-001-ABC123</div>
                                <div class="item-actions">
                                    <el-button type="primary" class="action-btn">查看合格证图片</el-button>
                                    <el-button type="primary" class="action-btn">查看检测报告</el-button>
                                </div>
                            </div>
                            <div class="item-body">
                                <el-descriptions :column="1" border size="small" class="custom-descriptions">
                                    <el-descriptions-item label="出证类型" label-width="200px">生产企业</el-descriptions-item>
                                    <el-descriptions-item label="样品名称">有机番茄</el-descriptions-item>
                                    <el-descriptions-item label="重量/数量">10 (kg/亩/公顷/个)</el-descriptions-item>
                                    <el-descriptions-item label="产品产地">山东·济南</el-descriptions-item>
                                    <el-descriptions-item label="受检单位名称">北京朝阳未来生活大悦城分店</el-descriptions-item>
                                    <el-descriptions-item label="联系人">秦艳萍</el-descriptions-item>
                                    <el-descriptions-item label="联系电话">18513172770</el-descriptions-item>
                                    <el-descriptions-item label="开具日期">2025-10-01</el-descriptions-item>
                                </el-descriptions>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Item 2 -->
                    <div class="timeline-item">
                        <div class="time-col">2019-04-13 20:46</div>
                        <div class="node-col">
                            <div class="dot green"></div>
                            <div class="line"></div>
                        </div>
                        <div class="content-col">
                            <div class="item-header">
                                <div class="item-title">合格证编号：HGZ-20251212-001-ABC123</div>
                                <div class="item-actions">
                                    <el-button type="primary" class="action-btn">查看合格证图片</el-button>
                                    <el-button type="primary" class="action-btn">查看检测报告</el-button>
                                </div>
                            </div>
                            <div class="item-body">
                                <el-descriptions :column="1" border size="small" class="custom-descriptions">
                                    <el-descriptions-item label="出证类型" label-width="200px">生产企业</el-descriptions-item>
                                    <el-descriptions-item label="样品名称">有机番茄</el-descriptions-item>
                                    <el-descriptions-item label="重量/数量">10 (kg/亩/公顷/个)</el-descriptions-item>
                                    <el-descriptions-item label="产品产地">山东·济南</el-descriptions-item>
                                    <el-descriptions-item label="受检单位名称">北京朝阳未来生活大悦城分店</el-descriptions-item>
                                    <el-descriptions-item label="联系人">秦艳萍</el-descriptions-item>
                                    <el-descriptions-item label="联系电话">18513172770</el-descriptions-item>
                                    <el-descriptions-item label="开具日期">2025-10-01</el-descriptions-item>
                                </el-descriptions>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline Item 3 (Test Results) -->
                    <div class="timeline-item">
                        <div class="time-col">2019-04-13 20:46</div>
                        <div class="node-col">
                            <div class="dot blue"></div>
                            <!-- No line for the last item -->
                        </div>
                        <div class="content-col">
                            <div class="item-header">
                                <div class="item-title">检测结果编号：jcjg2026181892-102</div>
                                <div class="item-actions">
                                    <el-button type="primary" class="action-btn">查看合格证图片</el-button>
                                    <el-button type="primary" class="action-btn">查看检测报告</el-button>
                                </div>
                            </div>
                            <div class="item-body nested-sections">
                                <div class="inner-section">
                                    <h4 class="inner-title">样品信息</h4>
                                    <el-descriptions :column="1" border size="small" class="custom-descriptions">
                                        <el-descriptions-item label="样品编号" label-width="200px"></el-descriptions-item>
                                        <el-descriptions-item label="样品类型"></el-descriptions-item>
                                        <el-descriptions-item label="样品名称"></el-descriptions-item>
                                        <el-descriptions-item label="样品产地"></el-descriptions-item>
                                        <el-descriptions-item label="重量/数量">10 (kg/亩/公顷/个)</el-descriptions-item>
                                        <el-descriptions-item label="检测标准">GB 2763-2021 ()</el-descriptions-item>
                                        <el-descriptions-item label="生产主体"></el-descriptions-item>
                                        <el-descriptions-item label="检测处"></el-descriptions-item>
                                        <el-descriptions-item label="检测机构"></el-descriptions-item>
                                        <el-descriptions-item label="检测人员"></el-descriptions-item>
                                    </el-descriptions>
                                </div>

                                <div class="inner-section" style="margin-top: 24px;">
                                    <h4 class="inner-title">检测结果</h4>
                                    <el-table :data="tableData" border style="width: 100%" size="small"
                                        :header-cell-style="{ background: '#f8f8f9', color: '#333' }">
                                        <el-table-column prop="index" label="序号" width="80" align="center" />
                                        <el-table-column prop="item" label="检测项目" />
                                        <el-table-column label="检测值 (T/C值)" align="center">
                                            <template #default="{ row }">
                                                {{ formatResult(row.value) }}
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="result" label="检测结果" align="center" />
                                    </el-table>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';

defineOptions({
    name: 'TraceabilityResult'
});

const route = useRoute();
const searchCode = ref((route.query.code as string) || '');

const formatResult = (val: any) => {
  if (val === null || val === undefined || val === '') return '--';
  const num = Number(val);
  return isNaN(num) ? val : num.toFixed(2);
};

const tableData = ref([
    {
        index: '1',
        item: '氟虫腈',
        value: '0.32',
        concentration: '<500.00',
        result: '阴性'
    },
    {
        index: '2',
        item: '灭多威',
        value: '5.13',
        concentration: '<500.00',
        result: '阴性'
    }
]);
</script>

<style scoped lang="scss">
.result-container {
    padding: var(--page-container-padding);
    background-color: #f5f7fa;
    min-height: calc(100vh - 84px);
}

.main-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    padding: 30px 40px;
    max-width: 1200px;
    margin: 0 auto;
}

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    .title {
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }

    .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #1a5cff;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(26, 92, 255, 0.3);
    }
}

/* Search Section */
.search-section {
    margin-bottom: 40px;
    display: flex;
    justify-content: center;

    .input-wrapper {
        display: flex;
        width: 100%;
        max-width: 800px;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        overflow: hidden;
        transition: all 0.3s;

        &:focus-within {
            border-color: #1a5cff;
        }

        :deep(.el-input) {
            flex: 1;

            .el-input__wrapper {
                box-shadow: none !important;
                background: transparent;
            }

            .el-input__inner {
                height: 50px;
            }
        }

        .search-btn {
            width: 120px;
            background-color: #1a5cff;
            color: white;
            border: none;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;

            &:hover {
                background-color: #3a72ff;
            }
        }

        .search-icon {
            font-size: 20px;
            color: #909399;
            margin-right: 8px;
            cursor: pointer;
        }
    }
}

/* Sections */
.section-container {
    margin-bottom: 50px;

    .section-title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 20px;
        position: relative;
        padding-left: 0;
    }
}

.cert-number {
    font-size: 15px;
    color: #333;
    margin-bottom: 16px;
}

/* Basic Info Flex Layout */
.info-content-flex {
    display: flex;
    gap: 30px;
    align-items: stretch;

    .info-table-box {
        flex: 1;
        min-width: 0; // prevent flex blowout
    }

    .primary-border {
        border: 2px solid #1a5cff;
        border-radius: 2px;
        overflow: hidden;
    }

    .cert-image-mockup {
        flex: 1;
        min-width: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

/* Customizing el-descriptions to look like the design */
:deep(.custom-descriptions) {
    .el-descriptions__body {
        .el-descriptions__table {
            tbody {
                tr {
                    td.el-descriptions__label {
                        width: 180px;
                        background-color: #fafafa;
                        color: #666;
                        text-align: center;
                        font-weight: normal;
                    }

                    td.el-descriptions__content {
                        color: #333;
                    }
                }
            }
        }
    }
}

/* Mockup Certificate Styling */
.cert-inner {
    border: 4px solid #4a7c59; // Greenish border
    padding: 4px;
    display: flex;
    width: 100%;
    max-width: 500px;
    background: #fff;
    position: relative;

    .cert-sidebar {
        background-color: #4a7c59;
        color: white;
        writing-mode: vertical-lr;
        letter-spacing: 5px;
        padding: 20px 10px;
        font-size: 20px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cert-body {
        flex: 1;
        padding: 15px;
        font-size: 12px;
        color: #333;

        .cert-body-title {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .cert-promises {
            list-style: none;
            padding: 0;
            margin: 0 0 10px 0;

            li {
                margin-bottom: 4px;
                display: flex;
                align-items: center;

                .circle {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border: 1px solid #666;
                    border-radius: 50%;
                    margin-right: 6px;
                }
            }
        }

        .cert-basis {
            margin-bottom: 15px;

            .basis-options {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 5px;

                span {
                    display: flex;
                    align-items: center;
                }

                .circle {
                    display: inline-block;
                    width: 8px;
                    height: 8px;
                    border: 1px solid #666;
                    border-radius: 50%;
                    margin-right: 4px;

                    &.filled {
                        background-color: #333;
                    }
                }
            }
        }

        .qr-code-placeholder {
            position: absolute;
            top: 20px;
            right: 20px;

            .qr-box {
                width: 80px;
                height: 80px;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23333" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><rect x="5" y="5" width="3" height="3"></rect><rect x="16" y="5" width="3" height="3"></rect><rect x="16" y="16" width="3" height="3"></rect><rect x="5" y="16" width="3" height="3"></rect></svg>') no-repeat center center;
                background-size: contain;
            }
        }

        .cert-mock-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;

            td {
                border: 1px solid #ccc;
                padding: 6px;
                width: 50%;
            }
        }
    }
}

/* Custom Timeline Section */
.custom-timeline {
    display: flex;
    flex-direction: column;
    padding-left: 20px;

    .timeline-item {
        display: flex;
        position: relative;
        margin-bottom: 30px;

        .time-col {
            width: 130px;
            text-align: right;
            padding-right: 20px;
            padding-top: 2px;
            font-size: 14px;
            color: #333;
            flex-shrink: 0;
        }

        .node-col {
            width: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            flex-shrink: 0;
            margin-right: 20px;

            .dot {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                z-index: 2;

                &.blue {
                    background-color: #1a5cff;
                }

                &.green {
                    background-color: #67c23a;
                }
            }

            .line {
                width: 2px;
                background-color: #e4e7ed;
                flex: 1;
                position: absolute;
                top: 16px;
                bottom: -30px; // Extend to next item
                z-index: 1;
            }
        }

        .content-col {
            flex: 1;
            min-width: 0;

            .item-header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;

                .item-title {
                    font-size: 16px;
                    color: #333;
                    flex: 1;
                }

                .item-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;

                    .action-btn {
                        border-radius: 2px;
                        padding: 8px 15px;
                        background-color: #1a5cff;
                        border-color: #1a5cff;
                        margin-left: 0;
                        width: 130px;
                    }
                }
            }

            .item-body {
                max-width: 800px; // Keep table width constrained roughly like image
                background: #fff;

                .inner-title {
                    font-size: 15px;
                    margin-bottom: 10px;
                    color: #333;
                }
            }
        }

        // Remove line for last item
        &:last-child .line {
            display: none;
        }
    }
}

/* Responsive adjustments */
@media screen and (max-width: 900px) {
    .info-content-flex {
        flex-direction: column;
    }

    .custom-timeline .timeline-item {
        flex-direction: column;

        .time-col {
            text-align: left;
            margin-bottom: 10px;
            padding-left: 40px; // Align with content roughly
        }

        .node-col {
            position: absolute;
            left: 0;
            top: 30px; // Push node down
        }

        .content-col {
            padding-left: 40px;
        }
    }
}
</style>
