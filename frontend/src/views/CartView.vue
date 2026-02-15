<script setup>
import { onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.fetchCart();
});

// ✅ 修正：加上 ?. 避免資料還沒抓到時報錯導致白屏
const totalPrice = computed(() => {
  return cartStore.items.reduce((total, item) => {
    // 使用可選鏈運算子 ?. 確保 Product 存在
    const price = item.Product?.price || 0;
    return total + (price * item.quantity);
  }, 0);
});
</script>

<template>
  <div class="cart-container">
    <h2>🛒 我的購物車</h2>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>購物車是空的，快去買東西吧！</p>
      <router-link to="/" class="btn-go-shop">去逛逛</router-link>
    </div>

    <div v-else class="cart-list">
      <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
        <img :src="item.Product?.imageUrl" alt="商品圖" class="item-img" />
        
        <div class="item-info">
          <h3>{{ item.Product?.title || '載入中...' }}</h3>
          <p class="unit-price">單價: ${{ item.Product?.price || 0 }}</p>
        </div>

        <div class="quantity-control">
          <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
          
          <span>{{ item.quantity }}</span>
          
          <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
        </div>
        
        <p class="item-total">NT$ {{ (item.Product?.price || 0) * item.quantity }}</p>

        <button class="btn-remove" @click="cartStore.removeItem(item.id)">×</button>
      </div>

      <div class="checkout-section">
        <h3>總金額: <span class="total-price">NT$ {{ totalPrice }}</span></h3>
        <button class="btn-checkout" @click="cartStore.checkout">去結帳</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 你原本的 CSS 寫得很漂亮，維持不變即可 */
.cart-container { max-width: 900px; margin: 2rem auto; padding: 1rem; background: #fff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
h2 { text-align: center; color: #2c3e50; margin-bottom: 2rem; }
.cart-item { display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 1.5rem 0; gap: 1.5rem; }
.item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #eee; }
.item-info { flex-grow: 1; }
.item-info h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
.unit-price { color: #888; font-size: 0.9rem; }
.quantity-control { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; }
.quantity-control button { width: 30px; height: 30px; border: none; background: #f8f9fa; cursor: pointer; font-weight: bold; }
.quantity-control button:hover:not(:disabled) { background: #e2e6ea; }
.quantity-control span { width: 40px; text-align: center; font-size: 1rem; }
.item-total { font-weight: bold; color: #e74c3c; width: 100px; text-align: right; }
.btn-remove { background: transparent; border: none; color: #ccc; font-size: 1.5rem; cursor: pointer; padding: 0 10px; }
.btn-remove:hover { color: #e74c3c; }
.checkout-section { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #eee; text-align: right; }
.total-price { color: #e74c3c; font-size: 1.5rem; }
.btn-checkout { background: #42b883; color: white; border: none; padding: 12px 30px; border-radius: 4px; margin-top: 1rem; cursor: pointer; font-size: 1.2rem; transition: background 0.3s; }
.btn-checkout:hover { background: #3aa876; }
.empty-cart { text-align: center; padding: 3rem; color: #888; }
.btn-go-shop { display: inline-block; margin-top: 1rem; padding: 10px 20px; background: #2c3e50; color: white; text-decoration: none; border-radius: 4px; }
</style>