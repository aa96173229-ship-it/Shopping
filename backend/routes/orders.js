const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticate = require('../middleware/auth'); // 👈 改用統一的 middleware

// ==============================
// 1. 結帳 (Create Order)
// ==============================
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // A. 直接找該用戶購物車裡的所有商品 (單層結構)
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [Product]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: '購物車是空的，無法結帳' });
    }

    // B. 計算總金額
    let totalAmount = 0;
    cartItems.forEach(item => {
      // 防呆：如果商品被刪了，價格算 0
      const price = item.Product ? item.Product.price : 0;
      totalAmount += price * item.quantity;
    });

    // C. 建立訂單本體 (Order)
    const newOrder = await Order.create({
      userId: userId, // 注意大小寫，對應 server.js 的 foreignKey
      totalAmount: totalAmount,
      status: 'completed'
    });

    // D. 建立訂單詳情 (OrderItems) 並扣庫存
    for (const item of cartItems) {
      if (!item.Product) continue; // 商品不存在就跳過

      // 建立詳情
      await OrderItem.create({
        orderId: newOrder.id,      // 對應 foreignKey: 'orderId'
        productId: item.productId, // 對應 foreignKey: 'productId'
        quantity: item.quantity,
        price: item.Product.price
      });

      // 扣庫存
      const product = await Product.findByPk(item.productId);
      if (product) {
        // 簡單扣除，若要嚴謹可加庫存檢查
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    // E. 清空購物車 (直接刪除該用戶在 Carts 表的所有紀錄)
    await Cart.destroy({ where: { userId } });

    res.json({ message: '訂單建立成功', orderId: newOrder.id });

  } catch (error) {
    console.error('結帳失敗:', error);
    res.status(500).json({ message: '結帳失敗', error: error.message });
  }
});

// ==============================
// 2. 查詢歷史訂單 (Get User Orders)
// ==============================
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [Product] // 這樣才能看到買了什麼商品的圖片和名稱
        }
      ],
      order: [['createdAt', 'DESC']] // 最新的訂單排上面
    });
    res.json(orders);
  } catch (error) {
    console.error('取得訂單失敗:', error);
    res.status(500).json({ message: '取得訂單失敗' });
  }
});

module.exports = router;