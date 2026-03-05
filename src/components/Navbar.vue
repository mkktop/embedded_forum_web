<template>
  <header class="navbar">
    <div class="navbar-container">
      <!-- Logo区域 -->
      <router-link to="/" class="navbar-brand">
        <span class="brand-icon">超</span>
        <span class="brand-text anime-title">超次元论坛</span>
      </router-link>

      <!-- 搜索框 -->
      <div class="navbar-search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帖子..."
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon" @click="handleSearch"><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 导航菜单 -->
      <nav class="navbar-menu">
        <router-link to="/" class="menu-item" active-class="active">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link v-if="userStore.isLoggedIn" to="/signin" class="menu-item" active-class="active">
          <el-icon><Calendar /></el-icon>
          <span>签到</span>
        </router-link>
      </nav>

      <!-- 用户区域 -->
      <div class="navbar-user">
        <!-- 未登录状态 -->
        <template v-if="!userStore.isLoggedIn">
          <router-link to="/login" class="user-btn login-btn">
            登录
          </router-link>
          <router-link to="/register" class="user-btn register-btn">
            注册
          </router-link>
        </template>

        <!-- 已登录状态 -->
        <template v-else>
          <!-- 发帖按钮 -->
          <router-link to="/post/create" class="post-btn">
            <el-icon><Plus /></el-icon>
            <span>发帖</span>
          </router-link>

          <!-- 用户下拉菜单 -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :size="36" :src="userStore.userInfo?.avatar">
                {{ userStore.nickname?.charAt(0) || 'U' }}
              </el-avatar>
              <span class="user-name">{{ userStore.nickname }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="myposts">
                  <el-icon><Document /></el-icon>
                  我的帖子
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><Star /></el-icon>
                  我的收藏
                </el-dropdown-item>
                <el-dropdown-item v-if="userStore.isAdmin" command="admin" divided>
                  <el-icon><Setting /></el-icon>
                  管理后台
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
/**
 * 导航栏组件
 * 功能：Logo、搜索框、导航菜单、用户状态显示、用户下拉菜单
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import {
  Search,
  HomeFilled,
  Calendar,
  Plus,
  ArrowDown,
  User,
  Document,
  Star,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 搜索关键词 */
const searchKeyword = ref('')

// ==================== 方法定义 ====================

/**
 * 执行搜索
 * 跳转到首页并带上搜索参数
 */
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/',
      query: { keyword: searchKeyword.value.trim() }
    })
  }
}

/**
 * 处理下拉菜单命令
 * @param {string} command - 菜单命令
 */
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      // 跳转个人中心
      router.push('/user')
      break
    case 'myposts':
      // 跳转我的帖子
      router.push({ path: '/user', query: { tab: 'posts' } })
      break
    case 'favorites':
      // 跳转我的收藏
      router.push({ path: '/user', query: { tab: 'favorites' } })
      break
    case 'admin':
      // 跳转管理后台
      router.push('/admin')
      break
    case 'logout':
      // 退出登录
      userStore.logout()
      router.push('/')
      break
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(20, 20, 35, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  border-radius: 10px;
  color: #fff;
  font-weight: bold;
  font-size: 18px;
}

.brand-text {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
}

.navbar-search {
  flex: 1;
  max-width: 400px;

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: none;
    padding: 0 16px;
    height: 40px;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 107, 157, 0.3);
    }

    &.is-focus {
      border-color: #ff6b9d;
      background: rgba(255, 255, 255, 0.12);
    }
  }

  :deep(.el-input__inner) {
    color: #fff;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .search-icon {
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: #ff6b9d;
    }
  }
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: #ff6b9d;
    background: rgba(255, 107, 157, 0.15);
  }
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.user-btn {
  padding: 8px 20px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn {
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.1);
  }
}

.register-btn {
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  color: #fff;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
  }
}

.post-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #00d4ff, #c44eff);
  color: #fff;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
  }
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px 4px 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
}

.user-name {
  color: #fff;
  font-size: 14px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

:deep(.el-dropdown-menu) {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 8px;
  border-radius: 12px;
}

:deep(.el-dropdown-menu__item) {
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 10px 16px;

  &:hover {
    background: rgba(255, 107, 157, 0.15);
    color: #ff6b9d;
  }
}

@media (max-width: 900px) {
  .navbar-search {
    display: none;
  }

  .menu-item span {
    display: none;
  }
}
</style>
