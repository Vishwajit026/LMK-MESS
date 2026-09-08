import React, { useState, useEffect } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getSocket } from '../services/socket';

export const OnlineUsersModal = ({ visible, onClose, currentRoom }) => {
  const [roomUsers, setRoomUsers] = useState([]);

  useEffect(() => {
    if (!visible) return;
    const socket = getSocket();

    const handleRoomUsers = (users) => {
      setRoomUsers(users || []);
    };

    socket.on('roomOnlineUsers', handleRoomUsers);
    return () => {
      socket.off('roomOnlineUsers', handleRoomUsers);
    };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Online Members</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={roomUsers}
            keyExtractor={(item, index) => item.socketId || String(index)}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <Image
                  source={{
                    uri:
                      item.avatar ||
                      `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(item.username)}`
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.username}</Text>
                  <Text style={styles.userStatus}>🟢 Active Now</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No other members currently in this room</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%'
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f9fafb'
  },
  userStatus: {
    fontSize: 12,
    color: '#10b981'
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 20
  }
});
