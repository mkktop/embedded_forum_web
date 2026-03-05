<template>
  <div class="comments-page">
    <div class="page-header">
      <h1 class="page-title">评论管理</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar anime-card">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索评论内容"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="table-container anime-card">
      <el-table :data="commentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="content" label="评论内容" min-width="300">
          <template #default="{ row }">
            <div class="content-cell">
              {{ row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author_name" label="评论者" width="120">
          <template #default="{ row }">
            {{ row.author_nickname || row.author_name }}
          </template>
        </el-table-column>
        <el-table-column prop="post_title" label="所属帖子" width="200">
          <template #default="{ row }">
            <span class="post-link" @click="goToPost(row.post_id)">
              {{ row.post_title || `帖子${row.post_id}` }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="评论时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.create_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="handleDelete(row)">
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
          @size-change="loadComments"
          @current-change="loadComments"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 评论管理页面组件
 * 功能：评论列表、搜索、删除
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 评论列表 */
const commentList = ref([])

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

// ==================== 数据加载方法 ====================

/**
 * 加载评论列表
 */
const loadComments = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (searchKeyword.value) params.keyword = searchKeyword.value
    
    const res = await adminApi.getComments(params)
    commentList.value = res.data?.list || res.data || []
    total.value = res.data?.pagination?.total || res.data?.total || 0
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
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
  loadComments()
}

/**
 * 跳转到帖子
 * @param {number} postId - 帖子ID
 */
const goToPost = (postId) => {
  router.push(`/post/${postId}`)
}

/**
 * 删除评论
 * @param {Object} comment - 评论对象
 */
const handleDelete = async (comment) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await adminApi.deleteComment(comment.id)
    ElMessage.success('删除成功')
    loadComments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// ==================== 工具方法 ====================

/**
 * 格式化时间
 * @param {string} timeStr - ISO时间字符串
 * @returns {string} 格式化后的时间
 */
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

// ==================== 生命周期 ====================

onMounted(() => {
  loadComments()
})
</script>

<style lang="scss" scoped>
.comments-page {
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

.content-cell {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-link {
  color: #00d4ff;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
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
