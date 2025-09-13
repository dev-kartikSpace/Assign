const { validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const User = require('../models/User');

exports.listMyWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] })
      .sort({ createdAt: -1 });
    res.json({ data: workspaces });
  } catch (err) { next(err); }
};

exports.createWorkspace = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    const { name, description, visibility } = req.body;
    const workspace = await Workspace.create({ name, description, visibility, owner: req.user.id, members: [req.user.id] });
    res.status(201).json({ data: workspace });
  } catch (err) { next(err); }
};

exports.getWorkspace = async (req, res, next) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });
    const boards = await Board.find({ workspace: ws._id }).sort({ createdAt: -1 });
    res.json({ data: { ...ws.toObject(), boards } });
  } catch (err) { next(err); }
};

exports.inviteMembers = async (req, res, next) => {
  try {
    const { emails } = req.body; // array of emails
    if (!Array.isArray(emails) || emails.length === 0) return res.status(400).json({ message: 'emails required' });
    const ws = await Workspace.findById(req.params.id);
    if (!ws) return res.status(404).json({ message: 'Workspace not found' });
    if (ws.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only owner can invite' });
    const users = await User.find({ email: { $in: emails } }, '_id');
    const newMemberIds = users.map(u => u._id.toString());
    ws.members = Array.from(new Set([...ws.members.map(String), ...newMemberIds])).map(id => id);
    await ws.save();
    res.json({ data: ws });
  } catch (err) { next(err); }
};

