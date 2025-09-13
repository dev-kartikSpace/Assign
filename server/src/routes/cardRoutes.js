const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/cardController');

router.use(auth);

router.post('/', [
  body('boardId').notEmpty(),
  body('listId').notEmpty(),
  body('title').notEmpty(),
  body('position').isNumeric()
], ctrl.createCard);

router.patch('/:id/move', ctrl.moveCard);
router.put('/:id', ctrl.updateCard);
router.get('/search', ctrl.searchCards);

module.exports = router;

