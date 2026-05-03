const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 150
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    lastMessageAt: {
      type: Date,
      default: null
    },
    lastMessagePreview: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
