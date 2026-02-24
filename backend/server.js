require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const sequelize = require('./db');
const path = require('path');

// 引入模型
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const OrderItem = require('./models/OrderItem');

// 引入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/user'); // 👈 1. 補上這行！引入簽到路由
const gamesRoutes = require('./routes/games');

// ==============================
// 資料庫關聯設定
// ==============================
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

// 掛載路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes); // 👈 2. 補上這行！讓 /api/user/checkin 生效
app.use('/api/games', gamesRoutes);

// 靜態檔案
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.get('/', (req, res) => {
  res.send('Backend is running! Shopping Cart is simplified.');
});

// Debug 路由
app.get('/debug-db', async (req, res) => {
  try {
    const dialect = sequelize.getDialect();
    const userCount = await User.count();
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'nickname', 'isAdmin', 'createdAt', 'coins'] // 順便檢查 coins
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

// 啟動伺服器
// 💡 因為你有寫 alter: true，等一下 Push 上去重啟後
// 程式會自動幫你在 Neon 資料庫新增 coins 和 lastCheckInDate 欄位！
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ 資料庫同步完成');
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}).catch(err => {
  console.error('❌ 資料庫同步失敗:', err);
});