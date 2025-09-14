const List = require('../models/List');
const Board = require('../models/Board');
const { protect } = require('../middlewares/authMiddleware');
const { validate, listSchema } = require('../middlewares/validationMiddleware');

const createList = [protect, validate(listSchema), async (req, res) => {
  const { title, boardId, position } = req.body;
  const board = await Board.findOne({ _id: boardId, 'members.userId': req.user._id });
  if (!board) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });

  const list = new List({ title, boardId, position });
  await list.save();
  board.activityLogs.push({ event: 'list_created', userId: req.user._id, details: { listId: list._id } });
  await board.save();
  res.status(201).json(list);
}];

const updatePosition = [protect, async (req, res) => {
  const { listId } = req.params;
  const { position } = req.body;
  const list = await List.findById(listId);
  if (!list) return res.status(404).json({ error: { message: 'List not found', code: 404 } });

  const board = await Board.findOne({ _id: list.boardId, 'members.userId': req.user._id });
  if (!board) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });

  list.position = position;
  await list.save();
  board.activityLogs.push({ event: 'list_moved', userId: req.user._id, details: { listId, position } });
  await board.save();
  res.json(list);
}];

module.exports = { createList, updatePosition };