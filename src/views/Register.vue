<template>
  <div class="register-page">
    <div class="particles">
      <div v-for="i in 25" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
    
    <div class="register-container">
      <div class="register-left">
        <div class="anime-decoration">
          <div class="floating-char char-1">🌟</div>
          <div class="floating-char char-2">🎵</div>
          <div class="floating-char char-3">💖</div>
          <div class="floating-char char-4">✨</div>
        </div>
        <h1 class="welcome-title">
          <span class="title-line">加入</span>
          <span class="title-main anime-title">超次元论坛</span>
        </h1>
        <p class="welcome-desc">
          🎀 开启你的超次元冒险，与万千同好一起分享热爱
        </p>
        <div class="benefits">
          <div class="benefit-item">
            <div class="benefit-icon">🎁</div>
            <div class="benefit-text">
              <h4>新人福利</h4>
              <p>注册即送积分礼包</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">💬</div>
            <div class="benefit-text">
              <h4>自由交流</h4>
              <p>畅所欲言分享观点</p>
            </div>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🏆</div>
            <div class="benefit-text">
              <h4>积分系统</h4>
              <p>签到互动赚积分</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="register-right">
        <div class="register-card anime-card">
          <div class="card-header">
            <h2 class="card-title">注册账号</h2>
            <p class="card-subtitle">成为超次元论坛的一员 🌟</p>
          </div>
          
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            @submit.prevent="handleRegister"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="用户名（4-20字符）"
                size="large"
                :prefix-icon="User"
              />
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                size="large"
                :prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="密码（6-20字符）"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="确认密码"
                size="large"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>
            
            <el-form-item prop="inviteCode">
              <el-input
                v-model="registerForm.inviteCode"
                placeholder="请输入邀请码"
                size="large"
                :prefix-icon="Ticket"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-btn"
                :loading="loading"
                @click="handleRegister"
              >
                {{ loading ? '注册中...' : '注册账号 🎀' }}
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="register-footer">
            <p>
              已有账号？
              <router-link to="/login" class="login-link">
                立即登录 ✨
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
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { User, Lock, Message, Ticket } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: ''
})

const validateUsername = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 4 || value.length > 20) {
    callback(new Error('用户名长度为4-20个字符'))
  } else {
    callback()
  }
}

const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度为6-20个字符'))
  } else {
    if (registerForm.confirmPassword) {
      registerFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请确认密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value) {
    callback(new Error('请输入邮箱'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, validator: validateUsername, trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  inviteCode: [
    { required: true, message: '请输入邀请码', trigger: 'blur' }
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

/**
 * 处理用户注册
 * 验证表单后提交注册请求
 */
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    // 使用Promise方式验证表单
    const valid = await registerFormRef.value.validate().catch((error) => {
      console.log('表单验证失败:', error)
      return false
    })
    
    if (!valid) {
      return
    }
    
    loading.value = true
    
    // 构建提交数据，排除confirmPassword
    const submitData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      inviteCode: registerForm.inviteCode
    }
    
    console.log('提交注册数据:', submitData)
    
    await userStore.register(submitData)
    
    // 显示成功提示
    ElMessage.success({
      message: '注册成功！3秒后自动跳转首页...',
      duration: 3000
    })
    
    // 3秒后跳转到首页
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (error) {
    console.error('注册失败:', error)
    // 显示后端返回的错误信息
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
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
  background: linear-gradient(135deg, #00d4ff, #c44eff);
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

.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  max-width: 1200px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.register-left {
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

.benefits {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(8px);
  }
}

.benefit-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(196, 78, 255, 0.2));
  border-radius: 12px;
}

.benefit-text {
  h4 {
    color: #fff;
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
  }
}

.register-right {
  flex: 1;
  max-width: 420px;
}

.register-card {
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

.register-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  letter-spacing: 2px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.login-link {
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
  .register-container {
    flex-direction: column;
    gap: 40px;
  }
  
  .register-left {
    text-align: center;
    max-width: 100%;
  }
  
  .benefits {
    align-items: center;
  }
  
  .benefit-item {
    width: 100%;
    max-width: 300px;
  }
  
  .welcome-title {
    .title-main {
      font-size: 36px;
    }
  }
}
</style>
