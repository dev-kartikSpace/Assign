const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: { message: 'User already exists', code: 400 } });

    user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { _id: user._id, name, email } });
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: { message: 'Invalid credentials', code: 401 } });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { _id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
};

module.exports = { signup, login };