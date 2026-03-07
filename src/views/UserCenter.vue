<template>
  <div class="user-center-page">
    <!-- 用户信息卡片 -->
    <div class="user-card anime-card">
      <div class="user-header">
        <div class="avatar-section">
          <el-avatar :size="80" class="user-avatar">
            {{ userStore.nickname?.charAt(0) || 'U' }}
          </el-avatar>
          <div class="user-info">
            <h2 class="user-name">{{ userStore.nickname }}</h2>
            <p class="user-id">ID: {{ userStore.userInfo?.id }}</p>
            <p class="user-signature">{{ userStore.userInfo?.signature || '这个人很懒，什么都没写~' }}</p>
          </div>
        </div>
        <el-button type="primary" @click="showEditDialog = true">
          <el-icon><Edit /></el-icon>
          编辑资料
        </el-button>
        <el-button @click="showPasswordDialog = true">
          <el-icon><Key /></el-icon>
          修改密码
        </el-button>
      </div>
      
      <!-- 用户统计 -->
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo?.points || 0 }}</span>
          <span class="stat-label">积分</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo?.post_count || 0 }}</span>
          <span class="stat-label">帖子</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo?.comment_count || 0 }}</span>
          <span class="stat-label">评论</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo?.like_count || 0 }}</span>
          <span class="stat-label">获赞</span>
        </div>
      </div>
    </div>

    <!-- 内容标签页 -->
    <div class="content-tabs anime-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- 我的帖子 -->
        <el-tab-pane label="我的帖子" name="posts">
          <div v-if="loadingPosts" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="myPosts.length > 0" class="post-list">
            <div v-for="post in myPosts" :key="post.id" class="my-post-item" @click="goToPost(post.id)">
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <p class="post-meta">
                  <span>{{ post.category_name }}</span>
                  <span>{{ formatTime(post.create_time) }}</span>
                </p>
              </div>
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.views || 0 }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ post.comments || 0 }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likes || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Document /></el-icon>
            <p>暂无帖子</p>
          </div>
        </el-tab-pane>

        <!-- 我的评论 -->
        <el-tab-pane label="我的评论" name="comments">
          <div v-if="loadingComments" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="myComments.length > 0" class="comment-list">
            <div v-for="comment in myComments" :key="comment.id" class="my-comment-item" @click="goToPost(comment.post_id)">
              <p class="comment-content">{{ comment.content }}</p>
              <div class="comment-meta">
                <span class="post-title">回复: {{ comment.post_title }}</span>
                <span class="comment-time">{{ formatTime(comment.create_time) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><ChatDotRound /></el-icon>
            <p>暂无评论</p>
          </div>
        </el-tab-pane>

        <!-- 我的收藏 -->
        <el-tab-pane label="我的收藏" name="favorites">
          <div v-if="loadingFavorites" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="myFavorites.length > 0" class="post-list">
            <div v-for="post in myFavorites" :key="post.id" class="my-post-item" @click="goToPost(post.id)">
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <p class="post-meta">
                  <span>{{ post.author_nickname || post.author_name }}</span>
                  <span>{{ formatTime(post.create_time) }}</span>
                </p>
              </div>
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.views || 0 }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ post.comments || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><CollectionTag /></el-icon>
            <p>暂无收藏</p>
          </div>
        </el-tab-pane>

        <!-- 我的点赞 -->
        <el-tab-pane label="我的点赞" name="likes">
          <div v-if="loadingLikes" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="myLikes.length > 0" class="post-list">
            <div v-for="post in myLikes" :key="post.id" class="my-post-item" @click="goToPost(post.id)">
              <div class="post-info">
                <h4 class="post-title">{{ post.title }}</h4>
                <p class="post-meta">
                  <span>{{ post.author_nickname || post.author_name }}</span>
                  <span>{{ formatTime(post.create_time) }}</span>
                </p>
              </div>
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.views || 0 }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ post.comments || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Star /></el-icon>
            <p>暂无点赞</p>
          </div>
        </el-tab-pane>

        <!-- 我的兑换记录 -->
        <el-tab-pane label="兑换记录" name="purchases">
          <div v-if="loadingPurchases" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="myPurchases.length > 0" class="purchase-list">
            <div v-for="item in myPurchases" :key="item.id" class="purchase-item" @click="goToPost(item.post_id)">
              <div class="purchase-info">
                <h4 class="purchase-title">{{ item.post_title }}</h4>
                <p class="purchase-meta">
                  <span>消耗 {{ item.points_cost }} 积分</span>
                  <span>{{ formatTime(item.create_time) }}</span>
                </p>
              </div>
              <div class="purchase-link">
                <el-button size="small" type="primary" @click.stop="openDownloadLink(item.download_link)">
                  下载资源
                </el-button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Download /></el-icon>
            <p>暂无兑换记录</p>
          </div>
        </el-tab-pane>

        <!-- 我的资源收益 -->
        <el-tab-pane label="资源收益" name="earnings">
          <div v-if="loadingEarnings" class="loading-state">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="myEarnings.length > 0" class="earnings-list">
            <div v-for="item in myEarnings" :key="item.id" class="earnings-item">
              <div class="earnings-info">
                <h4 class="earnings-title">{{ item.post_title }}</h4>
                <p class="earnings-meta">
                  <span>购买者: {{ item.buyer_name }}</span>
                  <span>{{ formatTime(item.create_time) }}</span>
                </p>
              </div>
              <div class="earnings-amount">
                +{{ item.earnings }} 积分
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon><Coin /></el-icon>
            <p>暂无收益记录</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-position="top">
        <el-form-item label="昵称">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input
            v-model="editForm.signature"
            type="textarea"
            :rows="3"
            placeholder="写点什么介绍自己吧..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="passwordForm" label-position="top">
        <el-form-item label="原密码" required>
          <el-input
            v-model="passwordForm.old_password"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" required>
          <el-input
            v-model="passwordForm.new_password"
            type="password"
            placeholder="请输入新密码（6-20字符）"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" required>
          <el-input
            v-model="passwordForm.confirm_password"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="savingPassword" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 个人中心页面组件
 * 功能：用户资料展示编辑、我的帖子/评论/收藏/点赞列表
 */
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { postApi, commentApi, userApi, authApi } from '@/api'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/time'
import {
  Edit,
  Key,
  Loading,
  Document,
  ChatDotRound,
  Star,
  CollectionTag,
  View,
  Download,
  Coin
} from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const route = useRoute()
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 当前标签页 */
const activeTab = ref('posts')

