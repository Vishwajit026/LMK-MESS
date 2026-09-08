import React, { useState } from 'react';
import { chatApi } from '../services/api';
import { useChat } from '../context/ChatContext';

export const JoinWithCodeModal = ({ isOpen, onClose }) => {
  const { switchRoom, rooms } = useChat();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [targetRoom, setTargetRoom] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Try finding in current rooms first (by slug or inviteCode)
      let matched = rooms.find(
        (r) =>
          r.inviteCode?.toUpperCase() === cleanCode.toUpperCase() ||
          r.slug.toLowerCase() === cleanCode.toLowerCase() ||
          r.name.toLowerCase() === cleanCode.toLowerCase()
      );

      // 2. If not found in memory, query API by inviteCode
      if (!matched) {
        const res = await chatApi.getRoomByCode(cleanCode).catch(() => null);
        if (res?.data?.success) {
          matched = res.data.data;
        } else {
          // Try by slug
          const slugRes = await chatApi.getRoomBySlug(cleanCode).catch(() => null);
          if (slugRes?.data?.success) {
            matched = slugRes.data.data;
          }
        }
      }

      if (!matched) {
        setError('Room not found. Check the code or room name and try again.');
        setLoading(false);
        return;
      }

      // Check if password protected
      if (matched.isProtected) {
        setTargetRoom(matched);
        setNeedsPassword(true);
        setLoading(false);
        return;
      }

      // Public room -> Join immediately
      switchRoom(matched.slug);
      handleReset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || !targetRoom) return;

    setLoading(true);
    setError(null);

    try {
      const res = await chatApi.verifyPassword(targetRoom.slug, password.trim());
      if (res.data.success && res.data.authorized) {
        switchRoom(targetRoom.slug);
        handleReset();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password / passcode.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setPassword('');
    setNeedsPassword(false);
    setTargetRoom(null);
    setError(null);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleModalClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">{needsPassword ? '🔒' : '🔑'}</span>
            <div>
              <h2 className="modal-title">
                {needsPassword ? `Unlock #${targetRoom?.name}` : 'Join Room with Code'}
              </h2>
              <p className="modal-subtitle">
                {needsPassword
                  ? 'This room requires a passcode to enter'
                  : 'Enter the 6-character invite code or channel name'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleModalClose}>
            ✕
          </button>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        {!needsPassword ? (
          <form onSubmit={handleLookup} className="modal-form">
            <div className="form-group">
              <label className="form-label">Invite Code or Room Name *</label>
              <input
                type="text"
                placeholder="e.g. X9K2A1 or tech-talk"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoFocus
                required
                maxLength={30}
                className="form-input"
                style={{ fontSize: '1.1rem', letterSpacing: '1px', fontWeight: '700' }}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={handleModalClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !code.trim()}>
                {loading ? 'Searching...' : '🚀 Find & Join'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="modal-form">
            <div className="protected-alert-banner">
              🔒 <strong>#{targetRoom?.name}</strong> is password protected.
            </div>

            <div className="form-group">
              <label className="form-label">Enter Room Passcode *</label>
              <input
                type="password"
                placeholder="Enter passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setNeedsPassword(false)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !password.trim()}
              >
                {loading ? 'Verifying...' : '🔓 Unlock & Enter Room'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
