const router = require('express').Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/signup', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], ctrl.signup);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], ctrl.login);

router.get('/me', auth, ctrl.me);

module.exports = router;

