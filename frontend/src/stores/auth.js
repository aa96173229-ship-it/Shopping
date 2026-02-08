// frontend/src/stores/auth.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router' // 為了做自動跳轉

export const useAuthStore = defineStore('auth', () => {
  // State: 從 localStorage 讀取 token，如果沒有就是空字串
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  // Getters: 判斷是否登入
  const isLoggedIn = computed(() => !!token.value)

  // Actions: 登入功能
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      })
      
      // 1. 存入 State
      token.value = res.data.token
      user.value = res.data.user
      
      // 2. 存入 localStorage (這樣重新整理網頁才不會登出)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      alert('登入成功！')
      router.push('/') // 自動跳轉回首頁
      
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.message || '登入失敗')
      throw error
    }
  }

  // Actions: 註冊功能
  const register = async (email, password) => {
    try {
      await axios.post('http://localhost:3000/api/auth/register', {
        email,
        password
      })
      alert('註冊成功！請直接登入')
      // 註冊完可以選擇自動登入，或是切換回登入頁，這裡先切換模式讓使用者自己登入
      return true
    } catch (error) {
      alert(error.response?.data?.message || '註冊失敗')
      return false
    }
  }

  // Actions: 登出功能
  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    alert('已登出')
    router.push('/login')
  }

  return { token, user, isLoggedIn, login, register, logout }
})