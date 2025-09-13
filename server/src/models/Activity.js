const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    type: {
      type: String,
      enum: ['card_created', 'card_moved', 'card_updated', 'comment_added', 'label_changed', 'list_created', 'list_renamed'],
      required: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payload: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', ActivitySchema);

