<template>
  <div class="app-container">
    <!-- 全局导航栏 -->
    <Navbar />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * 应用根组件
 * 功能：全局布局、导航栏、主内容区域
 */
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import Navbar from '@/components/Navbar.vue'

/** 用户状态Store */
const userStore = useUserStore()

/**
 * 应用初始化
 * 恢复用户登录状态
 */
onMounted(() => {
  userStore.initUser()
})
</script>

<style>
.app-container {
  min-height: 100vh;
  padding-top: 64px;
}

.main-content {
  min-height: calc(100vh - 64px);
}
</style>
