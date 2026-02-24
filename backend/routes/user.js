const express = require('express');
const router = express.Router();
const User = require('../models/User'); // 確保有引入 User 模型
const authenticate = require('../middleware/auth'); // 確保有引入驗證

// ==============================
// 📅 每日簽到 API
// ==============================
router.post('/checkin', authenticate, async (req, res) => {
  try {
    // 1. 雙重保險：相容 req.user.userId 與 req.user.id
    const userId = req.user.userId || req.user.id;
    
    if (!userId) {
        return res.status(400).json({ message: '無法從 Token 取得使用者 ID' });
    }

    // 2. 去資料庫找這個人
    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: '找不到此使用者' });
    }

    // 3. 取得今天的日期字串 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 4. 檢查是否已經簽到過
    if (user.lastCheckInDate === today) {
      return res.status(400).json({ message: '今天已經簽到過囉！明天再來吧' });
    }

    // 5. 發金幣 (隨機 10~50 元)
    const reward = Math.floor(Math.random() * 41) + 10; 

    // 6. 防呆：確保 user.coins 是一個數字，不會因為 null 加上數字變 NaN
    user.coins = (user.coins || 0) + reward;
    user.lastCheckInDate = today;
    
    // 存檔進入資料庫
    await user.save();

    res.json({ 
      message: `簽到成功！獲得 $${reward} 金幣`, 
      coins: user.coins,
      checkInDate: today
    });

  } catch (error) {
    // 👇 這裡非常重要！如果當機，會把真實的錯誤訊息印出來並傳給前端
    console.error('❌ 簽到 API 發生錯誤:', error);
    res.status(500).json({ 
        message: '後端發生錯誤', 
        error: error.message, // 讓前端 F12 可以看到真正死因
        stack: error.stack 
    });
  }
});

module.exports = router;