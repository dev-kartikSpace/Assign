const mongoose = require('mongoose');

  const workspaceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    members: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['owner', 'member'], default: 'member' },
    }],
  }, { timestamps: true });

  module.exports = mongoose.model('Workspace', workspaceSchema);