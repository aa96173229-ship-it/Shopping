<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useCartStore } from '../stores/cart'; 

const products = ref([]);
const loading = ref(true);
const cartStore = useCartStore(); 

// 🌟 新增：搜尋與分類狀態
const searchQuery = ref('');
const selectedCategory = ref('全部');
const categories = ['全部', '衣服', '褲子', '鞋子', '配件', '其他'];

// 🌟 將抓取資料獨立成一個函式，方便搜尋/切換分類時呼叫
// 🌟 升級版：前端自己做過濾 (完全不用管後端聽不聽得懂)
const fetchProducts = async () => {
  loading.value = true;
  try {
    // 1. 直接跟後端拿「所有商品」，我們不傳參數給它了
    const response = await axios.get('https://shopping-backend-mdvl.onrender.com/api/products');
    
    // 2. 先把所有商品加上 quantity
    let allProducts = response.data.map(p => ({
      ...p,
      quantity: 1 
    }));

    // 🌟 3. 關鍵魔法：在前端過濾【分類】
    if (selectedCategory.value !== '全部') {
      // 只留下 category 等於我們點擊的分類的商品
      allProducts = allProducts.filter(p => p.category === selectedCategory.value);
    }

    // 🌟 4. 關鍵魔法：在前端過濾【搜尋關鍵字】
    if (searchQuery.value.trim() !== '') {
      const keyword = searchQuery.value.trim().toLowerCase(); // 轉小寫比較準
      allProducts = allProducts.filter(p => {
        // 抓出商品名稱，並判斷有沒有包含我們打的字
        const itemName = p.title || p.name || '';
        return itemName.toLowerCase().includes(keyword);
      });
    }

    // 5. 把過濾完的結果，交給畫面上顯示！
    products.value = allProducts;

  } catch (error) {
    console.error('抓取商品失敗:', error);
  } finally {
    loading.value = false;
  }
};
// 網頁掛載時抓取一次
onMounted(() => {
  fetchProducts();
});

// 🌟 監聽分類變化，一切換就自動重抓資料
watch(selectedCategory, () => {
  fetchProducts();
});

// 🌟 點擊搜尋或按下 Enter 時執行
const handleSearch = () => {
  fetchProducts();
};
</script>

<template>
  <main class="home-container">
    <h1>🛍️ 熱門商品</h1>
    
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          @keyup.enter="handleSearch" 
          placeholder="找商品... (例如: 外套)"
        />
        <button @click="handleSearch" class="btn-search">搜尋 🔍</button>
      </div>

      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          :class="['tab-btn', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">正在搬運商品中...</div>
    
    <div v-else-if="products.length === 0" class="empty-state">
      😢 找不到符合條件的商品，換個關鍵字或分類試試看吧！
    </div>

    <div v-else class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        
        <router-link :to="{ name: 'product', params: { id: product.id } }">
          <div class="image-box">
            <img :src="product.imageUrl || 'https://via.placeholder.com/200?text=No+Image'" :alt="product.title" />
          </div>
        </router-link>
        
        <div class="info">
          <span class="category-badge">{{ product.category || '其他' }}</span>

          <router-link :to="{ name: 'product', params: { id: product.id } }" class="title-link">
            <h3>{{ product.title || product.name }}</h3>
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
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

/* =========================================
   🔍 搜尋與分類樣式 (整合進來)
========================================= */
.toolbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
}

.search-box {
  display: flex;
  width: 100%;
  max-width: 500px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #ddd;
  border-right: none;
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
  outline: none;
}

.search-box input:focus { border-color: #42b883; }

.btn-search {
  padding: 0 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

.btn-search:hover { background: #3aa876; }

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.tab-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  color: #555;
  font-weight: bold;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  border-color: #42b883;
  color: #42b883;
}

.tab-btn.active {
  background: #42b883;
  color: white;
  border-color: #42b883;
  box-shadow: 0 4px 6px rgba(66, 184, 131, 0.3);
}

.empty-state {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.category-badge {
  align-self: flex-start;
  background: #eee;
  color: #666;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 5px;
}

/* =========================================
   🛍️ 原本的商品網格樣式 (保留)
========================================= */
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
  background: #f9f9f9;
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
  margin-bottom: 5px;
}

.title-link h3 {
  margin: 0;
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

.qty-control input {
  width: 32px;
  height: 32px;
  border: none;
  text-align: center;
  font-size: 0.9rem;
  background: transparent;
  outline: none;
  
  /* 👇 修正這裡：同時提供專屬版與標準版 */
  -moz-appearance: textfield; /* 給 Firefox 看的 */
  appearance: textfield;      /* 🌟 補上這行標準版，警告就會消失！ */
}

/* 🌟 順便補上這段：把 Chrome, Safari, Edge 的上下箭頭也徹底隱藏 */
.qty-control input::-webkit-outer-spin-button,
.qty-control input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
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