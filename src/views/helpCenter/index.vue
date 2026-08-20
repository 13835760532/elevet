<template>
  <HelpCenterAccessDialog v-model="accessDialogVisible" @success="handleAccessSuccess" @cancel="handleAccessCancel" />

  <main v-if="accessGranted" class="help-center-page">
    <section v-loading="currentLoading" element-loading-text="正在加载帮助内容" class="help-content" aria-label="帮助中心内容">
      <div class="resource-tabs" role="tablist" aria-label="帮助资料类型">
        <button type="button" role="tab" :aria-selected="activeTab === 'MANUAL'"
          :class="{ 'is-active': activeTab === 'MANUAL' }" @click="switchTab('MANUAL')">
          <Icon icon="ep:reading" :size="20" />
          操作手册
        </button>
        <button type="button" role="tab" :aria-selected="activeTab === 'VIDEO'"
          :class="{ 'is-active': activeTab === 'VIDEO' }" @click="switchTab('VIDEO')">
          <Icon icon="ep:video-camera" :size="20" />
          操作视频
        </button>
      </div>

      <div v-if="currentError" class="state-wrapper">
        <el-empty description="帮助内容加载失败">
          <el-button type="primary" @click="reloadCurrentTab">重新加载</el-button>
        </el-empty>
      </div>

      <template v-else>
        <div v-if="activeTab === 'MANUAL' && currentList.length" class="manual-list">
          <button v-for="manual in currentList" :key="manual.id" type="button" class="manual-item"
            @click="openManual(manual)">
            <span class="manual-content">
              <strong>{{ manual.title }}</strong>
              <small>{{ manual.summary || '暂无简介' }}</small>
            </span>
            <span class="manual-meta">
              <span>{{ formatTutorialDate(manual.updateTime) }}</span>
              <Icon icon="ep:arrow-right" :size="18" />
            </span>
          </button>
        </div>

        <div v-else-if="activeTab === 'VIDEO' && currentList.length" class="video-grid">
          <button v-for="video in currentList" :key="video.id" type="button" class="video-card"
            :class="{ 'is-disabled': !video.url }" :disabled="!video.url" @click="openVideo(video)">
            <span class="video-cover">
              <video v-if="video.url" :src="video.url" preload="metadata" muted playsinline></video>
              <Icon v-else icon="ep:video-camera" :size="42" class="video-placeholder" />
              <span class="play-button" aria-hidden="true">
                <Icon icon="ep:video-play" :size="24" />
              </span>
            </span>
            <span class="video-content">
              <strong>{{ video.title }}</strong>
              <small>{{ video.summary || '暂无简介' }}</small>
              <span>更新于 {{ formatTutorialDate(video.updateTime) }}</span>
            </span>
          </button>
        </div>

        <div v-else-if="!currentLoading" class="state-wrapper">
          <el-empty :description="activeTab === 'MANUAL' ? '暂无操作手册' : '暂无操作视频'" />
        </div>
      </template>
    </section>

    <el-dialog v-model="manualDrawerVisible" width="980px" append-to-body destroy-on-close align-center
      class="help-manual-dialog">
      <template #header>
        <div class="drawer-title">
          <span>操作手册</span>
          <strong>{{ selectedManual?.title }}</strong>
        </div>
      </template>
      <div v-if="selectedManual" v-loading="manualDetailLoading" class="manual-detail">
        <p v-if="selectedManual.summary" class="manual-summary">{{ selectedManual.summary }}</p>
        <div class="detail-meta">
          <span>
            <Icon icon="ep:calendar" :size="15" />
            更新于 {{ formatTutorialDate(selectedManual.updateTime) }}
          </span>
          <a v-if="selectedManual.url" :href="selectedManual.url" target="_blank" rel="noopener noreferrer">
            <Icon icon="ep:link" :size="15" />
            打开文档
          </a>
        </div>
        <div v-if="selectedManual.content" v-dompurify-html="selectedManual.content" class="manual-rich-content"></div>
        <el-empty v-else-if="!manualDetailLoading" description="暂无手册正文" :image-size="88" />
      </div>
    </el-dialog>

    <el-dialog v-model="videoDialogVisible" :title="selectedVideo?.title" width="min(860px, 92vw)" append-to-body
      destroy-on-close class="help-video-dialog">
      <video v-if="selectedVideo?.url" class="preview-video" :src="selectedVideo.url" controls preload="metadata">
        当前浏览器不支持视频播放。
      </video>
      <p v-if="selectedVideo?.summary" class="video-dialog-note">{{ selectedVideo.summary }}</p>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Icon } from '@/components/Icon'
