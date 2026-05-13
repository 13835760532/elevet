<template>
  <div class="statistics-range-filter">
    <div class="filter-label-block">
      <span class="filter-label">{{ label }}</span>
      <span v-if="description" class="filter-desc">{{ description }}</span>
    </div>

    <el-radio-group :model-value="rangeType" class="range-preset-group" @change="handleRangeTypeChange">
      <el-radio-button v-for="item in presets" :key="item" :label="item" />
    </el-radio-group>

    <div class="date-field">
      <span class="date-prefix">自定义</span>
      <el-date-picker :model-value="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
        end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="date-picker"
        @update:model-value="handleDateRangeChange" />
    </div>

    <div v-if="$slots.extra" class="filter-extra">
      <slot name="extra" />
    </div>

    <div class="filter-actions">
      <el-button type="primary" class="query-btn" @click="$emit('search')">查询</el-button>
      <el-button class="reset-btn" @click="$emit('reset')">重置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    description?: string
    rangeType: string
    dateRange: string[]
    presets?: string[]
  }>(),
  {
    label: '数据范围',
    description: '',
    presets: () => ['近一周', '近一月', '今年']
  }
)

const emit = defineEmits<{
  (event: 'update:rangeType', value: string): void
  (event: 'update:dateRange', value: string[]): void
  (event: 'search'): void
  (event: 'reset'): void
}>()

const handleRangeTypeChange = (value: string | number | boolean) => {
  emit('update:rangeType', String(value))
}

const handleDateRangeChange = (value: string[] | null) => {
  emit('update:dateRange', value || [])
}
</script>

<style scoped lang="scss">
.statistics-range-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  padding: 10px 12px;
  border: 1px solid #e9f0f8;
  border-radius: 12px;
  background: #fff;
}

.filter-label-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 110px;
  flex: 0 0 110px;
}

.filter-label {
  color: #1f2d3d;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.filter-desc {
  margin-top: 3px;
  color: #9aa8b8;
  font-size: 12px;
}

.range-preset-group {
  flex: 0 0 auto;
  padding: 2px;
  border: 1px solid #e4edf6;
  border-radius: 10px;
  background: #f3f7fb;
  white-space: nowrap;
}

:deep(.range-preset-group .el-radio-button__inner) {
  height: 32px;
  min-width: 68px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  line-height: 32px;
  box-shadow: none;
}

:deep(.range-preset-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #11b8ee;
  color: #fff;
  box-shadow: none;
}

.date-field {
  flex: 0 0 320px;
  display: flex;
  align-items: center;
  min-width: 360px;
  height: 38px;
  padding: 0 8px 0 10px;
  border: 1px solid #dfe8f2;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(17, 184, 238, 0.65);
  }
}

.date-prefix {
  flex: 0 0 auto;
  margin-right: 8px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(17, 184, 238, 0.1);
  color: #0ea5d7;
  font-size: 12px;
  font-weight: 700;
}

.date-picker {
  flex: 1;
  width: 100%;
}

:deep(.date-picker.el-date-editor) {
  --el-input-border-color: transparent;
  --el-input-hover-border-color: transparent;
  --el-input-focus-border-color: transparent;
  --el-input-bg-color: transparent;
  height: 36px;
  box-shadow: none;
}

:deep(.date-picker .el-range-input) {
  color: #2f3b52;
  font-weight: 500;
}

:deep(.date-picker .el-range-separator) {
  color: #8392a6;
  font-weight: 700;
}

.filter-extra {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

:deep(.filter-extra .el-select) {
  width: 128px;
}

:deep(.filter-extra .el-input) {
  width: 190px;
}

:deep(.filter-extra .el-select__wrapper),
:deep(.filter-extra .el-input__wrapper) {
  min-height: 42px;
  border: 1px solid #dfe8f2;
  border-radius: 10px;
  box-shadow: none;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
}

:deep(.filter-actions .el-button + .el-button) {
  margin-left: 0;
}

.query-btn,
.reset-btn {
  height: 38px;
  min-width: 68px;
  border-radius: 8px;
  font-weight: 700;
}

.query-btn {
  border: 0;
  background: #11b8ee;
  box-shadow: none;
}

.reset-btn {
  border-color: #dfe8f2;
  background: #fff;
  color: #516174;
}

@media (max-width: 1360px) {
  .statistics-range-filter {
    flex-wrap: wrap;
  }

  .date-field {
    flex-basis: 460px;
  }
}

@media (max-width: 960px) {
  .statistics-range-filter {
    align-items: stretch;
  }

  .filter-label-block {
    width: auto;
    flex-basis: 100%;
    min-width: 0;
  }

  .date-field {
    flex: 1 1 100%;
    min-width: 0;
  }

  .filter-extra,
  .filter-actions {
    justify-content: flex-start;
  }
}
</style>
