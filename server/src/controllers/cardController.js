const Card = require("../models/Card");
const Board = require("../models/Board"); // Add this import
const { protect } = require("../middlewares/authMiddleware");

const createCard = async (req, res) => {
  try {
    const { title, boardId, position } = req.body;

    const card = new Card({
      title,
      boardId,
      position,
      createdBy: req.user._id, // ✅ take from token, not client
    });

    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const getCards = [
  protect,
  async (req, res) => {
    const { boardId } = req.query;
    try {
      const cards = await Card.find({ boardId }).sort({ position: 1 });
      res.json(cards);
    } catch (err) {
      res
        .status(500)
        .json({ error: { message: err.message, code: 500 } });
    }
  },
];

const deleteCard = [
  protect,
  async (req, res) => {
    const { cardId } = req.params;
    try {
      const card = await Card.findById(cardId);
      if (!card)
        return res
          .status(404)
          .json({ error: { message: "Card not found", code: 404 } });
      await Card.deleteOne({ _id: cardId });
      res.json({ message: "Card deleted" });
    } catch (err) {
      res
        .status(400)
        .json({ error: { message: err.message, code: 400 } });
    }
  },
];

const moveCard = [
  protect,
  async (req, res) => {
    const { cardId } = req.params;
    const { newBoardId, newPosition } = req.body;
    try {
      const card = await Card.findById(cardId);
      if (!card)
        return res
          .status(404)
          .json({ error: { message: "Card not found", code: 404 } });
      if (newBoardId) {
        const newBoard = await Board.findById(newBoardId);
        if (!newBoard)
          return res
            .status(400)
            .json({ error: { message: "Invalid newBoardId", code: 400 } });
      }
      card.boardId = newBoardId || card.boardId;
      card.position = newPosition;
      await card.save();
      res.json(card);
    } catch (err) {
      res
        .status(400)
        .json({ error: { message: err.message, code: 400 } });
    }
  },
];

module.exports = { createCard, getCards, deleteCard, moveCard };