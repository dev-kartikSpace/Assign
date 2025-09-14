const express = require('express');
const { createList, updatePosition } = require('../controllers/listController');
const { protect } = require('../middlewares/authMiddleware');
const { validate, listSchema } = require('../middlewares/validationMiddleware');
const List = require('../models/List');

const router = express.Router();

router.post('/', protect, validate(listSchema), createList);
router.put('/:listId/position', protect, updatePosition);
router.get('/', protect, async (req, res) => {
  const { boardId } = req.query;
  const lists = await List.find({ boardId }).sort('position');
  res.json(lists);
});

module.exports = router;