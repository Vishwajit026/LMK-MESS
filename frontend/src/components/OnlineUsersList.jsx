import React from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export const OnlineUsersList = () => {
  const { user } = useAuth();
  const {
    activeRoom,
    onlineUsers,
    isOnlineDrawerOpen,
    setIsOnlineDrawerOpen,
    startDirectMessage
  } = useChat();

  const roomMembers = onlineUsers.roomUsers || [];
  const globalMembers = onlineUsers.globalUsers || [];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOnlineDrawerOpen && (
        <div
          className="online-backdrop mobile-only"
          onClick={() => setIsOnlineDrawerOpen(false)}
        />
      )}

      <aside className={`online-sidebar ${isOnlineDrawerOpen ? 'open' : ''}`}>
        <div className="online-header">
          <div className="online-header-title">
            <span className="online-title-text">Online Members</span>
            <span className="online-count-badge">{roomMembers.length} in room</span>
          </div>
          <button
            className="btn-close-online mobile-only"
            onClick={() => setIsOnlineDrawerOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="online-scroll-list">
          {/* Active in Current Room */}
          <div className="online-section">
            <div className="online-section-header">
              <span>IN THIS ROOM — #{activeRoom?.name || 'chat'}</span>
            </div>

            {roomMembers.length === 0 ? (
              <div className="empty-online-notice">No other members in this room right now</div>
            ) : (
              roomMembers.map((member, idx) => {
                const isCurrentUser = user && member.username === user.username;

                return (
                  <div key={member.socketId || idx} className="online-user-item">
                    <div className="user-avatar-wrap">
                      <img
                        src={
                          member.avatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                            member.username
                          )}`
                        }
                        alt={member.username}
                        className="user-avatar"
                      />
                      <span className={`status-indicator ${member.status || 'online'}`}></span>
                    </div>

                    <div className="online-user-info">
                      <div className="user-name-line">
                        <span className="online-user-name">
                          {member.username} {isCurrentUser && '(You)'}
                        </span>
                        {member.isGuest && <span className="badge-guest-pill">GUEST</span>}
                      </div>
                      <span className="online-user-status">
                        {member.status === 'away'
                          ? '🟡 Away'
                          : member.status === 'busy'
                          ? '🔴 Do Not Disturb'
                          : '🟢 Active Now'}
                      </span>
                    </div>

                    {/* Direct Message Action */}
                    {!isCurrentUser && user && (
                      <button
                        className="btn-dm-action"
                        onClick={() => startDirectMessage(member.username)}
                        title={`Direct message @${member.username}`}
                      >
                        💬
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* All Server Online Members */}
          <div className="online-section">
            <div className="online-section-header">
              <span>GLOBAL ONLINE ({globalMembers.length})</span>
            </div>

            {globalMembers.map((member, idx) => {
              const isCurrentUser = user && member.username === user.username;

              return (
                <div key={member.socketId || `global-${idx}`} className="online-user-item">
                  <div className="user-avatar-wrap">
                    <img
                      src={
                        member.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          member.username
                        )}`
                      }
                      alt={member.username}
                      className="user-avatar"
                    />
                    <span className={`status-indicator ${member.status || 'online'}`}></span>
                  </div>

                  <div className="online-user-info">
                    <div className="user-name-line">
                      <span className="online-user-name">{member.username}</span>
                      {isCurrentUser && <span className="badge-you">YOU</span>}
                    </div>
                    <span className="online-user-status">
                      #{member.currentRoom || 'general'}
                    </span>
                  </div>

                  {!isCurrentUser && user && (
                    <button
                      className="btn-dm-action"
                      onClick={() => startDirectMessage(member.username)}
                      title={`Direct message @${member.username}`}
                    >
                      💬
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};
