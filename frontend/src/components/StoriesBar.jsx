import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const sampleStories = [
  {
    name: 'Aarav',
    username: 'aarav_sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    active: true
  },
  {
    name: 'Priya',
    username: 'priya_tech',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    active: true
  },
  {
    name: 'Rohan',
    username: 'rohan_v',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    active: true
  },
  {
    name: 'Sneha',
    username: 'sneha_creates',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    active: true
  },
  {
    name: 'Devika',
    username: 'devika_design',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    active: true
  },
  {
    name: 'Kabir',
    username: 'kabir_code',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    active: true
  }
];

const StoriesBar = ({ onSelectCreator, selectedCreator, onOpenCreateModal }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  return (
    <div className="stories-container">
      {/* My Story / Add Story */}
      <div
        className="story-item"
        onClick={() => {
          if (!isAuthenticated) {
            openAuthModal('login');
          } else {
            onOpenCreateModal();
          }
        }}
      >
        <div style={{ position: 'relative', width: 54, height: 54 }}>
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=guest'}
            alt="Your Story"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px dashed #2563eb'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#2563eb',
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <AddIcon style={{ fontSize: 13 }} />
          </div>
        </div>
        <span className="story-username">Your Story</span>
      </div>

      {/* Community Creators Stories */}
      {sampleStories.map((story, idx) => {
        const isSelected = selectedCreator === story.username;
        return (
          <div
            key={idx}
            className="story-item"
            onClick={() => onSelectCreator(isSelected ? '' : story.username)}
          >
            <div
              className="story-avatar-wrapper"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)'
                  : 'var(--story-gradient)',
                transform: isSelected ? 'scale(1.08)' : 'none'
              }}
            >
              <img src={story.avatar} alt={story.name} className="story-avatar" />
            </div>
            <span
              className="story-username"
              style={{
                color: isSelected ? 'var(--primary-600)' : 'inherit',
                fontWeight: isSelected ? 700 : 500
              }}
            >
              {story.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StoriesBar;
