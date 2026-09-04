const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Market Report', 'Investment Guide', 'News', 'Blog'],
    default: 'Blog'
  },
  author: {
    type: String,
    default: 'KPC Insights Team'
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
