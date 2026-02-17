const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 👇👇👇 新增：暱稱欄位 👇👇👇
  nickname: {
    type: DataTypes.STRING,
    allowNull: true, // 舊使用者沒有暱稱，所以允許為空
    defaultValue: '新朋友' // 如果沒填，預設叫新朋友
  },
  // 👆👆👆 新增結束 👆👆👆
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // 👇 新增這兩個欄位 👇
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,      // 預設 0 元
    allowNull: false
  },
  lastCheckInDate: {
    type: DataTypes.STRING, // 存 "2024-02-17" 這種格式比較好比對
    allowNull: true
  }
});

module.exports = User;