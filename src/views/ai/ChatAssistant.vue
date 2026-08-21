<template>
  <div class="ai-chat-container" :class="{ 'is-desktop-app': isDesktopApp }">
    <div class="ambient ambient-a"></div>
    <div class="ambient ambient-b"></div>
    <div class="surface-grain"></div>

    <div class="assistant-nav">
      <div class="nav-brand">
        <span class="brand-mark">壹</span>
        <div>
          <strong>小壹 AI 助手</strong>
          <span>农产品风险问答工作台</span>
        </div>
      </div>
      <div class="nav-status">
        <span class="status-dot"></span>
        实时分析
      </div>
    </div>

    <div class="chat-main" ref="chatMainRef">
      <div v-if="messages.length === 0" class="welcome-section">
        <section class="welcome-card">
          <div class="hero-copy">
            <div class="assistant-kicker">农产品风险问答</div>
            <h1>智能问答：快速检测统计分析</h1>
            <p>
              支持地区排名、检测项目、月度趋势、阳性率对比等问题。直接输入自然语言，小壹会整理数据、结论和后续追问方向。
            </p>
            <div class="hero-actions">
              <button class="primary-action" type="button" @click="handleSend('4月份农产品风险情况怎么样？')">
                <span>试问一个问题</span>
                <i>
                  <Icon icon="ep:position" :size="16" />
                </i>
              </button>
              <button class="secondary-action" type="button" @click="refreshRecommends">
                <Icon icon="ep:refresh" :size="16" />
                换一批推荐
              </button>
            </div>
          </div>

          <div class="hero-panel">
            <div class="assistant-card-head">
              <div class="avatar-orbit">
                <div class="ai-avatar">壹</div>
              </div>
              <div class="panel-copy">
                <span>小壹正在待命</span>
                <strong>一次提问，返回分析结论</strong>
              </div>
            </div>
            <div class="answer-preview">
              <p>“本月哪些地区风险偏高？”</p>
              <span>小壹会返回排名、阳性率、重点风险项目和建议关注方向。</span>
            </div>
            <div class="capability-stack">
              <div>
                <span>地区</span>
                <strong>风险排名</strong>
              </div>
              <div>
                <span>项目</span>
                <strong>阳性检出</strong>
              </div>
              <div>
                <span>月份</span>
                <strong>趋势对比</strong>
              </div>
            </div>
          </div>
        </section>

        <div class="recommend-section">
          <div class="recommend-header">
            <div>
              <h4>推荐问法</h4>
              <span>选择一个问题快速开始，也可以在底部自由输入。</span>
            </div>
            <span class="refresh-btn" @click="refreshRecommends">
              <Icon icon="ep:refresh" /> 换一批
            </span>
          </div>
          <div class="recommend-grid">
            <div v-for="(item, index) in currentRecommends" :key="index" class="recommend-item"
              @click="handleSend(item)">
              {{ item }}
              <i>
                <Icon icon="ep:right" :size="14" />
              </i>
            </div>
          </div>
        </div>
      </div>

      <div class="message-list">
        <div v-for="msg in messages" :key="msg.id" :class="['message-item', `is-${msg.role}`]">
          <div v-if="msg.role === 'user'" class="message-bubble user-bubble">
            {{ msg.content }}
          </div>

          <div v-else class="message-wrapper">
            <div v-if="msg.status === 'thinking'" class="thinking-box">
              <Icon icon="ep:loading" class="is-loading" />
              <span>小壹正在思考中...</span>
            </div>

            <div v-if="msg.status === 'typing' || msg.status === 'done'" class="action-steps">
              <div class="step-item">
                <Icon icon="ep:document" /> {{ msg.actionTitle || '农产品风险分析' }}
              </div>
              <div class="step-desc">{{ msg.status === 'done' ? '已生成回答' : '正在回答中...' }}</div>
            </div>

            <div v-if="msg.content || msg.tableData" class="message-bubble ai-bubble">
              <div class="rich-content">
                <h4 v-if="msg.title" class="report-title">{{ msg.title }}</h4>
                <p v-html="formatContent(msg.content)"></p>

                <div v-if="msg.tableData && msg.tableData.length" class="report-table">
                  <el-table :data="msg.tableData" border style="width: 100%" size="small">
                    <el-table-column v-for="column in msg.tableColumns" :key="column.prop" :prop="column.prop"
                      :label="column.label" :width="column.width" :min-width="column.minWidth" :align="column.align" />
                  </el-table>
                </div>

                <p v-if="msg.conclusion" class="report-conclusion" v-html="formatContent(msg.conclusion)"></p>
              </div>

              <div v-if="msg.status === 'done'" class="message-footer">
                <div class="regenerate-btn" @click="handleRegenerate(msg.id)">
                  <Icon icon="ep:refresh-right" /> 重新生成
                </div>

                <div v-if="msg.suggestions && msg.suggestions.length" class="follow-up-section">
                  <div class="follow-up-title">你可以继续问我：</div>
                  <div class="follow-up-list">
                    <span v-for="(sug, idx) in msg.suggestions" :key="idx" class="follow-up-pill"
                      @click="handleSend(sug)">
                      {{ sug }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <div class="input-wrapper">
        <el-input v-model="inputText" type="textarea" :rows="3" placeholder="可以问我任何问题，帮你解答" resize="none"
          maxlength="100" show-word-limit @keydown.enter.exact.prevent="handleSend(inputText)" />
        <div
          class="voice-btn"
          :class="{ active: isRecording, disabled: isTyping || voiceTogglePending }"
          :title="voiceButtonTitle"
          @click="toggleVoiceInput()">
          <Icon :icon="isRecording ? 'ep:video-pause' : 'ep:microphone'" :size="20" />
        </div>
        <button
          v-if="isDesktopApp"
          type="button"
          class="voice-btn wake-btn"
          :class="{ active: wakeWordRequested, pending: isWakeWordStarting }"
          :disabled="isTyping || !wakeWordRuntimeAvailable || isWakeWordStarting"
          :aria-label="wakeWordButtonTitle"
          :title="wakeWordButtonTitle"
          @click="toggleWakeWord"
        >
          <Icon :icon="wakeWordRequested ? 'ep:bell-filled' : 'ep:bell'" :size="20" />
        </button>
        <div class="send-btn" :class="{ active: inputText.trim() && !isTyping }" @click="handleSend(inputText)">
          <Icon icon="ep:position" :size="20" />
        </div>
        <div v-if="voiceStatusText" class="voice-status" :class="{ recording: isRecording }">
          <span class="voice-dot"></span>
          {{ voiceStatusText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  VoiceAssistantApi,
  type CategoryRiskReportRespVO,
  type ProjectRiskRankingRespVO,
  type RegionRiskRankingRespVO,
  type RiskMonthlyReportRespVO,
  type RiskProductItemVO,
  type RiskTrendCompareRespVO,
  type VoiceAssistantAskRespVO
} from '@/api/agri/voiceAssistant'
import { BrowserSpeechRecognizer } from '@/api/agri/voiceAssistant/browserSpeechRecognition'
import { XfyunRtasrRecognizer } from '@/api/agri/voiceAssistant/xfyunRtasr'
import { BrowserWakeWordEngine, DEFAULT_WAKE_WORDS } from '@/api/agri/voiceAssistant/wakeWord/browserWakeWord'
import { SherpaOnnxWakeWordEngine } from '@/api/agri/voiceAssistant/wakeWord/sherpaOnnxWakeWord'
import {
  XfyunDesktopWakeWordEngine,
  isXfyunDesktopWakeWordSupported
} from '@/api/agri/voiceAssistant/wakeWord/xfyunDesktopWakeWord'
import type { WakeWordEngine, WakeWordStatus } from '@/api/agri/voiceAssistant/wakeWord/types'

defineOptions({ name: 'ChatAssistant' })

/** 桌面安装包不使用后台布局，需要由助手页面独占应用窗口高度。 */
const isDesktopApp = import.meta.env.VITE_APP_DESKTOP === 'true'
const isXfyunDesktopWakeWordAvailable = isXfyunDesktopWakeWordSupported()

// Sherpa-ONNX 的中文模型按拼音 token 匹配，@ 后的文字用于展示已识别的唤醒词。
const DESKTOP_WAKE_WORDS = [
  'n ǐ h ǎo x iǎo y ī @你好小壹',
  'n ǐ h ǎo x iǎo y ī @你好小一',
  'x iǎo y ī @小壹',
  'x iǎo y ī @小一',
  'x iǎo y ī x iǎo y ī @小壹小壹',
  'x iǎo y ī x iǎo y ī @小一小一'
]

// --- 推荐问题数据 ---
const allRecommends = [
  '哪些地区抽检不合格比较多？',
  '4月份农产品风险情况怎么样？',
  '哪些检测项目不合格最多？',
  '对比上个月这个月风险有什么变化？',
  '本月和上月相比阳性率怎么样？',
  '哪种农药检出最多？',
  '上个月抽检合格率如何？'
]
const currentRecommends = ref<string[]>([])

/**\n * refreshRecommends：同步或重置当前页面状态，保证筛选项、组件显示和后续请求参数保持一致。\n */
const refreshRecommends = () => {
  // 随机取5个
  const shuffled = [...allRecommends].sort(() => 0.5 - Math.random())
  currentRecommends.value = shuffled.slice(0, 5)
}

// --- 消息数据结构 ---
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  status?: 'thinking' | 'typing' | 'done' | 'error'
  title?: string
  actionTitle?: string
  tableData?: any[]
  tableColumns?: TableColumn[]
  conclusion?: string
  suggestions?: string[]
}

interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
}

