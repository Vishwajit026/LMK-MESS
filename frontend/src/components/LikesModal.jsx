import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon, Favorite as FavoriteIcon } from '@mui/icons-material';

const LikesModal = ({ open, onClose, likes = [], postTitle = 'Post' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid var(--border-light)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FavoriteIcon sx={{ color: '#e11d48', fontSize: 20 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Liked by ({likes.length})
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'var(--text-muted)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, maxHeight: 380, overflowY: 'auto' }}>
        {likes.length > 0 ? (
          <List disablePadding>
            {likes.map((like, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderBottom: '1px solid var(--border-light)',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${like.username}`}
                    alt={like.name}
                    sx={{ width: 40, height: 40 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {like.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                      @{like.username}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Typography variant="body2">No likes yet. Be the first to like this post!</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LikesModal;
