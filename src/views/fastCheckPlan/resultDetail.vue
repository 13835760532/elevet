<template>
  <div class="page-container result-detail-page">
    <!-- 头部标题 -->
    <pageHeader title="检测详情" desc="对检测结果进行拍照上传判读后的结果" />

    <div class="content-wrapper" v-loading="loading">
      <!-- 样品基本信息 -->
      <section class="detail-section">
        <div class="section-header">
          <span class="header-title">样品基本信息</span>
          <div class="stamp-container">
            <div class="stamp" :class="statusClass">{{ statusText }}</div>
          </div>
        </div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">样品编号：</span>
            <span class="value">{{ detailData.sampleCode }}</span>
          </div>
          <div class="info-item">
            <span class="label">样品名称：</span>
            <span class="value">{{ detailData.sampleName }}</span>
          </div>
          <div class="info-item">
            <span class="label">样品产地：</span>
            <span class="value">{{ detailData.sampleOrigin }}</span>
          </div>
          <div class="info-item">
            <span class="label">样品数量（重量）：</span>
            <span class="value">{{ detailData.sampleQuantity }}</span>
          </div>
        </div>
      </section>

      <!-- 生产经营主体 -->
      <section class="detail-section mt-24">
        <div class="section-header">
          <span class="header-title">生产经营主体</span>
        </div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">主体名称：</span>
            <span class="value">{{ detailData.entityName }}</span>
            <el-icon class="expand-icon">
              <ArrowDown />
            </el-icon>
          </div>
          <div class="info-item">
            <span class="label">主体类型：</span>
            <span class="value">{{ detailData.entityType }}</span>
          </div>
          <div class="info-item">
            <span class="label">主营产品：</span>
            <span class="value">{{ detailData.mainProducts }}</span>
          </div>
          <div class="info-item">
            <span class="label">所属地区：</span>
            <span class="value">{{ detailData.region }}</span>
          </div>
          <div class="info-item">
            <span class="label">详细地址：</span>
            <span class="value">{{ detailData.address }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系人：</span>
            <span class="value">{{ detailData.contactPerson }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ detailData.contactPhone }} <span class="hide-tip">【隐藏显示】</span></span>
          </div>
          <div class="info-item">
            <span class="label">生产规模：</span>
            <span class="value">{{ detailData.productionScale }}</span>
          </div>
          <div class="info-item">
            <span class="label">营业执照：</span>
            <span class="value">{{ detailData.businessLicense || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">*信用代码/身份证码：</span>
            <span class="value">{{ detailData.creditCode }} <span class="hide-tip">【身份证码隐藏显示】</span></span>
          </div>
          <div class="info-item">
            <span class="label">企业资质：</span>
            <span class="value">{{ detailData.qualifications || '--' }}</span>
          </div>
          <div class="info-item">
            <span class="label">企业介绍：</span>
            <span class="value">{{ detailData.introduction || '--' }}</span>
          </div>
        </div>
      </section>

      <!-- 检测结果 -->
      <section class="detail-section mt-24">
        <div class="section-header">
          <span class="header-title">检测结果</span>
        </div>
        <div class="info-list no-border">
          <div class="info-item">
            <span class="label">样品状态：</span>
            <span class="value status-text" :class="statusClass">{{ detailData.resultStatus }}</span>
          </div>
          <div class="info-item">
            <span class="label">检测机构：</span>
            <span class="value">{{ detailData.detectionOrg }}</span>
          </div>
          <div class="info-item">
            <span class="label">检测人员：</span>
            <span class="value">{{ detailData.detector }}</span>
          </div>
          <div class="info-item">
            <span class="label">检测日期：</span>
            <span class="value">{{ detailData.detectionDate }}</span>
          </div>
          <div class="info-item photo-item">
            <span class="label">检测照片：</span>
            <div class="photo-list">
              <el-image v-for="(url, index) in detailData.photos" :key="index" :src="url"
                :preview-src-list="detailData.photos" class="photo-img" />
            </div>
          </div>
        </div>

        <!-- 检测数据表格 -->
        <div class="table-container mt-16">
          <el-table :data="detailData.items" border style="width: 100%" class="custom-table">
            <el-table-column prop="channel" label="通道" align="center" width="100" />
            <el-table-column prop="itemName" label="检测项目" align="center" />
            <el-table-column prop="value" label="检测值 (T/C值)" align="center" />
            <el-table-column prop="concentration" label="浓度值(单位ppb)" align="center" />
            <el-table-column prop="result" label="检测结果" align="center" width="120">
              <template #default="{ row }">
                <span :class="row.result === '阳性' ? 'text-danger' : 'text-success'">{{ row.result }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="info-list no-border mt-16">
          <div class="info-item report-item">
            <span class="label">检测报告：</span>
            <div class="report-content">
              <el-image :src="detailData.reportUrl" class="report-preview" />
              <div class="report-actions">
                <el-link type="primary" :underline="false">报告预览</el-link>
                <el-link type="primary" :underline="false">报告下载</el-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部操作按钮 -->
      <div class="footer-actions">
        <el-button @click="handleBack" class="btn-back">返回</el-button>
        <el-button type="primary" @click="handleContinue" class="btn-continue">继续检测</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';
import * as DetectionTaskApi from '@/api/agri/detectionTask/index';

const router = useRouter();
const route = useRoute();
const id = route.query.id;
const loading = ref(false);

// 详情数据
const detailData = reactive({
  sampleCode: '--',
  sampleName: '--',
  sampleOrigin: '--',
  sampleQuantity: '--',
  entityName: '--',
  entityType: '--',
  mainProducts: '--',
  region: '--',
  address: '--',
  contactPerson: '--',
  contactPhone: '--',
  productionScale: '--',
  businessLicense: '',
  creditCode: '--',
  qualifications: '',
  introduction: '',
  resultStatus: '--',
  detectionOrg: '--',
  detector: '--',
  detectionDate: '--',
  photos: [],
  items: [],
  reportUrl: ''
});

const statusText = computed(() => {
  if (detailData.resultStatus === '阳性') return '不合格';
  if (detailData.resultStatus === '阴性') return '合格';
  return '--';
});

const statusClass = computed(() => {
  if (detailData.resultStatus === '阳性') return 'is-danger';
  if (detailData.resultStatus === '阴性') return 'is-success';
  return '';
});

/** 获取详情 */
const getDetail = async () => {
  if (!id) return;
  loading.value = true;
  try {
    const res = await DetectionTaskApi.getDetectionTask(id);
    if (res) {
      // 映射任务数据到详情展示
      // 注意：任务数据(DetectionTaskVO)与检测结果数据字段可能不完全一致，此处根据字段含义进行映射
      detailData.sampleCode = res.taskCode || '--';
      detailData.sampleName = res.taskName || '--';
      detailData.sampleOrigin = res.detectionArea || '--';
      detailData.sampleQuantity = res.sampleCount ? res.sampleCount + '个' : '--';
      
      detailData.resultStatus = res.status === 2 ? '阴性' : (res.status === 3 ? '阳性' : '--');
      detailData.detectionDate = res.receiveTime ? res.receiveTime.substring(0, 10) : '--';
      
      // 处理检测项目列表
      if (res.detectionItems) {
        detailData.items = res.detectionItems.split(',').map((item, index) => ({
          channel: index + 1,
          itemName: item,
          value: '--',
          concentration: '--',
          result: '--'
        }));
      }
      
      // 其他字段如生产主体等在 TaskVO 中暂无，保留默认或从关联数据获取
      // 这里根据实际业务逻辑可能需要调用更多接口
    }
  } catch (error) {
    console.error('获取详情失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getDetail();
});

const handleBack = () => {
  router.back();
};

const handleContinue = () => {
  console.log('继续检测');
};
</script>

<style lang="scss" scoped>
.result-detail-page {
  background-color: #fff;
  height: calc(100vh - 86px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  margin-bottom: 24px;

  .title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .desc {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.content-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  position: relative;
  width: 100%;
  flex: 1;
  overflow-y: auto;
}

.detail-section {
  position: relative;

  .section-header {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: var(--el-color-primary);
        border-radius: 2px;
      }
    }
  }
}

.info-list {
  .info-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f2f2f2;
    font-size: 14px;

    .label {
      width: 180px;
      color: #666;
      flex-shrink: 0;
    }

    .value {
      color: #333;
      flex: 1;

      &.status-text {
        font-weight: 600;

        &.is-danger {
          color: var(--el-color-danger);
        }

        &.is-success {
          color: var(--el-color-success);
        }
      }
    }

    .hide-tip {
      color: #999;
      margin-left: 8px;
      font-size: 12px;
    }

    .expand-icon {
      color: #999;
      cursor: pointer;
      font-size: 16px;
    }
  }

  &.no-border .info-item {
    border-bottom: none;
    padding: 8px 0;
  }
}

.photo-item {
  align-items: flex-start !important;

  .photo-list {
    display: flex;
    gap: 12px;

    .photo-img {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      border: 1px solid #eee;
    }
  }
}

.table-container {
  .custom-table {
    --el-table-header-bg-color: #f8fafc;
    border-radius: 4px;
    overflow: hidden;
  }
}

.report-item {
  align-items: flex-start !important;

  .report-content {
    .report-preview {
      width: 160px;
      border: 1px solid #eee;
      border-radius: 4px;
      margin-bottom: 12px;
      display: block;
    }

    .report-actions {
      display: flex;
      gap: 16px;

      .el-link {
        font-size: 13px;
      }
    }
  }
}

/* 印章样式 */
.stamp-container {
  position: absolute;
  right: -10px;
  top: -15px;
  z-index: 10;
}

.stamp {
  width: 72px;
  height: 72px;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  transform: rotate(-15deg);
  opacity: 0.7;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    width: 85%;
    height: 85%;
    border: 1px solid currentColor;
    border-radius: 50%;
  }

  &.is-danger {
    color: #f5222d;
  }

  &.is-success {
    color: var(--el-color-success);
  }
}

.footer-actions {
  margin-top: 50px;
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-bottom: 40px;

  .el-button {
    min-width: 140px;
    height: 42px;
  }
}

.text-danger {
  color: var(--el-color-danger);
}

.text-success {
  color: var(--el-color-success);
}

.mt-16 {
  margin-top: 16px;
}

.mt-24 {
  margin-top: 24px;
}
</style>
