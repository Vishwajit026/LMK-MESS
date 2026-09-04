import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Avatar,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Tag as TagIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SentimentSatisfiedAlt as EmojiIcon
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { postAPI } from '../services/api';

const tagsList = ['#TaskPlanet', '#general', '#tech', '#lifestyle', '#milestone', '#updates'];

const CreatePostCard = ({ onPostCreated }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [selectedTag, setSelectedTag] = useState('#TaskPlanet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  
  const fileInputRef = useRef(null);

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (tempImageUrl.trim()) {
      setImage(tempImageUrl.trim());
      setTempImageUrl('');
      setUrlModalOpen(false);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (!text.trim() && !image.trim()) {
      setError('Please add some text, an image, or both to post.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await postAPI.createPost({
        text: text.trim(),
        image: image.trim(),
        tag: selectedTag
      });

      if (res.success) {
        setText('');
        setImage('');
        setSelectedTag('#TaskPlanet');
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        if (onPostCreated) {
          onPostCreated(res.data);
        }
      } else {
        setError(res.message || 'Failed to create post');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error publishing post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      {/* Top row: Avatar & Textarea */}
      <div className="create-post-top">
        <Avatar
          src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=guest`}
          alt={user?.name || 'User'}
          sx={{ width: 44, height: 44, border: '2px solid #2563eb' }}
        />
        <div style={{ flex: 1 }}>
          <textarea
            className="create-post-textarea"
            placeholder={
              isAuthenticated
                ? `What's on your mind, ${user?.name?.split(' ')[0]}? Share an update or photo...`
                : 'Sign in to share your thoughts with the TaskPlanet community...'
            }
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            onClick={() => {
              if (!isAuthenticated) openAuthModal('login');
            }}
          />
        </div>
      </div>

      {/* Image Preview if selected */}
      {image && (
        <div className="image-preview-container">
          <img src={image} alt="Upload preview" className="image-preview-img" />
          <button
            type="button"
            className="image-remove-btn"
            onClick={handleRemoveImage}
            title="Remove Image"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <Typography
          variant="caption"
          sx={{ color: '#ef4444', fontWeight: 600, display: 'block', mt: 1 }}
        >
          ⚠️ {error}
        </Typography>
      )}

      {/* Tags Selector */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1.5 }}>
        {tagsList.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            clickable
            onClick={() => setSelectedTag(tag)}
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: selectedTag === tag ? '#2563eb' : 'var(--bg-subtle)',
              color: selectedTag === tag ? '#ffffff' : 'var(--text-secondary)',
              borderColor: selectedTag === tag ? '#2563eb' : 'var(--border-light)',
              '&:hover': {
                backgroundColor: selectedTag === tag ? '#1d4ed8' : 'var(--primary-50)'
              }
            }}
          />
        ))}
      </Box>

      {/* Toolbar row */}
      <div className="create-post-toolbar">
        <div className="media-upload-triggers">
          {/* File Upload Hidden Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="media-trigger-btn"
            onClick={() => {
              if (!isAuthenticated) return openAuthModal('login');
              fileInputRef.current?.click();
            }}
          >
            <ImageIcon sx={{ fontSize: 18, color: '#2563eb' }} />
            <span>Photo</span>
          </button>

          {/* Web Image URL */}
          <button
            type="button"
            className="media-trigger-btn"
            onClick={() => {
              if (!isAuthenticated) return openAuthModal('login');
              setUrlModalOpen(true);
            }}
          >
            <LinkIcon sx={{ fontSize: 18, color: '#10b981' }} />
            <span>Image URL</span>
          </button>
        </div>

        {/* Publish Button */}
        <Button
          variant="contained"
          disabled={loading}
          onClick={handleSubmit}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '999px',
            px: 3,
            py: 0.8,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)'
            }
          }}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>

      {/* Add Image URL Modal */}
      <Dialog
        open={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '16px' }}>Insert Image from Web</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Image URL (https://...)"
            variant="outlined"
            size="small"
            value={tempImageUrl}
            onChange={(e) => setTempImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUrlModalOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyUrl}
            sx={{
              textTransform: 'none',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
            }}
          >
            Attach Image
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreatePostCard;
