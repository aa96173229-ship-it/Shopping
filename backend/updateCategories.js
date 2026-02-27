// backend/updateCategories.js
const sequelize = require('./config/database'); // 確保這裡的路徑指向你的資料庫設定檔
const Product = require('./models/Product');    // 確保這裡的路徑指向你的商品 Model

async function runUpdate() {
  try {
    // 1. 確認資料庫連線
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功，準備開始更新資料...');

    // 2. 抓出所有的商品
    const products = await Product.findAll();
    console.log(`📦 總共找到 ${products.length} 個商品，開始分類...`);

    const fallbackCategories = ['衣服', '褲子', '鞋子', '配件', '其他'];

    // 3. 跑迴圈一筆一筆更新
    for (let product of products) {
      // 取得商品名稱 (根據你的資料庫可能是 title 或 name)
      const productName = product.title || product.name || '';
      let targetCategory = '其他';

      // 🧠 機器人簡單的關鍵字判斷邏輯
      if (productName.includes('外套') || productName.includes('T恤') || productName.includes('衣') || productName.includes('衫')) {
        targetCategory = '衣服';
      } else if (productName.includes('褲')) {
        targetCategory = '褲子';
      } else if (productName.includes('鞋')) {
        targetCategory = '鞋子';
      } else if (productName.includes('帽') || productName.includes('包') || productName.includes('襪')) {
        targetCategory = '配件';
      } else {
        // 如果都沒對中，就從清單隨機挑一個給它 (避免全部都是其他太無聊)
        const randomIndex = Math.floor(Math.random() * fallbackCategories.length);
        targetCategory = fallbackCategories[randomIndex];
      }

      // 4. 存檔更新
      product.category = targetCategory;
      await product.save();
      console.log(`✏️ 更新成功: [${productName}] 被分類到 👉 【${targetCategory}】`);
    }

    console.log('🎉 恭喜！所有商品分類更新完畢！');
    process.exit(0); // 執行完畢，自動關閉腳本
  } catch (error) {
    console.error('❌ 更新失敗:', error);
    process.exit(1);
  }
}

// 執行這個函式
runUpdate();