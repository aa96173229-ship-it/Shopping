<script setup>
import { useRouter } from 'vue-router'; 
import { useAuthStore } from './stores/auth'; 
import { computed } from 'vue'; 

const router = useRouter();
const authStore = useAuthStore();

// 登出功能
const handleLogout = () => {
  authStore.logout();
  alert('已登出，歡迎下次再來！');
  router.push('/login');
};

// 🎯 修正：顯示邏輯統一使用 nickname
// 這樣寫的好處是：如果以後邏輯要改，只要改這裡，不用動 HTML
const displayName = computed(() => {
  if (authStore.user) {
    // 優先順序：1. 暱稱 (nickname) 2. Email 前綴 3. 預設字
    return authStore.user.nickname || authStore.user.email?.split('@')[0] || '會員';
  }
  return '';
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
          <span v-if="authStore.token">({{ authStore.user ? 'OK' : '' }})</span>
        </router-link>

        <div v-if="authStore.token && authStore.user" class="user-info">
          <router-link to="/orders" class="nav-item">我的訂單</router-link> 
          
          <span class="welcome-text">
            {{ displayName }}(已登入)
          </span>
          
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
/* CSS 維持原樣，你的樣式寫得很清楚 */
.app-container { font-family: Arial, sans-serif; color: #333; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background-color: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 2rem; }
.logo { font-size: 1.5rem; font-weight: bold; text-decoration: none; color: #2c3e50; }
.nav-right { display: flex; align-items: center; gap: 1.5rem; }
.nav-item { text-decoration: none; color: #666; font-weight: bold; }
.nav-item:hover { color: #42b883; }
.user-info { display: flex; align-items: center; gap: 1rem; }
.welcome-text { font-weight: bold; color: #42b883; }
.btn-login, .btn-logout { padding: 8px 16px; border-radius: 20px; text-decoration: none; font-size: 0.9rem; transition: all 0.3s; cursor: pointer; border: none; }
.btn-login { background-color: #2c3e50; color: white; }
.btn-login:hover { background-color: #34495e; }
.btn-logout { background-color: #f5f5f5; color: #666; border: 1px solid #ddd; }
.btn-logout:hover { background-color: #ffecec; color: #ff4d4f; border-color: #ff4d4f; }
</style>