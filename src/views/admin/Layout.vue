<template>
  <div class="admin-layout">
    <aside class="admin-sidebar anime-card">
      <div class="sidebar-header">
        <h2 class="sidebar-title anime-title">管理后台</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据面板</span>
        </router-link>
        <router-link to="/admin/users" class="nav-item" active-class="active">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/posts" class="nav-item" active-class="active">
          <el-icon><Document /></el-icon>
          <span>帖子管理</span>
        </router-link>
        <router-link to="/admin/comments" class="nav-item" active-class="active">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </router-link>
        <router-link to="/admin/categories" class="nav-item" active-class="active">
          <el-icon><Folder /></el-icon>
          <span>版块管理</span>
        </router-link>
        <router-link to="/admin/invites" class="nav-item" active-class="active">
          <el-icon><Ticket /></el-icon>
          <span>邀请码管理</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <router-link to="/" class="back-home">
          <el-icon><Back /></el-icon>
          <span>返回前台</span>
        </router-link>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { DataAnalysis, User, Document, ChatDotRound, Folder, Ticket, Back } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 240px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.sidebar-title {
  font-size: 20px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.active {
    background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(196, 78, 255, 0.2));
    color: #ff6b9d;
  }
}

.sidebar-footer {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.back-home {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

.admin-main {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
</style>
