const express = require('express');
const { getActivityLogs } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get activity logs for a board
router.get('/boards/:boardId/activity', protect, getActivityLogs);

module.exports = router;