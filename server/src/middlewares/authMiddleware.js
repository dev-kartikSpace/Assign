const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is set in .env
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) throw new Error('User not found');
      next();
    } catch (err) {
      console.error('Auth error:', err.message);
      res.status(401).json({ error: { message: 'Not authorized', code: 401 } });
    }
  } else {
    res.status(401).json({ error: { message: 'No token provided', code: 401 } });
  }
};

module.exports = { protect };