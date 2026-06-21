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
    presets: () => ['近一周', '近一月', '去年', '当年']
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
$statistics-control-height: 42px;
$statistics-control-radius: 6px;

@media (width <= 1360px) {
  .date-field {
    flex-basis: 310px;
    min-width: 310px;
  }
}

@media (width <= 960px) {
  .statistics-range-filter {
    align-items: center;
  }

  .filter-label-block {
    width: 128px;
    flex-basis: 128px;
    min-width: 0;
  }

  .date-field {
    flex: 0 0 300px;
    min-width: 300px;
  }

  .filter-extra,
  .filter-actions {
    justify-content: flex-start;
  }
}

.statistics-range-filter {
  display: flex;
  padding: 10px 12px;
  margin: 0 0 16px;
  overflow: auto hidden;
  background: #fff;
  border: 1px solid #e9f0f8;
  border-radius: 12px;
  align-items: center;
  gap: 10px;
}

.filter-label-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 128px;
  flex: 0 0 128px;
}

.filter-label {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2d3d;
}

.filter-desc {
  margin-top: 3px;
  font-size: 12px;
  color: #9aa8b8;
  white-space: nowrap;
}

.range-preset-group {
  padding: 2px;
  white-space: nowrap;
  background: #f3f7fb;
  border: 1px solid #e4edf6;
  border-radius: $statistics-control-radius;
  flex: 0 0 auto;
}

:deep(.range-preset-group .el-radio-button__inner) {
  height: 36px;
  min-width: 68px;
  padding: 0 14px;
  font-weight: 600;
  line-height: 36px;
  color: #64748b;
  background: transparent;
  border: 0;
  border-radius: $statistics-control-radius;
  box-shadow: none;
}

:deep(.range-preset-group .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #fff;
  background: #11b8ee;
  box-shadow: none;
}

.date-field {
  display: flex;
  height: $statistics-control-height;
  min-width: 330px;
  padding: 0 8px 0 10px;
  background: #fff;
  border: 1px solid #dfe8f2;
  border-radius: $statistics-control-radius;
  transition: border-color 0.2s ease;
  flex: 0 0 330px;
  align-items: center;

  &:hover {
    border-color: rgb(17 184 238 / 65%);
  }
}

.date-prefix {
  padding: 3px 7px;
  margin-right: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #0ea5d7;
  background: rgb(17 184 238 / 10%);
  border-radius: 999px;
  flex: 0 0 auto;
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
  font-weight: 500;
  color: #2f3b52;
}

:deep(.date-picker .el-range-separator) {
  font-weight: 700;
  color: #8392a6;
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
  width: 160px;
}

:deep(.filter-extra .el-select__wrapper),
:deep(.filter-extra .el-input__wrapper) {
  min-height: $statistics-control-height;
  border: 1px solid #dfe8f2;
  border-radius: $statistics-control-radius;
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
  height: $statistics-control-height;
  min-width: 64px;
  font-weight: 700;
  border-radius: $statistics-control-radius;
}

.query-btn {
  background: #11b8ee;
  border: 0;
  box-shadow: none;
}

.reset-btn {
  color: #516174;
  background: #fff;
  border-color: #dfe8f2;
}
</style>
