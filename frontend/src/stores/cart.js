import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';
import router from '../router';

const API_URL = 'https://shopping-backend-mdvl.onrender.com/api/cart'; // 👈 統一管理網址

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  // 👇👇👇 請補上這一段 getters 👇👇👇
  getters: {
    totalPrice: (state) => {
      return state.items.reduce((total, item) => {
        // 雙重保險：處理大小寫
        const product = item.Product || item.product;
        const price = product?.price || 0;
        return total + (price * item.quantity);
      }, 0);
    },
  },
  actions: {
    // 取得購物車內容
    async fetchCart() {
      const authStore = useAuthStore();
      if (!authStore.token) {
        this.items = [];
        return;
      }
      try {
        // 修正：刪除後面的 /items
        const res = await axios.get(API_URL, {
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
      if (!authStore.token) {
        alert('請先登入會員，才能加入購物車喔！');
        router.push('/login');
        return;
      }
      try {
        // 修正：網址改為 API_URL，刪除 /items
        await axios.post(API_URL, {
          productId,
          quantity
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        alert('已加入購物車！');
        this.fetchCart();
      } catch (error) {
        console.error('加入失敗:', error);
        const errorMsg = error.response?.data?.message || '加入購物車失敗';
        alert(errorMsg);
      }
    },

    // 更新數量 ( itemId 通常就是 productId 或資料庫 id )
    async updateQuantity(itemId, newQuantity) {
      const authStore = useAuthStore();
      if (newQuantity < 1) return;

      try {
        // 修正：網址改為 /api/cart/${itemId}
        await axios.put(`${API_URL}/${itemId}`, {
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        this.fetchCart();
      } catch (error) {
        console.error('更新數量失敗:', error);
        const errorMsg = error.response?.data?.message || '更新失敗';
        alert(errorMsg);
        this.fetchCart();
      }
    },

    // 刪除商品
    async removeItem(itemId) {
      const authStore = useAuthStore();
      if(!confirm('確定要移除這個商品嗎？')) return;

      try {
        // 修正：網址改為 /api/cart/${itemId}
        await axios.delete(`${API_URL}/${itemId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.fetchCart();
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗');
      }
    },

    // 👇👇👇 請補上這一段 👇👇👇
    async checkout() {
      const authStore = useAuthStore();
      
      if (this.items.length === 0) {
        alert('購物車是空的，無法結帳！');
        return;
      }

      // 二次確認 (怕誤按)
      if (!confirm(`確定要結帳嗎？總金額: NT$ ${this.totalPrice || '計算中'}`)) {
        return;
      }

      try {
        // 發送結帳請求給後端 (注意：這裡不需要傳 cartItems，後端會自己去資料庫抓)
        await axios.post('https://shopping-backend-mdvl.onrender.com/api/orders', {}, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        alert('🎉 結帳成功！');
        
        // 1. 清空前端購物車狀態
        this.items = [];
        
        // 2. 導向到歷史訂單頁面
        router.push('/orders'); 

      } catch (error) {
        console.error('結帳失敗:', error);
        const errorMsg = error.response?.data?.message || '結帳發生錯誤，請稍後再試';
        alert(`❌ 結帳失敗: ${errorMsg}`);
      }
    },
  }
});