const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/auth');

// 輔助函式：隨機產生獎金
const getRandomPrize = () => {
    const prizes = [0, 0, 0, 100, 200, 500, 1000]; 
    return prizes[Math.floor(Math.random() * prizes.length)];
};

// 輔助函式：隨機產生 1~99 的號碼
const getRandomNum = () => Math.floor(Math.random() * 99) + 1;

// 🎟️ 購買並開刮刮樂
router.post('/scratch', authenticate, async (req, res) => {
    try {
        // 👇 1. 關鍵修正：雙重保險抓取 userId
        const userId = req.user.userId || req.user.id;
        
        if (!userId) {
            return res.status(400).json({ message: '無法從 Token 取得使用者 ID' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: '找不到此使用者' });
        }

        const TICKET_PRICE = 100;

        if (user.coins < TICKET_PRICE) {
            return res.status(400).json({ message: '金幣不足，無法購買刮刮樂！' });
        }

        // 2. 扣款
        user.coins -= TICKET_PRICE;

        // 3. 產生遊戲結果
        let totalWin = 0;

        const game1 = [getRandomPrize(), getRandomPrize()];
        const win1 = (game1[0] === game1[1] && game1[0] > 0) ? game1[0] : 0;
        totalWin += win1;

        const game2 = [getRandomPrize(), getRandomPrize()];
        const win2 = (game2[0] === game2[1] && game2[0] > 0) ? game2[0] : 0;
        totalWin += win2;

        const game3 = [getRandomPrize(), getRandomPrize(), getRandomPrize()];
        const win3 = (game3[0] === game3[1] && game3[1] === game3[2] && game3[0] > 0) ? game3[0] : 0;
        totalWin += win3;

        const luckyNumber = getRandomNum();
        const yourNumbers = Array.from({ length: 5 }, () => ({
            number: getRandomNum(),
            prize: getRandomPrize()
        }));
        
        let win4 = 0;
        yourNumbers.forEach(item => {
            if (item.number === luckyNumber) win4 += item.prize;
        });
        totalWin += win4;

        // 4. 發放獎金並存檔
        user.coins += totalWin;
        await user.save();

        // 5. 回傳資料給前端
        res.json({
            message: totalWin > 0 ? `恭喜中獎！贏得 $${totalWin} 金幣！` : '銘謝惠顧，下次再來！',
            ticketPrice: TICKET_PRICE,
            totalWin: totalWin,
            remainingCoins: user.coins,
            ticketData: { game1, game2, game3, luckyNumber, yourNumbers }
        });

    } catch (error) {
        // 👇 2. 關鍵修正：把真實的錯誤訊息吐給前端
        console.error('刮刮樂執行失敗:', error);
        res.status(500).json({ 
            message: '系統錯誤', 
            error: error.message, 
            stack: error.stack 
        });
    }
});

module.exports = router;