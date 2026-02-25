<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import axios from 'axios';

const isLogin = ref(true); // 切換登入/註冊模式
const email = ref('');
const password = ref('');
const nickname = ref(''); // 👈 新增：綁定暱稱輸入框

const authStore = useAuthStore();
const router = useRouter();

// 處理送出
const handleSubmit = async () => {
  if (isLogin.value) {
    // --- 登入邏輯 ---
    // 🌟 1. 把回傳的物件存進 response (或是 result)
    const response = await authStore.login(email.value, password.value);
    
    // 🌟 2. 判斷物件裡面的 success 屬性是 true 還是 false
    if (response.success) {
      alert('登入成功！');
      router.push('/');
    } else {
      // 🌟 3. 如果是 false，就把物件裡面的 message 彈出來給使用者看！
      alert(response.message); 
    }
  } else {
    // --- 註冊邏輯 ---
    try {
      // 這裡要記得改網址 (如果你已經上線，要用雲端網址，開發用 localhost)
      // 建議用 import.meta.env.VITE_API_URL
      const apiUrl = 'https://shopping-backend-mdvl.onrender.com'; // 或是你的 Render 網址
      
      await axios.post(`${apiUrl}/api/auth/register`, {
        email: email.value,
        password: password.value,
        nickname: nickname.value // 👈 把暱稱傳給後端
      });
      alert('註冊成功！請登入');
      isLogin.value = true; // 切換回登入
    } catch (error) {
      alert(error.response?.data?.message || '註冊失敗');
    }
  }
};
</script>

<template>
  <div class="login-container">
    <h1>{{ isLogin ? '登入' : '註冊新帳號' }}</h1>
    
    <form @submit.prevent="handleSubmit">
      <div v-if="!isLogin" class="form-group">
        <label>您的暱稱</label>
        <input type="text" v-model="nickname" placeholder="例如：帥氣店長" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label>密碼</label>
        <input type="password" v-model="password" required />
      </div>

      <button type="submit">{{ isLogin ? '登入' : '註冊' }}</button>
    </form>

    <p @click="isLogin = !isLogin" class="toggle-btn">
      {{ isLogin ? '還沒有帳號？點此註冊' : '已有帳號？點此登入' }}
    </p>
  </div>
</template>

<style scoped>
/* (你的 CSS 樣式保持不變) */
.login-container { max-width: 400px; margin: 2rem auto; padding: 2rem; border: 1px solid #ddd; border-radius: 8px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: .5rem; }
.form-group input { width: 100%; padding: .5rem; }
button { width: 100%; padding: .5rem; background: #42b883; color: white; border: none; cursor: pointer; }
.toggle-btn { text-align: center; margin-top: 1rem; cursor: pointer; color: #666; text-decoration: underline; }
</style>