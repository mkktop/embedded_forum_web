<template>
  <div class="user-profile-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 用户信息卡片 -->
    <div v-else-if="userInfo.id" class="user-card anime-card">
      <div class="user-header">
        <el-avatar :size="80" class="user-avatar">
          {{ userInfo.nickname?.charAt(0) || userInfo.username?.charAt(0) || 'U' }}
        </el-avatar>
        <div class="user-info">
          <h2 class="user-name">
            {{ userInfo.nickname || userInfo.username }}
            <span v-if="userInfo.role === 'admin'" class="admin-badge">管理员</span>
          </h2>
          <p class="user-id">ID: {{ userInfo.id }}</p>
          <p v-if="userInfo.signature" class="user-signature">{{ userInfo.signature }}</p>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userInfo.points || 0 }}</span>
          <span class="stat-label">积分</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ postCount }}</span>
          <span class="stat-label">帖子</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ commentCount }}</span>
          <span class="stat-label">评论</span>
        </div>
      </div>

      <div class="user-meta">
        <p><span class="meta-label">邮箱：</span>{{ userInfo.email || '未设置' }}</p>
        <p><span class="meta-label">注册时间：</span>{{ formatTime(userInfo.create_time) }}</p>
      </div>
    </div>

    <!-- 用户帖子列表 -->
    <div class="posts-section anime-card">
      <h3 class="section-title">
        <el-icon><Document /></el-icon>
        TA的帖子
      </h3>
      
      <div class="posts-info">
        <p>该用户共发布了 <strong>{{ postCount }}</strong> 篇帖子</p>
        <p class="tip">帖子列表功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 用户主页组件
 * 功能：展示用户信息
 */
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { adminApi } from '@/api'
import { ElMessage } from 'element-plus'
import { Document, Loading } from '@element-plus/icons-vue'

const route = useRoute()

const userInfo = ref({})
const postCount = ref(0)
const commentCount = ref(0)
const loading = ref(false)

const loadUserInfo = async () => {
  const userId = route.params.id
  if (!userId) return

  loading.value = true
  try {
    const res = await adminApi.getUserDetail(userId)
    const data = res.data
    userInfo.value = {
      ...data.user,
      signature: data.profile?.signature,
      points: data.auth?.points
    }
    postCount.value = data.stats?.post_count?.total || 0
    commentCount.value = data.stats?.comment_count || 0

    document.title = `${userInfo.value.nickname || userInfo.value.username} - 用户主页 - 超次元论坛`
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

watch(() => route.params.id, () => {
  loadUserInfo()
}, { immediate: true })

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.user-profile-page {
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

.user-card {
  padding: 30px;
  margin-bottom: 24px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.user-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  font-size: 32px;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name {
  color: #fff;
  font-size: 24px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-badge {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.user-id {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-bottom: 8px;
}

.user-signature {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-style: italic;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.user-meta {
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin-bottom: 8px;
  }

  .meta-label {
    color: rgba(255, 255, 255, 0.4);
  }
}

.posts-section {
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

.posts-info {
  text-align: center;
  padding: 40px 20px;

  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    margin-bottom: 10px;

    strong {
      color: #ff6b9d;
      font-size: 18px;
    }
  }

  .tip {
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
  }
}
</style>
