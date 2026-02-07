require('dotenv').config(); // <--- 1. 載入設定
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // <--- 2. 使用變數

app.get('/', (req, res) => {
  res.send('Hello from Express Backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});