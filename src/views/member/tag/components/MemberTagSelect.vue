<template>
  <el-select v-model="tagIds" placeholder="请选择用户标签" clearable multiple class="!w-240px">
    <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id" />
  </el-select>
  <el-button
    v-if="showAdd"
    type="primary"
    class="ml-2"
    link
    @click="openForm('create')"
    v-hasPermi="['member:tag:create']"
  >
    新增标签
  </el-button>

  <!-- 表单弹窗：添加 -->
  <TagForm ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import * as TagApi from '@/api/member/tag'
import TagForm from '@/views/member/tag/TagForm.vue'

defineOptions({ name: 'MemberTagSelect' })

const props = defineProps({
  /** 下拉框选中值 **/
  modelValue: {
    type: Array,
    default: undefined
  },
  /** 是否显示“新增标签”按钮 **/
  showAdd: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])
defineExpose({
  showAdd: props.showAdd
})

const tagIds = computed({
  get() {
    return props.modelValue
  },
  set(value: any) {
    emit('update:modelValue', value)
  }
})

const tags = ref<TagApi.TagVO[]>([])

/**\n * getList：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getList = async () => {
  tags.value = await TagApi.getSimpleTagList()
}

/** 添加用户标签表单弹框 */
const formRef = ref()
/**\n * openForm：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>
