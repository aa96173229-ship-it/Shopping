const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 註冊 (Register)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 檢查 Email 是否已被註冊
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email 已被註冊' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 建立使用者
    const newUser = await User.create({
      email,
      password: hashedPassword,
      isAdmin: false // 預設註冊的都是普通會員
    });

    res.status(201).json({ message: '註冊成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 登入 (Login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 找使用者
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '找不到使用者' });
    }

    // 比對密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼錯誤' });
    }

    // 👇👇👇 重點修改：把 isAdmin 寫進 Token 裡 👇👇👇
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin // 👈 這行最重要！沒有它，警衛就不認識你
      }, 
      'SECRET_KEY', 
      { expiresIn: '1h' }
    );
    // 👆👆👆 修改結束 👆👆👆

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 檢查登入狀態 (Me)
router.get('/me', async (req, res) => {
    // ... (這部分可以省略，主要修改 login 即可)
    // 為了完整性，這裡簡單回傳成功
    res.sendStatus(200);
});

module.exports = router;