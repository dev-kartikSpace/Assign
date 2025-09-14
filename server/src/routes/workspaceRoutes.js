const express = require('express');
const { createWorkspace, getWorkspaces, inviteUser, deleteWorkspace, getWorkspaceHistory } = require('../controllers/workspaceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createWorkspace);
router.get('/', protect, getWorkspaces);
router.post('/:workspaceId/invite', protect, inviteUser);
router.delete('/:workspaceId', protect, deleteWorkspace);
router.get('/:workspaceId/history', protect, getWorkspaceHistory);

module.exports = router;