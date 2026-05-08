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

            <!-- 执行过程状态展示 (模拟工具调用) -->
            <div v-if="msg.status === 'typing' || msg.status === 'done'" class="action-steps">
              <div class="step-item"><Icon icon="ep:document" /> 一份农产品分析报告</div>
              <div class="step-desc">正在回答中...</div>
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
                    <el-table-column prop="index" label="序号" width="60" align="center" />
                    <el-table-column prop="city" label="州级" min-width="120" />
                    <el-table-column prop="district" label="县级" min-width="120" />
                    <el-table-column prop="unit" label="单位" min-width="150" />
                    <el-table-column prop="tester" label="检测人" width="80" />
                    <el-table-column prop="time" label="检测时间" width="100" />
                  </el-table>
                </div>
                
                <!-- 结论富文本 -->
                <p v-if="msg.conclusion" class="report-conclusion" v-html="msg.conclusion"></p>
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
          @keydown.enter.prevent="handleSend(inputText)"
        />
        <div class="send-btn" :class="{ active: inputText.trim() && !isTyping }" @click="handleSend(inputText)">
          <Icon icon="ep:position" :size="20" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

defineOptions({ name: 'ChatAssistant' })

// --- 推荐问题数据 ---
const allRecommends = [
  '你好小壹，4月份北京地区农产品风险情况怎么样？',
  '你好小壹，哪些地区抽检不合格比较多？',
  '你好小壹，哪些检测项目不合格最多？',
  '你好小壹，对比上个月，这个月的风险有什么变化？',
  '你好小壹，蔬菜类的风险情况怎么样？',
  '生成一份第一季度的质量安全分析报告',
  '帮我查一下寿光市最近一周的抽检数据',
  '当前高频不合格农药主要是哪些？'
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
  tableData?: any[]
  conclusion?: string
  suggestions?: string[]
}

const messages = ref<Message[]>([])
const inputText = ref('')
const isTyping = ref(false)
const chatMainRef = ref<HTMLElement | null>(null)

// --- 工具函数 ---
const scrollToBottom = async () => {
  await nextTick()
  if (chatMainRef.value) {
    chatMainRef.value.scrollTop = chatMainRef.value.scrollHeight
  }
}

// 格式化换行
const formatContent = (text: string) => {
  return text.replace(/\n/g, '<br/>')
}

const generateId = () => Math.random().toString(36).substring(2, 9)

// --- 核心交互逻辑 ---
const handleSend = async (text: string) => {
  if (!text || !text.trim() || isTyping.value) return
  
  const query = text.trim()
  inputText.value = ''
  
  // 1. 添加用户消息
  messages.value.push({
    id: generateId(),
    role: 'user',
    content: query
  })
  scrollToBottom()

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

  // 3. 模拟网络请求与思考延迟
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 4. 开始流式输出
  const targetMsg = messages.value.find(m => m.id === aiMsgId)
  if (targetMsg) {
    targetMsg.status = 'typing'
    
    // 模拟一段硬编码的回复 (符合截图展示效果)
    const mockTitle = '4月份北京市地区农产品风险情况'
    const mockIntro = '根据输出结果，已成功统计出高风险样品排名前3名，具体信息如下：'
    const mockTable = [
      { index: 1, city: '保山市农业农村局', district: '保山市农业农村局', unit: '保山市农业农村局', tester: '王磊', time: '2026-04-20' },
      { index: 2, city: '保山市农业农村局', district: '保山市农业农村局', unit: '保山市农业农村局', tester: '李娜', time: '2026-04-21' },
      { index: 3, city: '保山市农业农村局', district: '保山市农业农村局', unit: '保山市农业农村局', tester: '张强', time: '2026-04-22' }
    ]
    const mockConclusion = '从结果上看，最近一个月高风险样品前三名分别为<span style="color: #00B3ED; font-weight: bold;">芹菜、菠菜、萝卜</span>。阳性指标包括：<span style="color: #00B3ED; font-weight: bold;">噻虫胺、啶虫脒</span>；其中，最高风险样品为<span style="color: #00B3ED; font-weight: bold;">芹菜</span>，共检测<span style="color: #00B3ED; font-weight: bold;">5个</span>样品、<span style="color: #00B3ED; font-weight: bold;">10个</span>检测项目，共检<span style="color: #00B3ED; font-weight: bold;">65</span>项次，样品阳性率<span style="color: #00B3ED; font-weight: bold;">3%</span>、检测项阳性率<span style="color: #00B3ED; font-weight: bold;">2%</span>。'
    const mockSuggestions = [
      '可以在报告中增加一些具体的建议吗',
      '对比上个月的数据有什么明显变化？',
      '导出这份分析报告'
    ]

    targetMsg.title = mockTitle
    
    // 模拟打字机效果
    const typeWriter = async (text: string, prop: 'content' | 'conclusion') => {
      let currentText = ''
      // 按字符切割，包括HTML标签作为一个整体处理
      const parts = text.split(/(<[^>]+>)/g)
      for (const part of parts) {
        if (part.startsWith('<')) {
           currentText += part
           targetMsg[prop] = currentText
        } else {
          for (let i = 0; i < part.length; i++) {
            currentText += part[i]
            targetMsg[prop] = currentText
            await new Promise(r => setTimeout(r, 30)) // 打字速度
            scrollToBottom()
          }
        }
      }
    }

    await typeWriter(mockIntro, 'content')
    
    // 出现表格
    targetMsg.tableData = mockTable
    scrollToBottom()
    await new Promise(resolve => setTimeout(resolve, 500))

    // 输出结论
    await typeWriter(mockConclusion, 'conclusion')

    // 完成状态
    targetMsg.status = 'done'
    targetMsg.suggestions = mockSuggestions
    isTyping.value = false
    scrollToBottom()
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
    handleSend(query)
  }
}

onMounted(() => {
  refreshRecommends()
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
      padding: 16px 50px 16px 16px;
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

    .send-btn {
      position: absolute;
      right: 12px;
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

      &.active {
        color: #fff;
        background: #00B3ED;
        cursor: pointer;

        &:hover {
          background: #0099cc;
        }
      }
    }
  }
}
</style>
