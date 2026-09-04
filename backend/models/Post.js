const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const LikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must belong to a user']
    },
    username: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Post text cannot exceed 2000 characters'],
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: '#general'
    },
    likes: [LikeSchema],
    comments: [CommentSchema]
  },
  {
    timestamps: true
  }
);

// Custom validation to ensure at least text OR image is provided
PostSchema.pre('validate', function (next) {
  const hasText = this.text && this.text.trim().length > 0;
  const hasImage = this.image && this.image.trim().length > 0;
  
  if (!hasText && !hasImage) {
    this.invalidate('content', 'Please provide either text content, an image, or both.');
  }
  next();
});

// Index for efficient sorting & pagination
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
