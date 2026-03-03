<template>
  <div class="table-container">
    <!-- 检测方案指南 -->
    <div class="guide-card">
      <div class="card-header">
        <h2 class="card-title">检测方案指南</h2>
      </div>
      <div class="guide-steps">
        <div v-for="(step, index) in steps" :key="index" class="step-container">
          <div class="step-wrapper">
            <div class="step-icon">{{ step.id }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.description }}</div>
            </div>
          </div>
          <div v-if="index < steps.length - 1" class="step-arrow">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-svg">
              <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 检测方案查询 -->
    <div class="query-card">
      <div class="card-header">
     
        <h2 class="card-title">检测方案查询</h2>
      </div>
      <div class="query-form-wrapper">
        <el-form :inline="true" :model="queryParams" class="custom-query-form custom-query-form-row" label-position="left">
          <el-form-item label="">
            <el-input :prefix-icon="Search" width="200" v-model="queryParams.scheme" placeholder="搜索方案编号或方案名称" class="custom-input w220" />
          </el-form-item>
          <el-form-item label="">
            <el-select v-model="queryParams.category" placeholder="产品分类" class="custom-select">
              <el-option label="全部" value="" />
              <el-option label="蔬菜" value="vegetable" />
              <el-option label="水果" value="fruit" />
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-select v-model="queryParams.status" placeholder="全部状态" class="custom-select">
              <el-option label="未开始" value="0" />
              <el-option label="进行中" value="1" />
              <el-option label="已延期" value="2" />
              <el-option label="已完成" value="3" />
              <el-option label="已结束" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="">
            <el-date-picker
              v-model="queryParams.time"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            />
          </el-form-item>
          <div class="query-btns">
            <el-button @click="handleReset" class="reset-btn">重置</el-button>
            <el-button type="primary" @click="handleQuery" class="search-btn">查询</el-button>
          </div>
        </el-form>
      </div>

      <!-- 操作按钮行 -->
      <div class="table-actions">
        <el-button type="primary" @click="handleAdd" class="add-btn">
          <el-icon>
            <Plus />
          </el-icon>
          <span>创建方案</span>
        </el-button>
      </div>

      <!-- 数据表格 -->
      <div class="table-wrapper">
        <el-table :data="tableList" border="false">
          <el-table-column label="序号" type="index" width="60" align="center" />
          <el-table-column label="方案编号" prop="schemeNo" width="160" />
          <el-table-column label="方案名称" prop="schemeName" min-width="200" show-overflow-tooltip />
          <el-table-column label="产品分类" prop="category" width="100" align="center" />
          <el-table-column label="检测区域" prop="region" width="100" align="center" />
          <el-table-column label="主管单位" prop="dept" min-width="150" show-overflow-tooltip />
          <el-table-column label="方案检测总量" prop="total" width="120" align="center" />
          <el-table-column label="方案开始日期" prop="startDate" width="120" align="center" />
          <el-table-column label="方案结束日期" prop="endDate" width="120" align="center" />
          <el-table-column label="任务方案完成率" prop="rate" width="120" align="center" />
          <el-table-column label="状态" prop="status" width="100" align="center">
            <template #default="scope">
              <span :class="['status-tag', statusMap[scope.row.status].class]">
                {{ statusMap[scope.row.status].text }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <div class="table-operate-action-btns">
                <span class="table-edit-operate" @click="handleEdit(scope.row)" v-if="scope.row.status < 2">编辑</span>
                <span class="table-delete-operate" v-if="scope.row.status == 0" @click="handleDelete(scope.row)">删除</span>
                <span class="table-view-operate" @click="handleView(scope.row)">查看</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-wrapper">
        <div class="page-info">显示第{{ pageParams.pageNum }}页，共{{ totalPage }}页</div>
        <el-pagination v-model:current-page="pageParams.pageNum" v-model:page-size="pageParams.pageSize" :total="total"
          background layout="prev, pager, next" class="custom-pagination" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Calendar, Search } from '@element-plus/icons-vue'

const router = useRouter();

