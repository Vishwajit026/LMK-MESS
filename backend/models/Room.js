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
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
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
    isProtected: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      default: null
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

// Helper to generate 6-character short invite code
roomSchema.statics.generateInviteCode = function () {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

module.exports = mongoose.model('Room', roomSchema);
