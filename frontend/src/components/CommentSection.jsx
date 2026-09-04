import React, { useState } from 'react';
import {
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';

// Format relative time helper
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

const CommentSection = ({ post, onCommentsUpdated }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await postAPI.addComment(post._id, { text: commentText.trim() });
      if (res.success) {
        setCommentText('');
        if (onCommentsUpdated) {
          onCommentsUpdated(res.data.comments, res.data.commentsCount);
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingId(commentId);
    try {
      const res = await postAPI.deleteComment(post._id, commentId);
      if (res.success) {
        if (onCommentsUpdated) {
          onCommentsUpdated(res.data.comments, res.data.commentsCount);
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const comments = post.comments || [];

  return (
    <div className="comments-drawer">
      {/* List of comments */}
      {comments.length > 0 ? (
        comments.map((comment) => {
          const isMyComment = user && (user.id === comment.userId || user._id === comment.userId);
          const isPostOwner = user && (user.id === post.user || user._id === post.user);
          const canDelete = isMyComment || isPostOwner;

          return (
            <div key={comment._id || comment.createdAt} className="comment-item">
              <Avatar
                src={
                  comment.userAvatar ||
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.username}`
                }
                alt={comment.name}
                sx={{ width: 32, height: 32, mt: 0.5 }}
              />
              <div className="comment-bubble">
                <div className="comment-author-row">
                  <span className="comment-author">{comment.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
                    {canDelete && (
                      <Tooltip title="Delete Comment">
                        <IconButton
                          size="small"
                          disabled={deletingId === comment._id}
                          onClick={() => handleDeleteComment(comment._id)}
                          sx={{ p: 0.3, color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                        >
                          {deletingId === comment._id ? (
                            <CircularProgress size={12} />
                          ) : (
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </div>
          );
        })
      ) : (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: '6px 0' }}>
          No comments yet. Be the first to start the conversation! 💬
        </p>
      )}

      {/* Comment Input row */}
      <form onSubmit={handleAddComment} className="comment-input-row">
        <Avatar
          src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
          alt={user?.name || 'User'}
          sx={{ width: 32, height: 32 }}
        />
        <input
          type="text"
          className="comment-input"
          placeholder={
            isAuthenticated
              ? 'Write a comment...'
              : 'Sign in to leave a comment...'
          }
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onClick={() => {
            if (!isAuthenticated) openAuthModal('login');
          }}
        />
        <IconButton
          type="submit"
          disabled={submitting || !commentText.trim()}
          sx={{
            background: 'var(--primary-gradient)',
            color: '#ffffff',
            p: 1,
            '&:hover': { background: '#1d4ed8' },
            '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8' }
          }}
        >
          {submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </form>
    </div>
  );
};

export default CommentSection;
