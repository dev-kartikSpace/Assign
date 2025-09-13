const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/activityController');

router.use(auth);

router.get('/board/:boardId', ctrl.getBoardActivity);

module.exports = router;

