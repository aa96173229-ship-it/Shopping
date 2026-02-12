const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// 中介軟體：驗證 Token (確認是誰登入)
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

// 1. 取得購物車內容 (GET /api/cart/items)
router.get('/items', authenticateToken, async (req, res) => {
  try {
    // 找這個人的購物車
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    
    // 如果連購物車都沒有，就回傳空陣列
    if (!cart) return res.json([]);

    // 找出裡面的商品，並且「連表查詢 (Include)」把商品詳細資料(圖片、標題)一起抓出來
    const items = await CartItem.findAll({
      where: { CartId: cart.id },
      include: [Product] // 👈 重要！沒有這行，前端就看不到圖片和標題
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '取得購物車失敗' });
  }
});

// 2. 加入購物車 (POST /api/cart/items)
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // 👇👇👇 重點修改：自動建立購物車 👇👇👇
    let cart = await Cart.findOne({ where: { UserId: req.user.id } });
    
    // 如果這個使用者還沒有購物車，馬上幫他新增一個！
    if (!cart) {
      cart = await Cart.create({ UserId: req.user.id });
    }
    // 👆👆👆 修改結束 👆👆👆

    // 檢查這個商品是不是已經在車上了？
    const existingItem = await CartItem.findOne({
      where: { CartId: cart.id, ProductId: productId }
    });

    if (existingItem) {
      // 如果有了，就更新數量
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      // 如果沒有，就新增一條
      await CartItem.create({
        CartId: cart.id,
        ProductId: productId,
        quantity: quantity
      });
    }

    res.json({ message: '已加入購物車' });
  } catch (error) {
    console.error('加入購物車錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 3. 刪除購物車商品 (DELETE /api/cart/items/:id)
router.delete('/items/:id', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ where: { UserId: req.user.id } });
        if (!cart) return res.status(404).json({ message: '找不到購物車' });

        await CartItem.destroy({
            where: {
                id: req.params.id, // 這是 CartItem 的 ID (不是商品 ID)
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