const steps = [
  { id: '01', title: '方案创建', description: '创建工作方案(如年度、专项)' },
  { id: '02', title: '任务拆分', description: '按承建机构拆分检测任务' },
  { id: '03', title: '任务下达', description: '任务下达至承检机构' },
  { id: '04', title: '检测结果查看', description: '任务内检测结果查看' },
  { id: '05', title: '方案进度跟踪', description: '任务执行进度跟踪统计' }
];

const queryParams = reactive({
  scheme: '',
  category: '',
  status: '',
  startDate: '',
  endDate: ''
});

const pageParams = reactive({
  pageNum: 1,
  pageSize: 5
});

const total = ref(28);
const totalPage = computed(() => Math.ceil(total.value / pageParams.pageSize));

const statusMap = {
  0: { text: '未开始', class: 'status-not-started' },
  1: { text: '进行中', class: 'status-processing' },
  2: { text: '已延期', class: 'status-delayed' },
  3: { text: '已完成', class: 'status-completed' },
  4: { text: '已结束', class: 'status-finished' }
};

// 模拟完整数据
const allData = ref([
  { schemeNo: 'FA-SC-202512-001', schemeName: '2025年全国大豆专项检查', category: '蔬菜', region: '全国', dept: '农业农村部农产品质量安全监管司', total: '9000', startDate: '2025-10-1', endDate: '2025-12-28', rate: '100%', status: 0 },
  { schemeNo: 'FA-SC-202512-002', schemeName: '2025年北京市蔬菜快速检测', category: '蔬菜', region: '北京', dept: '北京市农业农村局', total: '5000', startDate: '2025-11-1', endDate: '2025-12-30', rate: '80%', status: 1 },
  { schemeNo: 'FA-SC-202512-003', schemeName: '2025年上海市水果质量检测', category: '水果', region: '上海', dept: '上海市农业农村委员会', total: '3000', startDate: '2025-09-1', endDate: '2025-11-30', rate: '95%', status: 2 },
  { schemeNo: 'FA-SC-202512-004', schemeName: '2025年广东省农产品抽检', category: '蔬菜', region: '广东', dept: '广东省农业农村厅', total: '7000', startDate: '2025-08-1', endDate: '2025-10-31', rate: '100%', status: 3 },
  { schemeNo: 'FA-SC-202512-005', schemeName: '2025年浙江省水产品检测', category: '水产品', region: '浙江', dept: '浙江省农业农村厅', total: '4000', startDate: '2025-07-1', endDate: '2025-09-30', rate: '100%', status: 4 },
  { schemeNo: 'FA-SC-202512-006', schemeName: '2025年江苏省粮食质量检测', category: '粮食', region: '江苏', dept: '江苏省农业农村厅', total: '6000', startDate: '2025-10-15', endDate: '2025-12-15', rate: '60%', status: 1 }
]);

const tableList = ref([]);

const headerCellStyle = {
  backgroundColor: '#FFFFFF',
  color: '#333',
  fontWeight: '500',
  height: '50px',
  borderBottom: '1px solid #f0f0f0'
};

// 查询功能
const handleQuery = () => {
  let filteredData = [...allData.value];

  // 方案筛选
  if (queryParams.scheme) {
    filteredData = filteredData.filter(item =>
      item.schemeNo.includes(queryParams.scheme) ||
      item.schemeName.includes(queryParams.scheme)
    );
  }

  // 产品分类筛选
  if (queryParams.category) {
    filteredData = filteredData.filter(item => item.category === queryParams.category);
  }

  // 状态筛选
  if (queryParams.status !== '') {
    filteredData = filteredData.filter(item => item.status === parseInt(queryParams.status));
  }

  // 日期筛选
  if (queryParams.startDate) {
    filteredData = filteredData.filter(item =>
      new Date(item.startDate) >= new Date(queryParams.startDate)
    );
  }

  if (queryParams.endDate) {
    filteredData = filteredData.filter(item =>
      new Date(item.endDate) <= new Date(queryParams.endDate)
    );
  }

  total.value = filteredData.length;
  pageParams.pageNum = 1;
  updateTableData(filteredData);
  ElMessage.success(`查询成功，共找到 ${filteredData.length} 条记录`);
};

