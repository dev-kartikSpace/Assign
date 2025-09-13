const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibility: { type: String, enum: ['private', 'workspace'], default: 'workspace' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', WorkspaceSchema);