/** 加载状态 */
const loadingPosts = ref(false)
const loadingComments = ref(false)
const loadingFavorites = ref(false)
const loadingLikes = ref(false)
const loadingPurchases = ref(false)
const loadingEarnings = ref(false)

/** 我的帖子列表 */
const myPosts = ref([])

/** 我的评论列表 */
const myComments = ref([])

/** 我的收藏列表 */
const myFavorites = ref([])

/** 我的点赞列表 */
const myLikes = ref([])

/** 我的兑换记录列表 */
const myPurchases = ref([])

/** 我的资源收益列表 */
const myEarnings = ref([])

/** 编辑资料对话框 */
const showEditDialog = ref(false)
const savingProfile = ref(false)

/** 修改密码对话框 */
const showPasswordDialog = ref(false)
const savingPassword = ref(false)

/** 编辑表单数据 */
const editForm = reactive({
  nickname: '',
  signature: ''
})

/** 修改密码表单数据 */
const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// ==================== 数据加载方法 ====================

/**
 * 加载我的帖子
 */
const loadMyPosts = async () => {
  loadingPosts.value = true
  try {
    const res = await postApi.getMyPosts()
    console.log('我的帖子响应:', res)
    // 处理不同的数据结构：可能是数组、可能是 {list: []}、可能是 {posts: []}
    if (Array.isArray(res.data)) {
      myPosts.value = res.data
    } else if (res.data?.list) {
      myPosts.value = res.data.list
    } else if (res.data?.posts) {
      myPosts.value = res.data.posts
    } else {
      myPosts.value = []
    }
  } catch (error) {
    console.error('加载帖子失败:', error)
    myPosts.value = []
  } finally {
    loadingPosts.value = false
  }
}

