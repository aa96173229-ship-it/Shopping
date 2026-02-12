const { Sequelize } = require('sequelize');
const path = require('path');

// 👇👇👇 重點修改：強制指定資料庫檔案的路徑 👇👇👇
// __dirname 代表「目前這個檔案所在的資料夾 (backend)」
// 這樣無論你在哪裡跑指令，它永遠都會指向 backend/shop.sqlite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'shop.sqlite'), 
  logging: false // 關閉落落長的 SQL Log，讓終端機乾淨點
});

module.exports = sequelize;