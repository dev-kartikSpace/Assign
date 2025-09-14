const express = require('express');
const Card = require('../models/Card');
const Board = require('../models/Board');
const List = require('../models/List');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/boards/:boardId/search', protect, async (req, res) => {
  const { q } = req.query;  // Search query
  const { boardId } = req.params;

  // Check access
  const board = await Board.findOne({ _id: boardId, 'members.userId': req.user._id });
  if (!board) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });

  // Find lists in board
  const lists = await List.find({ boardId });
  const listIds = lists.map(l => l._id);

  // Text search on cards in those lists
  const cards = await Card.find({
    listId: { $in: listIds },
    $text: { $search: q },
  }).populate('assignees', 'name');  // Populate for assignee names

  res.json(cards);
});

module.exports = router;