const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/commentController');

router.use(auth);

router.post('/', [body('cardId').notEmpty(), body('text').notEmpty()], ctrl.addComment);
router.get('/:cardId', ctrl.getComments);

module.exports = router;

