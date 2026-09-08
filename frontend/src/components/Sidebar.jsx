import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ onOpenCreateRoom, onOpenAuth }) => {
  const {
    rooms,
    activeRoom,
    switchRoom,
    unreadCounts,
    isSidebarOpen,
    setIsSidebarOpen
  } = useChat();
  const { user, updateStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'rooms' | 'direct'

  // Filter rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'rooms') return !room.isDirect;
    if (activeTab === 'direct') return room.isDirect;
    return true;
  });

  const publicRooms = filteredRooms.filter((r) => !r.isDirect);
  const directMessages = filteredRooms.filter((r) => r.isDirect);

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="sidebar-backdrop mobile-only"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header & Search */}
        <div className="sidebar-header">
          <div className="sidebar-title-row">
            <span className="sidebar-section-title">Rooms & Channels</span>
            <button
              className="btn-create-icon"
              onClick={onOpenCreateRoom}
              title="Create new room"
            >
              +
            </button>
          </div>

          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search rooms or chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>

          {/* Tab Filter */}
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({rooms.length})
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              Rooms
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'direct' ? 'active' : ''}`}
              onClick={() => setActiveTab('direct')}
            >
              Direct
            </button>
          </div>
        </div>

        {/* Room List Scrollable */}
        <div className="rooms-scroll-container">
          {/* Public / Group Channels */}
          {(activeTab === 'all' || activeTab === 'rooms') && (
            <div className="room-category-group">
              <div className="category-header">
                <span>PUBLIC ROOMS ({publicRooms.length})</span>
              </div>
              {publicRooms.length === 0 ? (
                <div className="empty-rooms-hint">No matching rooms found</div>
              ) : (
                publicRooms.map((room) => {
                  const isActive = activeRoom?.slug === room.slug;
                  const unread = unreadCounts[room.slug] || 0;

                  return (
                    <div
                      key={room._id || room.slug}
                      className={`room-item ${isActive ? 'active' : ''}`}
                      onClick={() => switchRoom(room.slug)}
                    >
                      <div className="room-icon-wrapper">
                        <span className="room-icon">{room.icon || '💬'}</span>
                      </div>
                      <div className="room-details">
                        <div className="room-name-row">
                          <span className="room-name">#{room.name}</span>
                          {room.lastMessage?.timestamp && (
                            <span className="room-time">
                              {new Date(room.lastMessage.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        <div className="room-snippet-row">
                          <span className="room-snippet">
                            {room.lastMessage?.text || room.description || 'Tap to join chat...'}
                          </span>
                          {unread > 0 && <span className="unread-badge">{unread}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Direct Messages */}
          {(activeTab === 'all' || activeTab === 'direct') && directMessages.length > 0 && (
            <div className="room-category-group">
              <div className="category-header">
                <span>DIRECT MESSAGES ({directMessages.length})</span>
              </div>
              {directMessages.map((dm) => {
                const isActive = activeRoom?.slug === dm.slug;
                const unread = unreadCounts[dm.slug] || 0;

                return (
                  <div
                    key={dm._id || dm.slug}
                    className={`room-item dm-item ${isActive ? 'active' : ''}`}
                    onClick={() => switchRoom(dm.slug)}
                  >
                    <div className="room-icon-wrapper dm-icon">
                      <span>👤</span>
                    </div>
                    <div className="room-details">
                      <div className="room-name-row">
                        <span className="room-name">{dm.name}</span>
                      </div>
                      <div className="room-snippet-row">
                        <span className="room-snippet">
                          {dm.lastMessage?.text || 'Direct message thread'}
                        </span>
                        {unread > 0 && <span className="unread-badge">{unread}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer / User Profile Panel */}
        <div className="sidebar-footer">
          {user ? (
            <div className="current-user-card">
              <div className="user-avatar-wrap">
                <img src={user.avatar} alt={user.username} className="user-avatar" />
                <span className={`status-indicator ${user.status || 'online'}`}></span>
              </div>
              <div className="current-user-info">
                <span className="current-user-name">{user.username}</span>
                <div className="status-selector-row">
                  <select
                    className="status-select"
                    value={user.status || 'online'}
                    onChange={(e) => updateStatus(e.target.value)}
                  >
                    <option value="online">🟢 Online</option>
                    <option value="away">🟡 Away</option>
                    <option value="busy">🔴 Busy</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary full-width" onClick={onOpenAuth}>
              🚀 Join / Login to Chat
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
