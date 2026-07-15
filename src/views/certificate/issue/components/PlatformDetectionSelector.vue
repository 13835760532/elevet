<template>
  <div class="selector-container">
    <div v-if="!readonly" class="header-toolbar">
      <div class="search-group">
        <el-input v-model="keyword" placeholder="查询样品编号或名称..." clearable class="input-minimal"
          @keyup.enter="handleSearch" />
        <el-button type="primary" class="theme-primary-btn" :loading="searchLoading" @click="handleSearch">
          查询
        </el-button>
      </div>
      <el-button type="primary" class="theme-primary-btn outline" @click="handleLink">
        关联至任务
      </el-button>
    </div>

    <div v-if="!readonly" class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-checkbox">
              <el-checkbox :model-value="isPageAllChecked" :indeterminate="isPageIndeterminate"
                @change="togglePageSelection" />
            </th>
            <th>样品编号</th>
            <th>样品名称</th>
            <th>检测项目</th>
            <th>被检单位/主体</th>
            <th>检测日期</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pagedRows.length === 0">
            <td class="empty-state" colspan="6">请在上方搜索并选择样品检测结果</td>
          </tr>
          <tr v-for="row in pagedRows" :key="row.linkId">
            <td class="w-checkbox">
              <el-checkbox :model-value="isChecked(row.linkId)" @change="(checked) => toggleOne(row, checked)" />
            </td>
            <td><span class="text-strong">{{ row.sampleCode || '-' }}</span></td>
            <td>{{ row.sampleName || '-' }}</td>
            <td>{{ getDetectionItemNames(row) }}</td>
            <td>{{ row.detectionOrgName || row.detector || '-' }}</td>
            <td class="text-muted">{{ formatDetectionDate(row) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager-wrap" v-if="!readonly && filteredRows.length > pageSize">
      <el-pagination small layout="total, sizes, prev, pager, next, jumper" :total="filteredRows.length"
        :page-size="pageSize" v-model:current-page="pageNo" />
    </div>

    <div class="linked-section" v-if="linkedRows.length">
      <div class="section-divider">
        <span>已关联项 ({{ linkedRows.length }})</span>
      </div>

      <el-tabs v-model="activeTab" class="refined-tabs" @tab-change="handleTabChange" @tab-remove="handleTabRemove"
        :closable="!readonly">
        <el-tab-pane v-for="(row, idx) in linkedRows" :key="row.linkId" :name="String(row.linkId)"
          :label="`样品 ${idx + 1}`" />
      </el-tabs>

      <div v-if="activeRow" class="active-detail-pane">
        <!-- 模块 1: 样品检测信息 -->
        <div class="info-module">
          <h4 class="module-title">样品检测信息</h4>
          <div class="property-table">
            <div class="property-row">
              <div class="property-label">样品编号：</div>
              <div class="property-value">{{ activeRow.sampleCode || '--' }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">样品名称：</div>
              <div class="property-value">{{ activeRow.sampleName || '--' }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">样品产地：</div>
              <div class="property-value">{{ activeRow.sampleArea || activeRow.sampleOrigin || activeRow.origin || '--'
                }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">样品来源：</div>
              <div class="property-value">{{ activeRow.sampleSource || activeRow.samplingLocation || '--' }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">抽检区域：</div>
              <div class="property-value">{{ activeRow.detectionArea || '--' }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">主体名称：</div>
              <div class="property-value">{{ activeRow.subjectName || '--' }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">检测机构：</div>
              <div class="property-value">{{ activeRow.detectionOrg || activeRow.detectionOrgName || '--' }}</div>
            </div>
            <div class="property-row">
              <div class="property-label">检测日期：</div>
              <div class="property-value">{{ formatDetectionDate(activeRow) }}</div>
            </div>
          </div>
        </div>

        <!-- 模块 2: 检测结果详情 -->
        <div class="info-module mt-24">
          <h4 class="module-title">检测结果详情{{ activeRow.recheckNo ? '（复检）' : '' }}</h4>
          <div class="result-list-table">
            <div class="result-thead">
              <span class="col-idx">通道</span>
              <span class="col-name">检测项目</span>
              <span class="col-value">检测值 (T/C值)</span>
              <span class="col-status">结果</span>
            </div>
            <div v-for="(item, index) in detectionItems" :key="index" class="result-trow">
              <span class="col-idx">{{ item.channel }}</span>
              <span class="col-name">{{ item.detectionItem }}</span>
              <span class="col-value">
                {{
                  item.detectionValue !== null && item.detectionValue !== undefined && item.detectionValue !== ''
                    ? (isNaN(Number(item.detectionValue)) ? item.detectionValue : Number(item.detectionValue).toFixed(2))
                    : '--'
                }}
              </span>
              <span class="col-status">
                <i :class="['status-dot', item.result === 1 ? 'is-safe' : 'is-danger']"></i>
                <span :class="['status-text', item.result === 1 ? 'is-safe' : 'is-danger']">
                  {{ item.textResult }}
                </span>
              </span>
            </div>
            <div v-if="!detectionItems.length" class="result-empty">未获取到检测指标明细</div>
          </div>
        </div>

        <div class="info-module mt-24">
          <h4 class="module-title">检测图片</h4>
          <div class="report-evidence-box">
            <template v-if="activeRow.reportFileUrl || activeRow.testPaperImageUrl">
              <div v-if="isPdf(activeRow.reportFileUrl || activeRow.testPaperImageUrl)" class="pdf-preview-box"
                @click="handlePreviewPdf(activeRow.reportFileUrl || activeRow.testPaperImageUrl)">
                <el-icon class="pdf-icon">
                  <Document />
                </el-icon>
                <div class="pdf-name">检测报告.pdf</div>
                <div class="pdf-tip">点击查看 PDF 报告</div>
              </div>
              <el-image v-else :src="activeRow.reportFileUrl || activeRow.testPaperImageUrl" fit="contain"
                class="evidence-img" :preview-src-list="[activeRow.reportFileUrl || activeRow.testPaperImageUrl]"
                :preview-teleported="true" />
            </template>
            <el-empty v-else description="无存证报告" :image-size="48" />
          </div>
        </div>
      </div>
    </div>

    <div class="empty-view" v-else>
      <el-empty :description="readonly ? '暂无关联检测记录' : '待关联平台记录'" :image-size="64" />
    </div>

    <!-- PDF 预览弹窗 -->
    <el-dialog v-model="pdfVisible" title="PDF 报告预览" width="80%" destroy-on-close class="pdf-view-dialog">
      <iframe :src="pdfUrl" width="100%" height="700px" frameborder="0"></iframe>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useMessage } from '@/hooks/web/useMessage';
import { Document } from '@element-plus/icons-vue';

const isPdf = (url) => {
  if (!url) return false;
  return url.toLowerCase().endsWith('.pdf');
};

const handlePreviewPdf = (url) => {
  if (!url) return;
  window.open(url, '_blank');
};

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  linkedRecords: { type: Array, default: () => [] },
  searchMethod: { type: Function, required: true },
  readonly: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'update:linkedRecords', 'update:activeRecord']);

const message = useMessage();
const keyword = ref('');
const searchLoading = ref(false);
const rawRows = ref([]);
const pickedIdList = ref([]);
const linkedRows = ref([]);
const activeTab = ref('');
const pageNo = ref(1);
const pageSize = 6;

watch(
  () => props.linkedRecords,
  (rows) => {
    linkedRows.value = Array.isArray(rows) ? [...rows] : [];
    if (!activeTab.value && linkedRows.value.length) {
      activeTab.value = String(linkedRows.value[0].linkId);
    }
    if (activeTab.value && !linkedRows.value.find((item) => String(item.linkId) === String(activeTab.value))) {
      activeTab.value = linkedRows.value.length ? String(linkedRows.value[0].linkId) : '';
    }
    const linkedIds = linkedRows.value.map((item) => Number(item.linkId));
    pickedIdList.value = Array.from(new Set([...pickedIdList.value, ...linkedIds]));
  },
  { immediate: true, deep: true }
);

const filteredRows = computed(() => rawRows.value);
const pagedRows = computed(() => {
  const start = (pageNo.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

const isChecked = (id) => pickedIdList.value.includes(Number(id));
const isPageAllChecked = computed(() => pagedRows.value.length > 0 && pagedRows.value.every((row) => isChecked(row.linkId)));
const isPageIndeterminate = computed(() => {
  const checkedCount = pagedRows.value.filter((row) => isChecked(row.linkId)).length;
  return checkedCount > 0 && checkedCount < pagedRows.value.length;
});

const activeRow = computed(() => linkedRows.value.find((row) => String(row.linkId) === String(activeTab.value)) || null);

const parseQualityResult = (result) => {
  if (result === 1 || String(result).includes('阴') || String(result).includes('合格') || String(result).includes('未检') || String(result).includes('未检出')) {
    return 1;
  }
  if (result === 0 || String(result).includes('阳') || String(result).includes('不合格') || String(result).includes('检出') && !String(result).includes('未检')) {
    return 0;
  }
  // 兜底处理：若是数字字符串则转换，否则默认不处理
  const num = Number(result);
  return isNaN(num) ? result : num;
};

// 判定结果文字
const getQualityText = (val) => {
  if (val === 1) return '阴性';
  if (val === 0) return '阳性';
  return val || '-';
};

const detectionItems = computed(() => {
  const active = activeRow.value;
  if (!active) return [];

  let rawItems = [];

  // 1. 尝试从 aiRecognitionResult 中解析 (最详尽)
  if (active.aiRecognitionResult) {
    try {
      const parsed = typeof active.aiRecognitionResult === 'string'
        ? JSON.parse(active.aiRecognitionResult)
        : active.aiRecognitionResult;
      if (parsed && Array.isArray(parsed.results)) {
        rawItems = parsed.results;
      }
    } catch (e) {
      console.warn('解析 aiRecognitionResult 失败', e);
    }
  }

  // 2. 如果没有详细结果，尝试从 detectionResults 中获取 (次之)
  if (!rawItems.length && active.detectionResults) {
    try {
      const parsed = typeof active.detectionResults === 'string'
        ? JSON.parse(active.detectionResults)
        : active.detectionResults;
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      }
    } catch (e) { }
  }

  // 3. 兜底，如果没有明细则显示综合结果
  if (!rawItems.length) {
    if (active.overallResult === 0 || active.overallResult === 1) {
      const res = active.overallResult === 0 ? 1 : 0;
      return [{
        channel: '1',
        detectionItem: '综合结果',
        detectionValue: '-',
        concentration: '-',
        result: res,
        textResult: getQualityText(res)
      }];
    }
    return [];
  }

  // 统一映射字段
  return rawItems.map((item) => {
    const res = parseQualityResult(item.status || item.result);
    // 如果 status 包含原始文本，则优先展示原始文字 (如 "未检出")
    let tr = getQualityText(res);
    if (item.status && (item.status.includes('检') || item.status.includes('格'))) {
      tr = item.status;
    }

    return {
      channel: item.channel || item.cardChannel || '-',
      detectionItem: item.detectionItem || item.codeName || item.name || item.itemName || '-',
      detectionValue: item.result || '-',
      concentration: item.concentration || '-',
      result: res,
      textResult: tr
    };
  });
});

watch(activeRow, (row) => {
  emit('update:activeRecord', row || null);
}, { immediate: true });

const getDetectionItemNames = (row) => {
  if (!row) return '-';
  let rawItems = [];
  if (row.aiRecognitionResult) {
    try {
      const parsed = typeof row.aiRecognitionResult === 'string'
        ? JSON.parse(row.aiRecognitionResult)
        : row.aiRecognitionResult;
      if (parsed && Array.isArray(parsed.results)) {
        rawItems = parsed.results;
      }
    } catch (e) { }
  }
  if (!rawItems.length && row.detectionResults) {
    try {
      const parsed = typeof row.detectionResults === 'string'
        ? JSON.parse(row.detectionResults)
        : row.detectionResults;
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      }
    } catch (e) { }
  }
  if (rawItems.length) {
    return rawItems.map(item => item.detectionItem || item.codeName || item.name || item.itemName || '-').join(', ');
  }
  if (row.overallResult === 0 || row.overallResult === 1) {
    return '综合结果';
  }
  return '-';
};

const formatDateTime = (value) => {
  if (!value && value !== 0) return '-';
  if (Number(value) === 0) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatDetectionDate = (row) => {
  if (!row) return '--';
  const raw = row.aiRecognitionResult;
  if (!raw) return formatDateTime(row.detectionDate) || '--';
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && (parsed.timestamp || parsed.timestamp === 0)) {
      const formatted = formatDateTime(parsed.timestamp);
      if (formatted !== '-') return formatted;
    }
    return formatDateTime(row.detectionDate) || '--';
  } catch (e) {
    return formatDateTime(row.detectionDate) || '--';
  }
};

const handleSearch = async () => {
  const q = keyword.value.trim();
  if (!q) {
    message.warning('请输入样品编号或样品名称');
    return;
  }
  searchLoading.value = true;
  try {
    const list = await props.searchMethod(q);
    const incoming = Array.isArray(list) ? list : [];

    // 使用 Map 进行去重叠加 (基于 linkId)
    const existingMap = new Map(rawRows.value.map(item => [String(item.linkId), item]));
    incoming.forEach(item => {
      existingMap.set(String(item.linkId), item);
    });

    rawRows.value = Array.from(existingMap.values());
    pageNo.value = 1;
  } finally {
    searchLoading.value = false;
  }
};

const toggleOne = (row, checked) => {
  const id = Number(row.linkId);
  if (checked && !pickedIdList.value.includes(id)) {
    pickedIdList.value.push(id);
    return;
  }
  if (!checked) {
    pickedIdList.value = pickedIdList.value.filter((item) => Number(item) !== id);
  }
};

const togglePageSelection = (checked) => {
  const pageIds = pagedRows.value.map((row) => Number(row.linkId));
  if (checked) {
    pickedIdList.value = Array.from(new Set([...pickedIdList.value, ...pageIds]));
    return;
  }
  pickedIdList.value = pickedIdList.value.filter((id) => !pageIds.includes(Number(id)));
};

const handleLink = () => {
  if (!pickedIdList.value.length) {
    message.warning('请先选择需要关联的样品');
    return;
  }
  const sourceRows = [...linkedRows.value, ...rawRows.value];
  const sourceMap = new Map(sourceRows.map((item) => [String(item.linkId), item]));
  const map = new Map(linkedRows.value.map((item) => [String(item.linkId), item]));
  pickedIdList.value.forEach((id) => {
    const row = sourceMap.get(String(id));
    if (row) {
      map.set(String(row.linkId), row);
    }
  });
  linkedRows.value = Array.from(map.values());
  const ids = linkedRows.value.map((item) => Number(item.linkId)).filter(Boolean);
  emit('update:modelValue', ids);
  emit('update:linkedRecords', linkedRows.value);
  if (!activeTab.value && linkedRows.value.length) {
    activeTab.value = String(linkedRows.value[0].linkId);
  }
  if (activeTab.value && !linkedRows.value.find((item) => String(item.linkId) === String(activeTab.value))) {
    activeTab.value = String(linkedRows.value[0].linkId);
  }
};

const handleTabChange = (name) => {
  activeTab.value = String(name);
};

const handleTabRemove = (targetName) => {
  const idToRemove = Number(targetName);

  // 1. 从关联行中移除
  linkedRows.value = linkedRows.value.filter(row => Number(row.linkId) !== idToRemove);

  // 2. 从勾选列表中移除（同步搜索界面的勾选框）
  pickedIdList.value = pickedIdList.value.filter(id => id !== idToRemove);

  // 3. 触发更新给父组件
  const ids = linkedRows.value.map((item) => Number(item.linkId)).filter(Boolean);
  emit('update:modelValue', ids);
  emit('update:linkedRecords', linkedRows.value);

  // 4. 处理 activeTab 切换
  if (activeTab.value === targetName) {
    activeTab.value = linkedRows.value.length ? String(linkedRows.value[0].linkId) : '';
  }
};
</script>

<style lang="scss" scoped>
.selector-container {
  padding: 4px 0;
}

.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .search-group {
    display: flex;
    gap: 8px;
    flex: 1;
    max-width: 480px;

    .input-minimal :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px #E2E8F0 inset;
      border-radius: 4px;
      padding-left: 12px;

      &.is-focus {
        box-shadow: 0 0 0 1px #00B3ED inset;
      }
    }
  }
}

.data-table-container {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: #F8FAFC;
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }

  td {
    padding: 10px 16px;
    font-size: 14px;
    color: #334155;
    border-bottom: 1px solid #F1F5F9;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #F8FAFC;
  }

  .w-checkbox {
    width: 48px;
    text-align: center;
    padding: 0;
    padding-left: 10px;

    :deep(.el-checkbox__inner) {
      border-radius: 4px !important;
    }
  }

  .text-strong {
    font-weight: 600;
    color: #0F172A;
  }

  .text-muted {
    color: #94A3B8;
    font-size: 13px;
  }

  .empty-state {
    padding: 40px;
    text-align: center;
    color: #94A3B8;
    font-size: 14px;
  }
}

.pager-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.linked-section {
  margin-top: 24px;
}

.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  span {
    font-size: 14px;
    font-weight: 700;
    color: #0F172A;
    white-space: nowrap;
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #E2E8F0;
  }
}

.refined-tabs {
  margin-bottom: 0;

  :deep(.el-tabs__header) {
    margin: 0;
    border-bottom: none;
  }

  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__nav) {
    border: none !important;
    background: transparent;
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
    color: #64748B;
    font-weight: 500;
    height: 42px;
    line-height: 42px;
    padding: 0 24px !important;
    transition: all 0.3s;
    border-radius: 8px 8px 0 0;
    margin-right: 4px;

    &.is-active {
      color: #00B3ED;
      background: #f4f8fb;
      font-weight: 700;
      border: 1px solid #d0dfed;
      border-bottom: 2px solid #f4f8fb;
    }

    &:hover:not(.is-active) {
      color: #00B3ED;
    }
  }
}

