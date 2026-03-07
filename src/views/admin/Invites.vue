<template>
  <div class="invites-page">
    <div class="page-header">
      <h1 class="page-title">邀请码管理</h1>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar anime-card">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          生成邀请码
        </el-button>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="loadInviteCodes">
          <el-option label="未使用" :value="0" />
          <el-option label="已使用" :value="1" />
        </el-select>
      </div>
    </div>

    <!-- 邀请码列表 -->
    <div class="table-container anime-card">
      <el-table :data="inviteCodeList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="邀请码" min-width="280">
          <template #default="{ row }">
            <div class="code-cell">
              <span class="code-text">{{ row.code }}</span>
              <el-button size="small" text type="primary" @click="copyCode(row.code)">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="{ used: row.used === 1 || row.used === true }">
              {{ (row.used === 1 || row.used === true) ? '已使用' : '未使用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="used_by_name" label="使用者" width="120">
          <template #default="{ row }">
            {{ row.used_by_name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_by_name" label="创建者" width="120">
          <template #default="{ row }">
            {{ row.created_by_name || '系统' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.create_time, { relative: false }) }}
          </template>
        </el-table-column>
        <el-table-column prop="used_at" label="使用时间" width="160">
          <template #default="{ row }">
            {{ row.used_at ? formatTime(row.used_at, { relative: false }) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.used !== 1 && row.used !== true"
              size="small"
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
            <span v-else class="disabled-text">-</span>
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
          @size-change="loadInviteCodes"
          @current-change="loadInviteCodes"
        />
      </div>
    </div>

    <!-- 生成邀请码对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="生成邀请码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="生成数量">
          <el-input-number v-model="createCount" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">
          生成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 邀请码管理页面组件
 * 功能：邀请码列表、生成、删除
 */
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, DocumentCopy } from '@element-plus/icons-vue'
import { formatTime } from '@/utils/time'

// ==================== 状态定义 ====================

/** 邀请码列表 */
const inviteCodeList = ref([])

/** 加载状态 */
const loading = ref(false)

/** 生成状态 */
const creating = ref(false)

/** 显示创建对话框 */
const showCreateDialog = ref(false)

/** 生成数量 */
const createCount = ref(1)

/** 当前页码 */
const currentPage = ref(1)

/** 每页数量 */
const pageSize = ref(20)

/** 总数 */
const total = ref(0)

/** 状态筛选 */
const filterStatus = ref('')

// ==================== 数据加载方法 ====================

/**
 * 加载邀请码列表
 */
const loadInviteCodes = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    // API参数使用used，不是is_used
    if (filterStatus.value !== '') params.used = filterStatus.value
    
    const res = await adminApi.getInviteCodes(params)
    console.log('邀请码列表响应:', res.data)
    inviteCodeList.value = res.data?.list || res.data || []
    total.value = res.data?.pagination?.total || res.data?.total || 0
  } catch (error) {
    console.error('加载邀请码失败:', error)
    ElMessage.error('加载邀请码失败')
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理方法 ====================

/**
 * 生成邀请码
 */
const handleCreate = async () => {
  creating.value = true
  try {
    const res = await adminApi.createInviteCodes(createCount.value)
    ElMessage.success(`成功生成 ${createCount.value} 个邀请码`)
    showCreateDialog.value = false
    loadInviteCodes()
  } catch (error) {
    console.error('生成失败:', error)
  } finally {
    creating.value = false
  }
}

/**
 * 删除邀请码
 * @param {Object} code - 邀请码对象
 */
const handleDelete = async (code) => {
  try {
    await ElMessageBox.confirm(`确定要删除邀请码 "${code.code}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await adminApi.deleteInviteCode(code.id)
    ElMessage.success('删除成功')
    loadInviteCodes()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// ==================== 工具方法 ====================

/**
 * 复制邀请码到剪贴板
 * @param {string} code - 邀请码
 */
const copyCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = code
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('已复制到剪贴板')
  }
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadInviteCodes()
})
</script>

<style lang="scss" scoped>
.invites-page {
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

.code-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-text {
  font-family: monospace;
  font-size: 13px;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;

  &.used {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
  }
}

.disabled-text {
  color: rgba(255, 255, 255, 0.3);
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
}
</style>
