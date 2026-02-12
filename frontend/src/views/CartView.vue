<script setup>
import { onMounted, computed } from 'vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

// 一進來就去後端拿資料
onMounted(() => {
  cartStore.fetchCart();
});

// 計算總金額
const totalPrice = computed(() => {
  return cartStore.items.reduce((total, item) => {
    return total + (item.Product.price * item.quantity);
  }, 0);
});
</script>

<template>
  <div class="cart-container">
    <h2>🛒 我的購物車</h2>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      購物車是空的，快去買東西吧！
    </div>

    <div v-else class="cart-list">
      <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
        <img :src="item.Product.imageUrl" alt="商品圖" class="item-img" />
        
        <div class="item-info">
          <h3>{{ item.Product.title }}</h3>
          <p>單價: ${{ item.Product.price }}</p>
          <p>數量: {{ item.quantity }}</p>
        </div>
        
        <p class="item-total">小計: ${{ item.Product.price * item.quantity }}</p>

        </div>

      <div class="checkout-section">
        <h3>總金額: NT$ {{ totalPrice }}</h3>
        <button class="btn-checkout">去結帳</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
}
.cart-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
  gap: 1rem;
}
.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
.item-info {
  flex-grow: 1;
}
.item-total {
  font-weight: bold;
  color: #e74c3c;
}
.btn-checkout {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  width: 100%;
  font-size: 1.2rem;
}
</style>