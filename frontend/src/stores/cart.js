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

    // 加入購物車
    async addToCart(productId, quantity = 1) {
      const authStore = useAuthStore(); 

      // 守門員邏輯
      if (!authStore.token) {
        alert('請先登入會員，才能加入購物車喔！');
        router.push('/login'); 
        return; 
      }

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
    },

    // 👇👇👇 新增：結帳功能 👇👇👇
    async checkout() {
      const authStore = useAuthStore();
      
      // 雙重保險：沒登入不能結帳
      if (!authStore.token) {
        alert('請先登入');
        router.push('/login');
        return;
      }

      try {
        // 呼叫後端結帳 API (建立訂單、扣庫存、清空後端購物車)
        await axios.post('http://localhost:3000/api/orders', {}, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        alert('結帳成功！感謝您的購買 🎉');
        
        // 清空前端的購物車狀態
        this.items = []; 
        
        // 跳轉到歷史訂單頁面 (記得要去設定 Router)
        router.push('/orders'); 

      } catch (error) {
        console.error('結帳失敗:', error);
        alert('結帳失敗，請稍後再試');
      }
    }
    // 👆👆👆 新增結束 👆👆👆
  }
});
