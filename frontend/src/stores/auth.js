import { defineStore } from 'pinia';
import axios from 'axios';

// 👇👇👇 1. 統一設定 Render 網址 (我都幫你填好了) 👇👇👇
const API_URL = 'https://shopping-backend-mdvl.onrender.com';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || null, 
  }),
  actions: {
    // --- 登入功能 ---
    // ... 前面省略 ...
    async login(email, password) {
      try {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        
        // 確保這兩行有執行，名字才會存進 Pinia
        this.token = res.data.token;
        this.user = res.data.user; 
        
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        return { success: true }; 
      } catch (error) {
        const msg = error.response?.data?.message || '登入失敗';
        return { success: false, message: msg };
      }
    },

    async register(email, password, nickname) {
      try {
        await axios.post(`${API_URL}/api/auth/register`, { email, password, nickname });
        return { success: true };
      } catch (error) {
        const msg = error.response?.data?.message || '註冊失敗，請稍後再試';
        return { success: false, message: msg }; // 👈 回傳原因
      }
    },
// ... 後面省略 ...
    // --- 👆👆👆 新增結束 👆👆👆 ---

    logout() {
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload(); 
    }
  }
});