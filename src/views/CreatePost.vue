<template>
  <div class="create-post-page">
    <div class="page-header">
      <h1 class="page-title anime-title">发布帖子</h1>
      <p class="page-subtitle">分享你的想法，与大家交流 ✨</p>
    </div>

    <div class="form-container anime-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="post-form"
      >
        <!-- 版块选择 -->
        <el-form-item label="选择版块" prop="category_id">
          <el-select
            v-model="formData.category_id"
            placeholder="请选择版块"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            >
              <div class="category-option">
                <el-icon><FolderOpened /></el-icon>
                <span>{{ category.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 标题输入 -->
        <el-form-item label="帖子标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入帖子标题（最多100字）"
            size="large"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <!-- 内容输入 -->
        <el-form-item label="帖子内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            placeholder="请输入帖子内容..."
            :rows="12"
            maxlength="10000"
            show-word-limit
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button size="large" @click="handleCancel">
            取消
          </el-button>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmit"
          >
            发布帖子
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 发帖提示 -->
    <div class="post-tips anime-card">
      <h3 class="tips-title">
        <el-icon><InfoFilled /></el-icon>
        发帖须知
      </h3>
      <ul class="tips-list">
        <li>请选择合适的版块发布帖子</li>
        <li>标题请简明扼要，准确描述帖子主题</li>
        <li>内容请遵守社区规范，文明发言</li>
        <li>禁止发布违法、违规、广告等内容</li>
        <li>发帖可获得积分奖励</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
/**
 * 发布帖子页面组件
 * 功能：发帖表单、版块选择、表单验证、发布提交
 */
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { postApi, categoryApi } from '@/api'
import { ElMessage } from 'element-plus'
import { FolderOpened, InfoFilled } from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 表单引用 */
const formRef = ref(null)

/** 提交中状态 */
const submitting = ref(false)

/** 版块列表 */
const categories = ref([])

/** 表单数据 */
const formData = reactive({
  category_id: null,
  title: '',
  content: ''
})

/** 表单验证规则 */
const formRules = {
  category_id: [
    { required: true, message: '请选择版块', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度为2-100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, max: 10000, message: '内容长度为10-10000个字符', trigger: 'blur' }
  ]
}

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

// ==================== 事件处理方法 ====================

/**
 * 取消发布
 */
const handleCancel = () => {
  router.back()
}

/**
 * 提交发布
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      const res = await postApi.create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category_id: formData.category_id
      })
      
      ElMessage.success('发布成功！')
      
      // 跳转到帖子详情页
      router.push(`/post/${res.data.id}`)
    } catch (error) {
      console.error('发布失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

// ==================== 生命周期 ====================

/**
 * 组件挂载时加载数据
 */
onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  loadCategories()
})
</script>

<style lang="scss" scoped>
.create-post-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 32px;
  margin-bottom: 12px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
}

.form-container {
  padding: 30px;
  margin-bottom: 24px;
}

.post-form {
  :deep(.el-form-item__label) {
    color: rgba(255, 255, 255, 0.8);
    font-size: 15px;
    font-weight: 500;
    padding-bottom: 8px;
  }

  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;

    &:hover {
      border-color: rgba(255, 107, 157, 0.3);
    }

    &.is-focused {
      border-color: #ff6b9d;
    }
  }

  :deep(.el-select__placeholder) {
    color: rgba(255, 255, 255, 0.4);
  }

  :deep(.el-select__selected-item) {
    color: #fff;
  }

  :deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 15px;
    line-height: 1.8;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:hover {
      border-color: rgba(255, 107, 157, 0.3);
    }

    &:focus {
      border-color: #ff6b9d;
    }
  }
}

.category-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  margin-top: 30px;
  margin-bottom: 0;

  :deep(.el-form-item__content) {
    justify-content: flex-end;
    gap: 12px;
  }

  :deep(.el-button:not(.el-button--primary)) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }
  }
}

.post-tips {
  padding: 24px;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 16px;
  margin-bottom: 16px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    line-height: 2;

    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #ff6b9d;
    }
  }
}

:deep(.el-select-dropdown) {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

:deep(.el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.8);

  &:hover {
    background: rgba(255, 107, 157, 0.15);
  }

  &.selected {
    color: #ff6b9d;
  }
}
</style>
