// backend/routes/games.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/auth');

// 輔助函式：隨機產生獎金 (你可以自己調機率)
const getRandomPrize = () => {
    const prizes = [0, 0, 0, 100, 200, 500, 1000]; // 0 比較多，代表容易沒中
    return prizes[Math.floor(Math.random() * prizes.length)];
};

// 輔助函式：隨機產生 1~99 的號碼
const getRandomNum = () => Math.floor(Math.random() * 99) + 1;

// 🎟️ 購買並開刮刮樂
router.post('/scratch', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);
        const TICKET_PRICE = 100; // 一張賣 100 金幣

        if (user.coins < TICKET_PRICE) {
            return res.status(400).json({ message: '金幣不足，無法購買刮刮樂！' });
        }

        // 1. 先扣買彩券的錢
        user.coins -= TICKET_PRICE;

        // ==========================================
        // 2. 產生 4 大遊戲區塊的結果 (對應你的金馬獎)
        // ==========================================
        let totalWin = 0;

        // 遊戲一 (左上)：刮出 2 個相同金額即得該獎金
        const game1 = [getRandomPrize(), getRandomPrize()];
        const win1 = (game1[0] === game1[1] && game1[0] > 0) ? game1[0] : 0;
        totalWin += win1;

        // 遊戲二 (左下)：刮出 2 個相同金額即得該獎金
        const game2 = [getRandomPrize(), getRandomPrize()];
        const win2 = (game2[0] === game2[1] && game2[0] > 0) ? game2[0] : 0;
        totalWin += win2;

        // 遊戲三 (右上)：刮出 3 個相同金額即得該獎金
        const game3 = [getRandomPrize(), getRandomPrize(), getRandomPrize()];
        const win3 = (game3[0] === game3[1] && game3[1] === game3[2] && game3[0] > 0) ? game3[0] : 0;
        totalWin += win3;

        // 遊戲四 (中間主區)：幸運號碼 vs 你的號碼
        const luckyNumber = getRandomNum();
        const yourNumbers = Array.from({ length: 5 }, () => ({
            number: getRandomNum(),
            prize: getRandomPrize()
        }));
        
        // 檢查中了幾個號碼
        let win4 = 0;
        yourNumbers.forEach(item => {
            if (item.number === luckyNumber) {
                win4 += item.prize;
            }
        });
        totalWin += win4;

        // ==========================================
        // 3. 發放總獎金並存檔
        // ==========================================
        user.coins += totalWin;
        await user.save();

        // 4. 把整張卡片的資料傳給前端
        res.json({
            message: totalWin > 0 ? `恭喜中獎！贏得 $${totalWin} 金幣！` : '銘謝惠顧，下次再來！',
            ticketPrice: TICKET_PRICE,
            totalWin: totalWin,
            remainingCoins: user.coins,
            ticketData: {
                game1,
                game2,
                game3,
                luckyNumber,
                yourNumbers
            }
        });

    } catch (error) {
        console.error('刮刮樂執行失敗:', error);
        res.status(500).json({ message: '系統錯誤' });
    }
});

module.exports = router;