<template>
  <div>
    <el-row align="middle" justify="center">
      <el-col :span="6">
        <el-row align="middle" justify="center" class="thumb-div">
          <el-col :span="24">
            <el-row align="middle" justify="center">
              <img style="width: 100px" v-if="reply.thumbMediaUrl" :src="reply.thumbMediaUrl" />
              <icon v-else icon="ep:plus" />
            </el-row>
            <el-row align="middle" justify="center" style="margin-top: 2%">
              <div class="thumb-but">
                <el-upload
                  :action="UPLOAD_URL"
                  :headers="HEADERS"
                  multiple
                  :limit="1"
                  :file-list="fileList"
                  :data="uploadData"
                  :before-upload="beforeImageUpload"
                  :on-success="onUploadSuccess"
                >
                  <template #trigger>
                    <el-button type="primary" link>本地上传</el-button>
                  </template>
                  <el-button type="primary" link @click="showDialog = true" style="margin-left: 5px"
                    >素材库选择
                  </el-button>
                </el-upload>
              </div>
            </el-row>
          </el-col>
        </el-row>
        <el-dialog
          title="选择图片"
          v-model="showDialog"
          width="80%"
          append-to-body
          destroy-on-close
        >
          <WxMaterialSelect
            type="image"
            :account-id="reply.accountId"
            @select-material="selectMaterial"
          />
        </el-dialog>
      </el-col>
      <el-col :span="18">
        <el-input v-model="reply.title" placeholder="请输入标题" />
        <div style="margin: 20px 0"></div>
        <el-input v-model="reply.description" placeholder="请输入描述" />
      </el-col>
    </el-row>
    <div style="margin: 20px 0"></div>
    <el-input v-model="reply.musicUrl" placeholder="请输入音乐链接" />
    <div style="margin: 20px 0"></div>
    <el-input v-model="reply.hqMusicUrl" placeholder="请输入高质量音乐链接" />
  </div>
</template>

<script lang="ts" setup>
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import type { UploadRawFile } from 'element-plus'
import { UploadType, useBeforeUpload } from '@/views/mp/hooks/useUpload'
import { getAccessToken } from '@/utils/auth'
import { Reply } from './types'

const message = useMessage()

const UPLOAD_URL = import.meta.env.VITE_BASE_URL + '/admin-api/mp/material/upload-temporary'
const HEADERS = { Authorization: 'Bearer ' + getAccessToken() } // 设置上传的请求头部

const props = defineProps<{
  modelValue: Reply
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: Reply)
}>()
const reply = computed<Reply>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const showDialog = ref(false)
const fileList = ref([])
const uploadData = reactive({
  accountId: reply.value.accountId,
  type: 'thumb', // 音乐类型为thumb
  title: '',
  introduction: ''
})

/**\n * beforeImageUpload：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const beforeImageUpload = (rawFile: UploadRawFile) => useBeforeUpload(UploadType.Image, 2)(rawFile)

/**\n * onUploadSuccess：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const onUploadSuccess = (res: any) => {
  if (res.code !== 0) {
    message.error('上传出错：' + res.msg)
    return false
  }

  // 清空上传时的各种数据
  fileList.value = []
  uploadData.title = ''
  uploadData.introduction = ''

  // 上传好的文件，本质是个素材，所以可以进行选中
  selectMaterial(res.data)
}

/**\n * selectMaterial：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const selectMaterial = (item: any) => {
  showDialog.value = false

  reply.value.thumbMediaId = item.mediaId
  reply.value.thumbMediaUrl = item.url
}
</script>
