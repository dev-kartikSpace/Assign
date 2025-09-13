const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('x-auth-token') || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;

