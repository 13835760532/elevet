<template>
    <div class="app-container">
        <!-- 顶部任务详情卡片 -->
        <div class="task-detail-card">
            <div class="card-left">
                <div class="info-item">
                    <span class="label">任务名称：</span>
                    <span class="value">2026年1月北京市、天津市蔬菜快速检测-任务1</span>
                </div>
                <div class="info-item">
                    <span class="label">任务编号：</span>
                    <span class="value">RW20251101</span>
                </div>
                <div class="info-item">
                    <span class="label">承担单位：</span>
                    <span class="value">三二一检测机构</span>
                </div>
                <!-- <div class="info-item">
                    <span class="label">检测范围：</span>
                    <span class="value">北京、天津</span>
                </div> -->
                <div class="info-item">
                    <span class="label">检测品种：</span>
                    <div class="品种-wrapper">
                        <span class="value">芹菜、黄瓜、韭菜...</span>
                    </div>
                </div>
                <div class="info-item">
                    <span class="label">检测项目：</span>
                    <span class="value">对硫磷、甲拌磷</span>
                </div>
                <div class="info-item">
                    <span class="label">执行时间：</span>
                    <span class="value">2024年12月11日至2024年12月28日</span>
                </div>
            </div>

            <div class="card-right">
                <div class="stats-row">
                    <div class="info-col">
                        <div class="info-item">
                            <span class="label">所属方案：</span>
                            <span class="value">2026年1月北京市、天津市蔬菜快速检测工作方案</span>
                        </div>
                        <div class="info-item">
                            <span class="label">方案编号：</span>
                            <span class="value">FA-SC-202601-001</span>
                        </div>
                        <div class="info-item">
                            <span class="label">主管单位：</span>
                            <span class="value">农业农村部水产品质量监督检验测试中心（上海）</span>
                        </div>
                        <div class="info-item">
                            <span class="label">任务类型：</span>
                            <span class="value">快速检测</span>
                        </div>
                        <div class="info-item">
                            <span class="label">产品分类：</span>
                            <span class="value">蔬菜</span>
                        </div>
                        <div class="info-item">
                            <span class="label">检测地区：</span>
                            <span class="value">北京、天津</span>
                        </div>
                        <div class="info-item">
                            <span class="label">执行时间：</span>
                            <span class="value">2024年12月11日至2024年12月28日</span>
                        </div>
                    </div>
                    <div class="progress-col">
                        <el-progress type="circle" :percentage="80" :width="120" color="#00B3ED" :stroke-width="10" />
                        <div class="progress-label">任务完成率</div>
                        <div class="progress-info">(800/1000)</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部列表内容区域 -->
        <div class="list-content-area">
            <!-- Tabs 切换 -->
            <div class="custom-tabs">
                <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
                    @click="activeTab = tab.key">{{ tab.label }}</div>
            </div>

            <div class="tab-pane-container">
                <!-- 子任务列表 Tab -->
                <template v-if="activeTab === 'subtask'">
                    <!-- 查询表单 -->
                    <div class="query-section">
                        <el-form :model="queryParams" ref="queryRef" :inline="true" class="custom-query-form">
                            <el-form-item label="任务">
                                <el-input v-model="queryParams.task" placeholder="请输入任务编号或任务名称" class="w200" />
                            </el-form-item>
                            <el-form-item label="承担单位">
                                <el-input v-model="queryParams.unit" placeholder="" class="w150" />
                            </el-form-item>
                            <el-form-item label="任务状态">
                                <el-select v-model="queryParams.status" placeholder="请选择" class="w120">
                                    <el-option label="进行中" value="ongoing" />
                                    <el-option label="已完成" value="completed" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="执行时间">
                                <el-date-picker v-model="queryParams.dateRange" type="daterange" range-separator="至"
                                    start-placeholder="开始日期" end-placeholder="结束日期" class="date-picker-custom" />
                            </el-form-item>
                            <div class="query-btns">
                                <el-button @click="handleReset">重置</el-button>
                                <el-button type="primary" @click="handleQuery">查询</el-button>
                            </div>
                        </el-form>
                    </div>

                    <!-- 装饰线及操作按钮 -->
                    <div class="action-bar-row">
                        <div class="action-left">
                            <div class="brand-btn" @click="handleCreateTask">
                                新建子任务（转派）
                                <el-icon class="flash-icon">
                                    <Lightning />
                                </el-icon>
                            </div>
                        </div>
                        <el-button class="export-btn" type="primary" @click="handleExport">导出</el-button>
                    </div>

                    <!-- 数据表格 -->
                    <div class="table-wrapper">
                        <el-table v-loading="loading" :data="tableData" border
                            :header-cell-style="{ background: '#F3F4F6', color: '#333333', fontWeight: 'bold' }"
                            :row-style="{ height: '60px' }">
                            <el-table-column label="序号" type="index" width="60" align="center" />
                            <el-table-column label="任务编号" prop="taskNo" align="center" width="120" />
                            <el-table-column label="任务名称" prop="taskName" align="center" min-width="180"
                                show-overflow-tooltip />
                            <el-table-column label="承担单位" prop="unit" align="center" min-width="120" />
                            <el-table-column label="检测区域范围" prop="area" align="center" width="120" />
                            <el-table-column label="检测品种" prop="category" align="center" min-width="120"
                                show-overflow-tooltip />
                            <el-table-column label="检测项目" prop="items" align="center" min-width="120"
                                show-overflow-tooltip />
                            <el-table-column label="执行时间" prop="timeRange" align="center" width="200" />
                            <el-table-column label="任务完成率(已完成样品数/总样品数)" align="center" width="250">
                                <template #default="{ row }">
                                    {{ row.rate }}% ({{ row.finished }}/{{ row.total }})
                                </template>
                            </el-table-column>
                            <el-table-column label="状态" prop="status" align="center" width="100" />
                            <el-table-column label="操作" align="center" width="100" fixed="right">
                                <template #default="{ row }">
                                    <span class="table-link" @click="handleView(row)">查看</span>
                                </template>
                            </el-table-column>
                        </el-table>

                        <!-- 分页 -->
                        <div class="pagination-footer">
                            <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total"
                                layout="prev, pager, next, jumper, total" background class="custom-pagination"
                                @current-change="handlePageChange" />
                        </div>
                    </div>
                </template>

                <!-- 检测结果 Tab -->
                <template v-if="activeTab === 'result'">
                    <DetectionProgress :tableData="progressList" :total="progressTotal" @query="handleProgressQuery"
                        @reset="handleProgressReset" />
                </template>

                <!-- 进度监控 Tab -->
                <template v-if="activeTab === 'monitor'">
                    <ProgressHistory :treeData="historyData" />
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Lightning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import DetectionProgress from '@/components/DetectionProgress/index.vue'
import ProgressHistory from '@/components/ProgressHistory/index.vue'

