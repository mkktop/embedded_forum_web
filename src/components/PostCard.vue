<template>
  <router-link :to="`/post/${post.id}`" class="post-card anime-card">
    <!-- 帖子头部 -->
    <div class="post-header">
      <!-- 置顶/加精标签 -->
      <div class="post-tags">
        <span v-if="post.is_pinned" class="tag pinned">
          <el-icon><Top /></el-icon>
          置顶
        </span>
        <span v-if="post.is_highlighted" class="tag highlighted">
          <el-icon><Star /></el-icon>
          精华
        </span>
      </div>
      <!-- 版块标签 -->
      <span class="category-tag">{{ post.category_name }}</span>
    </div>

    <!-- 帖子标题 -->
    <h3 class="post-title">{{ post.title }}</h3>

    <!-- 帖子摘要 -->
    <p class="post-summary">{{ post.summary }}</p>

    <!-- 帖子底部 -->
    <div class="post-footer">
      <!-- 作者信息 -->
      <div class="author-info">
        <router-link :to="`/user/${post.user_id}`" class="author-avatar-link" @click.prevent.stop>
          <el-avatar :size="28" class="author-avatar">
            {{ post.author_name?.charAt(0) || 'U' }}
          </el-avatar>
        </router-link>
        <div class="author-detail">
          <router-link :to="`/user/${post.user_id}`" class="author-name" @click.prevent.stop>
            {{ post.author_nickname || post.author_name }}
          </router-link>
          <span class="author-id">ID: {{ post.user_id }}</span>
        </div>
        <span class="post-time">{{ formatTime(post.create_time) }}</span>
      </div>

      <!-- 统计数据 -->
      <div class="post-stats">
        <span class="stat-item">
          <el-icon><View /></el-icon>
          {{ post.views || 0 }}
        </span>
        <span class="stat-item">
          <el-icon><ChatDotRound /></el-icon>
          {{ post.comments || 0 }}
        </span>
        <span class="stat-item">
          <el-icon><Star /></el-icon>
          {{ post.likes || 0 }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
/**
 * 帖子卡片组件
 * 功能：展示帖子摘要信息，包括标题、摘要、作者、统计数据
 */
import { formatTime } from '@/utils/time'

// ==================== Props定义 ====================

/**
 * 组件属性
 * @property {Object} post - 帖子数据对象
 */
defineProps({
  post: {
    type: Object,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.post-card {
  display: block;
  padding: 20px;
  text-decoration: none;
  cursor: pointer;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.post-tags {
  display: flex;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tag.pinned {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(255, 107, 157, 0.1));
  color: #ff6b9d;
}

.tag.highlighted {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
  color: #ffc107;
}

.category-tag {
  padding: 4px 12px;
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  border-radius: 12px;
  font-size: 12px;
}

.post-title {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.post-card:hover .post-title {
  color: #ff6b9d;
}

.post-summary {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar-link {
  text-decoration: none;
  flex-shrink: 0;
}

.author-avatar {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.author-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.author-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ff6b9d;
  }
}

.author-id {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
}

.post-time {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  transition: color 0.3s ease;
}

.post-card:hover .stat-item {
  color: rgba(255, 255, 255, 0.7);
}
</style>