import { formatDate } from '@/utils/formatTime'
import {
  getTutorial,
  getTutorialPage,
  type TutorialRespVO,
  type TutorialType
} from '@/api/agri/tutorial'
import HelpCenterAccessDialog from '@/layout/components/HelpCenterAccessDialog.vue'
import { isHelpCenterAccessGranted } from '@/utils/helpCenterAccess'

defineOptions({ name: 'HelpCenter' })

const router = useRouter()
const accessGranted = ref(isHelpCenterAccessGranted())
const accessDialogVisible = ref(!accessGranted.value)

const handleAccessSuccess = () => {
  accessGranted.value = true
}

const handleAccessCancel = () => {
  if (!accessGranted.value) router.replace('/index')
}

const activeTab = ref<TutorialType>('MANUAL')
const tutorialLists = reactive<Record<TutorialType, TutorialRespVO[]>>({
  MANUAL: [],
  VIDEO: []
})
const loadingStates = reactive<Record<TutorialType, boolean>>({
  MANUAL: false,
  VIDEO: false
})
const loadedStates = reactive<Record<TutorialType, boolean>>({
  MANUAL: false,
  VIDEO: false
})
const errorStates = reactive<Record<TutorialType, boolean>>({
  MANUAL: false,
  VIDEO: false
})

const manualDrawerVisible = ref(false)
const manualDetailLoading = ref(false)
const videoDialogVisible = ref(false)
const selectedManual = ref<TutorialRespVO | null>(null)
const selectedVideo = ref<TutorialRespVO | null>(null)

const currentList = computed(() => tutorialLists[activeTab.value])
const currentLoading = computed(() => loadingStates[activeTab.value])
const currentError = computed(() => errorStates[activeTab.value])

const loadTutorialList = async (type: TutorialType, force = false) => {
  if (!force && loadedStates[type]) return

  loadingStates[type] = true
  errorStates[type] = false
  try {
    const data = await getTutorialPage({
      type,
      status: 0,
      pageNo: 1,
      pageSize: 1000
    })
    tutorialLists[type] = Array.isArray(data?.list) ? data.list : []
    loadedStates[type] = true
  } catch (error) {
    tutorialLists[type] = []
    errorStates[type] = true
    console.error(`加载${type === 'MANUAL' ? '操作手册' : '操作视频'}失败`, error)
  } finally {
    loadingStates[type] = false
  }
}

const switchTab = (type: TutorialType) => {
  activeTab.value = type
  void loadTutorialList(type)
}

const reloadCurrentTab = () => {
  void loadTutorialList(activeTab.value, true)
}

const openManual = async (manual: TutorialRespVO) => {
  selectedManual.value = manual
  manualDrawerVisible.value = true
  if (manual?.id) {
    manualDetailLoading.value = true
    try {
      const detail = await getTutorial(manual.id)
      if (detail && selectedManual.value?.id === manual.id) {
        selectedManual.value = detail
      }
    } catch (error) {
      console.error('获取手册详情失败', error)
    } finally {
      manualDetailLoading.value = false
    }
  }
}

const openVideo = (video: TutorialRespVO) => {
  if (!video.url) return
  selectedVideo.value = video
  videoDialogVisible.value = true
}

const formatTutorialDate = (value?: string) => {
  return value ? formatDate(new Date(value), 'YYYY-MM-DD') : '--'
}

onMounted(() => {
  if (accessGranted.value) void loadTutorialList('MANUAL')
})

watch(accessGranted, (granted) => {
  if (granted) void loadTutorialList('MANUAL')
})
</script>

<style scoped lang="scss">
.help-center-page {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  color: #243746;
  background: #f5f7fa;
}

:global(.v-layout-content:has(.help-center-page)) {
  min-width: 0;
}

button {
  color: inherit;
  font: inherit;
  letter-spacing: 0;
}

.help-content {
  min-height: 320px;
  padding: 20px;
  background: #fff;
  border: 1px solid #dfe6eb;
  border-radius: 6px;
}

.resource-tabs {
  display: inline-flex;
  padding: 4px;
  margin-bottom: 24px;
  background: #edf3f5;
  border-radius: 6px;

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 142px;
    height: 44px;
    padding: 0 20px;
    color: #718691;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 4px;

    &.is-active {
      color: #173244;
      background: #fff;
      box-shadow: 0 2px 8px rgb(27 59 73 / 8%);
    }
  }
}

