<template>
  <div class="post-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 帖子内容 -->
    <template v-else-if="post">
      <!-- 帖子主体 -->
      <article class="post-main anime-card">
        <!-- 帖子头部 -->
        <header class="post-header">
          <!-- 标签 -->
          <div class="post-tags">
            <span v-if="post.is_pinned" class="tag pinned">
              <el-icon><Top /></el-icon>
              置顶
            </span>
            <span v-if="post.is_highlighted" class="tag highlighted">
              <el-icon><Star /></el-icon>
              精华
            </span>
            <span class="category-tag">{{ post.category_name }}</span>
          </div>
          
          <!-- 标题 -->
          <h1 class="post-title">{{ post.title }}</h1>
          
          <!-- 作者信息 -->
          <div class="post-meta">
            <div class="author-info">
              <router-link :to="`/user/${post.user_id}`" class="author-avatar-link">
                <el-avatar :size="40" class="author-avatar">
                  {{ post.author_name?.charAt(0) || 'U' }}
                </el-avatar>
              </router-link>
              <div class="author-detail">
                <router-link :to="`/user/${post.user_id}`" class="author-name">
                  {{ post.author_nickname || post.author_name }}
                </router-link>
                <span class="author-id">ID: {{ post.user_id }}</span>
                <span class="post-time">{{ formatTime(post.create_time) }}</span>
              </div>
            </div>
            <div class="post-stats">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ post.views || 0 }} 浏览
              </span>
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ post.comments || 0 }} 评论
              </span>
            </div>
          </div>
        </header>

        <!-- 帖子内容 -->
        <div class="post-content" v-html="formatContent(post.content)"></div>

        <!-- 帖子底部操作 -->
        <footer class="post-actions">
          <el-button
            :type="postStatus.liked ? 'primary' : 'default'"
            :class="{ active: postStatus.liked }"
            @click="handleLike"
          >
            <el-icon><Star /></el-icon>
            {{ postStatus.liked ? '已点赞' : '点赞' }} ({{ post.likes || 0 }})
          </el-button>
          <el-button
            :type="postStatus.favorited ? 'primary' : 'default'"
            :class="{ active: postStatus.favorited }"
            @click="handleFavorite"
          >
            <el-icon><CollectionTag /></el-icon>
            {{ postStatus.favorited ? '已收藏' : '收藏' }}
          </el-button>
        </footer>
      </article>

      <!-- 评论区 -->
      <section class="comments-section anime-card">
        <h3 class="section-title">
          <el-icon><ChatDotRound /></el-icon>
          评论区 ({{ post.comments || 0 }})
        </h3>

        <!-- 发表评论 -->
        <div v-if="userStore.isLoggedIn" class="comment-form">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="1000"
            show-word-limit
          />
          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="submitComment">
              发表评论
            </el-button>
          </div>
        </div>
        <div v-else class="login-tip">
          <router-link to="/login">登录</router-link> 后参与讨论
        </div>

        <!-- 评论列表 -->
        <div class="comment-list">
          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
            @reply="handleReply"
            @refresh="loadComments"
          />
        </div>

        <!-- 加载更多评论 -->
        <div v-if="hasMoreComments" class="load-more">
          <el-button @click="loadMoreComments" :loading="loadingComments">
            加载更多评论
          </el-button>
        </div>

        <!-- 空状态 -->
        <div v-if="comments.length === 0 && !loadingComments" class="empty-comments">
          <el-icon><ChatDotRound /></el-icon>
          <p>暂无评论，快来抢沙发吧~</p>
        </div>
      </section>
    </template>

    <!-- 帖子不存在 -->
    <div v-else class="not-found anime-card">
      <el-icon class="not-found-icon"><Document /></el-icon>
      <h2>帖子不存在</h2>
      <p>该帖子可能已被删除或不存在</p>
      <router-link to="/" class="back-btn">返回首页</router-link>
    </div>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复评论"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="3"
        placeholder="写下你的回复..."
        maxlength="1000"
        show-word-limit
      />
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingReply" @click="submitReply">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 帖子详情页组件
 * 功能：帖子内容展示、点赞收藏、评论列表、发表评论、回复评论
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { postApi, commentApi } from '@/api'
import { ElMessage } from 'element-plus'
import {
  Loading,
  Top,
  Star,
  View,
  ChatDotRound,
  CollectionTag,
  Document
} from '@element-plus/icons-vue'
import CommentItem from '@/components/CommentItem.vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const route = useRoute()
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 加载状态 */
const loading = ref(false)

/** 帖子数据 */
const post = ref(null)

/** 帖子点赞/收藏状态 */
const postStatus = reactive({
  liked: false,
  favorited: false
})

/** 评论列表 */
const comments = ref([])

/** 评论分页信息 */
const commentPage = ref(1)
const commentPageSize = ref(10)
const hasMoreComments = ref(false)
const loadingComments = ref(false)

/** 新评论内容 */
const newComment = ref('')

/** 提交评论中 */
const submitting = ref(false)

/** 回复对话框 */
const replyDialogVisible = ref(false)
const replyContent = ref('')
const replyTarget = ref(null)
const submittingReply = ref(false)

// ==================== 数据加载方法 ====================

/**
 * 加载帖子详情
 */
