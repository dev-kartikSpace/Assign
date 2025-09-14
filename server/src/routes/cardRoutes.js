const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createCard, getCards, moveCard, updateCard, deleteCard } = require('../controllers/cardController');

router.route('/').post(protect, createCard).get(protect, getCards);
router.route('/:cardId/move').put(protect, moveCard);
router.route('/:cardId').put(protect, updateCard).delete(protect, deleteCard);

module.exports = router;