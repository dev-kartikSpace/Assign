const Board = require('../models/Board');
const Workspace = require('../models/Workspace');
const List = require('../models/List');
const Card = require('../models/Card');
const { protect } = require('../middlewares/authMiddleware');
const mongoose = require('mongoose');

const createBoard = [protect, async (req, res) => {
  const { title, visibility, workspaceId } = req.body;
  console.log('Creating board with:', req.body, 'User ID:', req.user._id);
  try {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ error: { message: 'Invalid workspaceId', code: 400 } });
    }
    const existingBoard = await Board.findOne({ title, workspaceId });
    if (existingBoard) {
      return res.status(400).json({ error: { message: 'Board with this title already exists', code: 400 } });
    }
    const board = new Board({
      title,
      visibility,
      workspaceId,
      owner: req.user._id,
      members: [{ userId: req.user._id }], // Initial member is the creator
    });
    await board.save();
    console.log('Board created successfully:', board._id);

    // Add all workspace members to the board (optional, based on your design)
    const workspace = await Workspace.findById(workspaceId);
    if (workspace) {
      const workspaceMembers = workspace.members.map(m => ({ userId: m.userId }));
      board.members.push(...workspaceMembers.filter(m => !board.members.some(bm => bm.userId.equals(m.userId))));
      await board.save();
    }

    res.status(201).json(board);
  } catch (err) {
    console.error('Board creation error:', err.stack);
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

const getBoards = [protect, async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ error: { message: 'Invalid workspaceId', code: 400 } });
    }

    // Ensure user is a member of the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      'members.userId': req.user._id
    });
    if (!workspace) {
      return res.status(403).json({ error: { message: 'Not authorized', code: 403 } });
    }

    // Return all boards in the workspace where the user has access (e.g., via workspace membership)
    const boards = await Board.find({ workspaceId }).lean();
    res.json(boards.filter(board => 
      board.members.some(member => member.userId.equals(req.user._id)) || 
      workspace.members.some(m => m.userId.equals(board.owner))
    ));
  } catch (err) {
    console.error('Get boards error:', err.stack);
    res.status(500).json({ error: { message: err.message, code: 500 } });
  }
}];

const deleteBoard = [protect, async (req, res) => {
  const { boardId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ error: { message: 'Invalid boardId', code: 400 } });
    }
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: { message: 'Board not found', code: 404 } });
    const workspace = await Workspace.findOne({
      _id: board.workspaceId,
      'members.userId': req.user._id
    });
    if (!workspace) return res.status(403).json({ error: { message: 'Access denied', code: 403 } });

    await Card.deleteMany({ boardId });
    await List.deleteMany({ boardId });
    await Board.deleteOne({ _id: boardId });

    // Emit Socket.IO event for real-time sync
    if (req.io) {
      req.io.to(`workspace:${board.workspaceId}`).emit('board_deleted', { boardId });
    }

    res.json({ message: 'Board deleted' });
  } catch (err) {
    console.error('Delete board error:', err);
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];


module.exports = { createBoard, getBoards, deleteBoard };