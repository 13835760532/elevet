<template>
  <el-table :data="socialUsers" :show-header="false">
    <el-table-column fixed="left" title="序号" type="seq" width="60" />
    <el-table-column align="left" label="社交平台" width="120">
      <template #default="{ row }">
        <img :src="row.img" alt="" class="h-5 align-middle" />
        <p class="mr-5">{{ row.title }}</p>
      </template>
    </el-table-column>
    <el-table-column align="center" label="操作">
      <template #default="{ row }">
        <template v-if="row.openid">
          已绑定
          <XTextButton class="mr-5" title="(解绑)" type="primary" @click="unbind(row)" />
        </template>
        <template v-else>
          未绑定
          <XTextButton class="mr-5" title="(绑定)" type="primary" @click="bind(row)" />
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts" setup>
import { SystemUserSocialTypeEnum } from '@/utils/constants'
import { getBindSocialUserList } from '@/api/system/social/user'
import { socialAuthRedirect, socialBind, socialUnbind } from '@/api/system/user/socialUser'

defineOptions({ name: 'UserSocial' })
defineProps<{
  activeName: string
}>()
const message = useMessage()
const socialUsers = ref<any[]>([])

/**\n * initSocial：加载当前页面所需的数据或初始化状态。请求条件由当前路由、筛选项或已有上下文决定，结果用于更新页面响应式状态。\n */
const initSocial = async () => {
  socialUsers.value = [] // 重置避免无限增长
  // 获取已绑定的社交用户列表
  const bindSocialUserList = await getBindSocialUserList()
  // 检查该社交平台是否已绑定
  for (const i in SystemUserSocialTypeEnum) {
    const socialUser = { ...SystemUserSocialTypeEnum[i] }
    socialUsers.value.push(socialUser)
    if (bindSocialUserList && bindSocialUserList.length > 0) {
      for (const bindUser of bindSocialUserList) {
        if (socialUser.type === bindUser.type) {
          socialUser.openid = bindUser.openid
          break
        }
      }
    }
  }
}
const route = useRoute()
const emit = defineEmits<{
  (e: 'update:activeName', v: string): void
}>()
/**\n * bindSocial：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const bindSocial = () => {
  // 社交绑定
  const type = getUrlValue('type')
  const code = route.query.code
  const state = route.query.state
  if (!code) {
    return
  }
  socialBind(type, code, state).then(() => {
    message.success('绑定成功')
    emit('update:activeName', 'userSocial')
  })
}

// 双层 encode 需要在回调后进行 decode
/**\n * getUrlValue：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
function getUrlValue(key: string): string {
  const url = new URL(decodeURIComponent(location.href))
  return url.searchParams.get(key) ?? ''
}

/**\n * bind：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const bind = (row) => {
  // 双层 encode 解决钉钉回调 type 参数丢失的问题
  const redirectUri = location.origin + '/user/profile?' + encodeURIComponent(`type=${row.type}`)
  // 进行跳转
  socialAuthRedirect(row.type, encodeURIComponent(redirectUri)).then((res) => {
    window.location.href = res
  })
}
/**\n * unbind：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const unbind = async (row) => {
  const res = await socialUnbind(row.type, row.openid)
  if (res) {
    row.openid = undefined
  }
  message.success('解绑成功')
}

onMounted(async () => {
  await initSocial()
})

watch(
  () => route,
  () => {
    bindSocial()
  },
  {
    immediate: true
  }
)
</script>
