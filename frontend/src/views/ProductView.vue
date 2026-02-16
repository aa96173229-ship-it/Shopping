<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useCartStore } from '../stores/cart';

const route = useRoute();
const cartStore = useCartStore();
const product = ref(null);
const loading = ref(true);
const quantity = ref(1);

// 👇 1. 新增一個開關，預設是 false (沒在忙)
const isProcessing = ref(false);

const increase = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++;
  }
};

const decrease = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 👇 2. 修改後的「防手抖」函式 (加上強制延遲)
const handleAddToCart = async () => {
  // 👇 1. 印出目前的狀態
  console.log('按鈕被按下了！目前鎖的狀態:', isProcessing.value);

  if (isProcessing.value) {
    console.log('🚫 門是鎖著的，擋掉重複點擊！');
    return;
  }

  isProcessing.value = true;
  console.log('🔒 上鎖！準備發送請求...');

  try {
    await cartStore.addToCart(product.value.id, quantity.value);
    console.log('✅ 請求完成！');
  } finally {
    // 強制延遲解鎖
    setTimeout(() => {
      isProcessing.value = false;
      console.log('🔓 解鎖！現在可以再按了');
    }, 500); 
  }
};

onMounted(async () => {
  try {
    const productId = route.params.id;
    const response = await axios.get(`https://shopping-backend-mdvl.onrender.com/api/products/${productId}`);
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

        <div class="action-box">
          <div class="quantity-selector">
            <button @click="decrease" :disabled="quantity <= 1">-</button>
            <input type="number" v-model="quantity" readonly />
            <button @click="increase" :disabled="quantity >= product.stock">+</button>
          </div>

          <button 
            class="btn-add" 
            @click.prevent="handleAddToCart" 
            :disabled="isProcessing || product.stock === 0"
          >
            {{ isProcessing ? '加入中...' : (product.stock === 0 ? '已售完' : `加入購物車 (${quantity})`) }}
          </button>
        </div>
        <div style="margin-top: 1rem;">
          <router-link to="/" class="btn-back">繼續購物</router-link>
        </div>
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
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

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
  color: #e74c3c;
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

/* 👇 新增樣式：讓按鈕跟數量框排好 */
.action-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}

.quantity-selector button {
  background: #f0f0f0;
  border: none;
  width: 35px;
  height: 35px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.quantity-selector button:hover:not(:disabled) {
  background: #e0e0e0;
}

.quantity-selector button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.quantity-selector input {
  width: 50px;
  text-align: center;
  border: none;
  font-size: 1.1rem;
  height: 35px;
  /* 移除預設樣式 */
  outline: none;
  -moz-appearance: textfield;
}
/* 移除 input number 的上下箭頭 */
.quantity-selector input::-webkit-outer-spin-button,
.quantity-selector input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn-add {
  background: #42b883;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  flex: 1; /* 讓按鈕填滿剩下的空間 */
}

.btn-add:hover {
  background: #3aa876;
}

.btn-back {
  display: inline-block;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}
.btn-back:hover {
  text-decoration: underline;
}

.loading, .not-found {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 3rem;
  color: #888;
}

/* 👇 新增樣式：當按鈕被 disabled (加入中) 的時候變灰色 */
.btn-add:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none; /* 取消原本可能的點擊特效 */
}
</style>