/**
 * 加载我的评论
 */
const loadMyComments = async () => {
  loadingComments.value = true
  try {
    const res = await commentApi.getMyComments()
    console.log('我的评论响应:', res)
    // 处理不同的数据结构
    if (Array.isArray(res.data)) {
      myComments.value = res.data
    } else if (res.data?.list) {
      myComments.value = res.data.list
    } else if (res.data?.comments) {
      myComments.value = res.data.comments
    } else {
      myComments.value = []
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    myComments.value = []
  } finally {
    loadingComments.value = false
  }
}

/**
 * 加载我的收藏
 */
const loadMyFavorites = async () => {
  loadingFavorites.value = true
  try {
    const res = await userApi.getFavorites()
    console.log('我的收藏响应:', res)
    // 处理不同的数据结构
    if (Array.isArray(res.data)) {
      myFavorites.value = res.data
    } else if (res.data?.list) {
      myFavorites.value = res.data.list
    } else if (res.data?.favorites) {
      myFavorites.value = res.data.favorites
    } else {
      myFavorites.value = []
    }
  } catch (error) {
    console.error('加载收藏失败:', error)
    myFavorites.value = []
  } finally {
    loadingFavorites.value = false
  }
}

/**
 * 加载我的点赞
 */
const loadMyLikes = async () => {
  loadingLikes.value = true
  try {
    const res = await userApi.getLikes()
    console.log('我的点赞响应:', res)
    // 处理不同的数据结构
    if (Array.isArray(res.data)) {
      myLikes.value = res.data
    } else if (res.data?.list) {
      myLikes.value = res.data.list
    } else if (res.data?.likes) {
      myLikes.value = res.data.likes
    } else {
      myLikes.value = []
    }
  } catch (error) {
    console.error('加载点赞失败:', error)
    myLikes.value = []
  } finally {
    loadingLikes.value = false
  }
}

/**
 * 加载我的兑换记录
 */
const loadMyPurchases = async () => {
  loadingPurchases.value = true
  try {
    const res = await userApi.getPurchases()
    console.log('兑换记录响应:', res)
    if (Array.isArray(res.data)) {
      myPurchases.value = res.data
    } else if (res.data?.list) {
      myPurchases.value = res.data.list
    } else if (res.data?.purchases) {
      myPurchases.value = res.data.purchases
    } else {
      myPurchases.value = []
    }
  } catch (error) {
    console.error('加载兑换记录失败:', error)
    myPurchases.value = []
  } finally {
    loadingPurchases.value = false
  }
}

/**
 * 加载我的资源收益
 */
const loadMyEarnings = async () => {
  loadingEarnings.value = true
  try {
    const res = await userApi.getEarnings()
    console.log('资源收益响应:', res)
    if (Array.isArray(res.data)) {
      myEarnings.value = res.data
    } else if (res.data?.list) {
      myEarnings.value = res.data.list
    } else if (res.data?.earnings) {
      myEarnings.value = res.data.earnings
    } else {
      myEarnings.value = []
    }
  } catch (error) {
    console.error('加载资源收益失败:', error)
    myEarnings.value = []
  } finally {
    loadingEarnings.value = false
  }
}

/**
 * 刷新用户信息
 */
const refreshUserInfo = async () => {
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.error('刷新用户信息失败:', error)
  }
}

// ==================== 事件处理方法 ====================

/**
 * 标签页切换处理
 * @param {string} tab - 标签页名称
 */
const handleTabChange = (tab) => {
  switch (tab) {
    case 'posts':
      if (myPosts.value.length === 0) loadMyPosts()
      break
    case 'comments':
      if (myComments.value.length === 0) loadMyComments()
      break
    case 'favorites':
      if (myFavorites.value.length === 0) loadMyFavorites()
      break
    case 'likes':
      if (myLikes.value.length === 0) loadMyLikes()
      break
    case 'purchases':
      if (myPurchases.value.length === 0) loadMyPurchases()
      break
    case 'earnings':
      if (myEarnings.value.length === 0) loadMyEarnings()
      break
  }
}

