import React from 'react';
import { Avatar, Typography, Box, Button, Divider } from '@mui/material';
import {
  DynamicFeed as FeedIcon,
  Explore as ExploreIcon,
  BookmarkBorder as BookmarkIcon,
  PeopleAltOutlined as CommunityIcon,
  EmojiEventsOutlined as TasksIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const SidebarLeft = ({ activeCategory, setActiveCategory, onOpenCreateModal }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const navItems = [
    { label: 'Community Feed', icon: <FeedIcon fontSize="small" />, tag: 'all' },
    { label: '#MiniSocial', icon: <ExploreIcon fontSize="small" />, tag: '#MiniSocial' },
    { label: '#tech & code', icon: <CommunityIcon fontSize="small" />, tag: '#tech' },
    { label: '#milestones', icon: <TasksIcon fontSize="small" />, tag: '#milestone' },
    { label: '#lifestyle', icon: <BookmarkIcon fontSize="small" />, tag: '#lifestyle' }
  ];

  return (
    <aside className="sidebar-left">
      {/* Profile Card */}
      <div className="sidebar-card">
        {isAuthenticated ? (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                margin: '0 auto 12px auto',
                padding: '3px',
                borderRadius: '50%',
                background: 'var(--story-gradient)'
              }}
            >
              <Avatar
                src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`}
                alt={user?.name}
                sx={{ width: '100%', height: '100%', border: '2px solid var(--bg-card)' }}
              />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', display: 'block', mb: 1 }}>
              @{user?.username}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                mb: 2,
                px: 1
              }}
            >
              {user?.bio || 'Mini-Social Creator 🚀'}
            </Typography>

            <Divider sx={{ my: 1.5, borderColor: 'var(--border-light)' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 0.5 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '15px' }}>
                  248
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Followers
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '15px' }}>
                  182
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  Following
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                margin: '0 auto 12px auto',
                borderRadius: '50%',
                background: 'var(--primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              🪐
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Join Mini-Social
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '12.5px', my: 1 }}>
              Create an account to post updates, like posts, and connect with other users!
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={() => openAuthModal('signup')}
              sx={{
                mt: 1,
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 700,
                background: 'var(--primary-gradient)'
              }}
            >
              Get Started
            </Button>
          </Box>
        )}
      </div>

      {/* Navigation Channels */}
      <div className="sidebar-card">
        <Typography className="sidebar-title">Feeds & Topics</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item, idx) => {
            const isActive = activeCategory === item.tag;
            return (
              <Box
                key={idx}
                onClick={() => setActiveCategory(item.tag)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13.5px',
                  backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                  color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                  '&:hover': {
                    backgroundColor: isActive ? 'var(--primary-50)' : 'var(--bg-subtle)'
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Box>
            );
          })}
        </Box>
      </div>
    </aside>
  );
};

export default SidebarLeft;