interface RenderedAnswer {
  title: string
  content: string
  actionTitle: string
  tableData?: any[]
  tableColumns?: TableColumn[]
  conclusion?: string
  suggestions: string[]
}

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const voiceTogglePending = ref(false)
const isWakeWordEnabled = ref(false)
// 用户意图与当前引擎运行状态分开：录音/回答期间引擎会暂停，但用户仍保持开启意图。
const wakeWordRequested = ref(false)
const voiceStatusText = ref('')
const voiceRecognizer = ref<XfyunRtasrRecognizer | null>(null)
const wakeWordEngine = ref<WakeWordEngine | null>(null)
const wakeWordStatus = ref<WakeWordStatus>('idle')
const wakeWordTranscript = ref('')
const wakeWordSessionToken = ref(0)
let wakeResumeTimer: number | null = null
const chatMainRef = ref<HTMLElement | null>(null)
const wakeWordRuntimeAvailable =
  isXfyunDesktopWakeWordAvailable || isDesktopApp || BrowserSpeechRecognizer.isSupported()
const isWakeWordStarting = computed(() => wakeWordStatus.value === 'initializing')

const voiceButtonTitle = computed(() => {
  if (isTyping.value) return '小壹正在回答中'
  return isRecording.value ? '停止语音输入' : '语音输入'
})

const wakeWordButtonTitle = computed(() => {
  if (isTyping.value) return '小壹正在回答中'
  if (!wakeWordRuntimeAvailable) return '当前设备不支持本地唤醒'
  if (isWakeWordStarting.value) return '正在启动本地唤醒'
  return wakeWordRequested.value ? '关闭唤醒模式' : '启用唤醒模式'
})

// --- 工具函数 ---
/**\n * scrollToBottom：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const scrollToBottom = async () => {
  await nextTick()
  if (chatMainRef.value) {
    chatMainRef.value.scrollTop = chatMainRef.value.scrollHeight
  }
}

// 格式化换行
/**\n * formatContent：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatContent = (text: string) => {
  return escapeHtml(text || '').replace(/\n/g, '<br/>')
}

/**\n * generateId：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const generateId = () => Math.random().toString(36).substring(2, 9)

/**\n * escapeHtml：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const escapeHtml = (text: string) => {
  return text.replace(/[&<>"']/g, (char) => {
    const charMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }
    return charMap[char]
  })
}

/**\n * formatPercent：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatPercent = (value?: number) => {
  return value === undefined || value === null ? '--' : `${value}%`
}

/**\n * formatNumber：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const formatNumber = (value?: number) => {
  return value === undefined || value === null ? '--' : value
}

/**\n * joinNames：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const joinNames = (values?: string[]) => {
  return values?.length ? values.join('、') : '--'
}

/**\n * getHazardText：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getHazardText = (item: { restrictionLabel?: string; restrictionType?: string }) => {
  return item.restrictionLabel || item.restrictionType || '--'
}

/**\n * getDetectionItemsText：根据当前上下文读取、判断或定位页面数据。返回结果供模板、计算属性或后续业务分支使用，不直接提交表单。\n */
const getDetectionItemsText = (items?: RiskProductItemVO['detectionItems']) => {
  if (!items?.length) return '--'
  return items.map((item) => `${item.itemName || '--'}（${getHazardText(item)}）`).join('、')
}

