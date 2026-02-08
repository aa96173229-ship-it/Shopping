// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');

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

module.exports = router;