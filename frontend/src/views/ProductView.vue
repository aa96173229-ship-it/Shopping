<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // 用來抓網址上的 id
import axios from 'axios';
import { useCartStore } from '../stores/cart'; // 引入購物車倉庫

const route = useRoute();
const cartStore = useCartStore(); // 使用購物車功能
const product = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // 抓取網址上的 id (例如 /product/1 的 "1")
    const productId = route.params.id;
    // 向後端請求單一商品資料
    const response = await axios.get(`http://localhost:3000/api/products/${productId}`);
    product.value = response.data;
  } catch (error) {
    console.error('抓取商品失敗:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container">
    <div v-if="loading" class="loading">商品載入中...</div>
    
    <div v-else-if="product" class="product-detail">
      <div class="image-section">
        <img :src="product.imageUrl" :alt="product.title" />
      </div>

      <div class="info-section">
        <h1>{{ product.title }}</h1>
        <p class="price">NT$ {{ product.price }}</p>
        <p class="stock">庫存剩餘: {{ product.stock }} 件</p>
        
        <div class="description">
          <h3>商品介紹</h3>
          <p>{{ product.description }}</p>
        </div>

        <button class="btn-add" @click="cartStore.addToCart(product.id)">
          加入購物車
        </button>
        
        <router-link to="/" class="btn-back">繼續購物</router-link>
      </div>
    </div>

    <div v-else class="not-found">找不到此商品</div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 左圖右文 */
  gap: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

/* 手機版變成上下排列 */
@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}

.image-section img {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.info-section h1 {
  margin-top: 0;
  color: #333;
}

.price {
  font-size: 1.5rem;
  color: #e74c3c; /* 紅色價格 */
  font-weight: bold;
}

.stock {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.description {
  margin: 2rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  line-height: 1.6;
}

.btn-add {
  background: #42b883; /* Vue 綠色 */
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  transition: background 0.3s;
}

.btn-add:hover {
  background: #3aa876;
}

.btn-back {
  display: inline-block;
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.loading, .not-found {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 3rem;
  color: #888;
}
</style>