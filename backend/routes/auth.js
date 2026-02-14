const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 註冊 (Register)
router.post('/register', async (req, res) => {
  try {
    // 👇 多接收一個 nickname
    const { email, password, nickname } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email 已被註冊' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      // 👇 把暱稱存進去 (如果前端沒傳，就用預設值)
      nickname: nickname || '新朋友', 
      isAdmin: false 
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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: '找不到使用者' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '密碼錯誤' });
    }

    // Token 裡面也可以順便放暱稱 (選用)
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin, nickname: user.nickname }, 
      'SECRET_KEY', 
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin,
        // 👇👇👇 重點：一定要把暱稱傳回給前端 👇👇👇
        nickname: user.nickname 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;