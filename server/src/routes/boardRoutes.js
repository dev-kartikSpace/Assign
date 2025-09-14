const express = require('express');
const { createBoard, getBoards, deleteBoard } = require('../controllers/boardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createBoard);
router.get('/', protect, getBoards);
router.delete('/:boardId', protect, deleteBoard);

module.exports = router;