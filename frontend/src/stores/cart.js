import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth'; // 引入登入狀態，因為要拿 token

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);
  const authStore = useAuthStore();

  // 計算總金額
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.Product?.price || 0) * item.quantity;
    }, 0);
  });

  // 計算總數量 (顯示在 Navbar 用)
  const totalCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  // 1. 取得購物車內容
  const fetchCart = async () => {
    if (!authStore.token) return; // 沒登入就不抓
    try {
      const res = await axios.get('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      items.value = res.data;
    } catch (error) {
      console.error('抓取購物車失敗:', error);
    }
  };

  // 2. 加入購物車
  const addToCart = async (productId, quantity = 1) => {
    if (!authStore.token) {
      alert('請先登入！');
      return;
    }
    try {
      await axios.post('http://localhost:3000/api/cart/items', 
        { productId, quantity },
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      );
      await fetchCart(); // 加完後重新抓一次，確保資料同步
      alert('已加入購物車！');
    } catch (error) {
      console.error('加入失敗:', error);
    }
  };

  // 3. 移除商品
  const removeItem = async (itemId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cart/items/${itemId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      await fetchCart();
    } catch (error) {
      console.error('移除失敗:', error);
    }
  };

  // 4. 更新數量
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await axios.put(`http://localhost:3000/api/cart/items/${itemId}`, 
        { quantity },
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('更新失敗:', error);
    }
  };

  return { items, totalPrice, totalCount, fetchCart, addToCart, removeItem, updateQuantity };
});