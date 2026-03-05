<template>
  <div class="placeholder-page">
    <div class="placeholder-content anime-card">
      <h2>个人中心</h2>
      <p>此页面正在开发中...</p>
      <router-link to="/" class="back-link">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.placeholder-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.placeholder-content {
  text-align: center;
  padding: 60px;

  h2 {
    color: #fff;
    font-size: 28px;
    margin-bottom: 16px;
  }

  p {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 24px;
  }
}

.back-link {
  color: #ff6b9d;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
