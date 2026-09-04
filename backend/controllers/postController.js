const Post = require('../models/Post');

// @desc    Get paginated social feed
// @route   GET /api/posts
// @access  Public (with optional user context)
const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tag, search, username } = req.query;

    const filter = {};

    if (tag && tag !== 'all') {
      filter.tag = tag.startsWith('#') ? tag : `#${tag}`;
    }

    if (username) {
      filter.username = username.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { tag: { $regex: search, $options: 'i' } }
      ];
    }

    const totalPosts = await Post.countDocuments(filter);
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const currentUserId = req.user ? req.user._id.toString() : null;

    const formattedPosts = posts.map((post) => {
      const isLikedByMe = currentUserId
        ? post.likes.some((like) => like.userId && like.userId.toString() === currentUserId)
        : false;

      return {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        isLikedByMe
      };
    });

    const totalPages = Math.ceil(totalPosts / limit);

    return res.status(200).json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('getPosts Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve feed posts'
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const isLikedByMe = currentUserId
      ? post.likes.some((like) => like.userId && like.userId.toString() === currentUserId)
      : false;

    return res.status(200).json({
      success: true,
      data: {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        isLikedByMe
      }
    });
  } catch (error) {
    console.error('getPostById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve post'
    });
  }
};

// @desc    Create a new post (Text, Image, or Both)
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { text, image, tag } = req.body;

    const trimmedText = text ? text.trim() : '';
    const trimmedImage = image ? image.trim() : '';

    if (!trimmedText && !trimmedImage) {
      return res.status(400).json({
        success: false,
        message: 'A post must contain either text, an image, or both.'
      });
    }

    // Auto-detect hashtag if not provided
    let postTag = tag ? tag.trim() : '#community';
    if (!postTag.startsWith('#')) postTag = `#${postTag}`;

    const newPost = await Post.create({
      user: req.user._id,
      username: req.user.username,
      name: req.user.name,
      userAvatar: req.user.avatar,
      text: trimmedText,
      image: trimmedImage,
      tag: postTag,
      likes: [],
      comments: []
    });

    return res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      data: {
        ...newPost.toObject(),
        likesCount: 0,
        commentsCount: 0,
        isLikedByMe: false
      }
    });
  } catch (error) {
    console.error('createPost Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create post'
    });
  }
};

// @desc    Toggle like / unlike on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const existingLikeIndex = post.likes.findIndex(
      (like) => like.userId && like.userId.toString() === userIdStr
    );

    let isLiked = false;

    if (existingLikeIndex > -1) {
      // User already liked -> unlike
      post.likes.splice(existingLikeIndex, 1);
      isLiked = false;
    } else {
      // Add like
      post.likes.push({
        userId: req.user._id,
        username: req.user.username,
        name: req.user.name,
        createdAt: new Date()
      });
      isLiked = true;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: isLiked ? 'Post liked!' : 'Post unliked!',
      data: {
        postId: post._id,
        isLiked,
        likesCount: post.likes.length,
        likes: post.likes
      }
    });
  } catch (error) {
    console.error('toggleLike Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update like status'
    });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      name: req.user.name,
      userAvatar: req.user.avatar,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Get the saved comment with generated _id
    const savedComment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully!',
      data: {
        postId: post._id,
        commentsCount: post.comments.length,
        comment: savedComment,
        comments: post.comments
      }
    });
  } catch (error) {
    console.error('addComment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// @desc    Delete a comment from a post
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check authorization: must be comment author or post author
    const isCommentAuthor = comment.userId.toString() === req.user._id.toString();
    const isPostAuthor = post.user.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment'
      });
    }

    post.comments.pull(commentId);
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        postId: post._id,
        commentsCount: post.comments.length,
        comments: post.comments
      }
    });
  } catch (error) {
    console.error('deleteComment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment'
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Must be post owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      postId: req.params.id
    });
  } catch (error) {
    console.error('deletePost Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  toggleLike,
  addComment,
  deleteComment,
  deletePost
};
