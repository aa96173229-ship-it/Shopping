<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const isRegister = ref(false)

const toggleMode = () => isRegister.value = !isRegister.value

const handleSubmit = async () => {
  if (isRegister.value) {
    const success = await authStore.register(email.value, password.value)
    if (success) isRegister.value = false
  } else {
    await authStore.login(email.value, password.value)
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="card">
      <h2>{{ isRegister ? '註冊新帳號' : '會員登入' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required placeholder="請輸入 Email">
        </div>
        <div class="form-group">
          <label>密碼</label>
          <input type="password" v-model="password" required placeholder="請輸入密碼">
        </div>
        <button type="submit" class="btn-primary">
          {{ isRegister ? '立即註冊' : '登入' }}
        </button>
      </form>
      <p class="toggle-text">
        {{ isRegister ? '已經有帳號了嗎？' : '還沒有帳號嗎？' }}
        <span @click="toggleMode">{{ isRegister ? '去登入' : '去註冊' }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container { display: flex; justify-content: center; align-items: center; height: 80vh; }
.card { background: #f9f9f9; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
.form-group { margin-bottom: 1rem; text-align: left; }
input { width: 100%; padding: 0.8rem; margin-top: 0.5rem; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.btn-primary { width: 100%; padding: 0.8rem; background-color: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; margin-top: 1rem; }
.btn-primary:hover { background-color: #3aa876; }
.toggle-text { margin-top: 1rem; font-size: 0.9rem; color: #666; }
.toggle-text span { color: #42b883; cursor: pointer; font-weight: bold; text-decoration: underline; }
</style>