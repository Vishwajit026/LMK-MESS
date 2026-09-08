import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const ROOM_ICONS = ['💬', '💻', '🎮', '🎧', '🚀', '🎨', '⚡', '🍿', '💡', '🤖', '⚽', '🍕', '🔥', '📚', '🌍', '🎵'];

export const CreateRoomModal = ({ isOpen, onClose }) => {
  const { createRoom } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [icon, setIcon] = useState('💬');
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const slugPreview = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }

    if (isProtected && !password.trim()) {
      setError('Please provide a passcode for the protected room');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createRoom({
      name: name.trim(),
      description: description.trim(),
      topic: topic.trim() || 'General Chat',
      icon,
      isProtected,
      password: isProtected ? password.trim() : null
    });

    setIsSubmitting(false);

    if (result.success) {
      setName('');
      setDescription('');
      setTopic('');
      setIcon('💬');
      setIsProtected(false);
      setPassword('');
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">➕</span>
            <div>
              <h2 className="modal-title">Create Chat Room</h2>
              <p className="modal-subtitle">Start a new public or passcode-protected channel</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Room Name */}
          <div className="form-group">
            <label className="form-label">Room Name *</label>
            <div className="input-with-prefix">
              <span className="input-prefix">#</span>
              <input
                type="text"
                placeholder="e.g. secret-squad, ai-lounge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
                className="form-input"
              />
            </div>
            {name && <span className="slug-preview">Channel slug: #{slugPreview}</span>}
          </div>

          {/* Icon Selector */}
          <div className="form-group">
            <label className="form-label">Choose Room Icon</label>
            <div className="icon-selector-grid">
              {ROOM_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  className={`icon-choice-btn ${icon === emoji ? 'selected' : ''}`}
                  onClick={() => setIcon(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div className="form-group">
            <label className="form-label">Topic / Headline</label>
            <input
              type="text"
              placeholder="e.g. Chat about latest tech, gaming, or private ideas"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={60}
              className="form-input"
            />
          </div>

          {/* Password Protection Toggle */}
          <div className="form-group">
            <div className="checkbox-toggle-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                />
                <span>🔒 Protect Room with Passcode / Password</span>
              </label>
            </div>

            {isProtected && (
              <div className="password-input-reveal">
                <input
                  type="password"
                  placeholder="Set room password (e.g. 1234 or secret123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                />
                <span className="slug-preview">
                  Friends will need to enter this password to join the room.
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              placeholder="What is this channel about? Set ground rules or share info."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={150}
              className="form-textarea"
            />
          </div>

          {/* Modal Actions */}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : '🚀 Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
