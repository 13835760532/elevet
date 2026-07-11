<script lang="ts" setup>
import { isDark } from '@/utils/is'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import routerSearch from '@/components/RouterSearch/index.vue'
import autofit from 'autofit.js'
import { BIG_SCREEN_AUTOFIT_OPTIONS } from '@/bigScreenAutofit'

defineOptions({ name: 'APP' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('app')
const appStore = useAppStore()
const currentSize = computed(() => appStore.getCurrentSize)
const greyMode = computed(() => appStore.getGreyMode)
const { wsCache } = useCache()
const route = useRoute()
let isBigScreenAutofitActive = false

// 根据浏览器当前主题设置系统主题色
const setDefaultTheme = () => {
  let isDarkTheme = wsCache.get(CACHE_KEY.IS_DARK)
  if (isDarkTheme === null) {
    isDarkTheme = isDark()
  }
  appStore.setIsDark(isDarkTheme)
}
setDefaultTheme()

// 仅在大屏页面启用 autofit
const bigScreenRoutes = [
  'BigScreen',
  'BigScreenThree',
  'BigScreenCertificate',
  'BigScreenTask',
  'BigScreenTaskReceive',
  'BigScreenQuick'
]
const enableBigScreenAutofit = async (routeName: unknown) => {
  disableBigScreenAutofit()
  await nextTick()
  if (route.name !== routeName) return
  if (!document.querySelector(BIG_SCREEN_AUTOFIT_OPTIONS.el)) return
  autofit.init(BIG_SCREEN_AUTOFIT_OPTIONS, false)
  isBigScreenAutofitActive = true
}

const disableBigScreenAutofit = () => {
  if (!isBigScreenAutofitActive) return
  autofit.off()
  isBigScreenAutofitActive = false
}

watch(
  () => route.name,
  (newName) => {
    if (bigScreenRoutes.includes(newName as string)) {
      void enableBigScreenAutofit(newName)
    } else {
      disableBigScreenAutofit()
    }
  },
  { immediate: true }
)
</script>
<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `${prefixCls}-grey-mode` : ''" />
    <routerSearch />
  </ConfigGlobal>
</template>
<style lang="scss">
/* 引入公共查询表单样式 */
@use '@/styles/query-form.scss';
$prefix-cls: #{$namespace}-app;

.size {
  width: 100%;
  height: 100%;
}

html,
body {
  @extend .size;

  padding: 0 !important;
  margin: 0;
  overflow: hidden;

  #app {
    @extend .size;
  }
}

.#{$prefix-cls}-grey-mode {
  filter: grayscale(100%);
}



.login-container {
  background: url("@/assets/imgs/login-bg.png") no-repeat center center !important;
  background-size: cover !important;
}

.yy-container {
  background: #F1F5F9 !important;
  background-size: cover !important;
}
</style>
