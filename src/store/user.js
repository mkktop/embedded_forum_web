/**
 * 用户状态管理模块
 * 功能：管理用户登录状态、用户信息、Token存储
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'

/**
 * 用户Store
 * 使用Composition API风格定义
 */
export const useUserStore = defineStore('user', () => {
  // ==================== 状态定义 ====================
  
  /** 用户Token，从本地存储初始化 */
  const token = ref(localStorage.getItem('token') || '')
  
  /** 用户信息对象 */
  const userInfo = ref(null)

  // ==================== 计算属性 ====================
  
  /**
   * 是否已登录
   * @returns {boolean} 根据token是否存在判断
   */
  const isLoggedIn = computed(() => !!token.value)
  
  /**
   * 是否为管理员
   * @returns {boolean} 根据用户角色判断
   */
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  
  /**
   * 用户显示名称
   * @returns {string} 优先显示昵称，其次用户名，最后显示"游客"
   */
  const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username || '游客')

  // ==================== 方法定义 ====================

  /**
   * 初始化用户状态
   * 从本地存储恢复用户信息，用于页面刷新后保持登录状态
   */
  const initUser = () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
      } catch (e) {
        // JSON解析失败，清除无效数据
        localStorage.removeItem('userInfo')
      }
    }
  }

  /**
   * 用户登录
   * @param {Object} loginData - 登录数据
   * @param {string} loginData.username - 用户名
   * @param {string} loginData.password - 密码
   * @returns {Promise<Object>} 登录结果
   * @throws {Error} 登录失败时抛出错误
   */
  const login = async (loginData) => {
    try {
      const res = await authApi.login(loginData)
      
      // 保存Token
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      
      // 构建用户数据对象
      const userData = {
        id: res.data.id,
        username: res.data.username,
        nickname: res.data.nickname,
        role: res.data.role
      }
      
      // 保存用户信息到状态和本地存储
      userInfo.value = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      // 显示成功提示
      ElMessage.success('登录成功！欢迎回来~ ✨')
      return res
    } catch (error) {
      throw error
    }
  }

  /**
   * 用户注册
   * @param {Object} registerData - 注册数据
   * @param {string} registerData.username - 用户名（4-20字符）
   * @param {string} registerData.password - 密码（6-20字符）
   * @param {string} registerData.email - 邮箱
   * @param {string} registerData.invite_code - 邀请码
   * @returns {Promise<Object>} 注册结果
   * @throws {Error} 注册失败时抛出错误
   */
  const register = async (registerData) => {
    try {
      const res = await authApi.register(registerData)
      
      // 保存Token
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      
      // 构建用户数据对象（注册返回的信息较少）
      const userData = {
        id: res.data.id,
        username: res.data.username
      }
      
      // 保存用户信息到状态和本地存储
      userInfo.value = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      // 显示成功提示
      ElMessage.success('注册成功！欢迎加入超次元论坛~ 🎉')
      return res
    } catch (error) {
      throw error
    }
  }

  /**
   * 用户登出
   * 清除Token和用户信息，重置登录状态
   */
  const logout = () => {
    // 清除状态
    token.value = ''
    userInfo.value = null
    
    // 清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    // 显示提示
    ElMessage.success('已退出登录~ 下次再见！👋')
  }

  /**
   * 从服务器获取用户详细信息
   * 用于刷新用户数据或验证Token有效性
   * @returns {Promise<Object|undefined>} 用户详细信息
   * @throws {Error} 获取失败时抛出错误
   */
  const fetchUserInfo = async () => {
    // 未登录时不请求
    if (!token.value) return
    
    try {
      const res = await authApi.getUserInfo()
      
      // 更新用户信息
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      
      return res.data
    } catch (error) {
      // 401错误表示Token过期，自动登出
      if (error.response?.status === 401) {
        logout()
      }
      throw error
    }
  }

  /**
   * 更新用户信息（本地）
   * 用于更新用户资料后同步本地状态
   * @param {Object} data - 要更新的用户数据
   */
  const updateUserInfo = (data) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  // ==================== 导出 ====================
  
  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    isAdmin,
    nickname,
    // 方法
    initUser,
    login,
    register,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
})
