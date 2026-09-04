import React from 'react';
import { Typography, Box, Avatar, Button } from '@mui/material';
import { Whatshot as TrendingIcon, Stars as StarIcon } from '@mui/icons-material';

const trendingTopics = [
  { tag: '#TaskPlanet', posts: '1.4k posts' },
  { tag: '#Launch2026', posts: '890 posts' },
  { tag: '#ReactJS', posts: '640 posts' },
  { tag: '#WebDev', posts: '520 posts' },
  { tag: '#Community', posts: '380 posts' },
  { tag: '#Milestone', posts: '210 posts' }
];

const topCreators = [
  {
    name: 'Aarav Sharma',
    username: 'aarav_sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'Lead Creator'
  },
  {
    name: 'Priya Patel',
    username: 'priya_tech',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'Top Contributor'
  },
  {
    name: 'Sneha Reddy',
    username: 'sneha_creates',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    role: 'Design Lead'
  }
];

const SidebarRight = ({ onTagClick }) => {
  return (
    <aside className="sidebar-right">
      {/* Trending Topics Card */}
      <div className="sidebar-card">
        <Typography className="sidebar-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingIcon sx={{ color: '#f43f5e', fontSize: 18 }} /> Trending Topics
          </span>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {trendingTopics.map((topic, idx) => (
            <div
              key={idx}
              className="trending-topic-item"
              onClick={() => onTagClick && onTagClick(topic.tag)}
            >
              <div>
                <div className="topic-tag">{topic.tag}</div>
                <div className="topic-count">{topic.posts}</div>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🔥</span>
            </div>
          ))}
        </Box>
      </div>

      {/* Suggested Creators */}
      <div className="sidebar-card">
        <Typography className="sidebar-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} /> Top Contributors
          </span>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {topCreators.map((creator, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
                onClick={() => onTagClick && onTagClick(creator.username)}
              >
                <Avatar
                  src={creator.avatar}
                  alt={creator.name}
                  sx={{ width: 36, height: 36, border: '1px solid var(--border-light)' }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>
                    {creator.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    @{creator.username}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => onTagClick && onTagClick(creator.username)}
                sx={{
                  borderRadius: '999px',
                  textTransform: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  py: 0.3,
                  px: 1.2,
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-secondary)'
                }}
              >
                View
              </Button>
            </Box>
          ))}
        </Box>
      </div>
    </aside>
  );
};

export default SidebarRight;
