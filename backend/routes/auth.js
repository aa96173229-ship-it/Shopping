// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 加密用的
const jwt = require('jsonwebtoken'); // 發身分證用的
const User = require('../models/User'); // 引入 User 模型

// 1. 註冊 API (POST /register)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 檢查 Email 是否已被註冊
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      return res.status(400).json({ message: '此 Email 已經被註冊過了' });
    }

    // 密碼加密 (雜湊) !!! 重要安全步驟 !!!
    const hashedPassword = await bcrypt.hash(password, 10);

    // 建立新使用者
    const newUser = await User.create({
      email,
      password: hashedPassword, // 存入資料庫的是亂碼
    });

    res.status(201).json({ message: '註冊成功', user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 2. 登入 API (POST /login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 找使用者
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '帳號或密碼錯誤' }); // 為了安全，不告訴他是帳號錯還是密碼錯
    }

    // 驗證密碼 (拿輸入的密碼跟資料庫的亂碼比對)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '帳號或密碼錯誤' });
    }

    // 登入成功，發放 JWT (身分證)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET, // 記得 .env 要有這行
      { expiresIn: '24h' } // 24小時後過期
    );

    res.json({
      message: '登入成功',
      token, // 前端要存起來
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;