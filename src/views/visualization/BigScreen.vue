<template>
  <div class="big-screen-wrapper" ref="screenRef">
    <!-- 头部：科技感标题栏 -->
    <header class="screen-header">
      <div class="header-left">
        <div class="nav-item">数据配置 <el-icon><ArrowDown /></el-icon></div>
        <div class="nav-item">检测任务</div>
        <div class="nav-item">快速检测</div>
      </div>
      <div class="header-center">
        <h1>链安食检数智服务平台</h1>
        <div class="header-line"></div>
      </div>
      <div class="header-right">
        <div class="nav-item">合格证</div>
        <div class="nav-item">小壹预警</div>
        <div class="nav-user">
          <div class="user-text">
            <span>我是小壹</span><br/>
            <span class="tip">有任何问题都可以找我哦~</span>
          </div>
          <img src="@/assets/imgs/logo.png" class="user-avatar" @error="(e) => (e.target as HTMLImageElement).src = 'https://iph.href.lu/44x44?text=AI&fg=ffffff&bg=00b3ed'" />
        </div>
      </div>
    </header>

    <main class="screen-content">
      <!-- 左栏：各类风险分布 -->
      <section class="screen-left">
        <div class="chart-card">
          <div class="card-title">农产品类别风险分布</div>
          <div class="chart-selector">
            <span class="active">检测量</span>
            <span>阳性率</span>
          </div>
          <div class="pie-charts-wrap">
             <div class="pie-charts-row">
                <div ref="pieRef1" class="mini-pie"></div>
                <div ref="pieRef2" class="mini-pie"></div>
                <div ref="pieRef3" class="mini-pie"></div>
              </div>
              <div class="pie-charts-row secondary">
                <div ref="pieRef4" class="mini-pie"></div>
                <div ref="pieRef5" class="mini-pie"></div>
              </div>
          </div>
        </div>

        <div class="chart-card">
          <div class="card-title">农产品风险 TOP 10</div>
          <div class="chart-selector">
            <span class="active">检测量</span>
            <span>阳性率</span>
          </div>
          <div ref="barRef1" class="chart-body"></div>
        </div>

        <div class="chart-card">
          <div class="card-title">农药残留风险 TOP 10</div>
          <div class="chart-selector">
            <span class="active">检测量</span>
            <span>阳性率</span>
          </div>
          <div ref="barRef2" class="chart-body"></div>
        </div>
      </section>

      <!-- 中间栏：指标与地图 -->
      <section class="screen-center">
        <!-- 统计指标 -->
        <div class="center-metrics">
          <div class="metric-item">
            <div class="metric-icon-box blue">
               <el-icon size="30"><OfficeBuilding /></el-icon>
            </div>
            <div class="metric-info">
              <span class="label">监管机构</span>
              <span class="value">213</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon-box cyan">
               <el-icon size="30"><Memo /></el-icon>
            </div>
            <div class="metric-info">
              <span class="label">检测机构</span>
              <span class="value">213</span>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-icon-box gray">
               <el-icon size="30"><UserFilled /></el-icon>
            </div>
            <div class="metric-info">
              <span class="label">生产经营主体</span>
              <span class="value">213</span>
            </div>
          </div>
        </div>

        <!-- 任务指标悬浮在左侧 -->
        <div class="center-stats-overlay">
          <div class="stat-group" v-for="item in sideStats" :key="item.label">
            <p>{{ item.label }}</p>
            <h3>{{ item.value }}</h3>
          </div>
        </div>

        <!-- 中国地图 -->
        <div ref="mapRef" class="map-container"></div>

        <!-- 底部趋势图 -->
        <div class="bottom-chart-card">
          <div class="card-title">检测量动态 | 阳性率态势(检测项)</div>
          <div class="chart-selector bottom-sel">
            <span class="active">检测量</span>
            <span>阳性率</span>
          </div>
          <div ref="lineRef" class="line-chart-body"></div>
        </div>
      </section>

      <!-- 右栏：公告与区域 -->
      <section class="screen-right">
        <div class="chart-card announcement-card">
          <div class="card-title">风险公告</div>
          <div class="announcement-list">
            <div class="ann-item" v-for="n in 4" :key="n">
              <span class="time">2025-10-01 17:56</span>
              <p>xx农产品(生产经营主体:xxx)，发现xxx项目不合格。(检测机构:xx)</p>
            </div>
          </div>
        </div>

        <div class="chart-card area-rank-card">
          <div class="card-title">风险集中区域 TOP 10</div>
          <div class="chart-selector">
            <span class="active">产地</span>
            <span>检测地</span>
          </div>
          <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>集中地区</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(city, index) in rankData" :key="index">
                    <td><span class="rank" :class="'rank-' + (index + 1)">{{ index < 9 ? '0' + (index + 1) : index + 1 }}</span></td>
                    <td>{{ city }}</td>
                  </tr>
                </tbody>
              </table>
          </div>
        </div>

        <div class="chart-card">
          <div class="card-title">产品检测项目风险 TOP 10</div>
          <div class="chart-selector">
            <span class="active">检测量</span>
            <span>阳性率</span>
          </div>
          <div ref="barRef3" class="chart-body"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ArrowDown, OfficeBuilding, Memo, UserFilled } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import chinaMap from '@/assets/map/json/china.json';

