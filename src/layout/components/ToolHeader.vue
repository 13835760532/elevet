<script lang="tsx">
import { defineComponent, computed, ref } from 'vue'
import { ElTooltip } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@/layout/components//Message'
import { Collapse } from '@/layout/components/Collapse'
import { UserInfo } from '@/layout/components/UserInfo'
import { Screenfull } from '@/layout/components/Screenfull'
import { Breadcrumb } from '@/layout/components/Breadcrumb'
import { SizeDropdown } from '@/layout/components/SizeDropdown'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'
import RouterSearch from '@/components/RouterSearch/index.vue'
import TenantVisit from '@/layout/components/TenantVisit/index.vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { checkPermi } from '@/utils/permission'
import { Icon } from '@/components/Icon'
import HelpCenterAccessDialog from './HelpCenterAccessDialog.vue'
import { isHelpCenterAccessGranted } from '@/utils/helpCenterAccess'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 搜索图片
const search = computed(() => appStore.search)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
const locale = computed(() => appStore.getLocale)

// 消息图标
const message = computed(() => appStore.getMessage)

// 租户切换权限
const hasTenantVisitPermission = computed(
  () => import.meta.env.VITE_APP_TENANT_ENABLE === 'true' && checkPermi(['system:tenant:visit'])
)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const helpAccessVisible = ref(false)

    const openHelpCenter = () => {
      if (route.path === '/help-center') return
      if (isHelpCenterAccessGranted()) {
        router.push('/help-center')
        return
      }
      helpAccessVisible.value = true
    }

    const handleHelpAccessSuccess = () => {
      router.push('/help-center')
    }

    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-end',
          'dark:bg-[var(--el-bg-color)]'
        ]}
      >
        <div class="h-full flex items-center">
          <ElTooltip content="帮助中心" placement="bottom">
            <button
              type="button"
              class={[`${prefixCls}__help`, { 'is-active': route.path === '/help-center' }]}
              aria-label="打开帮助中心"
              onClick={openHelpCenter}
            >
              <Icon icon="ep:headset" size={20}></Icon>
            </button>
          </ElTooltip>
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="var(--top-header-text-color)"></Screenfull>
          ) : undefined}
          {/* {search.value ? <RouterSearch isModal={false} color="var(--top-header-text-color)"/> : undefined}
          {size.value ? (
            <SizeDropdown class="custom-hover" color="var(--top-header-text-color)"></SizeDropdown>
          ) : undefined}
          {locale.value ? (
            <LocaleDropdown
              class="custom-hover"
              color="var(--top-header-text-color)"
            ></LocaleDropdown>
          ) : undefined} */}
          {message.value ? (
            <Message class="custom-hover mt-2" color="var(--top-header-text-color)"></Message>
          ) : undefined}
          <UserInfo></UserInfo>
        </div>
        <HelpCenterAccessDialog
          modelValue={helpAccessVisible.value}
          onUpdate:modelValue={(value: boolean) => (helpAccessVisible.value = value)}
          onSuccess={handleHelpAccessSuccess}
        ></HelpCenterAccessDialog>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-tool-header;

.#{$prefix-cls} {
  transition: left var(--transition-time-02);

  &__help {
    display: grid;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    margin-right: 4px;
    color: var(--top-header-text-color);
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:hover,
    &:focus-visible,
    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-7);
      outline: none;
    }
  }
}
</style>
