<template>
  <div class="ai-chat-container">
    <!-- 聊天内容区域 -->
    <div class="chat-main" ref="chatMainRef">
      <!-- 初始欢迎及推荐区域 (仅在没有对话时显示) -->
      <div v-if="messages.length === 0" class="welcome-section">
        <!-- 欢迎卡片 -->
        <div class="welcome-card">
          <div class="avatar-wrap">
            <div class="ai-avatar">小壹</div>
          </div>
          <div class="welcome-text">
            <h3>嗨！你好呀 我是你的小壹助手~</h3>
            <p>初次见面，为了我们未来合作的更默契，先了解一下我的能力</p>
          </div>
        </div>

        <!-- 推荐提问 -->
        <div class="recommend-section">
          <div class="recommend-header">
            <h4>为您推荐</h4>
            <span class="refresh-btn" @click="refreshRecommends">
              <Icon icon="ep:refresh" /> 换一批
            </span>
          </div>
          <div class="recommend-grid">
            <div 
              v-for="(item, index) in currentRecommends" 
              :key="index" 
              class="recommend-item"
              @click="handleSend(item)"
            >
              {{ item }}
            </div>
          </div>
        </div>
      </div>

      <!-- 对话列表 -->
      <div class="message-list">
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          :class="['message-item', `is-${msg.role}`]"
        >
          <!-- 用户消息 -->
          <div v-if="msg.role === 'user'" class="message-bubble user-bubble">
            {{ msg.content }}
          </div>

          <!-- AI消息 -->
          <div v-else class="message-wrapper">
            <!-- 思考状态 -->
            <div v-if="msg.status === 'thinking'" class="thinking-box">
              <Icon icon="ep:loading" class="is-loading" />
              <span>小壹正在思考中...</span>
            </div>

            <!-- 执行过程状态展示 -->
            <div v-if="msg.status === 'typing' || msg.status === 'done'" class="action-steps">
              <div class="step-item"><Icon icon="ep:document" /> {{ msg.actionTitle || '农产品风险分析' }}</div>
              <div class="step-desc">{{ msg.status === 'done' ? '已生成回答' : '正在回答中...' }}</div>
            </div>

            <!-- AI 回答气泡 -->
            <div v-if="msg.content || msg.tableData" class="message-bubble ai-bubble">
              <div class="rich-content">
                <!-- 标题 -->
                <h4 v-if="msg.title" class="report-title">{{ msg.title }}</h4>
                <!-- 文本流式输出 -->
                <p v-html="formatContent(msg.content)"></p>
                
                <!-- 表格数据展示 -->
                <div v-if="msg.tableData && msg.tableData.length" class="report-table">
                  <el-table :data="msg.tableData" border style="width: 100%" size="small">
                    <el-table-column
                      v-for="column in msg.tableColumns"
                      :key="column.prop"
                      :prop="column.prop"
                      :label="column.label"
                      :width="column.width"
                      :min-width="column.minWidth"
                      :align="column.align"
                    />
                  </el-table>
                </div>
                
                <!-- 结论富文本 -->
                <p v-if="msg.conclusion" class="report-conclusion" v-html="formatContent(msg.conclusion)"></p>
              </div>

              <!-- 底部操作与追问 -->
              <div v-if="msg.status === 'done'" class="message-footer">
                <div class="regenerate-btn" @click="handleRegenerate(msg.id)">
                  <Icon icon="ep:refresh-right" /> 重新生成
                </div>
                
                <div v-if="msg.suggestions && msg.suggestions.length" class="follow-up-section">
                  <div class="follow-up-title">你可以继续问我：</div>
                  <div class="follow-up-list">
                    <span 
                      v-for="(sug, idx) in msg.suggestions" 
                      :key="idx" 
                      class="follow-up-pill"
                      @click="handleSend(sug)"
                    >
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

    <!-- 底部输入区域 -->
    <div class="chat-footer">
      <div class="input-wrapper">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="3"
          placeholder="可以问我任何问题，帮你解答"
          resize="none"
          maxlength="100"
          show-word-limit
          @keydown.enter.exact.prevent="handleSend(inputText)"
        />
        <div
          class="voice-btn"
          :class="{ active: isRecording, disabled: isTyping }"
          :title="voiceButtonTitle"
          @click="toggleVoiceInput"
        >
          <Icon :icon="isRecording ? 'ep:video-pause' : 'ep:microphone'" :size="20" />
        </div>
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
import { XfyunRtasrRecognizer } from '@/api/agri/voiceAssistant/xfyunRtasr'