const router = useRouter()

const activeTab = ref('subtask')
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(28)

const tabs = [
    { label: '子任务列表', key: 'subtask' },
    { label: '检测结果', key: 'result' },
    { label: '进度监控', key: 'monitor' }
]

const queryParams = reactive({
    task: '',
    unit: '',
    status: '',
    dateRange: []
})

const tableData = ref([
    {
        taskNo: 'RW20251101',
        taskName: '2025年丹江市快速检测任务',
        unit: '三二一检测机构',
        area: '全国',
        category: '芹菜、黄瓜、韭菜......',
        items: '对硫磷、甲拌磷',
        timeRange: '2025-10-1至2025-12-28',
        rate: 80,
        finished: 300,
        total: 400,
        status: '未开始'
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年武汉快速检测任务',
        unit: '三二一检测机构',
        area: '北京、上海',
        category: '芹菜、黄瓜、韭菜......',
        items: '对硫磷、甲拌磷',
        timeRange: '2025-10-1至2025-12-28',
        rate: 20,
        finished: 100,
        total: 500,
        status: '进行中'
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年东北快速检测任务',
        unit: '三二一检测机构',
        area: '天津',
        category: '芹菜、黄瓜、韭菜......',
        items: '对硫磷、甲拌磷',
        timeRange: '2025-10-1至2025-12-28',
        rate: 20,
        finished: 100,
        total: 500,
        status: '已完成'
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年南京快速检测任务',
        unit: '三二一检测机构',
        area: '南昌',
        category: '芹菜、黄瓜、韭菜......',
        items: '对硫磷、甲拌磷',
        timeRange: '2025-10-1至2025-12-28',
        rate: 20,
        finished: 100,
        total: 500,
        status: '已完成'
    },
    {
        taskNo: 'RW20251101',
        taskName: '2025年长江快速检测任务',
        unit: '三二一检测机构',
        area: '武汉',
        category: '芹菜、黄瓜、韭菜......',
        items: '对硫磷、甲拌磷',
        timeRange: '2025-10-1至2025-12-28',
        rate: 20,
        finished: 100,
        total: 500,
        status: '已完成'
    }
])

function handleQuery() {
    console.log('Query:', queryParams)
}

function handleReset() {
    queryParams.task = ''
    queryParams.unit = ''
    queryParams.status = ''
    queryParams.dateRange = []
}

function handleCreateTask() {
    console.log('Create Subtask')
}

function handleExport() {
    console.log('Export Data')
}

function handleView(row) {
    console.log('View Item:', row)
    router.push({
        path: '/taskDetection/taskDetail',
        query: { id: row.sampleNo }
    });
}

function handlePageChange(page) {
    pageNum.value = page
}

