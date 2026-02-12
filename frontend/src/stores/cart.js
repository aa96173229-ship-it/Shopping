import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth'; // 👈 1. 引入 Auth Store
import router from '../router';         // 👈 2. 引入 Router 用來跳轉

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  actions: {
    // 取得購物車內容
    async fetchCart() {
      const authStore = useAuthStore();
      // 如果沒登入，就不去後端要資料了，直接清空
      if (!authStore.token) {
        this.items = [];
        return;
      }

      try {
        const res = await axios.get('http://localhost:3000/api/cart/items', {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.items = res.data;
      } catch (error) {
        console.error('取得購物車失敗:', error);
      }
    },

    // 加入購物車 (重點在這裡！)
    async addToCart(productId, quantity = 1) {
      const authStore = useAuthStore(); // 👈 3. 啟用 Auth 功能

      // 👇👇👇 4. 守門員邏輯 👇👇👇
      if (!authStore.token) {
        alert('請先登入會員，才能加入購物車喔！');
        router.push('/login'); // 把人踢去登入頁
        return; // ⛔️ 停止！不準執行後面的程式碼
      }
      // 👆👆👆 檢查結束 👆👆👆

      try {
        await axios.post('http://localhost:3000/api/cart/items', {
          productId,
          quantity
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        alert('已加入購物車！');
        this.fetchCart(); // 更新狀態
      } catch (error) {
        console.error('加入失敗:', error);
        alert('加入購物車失敗');
      }
    }
  }
});