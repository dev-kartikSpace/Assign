const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/listController');

router.use(auth);

router.post('/', [body('boardId').notEmpty(), body('title').notEmpty(), body('position').isNumeric()], ctrl.createList);
router.put('/:id', ctrl.updateList);

module.exports = router;

