const Card = require('../models/Card');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');
const { protect } = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');

const createCard = [protect, async (req, res) => {
  const { title, boardId, position } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: { message: 'Invalid boardId', code: 400 } });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: { message: 'Board not found', code: 404 } });
    }

    const workspace = await Workspace.findOne({
      _id: board.workspaceId,
      'members.userId': req.user._id
    });
    if (!workspace) {
      return res.status(403).json({ error: { message: 'Access denied', code: 403 } });
    }

    const card = new Card({
      title,
      boardId,
      position: position || 0,
      createdBy: req.user._id,
    });

    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

const getCards = [protect, async (req, res) => {
  const { boardId } = req.query;
  console.log('Fetching cards for boardId:', boardId);
  try {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: { message: 'Invalid boardId', code: 400 } });
    }
    const board = await Board.findOne({ _id: boardId, 'members.userId': req.user._id });
    if (!board) {
      return res.status(403).json({ error: { message: 'Access denied', code: 403 } });
    }
    const cards = await Card.find({ boardId }).sort({ position: 1 });
    res.json(cards);
  } catch (err) {
    console.error('Card fetch error:', err);
    res.status(500).json({ error: { message: 'Internal server error', code: 500 } });
  }
}];

const moveCard = [protect, async (req, res) => {
  const { cardId } = req.params;
  const { newBoardId, newPosition } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(cardId) || !mongoose.Types.ObjectId.isValid(newBoardId)) {
      return res.status(400).json({ error: { message: 'Invalid ID', code: 400 } });
    }
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: { message: 'Card not found', code: 404 } });
    const board = await Board.findOne({ _id: newBoardId, 'members.userId': req.user._id });
    if (!board) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });
    card.boardId = newBoardId;
    card.position = newPosition;
    await card.save();

    // Emit Socket.IO event for real-time update
    if (req.io) {
      const workspaceId = (await Board.findById(newBoardId)).workspaceId;
      req.io.to(`workspace:${workspaceId}`).emit('card_moved', {
        cardId,
        newBoardId,
        newPosition,
      });
    }

    res.json(card);
  } catch (err) {
    console.error('Move card error:', err);
    res.status(500).json({ error: { message: err.message, code: 500 } });
  }
}];

const updateCard = async (req, res) => {
  const { cardId } = req.params;
  const { title, boardId, position } = req.body;

  try {
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: 'Card not found' });

    if (!card.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    card.title = title ?? card.title;
    card.boardId = boardId ?? card.boardId;
    card.position = position ?? card.position;

    await card.save();

    req.io.to(boardId).emit("cardUpdated", card);

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCard = [protect, async (req, res) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: { message: 'Card not found', code: 404 } });
    const board = await Board.findById(card.boardId);
    if (!board) return res.status(404).json({ error: { message: 'Board not found', code: 404 } });
    const workspace = await Workspace.findOne({
      _id: board.workspaceId,
      'members.userId': req.user._id
    });
    if (!workspace) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });
    await Card.deleteOne({ _id: cardId });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

module.exports = { createCard, getCards, moveCard, updateCard, deleteCard };