const riskProductColumns: TableColumn[] = [
  { prop: 'rank', label: '排名', width: 70, align: 'center' },
  { prop: 'productName', label: '农产品', minWidth: 120 },
  { prop: 'category', label: '分类', minWidth: 100 },
  { prop: 'positiveCount', label: '阳性次数', width: 100, align: 'center' },
  { prop: 'positiveRate', label: '阳性率', width: 90, align: 'center' },
  { prop: 'detectionItems', label: '检出项目', minWidth: 180 }
]

const positiveItemColumns: TableColumn[] = [
  { prop: 'rank', label: '排名', width: 70, align: 'center' },
  { prop: 'itemName', label: '检测项目', minWidth: 130 },
  { prop: 'positiveCount', label: '阳性次数', width: 100, align: 'center' },
  { prop: 'relatedProductName', label: '关联农产品', minWidth: 120 },
  { prop: 'hazard', label: '危害等级', width: 100, align: 'center' }
]

/**\n * renderRiskProducts：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const renderRiskProducts = (list?: RiskProductItemVO[]) => {
  return (list || []).map((item, index) => ({
    rank: item.rank || index + 1,
    productName: item.productName || '--',
    category: item.category || '--',
    positiveCount: formatNumber(item.positiveCount),
    positiveRate: formatPercent(item.positiveRate),
    detectionItems: getDetectionItemsText(item.detectionItems)
  }))
}

/** 将月度风险报告转换为聊天消息的摘要、表格、结论和追问建议。 */
const renderMonthlyReport = (report: RiskMonthlyReportRespVO, voiceText: string): RenderedAnswer => {
  const summary = report.summary
  const content = voiceText || `${report.area || ''}${report.month || ''}农产品风险情况已生成。`
  const conclusionParts = [
    `总抽检 ${formatNumber(summary?.totalCount ?? report.totalCount)} 批次`,
    `阳性 ${formatNumber(summary?.positiveCount ?? report.positiveCount)} 批次`,
    `阳性率 ${formatPercent(summary?.positiveRate ?? report.positiveRate)}`,
    `禁用 ${formatNumber(summary?.forbiddenCount)} 次`,
    `限用 ${formatNumber(summary?.restrictedCount)} 次`,
    `常规 ${formatNumber(summary?.regularCount)} 次`
  ]
  return {
    title: `${report.month || ''}${report.area || ''}农产品风险月报`,
    actionTitle: '农产品月度风险报告',
    content,
    tableColumns: riskProductColumns,
    tableData: renderRiskProducts(report.riskTopList),
    conclusion: `${conclusionParts.join('，')}。${report.suggestion || ''}`,
    suggestions: ['哪些地区抽检不合格比较多？', '哪些检测项目不合格最多？', '对比上个月这个月风险有什么变化？']
  }
}

/** 将地区风险排名转换为统一的聊天表格结构，并补齐空指标占位。 */
const renderRegionRanking = (ranking: RegionRiskRankingRespVO, voiceText: string): RenderedAnswer => {
  return {
    title: `${ranking.month || ''}${ranking.parentArea || ''}地区风险排名`,
    actionTitle: '地区风险排名',
    content: voiceText || '已生成地区风险排名。',
    tableColumns: [
      { prop: 'rank', label: '排名', width: 70, align: 'center' },
      { prop: 'regionName', label: '地区', minWidth: 130 },
      { prop: 'totalCount', label: '总批次', width: 90, align: 'center' },
      { prop: 'positiveCount', label: '阳性批次', width: 100, align: 'center' },
      { prop: 'positiveRate', label: '阳性率', width: 90, align: 'center' },
      { prop: 'topHazardLabel', label: '最高危害等级', width: 120, align: 'center' }
    ],
    tableData: (ranking.regionList || []).map((item, index) => ({
      rank: item.rank || index + 1,
      regionName: item.regionName || '--',
      totalCount: formatNumber(item.totalCount),
      positiveCount: formatNumber(item.positiveCount),
      positiveRate: formatPercent(item.positiveRate),
      topHazardLabel: item.topHazardLabel || item.topHazardLevel || '--'
    })),
    suggestions: ['本月和上月相比阳性率怎么样？', '4月份农产品风险情况怎么样？', '对比上个月这个月风险有什么变化？']
  }
}

const renderProjectRanking = (ranking: ProjectRiskRankingRespVO, voiceText: string): RenderedAnswer => {
  const categoryText = ranking.categoryDistribution?.length
    ? `分类分布：${ranking.categoryDistribution
      .map((item) => `${item.category || '--'}（${joinNames(item.mainItems)}，${formatNumber(item.positiveCount)}次）`)
      .join('；')}`
    : ''
  return {
    title: `${ranking.month || ''}${ranking.area || ''}检测项目风险排名`,
    actionTitle: '检测项目风险排名',
    content: voiceText || '已生成检测项目风险排名。',
    tableColumns: positiveItemColumns,
    tableData: (ranking.projectList || []).map((item, index) => ({
      rank: item.rank || index + 1,
      itemName: item.itemName || '--',
      positiveCount: formatNumber(item.positiveCount),
      relatedProductName: item.relatedProductName || '--',
      hazard: getHazardText(item)
    })),
    conclusion: categoryText,
    suggestions: ['哪种农药检出最多？', '4月份农产品风险情况怎么样？', '哪些地区抽检不合格比较多？']
  }
}

