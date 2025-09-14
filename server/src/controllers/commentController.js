const Comment = require('../models/Comment');
const Card = require('../models/Card');
const Board = require('../models/Board');
const { protect } = require('../middlewares/authMiddleware');

const createComment = [protect, async (req, res) => {
  const { text, cardId } = req.body;
  try {
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: { message: 'Card not found', code: 404 } });
    const board = await Board.findOne({ _id: card.boardId, 'members.userId': req.user._id });
    if (!board) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });

    const comment = new Comment({
      text,
      author: req.user._id,
      cardId,
    });
    await comment.save();

    const workspaceId = board.workspaceId; // Assume Board has workspaceId
    req.io.to(`workspace:${workspaceId}`).emit('comment_created', { comment, cardId });

    res.status(201).json(comment);
  } catch (err) {
    console.error('Comment creation error:', err);
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

module.exports = { createComment };