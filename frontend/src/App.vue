<script setup>
import { useRouter } from 'vue-router'; // 用來跳轉頁面
import { useAuthStore } from './stores/auth'; // 引入登入狀態
import { computed } from 'vue'; // 用來即時監聽變化

const router = useRouter();
const authStore = useAuthStore();

// 登出功能
const handleLogout = () => {
  // 1. 清除 Pinia 和 LocalStorage 的資料
  authStore.logout();
  // 2. 跳轉回登入頁 (或首頁)
  alert('已登出');
  router.push('/login');
};

// 為了怕名字太長或沒有名字，做一個簡單的顯示邏輯
const displayName = computed(() => {
  if (authStore.user && authStore.user.username) {
    return authStore.user.username;
  }
  // 如果沒有名字 (舊帳號)，就顯示 Email 的 @ 前面那串
  return authStore.user?.email?.split('@')[0] || '會員';
});
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-left">
        <router-link to="/" class="logo">🛒 購物商城</router-link>
      </div>
      
      <div class="nav-right">
        <router-link to="/cart" class="nav-item">
          購物車
          <span v-if="authStore.token">({{ authStore.user?.email ? 'V' : '' }})</span>
        </router-link>

        <div v-if="authStore.token" class="user-info">
          <router-link to="/orders" class="nav-item">我的訂單</router-link> <span class="welcome-text">早上好，{{ displayName }}</span>
          <button @click="handleLogout" class="btn-logout">登出</button>
        </div>

        <div v-else class="guest-info">
          <router-link to="/login" class="btn-login">登入 / 註冊</router-link>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<style scoped>
/* 全局樣式重置 */
.app-container {
  font-family: Arial, sans-serif;
  color: #333;
}

/* 導覽列樣式 */
.navbar {
  display: flex;
  justify-content: space-between; /* 左右推開 */
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #2c3e50;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* 按鈕之間的距離 */
}

.nav-item {
  text-decoration: none;
  color: #666;
  font-weight: bold;
}

.nav-item:hover {
  color: #42b883;
}

/* 使用者資訊區塊 */
.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  font-weight: bold;
  color: #42b883;
}

/* 按鈕樣式 */
.btn-login, .btn-logout {
  padding: 8px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
}

.btn-login {
  background-color: #2c3e50;
  color: white;
}

.btn-login:hover {
  background-color: #34495e;
}

.btn-logout {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.btn-logout:hover {
  background-color: #ffecec; /* 淡紅色背景 */
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>