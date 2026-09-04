import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  NotificationsNone as NotificationsIcon,
  AccountCircle as ProfileIcon,
  Logout as LogoutIcon,
  Explore as ExploreIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Header = ({ onOpenCreateModal, darkMode, setDarkMode, searchQuery, setSearchQuery }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: darkMode ? '#151d2f' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`,
        color: darkMode ? '#f8fafc' : '#0f172a',
        zIndex: 1100
      }}
    >
      <Toolbar sx={{ maxWidth: 1240, width: '100%', margin: '0 auto', px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Box sx={{ display: 'flex', align: 'center', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '20px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
            }}
          >
            🪐
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                lineHeight: 1.1,
                fontSize: { xs: '18px', sm: '20px' }
              }}
            >
              Mini-Social
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: darkMode ? '#94a3b8' : '#64748b'
              }}
            >
              Social Feed
            </Typography>
          </Box>
        </Box>

        {/* Search Bar (Desktop) */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
            borderRadius: '999px',
            px: 2,
            py: 0.5,
            width: { sm: 240, md: 340 },
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`
          }}
        >
          <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search posts, tags, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              fontSize: '13.5px',
              color: darkMode ? '#f8fafc' : '#0f172a',
              width: '100%'
            }}
          />
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/* Dark / Light Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              size="small"
              sx={{ color: darkMode ? '#f8fafc' : '#475569' }}
            >
              {darkMode ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              {/* Create Post Button (Desktop) */}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onOpenCreateModal}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '999px',
                  px: 2.5,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)'
                  }
                }}
              >
                Create Post
              </Button>

              {/* User Profile Avatar Dropdown */}
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '999px',
                  transition: 'background 0.2s',
                  '&:hover': { background: darkMode ? '#1e293b' : '#f1f5f9' }
                }}
              >
                <Avatar
                  src={user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`}
                  alt={user?.name}
                  sx={{ width: 36, height: 36, border: '2px solid #2563eb' }}
                />
                <Box sx={{ display: { xs: 'none', lg: 'block' }, textAlign: 'left', pr: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '11px' }}>
                    @{user?.username}
                  </Typography>
                </Box>
              </Box>

              {/* User Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    backgroundColor: darkMode ? '#151d2f' : '#ffffff',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                    border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}`
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5, borderColor: darkMode ? '#1e293b' : '#e2e8f0' }} />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444', fontSize: '13.5px', gap: 1 }}>
                  <LogoutIcon fontSize="small" /> Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => openAuthModal('login')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '999px',
                  px: 2,
                  borderColor: '#2563eb',
                  color: '#2563eb'
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => openAuthModal('signup')}
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '999px',
                  px: 2,
                  display: { xs: 'none', sm: 'inline-flex' }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
