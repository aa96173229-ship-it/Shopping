// backend/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define('Product', {
  // 1. 商品名稱
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 2. 價格
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // 3. 庫存 (這是新加的！)
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  // 4. 圖片網址
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 5. 商品描述
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = Product;