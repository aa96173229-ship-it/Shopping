require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const sequelize = require('./db');
const path = require('path');

// 引入模型 (確保順序)
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

// 引入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// 設定資料庫關聯
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);
Product.hasMany(CartItem);
CartItem.belongsTo(Product);
User.hasMany(Order);
Order.belongsTo(User);
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

const app = express();
const port = process.env.PORT || 3000;

// 👇 中介軟體 (Middleware) 設定
app.use(cors()); // 允許跨域請求
app.use(express.json()); // 解析 JSON 格式

// 👇 掛載路由
// 這代表 /api/auth/register 會對應到 auth.js 裡的 /register
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 靜態檔案
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 首頁測試路由
app.get('/', (req, res) => {
  res.send('Backend is running! Database URL is set.');
});

// 👇 啟動伺服器與資料庫同步
// alter: true 會自動更新資料表結構 (例如新增 nickname 欄位)
sequelize.sync({ alter: true }).then(() => {
  console.log('資料庫同步完成 (Database Synced)');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch(err => {
  console.error('資料庫同步失敗:', err);
});