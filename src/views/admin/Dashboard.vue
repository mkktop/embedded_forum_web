<template>
  <div class="dashboard-page">
    <h1 class="page-title">数据面板</h1>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card anime-card">
        <div class="stat-icon users">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ dashboardData.total_users || 0 }}</span>
          <span class="stat-label">用户总数</span>
        </div>
      </div>
      <div class="stat-card anime-card">
        <div class="stat-icon posts">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ dashboardData.total_posts || 0 }}</span>
          <span class="stat-label">帖子总数</span>
        </div>
      </div>
      <div class="stat-card anime-card">
        <div class="stat-icon comments">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ dashboardData.total_comments || 0 }}</span>
          <span class="stat-label">评论总数</span>
        </div>
      </div>
      <div class="stat-card anime-card">
        <div class="stat-icon categories">
          <el-icon><Folder /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ dashboardData.total_categories || 0 }}</span>
          <span class="stat-label">版块总数</span>
        </div>
      </div>
    </div>

    <!-- 今日数据 -->
    <div class="section-card anime-card">
      <h2 class="section-title">
        <el-icon><Calendar /></el-icon>
        今日数据
      </h2>
      <div class="today-stats">
        <div class="today-item">
          <span class="today-value">{{ dashboardData.today_users || 0 }}</span>
          <span class="today-label">新增用户</span>
        </div>
        <div class="today-item">
          <span class="today-value">{{ dashboardData.today_posts || 0 }}</span>
          <span class="today-label">新增帖子</span>
        </div>
        <div class="today-item">
          <span class="today-value">{{ dashboardData.today_comments || 0 }}</span>
          <span class="today-label">新增评论</span>
        </div>
        <div class="today-item">
          <span class="today-value">{{ dashboardData.today_active || 0 }}</span>
          <span class="today-label">今日活跃</span>
        </div>
      </div>
    </div>

    <!-- 热门帖子 -->
    <div class="section-card anime-card">
      <h2 class="section-title">
        <el-icon><TrendCharts /></el-icon>
        热门帖子
      </h2>
      <div v-if="hotPosts.length > 0" class="hot-posts">
        <div v-for="(post, index) in hotPosts" :key="post.id" class="hot-post-item" @click="goToPost(post.id)">
          <span class="post-rank" :class="{ top: index < 3 }">{{ index + 1 }}</span>
          <span class="post-title">{{ post.title }}</span>
          <span class="post-stats">
            <el-icon><View /></el-icon> {{ post.views || 0 }}
            <el-icon><ChatDotRound /></el-icon> {{ post.comments || 0 }}
          </span>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-icon><Document /></el-icon>
        <p>暂无数据</p>
      </div>
    </div>

    <!-- 最新用户 -->
    <div class="section-card anime-card">
      <h2 class="section-title">
        <el-icon><UserFilled /></el-icon>
        最新用户
      </h2>
      <div v-if="newUsers.length > 0" class="new-users">
        <div v-for="user in newUsers" :key="user.id" class="user-item">
          <el-avatar :size="36" class="user-avatar">
            {{ user.nickname?.charAt(0) || user.username?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-info">
            <span class="user-name">{{ user.nickname || user.username }}</span>
            <span class="user-time">{{ formatTime(user.create_time) }}</span>
          </div>
          <span class="user-role" :class="user.role">{{ user.role === 'admin' ? '管理员' : '用户' }}</span>
        </div>
      </div>
      <div v-else class="empty-state">
        <el-icon><User /></el-icon>
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 管理后台数据面板组件
 * 功能：统计数据展示、今日数据、热门帖子、最新用户
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api'
import { ElMessage } from 'element-plus'
import {
  User,
  Document,
  ChatDotRound,
  Folder,
  Calendar,
  TrendCharts,
  View,
  UserFilled
} from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 仪表盘数据 */
const dashboardData = ref({})

/** 热门帖子列表 */
const hotPosts = ref([])

/** 最新用户列表 */
const newUsers = ref([])

/** 加载状态 */
const loading = ref(false)

// ==================== 数据加载方法 ====================

/**
 * 加载仪表盘数据
 */
const loadDashboard = async () => {
  loading.value = true
  try {
    const res = await adminApi.getDashboard()
    console.log('Dashboard API响应:', res.data)
    
    // API返回嵌套结构
    const data = res.data || {}
    const overview = data.overview || {}
    const today = data.today || {}
    const users = data.users || {}
    const posts = data.posts || {}
    
    // 映射到组件使用的扁平结构
    // 注意：overview没有total_users，从users.total获取
    dashboardData.value = {
      total_users: users.total || overview.total_users || 0,
      total_posts: overview.total_posts || posts.total || 0,
      total_comments: overview.total_comments || 0,
      total_categories: overview.total_categories || 0,
      today_users: today.new_users || 0,
      today_posts: today.new_posts || 0,
      today_comments: today.new_comments || 0,
      today_active: users.active || today.active_users || 0
    }
    
    hotPosts.value = data.hot_posts || []
    newUsers.value = data.new_users || []
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理方法 ====================

/**
 * 跳转到帖子详情
 * @param {number} postId - 帖子ID
 */
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
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
  const now = new Date()
  const diff = now - date
  
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return year === now.getFullYear() ? `${month}-${day}` : `${year}-${month}-${day}`
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadDashboard()
})
</script>

<style lang="scss" scoped>
.dashboard-page {
  .page-title {
    color: #fff;
    font-size: 24px;
    margin-bottom: 24px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 24px;

  &.users {
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
    color: #ff6b9d;
  }

  &.posts {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1));
    color: #00d4ff;
  }

  &.comments {
    background: linear-gradient(135deg, rgba(196, 78, 255, 0.2), rgba(196, 78, 255, 0.1));
    color: #c44eff;
  }

  &.categories {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
    color: #ffc107;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  color: #fff;
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.section-card {
  padding: 24px;
  margin-bottom: 24px;
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

.today-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.today-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.today-value {
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.today-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.hot-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-post-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
}

.post-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;

  &.top {
    background: linear-gradient(135deg, #ff6b9d, #c44eff);
    color: #fff;
  }
}

.post-title {
  flex: 1;
  color: #fff;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;

  .el-icon {
    margin-right: 4px;
  }
}

.new-users {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.user-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  color: #fff;
  font-size: 14px;
}

.user-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.user-role {
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;

  &.admin {
    background: rgba(255, 107, 157, 0.2);
    color: #ff6b9d;
  }

  &.user {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);

  .el-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .today-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .today-stats {
    grid-template-columns: 1fr;
  }
}
</style>
