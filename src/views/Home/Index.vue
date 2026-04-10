<template>
  <div class="home-container">
    <div class="home-content">
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
            <Icon icon="ep:edit" color="#00B3ED" size="28" />
          </div>
          <div class="card-info">
            <h3 class="card-title">快速检测</h3>
            <p class="card-desc">样品录入 | AI判读 | 检测结果 | 检测报告</p>
          </div>
        </div>

        <div class="business-card">
          <div class="card-icon">
            <Icon icon="ep:document" color="#00B3ED" size="28" />
          </div>
          <div class="card-info">
            <h3 class="card-title">合格证管理</h3>
            <p class="card-desc">合格证开具 | 查验 | 存证</p>
          </div>
        </div>

        <div class="business-card">
          <div class="card-icon">
            <Icon icon="ep:guide" color="#00B3ED" size="28" />
          </div>
          <div class="card-info">
            <h3 class="card-title">农产品溯源</h3>
            <p class="card-desc">农产品质量溯源查询</p>
          </div>
        </div>
      </div>

      <!-- 备案按钮区域 -->
      <div class="action-section">
        <el-button type="primary" :disabled="hasFiling" class="beian-submit-btn" @click="handleBeian">
          立即账号备案
        </el-button>
      </div>

      <!-- 便携式打印机区域 -->
      <!-- <div class="printer-section">
        <div class="printer-header">
          <h3 class="printer-title">便携式打印机</h3>
          <p class="printer-subtitle">蓝牙连接后，一键打印测试小票</p>
        </div>
        <div class="printer-status">
          <el-tag :type="isPrinterReady ? 'success' : 'info'">
            {{ isPrinterReady ? `已连接：${printerName}` : '未连接设备' }}
          </el-tag>
          <el-tag v-if="!isBluetoothSupported" type="warning">
            当前浏览器不支持 Web Bluetooth
          </el-tag>
        </div>
        <div class="printer-actions">
          <el-button type="primary" plain :disabled="!isBluetoothSupported || connecting" @click="handleConnectPrinter">
            {{ connecting ? '连接中...' : '连接蓝牙打印机' }}
          </el-button>
          <el-button type="success" :disabled="!isPrinterReady || printing" @click="handleOneClickPrint">
            {{ printing ? '打印中...' : '蓝牙一键打印' }}
          </el-button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { BluetoothPrinter, buildEscPosTestTicket } from '@/utils';
import * as SubjectApi from '@/api/agri/subject/index';

const userStore = useUserStore();
const router = useRouter();

// 获取用户昵称（根据 RuoYi-Vue3 默认逻辑从 userStore 获取）
const userNickname = computed(() => userStore.getUser.nickname);
const printerName = ref('未知设备');
const isPrinterReady = ref(false);
const connecting = ref(false);
const printing = ref(false);
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
const isBluetoothSupported = computed(() => printer.isSupported());

const hasFiling = ref(false);

/**
 * 检查备案状态
 */
const checkSubjectStatus = async () => {
  try {
    const data = await SubjectApi.hasDeptSubject();
    hasFiling.value = !!data;
  } catch (error) {
    console.error('获取备案状态失败', error);
  }
};

onMounted(() => {
  checkSubjectStatus();
});

/**
 * 处理备案点击事件
 */
const handleBeian = () => {
  // 根据新配置路由跳转至备案表单
  router.push('/filing/subjectCreate');
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
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: calc(100vh - var(--top-tool-height) - var(--tags-view-height));
  background: #fff;
  border-radius: 8px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
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
      color: #00B3ED;
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
        color: #00B3ED;
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

/* 备案按钮区域 - 完全复刻 login-submit-btn */
.action-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;

  .beian-submit-btn {
    width: 420px;
    height: 48px;
    background: #00B3ED;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    border: none;
    transition: all 0.3s;
    color: #fff;

    &:hover {
      opacity: 0.8;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 179, 237, 0.3);
    }

    &:active {
      transform: translateY(0);
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
    color: #00B3ED;
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

  .beian-submit-btn {
    width: 100% !important;
  }

  .printer-section .printer-actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
