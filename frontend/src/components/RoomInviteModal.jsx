import React, { useState } from 'react';

export const RoomInviteModal = ({ isOpen, onClose, room }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !room) return null;

  const currentOrigin = window.location.origin;
  const inviteLink = `${currentOrigin}/?room=${room.slug}`;
  const inviteCode = room.inviteCode || room.slug.toUpperCase();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">🔗</span>
            <div>
              <h2 className="modal-title">Invite to #{room.name}</h2>
              <p className="modal-subtitle">Share this channel with your friends</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-form">
          {/* 6-Character Short Invite Code */}
          <div className="form-group">
            <label className="form-label">Room Invite Code</label>
            <div className="invite-code-card">
              <span className="invite-code-text">{inviteCode}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyCode}
              >
                {copiedCode ? '✅ Copied' : '📋 Copy Code'}
              </button>
            </div>
            <span className="slug-preview">Friends can enter this code to join instantly</span>
          </div>

          {/* Direct Shareable Link */}
          <div className="form-group">
            <label className="form-label">Direct Invite Link</label>
            <div className="input-with-prefix">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="form-input"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '0 8px 8px 0', padding: '10px 16px' }}
                onClick={handleCopyLink}
              >
                {copiedLink ? '✅ Copied!' : '🔗 Copy Link'}
              </button>
            </div>
            <span className="slug-preview">Anyone with this link will open directly into this room</span>
          </div>

          {/* Protected info */}
          {room.isProtected && (
            <div className="protected-alert-banner">
              🔒 <strong>Password Protected Room</strong>: Make sure to share the passcode privately with your friend.
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary full-width" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
