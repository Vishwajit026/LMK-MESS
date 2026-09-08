import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { chatApi } from '../services/api';

const ICONS = ['💬', '💻', '🎮', '🎧', '🚀', '🎨', '⚡', '🍿'];

export const CreateRoomModal = ({ visible, onClose, onRoomCreated, user }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [icon, setIcon] = useState('💬');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await chatApi.createRoom({
        name: name.trim(),
        topic: topic.trim() || 'General Chat',
        icon,
        createdBy: user?.username || 'User'
      });
      if (res.data.success) {
        setName('');
        setTopic('');
        onRoomCreated(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Room</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={styles.label}>Room Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. mobile-devs, gaming"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Choose Icon</Text>
          <View style={styles.iconRow}>
            {ICONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[styles.iconBtn, icon === emoji && styles.iconBtnSelected]}
                onPress={() => setIcon(emoji)}
              >
                <Text style={styles.iconText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Topic / Description</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. React Native & Android Discussions"
            placeholderTextColor="#6b7280"
            value={topic}
            onChangeText={setTopic}
          />

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={loading}>
            <Text style={styles.createBtnText}>
              {loading ? 'Creating...' : '🚀 Create Channel'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff'
  },
  closeText: {
    fontSize: 18,
    color: '#9ca3af'
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 8,
    fontSize: 13
  },
  label: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1f2937'
  },
  iconBtnSelected: {
    backgroundColor: '#6366f1'
  },
  iconText: {
    fontSize: 20
  },
  createBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20
  },
  createBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15
  }
});
