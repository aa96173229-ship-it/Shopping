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
// 1. 使用者與購物車
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// 2. 商品與購物車 (關鍵修正！)
Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// 3. 訂單系統
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// 4. 訂單與商品 (關鍵修正！)
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// 👆👆👆 覆蓋結束 👆👆👆

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