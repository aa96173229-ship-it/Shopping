const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // ☁️ 如果有雲端資料庫網址 (在 Render 上)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // 🏠 如果在自己電腦上 (用 SQLite)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'shop.sqlite'),
    logging: false
  });
}

module.exports = sequelize;