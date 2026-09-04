import React from 'react';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Whatshot as TrendingIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const BottomNav = ({ onOpenCreateModal, activeTab, setActiveTab }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
    } else {
      setActiveTab('profile');
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <HomeIcon fontSize="small" />
        <span>Feed</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'explore' ? 'active' : ''}`}
        onClick={() => setActiveTab('explore')}
      >
        <TrendingIcon fontSize="small" />
        <span>Trending</span>
      </button>

      {/* Floating Center Action Button */}
      <button
        type="button"
        className="bottom-nav-create-btn"
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal('login');
          } else {
            onOpenCreateModal();
          }
        }}
        title="Create New Post"
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => setActiveTab('search')}
      >
        <SearchIcon fontSize="small" />
        <span>Search</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={handleProfileClick}
      >
        <PersonIcon fontSize="small" />
        <span>{isAuthenticated ? 'Profile' : 'Sign In'}</span>
      </button>
    </nav>
  );
};

export default BottomNav;
