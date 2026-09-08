import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { RoomInviteModal } from './RoomInviteModal';

export const ChatRoom = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const {
    activeRoom,
    messages,
    loadingMessages,
    onlineUsers,
    isOnlineDrawerOpen,
    setIsOnlineDrawerOpen,
    setIsSidebarOpen
  } = useChat();

  const [searchInRoom, setSearchInRoom] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeRoom?.slug]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages.length]);

  if (!activeRoom) {
    return (
      <div className="empty-chat-state">
        <div className="empty-chat-card">
          <div className="empty-icon">💬</div>
          <h2>Welcome to LMK MESS</h2>
          <p>Select a channel or create a new room from the sidebar to start chatting!</p>
        </div>
      </div>
    );
  }

  const displayedMessages = showSearch && searchInRoom.trim()
    ? messages.filter((m) =>
        m.text?.toLowerCase().includes(searchInRoom.toLowerCase()) ||
        m.sender?.username?.toLowerCase().includes(searchInRoom.toLowerCase())
      )
    : messages;

  const roomOnlineCount = onlineUsers.roomUsers?.length || 1;

  const formatDateDivider = (dateString) => {
    if (!dateString) return 'Today';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="chat-room-container">
      {/* Chat Room Top Bar */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button
            className="icon-btn mobile-only"
            onClick={() => setIsSidebarOpen(true)}
            title="Open Channels"
          >
            ☰
          </button>

          <div className="chat-room-title-block">
            <div className="chat-room-name-row">
              <span className="chat-room-emoji">{activeRoom.icon || '💬'}</span>
              <h1 className="chat-room-name">#{activeRoom.name}</h1>
              {activeRoom.isDirect && <span className="badge-direct">DIRECT</span>}
              {activeRoom.isProtected && <span className="badge-protected" title="Password Protected">🔒 LOCKED</span>}
            </div>
            <p className="chat-room-topic">{activeRoom.topic || activeRoom.description}</p>
          </div>
        </div>

        <div className="chat-header-actions">
          {/* Invite / Share Button */}
          <button
            className="btn btn-secondary btn-sm invite-btn"
            onClick={() => setShowInviteModal(true)}
            title="Invite Friends to this room"
          >
            <span>🔗</span> <span className="desktop-only">Invite</span>
          </button>

          {/* Search Toggle */}
          <button
            className={`icon-btn ${showSearch ? 'active' : ''}`}
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchInRoom('');
            }}
            title="Search Messages"
          >
            🔍
          </button>

          {/* Members Toggle */}
          <button
            className={`online-count-pill-btn ${isOnlineDrawerOpen ? 'active' : ''}`}
            onClick={() => setIsOnlineDrawerOpen(!isOnlineDrawerOpen)}
            title="View Online Members"
          >
            <span className="pulse-dot"></span>
            <span>{roomOnlineCount} Online</span>
          </button>
        </div>
      </div>

      {/* In-Room Search Bar */}
      {showSearch && (
        <div className="in-room-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder={`Search messages in #${activeRoom.name}...`}
            value={searchInRoom}
            onChange={(e) => setSearchInRoom(e.target.value)}
            autoFocus
            className="in-room-search-input"
          />
          {searchInRoom && (
            <span className="search-match-count">
              {displayedMessages.length} results
            </span>
          )}
          <button
            className="search-close-btn"
            onClick={() => {
              setShowSearch(false);
              setSearchInRoom('');
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="messages-viewport" ref={scrollContainerRef}>
        {/* Welcome Header Banner */}
        <div className="room-welcome-hero">
          <div className="hero-icon-bubble">{activeRoom.icon || '💬'}</div>
          <h2 className="hero-title">Welcome to #{activeRoom.name}!</h2>
          <p className="hero-desc">
            {activeRoom.description || `This is the start of the #${activeRoom.name} channel.`}
          </p>
          <div className="hero-badges">
            <span className="hero-tag">🔒 Real-Time Sockets</span>
            <span className="hero-tag">💾 Persistent History</span>
            {activeRoom.inviteCode && (
              <span className="hero-tag hero-tag-code" onClick={() => setShowInviteModal(true)}>
                🔑 Invite Code: <strong>{activeRoom.inviteCode}</strong> (Click to copy)
              </span>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loadingMessages ? (
          <div className="messages-loading">
            <div className="chat-spinner"></div>
            <span>Loading message history...</span>
          </div>
        ) : displayedMessages.length === 0 ? (
          <div className="no-messages-hint">
            {showSearch ? 'No messages match your search query.' : 'No messages yet. Say hi to kick off the conversation! 👋'}
          </div>
        ) : (
          displayedMessages.map((message, index) => {
            const prevMsg = displayedMessages[index - 1];
            const showDateDivider =
              !prevMsg ||
              new Date(prevMsg.createdAt).toDateString() !==
                new Date(message.createdAt).toDateString();

            return (
              <React.Fragment key={message._id || `msg-${index}`}>
                {showDateDivider && (
                  <div className="date-divider">
                    <span className="date-divider-label">
                      {formatDateDivider(message.createdAt)}
                    </span>
                  </div>
                )}
                <MessageItem
                  message={message}
                  onOpenImage={(imgUrl) => setPreviewImage(imgUrl)}
                />
              </React.Fragment>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Typing Indicator */}
      <TypingIndicator />

      {/* Message Input Bottom Bar */}
      <MessageInput onOpenAuth={onOpenAuth} />

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div className="image-lightbox-modal" onClick={() => setPreviewImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Full View" className="lightbox-img" />
            <button className="lightbox-close-btn" onClick={() => setPreviewImage(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Room Invite Modal */}
      <RoomInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        room={activeRoom}
      />
    </div>
  );
};