/** 将本月/上月风险对比转换为指标表，并翻译后端趋势枚举。 */
const renderTrendCompare = (trend: RiskTrendCompareRespVO, voiceText: string): RenderedAnswer => {
  const trendMap: Record<string, string> = {
    IMPROVED: '好转',
    WORSENED: '上升',
    STABLE: '平稳'
  }
  return {
    title: `${trend.area || ''}${trend.currentMonth || ''}与${trend.previousMonth || ''}风险对比`,
    actionTitle: '风险趋势对比',
    content: voiceText || '已生成风险趋势对比。',
    tableColumns: [
      { prop: 'metric', label: '指标', minWidth: 120 },
      { prop: 'current', label: '本月', width: 100, align: 'center' },
      { prop: 'previous', label: '上月', width: 100, align: 'center' },
      { prop: 'diff', label: '变化', width: 100, align: 'center' }
    ],
    tableData: [
      {
        metric: '总批次',
        current: formatNumber(trend.current?.totalCount),
        previous: formatNumber(trend.previous?.totalCount),
        diff: formatNumber(trend.totalDiff)
      },
      {
        metric: '阳性批次',
        current: formatNumber(trend.current?.positiveCount),
        previous: formatNumber(trend.previous?.positiveCount),
        diff: formatNumber(trend.positiveDiff)
      },
      {
        metric: '阳性率',
        current: formatPercent(trend.current?.positiveRate),
        previous: formatPercent(trend.previous?.positiveRate),
        diff: formatPercent(trend.positiveRateDiff)
      },
      { metric: '禁用检出', current: '--', previous: '--', diff: formatNumber(trend.forbiddenDiff) },
      { metric: '限用检出', current: '--', previous: '--', diff: formatNumber(trend.restrictedDiff) },
      { metric: '常规检出', current: '--', previous: '--', diff: formatNumber(trend.regularDiff) }
    ],
    conclusion: `风险趋势：${trendMap[trend.riskTrend || ''] || trend.riskTrend || '--'}。${trend.keyAlert || ''}`,
    suggestions: ['本月和上月相比阳性率怎么样？', '上个月抽检合格率如何？', '哪些检测项目不合格最多？']
  }
}

const renderCategoryReport = (report: CategoryRiskReportRespVO, voiceText: string): RenderedAnswer => {
  return {
    title: `${report.month || ''}${report.area || ''}${report.category || ''}风险报告`,
    actionTitle: '品类风险报告',
    content: voiceText || '已生成品类风险报告。',
    tableColumns: riskProductColumns,
    tableData: renderRiskProducts(report.riskProductList),
    conclusion: `总批次 ${formatNumber(report.totalCount)}，阳性 ${formatNumber(report.positiveCount)}，阳性率 ${formatPercent(report.positiveRate)}。${report.subCategoryHint ? `重点关注：${report.subCategoryHint}。` : ''}${report.suggestion || ''}`,
    suggestions: ['哪种农药检出最多？', '对比上个月这个月风险有什么变化？', '哪些地区抽检不合格比较多？']
  }
}

const renderGenericAnswer = (response: VoiceAssistantAskRespVO): RenderedAnswer => ({
  title: '小壹助手',
  actionTitle: '智能问答',
  content: response.voiceText || (response.success === false ? '暂未识别到可回答的问题，请换一种问法试试。' : '已完成分析。'),
  suggestions: ['4月份农产品风险情况怎么样？', '哪些地区抽检不合格比较多？', '哪些检测项目不合格最多？']
})

/** 按接口实际返回的数据块选择对应渲染器，无法识别时使用通用回答兜底。 */
const renderAnswer = (response: VoiceAssistantAskRespVO): RenderedAnswer => {
  if (response.monthReport) return renderMonthlyReport(response.monthReport, response.voiceText || '')
  if (response.regionRanking) return renderRegionRanking(response.regionRanking, response.voiceText || '')
  if (response.projectRanking) return renderProjectRanking(response.projectRanking, response.voiceText || '')
  if (response.trendCompare) return renderTrendCompare(response.trendCompare, response.voiceText || '')
  if (response.categoryReport) return renderCategoryReport(response.categoryReport, response.voiceText || '')
  return renderGenericAnswer(response)
}

/** 逐字写入回答正文或结论，并在内容增长时保持聊天区域滚动到底部。 */
const typeWriter = async (targetMsg: Message, text: string, prop: 'content' | 'conclusion') => {
  let currentText = ''
  for (let i = 0; i < text.length; i++) {
    currentText += text[i]
    targetMsg[prop] = currentText
    await new Promise(r => setTimeout(r, 18))
    scrollToBottom()
  }
}

/**\n * stopVoiceInput：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const stopVoiceInput = async () => {
  const recognizer = voiceRecognizer.value
  voiceRecognizer.value = null
  isRecording.value = false
  await recognizer?.stop()
  if (isWakeWordEnabled.value) {
    voiceStatusText.value = '正在等待唤醒词'
  } else {
    voiceStatusText.value = ''
  }
}

const VOICE_TOGGLE_DEBOUNCE_MS = 400

const releaseVoiceToggle = () => {
  window.setTimeout(() => {
    voiceTogglePending.value = false
  }, VOICE_TOGGLE_DEBOUNCE_MS)
}

const clearWakeResumeTimer = () => {
  if (wakeResumeTimer !== null) {
    window.clearTimeout(wakeResumeTimer)
    wakeResumeTimer = null
  }
}

const scheduleWakeWordResume = (sessionToken: number, delay = 250) => {
  clearWakeResumeTimer()
  wakeResumeTimer = window.setTimeout(() => {
    wakeResumeTimer = null
    if (
      !wakeWordRequested.value ||
      sessionToken !== wakeWordSessionToken.value ||
      wakeWordEngine.value ||
      voiceRecognizer.value ||
      isTyping.value ||
      isRecording.value
    ) {
      return
    }
    void startWakeWord()
  }, delay)
}

/**
 * 开关实时语音听写。
 * 听写结束后仅在唤醒会话仍有效、当前无回答生成时恢复唤醒词监听，避免重复占用麦克风。
 */
