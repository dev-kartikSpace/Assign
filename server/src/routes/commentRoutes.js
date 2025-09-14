const express = require('express');
const { createComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/comments', protect, createComment);

module.exports = router;