<template>
  <section class="left-section">
    <BigScreenSelector />
    
    <BigPanelCard title="任务下发概况" :bg-image="leftBg">
      <div class="summary-flex">
        <div class="summary-item" v-for="(item, index) in summaryData" :key="item.label">
          <div class="item-inner">
            <p class="label">{{ item.label }}</p>
            <div class="value-container">
              <span class="value">{{ item.value }}</span>
              <!-- 全息投影效果 -->
              <img class="holographic-img" src="@/assets/imgs/echarts/合格证/bf67.png" />
            </div>
          </div>
          <div v-if="index < summaryData.length - 1" class="separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="任务覆盖群体" :bg-image="leftBg">
      <div class="cover-flex">
        <div class="cover-dial" v-for="(item, index) in coverData" :key="item.label">
          <div class="dial-wrap">
            <div class="dial-outer"></div>
            <img :src="item.icon" class="dial-icon" />
          </div>
          <div class="dial-info">
            <p class="label">{{ item.label }}</p>
            <p class="value">{{ item.value }}</p>
          </div>
          <div v-if="index === 0" class="dial-separator"></div>
        </div>
      </div>
    </BigPanelCard>

    <BigPanelCard title="下发检测产品品类" :bg-image="leftBg">
      <div class="pie-container">
        <Echart :options="categoryPieOption" height="260px" width="100%" />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import BigScreenSelector from '../bigscreen/BigScreenSelector.vue';
import leftBg from '@/assets/imgs/echarts/检测任务/erji_bg.png';
import iconOrg from '@/assets/imgs/echarts/检测任务/68.png';
import iconFactory from '@/assets/imgs/echarts/检测任务/69.png';

const summaryData = [
  { label: '任务下发', value: 6138 },
  { label: '任务完成', value: 2688 },
  { label: '任务完成率', value: '21%' }
];

const coverData = [
  { label: '检测机构', value: 213, icon: iconOrg },
  { label: '生产经营主体', value: 2261, icon: iconFactory }
];

const categoryPieOption = reactive({
  tooltip: { trigger: 'item' },
  legend: {
    orient: 'vertical',
    right: 30,
    top: 'center',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { color: '#8fb6da', fontSize: 13 },
    data: ['蔬菜', '水果', '茶叶', '畜禽', '水产']
  },
  series: [
    {
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['35%', '55%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c|{c}}',
        padding: [0, -20],
        rich: {
          c: {
            color: '#4ce9ff',
            fontSize: 14,
            fontWeight: 'bold',
            padding: [4, 0]
          }
        },
        color: '#bbdbfa',
        fontSize: 13
      },
      labelLine: {
        show: true,
        length: 12,
        length2: 20,
        lineStyle: { color: 'rgba(187, 219, 250, 0.4)' }
      },
      itemStyle: { borderColor: '#05112a', borderWidth: 2 },
      data: [
        { value: 18886, name: '蔬菜' },
        { value: 18886, name: '水果' },
        { value: 18886, name: '茶叶' },
        { value: 18886, name: '畜禽' },
        { value: 18886, name: '水产' }
      ],
      color: ['#3b82f6', '#f59e0b', '#06b6d4', '#cbd5e1', '#22d3ee']
    }
  ]
});
</script>

<style scoped lang="scss">
.left-section {
  display: grid;
  grid-template-rows: auto 200px 200px 1fr;
  gap: 12px;
  height: 100%;
}

.summary-flex {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
}

.summary-item {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;

  .item-inner {
    width: 100%;
    text-align: center;
  }

  .label {
    margin: 0;
    color: #a7caea;
    font-size: 15px;
    margin-bottom: 6px;
  }

  .value-container {
    position: relative;
    padding-bottom: 30px;

    .value {
      color: #7feaff;
      font-size: 44px;
      line-height: 1;
      font-weight: 700;
      font-family: 'DIN Alternate', sans-serif;
      text-shadow: 0 0 15px rgba(127, 234, 255, 0.5);
    }

    .holographic-img {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: auto;
      pointer-events: none;
      animation: float 3s ease-in-out infinite;
    }
  }

  .separator {
    width: 1px;
    height: 44px;
    background: linear-gradient(to bottom, transparent, rgba(66, 142, 228, 0.4), transparent);
    position: absolute;
    right: 0;
    top: 10px;
  }
}

.hologram-pedestal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90px;
  height: 40px;

  .light-beam {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 70px;
    background: radial-gradient(ellipse at bottom, rgba(0, 218, 255, 0.35) 0%, transparent 75%);
    clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%);
  }

  .pedestal-ring {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%) rotateX(65deg);
    width: 70px;
    height: 70px;
    border: 2px solid rgba(0, 218, 255, 0.8);
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(0, 218, 255, 0.7), inset 0 0 10px rgba(0, 218, 255, 0.4);
    background: radial-gradient(circle, rgba(0, 218, 255, 0.15) 0%, transparent 80%);
  }
}

.cover-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
}

.cover-dial {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  padding-top: 20px;

  .dial-wrap {
    position: relative;
    width: 80px;
    height: 80px;

    .dial-outer {
      position: absolute;
      inset: -4px;
      border: 2px dashed rgba(58, 226, 255, 0.4);
      border-radius: 50%;
      animation: dialRotate 10s linear infinite;
    }

    .dial-inner {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(14, 39, 90, 0.6) 0%, rgba(7, 20, 50, 0.9) 100%);
      border: 2px solid rgba(58, 226, 255, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(58, 226, 255, 0.3);

      &::after {
        content: '';
        position: absolute;
        inset: 4px;
        border: 1px solid rgba(58, 226, 255, 0.2);
        border-radius: 50%;
      }
    }

    .dial-icon {
      width: 80px;
      height: 80px;
      z-index: 2;
      filter: drop-shadow(0 0 5px rgba(58, 226, 255, 0.5));
    }
  }

  .dial-info {
    .label {
      margin: 0;
      color: #9ebfe0;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .value {
      margin: 0;
      color: #7ce9ff;
      font-family: 'DIN Alternate', sans-serif;
      font-size: 38px;
      font-weight: 700;
      line-height: 1;
    }
  }

  .dial-separator {
    width: 1px;
    height: 50px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
    position: absolute;
    right: -20px;
  }
}

.pie-container {
  width: 100%;
  height: 100%;
  padding-top: 10px;
}

@keyframes dialRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
