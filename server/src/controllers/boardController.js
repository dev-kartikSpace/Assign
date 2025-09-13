const { validationResult } = require('express-validator');
const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Workspace = require('../models/Workspace');

exports.createBoard = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    const { workspaceId, title, visibility, color } = req.body;
    const ws = await Workspace.findById(workspaceId);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });
    if (!ws.members.map(String).includes(req.user.id)) return res.status(403).json({ message: 'Not a workspace member' });
    const board = await Board.create({ workspace: workspaceId, title, visibility, color, owner: req.user.id, members: [req.user.id] });
    res.status(201).json({ data: board });
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can invite' });
    const { userId } = req.body;
    board.members = Array.from(new Set([...board.members.map(String), userId]));
    await board.save();
    res.json({ data: board });
  } catch (err) { next(err); }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });
    const lists = await List.find({ board: board._id }).sort({ position: 1 }).lean();
    const listIds = lists.map(l => l._id);
    const cards = await Card.find({ board: board._id, list: { $in: listIds } }).sort({ position: 1 }).lean();
    const listIdToCards = {};
    for (const card of cards) {
      const key = String(card.list);
      if (!listIdToCards[key]) listIdToCards[key] = [];
      listIdToCards[key].push(card);
    }
    const listsWithCards = lists.map(l => ({ ...l, cards: listIdToCards[String(l._id)] || [] }));
    res.json({ data: { ...board.toObject(), lists: listsWithCards } });
  } catch (err) { next(err); }
};

