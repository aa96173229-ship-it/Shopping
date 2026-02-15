<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const nickname = ref('');
const isRegister = ref(false); // 預設為登入模式
const errorMessage = ref(''); // 用來顯示錯誤訊息

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  errorMessage.value = ''; // 切換模式時清空錯誤
};

const handleSubmit = async () => {
  errorMessage.value = ''; // 每次送出前清空舊錯誤
  
  if (!isRegister.value) {
    // --- 登入 ---
    const result = await authStore.login(email.value, password.value);
    if (result.success) {
      alert('登入成功！🎉');
      router.push('/');
    } else {
      // 這裡會抓到 auth.js 回傳的 message
      errorMessage.value = result.message; 
      alert(`登入失敗：${result.message}`); // 雙重保險：跳窗也顯示
    }
  } else {
    // --- 註冊 ---
    if (!nickname.value) {
      errorMessage.value = '請填寫暱稱！';
      return;
    }
    const result = await authStore.register(email.value, password.value, nickname.value);
    if (result.success) {
      alert('註冊成功！請重新登入 ✨');
      isRegister.value = false; // 自動切換回登入
    } else {
      errorMessage.value = result.message;
      alert(`註冊失敗：${result.message}`);
    }
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="card">
      <h2>{{ isRegister ? '註冊新帳號' : '會員登入' }}</h2>
      
      <div v-if="errorMessage" class="error-box">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group fade-in">
          <label>暱稱</label>
          <input type="text" v-model="nickname" placeholder="你想被怎麼稱呼？">
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

/* 🔴 錯誤訊息樣式 */
.error-box {
  background-color: #ffecec;
  color: #ff4d4f;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid #ffccc7;
  font-size: 0.9rem;
}

.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
</style>