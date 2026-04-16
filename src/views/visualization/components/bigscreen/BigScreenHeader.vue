<template>
  <header class="screen-header">
    <div class="header-side left">
      <!-- 数据配置 -->
      <div class="data-config-btn" @click="toggleConfig">
        <div class="hexagon-icon">
          <div class="inner-dot"></div>
        </div>
        <span class="btn-label">数据配置</span>
        <div class="caret-icon"></div>
      </div>

      <div
        class="nav-btn"
        v-for="item in leftMenus"
        :key="item.label"
        :style="{ backgroundImage: `url(${item.bg})` }"
      >
        <span class="btn-label"></span>
      </div>
      <!-- 数据配置弹窗 -->
      <div v-if="showConfig" class="data-config-panel">
        <div class="panel-header">
          <div class="header-icon-double">
            <span></span>
            <span></span>
          </div>
          <span class="header-title">数据配置</span>
        </div>

        <div class="panel-body">
          <div class="form-item">
            <div class="item-label">数据时间范围</div>
            <el-date-picker
              v-model="configForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              class="custom-date-picker"
            />
          </div>

          <div class="form-item">
            <div class="item-label">数据地区设置</div>
            <el-select v-model="configForm.region" size="small" class="custom-select">
              <el-option label="山东-济南" value="shandong-jinan" />
            </el-select>
          </div>

          <div class="form-item">
            <div class="item-label">风险公告更新频次</div>
            <div class="frequency-input">
              <span>每</span>
              <el-input-number
                v-model="configForm.frequency"
                :min="1"
                :controls="false"
                size="small"
                class="custom-number-input"
              />
              <span>分钟更新一次</span>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <el-button class="save-btn" @click="saveConfig">保存配置</el-button>
          <el-button class="cancel-btn" @click="showConfig = false">取消</el-button>
        </div>
      </div>
    </div>
    <div class="header-center" >
      <h1>链安食检数智服务平台</h1>
    </div>
    <div class="header-side right">
      <div
        class="nav-btn"
        v-for="item in rightMenus"
        :key="item.label"
        :style="{ backgroundImage: `url(${item.bg})` }"
      >
        <span class="btn-label"></span>
      </div>
      <div class="assistant-badge">
        <div class="assistant-text">
          <strong>我是小壹</strong>
          <span>有任何问题都可以找我哦~</span>
        </div>
        <img :src="botImg" alt="assistant" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { List, Aim, Checked, Bell } from '@element-plus/icons-vue';
import botImg from '@/assets/imgs/echarts/bot.png';
import dataConfigBg from '@/assets/imgs/echarts/首页/sjpz_bg.png';
import taskBg from '@/assets/imgs/echarts/首页/jcrw_nor.png';
import inspectBg from '@/assets/imgs/echarts/首页/jiance_nor.png';
import certBg from '@/assets/imgs/echarts/首页/hegezheng_nor.png';
import warnBg from '@/assets/imgs/echarts/首页/xyyj_nor.png';

const showConfig = ref(false);
const configForm = reactive({
  timeRange: [],
  region: 'shandong-jinan',
  frequency: 5
});

const toggleConfig = () => {
  showConfig.value = !showConfig.value;
};

const saveConfig = () => {
  console.log('保存配置:', configForm);
  showConfig.value = false;
};

const leftMenus = [
  { label: '检测任务', bg: taskBg, icon: List },
  { label: '快速检测', bg: inspectBg, icon: Aim }
];

const rightMenus = [
  { label: '合格证', bg: certBg, icon: Checked },
  { label: '小壹预警', bg: warnBg, icon: Bell }
];
</script>

<style scoped lang="scss">
.screen-header {
  height: 98px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 640px 1fr;
  align-items: center;
  background: url('@/assets/imgs/echarts/首页/tiile_bg.png') no-repeat center center;
  background-size: 100% 100%;
}

.header-side {
  display: flex;
  justify-content: flex-end;
  column-gap: 2px; /* 增加间距 */
  padding: 12px 30px 0;
  align-self: start;
  position: relative; /* 为弹窗定位 */

  &.right {
    justify-content: flex-start;
  }
}

.data-config-btn {
  height: 46px;
  min-width: 160px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
  cursor: pointer;
  gap: 10px;

  .hexagon-icon {
    width: 24px;
    height: 24px;
    background: rgba(0, 218, 255, 0.1);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    border: 1px solid rgba(0, 218, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;

    .inner-dot {
      width: 6px;
      height: 6px;
      background: #00daff;
      border-radius: 50%;
      box-shadow: 0 0 8px #00daff;
    }
  }

  .caret-icon {
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #00daff;
    margin-left: 4px;
  }
}

.nav-btn {
  height: 46px;
  min-width: 140px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
  cursor: pointer;
  gap: 22px;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.2);
    text-shadow: 0 0 10px rgba(0, 218, 255, 0.8);
  }
}

