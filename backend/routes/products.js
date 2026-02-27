// backend/routes/products.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const authenticateAdmin = require('../middleware/admin'); // 👈 記得要引入警衛！

// ==============================
// 🟢 公開路由 (所有人都能用)
// ==============================
/ 🤫 隱藏版秘密 API：用來觸發資料庫分類更新
router.get('/secret-update-categories', async (req, res) => {
    try {
        const products = await Product.findAll();
        const fallbackCategories = ['衣服', '褲子', '鞋子', '配件', '其他'];
        let count = 0;

        for (let product of products) {
            const productName = product.title || product.name || '';
            let targetCategory = '其他';

            // 簡單的關鍵字判斷
            if (productName.includes('外套') || productName.includes('T恤') || productName.includes('衣') || productName.includes('衫')) {
                targetCategory = '衣服';
            } else if (productName.includes('褲')) {
                targetCategory = '褲子';
            } else if (productName.includes('鞋')) {
                targetCategory = '鞋子';
            } else if (productName.includes('帽') || productName.includes('包') || productName.includes('襪')) {
                targetCategory = '配件';
            } else {
                targetCategory = fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
            }

            product.category = targetCategory;
            await product.save();
            count++;
        }

        res.send(`<h1>🎉 太神啦！成功更新了 ${count} 筆商品的分類！</h1><p>現在你可以關閉這個網頁，回到你的商城測試了。</p>`);
    } catch (error) {
        console.error(error);
        res.status(500).send('更新失敗：' + error.message);
    }
});


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

// 🛒 取得商品列表 (支援搜尋與分類過濾)
router.get('/', async (req, res) => {
    try {
        // 從網址列抓取前端傳來的參數 (例如: ?search=外套&category=衣服)
        const { search, category } = req.query;
        
        // 準備一個空的條件包
        let whereClause = {};

        // 1. 如果前端有指定分類，且不是選「全部」
        if (category && category !== '全部') {
            whereClause.category = category;
        }

        // 2. 如果前端有打搜尋關鍵字
        if (search) {
            whereClause.name = {
                [Op.like]: `%${search}%` // 只要商品名稱「包含」這個關鍵字就抓出來
            };
        }

        // 去資料庫找符合條件的商品！
        const products = await Product.findAll({ where: whereClause });
        
        res.json(products);
    } catch (error) {
        console.error('獲取商品失敗:', error);
        res.status(500).json({ message: '伺服器錯誤' });
    }
});

module.exports = router;