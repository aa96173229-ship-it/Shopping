import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';
import router from '../router';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  actions: {
    // 取得購物車內容
    async fetchCart() {
      const authStore = useAuthStore();
      if (!authStore.token) {
        this.items = [];
        return;
      }
      try {
        const res = await axios.get('https://shopping-backend-mdvl.onrender.com/api/cart/items', {
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
        await axios.post('https://shopping-backend-mdvl.onrender.com/api/cart/items', {
          productId,
          quantity
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        alert('已加入購物車！');
        this.fetchCart();
      } catch (error) {
        console.error('加入失敗:', error);
        // 👇👇👇 修改重點：抓取後端回傳的具體錯誤訊息 (如：庫存不足) 👇👇👇
        const errorMsg = error.response?.data?.message || '加入購物車失敗';
        alert(errorMsg);
      }
    },

    // 更新數量
    async updateQuantity(itemId, newQuantity) {
      const authStore = useAuthStore();
      if (newQuantity < 1) return; // 至少要有一個

      try {
        await axios.put(`https://shopping-backend-mdvl.onrender.com/api/cart/items/${itemId}`, {
          quantity: newQuantity
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        
        // 更新成功後，重新抓取購物車資料
        this.fetchCart();
      } catch (error) {
        console.error('更新數量失敗:', error);
        // 👇👇👇 修改重點：顯示錯誤並強制重抓 (讓數字跳回原本合法的數量) 👇👇👇
        const errorMsg = error.response?.data?.message || '更新失敗';
        alert(errorMsg);
        this.fetchCart(); // 重要！失敗時要把前端顯示的數字改回原本的
      }
    },

    // 刪除商品
    async removeItem(itemId) {
      const authStore = useAuthStore();
      if(!confirm('確定要移除這個商品嗎？')) return;

      try {
        await axios.delete(`https://shopping-backend-mdvl.onrender.com/api/cart/items/${itemId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.fetchCart();
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗');
      }
    },

    // 結帳
    async checkout() {
      const authStore = useAuthStore();
      if (!authStore.token) {
        alert('請先登入');
        router.push('/login');
        return;
      }
      try {
        await axios.post('https://shopping-backend-mdvl.onrender.com/api/orders', {}, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        alert('結帳成功！感謝您的購買 🎉');
        this.items = [];
        router.push('/orders');
      } catch (error) {
        console.error('結帳失敗:', error);
        // 👇👇👇 修改重點：顯示結帳失敗原因 👇👇👇
        const errorMsg = error.response?.data?.message || '結帳失敗，請稍後再試';
        alert(errorMsg);
      }
    }
  }
});