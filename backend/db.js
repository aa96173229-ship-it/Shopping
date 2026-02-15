// backend/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// 👇 直接抓雲端網址，如果沒有抓到，就直接報錯 (不要用 SQLite)
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ 嚴重錯誤：找不到 DATABASE_URL！程式無法啟動。");
  process.exit(1); // 直接殺死程式，強迫你檢查 Render 設定
}

console.log("🔍 嘗試連線到資料庫...");

const sequelize = new Sequelize(dbUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // 這是 Neon 必備的設定
    }
  },
  logging: false // 關閉囉嗦的日誌，只看重要的
});

module.exports = sequelize;