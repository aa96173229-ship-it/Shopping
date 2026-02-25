<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

// 把信箱也加入 ref 讓使用者可以修改
const email = ref(authStore.user?.email || '');
const nickname = ref(authStore.user?.nickname || '');
const oldPassword = ref('');
const newPassword = ref('');

const message = ref('');
const isLoading = ref(false);

const updateProfile = async () => {
  isLoading.value = true;
  message.value = '';
  
  try {
    // ⚠️ 如果你推上 Render，記得把這裡改成 https://shopping-backend-...
    const res = await axios.put('https://shopping-backend-mdvl.onrender.com/api/auth/profile', {
      email: email.value,       // 👈 把新信箱傳給後端
      nickname: nickname.value,
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    // ✨ 更新 Pinia 狀態與 LocalStorage
    authStore.user.email = res.data.user.email; // 更新信箱
    authStore.user.nickname = res.data.user.nickname; // 更新暱稱
    localStorage.setItem('user', JSON.stringify(authStore.user));
    
    message.value = res.data.message;
    oldPassword.value = ''; 
    newPassword.value = '';
    
    alert('修改成功！');
  } catch (error) {
    alert(error.response?.data?.message || '更新失敗');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="profile-container">
    <h2>⚙️ 帳號設定</h2>
    
    <div class="info-card">
      <p><strong>目前金幣：</strong> 💰 {{ authStore.user?.coins || 0 }}</p>
    </div>

    <form @submit.prevent="updateProfile" class="profile-form">
      
      <div class="form-group">
        <label>登入帳號 (信箱)</label>
        <input type="email" v-model="email" required />
      </div>

      <div class="form-group">
        <label>顯示暱稱</label>
        <input type="text" v-model="nickname" required />
      </div>

      <div class="form-divider">安全驗證 (若更改信箱或密碼，請務必填寫舊密碼)</div>

      <div class="form-group">
        <label>舊密碼</label>
        <input type="password" v-model="oldPassword" placeholder="驗證身分用" />
      </div>

      <div class="form-group">
        <label>新密碼</label>
        <input type="password" v-model="newPassword" placeholder="若不更改密碼請留白" />
      </div>

      <button type="submit" :disabled="isLoading" class="btn-save">
        {{ isLoading ? '儲存中...' : '儲存修改' }}
      </button>
    </form>
    
    <p v-if="message" class="success-msg">{{ message }}</p>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 500px;
  margin: 3rem auto;
  padding: 2rem;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

h2 { text-align: center; color: #2c3e50; margin-bottom: 1.5rem; }

.info-card {
  background: #fff8e1; /* 改成有點金幣感的底色 */
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  color: #f39c12;
  font-size: 1.2rem;
  border: 1px solid #ffe082;
}

.profile-form { display: flex; flex-direction: column; gap: 15px; }

.form-group { display: flex; flex-direction: column; text-align: left; }
.form-group label { font-size: 0.9rem; font-weight: bold; color: #333; margin-bottom: 5px; }
.form-group input { 
  padding: 10px; 
  border: 1px solid #ddd; 
  border-radius: 5px; 
  font-size: 1rem; 
}
.form-group input:focus { outline: none; border-color: #3498db; }

.form-divider {
  text-align: center;
  margin: 15px 0 5px 0;
  color: #e74c3c; /* 換成紅色提醒這區很重要 */
  font-size: 0.85rem;
  font-weight: bold;
  border-bottom: 1px dashed #ddd;
  padding-bottom: 10px;
}

.btn-save {
  background: #2ecc71;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
}
.btn-save:hover { background: #27ae60; }
.btn-save:disabled { background: #95a5a6; cursor: not-allowed; }

.success-msg { text-align: center; color: #27ae60; font-weight: bold; margin-top: 15px; }
</style>