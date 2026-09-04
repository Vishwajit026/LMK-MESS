import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import CreatePostCard from './CreatePostCard';

const CreatePostModal = ({ open, onClose, onPostCreated }) => {
  const handlePostCreated = (post) => {
    if (onPostCreated) onPostCreated(post);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Create New Post
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-muted)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <CreatePostCard onPostCreated={handlePostCreated} />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