const screenRef = ref<HTMLElement | null>(null);

// 图表 refs
const pieRef1 = ref();
const pieRef2 = ref();
const pieRef3 = ref();
const pieRef4 = ref();
const pieRef5 = ref();
const barRef1 = ref();
const barRef2 = ref();
const barRef3 = ref();
const mapRef = ref();
const lineRef = ref();

let charts: echarts.ECharts[] = [];

const sideStats = [
  { label: '任务下发项次', value: '6875' },
  { label: '任务完成项次', value: '6875' },
  { label: '任务完成率', value: '68%' },
  { label: '检测样品量', value: '6875' },
  { label: '检测项次', value: '6875' },
  { label: '合格证开具份', value: '6875' },
  { label: '合格证收证份', value: '6875' }
];

const rankData = ['福州', '南京', '广州', '台湾', '广州', '台湾', '广州', '台湾', '广州', '南京'];

// 自动缩放适配方案
const handleResize = () => {
  const designWidth = 1920;
  const designHeight = 1080;
  const actualWidth = window.innerWidth;
  const actualHeight = window.innerHeight;
  
  const scaleX = actualWidth / designWidth;
  const scaleY = actualHeight / designHeight;
  
  // 保持比例或拉伸（大屏通常拉伸填充）
  if (screenRef.value) {
    screenRef.value.style.transform = `scale(${scaleX}, ${scaleY}) translate(-50%, -50%)`;
  }
};

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  handleResize();
  await nextTick();
  initCharts();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  charts.forEach(c => c.dispose());
});

