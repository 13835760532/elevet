<template>
  <section class="right-section">
    <BigPanelCard title="合格证分析" :bg-image="rightBg">
      <div class="analysis-wrap">
        <p class="analysis-title">合格证出具类型</p>
        <Echart :options="analysisOption" :height="200" style="margin-top: 10px;" />
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证开具榜单" :tabs="['累计']" active-tab="累计" :bg-image="rightBg">
      <div class="rank-container">
        <table class="rank-table">
          <thead>
            <tr>
              <th width="80">排行</th>
              <th>开具主体</th>
              <th width="100">份数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in issueRank" :key="item.name + idx">
              <td>
                <div class="rank-badge" :class="{ '': idx == 4, [`top-${idx + 1}`]: idx != 4 }">
                  {{ String(idx + 1).padStart(2, '0') }}
                </div>
              </td>
              <td class="name-cell">{{ item.name }}</td>
              <td class="value-cell">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>

    <BigPanelCard title="合格证存证排行榜" :tabs="['累计']" active-tab="累计" :bg-image="rightBg">
      <div class="rank-container">
        <table class="rank-table">
          <thead>
            <tr>
              <th width="80">排行</th>
              <th>存证主体</th>
              <th width="100">份数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in storeRank" :key="item.name + idx">
              <td>
                <div class="rank-badge" :class="`top-${idx + 1}`">
                  {{ String(idx + 1).padStart(2, '0') }}
                </div>
              </td>
              <td class="name-cell">{{ item.name }}</td>
              <td class="value-cell">{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BigPanelCard>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Echart } from '@/components/Echart';
import BigPanelCard from '../bigscreen/BigPanelCard.vue';
import rightBg from '@/assets/imgs/echarts/合格证/Frame 60_bg.png';
import {
  getCertificateIssueTop10,
  getCertificateTypeDistribution,
  getCertificateVerificationTop10,
  type CertificateIssueTopRespVO,
  type CertificateTypeDistributionRespVO,
  type CertificateVerificationTopRespVO
} from '@/api/agri/dashboard/certificate';

interface RankItem {
  name: string
  value: number
}

const PIE_TYPE_META: Record<
  number,
  { name: string; color: string }
> = {
  1: { name: '生产者', color: '#3ba4ff' },
  2: { name: '收购者', color: '#76cf3f' },
  3: { name: '批发市场', color: '#f6b23c' }
};

const issueRank = ref<RankItem[]>([]);
const distributionData = ref<CertificateTypeDistributionRespVO[]>([]);
const storeRank = ref<RankItem[]>([]);

const normalizeDistribution = (list: CertificateTypeDistributionRespVO[] = []) => {
  const map = new Map(list.map((item) => [item.certificateType, item]));
  return [1, 2, 3].map((type) => {
    const current = map.get(type);
    const meta = PIE_TYPE_META[type];
    return {
      value: Number(current?.count || 0),
      name: current?.typeName || meta.name,
      itemStyle: { color: meta.color },
      label: { color: meta.color }
    };
  });
};

const analysisOption = computed(() => ({
  legend: {
    right: 20,
    top: 'center',
    orient: 'vertical',
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { color: '#9ec2e5', fontSize: 13 }
  },
  series: [
    {
      type: 'pie',
      radius: ['52%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{c|{c}}',
        padding: [0, -10],
        rich: {
          c: {
            fontSize: 14,
            fontWeight: 'bold',
            padding: [4, 0]
          }
        },
        fontSize: 13
      },
      labelLine: {
        show: true,
        length: 12,
        length2: 18,
        lineStyle: { color: 'rgba(158, 194, 229, 0.5)' }
      },
      data: normalizeDistribution(distributionData.value)
    }
  ]
}));

const formatRankList = (list: CertificateVerificationTopRespVO[] = []) =>
  list.map((item) => ({
    name: item.subjectName || '--',
    value: Number(item.count || 0)
  }));

const formatIssueRankList = (list: CertificateIssueTopRespVO[] = []) =>
  list.map((item) => ({
    name: item.subjectName || '--',
    value: Number(item.count || 0)
  }));

const loadDashboardData = async () => {
  try {
    const [typeDistribution, issueTop10, verificationTop10] = await Promise.all([
      getCertificateTypeDistribution(),
      getCertificateIssueTop10(),
      getCertificateVerificationTop10()
    ]);
    distributionData.value = Array.isArray(typeDistribution) ? typeDistribution : [];
    issueRank.value = formatIssueRankList(Array.isArray(issueTop10) ? issueTop10 : []);
    storeRank.value = formatRankList(Array.isArray(verificationTop10) ? verificationTop10 : []);
  } catch (error) {
    console.error('加载合格证大屏右侧数据失败', error);
    distributionData.value = [];
    issueRank.value = [];
    storeRank.value = [];
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped lang="scss">
.right-section {
  display: grid;
  grid-template-rows: 300px minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
}

.analysis-wrap {
  .analysis-title {
    margin: 4px 10px 0px 10px;
    color: #a9caea;
    font-size: 16px;
    font-weight: 700;
  }
}

.rank-container {
  height: 100%;
  overflow: hidden;
  padding: 0 4px;
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  th {
    height: 30px;
    color: #8fb7dc;
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    background: rgba(158, 194, 229, 0.1);
  }

  td {
    height: 26px;
    padding: 1px 0;
    color: #d6eefe;
    font-size: 14px;
    text-align: center;
  }

  tbody tr:nth-child(even) {
    background: rgba(17, 56, 109, 0.15);
  }

  .name-cell {
    color: #bbdbfa;
  }

  .value-cell {
    font-family: 'DIN Alternate', sans-serif;
    color: #d6eefe;
  }
}

.rank-badge {
  display: inline-block;
  width: 42px;
  height: 20px;
  line-height: 20px;
  font-family: 'DIN Alternate', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #8fa7c1;
  background: rgba(12, 45, 92, 0.4);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);

  // 通用 L 型护角装饰
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    opacity: 0;
  }

  &.top-1,
  &.top-2,
  &.top-3 {
    border-color: transparent;

    &::before {
      opacity: 1;
      top: -1px;
      left: -1px;
      border-top: 2px solid var(--rank-color);
      border-left: 2px solid var(--rank-color);
    }

    &::after {
      opacity: 1;
      bottom: -1px;
      right: -1px;
      border-bottom: 2px solid var(--rank-color);
      border-right: 2px solid var(--rank-color);
    }
  }

  &.top-1 {
    --rank-color: #22c55e;
    color: #22c55e;
    background: rgba(34, 197, 94, 0.15);
  }

  &.top-2 {
    --rank-color: #3b82f6;
    color: #3b82f6;
    background: rgba(59, 130, 246, 0.15);
  }

  &.top-3 {
    --rank-color: #f59e0b;
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.15);
  }
}
</style>
