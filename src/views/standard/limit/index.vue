<template>
  <div class="page-container" v-loading="loading">
    <!-- 统一头部区域 (指南 + 搜索) -->
    <div class="header-section">
      <div class="header-top">
        <h2 class="page-title">国标限量</h2>
        <p class="page-desc">根据产品名称或目标检测项查询对应的国标限量数据 （GB2763-2021、 GB31650）</p>
      </div>

      <div class="search-bar">
        <el-form :inline="true" @submit.prevent class="full-width-form">
          <el-form-item class="!mb-0 search-input-item">
            <el-input :prefix-icon="Search" v-model="queryParams.keyword" placeholder="搜索农药化学名称、食物名称、用途查询国标限量信息"
              class="custom-search-input" clearable @keyup.enter="handleSearch" />
          </el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">
            <Icon icon="ep:search" class="mr-5px" /> 搜索
          </el-button>
        </el-form>
      </div>
    </div>

    <!-- 数据网格区域 -->
    <div class="grid-container">
      <div v-if="list.length > 0" class="data-grid">
        <div v-for="(item, index) in list" :key="index" class="data-card">
          <div class="card-info">
            <div class="info-row">
              <span class="label">目标物名称：</span>
              <span class="value name-highlight">{{ item.targetName || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">主要用途：</span>
              <span class="value">{{ item.mainPurpose || '-' }}</span>
            </div>
          </div>

          <div class="card-table">
            <el-table :data="item.produceRanges" style="width: 100%" border size="small">
              <el-table-column prop="foodCategory" label="食品类别" align="center" width="130" show-overflow-tooltip>
                <template #default="scope">{{ scope.row.foodCategory || '-' }}</template>
              </el-table-column>
              <el-table-column prop="foodName" label="食品名称" align="center" min-width="100">
                <template #default="scope">{{ scope.row.foodName || '-' }}</template>
              </el-table-column>
              <el-table-column label="最大残留限量 (MRL)" align="center" width="160">
                <template #default="scope">
                  <div class="limit-value">
                    <span class="num">{{ scope.row.maxResidueLimit || '-' }}</span>
                    <span class="unit">{{ scope.row.unit }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <!-- 无数据状态 -->
      <el-empty v-else-if="!loading" description="暂无相关限量标准信息" />
    </div>

    <!-- 底部吸附分页栏 -->
    <div class="footer-pagination" v-if="total > 0">
      <el-pagination v-model:current-page="queryParams.pageNo" v-model:page-size="queryParams.pageSize" :total="total"
        background layout="total, prev, pager, next" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as ProduceTargetLimitApi from '@/api/agri/produceTargetLimit'

defineOptions({ name: 'StandardLimit' })

const loading = ref(false)
const list = ref<ProduceTargetLimitApi.ProduceTargetLimitGroupRespVO[]>([])
const total = ref(0)

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  keyword: ''
})

/** 获取数据列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProduceTargetLimitApi.searchProduceTargetLimitByKeyword(queryParams)
    list.value = data.list
    total.value = data.total
  } catch (error) {
    console.error('Fetch limit data failed:', error)
  } finally {
    loading.value = false
  }
}

/** 搜索操作 */
const handleSearch = () => {
  queryParams.pageNo = 1
  getList()
}

/** 页码切换 */
const handleCurrentChange = (val: number) => {
  queryParams.pageNo = val
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
}

/* 头部区域样式 */
.header-section {
  background: #fff;
  padding: 16px 20px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 10;
  flex-shrink: 0;

  .header-top {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 4px 0;
    }

    .page-desc {
      font-size: 13px;
      color: #909399;
      margin: 0;
    }
  }

  .search-bar {
    .full-width-form {
      display: flex;
      width: 100%;
    }

    .search-input-item {
      flex: 1;
      margin-right: 0;
      :deep(.el-form-item__content) {
        width: 100%;
        display: flex;
      }
    }

    .custom-search-input {
      width: 100%;
      display: flex;
      justify-content: flex-start;

      :deep(.el-input__wrapper) {
        background-color: #f4f6f8;
        box-shadow: none;
        border: 1px solid transparent;
        transition: all 0.3s;

        &:hover,
        &.is-focus {
          border-color: #00B3ED;
          background-color: #fff;
        }
      }
    }

    .search-btn {
      background-color: #00B3ED;
      border-color: #00B3ED;
      padding: 0 24px;
      height: 32px;
      margin-left: 12px;
    }
  }
}

/* 网格容器 */
.grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px 16px 20px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding-bottom: 20px;
}

.data-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .info-row {
    display: flex;
    font-size: 14px;
    align-items: center;

    .label {
      color: #606266;
      width: 90px;
      text-align: left;
      flex-shrink: 0;
    }

    .value {
      color: #303133;

      &.name-highlight {
        color: #00B3ED;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

/* 限量数值样式 */
.limit-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;

  .num {
    color: #ff8d31;
    font-weight: 700;
    font-size: 14px;
  }

  .unit {
    color: #909399;
    font-size: 12px;
  }
}

/* 表格定制 */
:deep(.el-table) {
  --el-table-header-bg-color: #f8fafc;
  border-radius: 4px;

  th.el-table__cell {
    font-weight: 600;
    color: #606266;
  }
}

/* 底部工具栏 */
.footer-pagination {
  background: #fff;
  padding: 12px 24px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 1400px) {
  .header-section .search-bar .custom-search-input {
    width: 400px;
  }
}

@media (max-width: 1100px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
}
</style>
