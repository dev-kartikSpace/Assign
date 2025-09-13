const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/boardController');

router.use(auth);

router.post('/', [body('workspaceId').notEmpty(), body('title').notEmpty()], ctrl.createBoard);
router.post('/:id/members', ctrl.addMember);
router.get('/:id', ctrl.getBoard);

module.exports = router;

