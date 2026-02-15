require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const sequelize = require('./db');
const path = require('path');

// 引入模型 (簡化購物車結構)
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart'); // 我們將改用這個作為單層購物車
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

// 引入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// ==============================
// 👇 設定資料庫關聯 (簡化版)
// ==============================
// 使用者與購物車：一對多 (一個使用者可以有多筆購物車記錄)
User.hasMany(Cart);
Cart.belongsTo(User);

// 商品與購物車：一對多
Product.hasMany(Cart);
Cart.belongsTo(Product);

// 訂單部分維持不變
User.hasMany(Order);
Order.belongsTo(User);
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

const app = express();
const port = process.env.PORT || 3000;

// 中介軟體設定
app.use(cors()); 
app.use(express.json()); 

// 掛載路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 靜態檔案
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// 首頁測試路由
app.get('/', (req, res) => {
  res.send('Backend is running! Shopping Cart is simplified.');
});

// 偵探路由 (Debug)
app.get('/debug-db', async (req, res) => {
  try {
    const dialect = sequelize.getDialect();
    const userCount = await User.count();
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'nickname', 'isAdmin', 'createdAt']
    });

    res.json({
      status: "連線成功 ✅",
      databaseType: dialect,
      totalUsers: userCount,
      users: allUsers
    });
  } catch (error) {
    res.status(500).json({ status: "連線失敗 ❌", error: error.message });
  }
});

// 啟動伺服器並同步資料庫
// alter: true 會根據 model 自動在 Neon 建立/修改表格欄位
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ 資料庫同步完成');
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}).catch(err => {
  console.error('❌ 資料庫同步失敗:', err);
});