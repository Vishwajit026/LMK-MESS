import React, { useState, useEffect, useCallback } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Button,
  CircularProgress,
  Typography,
  Chip,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Close as ClearIcon
} from '@mui/icons-material';

import { useAuth } from './context/AuthContext';
import { postAPI } from './services/api';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import StoriesBar from './components/StoriesBar';
import CreatePostCard from './components/CreatePostCard';
import CreatePostModal from './components/CreatePostModal';
import PostCard from './components/PostCard';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import AuthModal from './components/AuthModal';

const App = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('taskplanet_theme') === 'dark';
  });

  // Filter & Feed state
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('feed');

  // Sync dark mode preference with HTML attribute & localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('taskplanet_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('taskplanet_theme', 'light');
    }
  }, [darkMode]);

  // MUI Theme definition
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb'
      },
      background: {
        default: darkMode ? '#0b0f19' : '#f1f5f9',
        paper: darkMode ? '#151d2f' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#f8fafc' : '#0f172a',
        secondary: darkMode ? '#cbd5e1' : '#475569'
      }
    },
    typography: {
      fontFamily: `'Plus Jakarta Sans', 'Inter', sans-serif`
    }
  });

  // Fetch posts from backend API
  const fetchPosts = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (pageToLoad === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = {
          page: pageToLoad,
          limit: 6
        };

        if (activeCategory && activeCategory !== 'all') {
          params.tag = activeCategory;
        }

        if (selectedCreator) {
          params.username = selectedCreator;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await postAPI.getPosts(params);

        if (res.success) {
          if (append) {
            setPosts((prev) => [...prev, ...res.data]);
          } else {
            setPosts(res.data);
          }
          setPage(res.pagination.page);
          setHasMore(res.pagination.hasMore);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, selectedCreator, searchQuery]
  );

  // Trigger reload on filter change
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Handle new post creation (prepend to feed)
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Handle post deletion (remove from feed)
  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  // Handle tag click anywhere in the UI
  const handleTagClick = (tagOrUsername) => {
    if (tagOrUsername.startsWith('#')) {
      setActiveCategory(tagOrUsername);
      setSelectedCreator('');
    } else {
      setSelectedCreator(tagOrUsername);
      setActiveCategory('all');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setSelectedCreator('');
    setSearchQuery('');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-layout">
        {/* Top Header */}
        <Header
          onOpenCreateModal={() => {
            if (!isAuthenticated) openAuthModal('login');
            else setCreateModalOpen(true);
          }}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main 3-Column Container */}
        <main className="main-content-container">
          {/* Left Sidebar: Navigation & Profile Stats */}
          <SidebarLeft
            activeCategory={activeCategory}
            setActiveCategory={(cat) => {
              setActiveCategory(cat);
              setSelectedCreator('');
            }}
            onOpenCreateModal={() => {
              if (!isAuthenticated) openAuthModal('login');
              else setCreateModalOpen(true);
            }}
          />

          {/* Center Column: Social Feed */}
          <section className="feed-column">
            {/* TaskPlanet Active Community Stories Reel */}
            <StoriesBar
              selectedCreator={selectedCreator}
              onSelectCreator={(creator) => {
                setSelectedCreator(creator);
                setActiveCategory('all');
              }}
              onOpenCreateModal={() => {
                if (!isAuthenticated) openAuthModal('login');
                else setCreateModalOpen(true);
              }}
            />

            {/* Create Post Inline Card (Desktop/Tablet) */}
            <CreatePostCard onPostCreated={handlePostCreated} />

            {/* Active Filter Indicator Bar */}
            {(activeCategory !== 'all' || selectedCreator || searchQuery) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <FilterIcon fontSize="small" sx={{ color: 'var(--primary-600)' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    Filtering by:
                  </Typography>
                  {activeCategory !== 'all' && (
                    <Chip
                      label={activeCategory}
                      size="small"
                      color="primary"
                      onDelete={() => setActiveCategory('all')}
                    />
                  )}
                  {selectedCreator && (
                    <Chip
                      label={`@${selectedCreator}`}
                      size="small"
                      color="secondary"
                      onDelete={() => setSelectedCreator('')}
                    />
                  )}
                  {searchQuery && (
                    <Chip
                      label={`"${searchQuery}"`}
                      size="small"
                      onDelete={() => setSearchQuery('')}
                    />
                  )}
                </Box>
                <Button
                  size="small"
                  onClick={handleClearFilters}
                  sx={{ textTransform: 'none', fontSize: '12px', fontWeight: 600 }}
                >
                  Clear All
                </Button>
              </Box>
            )}

            {/* Feed Loading Skeletons */}
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    className="post-card"
                    sx={{ p: 2.5, minHeight: 180, display: 'flex', flexDirection: 'column', gap: 1.5 }}
                  >
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <div className="loading-skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <div className="loading-skeleton" style={{ width: '40%', height: 14, marginBottom: 6 }} />
                        <div className="loading-skeleton" style={{ width: '25%', height: 11 }} />
                      </div>
                    </Box>
                    <div className="loading-skeleton" style={{ width: '100%', height: 50 }} />
                    <div className="loading-skeleton" style={{ width: '100%', height: 140, borderRadius: 8 }} />
                  </Box>
                ))}
              </Box>
            ) : posts.length > 0 ? (
              /* Feed Posts */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onTagClick={handleTagClick}
                  />
                ))}

                {/* Pagination / Load More Button */}
                {hasMore && (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Button
                      variant="outlined"
                      disabled={loadingMore}
                      onClick={() => fetchPosts(page + 1, true)}
                      startIcon={loadingMore ? <CircularProgress size={16} /> : <RefreshIcon />}
                      sx={{
                        borderRadius: '999px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 4,
                        py: 1,
                        borderColor: 'var(--primary-500)',
                        color: 'var(--primary-600)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      {loadingMore ? 'Loading More Posts...' : 'Load More Posts'}
                    </Button>
                  </Box>
                )}
              </div>
            ) : (
              /* Empty State */
              <Box
                className="post-card"
                sx={{
                  p: 6,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <div style={{ fontSize: '48px' }}>🪐</div>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  No posts found
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', maxWidth: 360 }}>
                  {activeCategory !== 'all' || selectedCreator || searchQuery
                    ? 'No posts matched your current filter criteria. Try clearing filters or searching for something else.'
                    : 'Be the first one to share a post with the TaskPlanet community!'}
                </Typography>
                {(activeCategory !== 'all' || selectedCreator || searchQuery) && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleClearFilters}
                    sx={{
                      mt: 1,
                      borderRadius: '999px',
                      textTransform: 'none',
                      background: 'var(--primary-gradient)'
                    }}
                  >
                    Show All Posts
                  </Button>
                )}
              </Box>
            )}
          </section>

          {/* Right Sidebar: Trending Topics & Top Contributors */}
          <SidebarRight onTagClick={handleTagClick} />
        </main>

        {/* TaskPlanet App Mobile Bottom Navigation */}
        <BottomNav
          onOpenCreateModal={() => setCreateModalOpen(true)}
          activeTab={mobileTab}
          setActiveTab={(tab) => {
            setMobileTab(tab);
            if (tab === 'feed') handleClearFilters();
            if (tab === 'explore') setActiveCategory('#TaskPlanet');
          }}
        />

        {/* Create Post Dialog (Mobile Floating / Top Button) */}
        <CreatePostModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />

        {/* Sign In & Registration Modal */}
        <AuthModal />
      </div>
    </ThemeProvider>
  );
};

export default App;
