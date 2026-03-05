<template>
  <div class="categories-page">
    <div class="page-header">
      <h1 class="page-title">版块管理</h1>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar anime-card">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建版块
        </el-button>
      </div>
    </div>

    <!-- 版块列表 -->
    <div class="table-container anime-card">
      <el-table :data="categoryList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="版块名称" width="200" />
        <el-table-column prop="description" label="描述" min-width="300" />
        <el-table-column prop="post_count" label="帖子数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="{ active: row.status === 1 }">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button
                size="small"
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCategory ? '编辑版块' : '新建版块'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="categoryForm" label-position="top">
        <el-form-item label="版块名称" required>
          <el-input v-model="categoryForm.name" placeholder="请输入版块名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="版块描述">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入版块描述"
            maxlength="200"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="categoryForm.sort_order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ editingCategory ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 版块管理页面组件
 * 功能：版块列表、创建、编辑、删除、启用/禁用
 */
import { ref, reactive, onMounted, watch } from 'vue'
import { adminApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 版块列表 */
const categoryList = ref([])

/** 加载状态 */
const loading = ref(false)

/** 提交状态 */
const submitting = ref(false)

/** 显示创建对话框 */
const showCreateDialog = ref(false)

/** 编辑中的版块 */
const editingCategory = ref(null)

/** 表单数据 */
const categoryForm = reactive({
  name: '',
  description: '',
  sort_order: 0
})

// ==================== 数据加载方法 ====================

/**
 * 加载版块列表
 */
const loadCategories = async () => {
  loading.value = true
  try {
    const { categoryApi } = await import('@/api')
    // 使用 getAll 获取所有版块（包含禁用状态）
    const catRes = await categoryApi.getAll()
    console.log('版块列表响应:', catRes)
    // API返回 { list: [...], pagination: {...} }
    categoryList.value = catRes.data?.list || catRes.data || []
  } catch (error) {
    console.error('加载版块失败:', error)
    ElMessage.error('加载版块失败')
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理方法 ====================

/**
 * 编辑版块
 * @param {Object} category - 版块对象
 */
const handleEdit = (category) => {
  editingCategory.value = category
  categoryForm.name = category.name
  categoryForm.description = category.description || ''
  categoryForm.sort_order = category.sort_order || 0
  showCreateDialog.value = true
}

/**
 * 切换状态
 * @param {Object} category - 版块对象
 */
const handleToggleStatus = async (category) => {
  const newStatus = category.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  
  try {
    await adminApi.updateCategory(category.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    // 重新加载列表以获取最新数据
    loadCategories()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

/**
 * 删除版块
 * @param {Object} category - 版块对象
 */
const handleDelete = async (category) => {
  try {
    await ElMessageBox.confirm(`确定要删除版块 "${category.name}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await adminApi.deleteCategory(category.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!categoryForm.name.trim()) {
    ElMessage.warning('请输入版块名称')
    return
  }
  
  submitting.value = true
  try {
    if (editingCategory.value) {
      await adminApi.updateCategory(editingCategory.value.id, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        sort_order: categoryForm.sort_order
      })
      ElMessage.success('保存成功')
    } else {
      await adminApi.createCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        sort_order: categoryForm.sort_order
      })
      ElMessage.success('创建成功')
    }
    
    showCreateDialog.value = false
    loadCategories()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    submitting.value = false
  }
}

// ==================== 监听器 ====================

/**
 * 监听对话框关闭，重置表单
 */
watch(showCreateDialog, (val) => {
  if (!val) {
    editingCategory.value = null
    categoryForm.name = ''
    categoryForm.description = ''
    categoryForm.sort_order = 0
  }
})

// ==================== 生命周期 ====================

onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss" scoped>
.categories-page {
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
}

.table-container {
  padding: 20px;
}

.action-buttons {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
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

  .el-input__wrapper,
  .el-textarea__inner {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
  }

  .el-input__inner,
  .el-textarea__inner {
    color: #fff;
  }
}
</style>
