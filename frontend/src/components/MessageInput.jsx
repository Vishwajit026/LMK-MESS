import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const EMOJI_CATEGORIES = {
  Popular: ['👍', '❤️', '🔥', '😂', '🚀', '🎉', '✨', '👏', '👀', '💯'],
  Smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😎', '🥳', '🤯', '🤠'],
  Gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  Objects: ['💡', '⭐', '🌟', '⚡', '💥', '🔥', '💻', '📱', '🎮', '🎧', '🚀', '🛸', '🎯', '🏆', '💎', '🎨', '🎬', '☕', '🍕', '🍻']
};

export const MessageInput = ({ onOpenAuth }) => {
  const { user } = useAuth();
  const {
    sendMessage,
    sendTyping,
    replyingTo,
    setReplyingTo,
    activeRoom
  } = useChat();

  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Popular');
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  // Focus textarea on room switch or reply
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeRoom?.slug, replyingTo]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Typing debounce
    if (user) {
      sendTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if ((!text || !text.trim()) && !mediaUrl) return;

    setIsSending(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      sendTyping(false);
    }

    await sendMessage({
      text: text.trim(),
      mediaUrl,
      mediaType: mediaUrl ? 'image' : 'none'
    });

    setText('');
    setMediaUrl(null);
    setShowEmojiPicker(false);
    setIsSending(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const canSend = (text.trim().length > 0 || mediaUrl) && !isSending;

  return (
    <div className="message-input-container">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="replying-banner">
          <div className="replying-content">
            <span className="reply-indicator-icon">↩ Replying to</span>
            <span className="reply-target-name">@{replyingTo.sender?.username}:</span>
            <span className="reply-target-text">
              {replyingTo.text ? replyingTo.text.substring(0, 80) : 'Attachment'}
            </span>
          </div>
          <button className="reply-close-btn" onClick={() => setReplyingTo(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Media Attachment Preview */}
      {mediaUrl && (
        <div className="media-preview-tray">
          <div className="media-preview-card">
            <img src={mediaUrl} alt="Attached Preview" className="preview-thumb" />
            <button className="remove-media-btn" onClick={() => setMediaUrl(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker Tray Modal */}
      {showEmojiPicker && (
        <div className="emoji-picker-dropdown">
          <div className="emoji-category-tabs">
            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`emoji-tab ${activeEmojiCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveEmojiCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, idx) => (
              <button
                key={idx}
                className="emoji-item-btn"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Control Bar */}
      <div className="message-input-bar">
        {/* Emoji Button */}
        <button
          type="button"
          className={`input-action-btn ${showEmojiPicker ? 'active' : ''}`}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Insert Emoji"
        >
          😊
        </button>

        {/* Attachment Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="input-action-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach Image / Screenshot"
        >
          📎
        </button>

        {/* Auto-growing Text Input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={
            user
              ? `Message #${activeRoom?.name || 'chat'}... (Enter to send, Shift+Enter for newline)`
              : 'Join or login to send messages...'
          }
          className="message-textarea"
          rows={1}
          disabled={isSending}
        />

        {/* Send Button */}
        <button
          type="button"
          className={`btn-send ${canSend ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          title="Send message"
        >
          <svg
            className="send-icon"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};
