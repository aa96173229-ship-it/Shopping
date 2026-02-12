require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');

// --- 1. 引入所有模型 ---
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const CartItem = require('./models/CartItem');
const Order = require('./models/Order');      // 🆕 新增
const OrderItem = require('./models/OrderItem'); // 🆕 新增

// --- 2. 引入路由 ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders'); // 🆕 待會要建立這個

// --- 3. 設定資料庫關聯 ---
User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

Product.hasMany(CartItem);
CartItem.belongsTo(Product);

// 👇👇👇 新增訂單關聯 👇👇👇
User.hasMany(Order);    // 一個使用者有多張訂單
Order.belongsTo(User);

Order.hasMany(OrderItem); // 一張訂單有多個商品詳情
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem); // 一個商品可以出現在很多訂單詳情裡
OrderItem.belongsTo(Product);
// 👆👆👆 關聯結束 👆👆👆

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- 4. 掛載路由 ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes); // 🆕 掛載訂單路由

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --- 5. 啟動伺服器 ---
sequelize.sync({ alter: true }).then(() => {
  console.log('資料庫同步完成 (訂單表格已建立)');
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('資料庫同步失敗:', err);
});