const toggleVoiceInput = async (options: { ignorePending?: boolean } = {}) => {
  if (isTyping.value || (voiceTogglePending.value && !options.ignorePending)) return

  voiceTogglePending.value = true

  if (isRecording.value) {
    await stopVoiceInput()
    releaseVoiceToggle()
    return
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    ElMessage.warning('当前浏览器不支持麦克风采集')
    releaseVoiceToggle()
    return
  }

  // 任何录音开始前都先等待唤醒引擎退出，避免两个麦克风消费者并行运行。
  if (wakeWordEngine.value) {
    const engine = wakeWordEngine.value
    wakeWordEngine.value = null
    isWakeWordEnabled.value = false
    try {
      await engine.stop()
    } catch (error) {
      const message = error instanceof Error ? error.message : '唤醒引擎停止失败'
      voiceTogglePending.value = false
      ElMessage.error(message)
      return
    }
  }

  const voiceSessionToken = wakeWordSessionToken.value
  const recognizer = new XfyunRtasrRecognizer({
    onText: (text) => {
      inputText.value = text
    },
    onStatusChange: (status, message) => {
      if (status === 'recording') {
        isRecording.value = true
      }
      if (status === 'stopped' || status === 'error') {
        isRecording.value = false
        voiceRecognizer.value = null
        if (wakeWordRequested.value && status !== 'error' && !isTyping.value) {
          voiceStatusText.value = '正在等待唤醒词'
          scheduleWakeWordResume(voiceSessionToken, 250)
          return
        }
      }
      voiceStatusText.value = message || (status === 'recording' ? '正在听写，说完后点麦克风结束' : '')
    },
    onError: (message) => {
      ElMessage.error(message)
    }
  })
  voiceRecognizer.value = recognizer

  try {
    await recognizer.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : '语音输入启动失败'
    isRecording.value = false
    voiceStatusText.value = ''
    voiceRecognizer.value = null
    ElMessage.error(message)
  } finally {
    releaseVoiceToggle()
  }
}

/**\n * updateWakeWordStatusText：执行会产生数据或文件副作用的页面操作。调用前使用当前页面状态组装参数，成功后的页面反馈和状态更新由该方法负责。\n */
const updateWakeWordStatusText = (status: WakeWordStatus, message?: string) => {
  wakeWordStatus.value = status
  if (isRecording.value && status !== 'error') return
  voiceStatusText.value = message || (isWakeWordEnabled.value ? '正在等待唤醒词' : '')
}

/** 销毁唤醒引擎并递增会话令牌，使已排队的异步恢复操作立即失效。 */
const stopWakeWord = async () => {
  clearWakeResumeTimer()
  wakeWordSessionToken.value += 1
  const engine = wakeWordEngine.value
  wakeWordEngine.value = null
  isWakeWordEnabled.value = false
  wakeWordRequested.value = false
  wakeWordStatus.value = 'stopped'
  wakeWordTranscript.value = ''
  if (!isRecording.value) {
    voiceStatusText.value = ''
  }
  try {
    await engine?.stop()
  } catch (error) {
    const message = error instanceof Error ? error.message : '唤醒引擎停止失败'
    ElMessage.error(message)
  }
}

/**
 * 启动本地唤醒词监听。
 * Windows 桌面端使用讯飞 AIKit，macOS 桌面端使用随应用分发的 Sherpa-ONNX 模型；
 * 检测到唤醒词后暂停引擎、切换到云端听写，听写结束且会话未失效时再恢复监听。
 */
