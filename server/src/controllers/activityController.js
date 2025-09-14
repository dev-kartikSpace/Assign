const { protect } = require("../middlewares/authMiddleware");
const Board = require("../models/Board");


const getActivityLogs = [protect, async (req, res) => {
  const { boardId } = req.params;
  const board = await Board.findOne({ _id: boardId, 'members.userId': req.user._id });
  if (!board) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });
  res.json(board.activityLogs);
}];

module.exports = { getActivityLogs };