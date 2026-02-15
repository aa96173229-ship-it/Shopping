const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // 👈 必須引入 Product 模型才能做關聯
const authenticate = require('../middleware/auth'); 

// ==============================
// 🟢 取得購物車列表 (GET /api/cart)
// ==============================
router.get('/', authenticate, async (req, res) => {
  try {
    // 這裡要注意：如果你的 auth 中間件解碼後是 id，就用 id
    const userId = req.user.userId || req.user.id; 

    const items = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ['title', 'price', 'imageUrl'] // 👈 指定要抓的商品欄位
        }
      ],
      order: [['createdAt', 'DESC']] // 讓最新的在上面
    });

    res.json(items);
  } catch (error) {
    console.error('取得購物車失敗:', error);
    res.status(500).json({ message: '伺服器錯誤', detail: error.message });
  }
});

// ==============================
// 🔵 加入購物車 (POST /api/cart)
// ==============================
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!productId) {
      return res.status(400).json({ message: '缺少商品 ID' });
    }

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

// ==============================
// 🟡 刪除購物車項目 (DELETE /api/cart/:id)
// ==============================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const itemId = req.params.id;

    const item = await Cart.findOne({ where: { id: itemId, userId } });
    if (!item) return res.status(404).json({ message: '找不到該項目' });

    await item.destroy();
    res.json({ message: '已從購物車移除' });
  } catch (error) {
    res.status(500).json({ message: '刪除失敗' });
  }
});

// 🟡 更新數量 (PUT /api/cart/:id)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { quantity } = req.body;
    
    // 這裡的 :id 是 Cart 資料庫裡的 id
    const item = await Cart.findOne({ where: { id: req.params.id, userId } });
    
    if (!item) return res.status(404).json({ message: '找不到該項目' });

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: '更新失敗' });
  }
});

module.exports = router;