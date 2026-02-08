// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. 檢查是否已經被註冊
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '這個 Email 已經被註冊過了' });
    }

    // 2. 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. 建立新使用者
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: '註冊成功', user });
  } catch (error) {
    console.error('註冊錯誤:', error); // 這行會讓你在終端機看到詳細錯誤
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 找使用者
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '找不到此帳號' });
    }

    // 比對密碼
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: '密碼錯誤' });
    }

    // 發送 Token
    const token = jwt.sign({ id: user.id, email: user.email }, 'SECRET_KEY', { expiresIn: '1h' });
    
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登入錯誤' });
  }
});

module.exports = router;