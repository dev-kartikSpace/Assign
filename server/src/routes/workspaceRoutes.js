const express = require('express');
const { createWorkspace, getWorkspaces, inviteUser } = require('../controllers/workspaceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createWorkspace);
router.get('/', protect, getWorkspaces);
// Remove the incorrect /invite route
// router.post('/invite', protect, inviteMember);
router.post('/:workspaceId/invite', protect, inviteUser);

module.exports = router;