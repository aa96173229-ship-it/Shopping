import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 👇👇👇 修改：嘗試從瀏覽器讀取舊的使用者資料，以免重新整理後變空白 👇👇👇
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || null, 
  }),
  actions: {
    async login(email, password) {
      try {
        // 請確認這裡的網址是正確的 (開發用 localhost，上線用 Render)
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        const res = await axios.post(`${apiUrl}/api/auth/login`, {
          email,
          password
        });

        // 1. 存 Token
        this.token = res.data.token;
        localStorage.setItem('token', this.token);

        // 2. 存使用者資料 (包含 nickname)
        this.user = res.data.user; 
        localStorage.setItem('user', JSON.stringify(this.user)); // 👈 關鍵！存入 LocalStorage

        return true;
      } catch (error) {
        console.error('登入失敗', error);
        alert(error.response?.data?.message || '登入失敗');
        return false;
      }
    },

    logout() {
      // 清空所有資料
      this.token = '';
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 重新整理網頁，確保狀態清空
      window.location.reload(); 
    }
  }
});