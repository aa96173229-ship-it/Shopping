<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// --- 1. 補回這些缺少的變數 ---
const isRegister = ref(false); //用來切換 登入/註冊
const email = ref('');
const password = ref('');
const username = ref(''); // 註冊時可能需要名字

// --- 2. 處理表單送出 ---
const handleSubmit = async () => {
  try {
    if (isRegister.value) {
      // === 註冊模式 ===
      await axios.post('http://localhost:3000/api/auth/register', {
        username: username.value,
        email: email.value,
        password: password.value
      });
      alert('註冊成功！請登入');
      isRegister.value = false; // 切換回登入頁
    } else {
      // === 登入模式 (這是我們剛剛寫的) ===
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email: email.value,
        password: password.value
      });
      
      // 存入 Pinia
      authStore.login(res.data.token, res.data.user);
      
      alert('登入成功！');
      router.push('/'); // 回首頁
    }
  } catch (error) {
    console.error(error);
    alert(isRegister.value ? '註冊失敗' : '登入失敗 (請檢查帳號密碼)');
    // 👇👇👇 重點修改這裡 👇👇👇
    // 檢查有沒有後端傳來的具體錯誤訊息 (error.response.data.message)
    if (error.response && error.response.data.message) {
      alert(error.response.data.message); // 例如：「這個 Email 已經被註冊過了」
    } else {
      // 如果是網路斷線或其他未知的錯，才顯示通用訊息
      alert(isRegister.value ? '註冊失敗' : '登入失敗 (請檢查帳號密碼)');
    }
    // 👆👆👆 修改結束 👆👆👆
  }
};
</script>

<template>
  <div class="login-container">
    <div class="card">
      <h2>{{ isRegister ? '註冊會員' : '會員登入' }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div v-if="isRegister" class="form-group">
          <label>使用者名稱</label>
          <input type="text" v-model="username" required placeholder="請輸入暱稱">
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="email" required placeholder="請輸入信箱">
        </div>

        <div class="form-group">
          <label>密碼</label>
          <input type="password" v-model="password" required placeholder="請輸入密碼">
        </div>

        <button type="submit" class="btn-submit">
          {{ isRegister ? '立即註冊' : '登入' }}
        </button>
      </form>

      <p class="switch-mode">
        {{ isRegister ? '已經有帳號了？' : '還沒有帳號嗎？' }}
        <span @click="isRegister = !isRegister">
          {{ isRegister ? '去登入' : '去註冊' }}
        </span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* 重要：防止 padding 撐開寬度 */
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-submit:hover {
  background-color: #3aa876;
}

.switch-mode {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.switch-mode span {
  color: #42b883;
  cursor: pointer;
  font-weight: bold;
  text-decoration: underline;
}
</style>