const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');

const getProfile = [protect, async (req, res) => {
  res.json(req.user);
}];

const updateProfile = [protect, async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true });
  res.json(user);
}];

module.exports = { getProfile, updateProfile };