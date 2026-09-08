import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export const Navbar = ({ onOpenAuth, onOpenCreateRoom }) => {
  const { user, logout, updateStatus } = useAuth();
  const {
    activeRoom,
    onlineUsers,
    theme,
    toggleTheme,
    soundEnabled,
    toggleSound,
    isSidebarOpen,
    setIsSidebarOpen,
    isOnlineDrawerOpen,
    setIsOnlineDrawerOpen
  } = useChat();

  const totalOnline = onlineUsers.globalUsers?.length || 1;
  const roomOnline = onlineUsers.roomUsers?.length || 1;

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Mobile menu toggle */}
        <button
          className="icon-btn mobile-only menu-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Channels"
          aria-label="Toggle Channels"
        >
          <span className="hamburger-icon"></span>
        </button>

        {/* Brand */}
        <div className="brand-badge">
          <div className="brand-logo-icon">⚡</div>
          <div className="brand-text">
            <span className="brand-name">LMK MESS</span>
            <span className="brand-tag">Real-Time</span>
          </div>
        </div>

        {/* Active room indicator (Desktop) */}
        {activeRoom && (
          <div className="nav-room-badge desktop-only">
            <span className="nav-room-icon">{activeRoom.icon || '💬'}</span>
            <span className="nav-room-name">#{activeRoom.name}</span>
            <span className="nav-room-topic">{activeRoom.topic || 'General Chat'}</span>
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Live Server Pulse */}
        <div className="online-pill" onClick={() => setIsOnlineDrawerOpen(!isOnlineDrawerOpen)}>
          <span className="pulse-dot"></span>
          <span className="online-text">
            <strong>{roomOnline}</strong> in room • <strong>{totalOnline}</strong> online
          </span>
        </div>

        {/* Sound Toggle */}
        <button
          className="icon-btn"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Sounds' : 'Enable Notification Sounds'}
          aria-label="Sound Toggle"
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Theme Toggle"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Create Room shortcut */}
        <button
          className="btn btn-secondary desktop-only"
          onClick={onOpenCreateRoom}
          title="Create New Channel"
        >
          <span>+</span> Room
        </button>

        {/* User Auth Profile / Login */}
        {user ? (
          <div className="nav-user-dropdown">
            <div className="user-avatar-wrap">
              <img src={user.avatar} alt={user.username} className="user-avatar" />
              <span className={`status-indicator ${user.status || 'online'}`}></span>
            </div>
            <div className="user-info desktop-only">
              <span className="nav-username">{user.username}</span>
              {user.isGuest && <span className="badge-guest">GUEST</span>}
            </div>
            <button className="btn-logout" onClick={logout} title="Sign Out">
              🚪
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={onOpenAuth}>
            🚀 Join / Login
          </button>
        )}

        {/* Online Drawer Toggle (Mobile) */}
        <button
          className="icon-btn mobile-only"
          onClick={() => setIsOnlineDrawerOpen(!isOnlineDrawerOpen)}
          title="View Online Members"
        >
          👥
        </button>
      </div>
    </header>
  );
};