// 重置功能
const handleReset = () => {
  Object.keys(queryParams).forEach(key => (queryParams[key] = ''));
  pageParams.pageNum = 1;
  total.value = allData.value.length;
  updateTableData(allData.value);
  ElMessage.info('已重置查询条件');
};

// 更新表格数据（分页）
const updateTableData = (data) => {
  const start = (pageParams.pageNum - 1) * pageParams.pageSize;
  const end = start + pageParams.pageSize;
  tableList.value = data.slice(start, end);
};

// 监听分页变化
watch(() => pageParams.pageNum, () => {
  handleQuery();
});

// 创建方案
const handleAdd = () => {
  router.push('/fastCheckPlan/schemeCreate');
};

// 编辑方案
const handleEdit = (row) => {
  router.push({
    path: '/fastCheckPlan/schemeCreate',
    query: { id: row.schemeNo, mode: 'edit' }
  });
};

// 删除方案（带二次确认）
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除方案"${row.schemeName}"吗？删除后将无法恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    // 执行删除操作
    const index = allData.value.findIndex(item => item.schemeNo === row.schemeNo);
    if (index > -1) {
      allData.value.splice(index, 1);
      total.value = allData.value.length;
      handleQuery();
      ElMessage.success('删除成功');
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// 查看方案详情
const handleView = (row) => {
  router.push({
    path: '/fastCheckPlan/schemeTask',
    query: { id: row.schemeNo }
  });
};

// 初始化数据
updateTableData(allData.value);
</script>

<style lang="scss" scoped>
.table-container {
  height: 100%;
  overflow-y: auto;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: none !important;
}

.guide-card,
.query-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
}


.query-form-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-top: 18px;
}

/* 指南步骤样式 - 忠实还原设计图 */
.guide-steps {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 18px;
  padding: 8px 0;
  overflow-x: auto;
  &::-webkit-scrollbar{
    width: 0;
  }

  .step-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .step-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-shrink: 0;
  }

  .step-icon {
    width: 38px;
    height: 38px;
    border: 2px solid #71D1F5;
    background: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #71D1F5;
    font-weight: 600;
    margin-top: 2px;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .step-title {
    font-size: 14px;
    color: #00B3ED;
    font-weight: 500;
    white-space: nowrap;
  }

  .step-desc {
    font-size: 10px;
    color: #999;
    line-height: 1.4;
    white-space: nowrap;
  }

  .step-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
    margin-top: 12px; // 对齐圆圈中心
    align-self: flex-start;

    .arrow-svg {
      width: 24px;
      height: 24px;
      color: #ccc;
    }
  }
}


:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  box-shadow: none !important;
  padding: 0 12px;

  &:hover {
    border-color: #00B3ED;
  }

  &.is-focus {
    border-color: #00B3ED;
    box-shadow: none !important;
  }
}

.date-range-box {
  display: flex;
  align-items: center;
  width: 282px;

  :deep(.el-input__wrapper) {
    flex: 1;
    width: 142px;
  }
}

/* 操作行 */
.table-actions {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;

  .add-btn {
    padding: 0 20px;
    background-color: #00B3ED;
    border-color: #00B3ED;
    border-radius: 8px;
    font-weight: 500;

    .el-icon {
      margin-right: 6px;
    }
  }
}

/* 表格定制 */
.table-wrapper {
  margin-bottom: 24px;
}



/* 状态标签 */
.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.status-not-started {
    background-color: #E6F7FF;
    color: #00B3ED;
  }

  &.status-processing {
    background-color: #FFF7E6;
    color: #FA8C16;
  }

  &.status-delayed {
    background-color: #FFF1F0;
    color: #F5222D;
  }

  &.status-completed {
    background-color: #F6FFED;
    color: #52C41A;
  }

  &.status-finished {
    background-color: #F5F5F5;
    color: #8C8C8C;
  }
}

/* 分页适配 */
.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;

  .page-info {
    font-size: 14px;
    color: #666;
  }
}

/* 响应式 */
@media (max-width: 1400px) {
  .guide-steps {
    flex-wrap: wrap;

    .step-arrow {
      display: none;
    }
  }
}
</style>
