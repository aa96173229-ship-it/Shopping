const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const authenticate = require('../middleware/auth'); // 確認你有一般登入警衛

// 加入購物車 (POST /api/cart)
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId; // 確保你的 auth 中間件是用 userId

    // 檢查是否已在車內
    let item = await Cart.findOne({ where: { userId, productId } });

    if (item) {
      item.quantity += parseInt(quantity);
      await item.save();
    } else {
      item = await Cart.create({ userId, productId, quantity });
    }
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤', detail: error.message });
  }
});

module.exports = router;