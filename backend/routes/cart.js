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
          attributes: ['title', 'price', 'imageUrl', 'stock'] // 👈 指定要抓的商品欄位
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
    const qty = parseInt(quantity); // 確保是數字

    // 1. 先找商品，確認庫存
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: '商品不存在' });

    // 2. 找找看購物車是不是已經有這個商品
    let cartItem = await Cart.findOne({ where: { userId, productId } });
    
    // 計算預計總數量 (原本購物車有的 + 這次想加的)
    const currentQty = cartItem ? cartItem.quantity : 0;
    const totalQty = currentQty + qty;

    // 🛑 關鍵檢查：如果總數超過庫存，報錯！
    if (totalQty > product.stock) {
      return res.status(400).json({ message: `庫存不足！只剩 ${product.stock} 個` });
    }

    // 3. 庫存夠，才準寫入
    if (cartItem) {
      cartItem.quantity = totalQty;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({ userId, productId, quantity: qty });
    }

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
    
    // 找到該購物車項目，並連同商品資料一起抓出來 (為了看 stock)
    const cartItem = await Cart.findOne({ 
      where: { id: req.params.id, userId },
      include: [Product] // 👈 必須 include Product 才能查庫存
    });

    if (!cartItem) return res.status(404).json({ message: '找不到該項目' });

    // 🛑 關鍵檢查
    if (quantity > cartItem.Product.stock) {
      return res.status(400).json({ message: `庫存不足，無法修改數量！最大庫存為 ${cartItem.Product.stock}` });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: '更新失敗' });
  }
});

module.exports = router;