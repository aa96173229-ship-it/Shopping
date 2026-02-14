// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const authenticateAdmin = require('../middleware/admin'); // 👈 記得要引入警衛！

// ==============================
// 🟢 公開路由 (所有人都能用)
// ==============================

// 1. 取得所有商品列表 (支援搜尋)
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.q;
    let condition = {};

    if (keyword) {
      condition = {
        title: { [Op.like]: `%${keyword}%` }
      };
    }

    const products = await Product.findAll({ where: condition });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// 2. 取得單一商品詳情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '找不到商品' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

// ==============================
// 🔴 管理員專用路由 (需要 Admin 權限)
// ==============================

// 3. 新增商品 (POST)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    // 直接把前端傳來的整包資料 (title, price, stock, imageUrl...) 寫入資料庫
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('新增失敗:', error);
    res.status(400).json({ message: '新增失敗，請檢查欄位' });
  }
});

// 4. 修改商品 (PUT) - 用來補貨或改價格
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '找不到商品' });
    }

    // 更新資料
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    console.error('更新失敗:', error);
    res.status(400).json({ message: '更新失敗' });
  }
});

// 5. 刪除商品 (DELETE) - 下架
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '找不到商品' });
    }

    await product.destroy(); // 真的從資料庫刪除
    res.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除失敗:', error);
    res.status(500).json({ message: '刪除失敗' });
  }
});

module.exports = router;