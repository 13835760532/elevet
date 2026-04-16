<template>
  <header class="screen-header">
    <div class="header-side left">
      <div
        class="nav-btn"
        v-for="item in leftMenus"
        :key="item.label"
        :style="{ backgroundImage: `url(${item.bg})` }"
      >
        {{ item.label }}
      </div>
    </div>

    <div class="header-center" :style="{ backgroundImage: `url(${titleBg})` }">
      <h1>链安食检数智服务平台</h1>
      <div class="center-glow" />
    </div>

    <div class="header-side right">
      <div
        class="nav-btn"
        v-for="item in rightMenus"
        :key="item.label"
        :style="{ backgroundImage: `url(${item.bg})` }"
      >
        {{ item.label }}
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
import botImg from '@/assets/imgs/echarts/bot.png';
import titleBg from '@/assets/imgs/echarts/首页/tiile_bg.png';
import dataConfigBg from '@/assets/imgs/echarts/首页/sjpz_bg.png';
import taskBg from '@/assets/imgs/echarts/首页/jcrw_nor.png';
import inspectBg from '@/assets/imgs/echarts/首页/jiance_nor.png';
import certBg from '@/assets/imgs/echarts/首页/hegezheng_nor.png';
import warnBg from '@/assets/imgs/echarts/首页/xyyj_nor.png';

const leftMenus = [
  { label: '数据配置', bg: dataConfigBg },
  { label: '检测任务', bg: taskBg },
  { label: '快速检测', bg: inspectBg }
];

const rightMenus = [
  { label: '合格证', bg: certBg },
  { label: '小壹预警', bg: warnBg }
];
</script>

<style scoped lang="scss">
.screen-header {
  height: 88px;
  display: grid;
  grid-template-columns: 1fr 640px 1fr;
  align-items: center;
  border-bottom: 1px solid rgba(29, 145, 255, 0.5);
  background:
    linear-gradient(180deg, rgba(16, 48, 98, 0.86) 0%, rgba(7, 20, 56, 0.3) 100%),
    radial-gradient(circle at 50% 30%, rgba(0, 218, 255, 0.2), transparent 50%);
}

.header-side {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;

  &.right {
    justify-content: flex-end;
  }
}

.nav-btn {
  height: 40px;
  min-width: 126px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(57, 141, 231, 0.6);
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  color: #c6e7ff;
  font-size: 22px;
  letter-spacing: 1px;
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
  clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%);
  border: 1px solid rgba(82, 192, 255, 0.45);

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
