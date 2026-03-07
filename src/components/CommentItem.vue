<template>
  <div class="comment-item">
    <!-- 评论主体 -->
    <div class="comment-main">
      <!-- 用户头像 -->
      <router-link :to="`/user/${comment.user_id}`" class="avatar-link">
        <el-avatar :size="36" class="comment-avatar">
          {{ comment.author_name?.charAt(0) || 'U' }}
        </el-avatar>
      </router-link>
      
      <!-- 评论内容 -->
      <div class="comment-content">
        <!-- 用户名和时间 -->
        <div class="comment-header">
          <router-link :to="`/user/${comment.user_id}`" class="comment-author">
            {{ comment.author_nickname || comment.author_name }}
          </router-link>
          <span class="comment-user-id">ID: {{ comment.user_id }}</span>
          <span class="comment-time">{{ formatTime(comment.create_time) }}</span>
        </div>
        
        <!-- 评论文字 -->
        <p class="comment-text">{{ comment.content }}</p>
        
        <!-- 操作按钮 -->
        <div class="comment-actions">
          <span class="action-btn" @click="handleReply">
            <el-icon><ChatDotRound /></el-icon>
            回复
          </span>
          <span v-if="canDelete" class="action-btn delete" @click="handleDelete">
            <el-icon><Delete /></el-icon>
            删除
          </span>
          <span v-if="comment.reply_count > 0" class="reply-count" @click="toggleReplies">
            <el-icon><ArrowDown :class="{ expanded: showReplies }" /></el-icon>
            {{ comment.reply_count }} 条回复
          </span>
        </div>
      </div>
    </div>

    <!-- 回复列表 -->
    <div v-if="showReplies" class="replies-list">
      <div v-if="loadingReplies" class="loading-replies">
        <el-icon class="loading-icon"><Loading /></el-icon>
      </div>
      <div v-else>
        <div
          v-for="reply in replies"
          :key="reply.id"
          class="reply-item"
        >
          <router-link :to="`/user/${reply.user_id}`" class="avatar-link">
            <el-avatar :size="28" class="reply-avatar">
              {{ reply.author_name?.charAt(0) || 'U' }}
            </el-avatar>
          </router-link>
          <div class="reply-content">
            <div class="reply-header">
              <router-link :to="`/user/${reply.user_id}`" class="reply-author">
                {{ reply.author_nickname || reply.author_name }}
              </router-link>
              <span class="reply-user-id">ID: {{ reply.user_id }}</span>
              <span v-if="reply.reply_to_user_name" class="reply-to">
                回复 <span class="reply-target">@{{ reply.reply_to_user_name }}</span>
              </span>
              <span class="reply-time">{{ formatTime(reply.create_time) }}</span>
            </div>
            <p class="reply-text">{{ reply.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 评论项组件
 * 功能：展示单条评论、回复列表、回复/删除操作
 */
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { commentApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/time'
import {
  ChatDotRound,
  Delete,
  ArrowDown,
  Loading
} from '@element-plus/icons-vue'

// ==================== Props定义 ====================

/**
 * 组件属性
 * @property {Object} comment - 评论数据对象
 */
const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

// ==================== Emits定义 ====================

const emit = defineEmits(['reply', 'refresh'])

// ==================== 状态定义 ====================

/** 用户状态Store */
const userStore = useUserStore()

/** 是否显示回复列表 */
const showReplies = ref(false)

/** 回复列表 */
const replies = ref([])

/** 加载回复中 */
const loadingReplies = ref(false)

/** 是否可以删除（评论作者或管理员） */
const canDelete = computed(() => {
  return userStore.userInfo?.id === props.comment.user_id || userStore.isAdmin
})

// ==================== 方法定义 ====================

/**
 * 处理回复按钮点击
 */
const handleReply = () => {
  emit('reply', props.comment)
}

/**
 * 处理删除评论
 */
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await commentApi.delete(props.comment.id)
    ElMessage.success('删除成功')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

/**
 * 切换回复列表显示
 */
const toggleReplies = async () => {
  showReplies.value = !showReplies.value
  
  if (showReplies.value && replies.value.length === 0) {
    await loadReplies()
  }
}

/**
 * 加载回复列表
 */
const loadReplies = async () => {
  loadingReplies.value = true
  try {
    const res = await commentApi.getReplies(props.comment.id)
    replies.value = res.data || []
  } catch (error) {
    console.error('加载回复失败:', error)
  } finally {
    loadingReplies.value = false
  }
}
</script>

<style lang="scss" scoped>
.comment-item {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.comment-main {
  display: flex;
  gap: 12px;
}

.avatar-link {
  text-decoration: none;
  flex-shrink: 0;
}

.comment-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.comment-author {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ff6b9d;
  }
}

.comment-user-id {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}

.comment-time {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.comment-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #ff6b9d;
  }

  &.delete:hover {
    color: #f56c6c;
  }
}

.reply-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00d4ff;
  font-size: 12px;
  cursor: pointer;

  .el-icon {
    transition: transform 0.3s ease;

    &.expanded {
      transform: rotate(180deg);
    }
  }
}

.replies-list {
  margin-top: 12px;
  margin-left: 48px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.loading-replies {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.loading-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.5);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.reply-avatar {
  background: linear-gradient(135deg, #00d4ff, #c44eff);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.reply-author {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ff6b9d;
  }
}

.reply-user-id {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}

.reply-to {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.reply-target {
  color: #ff6b9d;
}

.reply-time {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.reply-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}
</style>
