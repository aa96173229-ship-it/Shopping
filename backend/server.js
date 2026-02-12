require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 👈 1. 檢查這行
const sequelize = require('./db');
const path = require('path');

// 引入模型
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

// 設定關聯
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

// 👇👇👇 2. 關鍵在這裡！一定要在路由之前！ 👇👇👇
app.use(cors()); 
app.use(express.json());

// 掛載路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 靜態檔案 (如果圖片放後端的話)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// 啟動伺服器
sequelize.sync({ alter: true }).then(() => {
  console.log('資料庫同步完成');
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('資料庫同步失敗:', err);
});