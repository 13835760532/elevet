<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'Logo' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const title = computed(() => appStore.getTitle)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu') {
      show.value = true
      return
    }
    if (!collapse) {
      setTimeout(() => {
        show.value = !collapse
      }, 400)
    } else {
      show.value = !collapse
    }
  }
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    } else {
      if (unref(collapse)) {
        show.value = false
      } else {
        show.value = true
      }
    }
  }
)
</script>

<template>
  <div>
    <router-link :class="[
      prefixCls,
      layout !== 'classic' ? `${prefixCls}__Top` : '',
      'flex !h-[var(--logo-height)] items-center cursor-pointer pl-8px relative decoration-none overflow-hidden'
    ]" to="/">
      <img class="h-[calc(var(--logo-height)-26px)] w-[calc(var(--logo-height)-26px)]" src="@/assets/logo/logo.png" />
      <div class="company-title">
        壹拾智检数智服务平台（专业版v2.0）
      </div>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.company-title {
  font-weight: 600;
  font-size: 18px;
  color: #00B3ED;
  line-height: 26px;
  margin-left: 10px;
}
</style>