.active-detail-pane {
  background: #f4f8fb;
  border: 1px solid #d0dfed;
  border-radius: 0 12px 12px 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 179, 237, 0.03);
}

.info-module {
  .module-title {
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      width: 4px;
      height: 18px;
      background: #00B3ED;
      margin-right: 10px;
      border-radius: 2px;
    }
  }
}

.property-table {
  background: #fff;
  border: 1px solid #d0dfed;
  border-radius: 6px;
  overflow: hidden;

  .property-row {
    display: flex;
    border-bottom: 1px solid #e2e8f0;

    &:last-child {
      border-bottom: none;
    }

    .property-label {
      width: 150px;
      padding: 12px 20px;
      background: #eef3f8;
      color: #475569;
      font-size: 14px;
      border-right: 1px solid #e2e8f0;
      text-align: right;
      font-weight: 500;
    }

    .property-value {
      flex: 1;
      padding: 12px 20px;
      color: #1e293b;
      font-size: 15px;
      background: #fff;
    }
  }
}

.result-list-table {
  background: #fff;
  border: 1px solid #d0dfed;
  border-radius: 6px;
  overflow: hidden;

  .result-thead {
    display: flex;
    background: #eef3f8;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 20px;
    color: #475569;
    font-size: 14px;
    font-weight: 700;

    .col-idx {
      width: 60px;
    }

    .col-name {
      flex: 1
    }

    .col-value {
      flex: 1;
      text-align: center;
    }

    .col-conc {
      flex: 1;
      text-align: center;
    }

    .col-status {
      flex: 1;
      text-align: center;
    }
  }

  .result-trow {
    display: flex;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 20px;
    align-items: center;
    font-size: 14px;
    color: #1e293b;
    transition: background 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f8fafc;
    }

    .col-idx {
      width: 60px;
      color: #64748B;
      font-family: monospace;
    }

    .col-name {
      flex: 1;
      font-weight: 500;
    }

    .col-value {
      flex: 1;
      text-align: center;
      color: #475569;
    }

    .col-conc {
      flex: 1;
      text-align: center;
      color: #475569;
    }

    .col-status {
      flex: 1;
      text-align: center;
    }
  }

  .result-empty {
    padding: 40px;
    text-align: center;
    color: #64748B;
    font-size: 14px;
  }
}

