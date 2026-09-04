import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { Close as CloseIcon, FlashOn as FlashIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { name: 'Aarav Sharma', email: 'aarav@taskplanet.app', role: 'Designer' },
  { name: 'Priya Patel', email: 'priya@taskplanet.app', role: 'Developer' },
  { name: 'Rohan Verma', email: 'rohan@taskplanet.app', role: 'Creator' }
];

const AuthModal = () => {
  const { authModalOpen, authModalTab, closeAuthModal, setAuthModalTab, login, signup } = useAuth();
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (event, newValue) => {
    setAuthModalTab(newValue);
    setErrorMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMessage('Please fill in both email/username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login({ identifier: loginIdentifier, password: loginPassword });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await signup({ name, username, email, password });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setLoginIdentifier(demoEmail);
    setLoginPassword('Password123!');
    setLoading(true);
    setErrorMessage('');

    const res = await login({ identifier: demoEmail, password: 'Password123!' });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <Dialog
      open={authModalOpen}
      onClose={closeAuthModal}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2.5,
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}
          >
            🪐
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '18px' }}>
            Mini-Social
          </Typography>
        </Box>
        <IconButton size="small" onClick={closeAuthModal} sx={{ color: 'var(--text-muted)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={authModalTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: '1px solid var(--border-light)',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '14px' }
        }}
      >
        <Tab label="Sign In" value="login" />
        <Tab label="Create Account" value="signup" />
      </Tabs>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', fontSize: '13px' }}>
            {errorMessage}
          </Alert>
        )}

        {authModalTab === 'login' ? (
          /* Sign In Form */
          <form onSubmit={handleLoginSubmit}>
            <TextField
              fullWidth
              label="Email or Username"
              variant="outlined"
              size="small"
              margin="dense"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
              placeholder="e.g. aarav@taskplanet.app or aarav_sharma"
              sx={{ mb: 1.5 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              size="small"
              margin="dense"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.2,
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '14px',
                background: 'var(--primary-gradient)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                '&:hover': { background: '#1d4ed8' }
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In to Mini-Social'}
            </Button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignupSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              size="small"
              margin="dense"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              sx={{ mb: 1.2 }}
            />
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              size="small"
              margin="dense"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              sx={{ mb: 1.2 }}
            />
            <TextField
              fullWidth
              type="email"
              label="Email Address"
              variant="outlined"
              size="small"
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              sx={{ mb: 1.2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Password"
              variant="outlined"
              size="small"
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.2,
                borderRadius: '999px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '14px',
                background: 'var(--primary-gradient)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                '&:hover': { background: '#1d4ed8' }
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Account'}
            </Button>
          </form>
        )}

        {/* 1-Click Demo Accounts */}
        <Box sx={{ mt: 2.5 }}>
          <Divider sx={{ my: 1.5, borderColor: 'var(--border-light)' }}>
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              QUICK TEST DEMO ACCOUNTS
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {demoAccounts.map((account, idx) => (
              <Button
                key={idx}
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<FlashIcon sx={{ color: '#f59e0b' }} />}
                onClick={() => handleQuickDemoLogin(account.email)}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  borderRadius: '10px',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  py: 0.6,
                  px: 1.5,
                  fontSize: '12.5px',
                  '&:hover': {
                    borderColor: 'var(--primary-500)',
                    backgroundColor: 'var(--primary-50)'
                  }
                }}
              >
                <span>Login as <strong>{account.name}</strong></span>
              </Button>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