const initCharts = () => {
  // 注册地图
  echarts.registerMap('china', chinaMap as any);

  const init = (el: any) => {
    const c = echarts.init(el);
    charts.push(c);
    return c;
  };

  const c1 = init(pieRef1.value);
  const c2 = init(pieRef2.value);
  const c3 = init(pieRef3.value);
  const c4 = init(pieRef4.value);
  const c5 = init(pieRef5.value);
  const b1 = init(barRef1.value);
  const b2 = init(barRef2.value);
  const b3 = init(barRef3.value);
  const m = init(mapRef.value);
  const l = init(lineRef.value);

  // 1. 饼图通用配置
  const getPieOption = (name: string, color: string) => ({
    title: { 
        text: name, 
        left: 'center', 
        bottom: 0, 
        textStyle: { color: '#acc1e0', fontSize: 12, fontWeight: 'normal' } 
    },
    series: [{
      type: 'pie',
      radius: ['55%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      label: { show: true, position: 'center', formatter: '49%', color: '#fff', fontSize: 16, fontWeight: 'bold' },
      data: [
        { value: 49, itemStyle: { color: color } },
        { value: 51, itemStyle: { color: '#162b59' } }
      ]
    }]
  });

  c1.setOption(getPieOption('蔬菜', '#00b3ed'));
  c2.setOption(getPieOption('水果', '#00eaff'));
  c3.setOption(getPieOption('禽畜', '#00b3ed'));
  c4.setOption(getPieOption('水产', '#00b3ed'));
  c5.setOption(getPieOption('茶叶', '#00b3ed'));

  // 2. 柱状图：农产品风险
  b1.setOption({
    grid: { left: '15%', right: '10%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: { 
        show: true, 
        axisLabel: { color: '#6fa0b1', fontSize: 10 }, 
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#163d7a' } } 
    },
    yAxis: { 
      type: 'category', 
      inverse: true,
      data: ['芹菜', '菠菜', '韭菜', '萝卜', '青椒', '丝瓜', '南瓜', '黄瓜', '白菜', '生姜'],
      axisLabel: { color: '#fff', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: 10,
      data: [0.9, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.4, 0.3, 0.2],
      itemStyle: { 
        borderRadius: [0, 5, 5, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#00eaff' }, 
            { offset: 1, color: '#004fe4' }
        ]) 
      },
      label: { show: true, position: 'right', color: '#00eaff', fontSize: 10 }
    }]
  });

  // 3. 柱状图：农药残留
  b2.setOption({
    grid: { left: '5%', right: '5%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: { 
        type: 'category', 
        data: ['甲凯基', '磺胺', '阿维', '氟虫', '氟', '毒死', '丙', '毒', '甲'], 
        axisLabel: { color: '#6fa0b1', fontSize: 10, rotate: 30 },
        axisLine: { lineStyle: { color: '#163d7a' } }
    },
    yAxis: { 
        show: true, 
        axisLabel: { color: '#6fa0b1', fontSize: 10 }, 
        splitLine: { lineStyle: { color: '#162b59', type: 'dashed' } },
        axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: 15,
      data: [400, 350, 300, 270, 230, 200, 180, 150, 100],
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00eaff' }, 
            { offset: 1, color: 'rgba(0, 234, 255, 0.1)' }
        ]) 
      }
    }]
  });

  // 4. 地图
  m.setOption({
    tooltip: { 
        show: true, 
        trigger: 'item', 
        backgroundColor: 'rgba(0, 20, 50, 0.9)', 
        borderColor: '#00eaff', 
        borderWidth: 1,
        padding: 15,
        textStyle: { color: '#fff', fontSize: 14 },
        formatter: (params: any) => {
            return `<div style="text-align: left">
                      <b style="color: #00eaff;font-size:16px">${params.name}</b><br/>
                      样品量: <span style="color:#ffeb3b">565566</span><br/>
                      检测项次: <span style="color:#ffeb3b">345456</span><br/>
                      检测项阳性率: <span style="color:#ffeb3b">56%</span>
                    </div>`
        }
    },
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.2,
      label: { show: false },
      itemStyle: {
        areaColor: '#0c2451',
        borderColor: '#1e86ff',
        borderWidth: 1.5,
        shadowColor: 'rgba(0, 79, 228, 0.6)',
        shadowBlur: 30,
        shadowOffsetX: 0,
        shadowOffsetY: 10
      },
      emphasis: { 
        itemStyle: { areaColor: '#005edc', borderWidth: 2, borderColor: '#00eaff' },
        label: { show: true, color: '#fff' }
      }
    },
    series: [
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          data: [{ name: '样品收集点', value: [116.4, 39.9, 100] }],
          symbol: 'pin',
          symbolSize: 30,
          itemStyle: { color: '#ffeb3b', shadowBlur: 10, shadowColor: '#ffeb3b' }
        },
        {
          type: 'map',
          geoIndex: 0,
          data: chinaMap.features.map(f => ({ name: f.properties.name, value: Math.random() * 100 }))
        }
    ]
  });

  // 5. 底部趋势面积图
  l.setOption({
    grid: { left: '3%', right: '3%', bottom: '5%', top: '15%', containLabel: true },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.7)', borderColor: '#00eaff', textStyle: { color: '#fff' } },
    xAxis: { 
        type: 'category', 
        boundaryGap: false,
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], 
        axisLabel: { color: '#6fa0b1' },
        axisLine: { lineStyle: { color: '#163d7a' } }
    },
    yAxis: { 
        type: 'value',
        axisLabel: { color: '#6fa0b1', formatter: '{value}%' }, 
        splitLine: { lineStyle: { color: '#162b59', type: 'dashed' } },
        axisLine: { show: false }
    },
    series: [
        {
          name: '检测量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#00eaff' },
          areaStyle: { 
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0, 234, 255, 0.4)' }, 
                { offset: 1, color: 'transparent' }
            ]) 
          },
          data: [4, 7, 5, 8, 6, 9, 7, 8, 6, 5, 7, 6],
          itemStyle: { color: '#00eaff', borderColor: '#fff', borderWidth: 2 }
        }
    ]
  });

  // 6. 右侧项目风险柱状图
  b3.setOption({
    grid: { left: '20%', right: '10%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: { show: true, axisLabel: { color: '#6fa0b1' }, splitLine: { show: false }, axisLine: { lineStyle: { color: '#163d7a' } } },
    yAxis: { 
        type: 'category', 
        inverse: true,
        data: ['丝瓜-甲氨基', '地瓜-阿维', '四季豆-甲', '南瓜-氟虫', '西瓜-氟', '白菜-丙'], 
        axisLabel: { color: '#acc1e0', fontSize: 11 },
        axisLine: { show: false }
    },
    series: [{
      type: 'bar',
      barWidth: 12,
      data: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4],
      itemStyle: { 
        borderRadius: [0, 6, 6, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#00eaff' }, 
            { offset: 1, color: '#00b3ed' }
        ]) 
      }
    }]
  });
};
</script>

