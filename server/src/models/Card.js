const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    labels: [{ type: String }],
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', CardSchema);

