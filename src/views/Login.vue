<template>
  <div class="login-page">
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
    
    <div class="login-container">
      <div class="login-left">
        <div class="anime-decoration">
          <div class="floating-char char-1">🌸</div>
          <div class="floating-char char-2">⭐</div>
          <div class="floating-char char-3">💫</div>
          <div class="floating-char char-4">🎀</div>
        </div>
        <h1 class="welcome-title">
          <span class="title-line">欢迎来到</span>
          <span class="title-main anime-title">超次元论坛</span>
        </h1>
        <p class="welcome-desc">
          ✨ 探索超次元的无限可能，与志同道合的伙伴一起分享热爱
        </p>
        <div class="features">
          <div class="feature-item">
            <span class="feature-icon">🎮</span>
            <span>精彩讨论</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">📚</span>
            <span>资源分享</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎁</span>
            <span>积分福利</span>
          </div>
        </div>
      </div>
      
      <div class="login-right">
        <div class="login-card anime-card">
          <div class="card-header">
            <h2 class="card-title">登录账号</h2>
            <p class="card-subtitle">开启你的超次元之旅 ✨</p>
          </div>
          
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleLogin"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                {{ loading ? '登录中...' : '登录 ✨' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-footer">
            <p>
              还没有账号？
              <router-link to="/register" class="register-link">
                立即注册 🎀
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const getParticleStyle = (index) => {
  const size = Math.random() * 6 + 2
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await userStore.login(loginForm)
      
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } catch (error) {
      console.error('登录失败:', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: linear-gradient(135deg, #ff6b9d, #c44eff);
  border-radius: 50%;
  animation: float-up linear infinite;
  opacity: 0.6;
}

@keyframes float-up {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.login-left {
  flex: 1;
  max-width: 500px;
}

.anime-decoration {
  position: relative;
  height: 100px;
  margin-bottom: 20px;
}

.floating-char {
  position: absolute;
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
}

.char-1 {
  left: 10%;
  animation-delay: 0s;
}

.char-2 {
  left: 30%;
  top: 20px;
  animation-delay: 0.5s;
}

.char-3 {
  left: 50%;
  animation-delay: 1s;
}

.char-4 {
  left: 70%;
  top: 10px;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.welcome-title {
  margin-bottom: 20px;
}

.title-line {
  display: block;
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10px;
}

.title-main {
  display: block;
  font-size: 48px;
  letter-spacing: 4px;
}

.welcome-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  line-height: 1.8;
}

.features {
  display: flex;
  gap: 30px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.feature-icon {
  font-size: 20px;
}

.login-right {
  flex: 1;
  max-width: 420px;
}

.login-card {
  padding: 40px;
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.card-title {
  font-size: 28px;
  color: #fff;
  margin-bottom: 8px;
}

.card-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  letter-spacing: 2px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.register-link {
  color: #ff6b9d;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    color: #c44eff;
    text-decoration: underline;
  }
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    gap: 40px;
  }
  
  .login-left {
    text-align: center;
    max-width: 100%;
  }
  
  .features {
    justify-content: center;
  }
  
  .welcome-title {
    .title-main {
      font-size: 36px;
    }
  }
}
</style>
