// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 取出 Bearer 後面的 token

  if (!token) return res.status(401).json({ message: '請先登入' });

  jwt.verify(token, 'SECRET_KEY', (err, user) => { // ⚠️ 記得改成跟 auth.js 一樣的密鑰
    if (err) return res.status(403).json({ message: 'Token 無效' });
    req.user = user; // 把解碼後的使用者資料 (id) 塞進 req
    next();
  });
};