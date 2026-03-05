import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')
  const nickname = computed(() => userInfo.value?.nickname || userInfo.value?.username || '游客')

  const initUser = () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
      } catch (e) {
        localStorage.removeItem('userInfo')
      }
    }
  }

  const login = async (loginData) => {
    try {
      const res = await authApi.login(loginData)
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      
      const userData = {
        id: res.data.id,
        username: res.data.username,
        nickname: res.data.nickname,
        role: res.data.role
      }
      userInfo.value = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      ElMessage.success('登录成功！欢迎回来~ ✨')
      return res
    } catch (error) {
      throw error
    }
  }

  const register = async (registerData) => {
    try {
      const res = await authApi.register(registerData)
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      
      const userData = {
        id: res.data.id,
        username: res.data.username
      }
      userInfo.value = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      ElMessage.success('注册成功！欢迎加入超次元论坛~ 🎉')
      return res
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('已退出登录~ 下次再见！👋')
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const res = await authApi.getUserInfo()
      userInfo.value = res.data
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      return res.data
    } catch (error) {
      if (error.response?.status === 401) {
        logout()
      }
      throw error
    }
  }

  const updateUserInfo = (data) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    nickname,
    initUser,
    login,
    register,
    logout,
    fetchUserInfo,
    updateUserInfo
  }
})
