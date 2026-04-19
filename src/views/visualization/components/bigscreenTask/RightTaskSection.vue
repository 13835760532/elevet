<template>
  <section class="right-section">
    <BigPanelCard title="任务检测分析" :bg-image="rightBg">
      <div class="table-wrap">
        <table class="analysis-table">
          <colgroup>
            <col style="width: 7%" />
            <col style="width: 38%" />
            <col style="width: 19%" />
            <col style="width: 12%" />
            <col style="width: 12%" />
            <col style="width: 12%" />
          </colgroup>
          <thead>
            <tr>
              <th>序号</th>
              <th>任务名称</th>
              <th>承担单位</th>
              <th>任务下达</th>
              <th>任务完成</th>
              <th>当前完成率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in tableData" :key="item.name + idx">
              <td>{{ idx + 1 }}.</td>
              <td class="left">{{ item.name }}</td>
              <td>{{ item.org }}</td>
              <td>{{ item.total }}</td>
              <td>{{ item.done }}</td>
              <td class="rate">{{ item.rate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import rightBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';

const tableData = [
  { name: '2026年北京蔬菜专项检测任务', org: '海淀区农检站', total: 2051, done: 1026, rate: '51%' },
  { name: '2026年北京蔬菜专项检测任务', org: '朝阳区农检站', total: 3025, done: 625, rate: '25%' },
  { name: '2026年北京蔬菜专项检测任务', org: '昌平区农检站', total: 2021, done: 421, rate: '21%' },
  { name: '2026年北京蔬菜专项检测任务', org: '海淀区农检站', total: 2088, done: 1688, rate: '88%' },
  { name: '2026年北京蔬菜专项检测任务', org: '西城区农检站', total: 2025, done: 525, rate: '25%' },
  { name: '2026年北京蔬菜专项检测任务', org: '东城区农检站', total: 1122, done: 112, rate: '12%' },
  { name: '2026年北京蔬菜专项检测任务', org: '顺义区农检站', total: 6525, done: 3525, rate: '65%' },
  { name: '2025年北京蔬菜专项检测任务', org: '朝阳区农检站', total: 2098, done: 498, rate: '20%' },
  { name: '2025年北京蔬菜专项检测任务', org: '海淀区农检站', total: 1025, done: 105, rate: '12%' },
  { name: '2025年北京蔬菜专项检测任务', org: '东城区农检站', total: 2778, done: 778, rate: '27%' }
];
</script>

<style scoped lang="scss">
.right-section {
  min-width: 0;
  min-height: 0;
}

.table-wrap {
  height: 100%;
  overflow: hidden;
  padding-top: 2px;
}

.analysis-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th,
  td {
    padding: 0 2px;
    border-bottom: 1px solid rgba(35, 92, 168, 0.35);
    font-size: 11px;
    line-height: 1;
    text-align: center;
    color: #d6eefe;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    color: #8fb7dc;
    font-weight: 600;
    font-size: 12px;
    height: 28px;
    background: rgba(13, 45, 96, 0.5);
  }

  tbody td {
    height: 27px;
  }

  td.left {
    text-align: left;
    padding-left: 8px;
  }

  td.rate {
    color: #49e8ff;
    font-weight: 700;
  }

  tbody tr:nth-child(odd) {
    background: rgba(17, 56, 109, 0.36);
  }

  tbody tr:nth-child(even) {
    background: rgba(7, 29, 70, 0.36);
  }
}
</style>
