const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User'); // 👈 1. 補上這行！不然找不到 User 表
const authenticate = require('../middleware/auth');

// ==============================
// 1. 結帳 (Create Order)
// ==============================
router.post('/', authenticate, async (req, res) => {
  try {
    // 取得使用者 ID 和 前端傳來的 useCoins (是否使用金幣)
    const userId = req.user.userId || req.user.id;
    const { useCoins } = req.body; 

    // A. 找購物車
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [Product]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: '購物車是空的，無法結帳' });
    }

    // B. 計算原始總金額
    let originalAmount = 0;
    cartItems.forEach(item => {
      const price = item.Product ? item.Product.price : 0;
      originalAmount += price * item.quantity;
    });

    // ==========================================
    // C. 💰 金幣抵扣邏輯 (必須在建立訂單前做)
    // ==========================================
    let finalAmount = originalAmount;
    let usedCoins = 0; // 紀錄這次用了多少金幣

    // 取得使用者最新資料 (確認金幣夠不夠)
    const user = await User.findByPk(userId);

    if (useCoins && user && user.coins > 0) {
      // 規則：金幣 1 元 = 台幣 1 元
      if (user.coins >= originalAmount) {
        // 金幣超級多，全額折抵 (免費)
        usedCoins = originalAmount;
        finalAmount = 0;
      } else {
        // 金幣不夠付，部分折抵
        usedCoins = user.coins;
        finalAmount = originalAmount - user.coins;
      }

      // 扣除使用者金幣並存檔
      user.coins -= usedCoins;
      await user.save();
    }
    // ==========================================

    // D. 建立訂單 (寫入折抵後的金額)
    const newOrder = await Order.create({
      userId: userId,
      totalAmount: finalAmount, // 👈 這裡存的是「實際付款金額」
      status: 'completed'
    });

    // E. 建立訂單詳情 & 扣商品庫存
    for (const item of cartItems) {
      if (!item.Product) continue;

      await OrderItem.create({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.price
      });

      // 扣商品庫存
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // F. 清空購物車
    await Cart.destroy({ where: { userId } });

    // G. 回傳成功訊息 (包含剩餘金幣，讓前端更新)
    res.json({ 
      message: '結帳成功', 
      orderId: newOrder.id,
      originalAmount,
      discount: usedCoins,
      finalAmount,
      remainingCoins: user ? user.coins : 0
    });

  } catch (error) {
    console.error('結帳失敗:', error);
    res.status(500).json({ message: '結帳失敗', error: error.message });
  }
});

// ==============================
// 2. 查詢歷史訂單
// ==============================
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Product]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('取得訂單失敗:', error);
    res.status(500).json({ message: '取得訂單失敗' });
  }
});

module.exports = router;