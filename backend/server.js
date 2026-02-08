// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <--- 1. 引入 cors
const app = express();
const port = process.env.PORT || 3000;

const sequelize = require('./db');
// const User = require('./models/User'); // 這行可以註解掉或留著，sync() 會自動處理

// 2. 啟用 CORS (允許所有來源，或指定 http://localhost:5173)
app.use(cors());

app.use(express.json());

// 3. 掛載 Auth 路由
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // 網址會變成 /api/auth/register

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

sequelize.sync().then(() => {
  console.log('資料庫已同步');
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});