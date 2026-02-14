const sequelize = require('./db');
const Product = require('./models/Product');
const User = require('./models/User'); // 👈 1. 補上這行：引入 User 模型
const bcrypt = require('bcryptjs');    // 👈 2. 補上這行：引入加密工具

const seedData = async () => {
  try {
    // 強制重置資料庫 (會刪除所有資料！)
    await sequelize.sync({ force: true });
    console.log('資料庫已清空重置...');

    // --- 建立商品 ---
    const products = [];
    for (let i = 0; i < 10; i++) {
      products.push({
        title: `測試商品 ${i + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        description: '這是一個超棒的測試商品，買到賺到！',
        imageUrl: `https://picsum.photos/300/200?random=${i}`,
        stock: 99 // 設定庫存
      });
    }
    await Product.bulkCreate(products);
    console.log('成功植入 10 筆商品資料！');

    // --- 建立管理員 (Admin) ---
    // 先把密碼加密
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      email: 'admin@test.com',
      password: hashedPassword,
      isAdmin: true // 👈 設定為管理員
    });
    console.log('管理員帳號建立完成: admin@test.com / admin123');

  } catch (error) {
    console.error('植入失敗:', error);
  } finally {
    // 關閉連線
    await sequelize.close();
  }
};

seedData();