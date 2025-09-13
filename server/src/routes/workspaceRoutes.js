const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/workspaceController');

router.use(auth);

router.get('/', ctrl.listMyWorkspaces);
router.post('/', [body('name').notEmpty()], ctrl.createWorkspace);
router.get('/:id', ctrl.getWorkspace);
router.post('/:id/invite', ctrl.inviteMembers);

module.exports = router;

