const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'image'],
      required: true
    },
    text: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    isAutoCapture: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: false }
);

module.exports = mongoose.model('Message', messageSchema);
