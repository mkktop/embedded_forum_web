<template>
  <div class="posts-page">
    <div class="page-header">
      <h1 class="page-title">帖子管理</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar anime-card">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帖子标题"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="正常" :value="1" />
          <el-option label="已删除" :value="0" />
          <el-option label="审核中" :value="2" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="table-container anime-card">
      <el-table :data="postList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="250">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="post-title">{{ row.title }}</span>
              <div class="post-tags">
                <span v-if="row.is_pinned" class="tag pinned">置顶</span>
                <span v-if="row.is_highlighted" class="tag highlighted">精华</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author_name" label="作者" width="120">
          <template #default="{ row }">
            {{ row.author_nickname || row.author_name }}
          </template>
        </el-table-column>
        <el-table-column prop="category_name" label="版块" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="数据" width="120">
          <template #default="{ row }">
            <div class="stats-cell">
              <span><el-icon><View /></el-icon> {{ row.views || 0 }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ row.comments || 0 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.create_time, { relative: false }) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewPost(row)">查看</el-button>
            <el-button
              size="small"
              :type="row.is_pinned ? 'warning' : 'primary'"
              @click="handleTogglePin(row)"
            >
              {{ row.is_pinned ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button
              size="small"
              :type="row.is_highlighted ? 'warning' : 'success'"
              @click="handleToggleHighlight(row)"
            >
              {{ row.is_highlighted ? '取消精华' : '加精' }}
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadPosts"
          @current-change="loadPosts"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 帖子管理页面组件
 * 功能：帖子列表、搜索筛选、置顶/加精、删除
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, View, ChatDotRound } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/time'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 帖子列表 */
const postList = ref([])

/** 加载状态 */
const loading = ref(false)

/** 当前页码 */
const currentPage = ref(1)

/** 每页数量 */
const pageSize = ref(20)

/** 总数 */
const total = ref(0)

/** 搜索关键词 */
const searchKeyword = ref('')

/** 状态筛选 */
const filterStatus = ref('')

// ==================== 数据加载方法 ====================

/**
 * 加载帖子列表
 */
const loadPosts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (filterStatus.value !== '') params.status = filterStatus.value
    
    const res = await adminApi.getPosts(params)
    postList.value = res.data?.list || res.data || []
    total.value = res.data?.pagination?.total || res.data?.total || 0
  } catch (error) {
    console.error('加载帖子失败:', error)
    ElMessage.error('加载帖子失败')
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理方法 ====================

/**
 * 搜索
 */
const handleSearch = () => {
  currentPage.value = 1
  loadPosts()
}

/**
 * 查看帖子
 * @param {Object} post - 帖子对象
 */
const handleViewPost = (post) => {
  router.push(`/post/${post.id}`)
}

/**
 * 切换置顶状态
 * @param {Object} post - 帖子对象
 */
const handleTogglePin = async (post) => {
  const newPinned = post.is_pinned ? 0 : 1
  const action = newPinned ? '置顶' : '取消置顶'
  
  try {
    await adminApi.pinPost(post.id, newPinned)
    ElMessage.success(`${action}成功`)
    post.is_pinned = newPinned
  } catch (error) {
    console.error('操作失败:', error)
  }
}

/**
 * 切换精华状态
 * @param {Object} post - 帖子对象
 */
const handleToggleHighlight = async (post) => {
  const newHighlighted = post.is_highlighted ? 0 : 1
  const action = newHighlighted ? '加精' : '取消精华'
  
  try {
    await adminApi.highlightPost(post.id, newHighlighted)
    ElMessage.success(`${action}成功`)
    post.is_highlighted = newHighlighted
  } catch (error) {
    console.error('操作失败:', error)
  }
}

/**
 * 删除帖子
 * @param {Object} post - 帖子对象
 */
const handleDelete = async (post) => {
  try {
    await ElMessageBox.confirm(`确定要删除帖子 "${post.title}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await adminApi.updatePostStatus(post.id, 0)
    ElMessage.success('删除成功')
    loadPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// ==================== 工具方法 ====================

/**
 * 获取状态样式类
 * @param {number} status - 状态值
 * @returns {string} 样式类名
 */
const getStatusClass = (status) => {
  switch (status) {
    case 1: return 'active'
    case 0: return 'deleted'
    case 2: return 'pending'
    default: return ''
  }
}

/**
 * 获取状态文本
 * @param {number} status - 状态值
 * @returns {string} 状态文本
 */
const getStatusText = (status) => {
  switch (status) {
    case 1: return '正常'
    case 0: return '已删除'
    case 2: return '审核中'
    default: return '未知'
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadPosts()
})
</script>

<style lang="scss" scoped>
.posts-page {
  .page-title {
    color: #fff;
    font-size: 24px;
    margin-bottom: 24px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 20px;

  .toolbar-left {
    display: flex;
    gap: 12px;
  }
}

.table-container {
  padding: 20px;
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.post-title {
  color: #fff;
  font-size: 14px;
}

.post-tags {
  display: flex;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;

  &.pinned {
    background: rgba(255, 107, 157, 0.2);
    color: #ff6b9d;
  }

  &.highlighted {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }
}

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;

  &.active {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
  }

  &.deleted {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
  }

  &.pending {
    background: rgba(255, 193, 7, 0.2);
    color: #ffc107;
  }
}

.stats-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-table) {
  background: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.05);
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.05);
  --el-table-border-color: rgba(255, 255, 255, 0.1);
  --el-table-text-color: rgba(255, 255, 255, 0.8);
  --el-table-header-text-color: rgba(255, 255, 255, 0.6);
}
</style>
