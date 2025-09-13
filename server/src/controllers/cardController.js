const { validationResult } = require('express-validator');
const Card = require('../models/Card');
const List = require('../models/List');
const Activity = require('../models/Activity');

exports.createCard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    const { boardId, listId, title, description, labels, assignees, dueDate, position } = req.body;
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: 'List not found' });
    const card = await Card.create({ board: boardId, list: listId, title, description, labels, assignees, dueDate, position });
    await Activity.create({ board: boardId, type: 'card_created', actor: req.user.id, payload: { cardId: card._id, listId } });
    res.status(201).json({ data: card });
  } catch (err) { next(err); }
};

exports.moveCard = async (req, res, next) => {
  try {
    const { listId, boardId, position } = req.body;
    const card = await Card.findByIdAndUpdate(req.params.id, { list: listId, board: boardId, position }, { new: true });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    await Activity.create({ board: boardId, type: 'card_moved', actor: req.user.id, payload: { cardId: card._id, listId } });
    res.json({ data: card });
  } catch (err) { next(err); }
};

exports.updateCard = async (req, res, next) => {
  try {
    const update = {};
    ['title','description','labels','assignees','dueDate','position'].forEach((k)=>{
      if (req.body[k] !== undefined) update[k] = req.body[k];
    });
    const card = await Card.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!card) return res.status(404).json({ message: 'Card not found' });
    await Activity.create({ board: card.board, type: 'card_updated', actor: req.user.id, payload: { cardId: card._id } });
    res.json({ data: card });
  } catch (err) { next(err); }
};

exports.searchCards = async (req, res, next) => {
  try {
    const { boardId, q, label, assignee } = req.query;
    const filter = { board: boardId };
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (label) filter.labels = label;
    if (assignee) filter.assignees = assignee;
    const cards = await Card.find(filter).limit(50);
    res.json({ data: cards });
  } catch (err) { next(err); }
};