.report-evidence-box {
  background: #fff;
  border: 1px solid #EED8C1;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  justify-content: center;
  min-height: 240px;

  .evidence-img {
    max-width: 100%;
    max-height: 520px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  /* PDF Preview Styles */
  .pdf-preview-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: #F8FAFC;
    border: 1px dashed #D1D5DB;
    border-radius: 8px;
    padding: 32px;
    transition: all 0.3s;
    width: 100%;
    max-width: 240px;
    margin: 0 auto;

    &:hover {
      background: #F0F9FF;
      border-color: #00B3ED;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 179, 237, 0.1);

      .pdf-icon {
        color: #00B3ED;
      }

      .pdf-name {
        color: #00B3ED;
      }
    }

    .pdf-icon {
      font-size: 64px;
      color: #94A3B8;
      margin-bottom: 16px;
      transition: color 0.3s;
    }

    .pdf-name {
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 4px;
      transition: color 0.3s;
    }

    .pdf-tip {
      font-size: 13px;
      color: #94A3B8;
    }
  }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;

  &.is-safe {
    background: #52C41A;
    box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.1);
  }

  &.is-danger {
    background: #F5222D;
    box-shadow: 0 0 0 3px rgba(245, 34, 45, 0.1);
  }
}

.status-text {
  font-weight: 700;

  &.is-safe {
    color: #52C41A;
  }

  &.is-danger {
    color: #F5222D;
  }
}

.mt-24 {
  margin-top: 24px;
}

.empty-view {
  padding: 60px 0;
}
</style>
