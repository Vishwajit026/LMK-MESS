import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { chatApi } from '../services/api';
import { getSocket } from '../services/socket';

export const ChatListScreen = ({ user, onSelectRoom, onOpenCreateRoom, onLogout }) => {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await chatApi.getRooms();
      if (res.data.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.log('Error fetching rooms:', err);
    }
  };

  useEffect(() => {
    fetchRooms();

    const socket = getSocket();
    const handleRoomActivity = ({ slug, lastMessage }) => {
      setRooms((prev) =>
        prev.map((r) => (r.slug === slug ? { ...r, lastMessage } : r))
      );
    };

    socket.on('roomActivity', handleRoomActivity);
    return () => {
      socket.off('roomActivity', handleRoomActivity);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <Text style={styles.logoIcon}>⚡</Text>
          <View>
            <Text style={styles.appTitle}>LMK MESS</Text>
            <Text style={styles.usernameText}>@{user?.username}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms or chats..."
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item._id || item.slug}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomCard} onPress={() => onSelectRoom(item)}>
            <View style={styles.roomIconWrapper}>
              <Text style={styles.roomIconText}>{item.icon || '💬'}</Text>
            </View>

            <View style={styles.roomInfo}>
              <View style={styles.roomHeaderRow}>
                <Text style={styles.roomName}>#{item.name}</Text>
                {item.lastMessage?.timestamp && (
                  <Text style={styles.roomTime}>
                    {new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                )}
              </View>
              <Text style={styles.roomSnippet} numberOfLines={1}>
                {item.lastMessage?.text || item.description || 'Tap to join chat...'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button (Create Room) */}
      <TouchableOpacity style={styles.fab} onPress={onOpenCreateRoom}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)'
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  logoIcon: {
    fontSize: 24
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff'
  },
  usernameText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600'
  },
  logoutBtn: {
    padding: 8
  },
  logoutText: {
    fontSize: 18
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  searchInput: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 12,
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)'
  },
  roomIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  roomIconText: {
    fontSize: 20
  },
  roomInfo: {
    flex: 1
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  roomName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f9fafb'
  },
  roomTime: {
    fontSize: 11,
    color: '#6b7280'
  },
  roomSnippet: {
    fontSize: 13,
    color: '#9ca3af'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  fabText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: -2
  }
});
