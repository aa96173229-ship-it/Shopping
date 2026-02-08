const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Cart = sequelize.define('Cart', {
  // 這裡其實只需要自動產生的 id 和 userId (關聯時會自動加)，
  // 所以甚至可以是空的，但為了擴充性我們先留著
});

module.exports = Cart;