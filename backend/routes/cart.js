const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticate = require('../middleware/auth'); 

// ==============================
// 🟢 取得購物車列表 (GET /api/cart)
// ==============================
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id; 

    const items = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ['title', 'price', 'imageUrl', 'stock'] 
        }
      ],
      order: [['createdAt', 'DESC']]
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
    
    // 💡 改良點 1: 確保加入的數量是數字
    const addQty = parseInt(quantity); 

    if (!productId || isNaN(addQty) || addQty < 1) {
      return res.status(400).json({ message: '資料不正確' });
    }

    // 1. 找商品 (確認庫存)
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 2. 找購物車現有紀錄
    let cartItem = await Cart.findOne({ where: { userId, productId } });

    // 💡 改良點 2: 資料庫拿出來的數量也強制轉數字 (避免 5+5=55)
    const currentQty = cartItem ? parseInt(cartItem.quantity) : 0;
    
    // 計算總數
    const totalQty = currentQty + addQty;

    // 🛑 庫存檢查 (使用 > 大於，所以剛好買光是可以的)
    if (totalQty > product.stock) {
      return res.status(400).json({ 
        message: `庫存不足！庫存剩 ${product.stock}，您加購後總數為 ${totalQty}` 
      });
    }

    // 3. 寫入資料庫
    if (cartItem) {
      cartItem.quantity = totalQty;
      await cartItem.save();
    } else {
      await Cart.create({
        userId,
        productId,
        quantity: addQty
      });
    }

    res.status(201).json({ message: '加入成功', currentQuantity: totalQty });

  } catch (error) {
    console.error('加入購物車失敗:', error);
    res.status(500).json({ message: '伺服器錯誤' });
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

// ==============================
// 🟡 更新數量 (PUT /api/cart/:id)
// ==============================
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    // 💡 改良點 3: 更新時也要確保是數字
    const newQty = parseInt(req.body.quantity);
    
    if (isNaN(newQty) || newQty < 1) {
        return res.status(400).json({ message: '數量不正確' });
    }

    const cartItem = await Cart.findOne({ 
      where: { id: req.params.id, userId },
      include: [Product]
    });

    if (!cartItem) return res.status(404).json({ message: '找不到該項目' });

    // 🛑 庫存檢查
    if (newQty > cartItem.Product.stock) {
      return res.status(400).json({ 
        message: `庫存不足，無法修改數量！最大庫存為 ${cartItem.Product.stock}` 
      });
    }

    cartItem.quantity = newQty;
    await cartItem.save();
    
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: '更新失敗' });
  }
});

module.exports = router;