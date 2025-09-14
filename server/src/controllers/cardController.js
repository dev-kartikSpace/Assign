const Card = require('../models/Card');
const { protect } = require('../middlewares/authMiddleware');

const createCard = [protect, async (req, res) => {
  const { title, boardId, position } = req.body;
  if (!title || !boardId) return res.status(400).json({ error: { message: 'Title and boardId are required', code: 400 } });

  try {
    const card = new Card({
      title,
      boardId,
      position,
      workspaceId: (await Board.findById(boardId)).workspaceId,
      members: [{ userId: req.user._id, role: 'member' }],
    });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

const getCards = [protect, async (req, res) => {
  const { boardId } = req.query;
  try {
    const cards = await Card.find({ boardId }).sort({ position: 1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: { message: err.message, code: 500 } });
  }
}];

const deleteCard = [protect, async (req, res) => {
  const { cardId } = req.params;
  try {
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: { message: 'Card not found', code: 404 } });
    await Card.deleteOne({ _id: cardId });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

const moveCard = [protect, async (req, res) => {
  const { cardId } = req.params;
  const { newBoardId, newPosition } = req.body;
  try {
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ error: { message: 'Card not found', code: 404 } });
    card.boardId = newBoardId;
    card.position = newPosition;
    await card.save();
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

module.exports = { createCard, getCards, deleteCard, moveCard };