.state-wrapper {
  display: grid;
  min-height: 240px;
  place-items: center;
}

.manual-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.manual-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  min-height: 112px;
  padding: 22px 28px;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e1e7eb;
  border-radius: 4px;
  transition: border-color 0.2s ease, background-color 0.2s ease;

  &:hover,
  &:focus-visible {
    background: #f8fcfd;
    border-color: var(--el-color-primary);
    outline: none;
  }
}

.manual-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;

  strong {
    color: #263a47;
    font-size: 17px;
  }

  small {
    overflow: hidden;
    color: #7b8c95;
    line-height: 1.6;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.manual-meta {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  color: #8999a1;
  font-size: 13px;
  white-space: nowrap;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px 44px;
}

.video-card {
  min-width: 0;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dce5ea;
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover,
  &:focus-visible {
    border-color: var(--el-color-primary);
    outline: none;
    box-shadow: 0 6px 18px rgb(30 68 85 / 9%);
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.video-cover {
  position: relative;
  display: grid;
  overflow: hidden;
  color: #8ea0aa;
  aspect-ratio: 16 / 9;
  background: #e7edf0;
  place-items: center;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #10232d;
  }
}

.video-placeholder {
  position: absolute;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 48px;
  height: 48px;
  color: #fff;
  background: rgb(20 40 50 / 72%);
  border-radius: 50%;
  place-items: center;
  transform: translate(-50%, -50%);
}

.video-content {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 14px 16px 16px;

  strong {
    color: #263a47;
    font-size: 16px;
  }

  small {
    overflow: hidden;
    color: #7c8e97;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  >span {
    color: #9aa8af;
    font-size: 12px;
  }
}

.drawer-title {
  display: flex;
  flex-direction: column;
  gap: 7px;

  span {
    color: var(--el-color-primary);
    font-size: 13px;
  }

  strong {
    color: #243746;
    font-size: 20px;
    line-height: 1.45;
  }
}

.manual-summary {
  margin: 0;
  color: #687b85;
  line-height: 1.8;
}

.detail-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 0;
  margin: 20px 0 24px;
  color: #7f919a;
  font-size: 13px;
  border-top: 1px solid #e3e9ec;
  border-bottom: 1px solid #e3e9ec;

  span,
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  a {
    color: var(--el-color-primary);
    text-decoration: none;
  }
}

.manual-rich-content {
  color: #344b58;
  line-height: 1.8;
  overflow-wrap: anywhere;

  :deep(img),
  :deep(video) {
    max-width: 100%;
    height: auto;
  }

  :deep(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
}

.preview-video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #10232d;
}

.video-dialog-note {
  margin: 12px 0 0;
  color: #7b8d96;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 960px) {
  .video-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
}

@media (max-width: 640px) {
  .help-content {
    padding: 14px;
  }

  .resource-tabs {
    display: flex;
    width: 100%;

    button {
      min-width: 0;
      flex: 1;
    }
  }

  .manual-item {
    align-items: flex-start;
    min-height: 0;
    padding: 18px;
  }

  .manual-content small {
    white-space: normal;
  }

  .manual-meta>span {
    display: none;
  }

  .video-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .detail-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<style lang="scss">
.help-manual-dialog {
  border-radius: 8px !important;

  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
  }

  .drawer-title {
    display: flex;
    flex-direction: column;
    gap: 7px;

    span {
      color: var(--el-color-primary);
      font-size: 13px;
    }

    strong {
      color: #243746;
      font-size: 20px;
      line-height: 1.45;
    }
  }

  .manual-summary {
    margin: 0;
    color: #687b85;
    line-height: 1.8;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 16px 0;
    margin: 20px 0 24px;
    color: #7f919a;
    font-size: 13px;
    border-top: 1px solid #e3e9ec;
    border-bottom: 1px solid #e3e9ec;

    span,
    a {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    a {
      color: var(--el-color-primary);
      text-decoration: none;
    }
  }

  .manual-rich-content {
    color: #344b58;
    line-height: 1.8;
    overflow-wrap: anywhere;

    img,
    video {
      max-width: 100%;
      height: auto;
    }

    table {
      display: block;
      max-width: 100%;
      overflow-x: auto;
      border-collapse: collapse;
    }
  }
}

.help-video-dialog {
  border-radius: 8px !important;

  .el-dialog__body {
    padding-top: 8px;
  }
}
</style>
