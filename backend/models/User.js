// backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const bcrypt = require('bcryptjs'); // 記得要安裝這個，如果沒安裝會報錯

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: true, // 允許舊的使用者沒有名字
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ❌ 這就是 400 錯誤最常見的原因：Email 不能重複
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 👇👇👇 新增：是否為管理員 👇👇👇
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // 預設大家都是普通人
  }
});

module.exports = User;