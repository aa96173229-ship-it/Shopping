// backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // 引入剛剛寫好的連線設定

const User = sequelize.define('User', {
  // 1. Email (帳號)
  email: {
    type: DataTypes.STRING,
    allowNull: false, // 不能是空的
    unique: true,     // 不能重複
    validate: {
      isEmail: true,  // 確保格式是 email
    },
  },
  // 2. Password (密碼 - 存 Hash)
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // 3. Role (權限 - 未來做管理員功能用)
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user', // 預設是一般使用者
  },
});

module.exports = User;