<template>
  <div class="home-container">
    <div class="home-content-wrapper" :class="{ 'is-workbench': hasFiling }">
      <WorkBench v-if="hasFiling" />
      <div v-else class="home-content">
        <!-- 欢迎语区域 -->
        <div class="welcome-section">
          <div class="welcome-header">
            <h2 class="welcome-title">欢迎您，{{ userNickname || '管理员' }}！</h2>
            <div class="welcome-line"></div>
            <p class="welcome-subtitle">完成账号备案后，可使用更多核心业务功能......</p>
          </div>
        </div>

        <!-- 核心业务卡片区域 -->
        <div class="business-grid">
          <div class="business-card">
            <div class="card-icon">
              <Icon icon="ep:edit" color="var(--el-color-primary)" size="28" />
            </div>
            <div class="card-info">
              <h3 class="card-title">快速检测</h3>
              <p class="card-desc">样品录入 | AI判读 | 检测结果 | 检测报告</p>
            </div>
          </div>

          <div class="business-card">
            <div class="card-icon">
              <Icon icon="ep:document" color="var(--el-color-primary)" size="28" />
            </div>
            <div class="card-info">
              <h3 class="card-title">合格证管理</h3>
              <p class="card-desc">合格证开具 | 查验 | 存证</p>
            </div>
          </div>

          <div class="business-card">
            <div class="card-icon">
              <Icon icon="ep:guide" color="var(--el-color-primary)" size="28" />
            </div>
            <div class="card-info">
              <h3 class="card-title">农产品溯源</h3>
              <p class="card-desc">农产品质量溯源查询</p>
            </div>
          </div>
        </div>

        <!-- 备案引导区域：支持自助备案及关联已备案企业 -->
        <div class="action-section">
          <div class="beian-options">
            <el-button type="primary" :disabled="hasFiling" class="beian-btn primary-btn"
              :class="{ 'disabled': hasFiling }" @click="handleBeian">
              完成企业备案
            </el-button>
            <el-button type="primary" :disabled="hasFiling" class="beian-btn secondary-btn"
              :class="{ 'disabled': hasFiling }" @click="handleLinkFiling">
              加入已备案企业
            </el-button>
          </div>
          <div class="beian-tips">
            <p><span class="link-text" @click="handleBeian">*在线自助备案（立即账号备案）</span>
              {{ [1, 2].includes(Number(subjectType)) ? '，或线下联系运营方工作人员完成备案' : '，如所在企业已完成备案，用户直接加入备案企业，无需重复备案' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="enterpriseDialogVisible" title="加入已备案企业" width="860px" append-to-body
      class="enterprise-bind-dialog">
      <div class="enterprise-dialog-body">
        <div class="enterprise-dialog-tip">
          如果您的企业已经完成备案，可在下方选择企业并直接关联，无需重复提交备案资料。
        </div>
        <el-input v-model="enterpriseKeyword" placeholder="搜索企业名称、统一社会信用代码、联系人或联系电话" clearable
          class="enterprise-search" />
        <el-table v-loading="enterpriseLoading" :data="filteredEnterpriseList" height="360" highlight-current-row
          empty-text="暂无已备案企业" class="enterprise-table" @current-change="handleEnterpriseCurrentChange"
          @row-click="selectEnterprise" @row-dblclick="handleBindEnterprise">
          <el-table-column label="选择" width="72" align="center">
            <template #default="{ row }">
              <el-radio :model-value="selectedEnterprise?.deptId" :label="row.deptId" @change="selectEnterprise(row)">
                <span></span>
              </el-radio>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="企业名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="socialCreditCode" label="统一社会信用代码/身份证号" min-width="180" show-overflow-tooltip />
          <el-table-column prop="contactName" label="联系人" width="110" show-overflow-tooltip />
          <el-table-column prop="contactPhone" label="联系电话" width="140" show-overflow-tooltip />
          <el-table-column prop="address" label="详细地址" min-width="220" show-overflow-tooltip />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="enterpriseDialogVisible = false">取消</el-button>
        <el-button @click="loadEnterpriseList">刷新列表</el-button>
        <el-button type="primary" :loading="enterpriseBinding" :disabled="!selectedEnterprise"
          @click="handleBindEnterprise">
          确认关联
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { BluetoothPrinter, buildEscPosTestTicket } from '@/utils';
import * as SubjectApi from '@/api/agri/subject/index';
import * as OrganizationApi from '@/api/agri/organization/index';
import WorkBench from '@/workBench.vue';
import { useCache, CACHE_KEY } from '@/hooks/web/useCache';


const userStore = useUserStore();
const router = useRouter();

// 获取用户昵称（根据 RuoYi-Vue3 默认逻辑从 userStore 获取）
const userNickname = computed(() => userStore.getUser.nickname);
const printerName = ref('未知设备');
const isPrinterReady = ref(false);
const connecting = ref(false);
const printing = ref(false);
const enterpriseDialogVisible = ref(false);
const enterpriseLoading = ref(false);
const enterpriseBinding = ref(false);
const enterpriseList = ref([]);
const selectedEnterprise = ref(null);
const enterpriseKeyword = ref('');
const printer = new BluetoothPrinter({
  namePrefix: 'YSH',
  serviceUUIDs: [
    '000018f0-0000-1000-8000-00805f9b34fb',
    '0000ffe0-0000-1000-8000-00805f9b34fb',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455'
  ],
  characteristicUUIDs: [
    '00002af1-0000-1000-8000-00805f9b34fb',
    '0000ffe1-0000-1000-8000-00805f9b34fb',
    '49535343-8841-43f4-a8d4-ecbe34729bb3'
  ],
  onStatusChange: (ready, name) => {
    isPrinterReady.value = ready;
    printerName.value = name;
  }
});
const subjectType = ref(null) // 注册类型

const isBluetoothSupported = computed(() => printer.isSupported());

const hasFiling = ref(false);

const filteredEnterpriseList = computed(() => {
  const keyword = enterpriseKeyword.value.trim().toLowerCase();
  if (!keyword) return enterpriseList.value;
  return enterpriseList.value.filter((item) => {
    return [
      item.name,
      item.socialCreditCode,
      item.contactName,
      item.contactPhone,
      item.address
    ].some((value) => String(value || '').toLowerCase().includes(keyword));
  });
});

/**
 * 检查当前登录用户所在部门/企业的备案状态
 */
const checkSubjectStatus = async () => {
  try {
    // 调用后端接口，查询本部门是否已经完成备案登记
    const data = await OrganizationApi.hasFiled();
    // 更新备案状态：true 表示已备案（主工作台展示），false 表示未备案（展示备案引导区域）
    hasFiling.value = !!data;
  } catch (error) {
    console.error('获取备案状态失败', error);
  }
};

onMounted(() => {
  checkSubjectStatus();
  const { wsCache } = useCache();

  // 从缓存中直接读取键为 'userDept' 的对象数据
  const cachedDept = wsCache.get(CACHE_KEY.USER_DEPT);
  // 或者直接用字符串键名：wsCache.get('userDept');
  subjectType.value = cachedDept.subjectType

  console.log('缓存中的部门信息为：', cachedDept);

});

/**
 * 处理备案点击事件
 */
const handleBeian = () => {
  // 根据新配置路由跳转至备案表单
  router.push('/filing/institutionCreate');
};

/**
 * 去关联备案信息
 */
const handleLinkFiling = async () => {
  enterpriseDialogVisible.value = true;
  await loadEnterpriseList();
};

const loadEnterpriseList = async () => {
  enterpriseLoading.value = true;
  try {
    enterpriseList.value = await OrganizationApi.getEnterpriseList() || [];
    selectedEnterprise.value = null;
  } catch (error) {
    console.error('获取已备案企业列表失败', error);
    ElMessage.error('获取已备案企业列表失败，请稍后重试');
  } finally {
    enterpriseLoading.value = false;
  }
};

const selectEnterprise = (row) => {
  selectedEnterprise.value = row || null;
};

const handleEnterpriseCurrentChange = (row) => {
  if (row) selectEnterprise(row);
};

const handleBindEnterprise = async (row) => {
  const target = row?.deptId ? row : selectedEnterprise.value;
  if (!target) {
    ElMessage.warning('请选择要关联的企业');
    return;
  }
  enterpriseBinding.value = true;
  try {
    const result = await OrganizationApi.bindDept(target.deptId);
    if (result === false) {
      ElMessage.error('关联企业失败，请稍后重试');
      return;
    }
    ElMessage.success(`已成功关联：${target.name}`);
    enterpriseDialogVisible.value = false;
    hasFiling.value = true;
    try {
      await userStore.setUserInfoAction();
    } catch (error) {
      console.error('刷新用户信息失败', error);
    }
    await checkSubjectStatus();
  } catch (error) {
    console.error('关联企业失败', error);
    ElMessage.error('关联企业失败，请稍后重试');
  } finally {
    enterpriseBinding.value = false;
  }
};

/**
 * 连接蓝牙打印机
 */
const handleConnectPrinter = async () => {
  connecting.value = true;
  try {
    const name = await printer.connect();
    ElMessage.success(`已连接打印机：${name}`);
  } catch (error) {
    if (error?.name !== 'NotFoundError') {
      ElMessage.error(`连接失败：${error?.message || '请重试'}`);
    }
  } finally {
    connecting.value = false;
  }
};

/**
 * 一键打印测试小票
 */
const handleOneClickPrint = async () => {
  if (!isPrinterReady.value) {
    ElMessage.warning('请先连接蓝牙打印机');
    return;
  }
  printing.value = true;
  try {
    const ticket = buildEscPosTestTicket(userNickname.value || 'admin');
    await printer.print(ticket);
    ElMessage.success('打印指令已发送，请检查打印机输出');
  } catch (error) {
    ElMessage.error(`打印失败：${error?.message || '请检查设备连接'}`);
  } finally {
    printing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height));
  background: #fff;
  border-radius: 8px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.home-content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: inherit;

  &.is-workbench {
    display: block;
    padding: 20px;
  }
}

.home-content {
  width: 100%;
  max-width: 1200px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 欢迎语区域 - 匹配登录页标题风格 */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 50px;
  width: 100%;
  justify-content: center;
  margin-left: 56px;

  .welcome-header {
    text-align: left;

    .welcome-title {
      font-size: 28px;
      line-height: 48px;
      color: var(--el-color-primary);
      /* 品牌蓝 */
      margin: 0;
      font-weight: 600;
      letter-spacing: 2px;
    }

    .welcome-line {
      border-top: 1px dashed #D1D5DB;
      margin: 10px 0;
      width: 100%;
    }

    .welcome-subtitle {
      font-size: 24px;
      line-height: 32px;
      color: #333;
      /* 品牌绿 */
      margin: 10px 0 0 0;
      font-weight: 400;
    }
  }
}

/* 核心业务卡片区域 */
.business-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  width: 100%;
  margin-bottom: 60px;

  .business-card {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    transition: all 0.3s;
    border: 1px solid transparent;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-color: #D9EFFF;
    }

    .card-icon {
      width: 56px;
      height: 56px;
      background-color: #f7fcff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .card-svg {
        width: 28px;
        height: 28px;
        color: var(--el-color-primary);
        /* 图标配色同步品牌蓝 */
      }
    }

    .card-info {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin: 0 0 10px 0;
      }

      .card-desc {
        font-size: 14px;
        color: #666666;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

/* 备案引导交互按钮区域样式 */
.action-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;

  /* 双选项容器 */
  .beian-options {
    display: flex;
    justify-content: center;
    gap: 40px;
    width: 100%;
    max-width: 900px;
    margin-bottom: 24px;
  }

  /* 备案引导大按钮基类 */
  .beian-btn {
    flex: 1;
    max-width: 430px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border: none;
    transition: all 0.3s;
    color: #fff;
    border-radius: 4px;

    /* 主要按钮：办理企业备案（使用系统主题色） */
    &.primary-btn {
      background: var(--el-color-primary);

      &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
      }
    }

    /* 次要按钮：加入已备案企业（使用主题色） */
    &.secondary-btn {
      background: var(--el-color-primary);

      &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
      }
    }

    &:active {
      transform: translateY(0);
    }
  }

  /* 统一在下方的提示说明文字样式 */
  .beian-tips {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: 8px;

    p {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      text-align: center;
      white-space: nowrap;
    }

    .link-text {
      color: var(--el-color-primary);
      cursor: pointer;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .disabled {
    background: #e9e9e9 !important;
    cursor: not-allowed;
    color: #888888 !important;
    box-shadow: none !important;
    transform: none !important;

    &:hover {
      opacity: 1;
      transform: none;
      box-shadow: none;
    }
  }
}

.printer-section {
  width: 100%;
  max-width: 880px;
  padding: 20px;
  border: 1px solid #e6f4fb;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7fcff 0%, #ffffff 100%);

  .printer-header {
    margin-bottom: 12px;
  }

  .printer-title {
    margin: 0;
    color: var(--el-color-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .printer-subtitle {
    margin: 8px 0 0;
    color: #666;
    font-size: 14px;
  }

  .printer-status {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .printer-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.enterprise-dialog-body {
  .enterprise-dialog-tip {
    margin-bottom: 14px;
    padding: 12px 14px;
    color: #4b5563;
    background: #f8fbff;
    border: 1px solid #e1f0ff;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
  }

  .enterprise-search {
    margin-bottom: 14px;
  }

  .enterprise-table {
    :deep(.el-table__row) {
      cursor: pointer;
    }

    :deep(.el-radio__label) {
      display: none;
    }
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .home-content {
    padding: 40px 20px;
  }

  .welcome-section .welcome-header {
    .welcome-title {
      font-size: 30px;
    }

    .welcome-subtitle {
      font-size: 18px;
    }
  }

  .business-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .beian-options {
    flex-direction: column;
    gap: 16px;
    align-items: center;
    width: 100%;
  }

  .beian-btn {
    width: 100% !important;
    max-width: 420px;
  }

  .beian-tips {
    padding: 0 16px;
    align-items: center;
    gap: 8px;

    p {
      white-space: normal;
      text-align: center;
    }
  }

  .printer-section .printer-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
