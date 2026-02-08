// frontend/src/stores/auth.js
import { defineStore } from 'pinia'; // 👈 前端是用 import
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // 1. 嘗試從瀏覽器暫存 (localStorage) 讀取 token
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

  // 2. 登入動作：存入 token 並寫入暫存
  const login = (newToken, userData) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 3. 登出動作：清空資料
  const logout = () => {
    token.value = '';
    user.value = {};
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return { token, user, login, logout };
});