// 检测进度数据
const progressTotal = ref(100)
const progressList = ref([
    {
        sampleNo: 'yp20242132131',
        sampleName: '豇豆',
        category: '蔬菜',
        origin: '山东-济南',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        org: '盒马鲜生',
        testTime: '--',
        result: '--',
        status: '未检测'
    },
    {
        sampleNo: 'yp20242132132',
        sampleName: '草莓',
        category: '水果',
        origin: '山东-济南',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        org: '北京市平谷区农业综合检验检测中心',
        testTime: '2023-09-09',
        result: '阴性',
        status: '已检测'
    },
    {
        sampleNo: 'yp20242132133',
        sampleName: '桂鱼',
        category: '水产品',
        origin: '辽宁-大连',
        subject: '北京章三商户',
        region: '北京市-大兴区',
        org: '北京果村蔬菜专业合作社',
        testTime: '2023-09-09',
        result: '结果异常',
        status: '失败'
    }
])

// 进度历史树形数据
const historyData = reactive({
    name: '农产品例行检测',
    children: [
        {
            name: '海淀区任务检测中心',
            progress: '(100/500)',
            children: [
                {
                    name: '三一检测机构',
                    progress: '(100/400)',
                    children: [
                        { name: '朝阳大悦城检测中心' },
                        { name: '顺意检测' }
                    ]
                },
                {
                    name: '三二检测机构',
                    progress: '(0/100)',
                    warning: true
                }
            ]
        },
        {
            name: '朝阳区任务检测中心',
            children: [
                { name: '三三检测机构' },
                { name: '三四检测机构' },
                { name: '三五检测机构' }
            ]
        },
        {
            name: '大兴区任务检测中心',
            children: [
                { name: '兴隆检测机构' }
            ]
        }
    ]
})

function handleProgressQuery(params) {
    console.log('Progress Query:', params)
}

function handleProgressReset() {
    console.log('Progress Reset')
}
</script>

<style lang="scss" scoped>
.app-container {
    padding: 0px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 14px;
    background: transparent;
}

/* 顶部详情卡片 */
.task-detail-card {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 40px;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);

    .info-item {
        display: flex;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 1.6;

        .label {
            color: #333333;
            white-space: nowrap;
            min-width: 70px;
        }

        .value {
            color: #333333;
            font-weight: 500;
        }
    }


    .card-left {
        border-right: 1px solid #eeeeee;
        padding-right: 40px;

        .品种-wrapper {
            position: relative;
            display: inline-block;
        }

        .sticky-note {
            position: absolute;
            top: -60px;
            left: 100px;
            width: 180px;
            background: #FFD25E;
            padding: 10px;
            border-radius: 2px;
            box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.1);
            z-index: 10;

            &::before {
                content: '';
                position: absolute;
                left: -40px;
                top: 50%;
                width: 40px;
                height: 1px;
                background: #FFD25E;
            }

            .note-header {
                font-size: 12px;
                margin-bottom: 8px;
            }

            .note-content {
                background: #ffffff;
                padding: 5px;
                min-height: 60px;
                font-size: 12px;
                color: #666;
                border-radius: 2px;
            }

            .note-footer {
                font-size: 10px;
                margin-top: 5px;
                text-align: right;
                color: #666;
            }
        }
    }

    .card-right {
        .stats-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .info-col {
            flex: 1;
        }

        .progress-col {
            width: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 20px;

            .progress-label {
                font-size: 14px;
                color: #333;
                margin-top: 15px;
                font-weight: bold;
            }

            .progress-info {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
        }
    }
}

/* 列表容器 */
.list-content-area {
    background: #fff;
    padding: 16px;
    border-radius: 10px;
    flex: 1;
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);

    .custom-tabs {
        display: flex;
        background: #e4e7ed;
        border-radius: 4px;
        padding: 2px;
        width: fit-content;
        margin-bottom: 24px;

        .tab-item {
            padding: 8px 30px;
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            color: #333;
            transition: all 0.3s;

            &.active {
                background: #00B3ED;
                color: #ffffff;
            }
        }
    }

    .query-section {
        margin-bottom: 20px;
    }

    /* 操作行 */
    .action-bar-row {
        padding-top: 20px;
        border-top: 1px solid #eeeeee;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .brand-btn {
            display: flex;
            align-items: center;
            background: #00B3ED;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0, 179, 237, 0.3);

            .flash-icon {
                margin-left: 8px;
                font-size: 18px;
                color: #FFD25E;
            }
        }

        .export-btn {
            padding: 10px 30px;
            background: #00B3ED;
            border-color: #00B3ED;
        }
    }

    .table-wrapper {
        :deep(.el-table) {
            border-radius: 8px;
            overflow: hidden;

            .el-button--link {
                color: #00B3ED;
                text-decoration: underline;
            }
        }
    }

    .pagination-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;

    }
}

.table-link {
    color: #999;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
        color: #00B3ED;
    }
}
</style>
