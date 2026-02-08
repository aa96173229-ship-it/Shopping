// backend/db.js
const { Sequelize } = require('sequelize');

// 初始化 Sequelize，指定使用 SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './shop.sqlite', // 資料庫檔案會存在 backend 根目錄
  logging: false, // 關閉 SQL 指令日誌 (讓終端機乾淨一點)
});

module.exports = sequelize;