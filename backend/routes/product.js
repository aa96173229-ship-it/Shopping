// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize'); // 引入運算符用來做模糊搜尋
const Product = require('../models/Product');

// 1. 取得所有商品 (支援搜尋功能 ?q=關鍵字)
router.get('/', async (req, res) => {
  try {
    const keyword = req.query.q; // 抓取網址上的 ?q=...
    let condition = {};

    // 如果有關鍵字，就設定搜尋條件
    if (keyword) {
      condition = {
        title: {
          [Op.like]: `%${keyword}%` // %代表模糊比對
        }
      };
    }

    const products = await Product.findAll({
      where: condition
    });
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
      return res.status(404).json({ message: '找不到此商品' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

module.exports = router;