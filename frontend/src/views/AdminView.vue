<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const products = ref([]);
const authStore = useAuthStore();
const editingProduct = ref(null); // 目前正在編輯哪個商品

// 取得商品列表
const fetchProducts = async () => {
  try {
    const res = await axios.get('https://shopping-backend-mdvl.onrender.com/api/products');
    products.value = res.data;
  } catch (error) {
    console.error('無法取得商品列表');
  }
};

// 刪除商品
const deleteProduct = async (id) => {
  if (!confirm('確定要下架這個商品嗎？')) return;
  try {
    await axios.delete(`https://shopping-backend-mdvl.onrender.com/api/products/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchProducts(); // 重刷列表
  } catch (error) {
    alert('刪除失敗 (權限不足?)');
  }
};

// 開始編輯
const startEdit = (product) => {
  editingProduct.value = { ...product }; // 複製一份，避免直接改到畫面
};

// 儲存編輯
const saveEdit = async () => {
  try {
    await axios.put(`https://shopping-backend-mdvl.onrender.com/api/products/${editingProduct.value.id}`, editingProduct.value, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    alert('更新成功！');
    editingProduct.value = null; // 關閉編輯框
    fetchProducts();
  } catch (error) {
    alert('更新失敗');
  }
};

// 👇👇👇 修改：新增商品 (多問兩個問題：圖片和描述) 👇👇👇
const createProduct = async () => {
  const title = prompt('請輸入商品名稱');
  if (!title) return;
  
  const price = prompt('請輸入價格', '100');
  const stock = prompt('請輸入庫存', '10');
  
  // 新增：詢問圖片網址 (預設給一張隨機圖，方便你不用每次都找圖)
  const imageUrl = prompt('請輸入圖片網址 (或是直接按確定使用預設圖)', 'https://picsum.photos/300/200');
  
  // 新增：詢問描述
  const description = prompt('請輸入商品描述', '這是一個很棒的新商品');

  try {
    await axios.post('https://shopping-backend-mdvl.onrender.com/api/products', {
      title, 
      price, 
      stock, 
      // 如果使用者沒輸入，就用預設圖
      imageUrl: imageUrl || 'https://via.placeholder.com/150', 
      description
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchProducts();
  } catch (error) {
    alert('新增失敗');
  }
};
// 👆👆👆 修改結束 👆👆👆

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <div class="admin-container">
    <h1>🔧 後台管理系統</h1>
    <button class="btn-create" @click="createProduct">➕ 上架新商品</button>

    <div v-if="editingProduct" class="edit-form">
      <h3>編輯商品: {{ editingProduct.title }}</h3>
      
      <div class="form-group">
        <label>名稱:</label>
        <input v-model="editingProduct.title" />
      </div>

      <div class="form-group">
        <label>價格:</label>
        <input v-model.number="editingProduct.price" type="number" />
      </div>

      <div class="form-group">
        <label>庫存:</label>
        <input v-model.number="editingProduct.stock" type="number" />
      </div>

      <div class="form-group">
        <label>圖片網址:</label>
        <input v-model="editingProduct.imageUrl" placeholder="https://..." />
        <img :src="editingProduct.imageUrl" class="preview-img" />
      </div>

      <div class="form-group">
        <label>描述:</label>
        <textarea v-model="editingProduct.description"></textarea>
      </div>
      <div class="form-actions">
        <button @click="saveEdit" class="btn-save">儲存</button>
        <button @click="editingProduct = null" class="btn-cancel">取消</button>
      </div>
    </div>

    <table class="product-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>圖片</th>
          <th>名稱</th>
          <th>價格</th>
          <th>庫存</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(p,index) in products" :key="p.id">
          <td>{{ index + 1 }}</td>
          <td><img :src="p.imageUrl" class="thumb" /></td>
          <td>{{ p.title }}</td>
          <td>${{ p.price }}</td>
          <td :class="{ 'low-stock': p.stock < 5 }">{{ p.stock }}</td>
          <td>
            <button @click="startEdit(p)" class="btn-edit">編輯</button>
            <button @click="deleteProduct(p.id)" class="btn-delete">下架</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.admin-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
.product-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.product-table th, .product-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
.thumb { width: 50px; height: 50px; object-fit: cover; }
.low-stock { color: red; font-weight: bold; }

.btn-create { background: #2c3e50; color: white; padding: 10px; margin-bottom: 1rem; cursor: pointer; border: none; border-radius: 4px; font-size: 1rem;}
.btn-edit { background: #f39c12; color: white; border: none; padding: 5px 10px; margin-right: 5px; cursor: pointer; border-radius: 4px;}
.btn-delete { background: #c0392b; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;}

/* 編輯表單樣式優化 */
.edit-form { background: #f9f9f9; padding: 1.5rem; border: 1px solid #ddd; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
.form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.preview-img { max-width: 100px; margin-top: 10px; border: 1px solid #ccc; }

.form-actions { margin-top: 1.5rem; display: flex; gap: 10px; }
.btn-save { background: #27ae60; color: white; padding: 8px 20px; border: none; cursor: pointer; border-radius: 4px; font-size: 1rem;}
.btn-cancel { background: #95a5a6; color: white; padding: 8px 20px; border: none; cursor: pointer; border-radius: 4px; font-size: 1rem;}
</style>