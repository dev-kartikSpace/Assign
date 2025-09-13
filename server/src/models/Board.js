const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    title: { type: String, required: true },
    color: { type: String, default: '#0ea5e9' },
    visibility: { type: String, enum: ['private', 'workspace'], default: 'workspace' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', BoardSchema);

