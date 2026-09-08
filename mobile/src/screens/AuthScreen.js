import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { authApi } from '../services/api';
import { connectSocket } from '../services/socket';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/png?seed=Shadow&backgroundColor=6366f1',
  'https://api.dicebear.com/7.x/bottts/png?seed=Cyber&backgroundColor=ec4899',
  'https://api.dicebear.com/7.x/bottts/png?seed=Matrix&backgroundColor=10b981',
  'https://api.dicebear.com/7.x/bottts/png?seed=Quantum&backgroundColor=8b5cf6'
];

export const AuthScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGuestSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalName = username.trim() || `MobileUser_${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await authApi.guestLogin({ username: finalName, avatar: selectedAvatar });
      if (res.data.success) {
        connectSocket(res.data.data);
        onLoginSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async () => {
    if (!username.trim() || !password) {
      setError('Please fill in both username and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ username: username.trim(), password });
      if (res.data.success) {
        connectSocket(res.data.data);
        onLoginSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>LMK MESS</Text>
          <Text style={styles.brandSubtitle}>Real-Time Mobile Messenger</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, isGuest && styles.tabBtnActive]}
            onPress={() => setIsGuest(true)}
          >
            <Text style={[styles.tabText, isGuest && styles.tabTextActive]}>⚡ 1-Click Guest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, !isGuest && styles.tabBtnActive]}
            onPress={() => setIsGuest(false)}
          >
            <Text style={[styles.tabText, !isGuest && styles.tabTextActive]}>🔑 Login</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorBanner}>{error}</Text>}

        {/* Avatar Picker (Guest) */}
        {isGuest && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Avatar</Text>
            <View style={styles.avatarGrid}>
              {PRESET_AVATARS.map((url, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.avatarChoice, selectedAvatar === url && styles.avatarSelected]}
                  onPress={() => setSelectedAvatar(url)}
                >
                  <Image source={{ uri: url }} style={styles.avatarImg} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Username Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>{isGuest ? 'Username (Optional)' : 'Username'}</Text>
          <TextInput
            style={styles.input}
            placeholder={isGuest ? 'e.g. AndroidNinja' : 'Enter username'}
            placeholderTextColor="#6b7280"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Password Input (Account Mode) */}
        {!isGuest && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#6b7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        )}

        {/* Submit Action */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={isGuest ? handleGuestSubmit : handleAccountSubmit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Connecting...' : isGuest ? '⚡ Start Chatting Now' : '🔑 Log In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  logoEmoji: {
    fontSize: 32
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f9fafb',
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: '#6366f1'
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: '700',
    fontSize: 13
  },
  tabTextActive: {
    color: '#ffffff'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderWidth: 1,
    borderRadius: 12,
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15
  },
  avatarGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginVertical: 6
  },
  avatarChoice: {
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 4
  },
  avatarSelected: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)'
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 12
  },
  submitBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#f87171',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13
  }
});
