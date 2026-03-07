<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <!-- 筛选工具栏 -->
    <div class="toolbar anime-card">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名/昵称"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterRole" placeholder="角色" clearable style="width: 120px" @change="handleSearch">
          <el-option label="用户" value="user" />
          <el-option label="管理员" value="admin" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="table-container anime-card">
      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" class="user-avatar">
                {{ row.nickname?.charAt(0) || row.username?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">
                  {{ row.nickname || row.username }}
                  <span v-if="row.id === 1" class="super-admin-badge">超级管理员</span>
                </span>
                <span class="user-email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <span class="role-tag" :class="row.role">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="{ active: row.status === 1 }">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="100" />
        <el-table-column prop="create_time" label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.create_time, { relative: false }) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            
            <!-- 禁用/启用按钮：超级管理员(ID=1)不能被操作 -->
            <el-button
              v-if="row.id !== 1"
              size="small"
              :type="row.status === 1 ? 'danger' : 'success'"
              :disabled="!canOperateUser(row)"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            
            <!-- 设为/取消管理员按钮：只有超级管理员可以操作 -->
            <el-button
              v-if="row.id !== 1"
              size="small"
              :type="row.role === 'admin' ? 'warning' : 'primary'"
              :disabled="!isSuperAdmin"
              @click="handleToggleRole(row)"
            >
              {{ row.role === 'admin' ? '降为用户' : '设为管理员' }}
            </el-button>
            
            <!-- 超级管理员显示保护提示 -->
            <el-tooltip v-if="row.id === 1" content="超级管理员受保护，不可操作" placement="top">
              <el-button size="small" disabled>受保护</el-button>
            </el-tooltip>
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
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="500px">
      <div v-if="currentUser" class="user-detail">
        <div class="detail-item">
          <span class="detail-label">ID</span>
          <span class="detail-value">
            {{ currentUser.id }}
            <span v-if="currentUser.id === 1" class="super-admin-badge">超级管理员</span>
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">用户名</span>
          <span class="detail-value">{{ currentUser.username }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">昵称</span>
          <span class="detail-value">{{ currentUser.nickname || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">邮箱</span>
          <span class="detail-value">{{ currentUser.email }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">角色</span>
          <span class="detail-value">{{ currentUser.role === 'admin' ? '管理员' : '用户' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态</span>
          <span class="detail-value">{{ currentUser.status === 1 ? '正常' : '禁用' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">积分</span>
          <span class="detail-value">{{ currentUser.points || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">发帖数</span>
          <span class="detail-value">{{ currentUser.post_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">评论数</span>
          <span class="detail-value">{{ currentUser.comment_count || 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">注册时间</span>
          <span class="detail-value">{{ formatTime(currentUser.create_time, { relative: false }) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">个性签名</span>
          <span class="detail-value">{{ currentUser.signature || '-' }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 用户管理页面组件
 * 功能：用户列表、搜索筛选、状态切换、角色切换、查看详情
 * 
 * 权限规则：
 * 1. 超级管理员(ID=1)受保护，不能被任何操作
 * 2. 只有超级管理员可以任命/撤销管理员
 * 3. 普通管理员不能操作其他管理员账号
 */
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { formatTime } from '@/utils/time'

// ==================== 状态定义 ====================

/** 用户状态Store */
const userStore = useUserStore()

/** 用户列表 */
const userList = ref([])

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

/** 角色筛选 */
const filterRole = ref('')

/** 状态筛选 */
const filterStatus = ref('')

/** 详情对话框 */
const detailDialogVisible = ref(false)

/** 当前查看的用户 */
const currentUser = ref(null)

// ==================== 计算属性 ====================

/**
 * 判断当前用户是否为超级管理员(ID=1)
 * @returns {boolean}
 */
const isSuperAdmin = computed(() => {
  return userStore.userInfo?.id === 1
})

/**
 * 获取当前用户ID
 * @returns {number|null}
 */
const currentUserId = computed(() => {
  return userStore.userInfo?.id
})

// ==================== 权限检查方法 ====================

/**
 * 检查是否可以操作指定用户
 * 规则：
 * 1. 超级管理员(ID=1)不能被操作
 * 2. 普通管理员不能操作其他管理员
 * @param {Object} user - 要操作的用户
 * @returns {boolean}
 */
const canOperateUser = (user) => {
  // 超级管理员不能被操作
  if (user.id === 1) {
    return false
  }
  
  // 超级管理员可以操作所有人
  if (isSuperAdmin.value) {
    return true
  }
  
  // 普通管理员不能操作其他管理员
  if (user.role === 'admin') {
    return false
  }
  
  return true
}

/**
 * 检查是否可以修改用户角色
 * 只有超级管理员可以任命/撤销管理员
 * @param {Object} user - 要操作的用户
 * @returns {boolean}
 */
const canChangeRole = (user) => {
  // 超级管理员不能被修改角色
  if (user.id === 1) {
    return false
  }
  
  // 只有超级管理员可以修改角色
  return isSuperAdmin.value
}

// ==================== 数据加载方法 ====================

/**
 * 加载用户列表
 */
const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (filterRole.value) params.role = filterRole.value
    if (filterStatus.value !== '') params.status = filterStatus.value
    
    const res = await adminApi.getUsers(params)
    userList.value = res.data?.list || res.data || []
    total.value = res.data?.pagination?.total || res.data?.total || 0
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载用户失败')
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
  loadUsers()
}

/**
 * 查看用户详情
 * @param {Object} user - 用户对象
 */
const handleViewDetail = async (user) => {
  try {
    const res = await adminApi.getUserDetail(user.id)
    console.log('用户详情响应:', res.data)
    
    // API返回嵌套结构：user, profile, auth, stats
    const data = res.data
    currentUser.value = {
      ...data.user,
      signature: data.profile?.signature,
      gender: data.profile?.gender,
      birthday: data.profile?.birthday,
      points: data.auth?.points,
      download_limit: data.auth?.download_limit,
      post_count: data.stats?.post_count?.total || 0,
      comment_count: data.stats?.comment_count || 0
    }
    
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

/**
 * 切换用户状态
 * @param {Object} user - 用户对象
 */
const handleToggleStatus = async (user) => {
  // 权限检查
  if (!canOperateUser(user)) {
    ElMessage.warning('没有权限操作此用户')
    return
  }
  
  const newStatus = user.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '禁用' : '启用'
  
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${user.nickname || user.username}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await adminApi.updateUserStatus(user.id, newStatus)
    ElMessage.success(`${action}成功`)
    user.status = newStatus
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}

/**
 * 切换用户角色
 * 只有超级管理员可以操作
 * @param {Object} user - 用户对象
 */
const handleToggleRole = async (user) => {
  // 权限检查：只有超级管理员可以修改角色
  if (!isSuperAdmin.value) {
    ElMessage.warning('只有超级管理员可以任命/撤销管理员')
    return
  }
  
  // 超级管理员不能被修改角色
  if (user.id === 1) {
    ElMessage.warning('超级管理员角色不能被修改')
    return
  }
  
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  const action = newRole === 'admin' ? '设为管理员' : '降为用户'
  
  try {
    await ElMessageBox.confirm(`确定要将用户 "${user.nickname || user.username}" ${action}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await adminApi.updateUserRole(user.id, newRole)
    ElMessage.success(`${action}成功`)
    user.role = newRole
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
    }
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-email {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.super-admin-badge {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.role-tag {
  padding: 2px 8px;
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

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);

  &.active {
    background: rgba(0, 212, 255, 0.2);
    color: #00d4ff;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  gap: 16px;
}

.detail-label {
  width: 80px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.detail-value {
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
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

:deep(.el-dialog) {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;

  .el-dialog__title {
    color: #fff;
  }
}
</style>
