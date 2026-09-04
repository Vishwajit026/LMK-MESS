const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  deleteComment,
  deletePost
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public / Optional auth routes
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);

// Protected routes (require user login)
router.post('/', protect, createPost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);
router.delete('/:postId/comments/:commentId', protect, deleteComment);

module.exports = router;
