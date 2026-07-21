<template>
  <el-select v-model="groupId" placeholder="请选择用户分组" clearable class="!w-240px">
    <el-option
      v-for="group in groupOptions"
      :key="group.id"
      :label="group.name"
      :value="group.id"
    />
  </el-select>
</template>
<script lang="ts" setup>
import * as GroupApi from '@/api/member/group'

/** 会员分组选择框 **/
defineOptions({ name: 'MemberGroupSelect' })

const props = defineProps({
  /** 下拉框选中值 **/
  modelValue: {
    type: Number,
    default: undefined
  }
})
const emit = defineEmits(['update:modelValue'])

const groupId = computed({
  get() {
    return props.modelValue
  },
  set(value: any) {
    emit('update:modelValue', value)
  }
})

const groupOptions = ref<GroupApi.GroupVO[]>([])

/**\n * getList：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getList = async () => {
  groupOptions.value = await GroupApi.getSimpleGroupList()
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
