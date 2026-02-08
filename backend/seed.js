// backend/seed.js
const sequelize = require('./db');
const Product = require('./models/Product');

const dummyProducts = [
  {
    title: '極簡白色 T-shirt',
    price: 390,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=60',
    description: '100% 純棉，舒適透氣，夏季必備單品。'
  },
  {
    title: '復古牛仔外套',
    price: 1280,
    stock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=500&q=60',
    description: '經典水洗工藝，寬鬆版型，男女皆宜。'
  },
  {
    title: '高筒帆布鞋',
    price: 890,
    stock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=60',
    description: '耐磨橡膠大底，好走不磨腳。'
  },
  {
    title: '真皮側背包',
    price: 2480,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=60',
    description: '義大利進口牛皮，手工縫製。'
  },
  {
    title: '運動棒球帽',
    price: 450,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=60',
    description: '遮陽透氣，運動休閒皆可搭配。'
  }
];

const seedData = async () => {
  try {
    // force: true 會把舊表格刪掉重蓋，確保資料乾淨
    await sequelize.sync({ force: true }); 
    console.log('資料庫已清空重置...');

    await Product.bulkCreate(dummyProducts);
    console.log(`成功植入 ${dummyProducts.length} 筆商品資料！`);

    process.exit();
  } catch (error) {
    console.error('植入失敗:', error);
    process.exit(1);
  }
};

seedData();