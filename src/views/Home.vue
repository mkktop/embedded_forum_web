<template>
  <div class="home-page">
    <div class="home-header">
      <h1 class="page-title anime-title">超次元论坛</h1>
      <p class="page-subtitle">✨ 探索超次元的无限可能 ✨</p>
    </div>
    
    <div class="coming-soon">
      <div class="coming-soon-content anime-card">
        <div class="decoration">
          <span>🌸</span>
          <span>⭐</span>
          <span>💫</span>
        </div>
        <h2>首页正在建设中...</h2>
        <p>精彩内容即将呈现，敬请期待！</p>
        <div class="actions">
          <router-link to="/login" class="action-btn">登录 ✨</router-link>
          <router-link to="/register" class="action-btn secondary">注册 🎀</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  padding: 40px 20px;
}

.home-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 48px;
  margin-bottom: 16px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
}

.coming-soon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.coming-soon-content {
  text-align: center;
  padding: 60px 80px;
  max-width: 500px;
}

.decoration {
  font-size: 32px;
  margin-bottom: 24px;
  
  span {
    margin: 0 12px;
    animation: float 2s ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: 0.3s;
    }
    
    &:nth-child(3) {
      animation-delay: 0.6s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

h2 {
  color: #fff;
  font-size: 28px;
  margin-bottom: 16px;
}

p {
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 32px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.action-btn {
  padding: 12px 32px;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44eff 100%);
  color: #fff;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 107, 157, 0.4);
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}
</style>