/**
 * 跳转到帖子详情
 * @param {number} postId - 帖子ID
 */
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

/**
 * 保存用户资料
 */
const saveProfile = async () => {
  savingProfile.value = true
  try {
    await authApi.updateProfile({
      nickname: editForm.nickname.trim(),
      signature: editForm.signature.trim()
    })
    
    // 更新本地用户信息
    userStore.updateUserInfo({
      nickname: editForm.nickname.trim(),
      signature: editForm.signature.trim()
    })
    
    ElMessage.success('保存成功')
    showEditDialog.value = false
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    savingProfile.value = false
  }
}

/**
 * 修改密码
 */
const changePassword = async () => {
  // 验证表单
  if (!passwordForm.old_password) {
    ElMessage.warning('请输入原密码')
    return
  }
  if (!passwordForm.new_password) {
    ElMessage.warning('请输入新密码')
    return
  }
  if (passwordForm.new_password.length < 6 || passwordForm.new_password.length > 20) {
    ElMessage.warning('新密码长度为6-20个字符')
    return
  }
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  
  savingPassword.value = true
  try {
    await authApi.changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password
    })
    
    ElMessage.success('密码修改成功，请重新登录')
    showPasswordDialog.value = false
    
    // 重置表单
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
    
    // 退出登录
    setTimeout(() => {
      userStore.logout()
      router.push('/login')
    }, 1500)
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    savingPassword.value = false
  }
}

/**
 * 打开下载链接
 * @param {string} url - 下载链接
 */
const openDownloadLink = (url) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    ElMessage.warning('下载链接不可用')
  }
}

// ==================== 监听器 ====================

/**
 * 监听编辑对话框打开
 */
watch(showEditDialog, (val) => {
  if (val) {
    editForm.nickname = userStore.userInfo?.nickname || ''
    editForm.signature = userStore.userInfo?.signature || ''
  }
})

/**
 * 监听路由查询参数
 */
watch(
  () => route.query.tab,
  (tab) => {
    if (tab && ['posts', 'comments', 'favorites', 'likes', 'purchases', 'earnings'].includes(tab)) {
      activeTab.value = tab
      handleTabChange(tab)
    }
  },
  { immediate: true }
)

// ==================== 生命周期 ====================

onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 刷新用户信息
  refreshUserInfo()
  
  // 加载默认标签页数据
  loadMyPosts()
})
</script>

<style lang="scss" scoped>
.user-center-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.user-card {
  padding: 30px;
  margin-bottom: 24px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.avatar-section {
  display: flex;
  gap: 20px;
}

.user-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  font-size: 32px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.user-id {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.user-signature {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-top: 4px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stat-value {
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.stat-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.content-tabs {
  padding: 24px;
}

:deep(.el-tabs__item) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  &.is-active {
    color: #ff6b9d;
  }
}

:deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(255, 255, 255, 0.1);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: rgba(255, 255, 255, 0.6);
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 12px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.post-list {
  display: flex;
  flex-direction: column;
}

.my-post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    margin: 0 -16px;
    padding: 16px;
    border-radius: 10px;
  }
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.post-stats {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.my-comment-item {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    margin: 0 -16px;
    padding: 16px;
    border-radius: 10px;
  }
}

.comment-content {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

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

.purchase-list,
.earnings-list {
  display: flex;
  flex-direction: column;
}

.purchase-item,
.earnings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    margin: 0 -16px;
    padding: 16px;
    border-radius: 10px;
  }
}

.purchase-info,
.earnings-info {
  flex: 1;
  min-width: 0;
}

.purchase-title,
.earnings-title {
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.purchase-meta,
.earnings-meta {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.earnings-amount {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 600;
}

:deep(.el-dialog) {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;

  .el-dialog__title {
    color: #fff;
  }

  .el-form-item__label {
    color: rgba(255, 255, 255, 0.8);
  }

  .el-input__wrapper,
  .el-textarea__inner {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;

    &:hover {
      border-color: rgba(255, 107, 157, 0.3);
    }

    &.is-focus,
    &:focus {
      border-color: #ff6b9d;
    }
  }

  .el-input__inner,
  .el-textarea__inner {
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>