/* 数据配置面板样式 */
.data-config-panel {
  position: absolute;
  top: 62px;
  left: 30px;
  width: 440px;
  background: linear-gradient(180deg, rgba(7, 26, 60, 0.98) 0%, rgba(4, 15, 40, 0.98) 100%);
  // border: 1px solid #1d91ff;
  box-shadow: 0 0 30px rgba(29, 145, 255, 0.35);
  z-index: 1000;
  padding: 1px;
  border-radius: 4px;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 2%;
    width: 96%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #37dcff, transparent);
    box-shadow: 0 0 12px #37dcff;
    pointer-events: none;
    z-index: 1;
  }
  &::after{
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    pointer-events: none;
    right: -1px;
    bottom: -1px;
    border-right: 2px solid #37dcff;
    border-bottom: 2px solid #37dcff;
  }
}

.panel-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  background: url('@/assets/imgs/echarts/首页/sjpz_label.png') no-repeat center center;
  background-size: 100% 60px;

  .header-title {
    color: #fff;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 2px;
    padding-left: 40px;
    text-shadow: 0 0 10px rgba(166, 216, 255, 0.8);
  }
}

.panel-body {
  padding: 24px 24px 16px;
}

.form-item {
  margin-bottom: 24px;

  .item-label {
    color: #9ebfdd;
    font-size: 18px;
    margin-bottom: 12px;
  }
}

.frequency-input {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #d4eaff;
  font-size: 18px;
}

/* 自定义 Element Plus 样式 */
:deep(.custom-date-picker) {
  width: 100% !important;
  background: rgba(13, 35, 75, 0.6) !important;
  border: 1px solid #3a87e3 !important;
  border-radius: 2px;

  .el-range-input {
    background: transparent !important;
    color: #d4eaff !important;
    font-size: 18px !important;
    &::placeholder {
      color: rgba(212, 234, 255, 0.5) !important;
    }
  }
  .el-range-separator {
    color: #9ebfdd !important;
    font-size: 18px;
  }
  .el-icon {
    color: #43e4ff !important;
    font-size: 18px;
  }
}

:deep(.custom-select) {
  width: 100% !important;
  .el-input__wrapper {
    background: rgba(13, 35, 75, 0.6) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 2px;
  }
  .el-input__inner {
    color: #d4eaff !important;
    font-size: 18px !important;
    height: 42px !important;
  }
  .el-select__caret {
    color: #00daff !important;
    font-size: 20px;
  }
}

:deep(.custom-number-input) {
  width: 100px !important;
  .el-input__wrapper {
    background: rgba(13, 35, 75, 0.6) !important;
    box-shadow: 0 0 0 1px #3a87e3 inset !important;
    border-radius: 2px;
    padding: 0 8px;
  }
  .el-input__inner {
    color: #d4eaff !important;
    font-size: 20px !important;
    text-align: left;
  }
}

.panel-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 20px;

  .el-button {
    flex: 1;
    height: 46px;
    font-size: 20px;
    border: none;
    border-radius: 0;
  }

  .save-btn {
    background: #18acb2 !important;
    color: #fff !important;
    &:hover {
      opacity: 0.9;
    }
  }

  .cancel-btn {
    background: transparent !important;
    border: 1px solid rgba(57, 141, 231, 0.6) !important;
    color: #9ebfdd !important;
    &:hover {
      background: rgba(57, 141, 231, 0.1) !important;
    }
  }
}

.header-center {
  position: relative;
  height: 82px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;

  h1 {
    margin: 0;
    color: #e7f6ff;
    font-size: 48px;
    font-weight: 800;
    letter-spacing: 2px;
    text-shadow: 0 0 15px rgba(63, 212, 255, 0.35);
  }
}

.center-glow {
  position: absolute;
  bottom: -1px;
  left: 50%;
  width: 74%;
  height: 3px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, transparent, #43e4ff, transparent);
}

.assistant-badge {
  height: 52px;
  border: 1px solid rgba(79, 152, 255, 0.75);
  background: linear-gradient(90deg, rgba(66, 83, 190, 0.65), rgba(34, 54, 157, 0.35));
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 40px;
    height: 40px;
  }
}

.assistant-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  strong {
    color: #8ecbff;
    font-size: 18px;
    font-weight: 700;
  }

  span {
    color: #d4eaff;
    font-size: 14px;
  }
}
</style>
