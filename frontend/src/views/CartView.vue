<script setup>
import { onMounted } from 'vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<template>
  <div class="cart-container">
    <h1>🛒 我的購物車</h1>

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      購物車是空的，快去買東西吧！
      <router-link to="/" class="btn-go-shop">去逛逛</router-link>
    </div>

    <div v-else>
      <div class="cart-list">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img :src="item.Product?.imageUrl" alt="商品圖片" class="item-img" />
          
          <div class="item-info">
            <h3>{{ item.Product?.title }}</h3>
            <p class="price">單價：NT$ {{ item.Product?.price }}</p>
          </div>

          <div class="quantity-control">
            <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>

          <div class="subtotal">
            NT$ {{ (item.Product?.price * item.quantity) }}
          </div>

          <button @click="cartStore.removeItem(item.id)" class="btn-remove">×</button>
        </div>
      </div>

      <div class="cart-footer">
        <h2>總金額：NT$ {{ cartStore.totalPrice }}</h2>
        <button class="btn-checkout">前往結帳</button>
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
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding: 1rem 0;
}
.item-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
.item-info {
  flex: 1;
  margin-left: 1rem;
}
.quantity-control button {
  width: 30px;
  height: 30px;
  background: #f0f0f0;
  border: none;
  cursor: pointer;
}
.quantity-control span {
  margin: 0 10px;
}
.btn-remove {
  background: #ff4d4f;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 1rem;
}
.cart-footer {
  margin-top: 2rem;
  text-align: right;
  border-top: 2px solid #eee;
  padding-top: 1rem;
}
.btn-checkout {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
.empty-cart {
  text-align: center;
  margin-top: 3rem;
  color: #666;
}
.btn-go-shop {
  display: block;
  margin-top: 1rem;
  color: #42b883;
}
</style>