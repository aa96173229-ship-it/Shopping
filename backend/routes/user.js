// backend/routes/user.js (或是 auth.js)
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const User = require('../models/User');

// 📅 每日簽到 API
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // 1. 取得今天的日期字串 (YYYY-MM-DD)
    // 這裡用台灣時間處理比較保險，簡單版直接取前10碼
    const today = new Date().toISOString().split('T')[0];

    // 2. 檢查是否已經簽到過
    if (user.lastCheckInDate === today) {
      return res.status(400).json({ message: '今天已經簽到過囉！明天再來吧' });
    }

    // 3. 發金幣 (例如隨機 10~50 元，或是固定 20 元)
    const reward = Math.floor(Math.random() * 41) + 10; // 隨機 10~50
    // const reward = 20; // 或是固定給 20

    user.coins += reward;
    user.lastCheckInDate = today;
    await user.save();

    res.json({ 
      message: `簽到成功！獲得 $${reward} 金幣`, 
      coins: user.coins,
      checkInDate: today
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '簽到失敗' });
  }
});

module.exports = router;