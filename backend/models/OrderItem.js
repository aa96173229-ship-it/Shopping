const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: { // 重要：紀錄「購買當時」的單價
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});

module.exports = OrderItem;