<style scoped lang="scss">
.big-screen-wrapper {
  width: 1920px;
  height: 1080px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: #01081a;
  color: #fff;
  overflow: hidden;
  transform-origin: center center;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.screen-header {
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 50px;
  background: linear-gradient(180deg, rgba(6, 24, 54, 0.9) 0%, transparent 100%);
  border-bottom: 2px solid rgba(0, 179, 237, 0.2);
  position: relative;
  z-index: 10;

  .header-left, .header-right {
    display: flex;
    gap: 40px;
    align-items: center;
  }

  .header-center {
    flex: 1;
    text-align: center;
    h1 {
      font-size: 42px;
      margin: 0;
      letter-spacing: 6px;
      background: linear-gradient(180deg, #fff 30%, #00eaff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
      text-shadow: 0 0 20px rgba(0, 234, 255, 0.5);
    }
  }

  .nav-item {
    font-size: 19px;
    color: #acc1e0;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;
    &:hover { color: #00eaff; text-shadow: 0 0 10px #00eaff; }
  }

  .nav-user {
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(0, 179, 237, 0.1);
    padding: 5px 15px;
    border-radius: 30px;
    border: 1px solid rgba(0, 179, 237, 0.3);
    .user-text {
        line-height: 1.2;
        span { font-size: 14px; color: #fff; }
        .tip { font-size: 10px; color: #6fa0b1; }
    }
    .user-avatar { width: 44px; height: 44px; border-radius: 50%; border: 2px solid #00eaff; box-shadow: 0 0 10px #00eaff; }
  }
}

/* 主内容布局 */
.screen-content {
  flex: 1;
  display: grid;
  grid-template-columns: 460px 1fr 460px;
  grid-template-rows: 1fr;
  padding: 20px 30px 30px;
  gap: 25px;
}

/* 通用卡片样式 */
.chart-card {
  background: rgba(6, 26, 63, 0.5);
  border: 1px solid #163d7a;
  padding: 18px;
  position: relative;
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;

  &::before, &::after {
    content: ''; position: absolute; width: 15px; height: 15px; 
  }
  &::before { top: -1px; left: -1px; border-top: 3px solid #00eaff; border-left: 3px solid #00eaff; }
  &::after { bottom: -1px; right: -1px; border-bottom: 3px solid #00eaff; border-right: 3px solid #00eaff; }

  .card-title {
    font-size: 20px;
    color: #fff;
    border-left: 5px solid #00eaff;
    padding-left: 12px;
    margin-bottom: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .chart-selector {
    position: absolute; top: 20px; right: 20px; display: flex; gap: 8px;
    span {
      font-size: 12px; padding: 3px 10px; border: 1px solid #163d7a; color: #6fa0b1; cursor: pointer;
      border-radius: 4px; transition: all 0.3s;
      &.active { background: rgba(0, 234, 255, 0.2); color: #00eaff; border-color: #00eaff; box-shadow: 0 0 10px rgba(0, 234, 255, 0.2); }
      &:hover:not(.active) { border-color: #acc1e0; color: #fff; }
    }
  }

  .chart-body { flex: 1; min-height: 200px; }
}

.screen-left, .screen-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* 饼图区域 */
.pie-charts-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.pie-charts-row {
  display: flex; justify-content: space-around; height: 110px;
  .mini-pie { width: 120px; height: 110px; }
  &.secondary { margin-top: 15px; justify-content: center; gap: 40px; }
}

/* 中间栏样式 */
.screen-center {
  display: flex; flex-direction: column; position: relative;
  .center-metrics {
    display: flex; justify-content: space-around; padding: 10px 0 30px;
    .metric-item {
      display: flex; align-items: center; gap: 20px;
      .metric-icon-box { 
          width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          position: relative;
          &::after { content: ''; position: absolute; inset: -5px; border: 2px dashed currentColor; border-radius: 50%; opacity: 0.5; animation: rotate 10s linear infinite; }
      }
      .metric-icon-box.blue { background: rgba(0, 79, 228, 0.2); color: #004fe4; box-shadow: 0 0 30px rgba(0, 79, 228, 0.3); }
      .metric-icon-box.cyan { background: rgba(0, 234, 255, 0.2); color: #00eaff; box-shadow: 0 0 30px rgba(0, 234, 255, 0.3); }
      .metric-icon-box.gray { background: rgba(172, 193, 224, 0.1); color: #acc1e0; }

      .metric-info { 
          .label { display: block; color: #6fa0b1; font-size: 16px; margin-bottom: 5px; } 
          .value { font-size: 38px; font-weight: 800; color: #00eaff; text-shadow: 0 0 15px rgba(0, 234, 255, 0.4); font-family: 'DIN Alternate', sans-serif; } 
      }
    }
  }

  .center-stats-overlay {
    position: absolute; top: 140px; left: 0; z-index: 5;
    background: rgba(6, 26, 63, 0.3); padding: 20px; border-radius: 0 20px 20px 0; border: 1px solid rgba(22, 61, 122, 0.5); border-left: none;
    .stat-group {
      margin-bottom: 20px;
      &:last-child { margin-bottom: 0; }
      p { color: #6fa0b1; font-size: 15px; margin: 0; }
      h3 { font-size: 28px; color: #00eaff; margin: 4px 0 0 0; font-family: 'DIN Alternate'; }
    }
  }

  .map-container { flex: 1; min-height: 500px; filter: drop-shadow(0 0 50px rgba(0, 79, 228, 0.2)); }
  
  .bottom-chart-card { 
      height: 280px; background: rgba(6, 26, 63, 0.5); border: 1px solid #163d7a; padding: 20px; position: relative;
      &::before { content: ''; position: absolute; top: -1px; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent, #00eaff, transparent); }
      .line-chart-body { height: 220px; }
      .bottom-sel { top: 20px; }
  }
}

/* 公告列表 */
.announcement-card { flex: 0.8; }
.announcement-list {
  flex: 1; overflow-y: auto; padding-right: 5px;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #163d7a; border-radius: 2px; }
  .ann-item {
    margin-bottom: 18px; padding: 12px; background: rgba(22, 61, 122, 0.2); border-radius: 6px;
    .time { color: #00eaff; font-size: 13px; font-weight: 500; }
    p { margin: 8px 0 0; color: #acc1e0; line-height: 1.6; font-size: 14px; }
  }
}

/* 表格排名 */
.area-rank-card { flex: 1.2; }
.table-container { flex: 1; overflow: hidden; }
.data-table {
  width: 100%; border-collapse: collapse;
  th { text-align: left; color: #6fa0b1; font-size: 15px; padding: 12px 0; border-bottom: 1px solid rgba(22, 61, 122, 0.5); }
  td { padding: 10px 0; color: #fff; font-size: 15px; border-bottom: 1px solid rgba(22, 61, 122, 0.2); }
  .rank { 
      display: inline-block; width: 34px; height: 24px; line-height: 24px; text-align: center; 
      font-style: italic; font-weight: 800; font-family: 'DIN Alternate'; font-size: 18px;
  }
  .rank-1 { color: #ffeb3b; text-shadow: 0 0 8px rgba(255, 235, 59, 0.5); } 
  .rank-2 { color: #00eaff; } 
  .rank-3 { color: #00b3ed; }
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