defineOptions({ name: 'ChatAssistant' })

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
const voiceStatusText = ref('')
const voiceRecognizer = ref<XfyunRtasrRecognizer | null>(null)
const chatMainRef = ref<HTMLElement | null>(null)

const voiceButtonTitle = computed(() => {
  if (isTyping.value) return '小壹正在回答中'
  return isRecording.value ? '停止语音输入' : '语音输入'
})

// --- 工具函数 ---
const scrollToBottom = async () => {
  await nextTick()
  if (chatMainRef.value) {
    chatMainRef.value.scrollTop = chatMainRef.value.scrollHeight
  }
}

// 格式化换行
const formatContent = (text: string) => {
  return escapeHtml(text || '').replace(/\n/g, '<br/>')
}

const generateId = () => Math.random().toString(36).substring(2, 9)

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

const formatPercent = (value?: number) => {
  return value === undefined || value === null ? '--' : `${value}%`
}

const formatNumber = (value?: number) => {
  return value === undefined || value === null ? '--' : value
}

const joinNames = (values?: string[]) => {
  return values?.length ? values.join('、') : '--'
}

const getHazardText = (item: { restrictionLabel?: string; restrictionType?: string }) => {
  return item.restrictionLabel || item.restrictionType || '--'
}

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

const renderAnswer = (response: VoiceAssistantAskRespVO): RenderedAnswer => {
  if (response.monthReport) return renderMonthlyReport(response.monthReport, response.voiceText || '')
  if (response.regionRanking) return renderRegionRanking(response.regionRanking, response.voiceText || '')
  if (response.projectRanking) return renderProjectRanking(response.projectRanking, response.voiceText || '')
  if (response.trendCompare) return renderTrendCompare(response.trendCompare, response.voiceText || '')
  if (response.categoryReport) return renderCategoryReport(response.categoryReport, response.voiceText || '')
  return renderGenericAnswer(response)
}

const typeWriter = async (targetMsg: Message, text: string, prop: 'content' | 'conclusion') => {
  let currentText = ''
  for (let i = 0; i < text.length; i++) {
    currentText += text[i]
    targetMsg[prop] = currentText
    await new Promise(r => setTimeout(r, 18))
    scrollToBottom()
  }
}

const stopVoiceInput = () => {
  voiceRecognizer.value?.stop()
  voiceRecognizer.value = null
  isRecording.value = false
  voiceStatusText.value = ''
}

const toggleVoiceInput = async () => {
  if (isTyping.value) return

  if (isRecording.value) {
    stopVoiceInput()
    return
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    ElMessage.warning('当前浏览器不支持麦克风采集')
    return
  }

  voiceRecognizer.value = new XfyunRtasrRecognizer({
    onText: (text) => {
      inputText.value = text
    },
    onStatusChange: (status, message) => {
      if (status === 'recording') {
        isRecording.value = true
      }
      if (status === 'stopped' || status === 'error') {
        isRecording.value = false
      }
      voiceStatusText.value = message || (status === 'recording' ? '正在听写，说完后点麦克风结束' : '')
    },
    onError: (message) => {
      ElMessage.error(message)
    }
  })

  try {
    await voiceRecognizer.value.start()
  } catch (error) {
    const message = error instanceof Error ? error.message : '语音输入启动失败'
    isRecording.value = false
    voiceStatusText.value = ''
    voiceRecognizer.value = null
    ElMessage.error(message)
  }
}

// --- 核心交互逻辑 ---
const handleSend = async (text: string, options: { appendUser?: boolean } = {}) => {
  if (!text || !text.trim() || isTyping.value) return
  stopVoiceInput()
  
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
  }
}

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
})

onBeforeUnmount(() => {
  stopVoiceInput()
})
</script>

<style scoped lang="scss">
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background-color: #f2f7fb;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.chat-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
  }
}

