const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 註冊部分
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    
    // 檢查欄位是否填寫
    if (!email || !password || !nickname) {
      return res.status(400).json({ message: '所有欄位都必須填寫喔！' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '這個 Email 已經被註冊過囉！' }); // 👈 清楚的原因
    }

    // ... 剩下的加密與存檔邏輯 ...
    res.status(201).json({ message: '註冊成功' });
  } catch (error) {
    res.status(500).json({ message: '伺服器怪怪的，請稍後再試' });
  }
});

// 登入部分
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    // 檢查是否有空欄位
    if (!email || !password || !nickname) {
      return res.status(400).json({ message: '所有欄位（包含暱稱）都必須填寫喔！' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '這個 Email 已經被註冊過了。' });
    }

    // ... 加密密碼與儲存 ...
    await User.create({ email, password: hashedPassword, nickname });
    res.status(201).json({ message: '註冊成功' });
  } catch (error) {
    res.status(400).json({ message: '註冊資料格式錯誤' });
  }
});

module.exports = router;