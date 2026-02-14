<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useCartStore } from '../stores/cart'; 

// 這裡定義的是「全部商品 (複數)」
const products = ref([]);
const loading = ref(true);
const cartStore = useCartStore(); 

onMounted(async () => {
  try {
    const response = await axios.get('https://shopping-backend-mdvl.onrender.com/api/products');
    
    // 把資料塞進 products (複數)
    products.value = response.data.map(p => ({
      ...p,
      quantity: 1 
    }));

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

          <p v-if="product.stock > 0" class="stock-info">庫存剩餘: {{ product.stock }}</p>
          <p v-else class="stock-info sold-out">🚫 已售完</p>

          <div class="action-row">
            <div class="qty-control" @click.prevent>
              <button 
                @click="product.quantity > 1 ? product.quantity-- : null"
                :disabled="product.quantity <= 1 || product.stock === 0" 
              >-</button>
              
              <input type="number" v-model="product.quantity" readonly />
              
              <button 
                @click="product.quantity < product.stock ? product.quantity++ : null"
                :disabled="product.quantity >= product.stock || product.stock === 0"
              >+</button>
            </div>

            <button 
              class="btn-buy" 
              @click.prevent="cartStore.addToCart(product.id, product.quantity)"
              :disabled="product.stock === 0"
              :class="{ 'btn-disabled': product.stock === 0 }"
            >
              {{ product.stock === 0 ? '補貨中' : '加入購物車' }}
            </button>
          </div>
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between; 
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
  margin: 0.5rem 0 0.2rem 0;
}

.stock-info {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.8rem;
}

.sold-out {
  color: red;
  font-weight: bold;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 8px; 
  margin-top: auto;
}

.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  overflow: hidden;
}

.qty-control button {
  width: 28px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: bold;
  color: #555;
  transition: background 0.2s;
  padding: 0;
}

.qty-control button:hover:not(:disabled) {
  background: #e0e0e0;
}

.qty-control button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.qty-control input {
  width: 32px;
  height: 32px;
  border: none;
  text-align: center;
  font-size: 0.9rem;
  background: transparent;
  outline: none;
  -moz-appearance: textfield;
}

.btn-buy {
  flex: 1; 
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0; 
  height: 34px; 
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-buy:hover {
  background-color: #3aa876;
}

.btn-disabled {
  background-color: #ccc !important;
  cursor: not-allowed;
}

.btn-disabled:hover {
  background-color: #ccc !important;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}
</style>