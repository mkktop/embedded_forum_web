<template>
  <div class="user-profile-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 用户不存在 -->
    <div v-else-if="!userInfo.id" class="not-found">
      <el-icon><User /></el-icon>
      <p>用户不存在</p>
    </div>

    <!-- 用户信息卡片 -->
    <template v-else>
      <div class="user-card anime-card">
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
            <span class="stat-value">{{ pagination.total || 0 }}</span>
            <span class="stat-label">帖子</span>
          </div>
        </div>

        <div class="user-meta">
          <p><span class="meta-label">用户名：</span>{{ userInfo.username }}</p>
          <p><span class="meta-label">注册时间：</span>{{ formatTime(userInfo.create_time) }}</p>
        </div>
      </div>

      <!-- 用户帖子列表 -->
      <div class="posts-section anime-card">
        <h3 class="section-title">
          <el-icon><Document /></el-icon>
          TA的帖子
        </h3>

        <div v-if="loadingPosts" class="loading-state">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <div v-else-if="posts.length > 0" class="post-list">
          <PostCard v-for="post in posts" :key="post.id" :post="post" />
        </div>

        <div v-else class="empty-state">
          <el-icon><Document /></el-icon>
          <p>暂无帖子</p>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.totalPages > 1" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="pagination.total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
/**
 * 用户主页组件
 * 功能：展示用户公开信息、用户帖子列表
 */
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { userPublicApi } from '@/api'
import { ElMessage } from 'element-plus'
import { Document, Loading, User } from '@element-plus/icons-vue'
import PostCard from '@/components/PostCard.vue'

const route = useRoute()

const userInfo = ref({})
const posts = ref([])
const loading = ref(false)
const loadingPosts = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const pagination = ref({
  total: 0,
  totalPages: 0
})

const loadUserInfo = async () => {
  const userId = route.params.id
  if (!userId) return

  loading.value = true
  try {
    const res = await userPublicApi.getInfo(userId)
    userInfo.value = res.data || {}
    document.title = `${userInfo.value.nickname || userInfo.value.username} - 用户主页 - 超次元论坛`
  } catch (error) {
    console.error('加载用户信息失败:', error)
    if (error.response?.status === 404) {
      userInfo.value = {}
    } else {
      ElMessage.error('加载用户信息失败')
    }
  } finally {
    loading.value = false
  }
}

const loadUserPosts = async () => {
  const userId = route.params.id
  if (!userId) return

  loadingPosts.value = true
  try {
    const res = await userPublicApi.getPosts(userId, {
      page: currentPage.value,
      pageSize: pageSize.value
    })
    posts.value = res.data?.list || []
    pagination.value = res.data?.pagination || { total: 0, totalPages: 0 }
  } catch (error) {
    console.error('加载帖子失败:', error)
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  loadUserPosts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

watch(() => route.params.id, (newId) => {
  if (newId) {
    currentPage.value = 1
    loadUserInfo()
    loadUserPosts()
  }
}, { immediate: true })

onMounted(() => {
  loadUserInfo()
  loadUserPosts()
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.loading-container,
.not-found {
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

.not-found .el-icon {
  font-size: 60px;
  margin-bottom: 16px;
  color: rgba(255, 255, 255, 0.3);
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
  gap: 80px;
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

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.5);

  .el-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
