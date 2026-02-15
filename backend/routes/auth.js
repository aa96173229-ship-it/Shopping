const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 👇 這是註冊 (Register)
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 1. 檢查必填
    if (!email || !password || !nickname) {
      return res.status(400).json({ message: '所有欄位（包含暱稱）都必須填寫喔！' });
    }

    // 2. 檢查是否重複
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '這個 Email 已經被註冊過囉！' });
    }

    // 3. 密碼加密 (關鍵步驟！)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 建立使用者
    const newUser = await User.create({
      email,
      password: hashedPassword,
      nickname
    });

    res.status(201).json({ message: '註冊成功', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤，註冊失敗' });
  }
});

// 👇 這是登入 (Login) - 你之前缺少的！
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. 找使用者
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '找不到此帳號，要不要先註冊？' });
    }

    // 2. 比對密碼 (將輸入的密碼與資料庫的亂碼比對)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼打錯囉，再檢查一下！' });
    }

    // 3. 簽發 Token (JWT)
    // 注意：這裡用 'secretkey' 當作密鑰，正式上線建議放 .env
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '1h' }
    );

    // 4. 回傳 Token 和使用者資料 (讓前端顯示暱稱用)
    res.status(200).json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname // 👈 前端 App.vue 需要這個
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登入過程發生錯誤' });
  }
});

module.exports = router;