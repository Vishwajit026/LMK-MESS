const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: [true, 'Room slug is required'],
      index: true,
      trim: true
    },
    sender: {
      _id: { type: String },
      username: { type: String, required: true },
      avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=LMK' },
      isGuest: { type: Boolean, default: false }
    },
    text: {
      type: String,
      trim: true,
      maxlength: [4000, 'Message cannot exceed 4000 characters']
    },
    mediaUrl: {
      type: String,
      default: null
    },
    mediaType: {
      type: String,
      enum: ['image', 'file', 'code', 'none', null],
      default: 'none'
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [{ type: String }] // array of usernames who reacted
      }
    ],
    replyTo: {
      messageId: { type: String },
      senderUsername: { type: String },
      text: { type: String }
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    }
  },
  {
    timestamps: true
  }
);

// Index for performant room message history retrieval
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