/* 欢迎区域 */
.welcome-section {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .avatar-wrap {
    .ai-avatar {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #00B3ED, #0084ff);
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .welcome-text {
    h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }
    p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
  }
}

.recommend-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .recommend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 15px;
      color: #333;
    }

    .refresh-btn {
      color: #666;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.3s;
      &:hover { color: #00B3ED; }
    }
  }

  .recommend-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .recommend-item {
      background: #f4f6f8;
      border: 1px solid #ebeef5;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #00B3ED;
        color: #00B3ED;
        background: #f0faff;
      }
    }
  }
}

/* 聊天列表 */
.message-list {
  max-width: 880px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
}

.message-item {
  display: flex;
  width: 100%;
}

.is-user {
  justify-content: flex-end;

  .user-bubble {
    background: #00B3ED;
    color: #fff;
    border-radius: 16px 16px 4px 16px;
    padding: 12px 20px;
    font-size: 14px;
    max-width: 80%;
    line-height: 1.5;
    box-shadow: 0 2px 8px rgba(0, 179, 237, 0.2);
  }
}

.is-assistant {
  justify-content: flex-start;
  
  .message-wrapper {
    max-width: 85%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

/* AI 状态和过程 */
.thinking-box {
  background: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #00B3ED;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.action-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .step-item {
    background: #fff;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 13px;
    color: #606266;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid #ebeef5;
    align-self: flex-start;
  }

  .step-desc {
    font-size: 12px;
    color: #999;
    padding-left: 8px;
  }
}

/* AI 回答气泡 */
.ai-bubble {
  background: #fff;
  border-radius: 4px 16px 16px 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .rich-content {
    .report-title {
      font-size: 16px;
      color: #1f2d3d;
      margin: 0 0 16px 0;
    }
    
    p {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 14px;
      line-height: 1.6;
    }

    .report-table {
      margin: 20px 0;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #ebeef5;
    }

    .report-conclusion {
      margin-bottom: 0;
      background: #f8fbff;
      padding: 16px;
      border-radius: 6px;
      border-left: 4px solid #00B3ED;
    }
  }

  .message-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f2f5;

    .regenerate-btn {
      color: #00B3ED;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 16px;
      
      &:hover { opacity: 0.8; }
    }

    .follow-up-section {
      .follow-up-title {
        font-size: 13px;
        color: #999;
        margin-bottom: 12px;
      }
      .follow-up-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        .follow-up-pill {
          background: #fff;
          border: 1px solid #dcdfe6;
          color: #606266;
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #00B3ED;
            color: #00B3ED;
          }
        }
      }
    }
  }
}

/* 底部输入区 */
.chat-footer {
  background: #f2f7fb;
  padding: 16px 24px;
  display: flex;
  justify-content: center;

  .input-wrapper {
    position: relative;
    width: 100%;
    max-width: 880px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid #ebeef5;
    transition: border-color 0.3s;

    &:focus-within {
      border-color: #00B3ED;
    }

    :deep(.el-textarea__inner) {
      border: none;
      box-shadow: none;
      padding: 16px 92px 16px 16px;
      font-size: 14px;
      background: transparent;
      
      &:focus {
        box-shadow: none;
      }
    }

    :deep(.el-input__count) {
      bottom: 8px;
      right: 12px;
      background: transparent;
    }

    .voice-btn,
    .send-btn {
      position: absolute;
      bottom: 12px;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a8abb2;
      cursor: not-allowed;
      transition: all 0.3s;
    }

    .voice-btn {
      right: 52px;
      cursor: pointer;

      &:hover {
        color: #00B3ED;
        background: #f0faff;
      }

      &.active {
        color: #fff;
        background: #f56c6c;

        &:hover {
          background: #e64b4b;
        }
      }

      &.disabled {
        color: #c0c4cc;
        background: transparent;
        cursor: not-allowed;
      }
    }

    .send-btn {
      right: 12px;

      &.active {
        color: #fff;
        background: #00B3ED;
        cursor: pointer;

        &:hover {
          background: #0099cc;
        }
      }
    }

    .voice-status {
      position: absolute;
      left: 16px;
      bottom: -28px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #909399;
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
  }
}
</style>
