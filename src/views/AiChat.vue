<template>
  <div class="ai-chat-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><ChatLineSquare /></el-icon>
        AI助手
      </h1>
      <p class="page-subtitle">智能问答、论坛帮助、友好互动</p>
    </div>

    <!-- 权限提示 -->
    <div v-if="!userStore.isAdmin" class="permission-denied anime-card">
      <el-icon class="warning-icon"><Warning /></el-icon>
      <h3>权限不足</h3>
      <p>AI聊天功能仅对管理员开放</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>

    <!-- 未登录提示 -->
    <div v-else-if="!userStore.isLoggedIn" class="login-tip anime-card">
      <el-icon class="login-icon"><UserFilled /></el-icon>
      <h3>请先登录</h3>
      <p>AI聊天功能需要登录后使用</p>
      <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
    </div>

    <!-- 聊天界面 -->
    <div v-else class="chat-container anime-card">
      <!-- 聊天窗口 -->
      <div class="chat-window">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <h2>
            <el-icon class="ai-icon"><ChatDotRound /></el-icon>
            AI助手
          </h2>
          <el-button 
            type="text" 
            class="clear-btn" 
            @click="handleClearHistory"
            :disabled="messages.length === 1"
          >
            <el-icon><Delete /></el-icon>
            清空记录
          </el-button>
        </div>

        <!-- 消息列表 -->
        <div class="message-list" ref="messageList">
          <!-- 系统消息 -->
          <div v-if="messages.length === 1" class="system-message">
            <el-icon class="system-icon"><InfoFilled /></el-icon>
            <p>你好！我是论坛的AI助手，很高兴为你服务！</p>
            <p>你可以问我关于论坛的问题，或者和我随便聊聊。</p>
          </div>

          <!-- 消息项 -->
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            :class="['message-item', message.role]"
          >
            <!-- 头像 -->
            <div class="message-avatar">
              <el-avatar :size="36" :class="message.role">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </el-avatar>
            </div>

            <!-- 消息内容 -->
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-message">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>AI 正在思考...</span>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            maxlength="1000"
            show-word-limit
            @keyup.enter.exact="handleSend"
          />
          <div class="input-actions">
            <span class="char-count">{{ inputMessage.length }}/1000</span>
            <el-button 
              type="primary" 
              :loading="loading"
              @click="handleSend"
              :disabled="!inputMessage.trim() || loading"
            >
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * AI聊天页面组件
 * 功能：与AI助手进行实时对话，支持多轮对话，只有管理员可使用
 */
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { aiApi } from '@/api'
import { ElMessage } from 'element-plus'
import {
  ChatLineSquare,
  ChatDotRound,
  Delete,
  UserFilled,
  Warning,
  InfoFilled,
  Loading
} from '@element-plus/icons-vue'
import { formatTime } from '@/utils/time'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 消息列表 */
const messages = ref([])

/** 输入消息 */
const inputMessage = ref('')

/** 加载状态 */
const loading = ref(false)

/** 消息列表DOM引用 */
const messageList = ref(null)

// ==================== 方法定义 ====================

/**
 * 初始化聊天历史
 */
const initChatHistory = () => {
  // 从本地存储加载历史记录
  const savedHistory = localStorage.getItem('aiChatHistory')
  if (savedHistory) {
    try {
      messages.value = JSON.parse(savedHistory)
    } catch (error) {
      console.error('加载聊天历史失败:', error)
      // 初始化默认消息
      messages.value = [
        {
          role: 'assistant',
          content: '你好！我是论坛的AI助手，很高兴为你服务！有什么我可以帮助你的吗？',
          timestamp: new Date().toISOString()
        }
      ]
    }
  } else {
    // 初始化默认消息
    messages.value = [
      {
        role: 'assistant',
        content: '你好！我是论坛的AI助手，很高兴为你服务！有什么我可以帮助你的吗？',
        timestamp: new Date().toISOString()
      }
    ]
  }
}

/**
 * 保存聊天历史到本地存储
 */
const saveChatHistory = () => {
  localStorage.setItem('aiChatHistory', JSON.stringify(messages.value))
}

/**
 * 滚动到消息底部
 */
const scrollToBottom = async () => {
  await nextTick()
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}

/**
 * 发送消息
 */
