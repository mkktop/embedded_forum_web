<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title anime-title">超次元论坛</h1>
        <p class="page-subtitle">✨ 探索超次元的无限可能 ✨</p>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <!-- 版块列表 -->
        <div class="sidebar-card anime-card">
          <h3 class="sidebar-title">
            <el-icon><Folder /></el-icon>
            <span>版块</span>
          </h3>
          <div class="category-list">
            <div
              class="category-item"
              :class="{ active: !currentCategoryId }"
              @click="selectCategory(null)"
            >
              <el-icon><Grid /></el-icon>
              <span>全部</span>
              <span class="count">{{ totalPosts }}</span>
            </div>
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: currentCategoryId === category.id }"
              @click="selectCategory(category.id)"
            >
              <el-icon><FolderOpened /></el-icon>
              <span>{{ category.name }}</span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="sidebar-card anime-card">
          <h3 class="sidebar-title">
            <el-icon><DataAnalysis /></el-icon>
            <span>统计</span>
          </h3>
          <div class="stats-list">
            <div class="stat-item">
              <span class="stat-label">帖子总数</span>
              <span class="stat-value">{{ postStats.total || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">正常帖子</span>
              <span class="stat-value">{{ postStats.normal || 0 }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 帖子列表区域 -->
      <div class="content-area">
        <!-- 工具栏 -->
        <div class="toolbar anime-card">
          <div class="toolbar-left">
            <span class="result-info">
              共 <strong>{{ pagination.total }}</strong> 篇帖子
            </span>
          </div>
          <div class="toolbar-right">
            <!-- 排序选择 -->
            <el-select
              v-model="orderBy"
              placeholder="排序方式"
              size="large"
              @change="handleOrderChange"
            >
              <el-option label="最新发布" value="latest" />
              <el-option label="最热门" value="popular" />
              <el-option label="置顶优先" value="pinned" />
            </el-select>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 帖子列表 -->
        <div v-else-if="postList.length > 0" class="post-list">
          <PostCard
            v-for="post in postList"
            :key="post.id"
            :post="post"
          />
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state anime-card">
          <el-icon class="empty-icon"><Document /></el-icon>
          <p>暂无帖子</p>
          <router-link v-if="userStore.isLoggedIn" to="/post/create" class="create-btn">
            发布第一篇帖子
          </router-link>
        </div>

        <!-- 分页 -->
        <div v-if="postList.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 首页组件
 * 功能：帖子列表展示、版块筛选、搜索排序、分页
 */
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { postApi, categoryApi } from '@/api'
import { ElMessage } from 'element-plus'
import {
  Folder,
  FolderOpened,
  Grid,
  DataAnalysis,
  Loading,
  Document
} from '@element-plus/icons-vue'
import PostCard from '@/components/PostCard.vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const route = useRoute()
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 加载状态 */
const loading = ref(false)

/** 版块列表 */
const categories = ref([])

/** 帖子列表 */
const postList = ref([])

/** 当前选中的版块ID */
const currentCategoryId = ref(null)

/** 排序方式 */
const orderBy = ref('latest')

/** 当前页码 */
const currentPage = ref(1)

/** 每页数量 */
const pageSize = ref(20)

/** 分页信息 */
const pagination = reactive({
  total: 0,
  totalPages: 0
})

/** 帖子统计信息 */
const postStats = reactive({
  total: 0,
  normal: 0,
  deleted: 0,
  pending: 0
})

/** 帖子总数（计算属性） */
const totalPosts = computed(() => postStats.total)

// ==================== 数据加载方法 ====================

/**
 * 加载版块列表
 */
const loadCategories = async () => {
  try {
    const res = await categoryApi.getActive()
    categories.value = res.data || []
  } catch (error) {
    console.error('加载版块失败:', error)
  }
}

/**
 * 加载帖子列表
 */
const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderBy: orderBy.value
    }

    // 添加版块筛选
    if (currentCategoryId.value) {
      params.category_id = currentCategoryId.value
    }

    // 添加搜索关键词
    if (route.query.keyword) {
      params.keyword = route.query.keyword
    }

    const res = await postApi.getList(params)
    postList.value = res.data.list || []
    pagination.total = res.data.pagination?.total || 0
    pagination.totalPages = res.data.pagination?.totalPages || 0
  } catch (error) {
    console.error('加载帖子失败:', error)
    ElMessage.error('加载帖子失败')
  } finally {
    loading.value = false
  }
}

/**
 * 加载帖子统计信息
 */
const loadPostStats = async () => {
  try {
    const res = await postApi.getStats()
    postStats.total = res.data.total || 0
    postStats.normal = res.data.normal || 0
    postStats.deleted = res.data.deleted || 0
    postStats.pending = res.data.pending || 0
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// ==================== 事件处理方法 ====================

/**
 * 选择版块
 * @param {number|null} categoryId - 版块ID，null表示全部
 */
const selectCategory = (categoryId) => {
  currentCategoryId.value = categoryId
  currentPage.value = 1
  loadPosts()
}

/**
 * 处理排序方式变更
 */
const handleOrderChange = () => {
  currentPage.value = 1
  loadPosts()
}

/**
 * 处理每页数量变更
 * @param {number} size - 新的每页数量
 */
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadPosts()
}

/**
 * 处理页码变更
 * @param {number} page - 新的页码
 */
const handlePageChange = (page) => {
  currentPage.value = page
  loadPosts()
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ==================== 监听器 ====================

/**
 * 监听路由查询参数变化
 * 当搜索关键词变化时重新加载帖子
 */
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword !== undefined) {
      currentPage.value = 1
      loadPosts()
    }
  }
)

// ==================== 生命周期 ====================

/**
 * 组件挂载时加载数据
 */
onMounted(() => {
  loadCategories()
  loadPosts()
  loadPostStats()
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100%;
}

.page-header {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(196, 78, 255, 0.1));
  padding: 40px 24px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 36px;
  margin-bottom: 12px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 24px;
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
}

.sidebar-card {
  padding: 20px;
  margin-bottom: 20px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
  }

  &.active {
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(196, 78, 255, 0.2));
    color: #ff6b9d;
  }

  .count {
    margin-left: auto;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
  }
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.stat-value {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.content-area {
  flex: 1;
  min-width: 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.toolbar-left {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;

  strong {
    color: #ff6b9d;
  }
}

.toolbar-right {
  :deep(.el-select) {
    width: 140px;
  }

  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;

    &:hover {
      border-color: rgba(255, 107, 157, 0.3);
    }
  }

  :deep(.el-select__placeholder) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.el-select__selected-item) {
    color: #fff;
  }
}

.loading-container {
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
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 20px;
}

.create-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  color: #fff;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;

  :deep(.el-pagination) {
    --el-pagination-bg-color: rgba(255, 255, 255, 0.08);
    --el-pagination-text-color: rgba(255, 255, 255, 0.7);
    --el-pagination-button-disabled-bg-color: rgba(255, 255, 255, 0.05);
    --el-pagination-hover-color: #ff6b9d;
  }

  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    color: #fff;
  }
}

@media (max-width: 900px) {
  .main-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    order: 1;
  }

  .content-area {
    order: 0;
  }
}
</style>
