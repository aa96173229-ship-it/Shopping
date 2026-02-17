<script setup>
import { onMounted, computed, ref } from 'vue';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth'; // 👈 1. 引入 AuthStore 拿金幣

const cartStore = useCartStore();
const authStore = useAuthStore(); // 👈 初始化

// 👇 2. 新增：控制是否使用金幣
const useCoins = ref(false);

onMounted(() => {
  cartStore.fetchCart();
});

// 計算購物車原始總金額
const cartTotal = computed(() => {
  return cartStore.items.reduce((total, item) => {
    const product = item.Product || item.product; 
    const price = product?.price || 0;
    return total + (price * item.quantity);
  }, 0);
});

// 👇 3. 新增：計算實際折抵金額
const discountAmount = computed(() => {
  if (!useCoins.value || !authStore.user?.coins) return 0;
  // 折抵金額不能超過訂單總額 (例如訂單 100元，金幣 500元，只能折 100元)
  return Math.min(cartTotal.value, authStore.user.coins);
});

// 👇 4. 新增：計算最終結帳金額
const finalPrice = computed(() => {
  return cartTotal.value - discountAmount.value;
});

// 修改結帳函式
const handleCheckout = () => {
  // 把 "是否使用金幣" 的參數傳給 Store
  cartStore.checkout({ useCoins: useCoins.value });
};
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
        <div class="item-img-box">
          <img :src="item.Product?.imageUrl" alt="商品圖" class="item-img" />
        </div>
        
        <div class="item-info">
          <h3>{{ item.Product?.title || '載入中...' }}</h3>
          <p class="unit-price">單價: ${{ item.Product?.price || 0 }}</p>
          
          <p v-if="item.quantity >= item.Product?.stock" class="stock-warning">
            ⚠️ 已達庫存上限 (剩 {{ item.Product?.stock }})
          </p>
        </div>

        <div class="action-group">
          <div class="quantity-control">
            <button 
              @click="cartStore.updateQuantity(item.id, item.quantity - 1)" 
              :disabled="item.quantity <= 1"
            >-</button>
            
            <span>{{ item.quantity }}</span>
            
            <button 
              @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              :disabled="item.quantity >= (item.Product?.stock || 999)"
            >+</button>
          </div>
          <button class="btn-remove" @click="cartStore.removeItem(item.id)">×</button>
        </div>
      </div>

      <div class="checkout-section">
        
        <div v-if="authStore.user?.coins > 0" class="coin-discount-box">
          <label class="coin-label">
            <input type="checkbox" v-model="useCoins">
            <span class="coin-text">
              使用金幣折抵 (現有 💰{{ authStore.user.coins }})
            </span>
          </label>
          <div v-if="useCoins" class="discount-info">
            本次折抵: <span class="minus-price">- NT$ {{ discountAmount }}</span>
          </div>
        </div>

        <div class="price-summary">
          <div class="price-row">
            <span>小計:</span>
            <span>NT$ {{ cartTotal }}</span>
          </div>
          <div v-if="useCoins && discountAmount > 0" class="price-row discount">
            <span>金幣折抵:</span>
            <span>- NT$ {{ discountAmount }}</span>
          </div>
          <div class="price-row total">
            <span>總金額:</span>
            <span class="final-price">NT$ {{ finalPrice }}</span>
          </div>
        </div>

        <button class="btn-checkout" @click="handleCheckout">
          確認結帳 (NT$ {{ finalPrice }})
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container { max-width: 900px; margin: 2rem auto; padding: 1.5rem; background: #fff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
h2 { text-align: center; color: #2c3e50; margin-bottom: 2rem; font-weight: bold; }

/* 列表項目優化 */
.cart-item { 
  display: flex; 
  align-items: center; 
  border-bottom: 1px solid #f0f0f0; 
  padding: 1.5rem 0; 
  gap: 1.5rem; 
}

.item-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }

.item-info { flex-grow: 1; }
.item-info h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333; }
.unit-price { color: #888; font-size: 0.9rem; }
.stock-warning { color: #e74c3c; font-size: 0.85rem; margin-top: 5px; font-weight: bold; }

/* 操作區塊 */
.action-group { display: flex; align-items: center; gap: 15px; }

.quantity-control { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
.quantity-control button { width: 32px; height: 32px; border: none; background: #f8f9fa; cursor: pointer; font-size: 1.2rem; transition: 0.2s; }
.quantity-control button:hover:not(:disabled) { background: #e2e6ea; }
.quantity-control button:disabled { color: #ccc; cursor: not-allowed; }
.quantity-control span { width: 40px; text-align: center; font-size: 1rem; font-weight: 500; }

.btn-remove { 
  background: #fff0f0; 
  border: none; 
  color: #e74c3c; 
  font-size: 1.2rem; 
  cursor: pointer; 
  width: 32px; 
  height: 32px; 
  border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
  transition: 0.3s;
}
.btn-remove:hover { background: #e74c3c; color: white; }

/* 結帳區塊 */
.checkout-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #f0f0f0; }

/* 金幣折抵樣式 */
.coin-discount-box {
  background: #fff8e1;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ffe082;
  margin-bottom: 1.5rem;
}
.coin-label { display: flex; align-items: center; cursor: pointer; font-weight: bold; color: #f39c12; }
.coin-label input { width: 18px; height: 18px; margin-right: 10px; cursor: pointer; }
.discount-info { margin-top: 8px; font-size: 0.95rem; color: #d35400; padding-left: 28px; }
.minus-price { font-weight: bold; }

/* 價格匯總 */
.price-summary { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; margin-bottom: 1.5rem; }
.price-row { font-size: 1.1rem; color: #555; display: flex; gap: 20px; }
.price-row.discount { color: #e74c3c; }
.price-row.total { font-size: 1.5rem; font-weight: bold; color: #333; margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px; }
.final-price { color: #e74c3c; }

.btn-checkout { 
  width: 100%; 
  background: #42b883; 
  color: white; 
  border: none; 
  padding: 16px; 
  border-radius: 8px; 
  font-size: 1.2rem; 
  font-weight: bold; 
  cursor: pointer; 
  transition: background 0.3s, transform 0.2s; 
  box-shadow: 0 4px 6px rgba(66, 184, 131, 0.2);
}
.btn-checkout:hover { background: #3aa876; transform: translateY(-2px); }
.btn-checkout:active { transform: translateY(0); }

.empty-cart { text-align: center; padding: 4rem 2rem; color: #888; }
.btn-go-shop { display: inline-block; margin-top: 1.5rem; padding: 12px 30px; background: #2c3e50; color: white; text-decoration: none; border-radius: 50px; font-weight: bold; transition: 0.3s; }
.btn-go-shop:hover { background: #34495e; box-shadow: 0 4px 10px rgba(44, 62, 80, 0.3); }

/* RWD 手機版調整 */
@media (max-width: 768px) {
  .cart-container { padding: 1rem; margin: 1rem; }
  .cart-item { flex-direction: column; align-items: flex-start; gap: 1rem; position: relative; }
  .item-img-box { width: 100%; display: flex; justify-content: center; }
  .item-img { width: 120px; height: 120px; }
  .item-info { width: 100%; text-align: center; }
  .action-group { width: 100%; justify-content: space-between; margin-top: 10px; }
  .btn-remove { position: absolute; top: 10px; right: 0; background: transparent; }
  .price-row { width: 100%; justify-content: space-between; }
}
</style>