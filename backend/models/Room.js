const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [50, 'Room name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      default: '',
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    topic: {
      type: String,
      default: 'General Conversation'
    },
    icon: {
      type: String,
      default: '💬'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    isDirect: {
      type: Boolean,
      default: false
    },
    participants: [
      {
        type: String, // usernames
        trim: true
      }
    ],
    createdBy: {
      type: String,
      default: 'System'
    },
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

// Helper to sanitize slug
roomSchema.statics.generateSlug = function (name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

module.exports = mongoose.model('Room', roomSchema);
