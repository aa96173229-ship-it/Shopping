<script setup>
import { ref, computed } from 'vue'; // 👈 記得引入 ref
import { useRouter } from 'vue-router'; 
import { useAuthStore } from './stores/auth'; 
import { useCartStore } from './stores/cart'; // 👈 引入 CartStore 顯示數量

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore(); // 👈 使用 CartStore

// 👇 1. 控制選單開關 (手機版用)
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 點擊連結後自動收起選單
const closeMenu = () => {
  isMenuOpen.value = false;
};

// 登出功能
const handleLogout = () => {
  authStore.logout();
  closeMenu(); // 登出也要關閉選單
  alert('已登出，歡迎下次再來！');
  router.push('/login');
};

// 顯示暱稱邏輯
const displayName = computed(() => {
  if (authStore.user) {
    return authStore.user.nickname || authStore.user.email?.split('@')[0] || '會員';
  }
  return '';
});
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-left">
        <router-link to="/" class="logo" @click="closeMenu">🛒 購物商城</router-link>
      </div>
      
      <button class="hamburger" @click="toggleMenu">
        <span v-if="!isMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>

      <div class="nav-right" :class="{ 'show-menu': isMenuOpen }">
        
        <router-link to="/cart" class="nav-item" @click="closeMenu">
          購物車
          <span v-if="cartStore.items.length > 0" class="cart-count">
            ({{ cartStore.items.length }})
          </span>
        </router-link>

        <div v-if="authStore.token && authStore.user" class="user-info">
          <router-link to="/orders" class="nav-item" @click="closeMenu">我的訂單</router-link> 
          
          <span class="welcome-text">
            Hi, {{ displayName }}
          </span>
          
          <button @click="handleLogout" class="btn-logout">登出</button>
        </div>

        <div v-else class="guest-info">
          <router-link to="/login" class="btn-login" @click="closeMenu">登入 / 註冊</router-link>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<style scoped>
.app-container { font-family: Arial, sans-serif; color: #333; }

/* ========================================= */
/* 🖥️ 電腦版樣式 (預設 >= 1024px) */
/* ========================================= */
.navbar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 1rem 2rem; 
  background-color: #fff; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
  margin-bottom: 2rem;
  position: relative; /* 為了讓手機版下拉選單定位 */
  z-index: 1000;
}

.logo { font-size: 1.5rem; font-weight: bold; text-decoration: none; color: #2c3e50; }

/* 漢堡按鈕預設隱藏 */
.hamburger { display: none; }

.nav-right { display: flex; align-items: center; gap: 1.5rem; }

.nav-item { text-decoration: none; color: #666; font-weight: bold; transition: 0.3s; }
.nav-item:hover { color: #42b883; }

.user-info { display: flex; align-items: center; gap: 1rem; }
.welcome-text { font-weight: bold; color: #42b883; }

.cart-count { color: #e74c3c; font-weight: bold; }

/* 按鈕樣式 */
.btn-login, .btn-logout { 
  padding: 8px 16px; 
  border-radius: 20px; 
  text-decoration: none; 
  font-size: 0.9rem; 
  transition: all 0.3s; 
  cursor: pointer; 
  border: none; 
  white-space: nowrap; /* 防止按鈕文字換行 */
}
.btn-login { background-color: #2c3e50; color: white; display: inline-block;}
.btn-login:hover { background-color: #34495e; }
.btn-logout { background-color: #f5f5f5; color: #666; border: 1px solid #ddd; }
.btn-logout:hover { background-color: #ffecec; color: #ff4d4f; border-color: #ff4d4f; }

/* ========================================= */
/* 📱 平板版優化 (768px ~ 1024px) */
/* ========================================= */
@media (min-width: 768px) and (max-width: 1024px) {
  .navbar { padding: 1rem 1.5rem; }
  .nav-right { gap: 10px; } /* 縮小間距 */
  .nav-item { font-size: 0.9rem; }
  .welcome-text { display: none; } /* 平板空間不夠時，隱藏 "Hi, 名字" */
  .btn-login, .btn-logout { padding: 6px 12px; font-size: 0.85rem; }
}

/* ========================================= */
/* 📱 手機版樣式 (< 768px) */
/* ========================================= */
@media (max-width: 768px) {
  .navbar { padding: 1rem; }

  /* 1. 顯示漢堡按鈕 */
  .hamburger {
    display: block;
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #333;
  }

  /* 2. 選單變成下拉式 */
  .nav-right {
    display: none; /* 預設隱藏 */
    position: absolute;
    top: 100%; /* 接在 navbar 下方 */
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column; /* 變直排 */
    padding: 0;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    align-items: stretch; /* 讓子元素填滿寬度 */
    gap: 0;
  }

  /* 3. 當加上 .show-menu class 時顯示 */
  .nav-right.show-menu {
    display: flex;
    animation: slideDown 0.3s ease;
  }

  /* 4. 手機版連結樣式 */
  .nav-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    text-align: center;
    width: auto;
  }

  .user-info, .guest-info {
    flex-direction: column;
    width: 100%;
    gap: 0;
  }

  .welcome-text {
    padding: 10px;
    border-bottom: 1px solid #eee;
    text-align: center;
    width: 100%;
    display: block;
  }

  .btn-logout, .btn-login {
    width: 90%;
    margin: 15px auto;
    display: block;
    text-align: center;
  }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>