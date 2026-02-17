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

// 👇 新增：判斷今天是否已經簽到過
const hasCheckedInToday = computed(() => {
  if (!authStore.user?.lastCheckInDate) return false;
  // 取得今天的日期字串 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  return authStore.user.lastCheckInDate === today;
});

// 👇 新增：處理簽到點擊
const handleCheckIn = async () => {
  // 呼叫 Store 裡的簽到功能
  if (authStore.dailyCheckIn) {
    await authStore.dailyCheckIn();
  } else {
    alert('請確認 stores/auth.js 是否已新增 dailyCheckIn 功能');
  }
};
</script>

<template>
  <div class="app-container">
    <nav class="navbar">
      <div class="nav-left">
        <router-link to="/" class="logo" @click="closeMenu">🛒 購物商城</router-link>
      </div>

      <div v-if="authStore.token && authStore.user" class="mobile-greeting">
        Hi, {{ displayName }}
        <span class="mobile-coins">💰${{ authStore.user.coins || 0 }}</span>
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
          
          <div class="coin-section">
            <span class="coin-balance">💰 現有金幣: {{ authStore.user.coins || 0 }}</span>
            <button 
              class="btn-checkin" 
              @click="handleCheckIn" 
              :disabled="hasCheckedInToday"
              :class="{ 'checked': hasCheckedInToday }"
            >
              {{ hasCheckedInToday ? '已簽到 ✅' : '簽到領錢' }}
            </button>
          </div>
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
/* 🖥️ 電腦版樣式 */
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
.mobile-greeting { display: none; }

.nav-right { display: flex; align-items: center; gap: 1.5rem; }

.nav-item { text-decoration: none; color: #666; font-weight: bold; transition: 0.3s; }
.nav-item:hover { color: #42b883; }

.user-info { display: flex; align-items: center; gap: 1rem; }
.welcome-text { font-weight: bold; color: #42b883; }

.cart-count { color: #e74c3c; font-weight: bold; }

/* 👇 新增：金幣與簽到按鈕樣式 */
.coin-section {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff8e1; /* 淡黃色背景 */
  padding: 5px 10px;
  border-radius: 20px;
  border: 1px solid #ffe082;
}

.coin-balance {
  font-size: 0.9rem;
  font-weight: bold;
  color: #f39c12;
}

.btn-checkin {
  background: #f1c40f;
  border: none;
  padding: 4px 10px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: bold;
  color: #333;
  transition: 0.3s;
}

.btn-checkin:hover:not(:disabled) {
  background: #f39c12;
  transform: scale(1.05);
}

.btn-checkin:disabled {
  background: #ddd;
  color: #888;
  cursor: default;
}

.btn-checkin.checked {
  background: #e0e0e0; /* 已簽到的顏色 */
}
/* 👆 新增結束 */

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
/* 📱 平板版優化 */
/* ========================================= */
@media (min-width: 768px) and (max-width: 1024px) {
  .navbar { padding: 1rem 1.5rem; }
  .nav-right { gap: 10px; }
  .nav-item { font-size: 0.9rem; }
  .desktop-greeting { display: none; }
  .btn-login, .btn-logout { padding: 6px 12px; font-size: 0.85rem; }
  
  /* 平板版稍微縮小金幣區塊 */
  .coin-section { padding: 4px 8px; }
  .coin-balance { font-size: 0.85rem; }
}

/* ========================================= */
/* 📱 手機版樣式 */
/* ========================================= */
@media (max-width: 768px) {
  .navbar { padding: 1rem; }

  .hamburger {
    display: block;
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #333;
    padding-left: 10px;
  }

  .mobile-greeting {
    display: flex;
    flex-direction: column; /* 讓名字和錢垂直排 */
    align-items: flex-end;
    margin-left: auto;
    font-weight: bold;
    color: #42b883;
    font-size: 0.9rem;
    max-width: 120px;
    line-height: 1.2;
  }
  
  .mobile-coins {
    font-size: 0.8rem;
    color: #f39c12;
  }

  .desktop-greeting { display: none; }

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

  /* 👇 手機版調整金幣簽到區塊 */
  .coin-section {
    background: transparent;
    border: none;
    border-bottom: 1px solid #eee;
    border-radius: 0;
    justify-content: center; /* 居中 */
    padding: 15px;
    width: 100%;
    box-sizing: border-box; /* 確保 padding 不會撐爆寬度 */
  }
  
  .btn-checkin {
    padding: 8px 20px; /* 按鈕大一點比較好按 */
  }
  /* 👆 調整結束 */

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