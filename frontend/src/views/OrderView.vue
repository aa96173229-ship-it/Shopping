<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  if (!authStore.token) return;
  
  try {
    const res = await axios.get('https://shopping-backend-mdvl.onrender.com/api/orders', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    orders.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

// 格式化日期的 Helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
};

// 👇 新增：計算這張訂單的「商品原價總和」
const getOriginalTotal = (items) => {
  if (!items) return 0;
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// 👇 新增：計算「折抵了多少金幣」 (原價 - 實付金額)
const getDiscount = (order) => {
  const original = getOriginalTotal(order.OrderItems);
  const discount = original - order.totalAmount;
  return discount > 0 ? discount : 0;
};
</script>

<template>
  <div class="order-container">
    <h2>📦 我的歷史訂單</h2>

    <div v-if="loading" class="loading">載入中...</div>
    <div v-else-if="orders.length === 0" class="empty">您還沒有任何訂單</div>

    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-date">下單時間: {{ formatDate(order.createdAt) }}</span>
          <span class="order-status">狀態: {{ order.status }}</span>
        </div>
        
        <div class="order-items">
          <div v-for="item in order.OrderItems" :key="item.id" class="item-row">
            <img :src="item.Product?.imageUrl" class="thumb" />
            <div class="item-details">
              <span>{{ item.Product?.title }}</span>
              <span class="qty">x {{ item.quantity }}</span>
            </div>
            <span class="price">${{ item.price }}</span>
          </div>
        </div>

        <div class="order-footer">
          <div class="bill-details">
            <div class="bill-row">
              <span>商品總計:</span>
              <span>NT$ {{ getOriginalTotal(order.OrderItems) }}</span>
            </div>
            
            <div v-if="getDiscount(order) > 0" class="bill-row discount-row">
              <span>💰 金幣折抵:</span>
              <span>- NT$ {{ getDiscount(order) }}</span>
            </div>
          </div>

          <div class="final-total">
            <h3>實付金額: NT$ {{ order.totalAmount }}</h3>
          </div>
        </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.order-container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
.order-card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 2rem; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.order-header { background: #f8f9fa; padding: 1rem; display: flex; justify-content: space-between; border-bottom: 1px solid #eee; font-weight: bold; color: #555; }
.order-items { padding: 1rem; }
.item-row { display: flex; align-items: center; margin-bottom: 1rem; gap: 1rem; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #eee; }
.item-details { flex-grow: 1; display: flex; flex-direction: column; }
.qty { color: #888; font-size: 0.9rem; margin-top: 4px; }
.price { font-weight: bold; color: #555; }

/* 👇 帳單明細樣式 👇 */
.order-footer { padding: 1.5rem 1rem; background: #fff; border-top: 1px solid #eee; display: flex; flex-direction: column; align-items: flex-end; }
.bill-details { width: 250px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #ccc; }
.bill-row { display: flex; justify-content: space-between; margin-bottom: 5px; color: #666; font-size: 0.95rem; }
.discount-row { color: #d35400; font-weight: bold; }
.final-total h3 { color: #e74c3c; margin: 0; font-size: 1.4rem; }

@media (max-width: 768px) {
  .order-header { flex-direction: column; gap: 8px; }
  .bill-details { width: 100%; }
}
</style>