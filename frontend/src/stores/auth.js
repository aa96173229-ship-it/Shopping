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
    // 每日簽到
    async dailyCheckIn() {
        try {
            const res = await axios.post(`${API_URL}/user/checkin`, {}, {
                headers: { Authorization: `Bearer ${this.token}` }
            });
            
            // 更新本地的金幣顯示
            this.user.coins = res.data.coins;
            // 同步更新 LocalStorage
            localStorage.setItem('user', JSON.stringify(this.user));
            
            alert(res.data.message); // "簽到成功！獲得 $20 金幣"
        } catch (error) {
            alert(error.response?.data?.message || '簽到失敗');
        }
    },
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
      // 👇👇👇 加入這一行 console.log 👇👇👇
  console.log('🔥 正在嘗試連線到:', `${API_URL}/api/auth/register`);
  try {
    const res = await axios.post(`${API_URL}/api/auth/register`, {
      email,
      password,
      nickname
    });
    return { success: true };
  } catch (error) {
    // 這裡會把後端傳回來的 "所有欄位都必須填寫" 抓出來
    const msg = error.response?.data?.message || '註冊失敗';
    return { success: false, message: msg };
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