const startWakeWord = async () => {
  if (isTyping.value || wakeWordEngine.value || !wakeWordRequested.value) return

  if (!isXfyunDesktopWakeWordAvailable && !navigator.mediaDevices?.getUserMedia) {
    ElMessage.warning('当前浏览器不支持麦克风采集')
    return
  }

  const engine: WakeWordEngine = isXfyunDesktopWakeWordAvailable
    ? new XfyunDesktopWakeWordEngine({
      keywords: [],
      onStatusChange: handleWakeWordStatusChange,
      onDetected: handleWakeWordDetected,
      onError: (message) => ElMessage.error(message)
    })
    : isDesktopApp
      ? new SherpaOnnxWakeWordEngine({
        keywords: DESKTOP_WAKE_WORDS,
        onStatusChange: handleWakeWordStatusChange,
        onDetected: handleWakeWordDetected,
        onError: (message) => ElMessage.error(message)
      })
      : new BrowserWakeWordEngine({
        keywords: DEFAULT_WAKE_WORDS,
        onStatusChange: handleWakeWordStatusChange,
        onDetected: handleWakeWordDetected,
        onError: (message) => ElMessage.error(message)
      })

  function handleWakeWordStatusChange(status: WakeWordStatus, message?: string) {
    if (status === 'listening') {
      isWakeWordEnabled.value = true
    }
    if (status === 'error') {
      isWakeWordEnabled.value = false
      wakeWordRequested.value = false
      wakeWordEngine.value = null
    }
    if (status === 'stopped' && wakeWordEngine.value === engine) {
      wakeWordEngine.value = null
    }
    updateWakeWordStatusText(status, message)
  }

  async function handleWakeWordDetected() {
    if (isTyping.value || isRecording.value) return
    updateWakeWordStatusText('detected', '已检测到唤醒词，正在开始听写')
    isWakeWordEnabled.value = false
    if (wakeWordEngine.value === engine) {
      wakeWordEngine.value = null
    }
    try {
      await engine.stop()
      await toggleVoiceInput({ ignorePending: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : '唤醒引擎停止失败'
      ElMessage.error(message)
    }
  }

  wakeWordEngine.value = engine

  try {
    await engine.start()
  } catch (error) {
    wakeWordEngine.value = null
    isWakeWordEnabled.value = false
    wakeWordRequested.value = false
    const message = error instanceof Error ? error.message : '唤醒模式启动失败'
    voiceStatusText.value = message
  }
}

/**\n * toggleWakeWord：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n */
const toggleWakeWord = async () => {
  if (isTyping.value || isWakeWordStarting.value) return

  if (!wakeWordRuntimeAvailable) {
    isWakeWordEnabled.value = false
    voiceStatusText.value = ''
    ElMessage.warning('当前设备不支持本地唤醒，请先使用麦克风按钮进行语音输入')
    return
  }

  if (wakeWordRequested.value) {
    await stopWakeWord()
    return
  }

  wakeWordRequested.value = true
  await startWakeWord()
}

/**
 * 发送问题并维护用户消息、思考态、逐字回答、结构化表格和结论的完整生命周期。
 * @param options.appendUser 重新生成回答时设为 false，复用上一条用户消息而不重复插入
 */
const handleSend = async (text: string, options: { appendUser?: boolean } = {}) => {
  if (!text || !text.trim() || isTyping.value) return
  await stopVoiceInput()
  if (wakeWordEngine.value) {
    const engine = wakeWordEngine.value
    wakeWordEngine.value = null
    isWakeWordEnabled.value = false
    await engine.stop()
  }

  const query = text.trim()
  inputText.value = ''
  const appendUser = options.appendUser !== false

  // 1. 添加用户消息
  if (appendUser) {
    messages.value.push({
      id: generateId(),
      role: 'user',
      content: query
    })
    scrollToBottom()
  }

  // 2. 添加 AI 思考状态消息
  isTyping.value = true
  const aiMsgId = generateId()
  const aiMsg: Message = {
    id: aiMsgId,
    role: 'assistant',
    content: '',
    status: 'thinking'
  }
  messages.value.push(aiMsg)
  scrollToBottom()

  const targetMsg = messages.value.find(m => m.id === aiMsgId)
  if (!targetMsg) return

  try {
    const response = await VoiceAssistantApi.ask(query)
    const answer = renderAnswer(response || {})

    targetMsg.status = 'typing'
    targetMsg.title = answer.title
    targetMsg.actionTitle = answer.actionTitle
    targetMsg.tableColumns = answer.tableColumns

    await typeWriter(targetMsg, answer.content, 'content')

    // 出现表格
    targetMsg.tableData = answer.tableData
    scrollToBottom()

    // 输出结论
    if (answer.conclusion) {
      await typeWriter(targetMsg, answer.conclusion, 'conclusion')
    }

    // 完成状态
    targetMsg.status = 'done'
    targetMsg.suggestions = answer.suggestions
    scrollToBottom()
  } catch (error) {
    console.error('小壹助手提问失败', error)
    targetMsg.status = 'error'
    targetMsg.title = '小壹助手'
    targetMsg.content = '抱歉，小壹暂时没有拿到结果，请稍后再试。'
    ElMessage.error('小壹助手请求失败')
  } finally {
    isTyping.value = false
    if (wakeWordRequested.value) scheduleWakeWordResume(wakeWordSessionToken.value, 250)
  }
}

/** 删除指定回答及其后消息，并使用紧邻的上一条用户问题重新请求。 */
const handleRegenerate = (id: string) => {
  // 找到上一条 user 消息
  const index = messages.value.findIndex(m => m.id === id)
  if (index > 0 && messages.value[index - 1].role === 'user') {
    const query = messages.value[index - 1].content
    // 移除从当前 AI 回答开始的所有消息
    messages.value.splice(index, messages.value.length - index)
    // 重新发送
    handleSend(query, { appendUser: false })
  }
}

onMounted(() => {
  refreshRecommends()

  // 桌面端默认进入待命状态；网页端仍需用户主动操作，避免页面加载即弹出麦克风授权。
  if (isDesktopApp && wakeWordRuntimeAvailable) {
    wakeWordRequested.value = true
    void startWakeWord()
  }
})

onBeforeUnmount(() => {
  clearWakeResumeTimer()
  void stopVoiceInput()
  const engine = wakeWordEngine.value
  wakeWordEngine.value = null
  void engine?.stop()
})
</script>

<style scoped lang="scss">
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  min-height: 640px;
  background:
    radial-gradient(circle at 18% 0%, rgba(0, 179, 237, 0.08), transparent 32%),
    linear-gradient(180deg, #f7fbfe 0%, #f2f7fb 100%);
  border: 1px solid #e6f0f6;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  font-family: 'Geist', 'Satoshi', 'HarmonyOS Sans SC', 'PingFang SC', sans-serif;
  color: #172b3a;
  isolation: isolate;
}

// 管理后台会在页面外提供顶部区域，桌面应用没有该布局，不能继续预留 90px 高度。
.ai-chat-container.is-desktop-app {
  height: 100vh;
  min-height: 0;
  border: 0;
  border-radius: 0;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  opacity: 0.35;
  transform: translate3d(0, 0, 0);
}

.ambient-a {
  top: -140px;
  left: 12%;
  width: 320px;
  height: 320px;
  background: rgba(0, 179, 237, 0.12);
  filter: blur(24px);
}

.ambient-b {
  right: 4%;
  bottom: 60px;
  width: 280px;
  height: 280px;
  background: rgba(0, 179, 237, 0.08);
  filter: blur(28px);
}

.surface-grain {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image: linear-gradient(rgba(12, 55, 80, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(12, 55, 80, 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
}

.assistant-nav {
  position: relative;
  z-index: 2;
  width: min(1120px, calc(100% - 48px));
  margin: 16px auto 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;

  strong,
  span:not(.brand-mark) {
    display: block;
  }

  strong {
    color: #172b3a;
    font-size: 15px;
    font-weight: 700;
  }

  span:not(.brand-mark) {
    margin-top: 3px;
    color: #7c8f9d;
    font-size: 12px;
  }
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #00b3ed;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(0, 179, 237, 0.22);
}

.nav-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid #e4f1f7;
  color: #087da4;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00b3ed;
  box-shadow: 0 0 0 4px rgba(0, 179, 237, 0.12);
}

.chat-main {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 18px 24px 18px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 179, 237, 0.2);
    border-radius: 999px;
  }
}

.welcome-section {
  width: min(1120px, 100%);
  margin: 0 auto;
  animation: riseIn 520ms cubic-bezier(0.32, 0.72, 0, 1) both;
}

.welcome-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid #e4f1f7;
  box-shadow: 0 12px 34px rgba(23, 59, 82, 0.06);
  overflow: hidden;
}

.hero-copy,
.hero-panel {
  position: relative;
  min-height: 226px;
  border-radius: 14px;
  overflow: hidden;
}

.hero-copy {
  padding: 30px 32px;
  background: linear-gradient(135deg, #ffffff 0%, #f5fbff 100%);
  border: 1px solid #edf5fa;

  &::after {
    content: '';
    position: absolute;
    right: -36px;
    bottom: -46px;
    width: 170px;
    height: 170px;
    border-radius: 34px;
    background: rgba(0, 179, 237, 0.06);
    transform: rotate(18deg);
  }

  h1 {
    position: relative;
    z-index: 1;
    max-width: 620px;
    margin: 12px 0 14px;
    color: #102b3b;
    font-size: clamp(28px, 3vw, 40px);
    line-height: 1.22;
    letter-spacing: -0.04em;
    font-weight: 800;
  }

  p {
    position: relative;
    z-index: 1;
    max-width: 640px;
    margin: 0;
    color: #657888;
    font-size: 15px;
    line-height: 1.8;
  }
}

.assistant-kicker {
  position: relative;
  z-index: 1;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(0, 179, 237, 0.09);
  color: #007da6;
  font-size: 12px;
  font-weight: 700;
}

.hero-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.primary-action,
.secondary-action {
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 240ms ease,
    box-shadow 240ms ease,
    background 240ms ease;

  &:active {
    transform: scale(0.98);
  }
}

.primary-action {
  background: #00b3ed;
  color: #fff;
  box-shadow: 0 10px 20px rgba(0, 179, 237, 0.18);

  i {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
  }

  &:hover {
    transform: translate3d(0, -2px, 0);
    box-shadow: 0 14px 24px rgba(0, 179, 237, 0.22);
  }
}

.secondary-action {
  background: #fff;
  color: #31495a;
  border: 1px solid #dcecf4;

  &:hover {
    transform: translate3d(0, -2px, 0);
    border-color: rgba(0, 179, 237, 0.28);
  }
}

.hero-panel {
  padding: 24px;
  background: linear-gradient(180deg, #f3fbff 0%, #ffffff 100%);
  border: 1px solid #dff0f8;
  color: #172b3a;
}

.assistant-card-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-orbit {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(0, 179, 237, 0.12);
}

.ai-avatar {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #00b3ed;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
}

.panel-copy {
  span {
    color: #7c8f9d;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 4px;
    font-size: 17px;
    line-height: 1.4;
  }
}

.answer-preview {
  margin-top: 22px;
  padding: 16px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e6f1f7;

  p {
    margin: 0 0 8px;
    color: #123245;
    font-size: 16px;
    font-weight: 700;
  }

  span {
    color: #657888;
    font-size: 13px;
    line-height: 1.7;
  }
}

.capability-stack {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;

  div {
    padding: 10px;
    border-radius: 12px;
    background: rgba(0, 179, 237, 0.06);
    border: 1px solid rgba(0, 179, 237, 0.1);
  }

  span,
  strong {
    display: block;
  }

  span {
    color: #7c8f9d;
    font-size: 12px;
  }

  strong {
    margin-top: 4px;
    font-size: 13px;
    color: #172b3a;
  }
}

.recommend-section {
  margin-top: 14px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #e4f1f7;
  box-shadow: 0 10px 28px rgba(23, 59, 82, 0.05);
}

.recommend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 0 12px;

  span {
    color: #7c8f9d;
    font-size: 13px;
  }

  h4 {
    margin: 0 0 4px;
    color: #172b3a;
    font-size: 17px;
    font-weight: 700;
  }
}

.refresh-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(0, 179, 237, 0.08);
  color: #087da4;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 240ms ease,
    background 240ms ease;

  &:hover {
    transform: translate3d(0, -2px, 0);
    background: rgba(0, 179, 237, 0.13);
  }
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 10px;
}

.recommend-item {
  position: relative;
  min-height: 70px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e7f0f5;
  color: #263f50;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  transition:
    transform 240ms ease,
    box-shadow 240ms ease,
    border-color 240ms ease,
    color 240ms ease;

  &:nth-child(1) {
    grid-column: span 6;
  }

  &:nth-child(2) {
    grid-column: span 6;
  }

  &:nth-child(3),
  &:nth-child(4),
  &:nth-child(5) {
    grid-column: span 4;
  }

  &::before {
    content: none;
  }

  i {
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(0, 179, 237, 0.08);
    color: #00b3ed;
  }

  &:hover {
    transform: translate3d(0, -2px, 0);
    border-color: rgba(0, 179, 237, 0.32);
    color: #0089b7;
    box-shadow: 0 8px 18px rgba(23, 59, 82, 0.08);

    i {
      background: #00b3ed;
      color: #fff;
    }
  }
}

.message-list {
  width: min(960px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px 0 24px;
}

.message-item {
  display: flex;
  width: 100%;
  animation: riseIn 560ms cubic-bezier(0.32, 0.72, 0, 1) both;
}

.is-user {
  justify-content: flex-end;

  .user-bubble {
    background: #00b3ed;
    color: #fff;
    border-radius: 16px 16px 4px 16px;
    padding: 12px 16px;
    font-size: 14px;
    max-width: 80%;
    line-height: 1.7;
    box-shadow: 0 10px 22px rgba(0, 179, 237, 0.16);
  }
}

.is-assistant {
  justify-content: flex-start;

  .message-wrapper {
    max-width: 92%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.thinking-box {
  width: fit-content;
  background: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #0089b7;
  font-size: 14px;
  border: 1px solid #dcecf4;
  box-shadow: 0 8px 20px rgba(23, 59, 82, 0.06);
}

.action-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .step-item {
    background: #fff;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 13px;
    color: #24485a;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #dcecf4;
    align-self: flex-start;
  }

  .step-desc {
    font-size: 12px;
    color: rgba(11, 37, 53, 0.46);
    padding-left: 14px;
  }
}

.ai-bubble {
  background: #fff;
  border: 1px solid #e3eef5;
  border-radius: 4px 16px 16px 16px;
  padding: 22px;
  box-shadow: 0 10px 28px rgba(23, 59, 82, 0.06);

  .rich-content {
    .report-title {
      font-size: 18px;
      color: #172b3a;
      margin: 0 0 14px 0;
      font-weight: 700;
    }

    p {
      margin: 0 0 16px 0;
      color: #435b6b;
      font-size: 15px;
      line-height: 1.8;
    }

    .report-table {
      margin: 16px 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #dcecf4;

      :deep(.el-table) {
        --el-table-border-color: rgba(0, 179, 237, 0.12);
        --el-table-header-bg-color: rgba(0, 179, 237, 0.08);
        color: #17394b;
      }
    }

    .report-conclusion {
      margin-bottom: 0;
      background: #f3fbff;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid rgba(0, 179, 237, 0.16);
    }
  }

  .message-footer {
    margin-top: 20px;
    padding-top: 14px;
    border-top: 1px solid #e8f2f7;

    .regenerate-btn {
      color: #0089b7;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 16px;
      transition: transform 620ms cubic-bezier(0.32, 0.72, 0, 1);

      &:hover {
        transform: translate3d(0, -1px, 0);
      }
    }

    .follow-up-section {
      .follow-up-title {
        font-size: 13px;
        color: rgba(11, 37, 53, 0.46);
        margin-bottom: 12px;
      }

      .follow-up-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .follow-up-pill {
          background: rgba(255, 255, 255, 0.74);
          border: 1px solid #dcecf4;
          color: #24485a;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 620ms cubic-bezier(0.32, 0.72, 0, 1),
            color 620ms cubic-bezier(0.32, 0.72, 0, 1),
            border-color 620ms cubic-bezier(0.32, 0.72, 0, 1);

          &:hover {
            transform: translate3d(0, -2px, 0);
            border-color: rgba(0, 179, 237, 0.35);
            color: #0089b7;
          }
        }
      }
    }
  }
}

.chat-footer {
  position: relative;
  z-index: 2;
  background: rgba(247, 251, 254, 0.94);
  border-top: 1px solid #e6f0f6;
  padding: 14px 24px 18px;
  display: flex;
  justify-content: center;

  .input-wrapper {
    position: relative;
    width: 100%;
    max-width: 1120px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 26px rgba(23, 59, 82, 0.06);
    border: 1px solid #dcecf4;
    transition:
      border-color 240ms ease,
      box-shadow 240ms ease;

    &:focus-within {
      border-color: rgba(0, 179, 237, 0.42);
      box-shadow: 0 12px 28px rgba(0, 179, 237, 0.12);
    }

    :deep(.el-textarea__inner) {
      border: none;
      box-shadow: none;
      min-height: 84px !important;
      padding: 16px 132px 16px 18px;
      color: #172b3a;
      font-size: 15px;
      line-height: 1.7;
      background: transparent;
      font-family: inherit;

      &:focus {
        box-shadow: none;
      }

      &::placeholder {
        color: #a2b0ba;
      }
    }

    :deep(.el-input__count) {
      bottom: 12px;
      right: 52px;
      background: transparent;
      color: #a2b0ba;
    }

    .voice-btn,
    .send-btn {
      position: absolute;
      bottom: 14px;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8da0ac;
      cursor: not-allowed;
      transition:
        transform 240ms ease,
        background 240ms ease,
        color 240ms ease;
    }

    .voice-btn {
      padding: 0;
      border: 0;
      font: inherit;
      right: 60px;
      appearance: none;
      cursor: pointer;

      &:hover {
        color: #0089b7;
        background: rgba(0, 179, 237, 0.09);
        transform: translate3d(0, -2px, 0);
      }

      &.active {
        color: #fff;
        background: #f05b72;

        &:hover {
          background: #e94962;
        }
      }

      &.disabled,
      &:disabled {
        color: rgba(11, 37, 53, 0.28);
        background: transparent;
        cursor: not-allowed;
      }

      &.pending {
        color: #00b3ed;
        background: rgba(0, 179, 237, 0.09);
      }
    }

    .wake-btn {
      right: 52px;
    }

    .send-btn {
      right: 16px;
      background: rgba(0, 179, 237, 0.08);

      &.active {
        color: #fff;
        background: #00b3ed;
        cursor: pointer;
        box-shadow: 0 8px 18px rgba(0, 179, 237, 0.22);

        &:hover {
          transform: translate3d(3px, -2px, 0) scale(1.04);
          background: #009ed1;
        }
      }
    }

    .voice-status {
      position: absolute;
      left: 16px;
      bottom: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #7c8f9d;
      font-size: 12px;

      &.recording {
        color: #f56c6c;
      }
    }

    .voice-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .wake-debug-chip {
      position: absolute;
      right: 16px;
      top: -28px;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(0, 179, 237, 0.12);
      color: #00b3ed;
      font-size: 12px;
      line-height: 20px;

      &.unsupported {
        background: rgba(245, 108, 108, 0.12);
        color: #f56c6c;
      }
    }
  }
}

// 桌面端额外显示唤醒按钮，三个图标按固定位置排列，字符计数避开图标区域。
.ai-chat-container.is-desktop-app .chat-footer .input-wrapper {
  :deep(.el-textarea__inner) {
    padding-right: 176px;
  }

  :deep(.el-input__count) {
    right: 102px;
  }

  .voice-btn:not(.wake-btn) {
    right: 104px;
  }

  .wake-btn {
    right: 60px;
  }
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translate3d(0, 28px, 0) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (max-width: 1180px) {
  .welcome-card {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    min-height: 260px;
  }
}

@media (max-width: 900px) {
  .ai-chat-container {
    height: calc(100vh - 88px);
    min-height: 620px;
    border-radius: 16px;
  }

  .assistant-nav {
    width: calc(100% - 32px);
  }

  .chat-main {
    padding: 20px 16px;
  }

  .hero-copy {
    padding: 30px 24px;

    h1 {
      font-size: clamp(30px, 9vw, 42px);
    }
  }

  .recommend-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .recommend-item,
  .recommend-item:nth-child(1),
  .recommend-item:nth-child(2),
  .recommend-item:nth-child(3),
  .recommend-item:nth-child(4),
  .recommend-item:nth-child(5) {
    grid-column: span 6;
  }

  .chat-footer {
    padding: 14px 16px 18px;
  }

  .message-list {
    width: 100%;
  }

  .is-assistant .message-wrapper,
  .is-user .user-bubble {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .assistant-nav {
    align-items: flex-start;
    border-radius: 24px;
  }

  .nav-status {
    display: none;
  }

  .capability-stack {
    grid-template-columns: 1fr;
  }

  .recommend-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .chat-footer .input-wrapper {
    :deep(.el-textarea__inner) {
      padding-right: 116px;
    }
  }
}
</style>