const loadPost = async () => {
  loading.value = true
  try {
    const postId = route.params.id
    const res = await postApi.getDetail(postId)
    post.value = res.data
    
    // 加载点赞/收藏状态
    if (userStore.isLoggedIn) {
      loadPostStatus()
    }
    
    // 加载评论列表
    loadComments(true)
  } catch (error) {
    console.error('加载帖子失败:', error)
    ElMessage.error('加载帖子失败')
    post.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 加载帖子点赞/收藏状态
 */
const loadPostStatus = async () => {
  try {
    const res = await postApi.getStatus(post.value.id)
    postStatus.liked = res.data.liked
    postStatus.favorited = res.data.favorited
  } catch (error) {
    console.error('加载状态失败:', error)
  }
}

/**
 * 加载评论列表
 * @param {boolean} reset - 是否重置列表
 */
const loadComments = async (reset = false) => {
  if (reset) {
    commentPage.value = 1
    comments.value = []
  }
  
  loadingComments.value = true
  try {
    const res = await commentApi.getList(post.value.id, {
      page: commentPage.value,
      pageSize: commentPageSize.value
    })
    
    if (reset) {
      comments.value = res.data.list || []
    } else {
      comments.value.push(...(res.data.list || []))
    }
    
    hasMoreComments.value = comments.value.length < (res.data.pagination?.total || 0)
  } catch (error) {
    console.error('加载评论失败:', error)
  } finally {
    loadingComments.value = false
  }
}

/**
 * 加载更多评论
 */
const loadMoreComments = () => {
  commentPage.value++
  loadComments()
}

// ==================== 事件处理方法 ====================

/**
 * 点赞帖子
 */
const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    if (postStatus.liked) {
      await postApi.unlike(post.value.id)
      postStatus.liked = false
      post.value.likes--
      ElMessage.success('已取消点赞')
    } else {
      await postApi.like(post.value.id)
      postStatus.liked = true
      post.value.likes++
      ElMessage.success('点赞成功')
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

/**
 * 收藏帖子
 */
const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    if (postStatus.favorited) {
      await postApi.unfavorite(post.value.id)
      postStatus.favorited = false
      ElMessage.success('已取消收藏')
    } else {
      await postApi.favorite(post.value.id)
      postStatus.favorited = true
      ElMessage.success('收藏成功')
    }
  } catch (error) {
    console.error('操作失败:', error)
  }
}

/**
 * 发表评论
 */
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  submitting.value = true
  try {
    await commentApi.create(post.value.id, {
      content: newComment.value.trim()
    })
    ElMessage.success('评论发表成功')
    newComment.value = ''
    post.value.comments++
    loadComments(true)
  } catch (error) {
    console.error('发表评论失败:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 处理回复评论
 * @param {Object} comment - 要回复的评论
 */
const handleReply = (comment) => {
  replyTarget.value = comment
  replyContent.value = ''
  replyDialogVisible.value = true
}

/**
 * 提交回复
 */
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  submittingReply.value = true
  try {
    await commentApi.create(post.value.id, {
      content: replyContent.value.trim(),
      parent_id: replyTarget.value.id,
      reply_to_user_id: replyTarget.value.user_id
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    post.value.comments++
    loadComments(true)
  } catch (error) {
    console.error('回复失败:', error)
  } finally {
    submittingReply.value = false
  }
}

// ==================== 工具方法 ====================

/**
 * 格式化时间
 * @param {string} timeStr - ISO时间字符串
 * @returns {string} 格式化后的时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化帖子内容
 * @param {string} content - 帖子内容
 * @returns {string} 格式化后的HTML
 */
const formatContent = (content) => {
  if (!content) return ''
  // 简单的换行处理
  return content.replace(/\n/g, '<br>')
}

// ==================== 监听器 ====================

/**
 * 监听路由参数变化
 */
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadPost()
    }
  }
)

// ==================== 生命周期 ====================

onMounted(() => {
  loadPost()
})
</script>

<style lang="scss" scoped>
.post-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  color: rgba(255, 255, 255, 0.6);
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.post-main {
  padding: 30px;
  margin-bottom: 24px;
}

.post-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.post-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag.pinned {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
  color: #ff6b9d;
}

.tag.highlighted {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
  color: #ffc107;
}

.category-tag {
  padding: 4px 12px;
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  border-radius: 12px;
  font-size: 12px;
}

.post-title {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 16px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar-link {
  text-decoration: none;
  flex-shrink: 0;
}

.author-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.author-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ff6b9d;
  }
}

.author-id {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.author-id {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.post-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.post-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.post-content {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 24px;
  word-break: break-word;
}

.post-actions {
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  :deep(.el-button) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    padding: 10px 24px;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    &.active {
      background: linear-gradient(135deg, #ff6b9d, #c44eff);
      border: none;
      color: #fff;
    }
  }
}

.comments-section {
  padding: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-form {
  margin-bottom: 24px;

  :deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:focus {
      border-color: #ff6b9d;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.login-tip {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;

  a {
    color: #ff6b9d;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.load-more {
  text-align: center;
  padding: 20px;

  :deep(.el-button) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }
}

.empty-comments {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);

  .el-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
}

.not-found {
  text-align: center;
  padding: 60px;
}

.not-found-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 20px;
}

.not-found h2 {
  color: #fff;
  font-size: 24px;
  margin-bottom: 12px;
}

.not-found p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 24px;
}

.back-btn {
  display: inline-block;
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  color: #fff;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
  }
}

:deep(.el-dialog) {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;

  .el-dialog__title {
    color: #fff;
  }

  .el-textarea__inner {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>
