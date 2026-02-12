<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useCartStore } from '../stores/cart'; 

const products = ref([]);
const loading = ref(true);
const cartStore = useCartStore(); 

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/products');
    
    // 👇 1. 資料加工：幫每個商品加上 quantity: 1
    products.value = response.data.map(product => ({
      ...product,
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

          <div class="action-row">
            
            <div class="qty-control" @click.prevent>
              <button 
                @click="product.quantity > 1 ? product.quantity-- : null"
                :disabled="product.quantity <= 1"
              >-</button>
              
              <input type="number" v-model="product.quantity" readonly />
              
              <button 
                @click="product.quantity < (product.stock || 99) ? product.quantity++ : null"
                :disabled="product.quantity >= (product.stock || 99)"
              >+</button>
            </div>

            <button class="btn-buy" @click.prevent="cartStore.addToCart(product.id, product.quantity)">
              加入購物車
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
  margin: 0.5rem 0 1rem 0; /* 增加下方間距 */
}

/* 👇 3. 新增與修改的樣式 👇 */

/* 讓數量框與加入按鈕並排 */
.action-row {
  display: flex;
  align-items: center;
  gap: 8px; /* 兩者之間的距離 */
  margin-top: auto;
}

/* 數量選擇器的外框 */
.qty-control {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  overflow: hidden;
}

/* 加減按鈕 */
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

/* 數字輸入框 */
.qty-control input {
  width: 32px;
  height: 32px;
  border: none;
  text-align: center;
  font-size: 0.9rem;
  background: transparent;
  outline: none;
  /* 移除預設箭頭 */
  -moz-appearance: textfield;
}
.qty-control input::-webkit-outer-spin-button,
.qty-control input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 修改加入按鈕：改為 flex: 1 填滿剩餘空間 */
.btn-buy {
  flex: 1; 
  background-color: #42b883;
  color: white;
  border: none;
  padding: 0; /* 高度交給 flex 自動對齊 */
  height: 34px; /* 設定固定高度讓它跟左邊一樣高 */
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

.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #666;
}
</style>