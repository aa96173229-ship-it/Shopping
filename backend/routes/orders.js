const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// 驗證 Token 中介軟體
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 1. 結帳 (Create Order)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // A. 找購物車
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    if (!cart) return res.status(400).json({ message: '購物車是空的' });

    // B. 找購物車裡的商品
    const cartItems = await CartItem.findAll({
      where: { CartId: cart.id },
      include: [Product]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: '購物車是空的' });
    }

    // C. 計算總金額
    let totalAmount = 0;
    cartItems.forEach(item => {
      totalAmount += item.Product.price * item.quantity;
    });

    // D. 建立訂單 (Order)
    const newOrder = await Order.create({
      UserId: req.user.id,
      totalAmount: totalAmount,
      status: 'completed' // 簡化流程，直接設為完成
    });

    // E. 建立訂單詳情 (OrderItems) 並扣庫存
    for (const item of cartItems) {
      // 建立詳情
      await OrderItem.create({
        OrderId: newOrder.id,
        ProductId: item.ProductId,
        quantity: item.quantity,
        price: item.Product.price // 存下當時的價格
      });

      // 扣庫存 (簡單做，不檢查負數)
      const product = await Product.findByPk(item.ProductId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // F. 清空購物車
    await CartItem.destroy({ where: { CartId: cart.id } });

    res.json({ message: '訂單建立成功', orderId: newOrder.id });

  } catch (error) {
    console.error('結帳失敗:', error);
    res.status(500).json({ message: '結帳失敗' });
  }
});

// 2. 查詢歷史訂單 (Get User Orders)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { UserId: req.user.id },
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
    console.error(error);
    res.status(500).json({ message: '取得訂單失敗' });
  }
});

module.exports = router;