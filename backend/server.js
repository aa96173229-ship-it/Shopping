// backend/server.js - 終極完整版
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

// --- 1. 引入所有模型 (缺一不可) ---
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');

// --- 2. 引入路由檔案 ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart'); // <--- 之前可能缺了這行或是下面那行

// --- 3. 設定資料庫關聯 ---
User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

Product.hasMany(CartItem);
CartItem.belongsTo(Product);

const app = express();
const port = process.env.PORT || 3000;

// --- 4. 中介軟體 ---
app.use(cors()); // 允許前端連線
app.use(express.json()); // 讀懂 JSON 資料

// --- 5. 掛載路由 (這是你 404 的原因！) ---
app.use('/api/auth', authRoutes);       // 網址: /api/auth/register
app.use('/api/products', productRoutes); // 網址: /api/products
app.use('/api/cart', cartRoutes);        // 網址: /api/cart/items (一定要有這行！)

// 簡單的首頁測試
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --- 6. 啟動伺服器 ---
// alter: true 會自動幫你修復資料表結構 (包含加新欄位)
sequelize.sync({ alter: true }).then(() => {
  console.log('資料庫同步完成 (表格已更新)');
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('資料庫同步失敗:', err);
});