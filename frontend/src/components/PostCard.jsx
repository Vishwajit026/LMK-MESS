import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  ShareOutlined as ShareIcon,
  MoreVert as MoreIcon,
  DeleteOutline as DeleteIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';
import CommentSection from './CommentSection';
import LikesModal from './LikesModal';

// Format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'recently';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Auto-parse hashtags into clickable spans
const renderTextWithHashtags = (text, onTagClick) => {
  if (!text) return null;
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span
          key={index}
          className="post-hashtag"
          onClick={() => onTagClick && onTagClick(part)}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

const PostCard = ({ post, onPostDeleted, onTagClick }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || (post.likes ? post.likes.length : 0));
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || (post.comments ? post.comments.length : 0));
  const [showComments, setShowComments] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Handle Like Toggle with optimistic UI
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likesCount;

    // Optimistic state update
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const res = await postAPI.toggleLike(currentPost._id);
      if (res.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
        setCurrentPost((prev) => ({
          ...prev,
          likes: res.data.likes,
          likesCount: res.data.likesCount,
          isLikedByMe: res.data.isLiked
        }));
      }
    } catch (err) {
      // Rollback on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error('Error toggling like:', err);
    }
  };

  // Handle Post Deletion
  const handleDeletePost = async () => {
    setMenuAnchorEl(null);
    try {
      const res = await postAPI.deletePost(currentPost._id);
      if (res.success) {
        if (onPostDeleted) {
          onPostDeleted(currentPost._id);
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Share post handler
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setToastMessage('Link copied to clipboard! 📋');
  };

  // Comments update callback
  const handleCommentsUpdated = (newComments, newCount) => {
    setCommentsCount(newCount);
    setCurrentPost((prev) => ({
      ...prev,
      comments: newComments,
      commentsCount: newCount
    }));
  };

  const isPostOwner = user && (user.id === currentPost.user || user._id === currentPost.user);

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-user-info" onClick={() => onTagClick && onTagClick(currentPost.username)}>
          <Avatar
            src={
              currentPost.userAvatar ||
              `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentPost.username}`
            }
            alt={currentPost.name}
            className="post-avatar"
          />
          <div>
            <div className="post-author-name">
              <span>{currentPost.name}</span>
              {currentPost.tag && (
                <span
                  className="post-tag-badge"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTagClick) onTagClick(currentPost.tag);
                  }}
                >
                  {currentPost.tag}
                </span>
              )}
            </div>
            <div className="post-author-handle">
              @{currentPost.username} • {formatTimeAgo(currentPost.createdAt)}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div>
          <IconButton size="small" onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
            <MoreIcon fontSize="small" sx={{ color: 'var(--text-muted)' }} />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                minWidth: 140,
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)'
              }
            }}
          >
            <MenuItem onClick={handleShare} sx={{ fontSize: '13px', gap: 1 }}>
              <ShareIcon fontSize="small" /> Share Link
            </MenuItem>
            {isPostOwner && (
              <MenuItem onClick={handleDeletePost} sx={{ fontSize: '13px', color: '#ef4444', gap: 1 }}>
                <DeleteIcon fontSize="small" /> Delete Post
              </MenuItem>
            )}
          </Menu>
        </div>
      </div>

      {/* Post Body */}
      <div className="post-body">
        {currentPost.text && (
          <p className="post-text">{renderTextWithHashtags(currentPost.text, onTagClick)}</p>
        )}

        {/* Post Image Media */}
        {currentPost.image && (
          <div className="post-media-wrapper">
            <img
              src={currentPost.image}
              alt="Post media"
              className="post-image"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Post Action Bar */}
      <div className="post-actions">
        <div className="action-btn-group">
          {/* Like Button */}
          <button
            type="button"
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeToggle}
          >
            {isLiked ? (
              <FavoriteIcon className="heart-icon" sx={{ color: '#e11d48', fontSize: 20 }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 20 }} />
            )}
            <span
              onClick={(e) => {
                if (likesCount > 0) {
                  e.stopPropagation();
                  setShowLikesModal(true);
                }
              }}
              style={{ textDecoration: likesCount > 0 ? 'underline dotted' : 'none' }}
              title="View people who liked"
            >
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </span>
          </button>

          {/* Comment Button */}
          <button
            type="button"
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <CommentIcon sx={{ fontSize: 20 }} />
            <span>
              {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
            </span>
          </button>
        </div>

        {/* Share Button */}
        <Tooltip title="Share Post">
          <IconButton size="small" onClick={handleShare} sx={{ color: 'var(--text-secondary)' }}>
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <CommentSection post={currentPost} onCommentsUpdated={handleCommentsUpdated} />
      )}

      {/* Likers List Modal */}
      <LikesModal
        open={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={currentPost.likes || []}
      />

      {/* Feedback Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PostCard;
