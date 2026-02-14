<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router' // 👈 1. 引入 router

const authStore = useAuthStore()
const router = useRouter() // 👈 2. 初始化 router

const email = ref('')
const password = ref('')
const nickname = ref('') // 👈 3. 新增暱稱變數
const isRegister = ref(false) // 我們統一用 isRegister

const toggleMode = () => {
  isRegister.value = !isRegister.value
  // 切換時順便清空輸入框，體驗更好
  email.value = ''
  password.value = ''
  nickname.value = ''
}

const handleSubmit = async () => {
  // 注意：這裡改用 !isRegister.value 代表「登入模式」
  if (!isRegister.value) {
    // --- 登入 ---
    const result = await authStore.login(email.value, password.value);
    if (result.success) {
      alert('歡迎回來！🎉');
      router.push('/'); // 現在可以跳轉了
    } else {
      alert(`⚠️ 登入失敗：${result.message}`);
    }
  } else {
    // --- 註冊 ---
    const result = await authStore.register(email.value, password.value, nickname.value);
    if (result.success) {
      alert('註冊成功！快去登入吧 ✨');
      isRegister.value = false; // 註冊完自動切換到登入模式
      password.value = '';
    } else {
      alert(`❌ 註冊失敗：${result.message}`);
    }
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="card">
      <h2>{{ isRegister ? '註冊新帳號' : '會員登入' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group fade-in">
          <label>暱稱</label>
          <input type="text" v-model="nickname" required placeholder="你想被怎麼稱呼？">
        </div>

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

/* 讓切換時有一點點淡入效果 */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>