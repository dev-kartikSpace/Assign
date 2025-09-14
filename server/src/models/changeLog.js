const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true, enum: ['card_created', 'card_deleted', 'card_moved', 'board_created', 'board_deleted', 'user_invited'] },
  title: String,
  fromBoardId: String,
  toBoardId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChangeLog', changeLogSchema);