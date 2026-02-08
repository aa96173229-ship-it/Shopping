const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// 所有的購物車路由都需要登入
router.use(authenticateToken);

// 1. 取得我的購物車
router.get('/', async (req, res) => {
  try {
    // 先找使用者的購物車，如果沒有就幫他創一個
    const [cart] = await Cart.findOrCreate({
      where: { UserId: req.user.id }
    });

    // 抓出購物車裡的所有項目 (包含商品詳細資料)
    const items = await CartItem.findAll({
      where: { CartId: cart.id },
      include: [Product] // 關聯查詢
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 2. 加入商品到購物車
router.post('/items', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const [cart] = await Cart.findOrCreate({ where: { UserId: req.user.id } });

    // 檢查這個商品是不是已經在車子裡了
    const item = await CartItem.findOne({
      where: { CartId: cart.id, ProductId: productId }
    });

    if (item) {
      // 如果有了，就增加數量
      item.quantity += quantity;
      await item.save();
    } else {
      // 如果沒有，就新增一筆
      await CartItem.create({
        CartId: cart.id,
        ProductId: productId,
        quantity
      });
    }
    res.json({ message: '已加入購物車' });
  } catch (error) {
    res.status(500).json({ message: '加入失敗' });
  }
});

// 3. 更新數量
router.put('/items/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    await CartItem.update({ quantity }, { where: { id: req.params.itemId } });
    res.json({ message: '更新成功' });
  } catch (error) {
    res.status(500).json({ message: '更新失敗' });
  }
});

// 4. 移除商品
router.delete('/items/:itemId', async (req, res) => {
  try {
    await CartItem.destroy({ where: { id: req.params.itemId } });
    res.json({ message: '已移除商品' });
  } catch (error) {
    res.status(500).json({ message: '移除失敗' });
  }
});

module.exports = router;