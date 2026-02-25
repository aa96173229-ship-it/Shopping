import { defineStore } from 'pinia';
import axios from 'axios';

// 👇 統一設定 Render 網址
const API_URL = 'https://shopping-backend-mdvl.onrender.com';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: JSON.parse(localStorage.getItem('user')) || null, 
  }),
  actions: {
    // ==============================
    // 每日簽到
    // ==============================
    async dailyCheckIn() {
      try {
        // 利用上面定義的 API_URL，寫法更乾淨
        const res = await axios.post(`${API_URL}/api/user/checkin`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        
        // 1. 更新本地的金幣顯示
        this.user.coins = res.data.coins;
        // 2. 順便更新簽到日期，這樣前端按鈕才會馬上變成「已簽到」
        if (res.data.checkInDate) {
          this.user.lastCheckInDate = res.data.checkInDate;
        }
        
        // 3. 同步更新 LocalStorage，確保重整後不會消失
        localStorage.setItem('user', JSON.stringify(this.user));
        
        // 4. 顯示成功訊息
        alert(res.data.message); 

      } catch (error) {
        alert(error.response?.data?.message || '簽到失敗');
      }
    },

    // ==============================
    // 登入功能
    // ==============================
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

    // ==============================
    // 註冊功能
    // ==============================
    async register(email, password, nickname) {
      console.log('🔥 正在嘗試連線到:', `${API_URL}/api/auth/register`);
      try {
        const res = await axios.post(`${API_URL}/api/auth/register`, {
          email,
          password,
          nickname
        });
        return { success: true };
      } catch (error) {
        const msg = error.response?.data?.message || '註冊失敗';
        return { success: false, message: msg };
      }
    },

    // ==============================
    // 登出功能
    // ==============================
    logout() {
  // 1. 清空 Pinia 狀態
  this.token = '';
  this.user = null;
  
  // 2. 清空瀏覽器暫存
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // 🌟 3. 把 window.location.reload(); 刪掉！交給外面的 router.push 去跳轉就好
  }
  }
});