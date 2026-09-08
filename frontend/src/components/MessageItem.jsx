import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '🚀', '👏'];

export const MessageItem = ({ message, onOpenImage }) => {
  const { user } = useAuth();
  const { sendReaction, setReplyingTo } = useChat();
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isMine = user && message.sender?.username === user.username;
  const isBot = message.sender?.username?.includes('Bot') || message.sender?.username?.includes('System');

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const handleReactionClick = (emoji) => {
    sendReaction(message._id, emoji);
    setShowReactionPicker(false);
  };

  return (
    <div className={`message-item-wrapper ${isMine ? 'mine' : 'other'} ${isBot ? 'bot' : ''}`}>
      {/* Sender Avatar (only if not mine or in group mode) */}
      {!isMine && (
        <div className="message-avatar-wrap">
          <img
            src={
              message.sender?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                message.sender?.username || 'user'
              )}`
            }
            alt={message.sender?.username}
            className="message-avatar"
          />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className="message-bubble-container">
        {/* Sender Name Bar (for others) */}
        {!isMine && (
          <div className="message-sender-row">
            <span className="message-sender-name">{message.sender?.username}</span>
            {isBot && <span className="badge-bot">BOT</span>}
            {message.sender?.isGuest && <span className="badge-guest-pill">GUEST</span>}
          </div>
        )}

        {/* Replying-to Preview */}
        {message.replyTo && (
          <div className="message-reply-quote">
            <span className="reply-sender">@{message.replyTo.senderUsername}:</span>
            <span className="reply-snippet">{message.replyTo.text}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div className="message-bubble">
          {/* Media preview */}
          {message.mediaUrl && (
            <div className="message-media-wrap">
              <img
                src={message.mediaUrl}
                alt="Attachment"
                className="message-media-img"
                onClick={() => onOpenImage && onOpenImage(message.mediaUrl)}
                loading="lazy"
              />
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <div className="message-text-content">
              {message.text.split('\n').map((line, idx) => (
                <p key={idx} className="message-line">
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Meta Info (Timestamp + Status) */}
          <div className="message-meta-row">
            <span className="message-timestamp">{formattedTime}</span>
            {isMine && <span className="message-status-ticks">✓✓</span>}
          </div>

          {/* Quick Action Floating Bar on Hover */}
          <div className="message-hover-actions">
            <button
              className="action-pill-btn"
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              title="Add Reaction"
            >
              😊
            </button>
            <button
              className="action-pill-btn"
              onClick={() => setReplyingTo(message)}
              title="Reply to message"
            >
              ↩
            </button>
          </div>

          {/* Reaction Picker Popup */}
          {showReactionPicker && (
            <div className="reaction-picker-tray">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="quick-emoji-btn"
                  onClick={() => handleReactionClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Displayed Reactions List */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="message-reactions-row">
            {message.reactions.map((reaction, idx) => {
              const hasReacted = user && reaction.users?.includes(user.username);
              return (
                <button
                  key={idx}
                  className={`reaction-tag ${hasReacted ? 'active' : ''}`}
                  onClick={() => handleReactionClick(reaction.emoji)}
                  title={`Reacted by: ${reaction.users?.join(', ')}`}
                >
                  <span className="reaction-emoji">{reaction.emoji}</span>
                  <span className="reaction-count">{reaction.users?.length || 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
