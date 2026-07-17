<template>
  <section class="right-section">
    <BigPanelCard title="任务检测分析" :bg-image="rightBg">
      <div class="table-wrap">
        <table v-if="!tableEmpty" class="analysis-table">
          <colgroup>
            <col class="col-index" />
            <col class="col-name" />
            <col class="col-org" />
            <col class="col-count" />
            <col class="col-count" />
            <col class="col-rate" />
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
        <BigDataEmpty
          v-else
          title="暂无任务分析"
          description="当前筛选范围未返回任务检测分析"
          compact
        />
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import BigDataEmpty from '../bigscreen/BigDataEmpty.vue';
import rightBg from '@/assets/imgs/echarts/检测任务/rwjcfx_bg.png';
import { getTaskAnalysisPage, type TaskAnalysisRespVO } from '@/api/agri/dashboard/task';
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from '../bigscreen/config';

const analysisList = ref<TaskAnalysisRespVO[]>([]);

const formatRate = (value?: number) => `${Number(value || 0).toFixed(2)}%`;

const tableData = computed(() =>
  analysisList.value.map((item) => ({
    taskId: item.taskId,
    name: item.taskName || '--',
    org: item.undertakeDeptName || '--',
    total: Number(item.sampleCount || 0),
    done: Number(item.sampleCompletedCount || 0),
    rate: formatRate(item.completionRate)
  }))
);
const tableEmpty = computed(() => tableData.value.length === 0);

/** 加载任务执行分析首屏数据，固定最多展示 15 条任务。 */
const loadAnalysisPage = async () => {
  try {
    const data = await getTaskAnalysisPage({
      ...getBigScreenQueryParams(),
      pageNo: 1,
      pageSize: 15
    });
    analysisList.value = Array.isArray(data?.list) ? data.list : [];
  } catch (error) {
    console.error('加载任务检测分析失败', error);
    analysisList.value = [];
  }
};

onMounted(() => {
  loadAnalysisPage();
});

const disposeRefresh = subscribeBigScreenRefresh(() => {
  loadAnalysisPage();
});

onUnmounted(() => {
  disposeRefresh();
});
</script>

<style scoped lang="scss">
.right-section {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.big-panel-card) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .card-content {
      flex: 1;
      min-height: 0;
    }
  }
}

.table-wrap {
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-top: 2px;
  padding-bottom: 6px;
  scrollbar-color: rgba(73, 232, 255, 0.65) rgba(13, 45, 96, 0.35);
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(13, 45, 96, 0.35);
    border-radius: 999px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(73, 232, 255, 0.65);
    border-radius: 999px;
  }
}

.analysis-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
  table-layout: fixed;

  .col-index {
    width: 58px;
  }

  .col-name {
    width: 280px;
  }

  .col-org {
    width: 168px;
  }

  .col-count {
    width: 94px;
  }

  .col-rate {
    width: 126px;
  }

  th,
  td {
    padding: 0 2px;
    border-bottom: 1px solid rgba(35, 92, 168, 0.35);
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    color: #d6eefe;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  th {
    color: #8fb7dc;
    font-weight: 600;
    font-size: 14px;
    height: 54px;
    background: rgba(13, 45, 96, 0.5);
  }

  tbody td {
    height: 42px;
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
