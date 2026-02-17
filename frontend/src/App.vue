<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 
import { useAuthStore } from './stores/auth'; 
import { useCartStore } from './stores/cart'; 

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore(); 

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  closeMenu();
  alert('已登出，歡迎下次再來！');
  router.push('/login');
};

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

      <div v-if="authStore.token && authStore.user" class="mobile-greeting">
        Hi, {{ displayName }}
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
          
          <span class="welcome-text desktop-greeting">
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
  position: relative;
  z-index: 1000;
}

.logo { font-size: 1.5rem; font-weight: bold; text-decoration: none; color: #2c3e50; }

.hamburger { display: none; }

/* 預設隱藏手機版招呼語 */
.mobile-greeting { display: none; }

.nav-right { display: flex; align-items: center; gap: 1.5rem; }

.nav-item { text-decoration: none; color: #666; font-weight: bold; transition: 0.3s; }
.nav-item:hover { color: #42b883; }

.user-info { display: flex; align-items: center; gap: 1rem; }
.welcome-text { font-weight: bold; color: #42b883; }

.cart-count { color: #e74c3c; font-weight: bold; }

.btn-login, .btn-logout { 
  padding: 8px 16px; 
  border-radius: 20px; 
  text-decoration: none; 
  font-size: 0.9rem; 
  transition: all 0.3s; 
  cursor: pointer; 
  border: none; 
  white-space: nowrap;
}
.btn-login { background-color: #2c3e50; color: white; }
.btn-logout { background-color: #f5f5f5; color: #666; border: 1px solid #ddd; }

/* ========================================= */
/* 📱 平板版優化 (768px ~ 1024px) */
/* ========================================= */
@media (min-width: 768px) and (max-width: 1024px) {
  .navbar { padding: 1rem 1.5rem; }
  .nav-right { gap: 10px; }
  .nav-item { font-size: 0.9rem; }
  .desktop-greeting { display: none; } /* 平板空間不夠，隱藏名字 */
  .btn-login, .btn-logout { padding: 6px 12px; font-size: 0.85rem; }
}

/* ========================================= */
/* 📱 手機版樣式 (< 768px) */
/* ========================================= */
@media (max-width: 768px) {
  .navbar { padding: 1rem; }

  /* 1. 顯示漢堡 */
  .hamburger {
    display: block;
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #333;
    padding-left: 10px; /* 增加一點左邊距 */
  }

  /* 2. 👇 顯示手機版招呼語 */
  .mobile-greeting {
    display: block;
    margin-left: auto; /* 自動推到最右邊 (但在漢堡左邊) */
    font-weight: bold;
    color: #42b883;
    font-size: 0.9rem;
    /* 防止名字太長跑版，加點省略號 */
    max-width: 100px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 3. 隱藏選單內的招呼語 (避免重複) */
  .desktop-greeting {
    display: none;
  }

  /* 選單下拉樣式 */
  .nav-right {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column;
    padding: 0;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    align-items: stretch;
    gap: 0;
  }

  .nav-right.show-menu {
    display: flex;
    animation: slideDown 0.3s ease;
  }

  .nav-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    text-align: center;
  }

  .user-info, .guest-info {
    flex-direction: column;
    width: 100%;
    gap: 0;
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