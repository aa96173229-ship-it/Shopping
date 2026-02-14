const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'SECRET_KEY', (err, user) => {
    if (err) return res.sendStatus(403);
    
    // 👇 關鍵檢查：你是管理員嗎？
    if (!user.isAdmin) {
      return res.status(403).json({ message: '權限不足，只有管理員能進來' });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateAdmin;