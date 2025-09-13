const Activity = require('../models/Activity');

exports.getBoardActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ board: req.params.boardId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('actor', 'name email');
    res.json({ data: activities });
  } catch (err) { next(err); }
};

