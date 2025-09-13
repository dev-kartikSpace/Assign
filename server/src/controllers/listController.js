const { validationResult } = require('express-validator');
const List = require('../models/List');
const Board = require('../models/Board');
const Activity = require('../models/Activity');

exports.createList = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    const { boardId, title, position } = req.body;
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const list = await List.create({ board: boardId, title, position });
    await Activity.create({ board: boardId, type: 'list_created', actor: req.user.id, payload: { listId: list._id } });
    res.status(201).json({ data: list });
  } catch (err) { next(err); }
};

exports.updateList = async (req, res, next) => {
  try {
    const update = {};
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.position !== undefined) update.position = req.body.position;
    const list = await List.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!list) return res.status(404).json({ message: 'List not found' });
    res.json({ data: list });
  } catch (err) { next(err); }
};

