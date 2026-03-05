<template>
  <div class="signin-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title anime-title">每日签到</h1>
      <p class="page-subtitle">每天签到获取积分奖励 ✨</p>
    </div>

    <div class="main-content">
      <!-- 签到卡片 -->
      <div class="signin-card anime-card">
        <div class="signin-header">
          <div class="signin-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <h2 class="signin-title">{{ signInStatus.today_signed ? '今日已签到' : '今日未签到' }}</h2>
          <p class="signin-desc">
            连续签到 <strong class="highlight">{{ signInStatus.consecutive_days || 0 }}</strong> 天
          </p>
        </div>

        <!-- 签到按钮 -->
        <div class="signin-action">
          <el-button
            v-if="!signInStatus.today_signed"
            type="primary"
            size="large"
            class="signin-btn"
            :loading="signingIn"
            @click="handleSignIn"
          >
            <el-icon><Check /></el-icon>
            立即签到
          </el-button>
          <el-button
            v-else
            type="primary"
            size="large"
            class="signin-btn signed"
            disabled
          >
            <el-icon><Check /></el-icon>
            已签到
          </el-button>
        </div>

        <!-- 签到奖励说明 -->
        <div class="reward-info">
          <div class="reward-item">
            <span class="reward-label">每日签到</span>
            <span class="reward-value">+20 积分</span>
          </div>
          <div class="reward-item">
            <span class="reward-label">连续7天</span>
            <span class="reward-value">额外 +10 积分</span>
          </div>
          <div class="reward-item">
            <span class="reward-label">连续14天</span>
            <span class="reward-value">额外 +20 积分</span>
          </div>
          <div class="reward-item">
            <span class="reward-label">连续30天</span>
            <span class="reward-value">额外 +50 积分</span>
          </div>
        </div>
      </div>

      <!-- 积分信息卡片 -->
      <div class="points-card anime-card">
        <h3 class="card-title">
          <el-icon><Coin /></el-icon>
          积分信息
        </h3>
        <div class="points-info">
          <div class="points-main">
            <span class="points-value">{{ pointsInfo.points || 0 }}</span>
            <span class="points-label">当前积分</span>
          </div>
          <div class="points-detail">
            <div class="detail-item">
              <span class="detail-label">累计获得</span>
              <span class="detail-value">{{ pointsInfo.total_earned || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">累计消费</span>
              <span class="detail-value">{{ pointsInfo.total_spent || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 兑换邀请码 -->
        <div class="exchange-section">
          <h4 class="section-title">兑换邀请码</h4>
          <p class="exchange-desc">消耗 <strong>200</strong> 积分兑换一个邀请码</p>
          <el-button
            type="primary"
            :disabled="(pointsInfo.points || 0) < 200"
            :loading="exchanging"
            @click="handleExchange"
          >
            兑换邀请码
          </el-button>
        </div>

        <!-- 我的邀请码 -->
        <div v-if="myInviteCodes.length > 0" class="my-codes">
          <h4 class="section-title">我的邀请码</h4>
          <div class="code-list">
            <div v-for="code in myInviteCodes" :key="code.id" class="code-item">
              <span class="code-value">{{ code.code }}</span>
              <span class="code-status" :class="{ used: code.used }">
                {{ code.used ? '已使用' : '未使用' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 签到记录卡片 -->
      <div class="records-card anime-card">
        <h3 class="card-title">
          <el-icon><List /></el-icon>
          签到记录
        </h3>
        <div v-if="signInRecords.length > 0" class="records-list">
          <div v-for="record in signInRecords" :key="record.id" class="record-item">
            <div class="record-date">
              <span class="date-day">{{ formatDay(record.sign_date) }}</span>
              <span class="date-month">{{ formatMonth(record.sign_date) }}</span>
            </div>
            <div class="record-info">
              <span class="record-points">+{{ record.points_earned }} 积分</span>
              <span class="record-streak" v-if="record.consecutive_days">
                连续{{ record.consecutive_days }}天
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-records">
          <el-icon><Document /></el-icon>
          <p>暂无签到记录</p>
        </div>
      </div>
    </div>

    <!-- 签到成功对话框 -->
    <el-dialog
      v-model="showSuccessDialog"
      title="签到成功"
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="success-content">
        <div class="success-icon">🎉</div>
        <p class="success-text">恭喜获得 <strong class="highlight">{{ earnedPoints }}</strong> 积分！</p>
        <p v-if="signInStatus.consecutive_days > 1" class="streak-text">
          已连续签到 {{ signInStatus.consecutive_days }} 天
        </p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showSuccessDialog = false">太棒了！</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 签到页面组件
 * 功能：每日签到、签到状态、签到记录、积分信息、兑换邀请码
 */
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { signInApi } from '@/api'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  Check,
  Coin,
  List,
  Document
} from '@element-plus/icons-vue'

// ==================== 状态定义 ====================

/** 路由实例 */
const router = useRouter()

/** 用户状态Store */
const userStore = useUserStore()

/** 签到中状态 */
const signingIn = ref(false)

/** 兑换中状态 */
const exchanging = ref(false)

/** 签到状态信息 */
const signInStatus = reactive({
  today_signed: false,
  consecutive_days: 0,
  total_days: 0
})

/** 积分信息 */
const pointsInfo = reactive({
  points: 0,
  total_earned: 0,
  total_spent: 0
})

/** 签到记录列表 */
const signInRecords = ref([])

/** 我的邀请码列表 */
const myInviteCodes = ref([])

/** 签到成功对话框 */
const showSuccessDialog = ref(false)

/** 获得的积分 */
const earnedPoints = ref(0)

// ==================== 数据加载方法 ====================

/**
 * 加载签到状态
 */
const loadSignInStatus = async () => {
  try {
    const res = await signInApi.getStatus()
    console.log('签到状态响应:', res.data)
    if (res.data) {
      // API返回: has_signed_today, current_continuous_days
      // 前端使用: today_signed, consecutive_days
      signInStatus.today_signed = res.data.has_signed_today || false
      signInStatus.consecutive_days = res.data.current_continuous_days || 0
      signInStatus.total_days = res.data.total_days || 0
    }
  } catch (error) {
    console.error('加载签到状态失败:', error)
  }
}

/**
 * 加载积分信息
 */
const loadPointsInfo = async () => {
  try {
    const res = await signInApi.getPoints()
    if (res.data) {
      pointsInfo.points = res.data.points || 0
      pointsInfo.total_earned = res.data.total_earned || 0
      pointsInfo.total_spent = res.data.total_spent || 0
    }
  } catch (error) {
    console.error('加载积分信息失败:', error)
  }
}

/**
 * 加载签到记录
 */
const loadSignInRecords = async () => {
  try {
    const res = await signInApi.getRecords()
    console.log('签到记录响应:', res)
    // 处理不同的数据结构
    if (Array.isArray(res.data)) {
      signInRecords.value = res.data
    } else if (res.data?.list) {
      signInRecords.value = res.data.list
    } else if (res.data?.records) {
      signInRecords.value = res.data.records
    } else {
      signInRecords.value = []
    }
  } catch (error) {
    console.error('加载签到记录失败:', error)
    signInRecords.value = []
  }
}

/**
 * 加载我的邀请码
 * 从API获取用户兑换的邀请码列表
 */
const loadMyInviteCodes = async () => {
  try {
    const res = await signInApi.getMyCodes({})
    console.log('我的邀请码响应:', res)
    // 处理不同的数据结构
    if (res.data?.list) {
      myInviteCodes.value = res.data.list
    } else if (Array.isArray(res.data)) {
      myInviteCodes.value = res.data
    } else {
      myInviteCodes.value = []
    }
  } catch (error) {
    console.error('加载邀请码失败:', error)
    myInviteCodes.value = []
  }
}

// ==================== 事件处理方法 ====================

/**
 * 执行签到
 */
const handleSignIn = async () => {
  signingIn.value = true
  try {
    const res = await signInApi.signIn()
    console.log('签到响应:', res.data)
    earnedPoints.value = res.data?.points_earned || 20
    
    // 更新签到状态 - API返回continuous_days
    signInStatus.today_signed = true
    signInStatus.consecutive_days = res.data?.continuous_days || (signInStatus.consecutive_days + 1)
    
    // 更新积分
    pointsInfo.points = (pointsInfo.points || 0) + earnedPoints.value
    
    // 显示成功对话框
    showSuccessDialog.value = true
    
    // 刷新签到记录
    loadSignInRecords()
    
    // 刷新用户信息
    userStore.fetchUserInfo()
  } catch (error) {
    console.error('签到失败:', error)
  } finally {
    signingIn.value = false
  }
}

/**
 * 兑换邀请码
 */
const handleExchange = async () => {
  if ((pointsInfo.points || 0) < 200) {
    ElMessage.warning('积分不足，需要200积分')
    return
  }
  
  exchanging.value = true
  try {
    const res = await signInApi.exchangeInviteCode()
    ElMessage.success('兑换成功！获得邀请码：' + res.data?.code)
    
    // 更新积分
    pointsInfo.points = (pointsInfo.points || 0) - 200
    
    // 刷新邀请码列表
    loadMyInviteCodes()
  } catch (error) {
    console.error('兑换失败:', error)
  } finally {
    exchanging.value = false
  }
}

// ==================== 工具方法 ====================

/**
 * 格式化日期 - 日
 * @param {string} dateStr - 日期字符串
 * @returns {string} 日
 */
const formatDay = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return String(date.getDate()).padStart(2, '0')
}

/**
 * 格式化日期 - 月
 * @param {string} dateStr - 日期字符串
 * @returns {string} 月
 */
const formatMonth = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月`
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 加载数据
  loadSignInStatus()
  loadPointsInfo()
  loadSignInRecords()
  loadMyInviteCodes()
})
</script>

<style lang="scss" scoped>
.signin-page {
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

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.signin-card {
  grid-column: 1 / -1;
  padding: 40px;
  text-align: center;
}

.signin-header {
  margin-bottom: 30px;
}

.signin-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.2), rgba(196, 78, 255, 0.2));
  border-radius: 50%;
  font-size: 36px;
  color: #ff6b9d;
}

.signin-title {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.signin-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;

  .highlight {
    color: #ff6b9d;
    font-size: 20px;
  }
}

.signin-action {
  margin-bottom: 30px;
}

.signin-btn {
  padding: 16px 48px;
  font-size: 18px;
  border-radius: 30px;

  &.signed {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.reward-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reward-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reward-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.reward-value {
  color: #00d4ff;
  font-size: 16px;
  font-weight: 600;
}

.points-card,
.records-card {
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.points-info {
  margin-bottom: 24px;
}

.points-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(196, 78, 255, 0.1));
  border-radius: 12px;
  margin-bottom: 16px;
}

.points-value {
  color: #fff;
  font-size: 36px;
  font-weight: 700;
}

.points-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.points-detail {
  display: flex;
  justify-content: space-around;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.detail-value {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.exchange-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 20px;
}

.section-title {
  color: #fff;
  font-size: 15px;
  margin-bottom: 10px;
}

.exchange-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-bottom: 12px;

  strong {
    color: #ff6b9d;
  }
}

.my-codes {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.code-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.code-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.code-value {
  color: #fff;
  font-family: monospace;
  font-size: 14px;
}

.code-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;

  &.used {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
  }
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.record-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.record-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 107, 157, 0.15);
  border-radius: 8px;
  min-width: 50px;
}

.date-day {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.date-month {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.record-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-points {
  color: #00d4ff;
  font-size: 15px;
  font-weight: 500;
}

.record-streak {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.empty-records {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);

  .el-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }
}

.success-content {
  text-align: center;
  padding: 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.success-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  margin-bottom: 10px;

  .highlight {
    color: #ff6b9d;
    font-size: 24px;
  }
}

.streak-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

:deep(.el-dialog) {
  background: rgba(30, 30, 50, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;

  .el-dialog__title {
    color: #fff;
  }

  .el-dialog__header {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .signin-card {
    grid-column: 1;
  }

  .reward-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
