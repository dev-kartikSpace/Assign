const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { protect } = require('../middlewares/authMiddleware');
const Board = require('../models/Board');
const Card = require('../models/Card');
const ChangeLog = require('../models/changeLog');

const createWorkspace = [protect, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: { message: 'Title is required', code: 400 } });

  try {
    const workspace = new Workspace({
      title,
      owner: req.user._id,
      members: [{ userId: req.user._id, role: 'owner' }],
    });
    await workspace.save();

    // Log workspace creation
    await new ChangeLog({
      workspaceId: workspace._id,
      action: 'workspace_created',
      title: workspace.title,
      userId: req.user._id,
      timestamp: new Date(),
    }).save();

    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

const getWorkspaces = [protect, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.userId': req.user._id })
      .populate('members.userId', 'name email');
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: { message: err.message, code: 500 } });
  }
}];

const inviteUser = [protect, async (req, res) => {
  const { workspaceId } = req.params;
  const { email } = req.body;
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some(m => m.userId.toString() === req.user._id.toString() && m.role === 'owner')) {
      return res.status(403).json({ error: { message: 'Unauthorized', code: 403 } });
    }
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ error: { message: 'User not found', code: 404 } });
    if (workspace.members.some(m => m.userId.toString() === invitedUser._id.toString())) {
      return res.status(400).json({ error: { message: 'User already invited', code: 400 } });
    }
    workspace.members.push({ userId: invitedUser._id, role: 'member' });
    await workspace.save();

    // Sync invited user to all boards in the workspace
    await Board.updateMany(
      { workspaceId },
      { $push: { members: { userId: invitedUser._id, role: 'member' } } }
    );

    // Log user invitation
    await new ChangeLog({
      workspaceId,
      action: 'user_invited',
      userId: req.user._id,
      additionalInfo: { invitedUserId: invitedUser._id, email },
      timestamp: new Date(),
    }).save();

    // Notify via socket
    req.io.to(`workspace:${workspaceId}`).emit('user_invited', { userId: invitedUser._id, workspaceId });
    res.json({ message: 'User invited successfully' });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ error: { message: err.message, code: 500 } });
  }
}];

const deleteWorkspace = [protect, async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ error: { message: 'Workspace not found', code: 404 } });
    if (!workspace.owner.equals(req.user._id)) {
      return res.status(403).json({ error: { message: 'Only the owner can delete the workspace', code: 403 } });
    }
    await Workspace.deleteOne({ _id: workspaceId });
    await Board.deleteMany({ workspaceId });
    await Card.deleteMany({ boardId: { $in: await Board.find({ workspaceId }).distinct('_id') } });

    // Log workspace deletion
    await new ChangeLog({
      workspaceId,
      action: 'workspace_deleted',
      title: workspace.title,
      userId: req.user._id,
      timestamp: new Date(),
    }).save();

    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    res.status(400).json({ error: { message: err.message, code: 400 } });
  }
}];

const getWorkspaceHistory = async (req, res) => {
  try {
    const history = await ChangeLog.find({ workspaceId: req.params.workspaceId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'name');
    res.json(history.map(h => ({
      action: h.action,
      title: h.title,
      fromBoardId: h.fromBoardId,
      toBoardId: h.toBoardId,
      timestamp: h.timestamp,
      user: h.userId?.name || 'Unknown',
      additionalInfo: h.additionalInfo,
    })));
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};

module.exports = { createWorkspace, getWorkspaces, inviteUser, deleteWorkspace, getWorkspaceHistory };