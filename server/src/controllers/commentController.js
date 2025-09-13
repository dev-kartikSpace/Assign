const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Card = require('../models/Card');
const Activity = require('../models/Activity');

exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    const { cardId, text } = req.body;
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    const comment = await Comment.create({ card: cardId, author: req.user.id, text });
    await Activity.create({ board: card.board, type: 'comment_added', actor: req.user.id, payload: { cardId, commentId: comment._id } });
    res.status(201).json({ data: comment });
  } catch (err) { next(err); }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ card: req.params.cardId }).sort({ createdAt: -1 }).limit(50).populate('author', 'name email');
    res.json({ data: comments });
  } catch (err) { next(err); }
};

