import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow&backgroundColor=6366f1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=ec4899',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Matrix&backgroundColor=10b981',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Quantum&backgroundColor=8b5cf6',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Vortex&backgroundColor=f59e0b',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aura&backgroundColor=06b6d4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=ef4444',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Titan&backgroundColor=3b82f6'
];

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, guestJoin, loading, authError, setAuthError } = useAuth();
  const [tab, setTab] = useState('guest'); // 'guest' | 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  if (!isOpen) return null;

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const finalName = username.trim() || `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const result = await guestJoin(finalName, selectedAvatar);
    if (result?.success) {
      onClose();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim() || !password) return;
    const result = await login(username.trim(), password);
    if (result?.success) {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!username.trim() || !password) return;
    const result = await register(username.trim(), password, selectedAvatar, bio.trim());
    if (result?.success) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card auth-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">⚡</span>
            <div>
              <h2 className="modal-title">Join LMK MESS</h2>
              <p className="modal-subtitle">Real-time chat, rooms, and live discussions</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="auth-tab-switch">
          <button
            className={`auth-tab-btn ${tab === 'guest' ? 'active' : ''}`}
            onClick={() => {
              setTab('guest');
              setAuthError(null);
            }}
          >
            ⚡ 1-Click Guest
          </button>
          <button
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setAuthError(null);
            }}
          >
            🔑 Login
          </button>
          <button
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setAuthError(null);
            }}
          >
            ✨ Sign Up
          </button>
        </div>

        {authError && <div className="form-error-banner">{authError}</div>}

        {/* 1-Click Guest Mode Form */}
        {tab === 'guest' && (
          <form onSubmit={handleGuestSubmit} className="modal-form">
            <p className="guest-info-hint">
              🚀 Quick start! No password needed. Pick an avatar and jump straight into chatting.
            </p>

            {/* Avatar Picker */}
            <div className="form-group">
              <label className="form-label">Pick Your Avatar</label>
              <div className="avatar-picker-grid">
                {PRESET_AVATARS.map((avatarUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`avatar-choice-btn ${selectedAvatar === avatarUrl ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatarUrl)}
                  >
                    <img src={avatarUrl} alt={`Avatar ${idx}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Username */}
            <div className="form-group">
              <label className="form-label">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Alex, CyberNinja (or leave blank for random)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={25}
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? 'Joining...' : '⚡ Enter Chat as Guest'}
              </button>
            </div>
          </form>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? 'Logging in...' : '🔑 Login to Account'}
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="modal-form">
            {/* Avatar Picker */}
            <div className="form-group">
              <label className="form-label">Select Avatar</label>
              <div className="avatar-picker-grid">
                {PRESET_AVATARS.map((avatarUrl, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`avatar-choice-btn ${selectedAvatar === avatarUrl ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avatarUrl)}
                  >
                    <img src={avatarUrl} alt={`Avatar ${idx}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Choose Username *</label>
              <input
                type="text"
                placeholder="e.g. cyber_samurai"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={25}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Create Password *</label>
              <input
                type="password"
                placeholder="At least 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status Bio (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Building cool apps on LMK MESS 🚀"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={100}
                className="form-input"
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                {loading ? 'Creating Account...' : '✨ Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
