<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useCartStore } from '../stores/cart'; // <--- 1. 引入購物車倉庫

const products = ref([]);
const loading = ref(true);
const cartStore = useCartStore(); // <--- 2. 啟用購物車功能

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/products');
    products.value = response.data;
  } catch (error) {
    console.error('抓取商品失敗:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="home-container">
    <h1>🛍️ 熱門商品</h1>
    
    <div v-if="loading" class="loading">正在搬運商品中...</div>

    <div v-else class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        
        <router-link :to="{ name: 'product', params: { id: product.id } }">
          <div class="image-box">
            <img :src="product.imageUrl" :alt="product.title" />
          </div>
        </router-link>
        
        <div class="info">
          <router-link :to="{ name: 'product', params: { id: product.id } }" class="title-link">
            <h3>{{ product.title }}</h3>
          </router-link>
          
          <p class="price">NT$ {{ product.price }}</p>

          <button class="btn-buy" @click.prevent="cartStore.addToCart(product.id)">
            加入購物車
          </button>
          </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.image-box {
  height: 200px;
  overflow: hidden;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  padding: 1rem;
  text-align: center;
  display: flex;       /* 讓內容垂直排列 */
  flex-direction: column;
  flex-grow: 1;        /* 撐開高度 */
  justify-content: space-between; /* 上下對齊 */
}

.title-link {
  text-decoration: none;
  color: inherit;
}

.title-link:hover h3 {
  color: #42b883;
}

.price {
  color: #e74c3c;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.btn-buy {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0.8rem 1rem; /* 按鈕大一點比較好按 */
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-buy:hover {
  background-color: #3aa876;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}
</style>