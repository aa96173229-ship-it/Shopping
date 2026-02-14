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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: '帳號不存在，要不要先註冊？' }); // 👈 清楚的原因
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼打錯囉，再檢查一下！' }); // 👈 清楚的原因
    }
    // ... 簽發 Token 邏輯 ...
  } catch (error) {
    res.status(500).json({ message: '登入過程發生錯誤' });
  }
});

module.exports = router;