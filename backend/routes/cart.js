const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// 驗證 Token
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

// 1. 取得購物車 (GET)
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    if (!cart) return res.json([]);

    const items = await CartItem.findAll({
      where: { CartId: cart.id },
      include: [Product],
      order: [['createdAt', 'ASC']] // 依照加入時間排序，避免跳動
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '取得購物車失敗' });
  }
});

// 2. 加入購物車 (POST) - 加上嚴格庫存檢查
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // A. 先找商品，檢查是否存在
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: '商品不存在' });

    // B. 如果商品本身庫存就是 0
    if (product.stock <= 0) {
      return res.status(400).json({ message: '此商品已售完' });
    }

    let cart = await Cart.findOne({ where: { UserId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ UserId: req.user.id });
    }

    const existingItem = await CartItem.findOne({
      where: { CartId: cart.id, ProductId: productId }
    });

    // C. 計算總數量：(購物車原本有的) + (這次想加的)
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const finalQty = currentQtyInCart + quantity;

    // D. 關鍵檢查！如果總數超過庫存，報錯！
    if (finalQty > product.stock) {
      return res.status(400).json({ 
        message: `庫存不足！您購物車已有 ${currentQtyInCart} 個，庫存剩 ${product.stock} 個` 
      });
    }

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({
        CartId: cart.id,
        ProductId: productId,
        quantity: quantity
      });
    }

    res.json({ message: '已加入購物車' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 3. 修改數量 (PUT) - 也要檢查庫存
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // 找出購物車裡的這項商品，並連帶把商品資訊 (Product) 抓出來查庫存
    const item = await CartItem.findOne({
      where: { id: req.params.id },
      include: [Product] 
    });

    if (!item) return res.status(404).json({ message: '找不到商品' });

    // 檢查：如果想修改的數量 > 商品實際庫存
    if (quantity > item.Product.stock) {
      return res.status(400).json({ message: `庫存不足，最多只能買 ${item.Product.stock} 個` });
    }

    item.quantity = quantity;
    await item.save();

    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新失敗:', error);
    res.status(500).json({ message: '更新失敗' });
  }
});
// 4. 刪除商品 (DELETE)
router.delete('/items/:id', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { UserId: req.user.id } });
        if (!cart) return res.status(404).json({ message: '找不到購物車' });

        await CartItem.destroy({
            where: {
                id: req.params.id,
                CartId: cart.id
            }
        });

        res.json({ message: '刪除成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '刪除失敗' });
    }
});

module.exports = router;