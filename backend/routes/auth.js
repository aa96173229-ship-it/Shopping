const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🟢 註冊 (Register)
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      return res.status(400).json({ message: '所有欄位都必須填寫喔！' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '這個 Email 已經被註冊過囉！' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      nickname,
      isAdmin: false // 預設註冊的人都是一般會員
    });

    res.status(201).json({ message: '註冊成功', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 🔵 登入 (Login) - 修正關鍵點在這裡！
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '找不到此帳號，要不要先註冊？' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼打錯囉，再檢查一下！' });
    }

    // 🔥【重要修正】把 isAdmin 塞進 Token 通行證裡
    // 這樣 middleware/admin.js 才能從 token 裡看到你的權限
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        isAdmin: user.isAdmin // 👈 就是這一行！沒加這行就沒權限
      }, 
      process.env.JWT_SECRET || 'SECRET_KEY', 
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        coins: user.coins,
        isAdmin: user.isAdmin // 👈 同時回傳給前端 Pinia 紀錄
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登入過程發生錯誤' });
  }
});

module.exports = router;