const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    title: { type: String, required: true },
    position: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('List', ListSchema);

