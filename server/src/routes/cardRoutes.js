const express = require('express');
const { createCard, getCards, deleteCard, moveCard } = require('../controllers/cardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createCard);
router.get('/', protect, getCards);
router.delete('/:cardId', protect, deleteCard);
router.put('/:cardId/move', protect, moveCard);

module.exports = router;