const handleSend = async () => {
  const message = inputMessage.value.trim()
  if (!message || loading.value) return

  // 添加用户消息
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)
  inputMessage.value = ''
  saveChatHistory()
  scrollToBottom()

  // 准备历史对话记录
  const history = messages.value.slice(0, -1).map(msg => ({
    role: msg.role,
    content: msg.content
  }))

  try {
    loading.value = true
    
    // 调用AI聊天API
    const response = await aiApi.chat({
      message,
      history
    })

    // 添加AI回复
    const aiMessage = {
      role: 'assistant',
      content: response.data.reply,
      timestamp: new Date().toISOString()
    }
    messages.value.push(aiMessage)
    saveChatHistory()
    scrollToBottom()

  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送失败，请稍后重试')
    
    // 移除用户消息
    messages.value.pop()
    saveChatHistory()
  } finally {
    loading.value = false
  }
}

/**
 * 清空聊天历史
 */
const handleClearHistory = () => {
  // 重置为初始状态
  messages.value = [
    {
      role: 'assistant',
      content: '你好！我是论坛的AI助手，很高兴为你服务！有什么我可以帮助你的吗？',
      timestamp: new Date().toISOString()
    }
  ]
  saveChatHistory()
  ElMessage.success('聊天记录已清空')
}

// ==================== 生命周期 ====================

onMounted(() => {
  initChatHistory()
  scrollToBottom()
})

// 监听消息变化，自动滚动到底部
watch(messages, () => {
  scrollToBottom()
}, { deep: true })
</script>

<style lang="scss" scoped>
.ai-chat-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .page-header {
    margin-bottom: 24px;
    text-align: center;

    .page-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #fff;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .page-subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
    }
  }

  .permission-denied,
  .login-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    text-align: center;

    .warning-icon,
    .login-icon {
      font-size: 48px;
      margin-bottom: 20px;
      color: #ff6b9d;
    }

    h3 {
      color: #fff;
      font-size: 20px;
      margin-bottom: 12px;
    }

    p {
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 24px;
    }
  }

  .chat-container {
    padding: 0;
    overflow: hidden;
  }

  .chat-window {
    display: flex;
    flex-direction: column;
    height: 800px;

    .chat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;

        .ai-icon {
          color: #ff6b9d;
        }
      }

      .clear-btn {
        color: rgba(255, 255, 255, 0.5);

        &:hover {
          color: #ff6b9d;
        }
      }
    }

    .message-list {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.02);

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

      .system-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 30px;
        margin-bottom: 20px;
        background: rgba(255, 107, 157, 0.1);
        border-radius: 12px;

        .system-icon {
          font-size: 32px;
          color: #ff6b9d;
          margin-bottom: 16px;
        }

        p {
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          line-height: 1.6;
        }
      }

      .message-item {
        display: flex;
        margin-bottom: 20px;

        &.user {
          flex-direction: row-reverse;

          .message-content {
            align-items: flex-end;

            .message-text {
              background: linear-gradient(135deg, #ff6b9d, #c44eff);
              color: #fff;
              border-radius: 12px 12px 4px 12px;
            }
          }
        }

        &.assistant {
          .message-content {
            align-items: flex-start;

            .message-text {
              background: rgba(255, 255, 255, 0.1);
              color: rgba(255, 255, 255, 0.9);
              border-radius: 12px 12px 12px 4px;
            }
          }
        }

        .message-avatar {
          margin: 0 12px;

          .el-avatar {
            &.user {
              background: linear-gradient(135deg, #00d4ff, #c44eff);
            }

            &.assistant {
              background: linear-gradient(135deg, #ff6b9d, #c44eff);
            }
          }
        }

        .message-content {
          display: flex;
          flex-direction: column;
          max-width: 70%;

          .message-text {
            padding: 12px 16px;
            line-height: 1.6;
            word-break: break-word;
          }

          .message-time {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 4px;
            margin-left: 8px;
          }
        }
      }

      .loading-message {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.6);

        .loading-icon {
          margin-right: 8px;
          animation: spin 1s linear infinite;
        }
      }
    }

    .input-area {
      padding: 20px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);

      .el-textarea {
        margin-bottom: 12px;

        .el-textarea__inner {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 8px;

          &::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          &:focus {
            border-color: #ff6b9d;
          }
        }
      }

      .input-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .char-count {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .el-button {
          background: linear-gradient(135deg, #ff6b9d, #c44eff);
          border: none;
          color: #fff;
          border-radius: 20px;
          padding: 10px 24px;

          &:hover {
            background: linear-gradient(135deg, #ff528f, #b33cff);
          }
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>